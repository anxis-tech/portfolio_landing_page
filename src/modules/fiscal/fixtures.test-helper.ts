import type { FiscalIssuer, FiscalServiceSettings, FiscalClient, FiscalInvoice, FiscalProvider, FiscalProviderInvoice } from './types'
import { fiscalProviderReference } from './reference'

// Synthetic tax codes/rates are used only by mocks; never seed fiscal settings
// or submit these fixtures to Nuvem Fiscal, including its sandbox.
export const issuer: FiscalIssuer = {
  cpf_cnpj: '64956037000170', legal_name: 'Empresa de teste', municipal_registration: '123', municipality_code: '3550308',
  street: 'Rua de teste', number: '10', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', cep: '01001000', email: 'issuer@example.test',
  simple_national_option: 3, special_tax_regime: 0,
}
export const service: FiscalServiceSettings = {
  description: 'Serviço de teste em homologação', national_tax_code: '010101', municipality_code: '3550308',
  iss_taxation: 1, iss_withholding: 1, iss_rate: 2, total_tax_rate: 6, provider_mode: 'nacional',
}
export const client: FiscalClient = { cpf_cnpj: '52998224725', legal_name: 'Cliente de teste', email: 'client@example.test',
  street: 'Rua de teste', number: '20', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', cep: '01001000', city_ibge: '3550308' }
export function invoice(overrides: Partial<FiscalInvoice> = {}): FiscalInvoice {
  const internal = 'project:11111111-1111-4111-8111-111111111111:completion'
  return { id: '22222222-2222-4222-8222-222222222222', project_id: '11111111-1111-4111-8111-111111111111', contract_id: '33333333-3333-4333-8333-333333333333', source: 'automatic', service_description: null, amount: 110000,
    competence_date: '2026-09-26', status: 'processing', provider: 'fiscal_contora', internal_reference: internal,
    provider_reference: fiscalProviderReference(internal), provider_invoice_id: null, invoice_number: null, verification_code: null,
    issuer_snapshot: { ...issuer, environment: 'homologation' }, client_snapshot: { ...client }, service_snapshot: { ...service },
    pdf_path: null, xml_path: null, error_code: null, error_message: null, attempts: 1, max_attempts: 5, next_attempt_at: null,
    lease_token: '44444444-4444-4444-8444-444444444444', lease_expires_at: '2099-01-01T00:00:00Z', submission_uncertain: false,
    submission_started_at: null, issued_at: null, cancelled_at: null, created_at: '2026-09-26T00:00:00Z', updated_at: '2026-09-26T00:00:00Z', ...overrides }
}
export function providerResult(overrides: Partial<FiscalProviderInvoice> = {}): FiscalProviderInvoice {
  return { id: 'nfse_test', status: 'authorized', reference: invoice().provider_reference, issuedAt: '2026-09-26T12:00:00Z', number: '123', verificationCode: 'verify_test', ...overrides }
}
export function provider(overrides: Partial<FiscalProvider> = {}): FiscalProvider {
  return { issueInvoice: async () => providerResult(), findInvoice: async () => null, getInvoice: async () => providerResult(), cancelInvoice: async () => {},
    getPdf: async () => new TextEncoder().encode('%PDF-1.4 test'), getXml: async () => new TextEncoder().encode('<?xml version="1.0"?><NFSe/>'),
    getCertificateStatus: async () => ({ status: 'valid', expiresAt: '2099-01-01' }), ...overrides }
}
