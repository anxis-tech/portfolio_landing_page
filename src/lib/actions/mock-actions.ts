import {
  MOCK_CLIENT_PROJECTS,
  MOCK_CONTRACTS,
  MOCK_PAYMENTS,
  MOCK_FISCAL_INVOICES,
  MOCK_SAVED_QUOTES,
  MOCK_TEAM_DIRECTORY,
} from '@/components/admin/mock-crm-data'

export async function ok<T = any>(data?: T) {
  return { success: true, data: data ?? (null as any), message: 'Operação realizada com sucesso' }
}

// Client Projects
export const saveClientProjectAction = async (project: any) => ok(project)
export const deleteClientProjectAction = async (id: string) => ok({ id })

// Contracts
export const getContractsForProjects = async () => ({
  success: true,
  data: MOCK_CONTRACTS,
})
export const getContractByProjectId = async (projectId: string) => ({
  success: true,
  data: MOCK_CONTRACTS.find((c) => c.project_id === projectId) || null,
})
export const downloadContractAction = async () => ok({ url: '#' })
export const downloadSignedContractAction = async () => ok({ url: '#' })
export const retryContractGeneration = async () => ok()
export const sendContractForSignatureAction = async () => ok()
export const voidContractAction = async () => ok()

// Payments
export const createPaymentLinkAction = async () => ok({ url: 'https://asaas.com/pay/mock' })
export const getPaymentsForProjectsAction = async () => ({
  success: true,
  data: MOCK_PAYMENTS,
})
export const getPaymentByProjectIdAction = async (projectId: string) => ({
  success: true,
  data: MOCK_PAYMENTS.find((p) => p.project_id === projectId) || null,
})
export const checkPaymentStatusAction = async () => ok({ status: 'paid' })
export const getProjectChargesAction = async (projectId: string) => ({
  success: true,
  data: MOCK_PAYMENTS.filter((p) => p.project_id === projectId),
})

// Quotes & Proposals
export const saveQuoteAction = async (quote: any) => ok(quote)
export const deleteQuoteAction = async () => ok()
export const getPricingSettingsAction = async () => ok({
  base_prices: { landing_page: 3500, institucional: 6500, ecommerce: 11000, sistema: 15000 },
  page_multiplier: 600,
  content_options: { full: 1000, partial: 500, none: 0 },
  urgency_multipliers: { normal: 1, fast: 1.25, urgent: 1.5 }
})
export const savePricingSettingsAction = async (s: any) => ok(s)
export const generateQuoteProposalAction = async () => ok({ public_token: 'mock-token' })
export const getQuoteProposalStateAction = async () => ok(null)
export const getQuoteProposalStatesAction = async () => ([])

// Dashboard
export const getDashboardMetricsAction = async () => ok({
  conversations: {
    waiting_agent: 3,
    waiting_customer: 14,
    unassigned: 2,
    open: 19,
    unread: 2,
    window_expiring: 1,
    total: 19,
  },
  commercial: {
    new: 64,
    qualified: 28,
    contacted: 22,
    replied: 18,
    proposals: 8,
    total: 64,
  },
})

// Users & Permissions
export const updateUserOperationalRoleAction = async () => ok()
export const updateUserPermissionsAction = async () => ok()
export const syncAuthUsersToProfilesAction = async () => ok()

// Projects (Home Portfolio)
export const saveHomeProjectAction = async (p: any) => ok(p)
export const deleteHomeProjectAction = async () => ok()

// Fiscal
export const createManualFiscalInvoiceAction = async (input: any) => {
  const newInvoice = {
    id: `inv-${Date.now()}`,
    invoice_number: `2026/00${Math.floor(143 + Math.random() * 50)}`,
    clientName: input.client?.name || 'Cliente Avulso',
    service_description: input.serviceDescription || 'Serviços de desenvolvimento web',
    amount: Math.round(parseFloat(String(input.amount || '0').replace(/\./g, '').replace(',', '.')) * 100),
    source: 'manual' as const,
    status: 'processing' as const,
    competence_date: input.competenceDate || new Date().toISOString().slice(0, 10),
    issued_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    verification_code: 'B92F-11AC',
    pdf_path: null,
    xml_path: null,
    project_id: input.projectId || null,
    contract_id: input.contractId || null,
  }
  return {
    success: true,
    invoice: newInvoice,
  }
}

export const downloadFiscalInvoiceAction = async () => ok({ url: '#' })

export const getFiscalInvoiceListAction = async () => ({
  success: true,
  invoices: MOCK_FISCAL_INVOICES,
  truncated: false,
})

export const getFiscalInvoicesForProjectAction = async (projectId: string) => ({
  success: true,
  invoices: MOCK_FISCAL_INVOICES.filter((i) => i.project_id === projectId),
})

export const retryFiscalInvoiceAction = async () => ok()
export const getFiscalCertificateStatusAction = async () => ok({ valid: true, expires_at: '2027-12-31' })
export const getFiscalSettingsAction = async () => ok({ environment: 'homologacao' })
export const saveFiscalSettingsAction = async (s: any) => ok(s)

// Commissions
export const getCommissionsAction = async () => ok([])
export const saveCommissionAction = async () => ok()
export const payCommissionAction = async () => ok()
export const getCommissionRulesAction = async () => ok([])
export const getCommissionsForMonthAction = async () => ok([])
export const upsertCommissionRuleAction = async () => ok()
export const markUserCommissionsAsPaidAction = async () => ok()

// Prospecting / WhatsApp
export const loadWhatsAppInboxConversationsAction = async () => ok([])
export const listWhatsAppAssigneesAction = async () => ok([])
export const createStandaloneWhatsAppContactAction = async () => ok()
export const sendWhatsAppTextMessageAction = async () => ok()
export const assignWhatsAppConversationAction = async () => ok()
export const whatsappCommercialAction = async () => ok()
export const setWhatsAppConversationClosedAction = async () => ok()
export const unlinkWhatsAppConversationAction = async () => ok()
export const requestWhatsAppTemplateSyncAction = async () => ok()
export const loadWhatsAppConversationAction = async () => ok(null)
export const loadWhatsAppMessagesAction = async () => ok([])
export const sendWhatsAppMessageAction = async () => ok()
export const markWhatsAppReadAction = async () => ok()
