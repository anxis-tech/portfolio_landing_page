import { z } from 'zod'
import type { FiscalClient, FiscalCompanySettings, FiscalIssuer, FiscalServiceSettings, ManualFiscalClientSnapshot, ValidatedManualFiscalInvoiceInput } from './types'
import { FiscalError } from './errors'

const text = z.string().trim().min(1).max(250)
const digits = (length: number) => z.string().regex(new RegExp(`^\\d{${length}}$`))
export function validTaxDocument(value: string): boolean {
  if (!/^(\d{11}|\d{14})$/.test(value) || /^(\d)\1+$/.test(value)) return false
  const digit = (part: string, weights: number[]) => {
    const remainder = [...part].reduce((total, current, index) => total + Number(current) * weights[index], 0) % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  const firstWeights = value.length === 11 ? [10,9,8,7,6,5,4,3,2] : [5,4,3,2,9,8,7,6,5,4,3,2]
  const secondWeights = value.length === 11 ? [11,10,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2]
  return digit(value.slice(0,-2),firstWeights) === Number(value.at(-2)) &&
    digit(value.slice(0,-1),secondWeights) === Number(value.at(-1))
}
const document = z.string().refine(validTaxDocument)
const issuerSchema = z.object({
  cpf_cnpj: digits(14).refine(validTaxDocument), legal_name: text,
  municipal_registration: text, municipality_code: digits(7), street: text, number: text,
  neighborhood: text, city: text, state: z.string().regex(/^[A-Z]{2}$/), cep: digits(8),
  complement: z.string().max(150).optional(), email: z.string().email(),
  simple_national_option: z.number().int().min(1).max(3), special_tax_regime: z.number().int().min(0).max(6),
}).strict()
const serviceSchema = z.object({
  description: z.string().trim().min(1).max(2000), national_tax_code: z.string().regex(/^(\d{4}|\d{6})$/),
  municipal_tax_code: z.string().max(20).optional(), cnae: digits(7).optional(), nbs: digits(9).optional(),
  municipality_code: digits(7), iss_taxation: z.number().int().min(1).max(4),
  iss_withholding: z.number().int().min(1).max(3), iss_rate: z.number().min(0).max(100),
  total_tax_rate: z.number().min(0).max(100), provider_mode: z.enum(['padrao', 'nacional']),
}).strict()
const clientSchema = z.object({
  cpf_cnpj: document, legal_name: text, email: z.string().email(), phone: z.string().max(20).optional(),
  street: text, number: text, neighborhood: text, city: text, state: z.string().regex(/^[A-Z]{2}$/),
  cep: digits(8), complement: z.string().max(150).optional(), city_ibge: digits(7),
})

const labels: Record<string,string> = { cpf_cnpj: 'CPF/CNPJ válido', legal_name: 'nome/razão social',
  municipal_registration: 'inscrição municipal', municipality_code: 'código IBGE do município', city_ibge: 'código IBGE do município',
  street: 'logradouro', number: 'número', neighborhood: 'bairro', city: 'cidade', state: 'UF', cep: 'CEP', email: 'e-mail',
  simple_national_option: 'opção do Simples Nacional', special_tax_regime: 'regime especial tributário',
  national_tax_code: 'código nacional do serviço', municipal_tax_code: 'código municipal do serviço',
  iss_taxation: 'tributação do ISS', iss_withholding: 'retenção do ISS', iss_rate: 'alíquota do ISS',
  total_tax_rate: 'alíquota total do Simples', provider_mode: 'provedor municipal/nacional', description: 'descrição do serviço' }
function fieldsError(code: string, prefix: string, issues: readonly { path: readonly PropertyKey[] }[]) {
  const names = [...new Set(issues.map((issue) => labels[String(issue.path.at(-1))] || 'configuração fiscal'))]
  return new FiscalError(code, `${prefix}: complete ou corrija ${names.join(', ')}.`)
}
function removeEmpty(input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input
  return Object.fromEntries(Object.entries(input).filter(([,value]) => value !== undefined && value !== null &&
    !(typeof value === 'string' && value.trim() === '')).map(([key,value]) => [key,removeEmpty(value)]))
}

export function validateIssuer(input: unknown): FiscalIssuer {
  const result = issuerSchema.safeParse(input)
  if (!result.success) throw fieldsError('ISSUER_INCOMPLETE', 'Empresa emitente', result.error.issues)
  return result.data
}
export function validateService(input: unknown): FiscalServiceSettings {
  const result = serviceSchema.safeParse(input)
  if (!result.success) throw fieldsError('SERVICE_INCOMPLETE', 'Serviço fiscal', result.error.issues)
  if (result.data.provider_mode === 'nacional' && result.data.national_tax_code.length !== 6) {
    throw new FiscalError('SERVICE_INCOMPLETE', 'Serviço fiscal: o código nacional deve possuir 6 dígitos para o provedor nacional.')
  }
  return result.data
}
export function validateClient(input: unknown): FiscalClient {
  const result = clientSchema.safeParse(input)
  if (!result.success) throw fieldsError('CLIENT_INCOMPLETE', 'Cliente do projeto', result.error.issues)
  return result.data
}

export function validateSettings(input: unknown): FiscalCompanySettings {
  const base = z.object({ id: z.literal(true), provider: z.literal('fiscal_contora'),
    environment: z.enum(['homologation', 'production']), is_enabled: z.boolean(),
    issuer: z.record(z.string(), z.unknown()), service: z.record(z.string(), z.unknown()),
  }).strict().safeParse(removeEmpty(input))
  if (!base.success) throw new FiscalError('SETTINGS_INVALID', 'Configuração fiscal inválida.')
  // Even disabled drafts accept only known, non-secret fields; incomplete values may be filled later.
  const draftIssuer = issuerSchema.partial().safeParse(base.data.issuer)
  const draftService = serviceSchema.partial().safeParse(base.data.service)
  if (!draftIssuer.success) throw fieldsError('SETTINGS_INVALID', 'Empresa emitente', draftIssuer.error.issues)
  if (!draftService.success) throw fieldsError('SETTINGS_INVALID', 'Serviço fiscal', draftService.error.issues)
  if (base.data.environment === 'production') throw new FiscalError('PRODUCTION_DISABLED', 'A emissão em produção permanece bloqueada até a liberação manual da integração.')
  if (base.data.is_enabled) throw new FiscalError('PROVIDER_CONFIGURATION_REQUIRED', 'A Fiscal Contora ainda não está configurada para transmissão. Mantenha a emissão desativada.')
  return { ...base.data, issuer: draftIssuer.data as FiscalIssuer, service: draftService.data as FiscalServiceSettings }
}

const manualClientSchema = z.object({
  personType: z.enum(['pf', 'pj']),
  cpfCnpj: z.string().trim().regex(/^[\d.\-/\s]+$/).transform(value => value.replace(/\D/g, '')),
  name: z.string().trim().min(1).max(250),
  email: z.email().max(250),
  cep: z.string().trim().regex(/^[\d\-\s]+$/).transform(value => value.replace(/\D/g, '')),
  address: z.string().trim().min(1).max(250),
  number: z.string().trim().min(1).max(30),
  complement: z.string().trim().max(150).optional(),
  neighborhood: z.string().trim().min(1).max(250),
  city: z.string().trim().min(1).max(250),
  state: z.string().trim().toUpperCase().pipe(z.enum(['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'])),
}).strict()

function manualClientSnapshot(input: z.infer<typeof manualClientSchema>): ManualFiscalClientSnapshot {
  if (!validTaxDocument(input.cpfCnpj) || input.cpfCnpj.length !== (input.personType === 'pf' ? 11 : 14)) {
    throw new FiscalError('CLIENT_DOCUMENT_INVALID', 'Confira se CPF/CNPJ do tomador corresponde a pessoa física ou jurídica.')
  }
  if (input.cep.length !== 8) throw new FiscalError('CLIENT_ADDRESS_INVALID', 'Informe um CEP de oito dígitos para o tomador.')
  return { person_type: input.personType, cpf_cnpj: input.cpfCnpj, legal_name: input.name,
    email: input.email.toLowerCase(), cep: input.cep, street: input.address, number: input.number,
    ...(input.complement ? { complement: input.complement } : {}), neighborhood: input.neighborhood,
    city: input.city, state: input.state }
}

function amountInCents(value: string): number {
  const cleaned = value.trim().replace(/^R\$\s*/, '').replace(/\s/g, '')
  let units: string
  let cents: string
  if (/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(cleaned)) {
    const [whole, fraction = ''] = cleaned.split(',')
    units = whole.replace(/\./g, '')
    cents = fraction.padEnd(2, '0')
  } else if (/^\d+(?:\.\d{1,2})?$/.test(cleaned)) {
    const [whole, fraction = ''] = cleaned.split('.')
    units = whole
    cents = fraction.padEnd(2, '0')
  } else throw new FiscalError('AMOUNT_INVALID', 'Informe um valor válido em reais, com até duas casas decimais.')
  const result = Number(BigInt(units) * BigInt(100) + BigInt(cents || '0'))
  if (!Number.isSafeInteger(result) || result <= 0) throw new FiscalError('AMOUNT_INVALID', 'O valor da nota deve ser positivo e caber em centavos.')
  return result
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

export function validateManualFiscalInvoiceInput(input: unknown): ValidatedManualFiscalInvoiceInput {
  const result = z.object({
    idempotencyKey: z.uuid(), clientMode: z.enum(['manual', 'project']),
    clientProjectId: z.uuid().optional(), client: manualClientSchema.optional(),
    serviceDescription: z.string().trim().min(1).max(2000), amount: z.string().min(1).max(40),
    competenceDate: z.string(), projectId: z.uuid().optional(), contractId: z.uuid().optional(),
  }).strict().safeParse(input)
  if (!result.success) throw new FiscalError('MANUAL_INVOICE_INVALID', 'Revise os dados da NFS-e: tomador, serviço, valor, competência e vínculos.')
  const data = result.data
  if (data.clientMode === 'manual' ? !data.client || !!data.clientProjectId : !data.clientProjectId || !!data.client) {
    throw new FiscalError('CLIENT_INVALID', 'Selecione um cliente existente ou preencha os dados do tomador manualmente.')
  }
  if (data.contractId && !data.projectId) throw new FiscalError('CONTRACT_INVALID', 'Selecione o projeto relacionado ao contrato.')
  if (!validDate(data.competenceDate)) throw new FiscalError('COMPETENCE_INVALID', 'Informe uma data de competência válida.')
  const { amount, client, ...rest } = data
  return { ...rest, amountCents: amountInCents(amount), ...(client ? { client: manualClientSnapshot(client) } : {}) }
}

export function manualClientFromProject(project: Record<string, unknown>): ManualFiscalClientSnapshot {
  const contact = project.client_contact_json && typeof project.client_contact_json === 'object'
    ? project.client_contact_json as Record<string, unknown> : {}
  const digitsOnly = (value: unknown) => typeof value === 'string' ? value.replace(/\D/g, '') : ''
  const document = digitsOnly(contact.cpf_cnpj)
  const parsed = manualClientSchema.safeParse({
    personType: document.length === 11 ? 'pf' : 'pj', cpfCnpj: document,
    name: contact.legal_name || contact.company || contact.contact_name || project.client_name,
    email: contact.email || project.email, cep: digitsOnly(contact.cep),
    address: contact.street, number: contact.number, complement: contact.complement,
    neighborhood: contact.neighborhood, city: contact.city, state: contact.state,
  })
  if (!parsed.success) throw fieldsError('CLIENT_INCOMPLETE', 'Cliente existente', parsed.error.issues)
  const snapshot = manualClientSnapshot(parsed.data)
  if (typeof contact.city_ibge === 'string' && /^\d{7}$/.test(contact.city_ibge)) snapshot.city_ibge = contact.city_ibge
  return snapshot
}

export function clientFromProject(project: Record<string, unknown>): FiscalClient {
  const contact = project.client_contact_json && typeof project.client_contact_json === 'object'
    ? project.client_contact_json as Record<string, unknown> : {}
  const digitsOnly = (value: unknown) => typeof value === 'string' ? value.replace(/\D/g, '') : value
  return validateClient({
    cpf_cnpj: digitsOnly(contact.cpf_cnpj), legal_name: contact.legal_name || contact.company || contact.contact_name || project.client_name,
    email: contact.email || project.email, phone: digitsOnly(contact.phone || contact.whatsapp || project.phone),
    street: contact.street, number: contact.number, neighborhood: contact.neighborhood,
    city: contact.city, state: contact.state, cep: digitsOnly(contact.cep),
    complement: contact.complement, city_ibge: contact.city_ibge,
  })
}
