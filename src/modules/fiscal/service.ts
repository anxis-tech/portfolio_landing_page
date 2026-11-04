import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { FiscalError, safeFiscalError } from './errors'
import { FiscalContoraProvider } from './contora-provider'
import { fiscalProviderReference } from './reference'
import { clientFromProject, manualClientFromProject, validateClient, validateIssuer, validateService } from './validation'
import type { FiscalEnvironment, FiscalInvoice, FiscalIssueInput, FiscalProvider, FiscalProviderInvoice, ValidatedManualFiscalInvoiceInput } from './types'

export const FISCAL_DOCUMENT_BUCKET = 'fiscal-invoices'
export function fiscalCredentialsConfigured() {
  // Fiscal Contora transmission is deliberately unavailable until A1 and tax
  // parameters have a reviewed server-only integration.
  return false
}
export function createFiscalProvider(environment: FiscalEnvironment = 'homologation'): FiscalProvider {
  if (environment !== 'homologation') {
    throw new FiscalError('PRODUCTION_DISABLED', 'O ambiente fiscal do servidor permanece bloqueado até liberação manual.')
  }
  return new FiscalContoraProvider()
}
type ProviderFactory = (environment: FiscalEnvironment) => FiscalProvider

/** Persist a manual request through the authenticated RPC; no provider HTTP occurs here. */
export async function createManualFiscalInvoice(db: SupabaseClient, input: ValidatedManualFiscalInvoiceInput): Promise<string> {
  const provider = createFiscalProvider()
  if (provider.getConfigurationState?.() !== 'configuration_required') {
    throw new FiscalError('PROVIDER_STATE_INVALID', 'A situação da integração fiscal precisa ser revisada antes de solicitar a nota.')
  }
  if (input.clientMode === 'project' && input.projectId && input.clientProjectId !== input.projectId) {
    throw new FiscalError('CLIENT_PROJECT_MISMATCH', 'O cliente existente precisa pertencer ao projeto relacionado à nota.')
  }
  let client = input.client
  if (input.clientMode === 'project') {
    const existing = await db.from('client_projects').select('id,client_name,email,client_contact_json').eq('id', input.clientProjectId!).single()
    if (existing.error || !existing.data) throw new FiscalError('CLIENT_NOT_FOUND', 'Cliente existente indisponível ou sem acesso.')
    client = manualClientFromProject(existing.data)
  }
  if (!client) throw new FiscalError('CLIENT_INVALID', 'Informe um tomador válido para a nota fiscal.')
  if (input.projectId) {
    const project = await db.from('client_projects').select('id').eq('id', input.projectId).single()
    if (project.error || !project.data) throw new FiscalError('PROJECT_NOT_FOUND', 'Projeto relacionado indisponível ou sem acesso.')
  }
  if (input.contractId) {
    const contract = await db.from('contracts').select('id,project_id').eq('id', input.contractId).single()
    if (contract.error || !contract.data || contract.data.project_id !== input.projectId) {
      throw new FiscalError('CONTRACT_INVALID', 'O contrato precisa pertencer ao projeto relacionado e estar acessível.')
    }
  }
  const result = await db.rpc('create_manual_fiscal_invoice', {
    p_idempotency_key: input.idempotencyKey, p_amount: input.amountCents,
    p_competence_date: input.competenceDate, p_service_description: input.serviceDescription,
    p_client_snapshot: client, p_project_id: input.projectId || null, p_contract_id: input.contractId || null,
  })
  if (result.error?.code === 'P0001' && result.error.message === 'Chave de solicitação já utilizada com dados diferentes.') {
    throw new FiscalError('IDEMPOTENCY_CONFLICT', 'Esta solicitação já foi usada com dados diferentes. Inicie uma nova emissão para alterar os dados.')
  }
  if (result.error || typeof result.data !== 'string') {
    throw new FiscalError('MANUAL_INVOICE_CREATE_FAILED', 'Não foi possível registrar a solicitação fiscal. Confira os dados e tente novamente com a mesma solicitação.')
  }
  return result.data
}

function snapshotEnvironment(snapshot: Record<string, unknown>): FiscalEnvironment {
  if (snapshot.environment !== 'homologation') throw new FiscalError('PRODUCTION_DISABLED', 'O ambiente fiscal deste documento não está liberado para emissão.')
  return 'homologation'
}
function issuerData(snapshot: Record<string, unknown>) {
  const issuer = Object.fromEntries(Object.entries(snapshot).filter(([key]) => key !== 'environment'))
  return validateIssuer(issuer)
}
async function storeDocuments(db: SupabaseClient, invoice: FiscalInvoice, provider: FiscalProvider, providerId: string) {
  const folder = invoice.project_id || 'manual'
  const pdfPath = invoice.pdf_path || `${folder}/${invoice.id}/invoice.pdf`
  const xmlPath = invoice.xml_path || `${folder}/${invoice.id}/invoice.xml`
  for (const kind of ['pdf', 'xml'] as const) {
    if (kind === 'pdf' ? invoice.pdf_path : invoice.xml_path) continue
    const bytes = kind === 'pdf' ? await provider.getPdf(providerId) : await provider.getXml(providerId)
    const prefix = new TextDecoder().decode(bytes.slice(0, 128)).trimStart()
    if (!bytes.length || bytes.length > 10 * 1024 * 1024 || (kind === 'pdf' ? !prefix.startsWith('%PDF-') : !prefix.startsWith('<'))) {
      throw new FiscalError('DOCUMENT_INVALID', 'O provedor retornou um arquivo fiscal inválido.', true)
    }
    const { error } = await db.storage.from(FISCAL_DOCUMENT_BUCKET).upload(kind === 'pdf' ? pdfPath : xmlPath, bytes,
      { upsert: true, contentType: kind === 'pdf' ? 'application/pdf' : 'application/xml', cacheControl: '0' })
    if (error) throw new FiscalError('DOCUMENT_STORAGE_FAILED', 'Não foi possível guardar os documentos fiscais privados.', true)
  }
  return { pdf_path: pdfPath, xml_path: xmlPath }
}

async function processInvoice(db: SupabaseClient, invoice: FiscalInvoice, factory: ProviderFactory) {
  let providerInvoice: FiscalProviderInvoice | null = null
  let uncertain = invoice.submission_uncertain
  let enteredSubmission = false
  const changes: Record<string, unknown> = {}
  try {
    if (!invoice.lease_token) throw new FiscalError('LEASE_INVALID', 'A nota fiscal não possui uma reserva válida.', true)
    if (invoice.provider !== 'fiscal_contora' || invoice.source === 'manual') {
      throw new FiscalError('PROVIDER_CONFIGURATION_REQUIRED', 'Esta nota aguarda a configuração e conciliação da Fiscal Contora antes de qualquer transmissão.')
    }
    if (invoice.provider_reference !== fiscalProviderReference(invoice.internal_reference)) throw new FiscalError('REFERENCE_INVALID', 'A referência fiscal do projeto não corresponde ao documento reservado.')
    if (invoice.amount === null || !Number.isSafeInteger(invoice.amount) || invoice.amount <= 0 || !invoice.contract_id) {
      throw new FiscalError('SIGNED_CONTRACT_MISSING', 'Revise o contrato assinado e o valor total antes de emitir a nota fiscal.')
    }
    let input: FiscalIssueInput
    let environment: FiscalEnvironment
    if (invoice.submission_started_at || invoice.submission_uncertain || invoice.provider_invoice_id) {
      // Once submission starts, mutable company/project records can never change its identity.
      environment = snapshotEnvironment(invoice.issuer_snapshot)
      input = { reference: invoice.provider_reference, amountCents: invoice.amount, competence: invoice.competence_date,
        issuer: issuerData(invoice.issuer_snapshot), client: validateClient(invoice.client_snapshot), service: validateService(invoice.service_snapshot) }
    } else {
      const [settingsResult, projectResult] = await Promise.all([
        db.from('fiscal_company_settings').select('*').eq('id', true).single(),
        db.from('client_projects').select('client_contact_json,client_name,email,phone').eq('id', invoice.project_id).single(),
      ])
      if (settingsResult.error || !settingsResult.data) throw new FiscalError('SETTINGS_MISSING', 'Complete a configuração da empresa e do serviço fiscal.')
      if (!settingsResult.data.is_enabled) throw new FiscalError('FISCAL_DISABLED', 'A emissão fiscal está desativada. Ative após conferir os dados obrigatórios.')
      environment = snapshotEnvironment(settingsResult.data)
      if (projectResult.error || !projectResult.data) throw new FiscalError('PROJECT_MISSING', 'Não foi possível carregar os dados fiscais do cliente do projeto.')
      input = { reference: invoice.provider_reference, amountCents: invoice.amount, competence: invoice.competence_date,
        issuer: validateIssuer(settingsResult.data.issuer), service: validateService(settingsResult.data.service), client: clientFromProject(projectResult.data) }
    }
    // The Contora adapter remains the only route to a provider. In this phase it
    // fails closed before any submission; no legacy Nuvem API is called.
    const provider = factory(environment)
    providerInvoice = invoice.provider_invoice_id ? await provider.getInvoice(invoice.provider_invoice_id)
      : await provider.findInvoice(invoice.provider_reference, input.issuer.cpf_cnpj)
    if (providerInvoice && !invoice.submission_started_at && !invoice.provider_invoice_id && !invoice.submission_uncertain) {
      // A reconciled external document still needs immutable, normalized snapshots for future GET/cache retries.
      const snapshot = await db.rpc('mark_fiscal_invoice_submission', {
        p_invoice_id: invoice.id, p_lease_token: invoice.lease_token,
        p_issuer_snapshot: { ...input.issuer, environment }, p_client_snapshot: input.client, p_service_snapshot: input.service,
      })
      if (snapshot.error) throw new FiscalError('LEASE_INVALID', 'A reserva fiscal expirou durante a reconciliação.', true)
    }
    if (!providerInvoice) {
      if (uncertain) throw new FiscalError('SUBMISSION_RECONCILIATION_REQUIRED', 'A emissão anterior ainda não foi localizada. Consulte o provedor antes de solicitar outra emissão.', true, true)
      await provider.validateIssuerConfiguration?.(input)
      const mark = await db.rpc('mark_fiscal_invoice_submission', {
        p_invoice_id: invoice.id, p_lease_token: invoice.lease_token,
        p_issuer_snapshot: { ...input.issuer, environment }, p_client_snapshot: input.client, p_service_snapshot: input.service,
      })
      if (mark.error) throw new FiscalError('LEASE_INVALID', 'A reserva fiscal expirou ou foi substituída; a emissão não foi iniciada.', true)
      enteredSubmission = true
      uncertain = true
      providerInvoice = await provider.issueInvoice(input)
    }
    if (providerInvoice.reference !== invoice.provider_reference) throw new FiscalError('REFERENCE_MISMATCH', 'O documento retornado pelo provedor possui uma referência diferente.', true, true)
    changes.provider_invoice_id = providerInvoice.id
    changes.invoice_number = providerInvoice.number
    changes.verification_code = providerInvoice.verificationCode
    uncertain = false
    if (providerInvoice.status === 'authorized') {
      changes.issued_at = providerInvoice.issuedAt || invoice.issued_at || new Date().toISOString()
      try { Object.assign(changes, await storeDocuments(db, invoice, provider, providerInvoice.id), { status: 'authorized' }) }
      catch { throw new FiscalError('DOCUMENTS_PENDING', 'A nota foi autorizada; os arquivos PDF/XML ainda precisam ser recuperados. Reprocesse para recuperar os documentos sem emitir outra nota.', true) }
    } else if (providerInvoice.status === 'cancelled') {
      changes.status = 'cancelled'
      changes.cancelled_at = new Date().toISOString()
    } else if (providerInvoice.status === 'rejected' || providerInvoice.status === 'error') {
      changes.status = providerInvoice.status
      changes.error_code = 'PROVIDER_REJECTED'
      changes.error_message = 'O provedor não autorizou a nota. Confira os dados no painel fiscal antes de reprocessar.'
    } else {
      // A pending row is picked up at most max_attempts times; provider ID prevents re-emission.
      changes.status = 'pending'
    }
  } catch (error) {
    const safe = safeFiscalError(error)
    if (enteredSubmission && !providerInvoice) uncertain = error instanceof FiscalError ? error.ambiguousSubmission : true
    changes.status = safe.retryable ? 'error' : 'blocked'
    changes.error_code = safe.code
    changes.error_message = safe.message
  }
  changes.submission_uncertain = uncertain
  const result = await db.rpc('finish_fiscal_invoice', { p_invoice_id: invoice.id, p_lease_token: invoice.lease_token, p_changes: changes })
  if (result.error) throw new FiscalError('LEASE_FINISH_FAILED', 'Não foi possível concluir a reserva fiscal; o próximo worker fará a reconciliação.', true)
  return changes.status === 'authorized' ? 'authorized' : changes.status === 'pending' ? 'pending' : 'failed'
}

/** Caller must supply a server-only service-role client. No network calls run during rendering. */
export async function processFiscalBatch(db: SupabaseClient, limit = 5, factory: ProviderFactory = createFiscalProvider) {
  const { data, error } = await db.rpc('claim_fiscal_invoices', { p_worker: randomUUID(), p_limit: Number.isFinite(limit) ? Math.max(0, Math.min(10, Math.floor(limit))) : 5 })
  if (error || !Array.isArray(data)) throw new FiscalError('FISCAL_CLAIM_FAILED', 'Não foi possível reservar as notas fiscais pendentes.', true)
  const counts = { claimed: data.length, authorized: 0, pending: 0, failed: 0 }
  for (const invoice of data as FiscalInvoice[]) {
    try { counts[await processInvoice(db, invoice, factory)]++ } catch { counts.failed++ }
  }
  return counts
}
