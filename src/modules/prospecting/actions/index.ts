export async function ok<T = any>(data?: T) {
  return { success: true, data: data ?? (null as any), message: 'Operação mockada' }
}

export const loadProspectingAction = async () => ok({ campaigns: [], leads: [], stats: {} })
export const campaignControlAction = async () => ok()
export const createCampaignAction = async () => ok()
export const leadControlAction = async () => ok()
export const leadDetailsAction = async () => ok(null)
export const getLeadRowAction = async () => ok(null)
export const retryDiscoveryAction = async () => ok()
export const changePipelineAction = async () => ok()
export const getProcessingDetailsAction = async () => ok(null)
export const refreshAggregatesAction = async () => ok()
