export async function ok<T = any>(data?: T) {
  return { success: true, data: data ?? (null as any), message: 'Operação realizada com sucesso' }
}

// Client Projects
export const saveClientProjectAction = async (project: any) => ok(project)
export const deleteClientProjectAction = async (id: string) => ok({ id })

// Contracts
export const getContractsForProjects = async () => ok([])
export const getContractByProjectId = async () => ok(null)
export const downloadContractAction = async () => ok({ url: '#' })
export const downloadSignedContractAction = async () => ok({ url: '#' })
export const retryContractGeneration = async () => ok()
export const sendContractForSignatureAction = async () => ok()
export const voidContractAction = async () => ok()

// Payments
export const createPaymentLinkAction = async () => ok({ url: '#' })
export const getPaymentsForProjectsAction = async () => ok([])
export const getPaymentByProjectIdAction = async () => ok(null)
export const checkPaymentStatusAction = async () => ok({ status: 'paid' })
export const getProjectChargesAction = async () => ok([])

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
  conversations: { waiting_agent: 2, waiting_customer: 1, unassigned: 0, total: 3 },
  commercial: { new: 4, qualified: 3, contacted: 5, replied: 4, proposals: 2, total: 18 }
})

// Users & Permissions
export const updateUserOperationalRoleAction = async () => ok()
export const updateUserPermissionsAction = async () => ok()
export const syncAuthUsersToProfilesAction = async () => ok()

// Projects (Home Portfolio)
export const saveHomeProjectAction = async (p: any) => ok(p)
export const deleteHomeProjectAction = async () => ok()

// Fiscal
export const createManualFiscalInvoiceAction = async () => ok()
export const downloadFiscalInvoiceAction = async () => ok({ url: '#' })
export const getFiscalInvoiceListAction = async () => ok([])
export const getFiscalInvoicesForProjectAction = async () => ok([])
export const retryFiscalInvoiceAction = async () => ok()
export const getFiscalCertificateStatusAction = async () => ok({ valid: true, expires_at: '2027-12-31' })
export const getFiscalSettingsAction = async () => ok({ environment: 'homologacao' })
export const saveFiscalSettingsAction = async (s: any) => ok(s)

// Commissions
export const getCommissionsAction = async () => ok([])
export const saveCommissionAction = async () => ok()
export const payCommissionAction = async () => ok()

// Prospecting / WhatsApp
export const loadWhatsAppInboxConversationsAction = async () => ok([])
export const listWhatsAppAssigneesAction = async () => ok([])
export const createStandaloneWhatsAppContactAction = async () => ok()
export const sendWhatsAppTextMessageAction = async () => ok()
// Extra WhatsApp & Commissions actions for seamless runtime
export const assignWhatsAppConversationAction = async () => ok()
export const whatsappCommercialAction = async () => ok()
export const setWhatsAppConversationClosedAction = async () => ok()
export const unlinkWhatsAppConversationAction = async () => ok()
export const requestWhatsAppTemplateSyncAction = async () => ok()
export const loadWhatsAppConversationAction = async () => ok(null)
export const loadWhatsAppMessagesAction = async () => ok([])
export const sendWhatsAppMessageAction = async () => ok()
export const markWhatsAppReadAction = async () => ok()
export const getCommissionRulesAction = async () => ok([])
export const getCommissionsForMonthAction = async () => ok([])
export const upsertCommissionRuleAction = async () => ok()
export const markUserCommissionsAsPaidAction = async () => ok()
