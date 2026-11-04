import { FiscalError } from './errors'
import type { FiscalEnvironment, FiscalIssueInput, FiscalProvider, FiscalProviderInvoice, FiscalInvoiceStatus } from './types'
import { validateIssuer, validateClient, validateService } from './validation'
export { fiscalProviderReference } from './reference'

const SANDBOX_URL = 'https://api.sandbox.nuvemfiscal.com.br'
const TOKEN_URL = 'https://auth.nuvemfiscal.com.br/oauth/token'
// Current API 2.70.0: POST /nfse/dps (the old POST /nfse RPS endpoint is deprecated).
// Official schema references: https://dev.nuvemfiscal.com.br/docs/api/
// https://github.com/nuvem-fiscal/nuvemfiscal-sdk-php/tree/main/docs/Model
// InfDPS, CServ, TribMunicipal and TribTotal use provider-managed numbering/regime configuration.
const statusMap: Record<string, FiscalInvoiceStatus> = {
  novo: 'processing', pendente: 'processing', processando: 'processing', autorizada: 'authorized', autorizado: 'authorized',
  rejeitada: 'rejected', rejeitado: 'rejected', erro: 'error', cancelada: 'cancelled', cancelado: 'cancelled',
}

function normalizeInvoice(value: unknown): FiscalProviderInvoice {
  if (!value || typeof value !== 'object') throw new FiscalError('PROVIDER_RESPONSE_INVALID', 'O provedor retornou uma resposta fiscal inválida.', true)
  const data = value as Record<string, unknown>
  if (typeof data.id !== 'string' || typeof data.status !== 'string' || !statusMap[data.status]) {
    throw new FiscalError('PROVIDER_RESPONSE_INVALID', 'O provedor retornou uma resposta fiscal inválida.', true)
  }
  return { id: data.id, status: statusMap[data.status], reference: typeof data.referencia === 'string' ? data.referencia : '',
    issuedAt: typeof data.data_emissao === 'string' ? data.data_emissao : undefined,
    number: typeof data.numero === 'string' ? data.numero : undefined,
    verificationCode: typeof data.codigo_verificacao === 'string' ? data.codigo_verificacao : undefined }
}

export function buildDpsPayload(input: FiscalIssueInput) {
  const issuer = validateIssuer(input.issuer)
  const client = validateClient(input.client)
  const service = validateService(input.service)
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) throw new FiscalError('AMOUNT_INVALID', 'O valor fiscal deve ser informado em centavos e ser positivo.')
  if (input.reference.length > 50 || !input.reference || !/^\d{4}-\d{2}-\d{2}$/.test(input.competence)) throw new FiscalError('ISSUE_INPUT_INVALID', 'Referência ou competência fiscal inválida.')
  // This integration supports the accountant-confirmed ME/EPP Simples flow. Other regimes
  // require explicit tax groups rather than inferred totals and remain blocked.
  if (issuer.simple_national_option !== 3) throw new FiscalError('TAX_REGIME_UNSUPPORTED', 'Esta configuração de regime precisa de validação fiscal antes de emitir.')
  return {
    provedor: service.provider_mode, ambiente: 'homologacao', referencia: input.reference,
    infDPS: {
      tpAmb: 2, dhEmi: new Date().toISOString(), verAplic: 'ANXIS', dCompet: input.competence,
      prest: { CNPJ: issuer.cpf_cnpj, regTrib: { regEspTrib: issuer.special_tax_regime } },
      toma: { [client.cpf_cnpj.length === 14 ? 'CNPJ' : 'CPF']: client.cpf_cnpj, xNome: client.legal_name,
        email: client.email, ...(client.phone ? { fone: client.phone } : {}),
        end: { endNac: { cMun: client.city_ibge, CEP: client.cep }, xLgr: client.street, nro: client.number,
          xBairro: client.neighborhood, ...(client.complement ? { xCpl: client.complement } : {}) } },
      serv: { locPrest: { cLocPrestacao: service.municipality_code }, cServ: {
        cTribNac: service.national_tax_code, xDescServ: service.description,
        ...(service.municipal_tax_code ? { cTribMun: service.municipal_tax_code } : {}),
        ...(service.cnae ? { CNAE: service.cnae } : {}), ...(service.nbs ? { cNBS: service.nbs } : {}),
      } },
      valores: { vServPrest: { vServ: input.amountCents / 100 }, trib: {
        tribMun: { tribISSQN: service.iss_taxation, tpRetISSQN: service.iss_withholding, pAliq: service.iss_rate },
        totTrib: { pTotTribSN: service.total_tax_rate },
      } },
    },
  }
}

export class NuvemFiscalProvider implements FiscalProvider {
  private token: string | null = null
  private tokenExpiresAt = 0
  constructor(
    private readonly credentials: { clientId: string; clientSecret: string },
    environment: FiscalEnvironment = 'homologation',
    private readonly request: typeof fetch = fetch,
  ) {
    if (environment !== 'homologation') throw new FiscalError('PRODUCTION_DISABLED', 'A emissão em produção permanece bloqueada até a liberação manual da integração.')
    if (!credentials.clientId || !credentials.clientSecret) throw new FiscalError('CREDENTIALS_MISSING', 'Configure as credenciais fiscais privadas no servidor.')
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.tokenExpiresAt > Date.now()) return this.token
    let response: Response
    try {
      response = await this.request(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret, scope: 'empresa nfse' }),
        signal: AbortSignal.timeout(15_000), redirect: 'error', cache: 'no-store' })
    } catch { throw new FiscalError('PROVIDER_AUTH_UNAVAILABLE', 'Não foi possível autenticar no provedor fiscal.', true) }
    if (!response.ok) throw new FiscalError('PROVIDER_AUTH_FAILED', 'As credenciais fiscais não foram aceitas pelo provedor.')
    const data: unknown = await response.json().catch(() => null)
    if (!data || typeof data !== 'object' || !('access_token' in data) || typeof data.access_token !== 'string') {
      throw new FiscalError('PROVIDER_AUTH_INVALID', 'A autenticação fiscal retornou uma resposta inválida.', true)
    }
    this.token = data.access_token
    const expires = 'expires_in' in data && typeof data.expires_in === 'number' ? data.expires_in : 60
    this.tokenExpiresAt = Date.now() + Math.max(0, expires - 30) * 1000
    return this.token
  }

  private async api(path: string, method = 'GET', body?: unknown): Promise<Response> {
    const token = await this.accessToken()
    let response: Response
    try {
      response = await this.request(`${SANDBOX_URL}${path}`, { method,
        headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20_000), redirect: 'error', cache: 'no-store' })
    } catch { throw new FiscalError('PROVIDER_UNAVAILABLE', 'A comunicação com o provedor fiscal não foi concluída.', true, method === 'POST') }
    if (!response.ok) {
      if (response.status === 401) { this.token = null; this.tokenExpiresAt = 0 }
      throw new FiscalError(`PROVIDER_HTTP_${response.status}`, response.status === 404 ? 'O documento fiscal não foi encontrado no provedor.' : 'O provedor fiscal não concluiu a operação solicitada.',
        response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500,
        method === 'POST' && (response.status >= 500 || response.status === 408 || response.status === 409))
    }
    return response
  }

  async issueInvoice(input: FiscalIssueInput): Promise<FiscalProviderInvoice> {
    const payload = buildDpsPayload(input)
    const response = await this.api('/nfse/dps', 'POST', payload)
    try { return normalizeInvoice(await response.json()) }
    catch { throw new FiscalError('ISSUE_RESPONSE_UNCERTAIN', 'A emissão precisa ser reconciliada antes de uma nova tentativa.', true, true) }
  }
  async validateIssuerConfiguration(input: FiscalIssueInput): Promise<void> {
    // Company registration, tax regime and certificate are managed in Nuvem Fiscal.
    const configuration = await (await this.api(`/empresas/${input.issuer.cpf_cnpj}/nfse`)).json().catch(() => null)
    if (configuration?.regTrib?.opSimpNac !== input.issuer.simple_national_option ||
        configuration?.regTrib?.regEspTrib !== input.issuer.special_tax_regime || configuration?.ambiente !== 'homologacao') {
      throw new FiscalError('PROVIDER_ISSUER_MISMATCH', 'Confira o regime e o ambiente da empresa cadastrada no provedor fiscal.')
    }
    const certificate = await this.getCertificateStatus(input.issuer.cpf_cnpj)
    if (certificate.status !== 'valid') throw new FiscalError('CERTIFICATE_INVALID', 'Cadastre um certificado válido da empresa no provedor fiscal.')
  }
  async findInvoice(reference: string, issuerCnpj: string): Promise<FiscalProviderInvoice | null> {
    const query = new URLSearchParams({ cpf_cnpj: issuerCnpj, referencia: reference, ambiente: 'homologacao', '$top': '100' })
    const data: unknown = await (await this.api(`/nfse?${query}`)).json().catch(() => null)
    if (!data || typeof data !== 'object' || !('data' in data) || !Array.isArray(data.data)) throw new FiscalError('LOOKUP_INVALID', 'Não foi possível confirmar a referência fiscal no provedor.', true)
    const exact = data.data.filter((invoice: Record<string, unknown>) => invoice.referencia === reference)
    if (exact.length > 1) throw new FiscalError('REFERENCE_CONFLICT', 'A referência fiscal retornou mais de um documento. Revise a integração.')
    return exact.length === 1 ? normalizeInvoice(exact[0]) : null
  }
  async getInvoice(id: string) { return normalizeInvoice(await (await this.api(`/nfse/${encodeURIComponent(id)}`)).json()) }
  async cancelInvoice(id: string, reason: string, code: string) {
    if (reason.trim().length < 15 || !code.trim()) throw new FiscalError('CANCELLATION_INVALID', 'Informe o código municipal e um motivo de cancelamento com pelo menos 15 caracteres.')
    await this.api(`/nfse/${encodeURIComponent(id)}/cancelamento`, 'POST', { codigo: code, motivo: reason.trim() })
  }
  async getPdf(id: string) { return new Uint8Array(await (await this.api(`/nfse/${encodeURIComponent(id)}/pdf`)).arrayBuffer()) }
  async getXml(id: string) { return new Uint8Array(await (await this.api(`/nfse/${encodeURIComponent(id)}/xml`)).arrayBuffer()) }
  async getCertificateStatus(cnpj: string): Promise<{ status: 'valid' | 'expired' | 'missing'; expiresAt?: string }> {
    let response: Response
    try { response = await this.api(`/empresas/${encodeURIComponent(cnpj)}/certificado`) }
    catch (error) { if (error instanceof FiscalError && error.code === 'PROVIDER_HTTP_404') return { status: 'missing' }; throw error }
    const data: unknown = await response.json().catch(() => null)
    if (!data || typeof data !== 'object' || !('not_valid_after' in data) || typeof data.not_valid_after !== 'string' || !Number.isFinite(Date.parse(data.not_valid_after))) {
      throw new FiscalError('CERTIFICATE_RESPONSE_INVALID', 'Não foi possível confirmar a validade do certificado fiscal.', true)
    }
    return { status: Date.parse(data.not_valid_after) > Date.now() ? 'valid' : 'expired', expiresAt: data.not_valid_after }
  }
}
