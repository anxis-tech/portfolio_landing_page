export const PERMISSIONS = {
  PROSPECTING_VIEW: 'prospecting.view',
  PROSPECTING_MANAGE: 'prospecting.manage',
  WHATSAPP_RELEASE_UNCERTAINTY: 'whatsapp.release_uncertainty',
  // Portfólio da Home
  PORTFOLIO_VIEW: 'portfolio.view',
  PORTFOLIO_CREATE: 'portfolio.create',
  PORTFOLIO_EDIT: 'portfolio.edit',
  PORTFOLIO_DELETE: 'portfolio.delete',
  PORTFOLIO_REORDER: 'portfolio.reorder',
  PORTFOLIO_PUBLISH: 'portfolio.publish',

  // Projetos de Clientes
  CLIENT_PROJECTS_VIEW: 'client_projects.view',
  CLIENT_PROJECTS_VIEW_ALL: 'client_projects.view_all',
  CLIENT_PROJECTS_VIEW_ASSIGNED: 'client_projects.view_assigned',
  CLIENT_PROJECTS_CREATE: 'client_projects.create',
  CLIENT_PROJECTS_EDIT: 'client_projects.edit',
  CLIENT_PROJECTS_EDIT_BASE_VALUE: 'client_projects.edit_base_value',
  CLIENT_PROJECTS_DELETE: 'client_projects.delete',
  CLIENT_PROJECTS_ASSIGN_RESPONSIBLE: 'client_projects.assign_responsible',
  CLIENT_PROJECTS_MANAGE_PARTICIPANTS: 'client_projects.manage_participants',
  CLIENT_PROJECTS_MOVE_KANBAN: 'client_projects.move_kanban',
  CLIENT_PROJECTS_UPLOAD_FILES: 'client_projects.upload_files',
  CLIENT_PROJECTS_DELETE_FILES: 'client_projects.delete_files',
  CLIENT_PROJECTS_CHANGE_STATUS: 'client_projects.change_status',

  // Quadro Kanban
  KANBAN_VIEW: 'kanban_board.view',

  // Calculadora de Precificação
  PRICING_VIEW: 'pricing.view',
  PRICING_USE: 'pricing.use',
  PRICING_SAVE_QUOTE: 'pricing.save_quote',
  PRICING_VIEW_HISTORY: 'quotes_history.view',
  PRICING_MANAGE_SETTINGS: 'pricing.manage_settings',

  // Usuários e Permissões
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_ACTIVATE: 'users.activate',
  USERS_RESET_PASSWORD: 'users.reset_password',
  USERS_MANAGE_ROLES: 'users.manage_roles',
  USERS_MANAGE_PERMISSIONS: 'users.manage_permissions',
  USERS_DELETE: 'users.delete',

  // Auditoria
  AUDIT_VIEW: 'audit.view',

  // Contratos e pagamentos
  CONTRACTS_VIEW: 'contracts.view',
  CONTRACTS_GENERATE: 'contracts.generate',
  CONTRACTS_DOWNLOAD: 'contracts.download',
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_COPY_LINK: 'payments.copy_link',
  PAYMENTS_CHECK_STATUS: 'payments.check_status',
  PAYMENTS_VIEW_FINANCIAL_DATA: 'payments.view_financial_data',

  // Fiscal: mesma fonte relacional de permissões usada pelos demais módulos.
  FISCAL_VIEW: 'fiscal.view',
  FISCAL_ISSUE: 'fiscal.issue',
  FISCAL_RETRY: 'fiscal.retry',
  FISCAL_CANCEL: 'fiscal.cancel',
  FISCAL_MANAGE_SETTINGS: 'fiscal.manage_settings',

  // Financeiro
  FINANCE_VIEW: 'finance.view',
  FINANCE_VIEW_VALUES: 'finance.view_values',
  FINANCE_VIEW_PAYMENTS: 'finance.view_payments',

  // Comissões
  COMMISSIONS_VIEW: 'commissions.view',
  COMMISSIONS_VIEW_VALUES: 'commissions.view_values',
  COMMISSIONS_MANAGE_RULES: 'commissions.manage_rules',
  COMMISSIONS_REGISTER_PAYMENT: 'commissions.register_payment',

  // Leads & Comercial
  LEADS_VIEW: 'leads.view',
  LEADS_VIEW_ALL: 'leads.view_all',
  LEADS_CREATE: 'leads.create',
  LEADS_EDIT: 'leads.edit',
  LEADS_DELETE: 'leads.delete',
  LEADS_ASSIGN: 'leads.assign',
  LEADS_CHANGE_STATUS: 'leads.change_status',
  LEADS_CREATE_QUOTE: 'leads.create_quote',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export interface UserProfileWithRole {
  id: string
  user_id: string
  full_name: string
  email: string
  role_id?: string | null
  role_name?: string | null
  role_slug: string
  is_active: boolean
  /** Snapshot returned by Supabase's canonical permission resolver. */
  effective_permissions: string[]
  permission_overrides?: Record<string, boolean>
  role_permissions?: string[]
}

/** Render the database's permission snapshot; roles and display fields never grant access. */
export function hasPermission(
  user: UserProfileWithRole | null,
  permissionKey: PermissionKey | string,
): boolean {
  return Boolean(user?.is_active && user.effective_permissions.includes(permissionKey))
}
