/** Presentation-only bundles. Authorization remains in Supabase's canonical resolver. */
export interface PermissionEditorItem {
  key: string
  label: string
  description: string
  category: string
}

export interface PermissionControl {
  id: string
  label: string
  description: string
  keys: string[]
  requiredKeys: string[]
  critical: boolean
}

export interface PermissionModule {
  id: string
  label: string
  category: string
  controls: PermissionControl[]
}

interface ModuleDefinition {
  id: string
  label: string
  controls: PermissionControl[]
}

function control(id: string, label: string, keys: string[], description: string, critical = false): PermissionControl {
  return { id, label, keys, requiredKeys: [], description, critical }
}

// Explicit, audited lists: never infer mutation grants from a prefix or role name.
const modules: ModuleDefinition[] = [
  { id: 'leads', label: 'Leads', controls: [
    control('leads.view', 'Visualizar Leads', ['leads.view'], 'Consultar os leads no escopo permitido.'),
    control('leads.manage', 'Gerenciar Leads', ['leads.create', 'leads.edit', 'leads.assign', 'leads.change_status', 'leads.create_quote'], 'Cadastrar, editar, atribuir e alterar status. Inclui acesso à precificação e criação de orçamentos.'),
    control('leads.view_all', 'Visualizar todos os Leads', ['leads.view_all'], 'Ampliar o escopo de consulta para os leads de toda a equipe.'),
    control('leads.delete', 'Excluir Leads', ['leads.delete'], 'Excluir registros de leads.', true),
  ] },
  { id: 'prospecting', label: 'Prospecção e conversas', controls: [
    control('prospecting.view', 'Visualizar Prospecção', ['prospecting.view'], 'Consultar campanhas, leads prospectados e conversas.'),
    control('prospecting.manage', 'Gerenciar Prospecção', ['prospecting.manage'], 'Criar campanhas, repetir etapas e alterar estados comerciais.'),
    control('whatsapp.release_uncertainty', 'Resolver envio incerto no WhatsApp', ['whatsapp.release_uncertainty'], 'Liberar a reconciliação de mensagens com envio incerto.', true),
  ] },
  { id: 'client_projects', label: 'Projetos de Clientes', controls: [
    control('client_projects.view', 'Visualizar Projetos', ['client_projects.view'], 'Consultar projetos no escopo permitido.'),
    control('client_projects.manage', 'Gerenciar Projetos', ['client_projects.create', 'client_projects.edit', 'client_projects.assign_responsible', 'client_projects.manage_participants', 'client_projects.move_kanban', 'client_projects.upload_files', 'client_projects.change_status'], 'Criar, editar, atribuir responsáveis e participantes, enviar arquivos e alterar estados no Kanban. Mantém a geração e inutilização de contratos já autorizadas por editar projetos.'),
    control('kanban_board.view', 'Visualizar Quadro Kanban', ['kanban_board.view'], 'Consultar os projetos acessíveis no quadro Kanban.'),
    control('client_projects.view_all', 'Visualizar todos os Projetos', ['client_projects.view_all'], 'Consultar também projetos de outros responsáveis.'),
    control('client_projects.view_assigned', 'Visualizar Projetos atribuídos', ['client_projects.view_assigned'], 'Consultar projetos atribuídos ou com participação. Não restringe a permissão de visualizar todos.'),
    control('client_projects.edit_base_value', 'Alterar valor aprovado dos Projetos', ['client_projects.edit_base_value'], 'Alterar o valor contratual aprovado.', true),
    control('client_projects.delete_files', 'Excluir arquivos dos Projetos', ['client_projects.delete_files'], 'Remover arquivos anexados aos projetos.', true),
    control('client_projects.delete', 'Excluir Projetos', ['client_projects.delete'], 'Remover projetos permanentemente.', true),
  ] },
  { id: 'pricing', label: 'Precificação e Orçamentos', controls: [
    control('pricing.view', 'Visualizar Precificação', ['pricing.view', 'quotes_history.view'], 'Consultar a calculadora e o histórico de orçamentos.'),
    control('pricing.manage', 'Gerenciar Orçamentos', ['pricing.use', 'pricing.save_quote'], 'Utilizar a calculadora, salvar orçamentos e gerar propostas. A conversão em projeto mantém as permissões próprias de Projetos.'),
    control('pricing.manage_settings', 'Alterar configurações de Precificação', ['pricing.manage_settings'], 'Alterar taxas, valores base e parâmetros de precificação.', true),
  ] },
  { id: 'portfolio', label: 'Portfólio', controls: [
    control('portfolio.view', 'Visualizar Portfólio', ['portfolio.view'], 'Consultar os cases cadastrados.'),
    control('portfolio.manage', 'Gerenciar Portfólio', ['portfolio.create', 'portfolio.edit', 'portfolio.reorder'], 'Cadastrar, editar e reordenar cases.'),
    control('portfolio.publish', 'Publicar Portfólio', ['portfolio.publish'], 'Autorizar a publicação de cases no site.', true),
    control('portfolio.delete', 'Excluir Portfólio', ['portfolio.delete'], 'Remover cases permanentemente.', true),
  ] },
  { id: 'contracts', label: 'Contratos', controls: [
    control('contracts.view', 'Visualizar Contratos', ['contracts.view', 'contracts.download'], 'Consultar contratos e baixar seus documentos.'),
    control('contracts.manage', 'Gerenciar Contratos', ['contracts.generate'], 'Gerar, enviar e inutilizar contratos dos projetos acessíveis, conforme as regras existentes.'),
  ] },
  { id: 'payments', label: 'Pagamentos', controls: [
    control('payments.view', 'Visualizar Pagamentos', ['payments.view', 'payments.copy_link'], 'Consultar cobranças e copiar seus links.'),
    control('payments.manage', 'Gerenciar Pagamentos', ['payments.create', 'payments.check_status'], 'Gerar links e atualizar a situação das cobranças nos projetos acessíveis. Inclui a consulta dos projetos e contratos necessários.'),
    control('payments.view_financial_data', 'Visualizar dados financeiros dos Pagamentos', ['payments.view_financial_data'], 'Consultar detalhes financeiros conforme a permissão existente.'),
  ] },
  { id: 'fiscal', label: 'Fiscal', controls: [
    control('fiscal.view', 'Visualizar Fiscal', ['fiscal.view'], 'Consultar notas fiscais e seus documentos.'),
    control('fiscal.manage', 'Gerenciar Fiscal', ['fiscal.issue', 'fiscal.retry'], 'Solicitar emissões e reprocessar solicitações fiscais com falha.'),
    control('fiscal.cancel', 'Cancelar NFS-e', ['fiscal.cancel'], 'Autorizar cancelamento conforme as regras fiscais e do provedor.', true),
    control('fiscal.manage_settings', 'Alterar configurações Fiscais', ['fiscal.manage_settings'], 'Alterar os dados e parâmetros fiscais do emitente.', true),
  ] },
  { id: 'finance', label: 'Financeiro', controls: [
    control('finance.view', 'Visualizar Financeiro', ['finance.view'], 'Consultar o módulo financeiro.'),
    control('finance.view_values', 'Visualizar valores do Financeiro', ['finance.view_values'], 'Consultar valores e faturamento.'),
    control('finance.view_payments', 'Visualizar transações do Financeiro', ['finance.view_payments'], 'Consultar o histórico de pagamentos.'),
  ] },
  { id: 'commissions', label: 'Comissões', controls: [
    control('commissions.view', 'Visualizar Comissões', ['commissions.view'], 'Consultar relatórios de comissões.'),
    control('commissions.view_values', 'Visualizar valores das Comissões', ['commissions.view_values'], 'Consultar os valores calculados de comissão.'),
    control('commissions.manage_rules', 'Alterar regras de Comissões', ['commissions.manage_rules'], 'Alterar percentuais e regras de cálculo.', true),
    control('commissions.register_payment', 'Registrar pagamento de Comissões', ['commissions.register_payment'], 'Dar baixa e registrar pagamentos de comissões.', true),
  ] },
  { id: 'users', label: 'Equipe', controls: [
    control('users.view', 'Visualizar Equipe', ['users.view'], 'Consultar os usuários e seus cargos.'),
    control('users.manage', 'Gerenciar Equipe', ['users.create', 'users.edit'], 'Cadastrar usuários e editar seus dados.'),
    control('users.activate', 'Ativar ou desativar usuários', ['users.activate'], 'Alterar a situação de acesso dos usuários.', true),
    control('users.reset_password', 'Redefinir senha de usuários', ['users.reset_password'], 'Autorizar a recuperação de acesso de usuários.', true),
    control('users.manage_roles', 'Alterar cargos operacionais', ['users.manage_roles'], 'Alterar a função operacional dos usuários, sem modificar suas permissões.', true),
    control('users.manage_permissions', 'Alterar permissões da Equipe', ['users.manage_permissions'], 'Alterar as exceções individuais de autorização.', true),
    control('users.delete', 'Excluir usuários', ['users.delete'], 'Remover usuários da equipe.', true),
  ] },
  { id: 'dashboard', label: 'Dashboard', controls: [
    control('dashboard.view', 'Visualizar Dashboard', ['dashboard.view'], 'Consultar o dashboard conforme as permissões dos dados exibidos.'),
  ] },
  { id: 'audit', label: 'Auditoria', controls: [
    control('audit.view', 'Visualizar Auditoria', ['audit.view'], 'Consultar o histórico de ações do sistema.'),
  ] },
]

// Only editor interactions apply these prerequisites. Opening or saving a legacy
// partial configuration does not silently grant or revoke unrelated permissions.
const prerequisites: Readonly<Record<string, readonly string[]>> = {
  'leads.create': ['leads.view'], 'leads.edit': ['leads.view'], 'leads.assign': ['leads.view'],
  'leads.change_status': ['leads.view'], 'leads.delete': ['leads.view'], 'leads.view_all': ['leads.view'],
  'leads.create_quote': ['leads.view', 'pricing.view', 'pricing.use', 'pricing.save_quote'],
  'prospecting.manage': ['prospecting.view'], 'whatsapp.release_uncertainty': ['prospecting.view'],
  'client_projects.create': ['client_projects.view'], 'client_projects.edit': ['client_projects.view'],
  'client_projects.assign_responsible': ['client_projects.view'], 'client_projects.assign_users': ['client_projects.view'],
  'client_projects.manage_participants': ['client_projects.view'], 'client_projects.move_kanban': ['client_projects.view', 'kanban_board.view'],
  'client_projects.upload_files': ['client_projects.view'], 'client_projects.change_status': ['client_projects.view'],
  'client_projects.delete': ['client_projects.view'], 'client_projects.delete_files': ['client_projects.view'],
  'client_projects.edit_base_value': ['client_projects.view'], 'client_projects.view_all': ['client_projects.view'],
  'client_projects.view_assigned': ['client_projects.view'], 'kanban_board.view': ['client_projects.view'],
  'pricing.use': ['pricing.view', 'quotes_history.view'], 'pricing.save_quote': ['pricing.view', 'quotes_history.view'],
  'pricing.manage_settings': ['pricing.view'], 'pricing.view_history': ['pricing.view'],
  'portfolio.create': ['portfolio.view'], 'portfolio.edit': ['portfolio.view'], 'portfolio.reorder': ['portfolio.view'],
  'portfolio.publish': ['portfolio.view'], 'portfolio.delete': ['portfolio.view'],
  'contracts.generate': ['contracts.view', 'contracts.download', 'client_projects.view'], 'contracts.download': ['contracts.view'],
  'payments.create': ['payments.view', 'payments.copy_link', 'client_projects.view', 'contracts.view'],
  'payments.check_status': ['payments.view', 'payments.copy_link', 'client_projects.view'], 'payments.copy_link': ['payments.view'],
  'payments.view_financial_data': ['payments.view'],
  'fiscal.issue': ['fiscal.view'], 'fiscal.retry': ['fiscal.view'], 'fiscal.cancel': ['fiscal.view'], 'fiscal.manage_settings': ['fiscal.view'],
  'finance.view_values': ['finance.view'], 'finance.view_payments': ['finance.view'],
  'commissions.view_values': ['commissions.view'], 'commissions.manage_rules': ['commissions.view'],
  'commissions.register_payment': ['commissions.view'],
  'users.create': ['users.view'], 'users.edit': ['users.view'], 'users.activate': ['users.view'],
  'users.reset_password': ['users.view'], 'users.manage_roles': ['users.view'],
  'users.manage_permissions': ['users.view'], 'users.delete': ['users.view'],
}

export function buildPermissionModules(items: readonly PermissionEditorItem[]): PermissionModule[] {
  const catalog = new Map(items.map(item => [item.key, item]))
  const represented = new Set<string>()
  const result: PermissionModule[] = []
  for (const definition of modules) {
    const controls = definition.controls.map(item => ({ ...item, keys: item.keys.filter(key => catalog.has(key)), requiredKeys: requiredKeysFor(item.keys, catalog) }))
      .filter(item => item.keys.length > 0)
    if (!controls.length) continue
    controls.forEach(item => item.keys.forEach(key => represented.add(key)))
    result.push({ ...definition, category: catalog.get(controls[0].keys[0])!.category, controls })
  }
  // Historical and future catalog entries stay individually configurable. No key
  // is hidden or treated as an implicit permission by a broad module wildcard.
  for (const item of catalog.values()) {
    if (represented.has(item.key)) continue
    const id = item.key.split('.')[0]
    let permissionModule = result.find(existing => existing.id === id)
    if (!permissionModule) {
      permissionModule = { id, label: id === 'kanban_board' ? 'Quadro Kanban' : id, category: item.category, controls: [] }
      result.push(permissionModule)
    }
    permissionModule.controls.push({ ...control(item.key, item.label, [item.key], item.description), requiredKeys: requiredKeysFor([item.key], catalog) })
  }
  return result
}

function requiredKeysFor(keys: readonly string[], catalog: ReadonlyMap<string, PermissionEditorItem>): string[] {
  const seen = new Set(keys.filter(key => catalog.has(key)))
  const pending = [...seen]
  for (let index = 0; index < pending.length; index++) {
    for (const key of prerequisites[pending[index]] || []) {
      if (catalog.has(key) && !seen.has(key)) { seen.add(key); pending.push(key) }
    }
  }
  return [...seen].filter(key => !keys.includes(key))
}

export function getPermissionControlState(control: Pick<PermissionControl, 'keys'> & Partial<Pick<PermissionControl, 'requiredKeys'>>, configured: Readonly<Record<string, boolean>>): boolean | 'mixed' {
  const enabled = control.keys.filter(key => configured[key] === true).length
  return enabled === 0 ? false : enabled === control.keys.length && (control.requiredKeys || []).every(key => configured[key] === true) ? true : 'mixed'
}

export function setPermissionKeys(configured: Readonly<Record<string, boolean>>, keys: readonly string[], enabled: boolean, items: readonly Pick<PermissionEditorItem, 'key'>[]): Record<string, boolean> {
  const catalog = new Set(items.map(item => item.key))
  const updated = { ...configured }
  const changed = new Set(keys.filter(key => catalog.has(key)))
  if (enabled) {
    const pending = [...changed]
    for (let index = 0; index < pending.length; index++) {
      for (const prerequisite of prerequisites[pending[index]] || []) {
        if (catalog.has(prerequisite) && !changed.has(prerequisite)) {
          changed.add(prerequisite)
          pending.push(prerequisite)
        }
      }
    }
  } else {
    // Removing read access also removes its dependent writes/scopes. This closure
    // runs only against the permissions deliberately changed in this interaction.
    let found = true
    while (found) {
      found = false
      for (const [key, required] of Object.entries(prerequisites)) {
        if (catalog.has(key) && !changed.has(key) && required.some(prerequisite => changed.has(prerequisite))) {
          changed.add(key)
          found = true
        }
      }
    }
  }
  changed.forEach(key => { updated[key] = enabled })
  return updated
}

export function countCatalogPermissions(keys: Iterable<string> | Readonly<Record<string, boolean>>, catalogue: readonly { key: string }[]): number {
  const supplied = typeof (keys as Iterable<string>)[Symbol.iterator] === 'function'
    ? new Set(keys as Iterable<string>)
    : new Set(Object.entries(keys).filter(([, enabled]) => enabled === true).map(([key]) => key))
  return new Set(catalogue.map(item => item.key).filter(key => supplied.has(key))).size
}
