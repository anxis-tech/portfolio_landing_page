export type FiscalEnvironment = 'homologation' | 'production'
export type FiscalInvoiceStatus = 'pending' | 'configuration_required' | 'processing' | 'authorized' | 'rejected' | 'error' | 'cancelled' | 'blocked'
export type FiscalProviderName = 'fiscal_contora' | 'nuvem_fiscal'

export interface FiscalIssuer {
  cpf_cnpj: string
  legal_name: string
  municipal_registration: string
  municipality_code: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  cep: string
  complement?: string
  email: string
  // Accountant-supplied codes; deliberately no inferred tax regime.
  simple_national_option: number
  special_tax_regime: number
}

export interface FiscalServiceSettings {
  description: string
  national_tax_code: string
  municipal_tax_code?: string
  cnae?: string
  nbs?: string
  municipality_code: string
  iss_taxation: number
  iss_withholding: number
  iss_rate: number
  total_tax_rate: number
  provider_mode: 'padrao' | 'nacional'
}

export interface FiscalCompanySettings {
  id: true
  provider: FiscalProviderName
  environment: FiscalEnvironment
  is_enabled: boolean
  issuer: FiscalIssuer
  service: FiscalServiceSettings
  updated_at?: string
}

export interface FiscalClient {
  cpf_cnpj: string
  legal_name: string
  email: string
  phone?: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  cep: string
  complement?: string
  city_ibge: string
}

export interface FiscalInvoice {
  id: string
  project_id: string | null
  contract_id: string | null
  source: 'automatic' | 'manual'
  service_description: string | null
  amount: number | null
  competence_date: string
  status: FiscalInvoiceStatus
  provider: FiscalProviderName
  internal_reference: string
  provider_reference: string
  provider_invoice_id: string | null
  invoice_number: string | null
  verification_code: string | null
  issuer_snapshot: Record<string, unknown>
  client_snapshot: Record<string, unknown>
  service_snapshot: Record<string, unknown>
  pdf_path: string | null
  xml_path: string | null
  error_code: string | null
  error_message: string | null
  attempts: number
  max_attempts: number
  next_attempt_at: string | null
  lease_token: string | null
  lease_expires_at: string | null
  submission_uncertain: boolean
  submission_started_at: string | null
  issued_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type FiscalInvoiceSummary = Omit<FiscalInvoice, 'issuer_snapshot' | 'client_snapshot' | 'service_snapshot' | 'lease_token' | 'lease_expires_at'>

export interface FiscalInvoiceListItem {
  id: string
  project_id: string | null
  contract_id: string | null
  clientName: string
  service_description: string | null
  amount: number | null
  source: 'automatic' | 'manual'
  status: FiscalInvoiceStatus
  competence_date: string
  issued_at: string | null
  invoice_number: string | null
  verification_code: string | null
  pdf_path: string | null
  xml_path: string | null
  created_at: string
}

export interface ManualFiscalInvoiceInput {
  idempotencyKey: string
  clientMode: 'manual' | 'project'
  clientProjectId?: string
  client?: {
    personType: 'pf' | 'pj'
    cpfCnpj: string
    name: string
    email: string
    cep: string
    address: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
  }
  serviceDescription: string
  amount: string
  competenceDate: string
  projectId?: string
  contractId?: string
}

export interface ManualFiscalClientSnapshot {
  person_type: 'pf' | 'pj'
  cpf_cnpj: string
  legal_name: string
  email: string
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  city_ibge?: string
}

export interface ValidatedManualFiscalInvoiceInput extends Omit<ManualFiscalInvoiceInput, 'client' | 'amount'> {
  client?: ManualFiscalClientSnapshot
  amountCents: number
}

export interface FiscalProviderInvoice {
  id: string
  status: FiscalInvoiceStatus
  reference: string
  issuedAt?: string
  number?: string
  verificationCode?: string
}

export interface FiscalIssueInput {
  reference: string
  amountCents: number
  issuer: FiscalIssuer
  client: FiscalClient
  service: FiscalServiceSettings
  competence: string
}

export interface FiscalProvider {
  getConfigurationState?(): 'configuration_required' | 'ready'
  validateIssuerConfiguration?(input: FiscalIssueInput): Promise<void>
  issueInvoice(input: FiscalIssueInput): Promise<FiscalProviderInvoice>
  findInvoice(reference: string, issuerCnpj: string): Promise<FiscalProviderInvoice | null>
  getInvoice(id: string): Promise<FiscalProviderInvoice>
  cancelInvoice(id: string, reason: string, code: string): Promise<void>
  getPdf(id: string): Promise<Uint8Array>
  getXml(id: string): Promise<Uint8Array>
  getCertificateStatus(cnpj: string): Promise<{ status: 'valid' | 'expired' | 'missing'; expiresAt?: string }>
}
