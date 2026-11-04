'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import { updateUserOperationalRoleAction, updateUserPermissionsAction, syncAuthUsersToProfilesAction } from '@/lib/actions/users'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Shield01Icon,
  Search01Icon,
  CancelCircleIcon,
  Settings01Icon,
  UserIcon,
  CrownIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { mapProfileWithRole, PROFILE_WITH_ROLE_SELECT } from '@/lib/auth/profile'
import { notify } from '../ui/notifications'
import { buildPermissionModules, countCatalogPermissions, getPermissionControlState, setPermissionKeys } from './permission-editor-model'

export interface PermissionItem {
  key: string
  label: string
  description: string
  category: 'Comercial' | 'Gestão de Projetos' | 'Orçamentos' | 'Conteúdo & Website' | 'Configurações' | 'Financeiro' | 'Fiscal'
}

export const TAB_PERMISSION_KEYS: PermissionItem[] = [
  // Gestão de Projetos
  {
    key: 'client_projects.view',
    label: 'Visualizar Módulo de Projetos',
    description: 'Permite acessar a aba e a lista de Projetos de Clientes.',
    category: 'Gestão de Projetos',
  },
  {
    key: 'client_projects.view_all',
    label: 'Visualizar Todos os Projetos da Equipe',
    description: 'Permite visualizar projetos que não foram atribuídos ao próprio usuário.',
    category: 'Gestão de Projetos',
  },
  {
    key: 'client_projects.view_assigned',
    label: 'Visualizar Projetos Atribuídos',
    description: 'Permite visualizar projetos atribuídos ao usuário. Não restringe a permissão de visualizar todos os projetos.',
    category: 'Gestão de Projetos',
  },
  {
    key: 'client_projects.create',
    label: 'Criar Novos Projetos de Clientes',
    description: 'Permite cadastrar novos projetos no painel.',
    category: 'Gestão de Projetos',
  },
  {
    key: 'client_projects.edit',
    label: 'Editar Projetos de Clientes',
    description: 'Permite alterar dados, escopo, links, arquivos e briefing dos projetos.',
    category: 'Gestão de Projetos',
  },
  {
    key: 'client_projects.delete',
    label: 'Excluir Projetos de Clientes',
    description: 'Permite remover projetos permanentemente do sistema.',
    category: 'Gestão de Projetos',
  },
  {
    key: 'client_projects.assign_responsible',
    label: 'Atribuir Responsável por Projeto',
    description: 'Permite alterar quem é o usuário responsável por um projeto.',
    category: 'Gestão de Projetos',
  },
  {
    key: 'kanban_board.view',
    label: 'Visualizar Quadro Kanban',
    description: 'Permite acessar a aba e a visualização em fluxo do Quadro Kanban.',
    category: 'Gestão de Projetos',
  },
  {
    key: 'client_projects.move_kanban',
    label: 'Mover Cards no Kanban',
    description: 'Permite arrastar e alterar a etapa Kanban dos projetos.',
    category: 'Gestão de Projetos',
  },

  // Orçamentos
  {
    key: 'pricing.view',
    label: 'Visualizar Calculadora de Precificação',
    description: 'Permite acessar a ferramenta de cálculo de orçamentos.',
    category: 'Orçamentos',
  },
  {
    key: 'pricing.save_quote',
    label: 'Salvar e Converter Orçamentos',
    description: 'Permite salvar novos orçamentos e convertê-los em projetos.',
    category: 'Orçamentos',
  },
  {
    key: 'pricing.manage_settings',
    label: 'Gerenciar Configurações de Preço Base',
    description: 'Permite alterar taxas base, horas e parâmetros de precificação.',
    category: 'Orçamentos',
  },
  {
    key: 'quotes_history.view',
    label: 'Visualizar Histórico de Orçamentos',
    description: 'Permite consultar o histórico de orçamentos gerados e salvos.',
    category: 'Orçamentos',
  },

  // Conteúdo & Website
  {
    key: 'portfolio.view',
    label: 'Visualizar Portfólio da Home',
    description: 'Permite consultar os cases cadastrados para o site principal.',
    category: 'Conteúdo & Website',
  },
  {
    key: 'portfolio.create',
    label: 'Criar Cases no Portfólio',
    description: 'Permite cadastrar novos trabalhos e cases na home.',
    category: 'Conteúdo & Website',
  },
  {
    key: 'portfolio.edit',
    label: 'Editar Cases no Portfólio',
    description: 'Permite modificar informações dos cases exibidos no site.',
    category: 'Conteúdo & Website',
  },
  {
    key: 'portfolio.delete',
    label: 'Excluir Cases do Portfólio',
    description: 'Permite remover cases do portfólio da home.',
    category: 'Conteúdo & Website',
  },

  // Configurações
  {
    key: 'users.view',
    label: 'Visualizar Equipe e Usuários',
    description: 'Permite acessar o painel de gestão de membros e cargos.',
    category: 'Configurações',
  },
  {
    key: 'users.create',
    label: 'Criar Novos Usuários na Equipe',
    description: 'Permite cadastrar novos membros com acesso ao painel.',
    category: 'Configurações',
  },
  {
    key: 'users.edit',
    label: 'Editar Dados de Usuários',
    description: 'Permite alterar informações cadastrais dos usuários da equipe.',
    category: 'Configurações',
  },
  {
    key: 'users.manage_roles',
    label: 'Alterar Cargos Operacionais',
    description: 'Permite alterar a função operacional do usuário, sem modificar suas permissões.',
    category: 'Configurações',
  },
  // Financeiro
  {
    key: 'finance.view',
    label: 'Visualizar Módulo Financeiro',
    description: 'Permite acessar a aba Financeiro no painel.',
    category: 'Financeiro',
  },
  {
    key: 'finance.view_values',
    label: 'Visualizar Valores e Faturamento',
    description: 'Permite ver os valores em R$ nos cards e relatórios do Financeiro.',
    category: 'Financeiro',
  },
  {
    key: 'finance.view_payments',
    label: 'Visualizar Tabela de Pagamentos',
    description: 'Permite consultar o histórico detalhado de transações financeiras.',
    category: 'Financeiro',
  },
  {
    key: 'commissions.view',
    label: 'Visualizar Módulo de Comissões',
    description: 'Permite acessar a aba e o relatório de comissões de funcionários.',
    category: 'Financeiro',
  },
  {
    key: 'commissions.view_values',
    label: 'Visualizar Valores de Comissões',
    description: 'Permite ver os valores calculados de comissão em R$.',
    category: 'Financeiro',
  },
  {
    key: 'commissions.manage_rules',
    label: 'Configurar Regras de Comissão',
    description: 'Permite cadastrar e alterar percentuais e regras por tipo de projeto.',
    category: 'Financeiro',
  },
  {
    key: 'commissions.register_payment',
    label: 'Registrar Pagamento de Comissões',
    description: 'Permite dar baixa e registrar o pagamento mensal das comissões.',
    category: 'Financeiro',
  },
  { key: 'prospecting.view', label: 'Visualizar Prospecção', description: 'Acessar campanhas, leads, auditorias e scores de Prospecção.', category: 'Comercial' },
  { key: 'prospecting.manage', label: 'Gerenciar Prospecção', description: 'Criar campanhas, repetir etapas e alterar status comerciais. Requer visualizar Prospecção.', category: 'Comercial' },
  // Comercial / Leads
  {
    key: 'leads.view',
    label: 'Visualizar Módulo de Leads',
    description: 'Permite acessar a aba e a gestão comercial de leads.',
    category: 'Comercial',
  },
  {
    key: 'leads.view_all',
    label: 'Visualizar Todos os Leads',
    description: 'Permite ver leads de todos os comerciais (desativa restrição Meus Leads).',
    category: 'Comercial',
  },
  {
    key: 'leads.create',
    label: 'Cadastrar Leads Manuais',
    description: 'Permite cadastrar novos leads manualmente pelo painel.',
    category: 'Comercial',
  },
  {
    key: 'leads.edit',
    label: 'Editar Dados do Lead',
    description: 'Permite alterar contatos, observações e dados do lead.',
    category: 'Comercial',
  },
  {
    key: 'leads.assign',
    label: 'Atribuir Comercial Responsável',
    description: 'Permite alterar o usuário comercial responsável pelo lead.',
    category: 'Comercial',
  },
  {
    key: 'leads.change_status',
    label: 'Alterar Status do Lead',
    description: 'Permite mudar status (Novo, Em contato, Fechado, Perdido).',
    category: 'Comercial',
  },
  {
    key: 'leads.create_quote',
    label: 'Criar Orçamento a partir do Lead',
    description: 'Permite direcionar o lead para a calculadora de orçamentos.',
    category: 'Comercial',
  },
  {
    key: 'leads.delete',
    label: 'Excluir Registros de Leads',
    description: 'Permite remover registros de leads do sistema.',
    category: 'Comercial',
  },
]

interface PermissionCheckboxProps {
  checked: boolean | 'mixed'
  onCheckedChange: (checked: boolean) => void
  id: string
  label: string
  description: string
  isDarkMode: boolean
}

function PermissionCheckbox({ checked, onCheckedChange, id, label, description, isDarkMode }: PermissionCheckboxProps) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={`${id}-description`}
      title={description}
      onClick={() => onCheckedChange(checked !== true)}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
        checked !== false
          ? isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
          : isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
          checked !== false ? 'bg-[#2E3E4F] border-slate-500 text-white' : isDarkMode ? 'border-slate-500' : 'border-slate-300'
        )}
      >
        {checked === true ? <HugeiconsIcon icon={Tick01Icon} className="h-3 w-3" strokeWidth={2} /> : checked === 'mixed' ? <span className="h-0.5 w-2 bg-white" /> : null}
      </span>
      <span className="font-medium">{label}</span>
      {checked === 'mixed' && <span className={cn('ml-auto text-[10px]', isDarkMode ? 'text-amber-400' : 'text-amber-600')}>Parcial</span>}
      <span id={`${id}-description`} className="sr-only">{description}</span>
    </button>
  )
}

interface UsersPermissionsTabProps {
  currentUserId?: string
  canEditUser?: boolean
  canManageRoles?: boolean
  canManagePermissions?: boolean
  onProfilePermissionsUpdated?: () => void
  isDarkMode?: boolean
}

interface TeamPermissionSnapshot {
  user_id: string
  effective_permissions: string[]
  permission_overrides: Record<string, boolean>
  role_permissions: string[]
}

interface TeamRole {
  id: string
  name: string
  slug: string
}

// Keep the canonical authorization read unchanged; operational labels are a separate relation.
const TEAM_PROFILE_WITH_ROLES_SELECT = `${PROFILE_WITH_ROLE_SELECT},operational_role_id,operational_role:roles!profiles_operational_role_id_fkey(id,name,slug)`

interface TeamUserProfile extends UserProfileWithRole {
  operational_role_id: string | null
  operational_role_name: string | null
  operational_role_slug: string
}

function operationErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

interface PermissionCatalogRecord {
  permission_key: string
  description?: string | null
}

function permissionItemFromCatalog(permission: PermissionCatalogRecord): PermissionItem {
  const existing = TAB_PERMISSION_KEYS.find((item) => item.key === permission.permission_key)
  if (existing) return existing
  const [module, action] = permission.permission_key.split('.')
  const moduleLabels: Record<string, string> = {
    contracts: 'Contratos', payments: 'Pagamentos', users: 'Equipe', client_projects: 'Projetos',
    whatsapp: 'WhatsApp', dashboard: 'Dashboard', pricing: 'Precificação', portfolio: 'Portfólio', fiscal: 'Fiscal',
    leads: 'Leads', finance: 'Financeiro', commissions: 'Comissões', audit: 'Auditoria',
  }
  const actionLabels: Record<string, string> = {
    view: 'Visualizar', create: 'Criar', edit: 'Editar', delete: 'Excluir', generate: 'Gerar',
    download: 'Baixar arquivos', copy_link: 'Copiar link', check_status: 'Consultar status',
    view_financial_data: 'Visualizar dados financeiros', edit_base_value: 'Alterar valor aprovado',
    release_uncertainty: 'Resolver envio incerto', manage_permissions: 'Gerenciar permissões',
    activate: 'Ativar usuários', reset_password: 'Redefinir senha', reorder: 'Reordenar',
    publish: 'Publicar', upload_files: 'Enviar arquivos', delete_files: 'Excluir arquivos',
    manage_participants: 'Gerenciar participantes', change_status: 'Alterar status', use: 'Utilizar',
    view_values: 'Visualizar valores', view_all: 'Visualizar todos',
    assign_users: 'Atribuir responsável (permissão legada)', view_history: 'Visualizar histórico (permissão legada)',
    issue: 'Emitir NFS-e', retry: 'Reprocessar emissão', cancel: 'Cancelar NFS-e', manage_settings: 'Gerenciar configurações',
  }
  const categories: Record<string, PermissionItem['category']> = {
    prospecting: 'Comercial', leads: 'Comercial', whatsapp: 'Comercial',
    client_projects: 'Gestão de Projetos', kanban_board: 'Gestão de Projetos', contracts: 'Gestão de Projetos',
    pricing: 'Orçamentos', quotes: 'Orçamentos', quotes_history: 'Orçamentos',
    portfolio: 'Conteúdo & Website', payments: 'Financeiro', finance: 'Financeiro', commissions: 'Financeiro',
    fiscal: 'Fiscal',
  }
  return {
    key: permission.permission_key,
    label: `${moduleLabels[module] || module}: ${actionLabels[action] || action || permission.permission_key}`,
    description: permission.description || 'Define o acesso a este recurso do sistema.',
    category: categories[module] || 'Configurações',
  }
}

export function UsersPermissionsTab({
  canManageRoles = true,
  canManagePermissions = true,
  onProfilePermissionsUpdated,
  isDarkMode = false,
}: UsersPermissionsTabProps) {
  const profileReadVersionRef = useRef(0)
  const profileSnapshotsRef = useRef<Record<string, Record<string, unknown>>>({})
  const [userList, setUserList] = useState<TeamUserProfile[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('todos')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionCatalogRecord[]>([])
  const [roles, setRoles] = useState<TeamRole[]>([])
  const [pendingRoleUpdates, setPendingRoleUpdates] = useState<string[]>([])
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)

  const fetchRealUsers = useCallback(async (syncMissingProfiles = false) => {
    const readVersion = ++profileReadVersionRef.current
    setIsLoading(true)
    setFetchError(null)

    try {
      // Sync auth users to profiles first if missing
      if (syncMissingProfiles) {
        try {
          const result = await syncAuthUsersToProfilesAction()
          if (!result.success) notify.error(`Erro ao sincronizar usuários: ${result.message || 'Tente novamente.'}`)
        } catch (error) {
          notify.error(operationErrorMessage(error, 'Não foi possível sincronizar os usuários.'))
        }
      }

      const supabase = createClient()
      const [
        { data, error },
        { data: permissionSnapshots, error: permissionsError },
        { data: permissions, error: catalogError },
        { data: roleCatalog, error: rolesError },
      ] = await Promise.all([
        supabase.from('profiles').select(TEAM_PROFILE_WITH_ROLES_SELECT).order('created_at', { ascending: true }),
        supabase.rpc('get_team_permissions'),
        supabase.from('permissions').select('permission_key,description'),
        supabase.from('roles').select('id,name,slug').order('name', { ascending: true }),
      ])

      if (readVersion !== profileReadVersionRef.current) return

      const readError = error || permissionsError || catalogError || rolesError
      if (readError) {
        console.error('Error fetching user profiles or permissions:', readError)
        const message = `Erro ao carregar usuários: ${readError.message}`
        setFetchError(message)
        notify.error(message)
        setUserList([])
        return
      }

      const isPermissionList = (value: unknown): value is string[] => Array.isArray(value) &&
        value.every((key) => typeof key === 'string')
      if (!Array.isArray(permissions) || permissions.length === 0 ||
          permissions.some((permission) => typeof permission.permission_key !== 'string') ||
          !Array.isArray(permissionSnapshots) || permissionSnapshots.some((snapshot: TeamPermissionSnapshot) =>
            typeof snapshot.user_id !== 'string' || !isPermissionList(snapshot.effective_permissions) ||
            !isPermissionList(snapshot.role_permissions) || !snapshot.permission_overrides ||
            typeof snapshot.permission_overrides !== 'object' || Array.isArray(snapshot.permission_overrides) ||
            Object.values(snapshot.permission_overrides).some((allowed) => typeof allowed !== 'boolean')
          )) {
        throw new Error('Não foi possível validar o catálogo e as permissões da equipe.')
      }

      const snapshots = new Map<string, TeamPermissionSnapshot>(
        (permissionSnapshots || []).map((snapshot: TeamPermissionSnapshot) => [snapshot.user_id, snapshot])
      )
      setPermissionCatalog(permissions)
      setRoles(roleCatalog || [])
      profileSnapshotsRef.current = Object.fromEntries((data || []).map((profile) => [profile.user_id, profile]))
      setUserList((data || []).map((profile) => {
        const snapshot = snapshots.get(profile.user_id)
        const related = profile.operational_role
        const candidate = Array.isArray(related) ? related.length === 1 ? related[0] : null : related
        const operationalRole = candidate?.id === profile.operational_role_id ? candidate : null
        return {
          ...mapProfileWithRole(profile, snapshot?.effective_permissions || [], snapshot),
          operational_role_id: profile.operational_role_id ?? null,
          operational_role_name: operationalRole?.name ?? null,
          operational_role_slug: operationalRole?.slug ?? '',
        }
      }))
    } catch (e: unknown) {
      if (readVersion !== profileReadVersionRef.current) return
      console.error('Could not fetch user profiles:', e)
      const message = `Erro de conexão: ${operationErrorMessage(e, 'Falha ao conectar com o Supabase.')}`
      setFetchError(message)
      notify.error(message)
      setUserList([])
    } finally {
      if (readVersion === profileReadVersionRef.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    window.queueMicrotask(() => { if (!cancelled) void fetchRealUsers(true) })
    const supabase = createClient()
    const refreshUsers = () => { void fetchRealUsers() }
    const channel = supabase
      .channel('team_profile_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          const previous = payload.eventType === 'UPDATE'
            ? profileSnapshotsRef.current[payload.new.user_id]
            : undefined
          const keys = ['role_id', 'operational_role_id', 'is_active', 'full_name', 'email'] as const
          if (payload.eventType !== 'UPDATE' || !previous || keys.some((key) =>
            JSON.stringify(payload.new[key]) !== JSON.stringify(previous[key])
          )) refreshUsers()
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roles' }, refreshUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'permissions' }, refreshUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'role_permissions' }, refreshUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_permissions' }, refreshUsers)
      .subscribe()

    window.addEventListener('focus', refreshUsers)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refreshUsers)
      void supabase.removeChannel(channel)
    }
  }, [fetchRealUsers])

  // Permission Matrix Edit Modal State
  const [editingUserPerms, setEditingUserPerms] = useState<UserProfileWithRole | null>(null)
  const [configuredPermissions, setConfiguredPermissions] = useState<Record<string, boolean>>({})
  const permissionItems = [...new Map(permissionCatalog.map((permission) => [permission.permission_key, permissionItemFromCatalog(permission)])).values()]
  const permissionModules = buildPermissionModules(permissionItems)

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const displayedRole = u.role_slug === 'admin' || u.operational_role_slug === 'admin' ? 'admin' : u.operational_role_slug
    const matchesRole = roleFilter === 'todos' || displayedRole === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRoleChange = async (userId: string, newRoleSlug: string) => {
    const targetUser = userList.find((user) => user.user_id === userId)
    if (newRoleSlug === 'admin' || targetUser?.role_slug === 'admin' || targetUser?.operational_role_slug === 'admin') {
      notify.error('O cargo Administrador é protegido e só pode ser atribuído ou alterado diretamente no Supabase.')
      return
    }
    if (pendingRoleUpdates.includes(userId)) return
    setPendingRoleUpdates((previous) => [...previous, userId])
    try {
      const result = await updateUserOperationalRoleAction(userId, newRoleSlug)
      if (!result.success) {
        notify.error(`Erro ao alterar cargo operacional: ${result.message}`)
        return
      }
      await fetchRealUsers()
      const roleName = roles.find((role) => role.slug === newRoleSlug)?.name || 'Sem cargo operacional'
      notify.success(`Cargo operacional atualizado para ${roleName}.`)
    } catch (error) {
      notify.error(operationErrorMessage(error, 'Não foi possível alterar o cargo operacional.'))
    } finally {
      setPendingRoleUpdates((previous) => previous.filter((id) => id !== userId))
    }
  }

  const handleOpenPermissionsModal = (user: UserProfileWithRole) => {
    setEditingUserPerms(user)
    const configured = Object.fromEntries((user.role_permissions || []).map((key) => [key, true]))
    setConfiguredPermissions({ ...configured, ...user.permission_overrides })
  }

  const handleTogglePermissionKeys = (keys: readonly string[], enabled: boolean) => {
    setConfiguredPermissions((previous) => setPermissionKeys(previous, keys, enabled, permissionItems))
  }

  const handleSelectAllGlobal = (select: boolean) => {
    handleTogglePermissionKeys(permissionItems.map((item) => item.key), select)
  }

  const handleSelectCategory = (category: string, select: boolean) => {
    handleTogglePermissionKeys(permissionItems.filter((item) => item.category === category).map((item) => item.key), select)
  }

  const handleSavePermissions = async () => {
    if (!editingUserPerms || isSavingPermissions) return

    const latestUser = userList.find((user) => user.user_id === editingUserPerms.user_id)
    const normalizedOverrides = (value: Record<string, boolean> = {}) =>
      JSON.stringify(Object.entries(value).sort(([first], [second]) => first.localeCompare(second)))
    if (!latestUser || latestUser.role_id !== editingUserPerms.role_id ||
        JSON.stringify([...(latestUser.role_permissions || [])].sort()) !==
          JSON.stringify([...(editingUserPerms.role_permissions || [])].sort()) ||
        normalizedOverrides(latestUser.permission_overrides) !== normalizedOverrides(editingUserPerms.permission_overrides)) {
      setEditingUserPerms(null)
      notify.info('O cargo de acesso ou as permissões deste usuário mudaram enquanto o editor estava aberto. Abra as permissões novamente para usar os dados atuais.')
      return
    }

    const targetId = editingUserPerms.user_id || editingUserPerms.id
    const rolePermissions = new Set(editingUserPerms.role_permissions || [])
    const overrides = { ...editingUserPerms.permission_overrides }
    permissionItems.forEach(({ key }) => {
      const enabled = configuredPermissions[key] === true
      if (enabled === rolePermissions.has(key)) delete overrides[key]
      else overrides[key] = enabled
    })
    setIsSavingPermissions(true)
    try {
      const result = await updateUserPermissionsAction(targetId, overrides)
      if (!result.success) {
        notify.error(`Erro ao salvar permissões: ${result.message}`)
        return
      }
      await fetchRealUsers()
      setEditingUserPerms(null)
      onProfilePermissionsUpdated?.()
      notify.success(`Permissões individuais de ${editingUserPerms.full_name} salvas com sucesso!`)
    } catch (error) {
      notify.error(operationErrorMessage(error, 'Não foi possível salvar as permissões.'))
    } finally {
      setIsSavingPermissions(false)
    }
  }

  return (
    <div className={cn('space-y-6 font-sans transition-colors', isDarkMode ? 'text-white' : 'text-slate-900')}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={cn('text-xl font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>
            Gerenciamento de Equipe e Permissões
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cargos operacionais e configuração individual de acesso ao sistema.
          </p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <HugeiconsIcon icon={Search01Icon} className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-colors',
              isDarkMode
                ? 'bg-[#1A1E26] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#2E3E4F]'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#2E3E4F]'
            )}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[{ slug: 'todos', name: 'Todos' }, ...roles].map((role) => (
            <button
              key={role.slug}
              type="button"
              onClick={() => setRoleFilter(role.slug)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer border',
                roleFilter === role.slug
                  ? 'bg-white dark:bg-[#202530] text-slate-900 dark:text-white shadow-2xs font-semibold border-slate-300 dark:border-slate-700'
                  : isDarkMode
                    ? 'bg-[#1A1E26] text-slate-400 hover:text-white border-slate-800'
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 border-slate-200/60'
              )}
            >
              {role.name}
            </button>
          ))}
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={cn('border-b font-medium uppercase tracking-wider text-[11px]', isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200/80 text-slate-400')}>
              <th className="py-2.5 px-3 whitespace-nowrap">Usuário</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Cargo operacional</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Status das Permissões</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody className={cn('divide-y font-normal', isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100')}>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#2E3E4F] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Carregando usuários...</span>
                  </div>
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <HugeiconsIcon icon={CancelCircleIcon} className="w-7 h-7 text-rose-400" strokeWidth={1.5} />
                    <span className="text-xs text-rose-600 font-semibold">{fetchError}</span>
                    <button
                      type="button"
                      onClick={() => { void fetchRealUsers() }}
                      className="mt-2 px-3 py-1 rounded-lg bg-[#2E3E4F] text-white text-xs font-medium hover:bg-[#182331] transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} className="w-7 h-7 text-slate-300" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-slate-500">
                      {userList.length === 0 ? 'Nenhum usuário cadastrado.' : 'Nenhum resultado para o filtro aplicado.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const activePermCount = user.is_active ? countCatalogPermissions(user.effective_permissions, permissionItems) : 0
                const hasFullAccess = user.is_active && permissionItems.length > 0 && activePermCount === permissionItems.length

                return (
                  <tr key={user.id} className={cn('transition-colors', isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/80')}>
                    <td className="p-3.5">
                      <div className={cn('font-semibold text-xs flex items-center gap-1.5', isDarkMode ? 'text-white' : 'text-slate-900')}>
                        {user.role_slug === 'admin' && <HugeiconsIcon icon={CrownIcon} className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />}
                        <span>{user.full_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                    </td>

                    <td className="p-3.5">
                      {user.role_slug === 'admin' || user.operational_role_slug === 'admin' ? (
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border', isDarkMode ? 'bg-amber-950/40 text-amber-300 border-amber-800/60' : 'bg-amber-50 text-amber-700 border-amber-200/60')}>
                          <HugeiconsIcon icon={CrownIcon} className="w-3 h-3 text-amber-500" strokeWidth={2} />
                          <span>Administrador</span>
                        </span>
                      ) : canManageRoles ? (
                        <select
                          aria-label={`Cargo operacional de ${user.full_name}`}
                          value={user.operational_role_slug}
                          disabled={pendingRoleUpdates.includes(user.user_id)}
                          onChange={(e) => { void handleRoleChange(user.user_id, e.target.value) }}
                          className={cn(
                            'px-2 py-1 rounded-md text-[11px] font-medium border outline-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait',
                            isDarkMode
                              ? 'bg-[#1C202B] border-slate-700 text-slate-300'
                              : 'bg-white border-slate-200 text-slate-700'
                          )}
                        >
                          <option value="">Sem cargo operacional</option>
                          {roles.filter((role) => role.slug !== 'admin').map((role) => <option key={role.id} value={role.slug}>{role.name}</option>)}
                        </select>
                      ) : (
                        <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border', isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200/60')}>
                          {user.operational_role_name || 'Sem cargo operacional'}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {hasFullAccess ? (
                        <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60 inline-flex items-center gap-1">
                          <HugeiconsIcon icon={CrownIcon} className="w-3 h-3 text-amber-500" strokeWidth={2} />
                          <span>Acesso Total</span>
                        </span>
                      ) : activePermCount > 0 ? (
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                          {activePermCount} de {permissionItems.length} permissões ativas
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                          {user.is_active ? 'Sem permissões ativas' : 'Sem acesso (inativo)'}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canManagePermissions && (
                          <button
                            type="button"
                            onClick={() => handleOpenPermissionsModal(user)}
                            className={cn(
                              'p-1.5 rounded-md transition-colors cursor-pointer border',
                              isDarkMode
                                ? 'bg-[#1C202B] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            )}
                            title="Editar Ações de Permissão"
                          >
                            <HugeiconsIcon icon={Settings01Icon} className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* INDIVIDUAL PERMISSION EDITOR */}
      {editingUserPerms && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="individual-permissions-title"
            className={cn('rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] flex flex-col', isDarkMode ? 'bg-[#1A1E26]' : 'bg-white')}
          >
            <div className={cn('flex items-start justify-between border-b pb-3 gap-3', isDarkMode ? 'border-slate-700' : 'border-slate-100')}>
              <div>
                <h3 id="individual-permissions-title" className={cn('text-base font-extrabold flex items-center gap-2', isDarkMode ? 'text-white' : 'text-[#0C1D36]')}>
                  <HugeiconsIcon icon={Shield01Icon} className="w-4.5 h-4.5 shrink-0" strokeWidth={1.5} />
                  <span>Permissões Individuais: {editingUserPerms.full_name}</span>
                </h3>
                <p className={cn('text-xs mt-1', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                  Cargo de acesso: <strong>{editingUserPerms.role_name || editingUserPerms.role_slug || 'Sem cargo'}</strong>. As alterações definem exceções individuais ao cargo.
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar permissões"
                onClick={() => setEditingUserPerms(null)}
                className={cn('font-bold p-1 rounded-lg text-sm', isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-[#0C1D36]')}
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className={cn('text-[11px] leading-relaxed', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                Visualizar permite leitura. Gerenciar inclui visualização e operações comuns. Ações sensíveis e escopos de acesso permanecem separados. Parcial preserva a configuração granular atual.
              </p>
              <div className={cn('flex items-center justify-between gap-2 flex-wrap p-2.5 rounded-xl border', isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200')}>
                <span className={cn('text-[11px] font-semibold', isDarkMode ? 'text-slate-300' : 'text-slate-700')}>Controles Globais:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSelectAllGlobal(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#2E3E4F] text-white text-[11px] font-semibold hover:bg-[#182331] transition-colors"
                  >
                    Selecionar Todas as Permissões
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllGlobal(false)}
                    className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors', isDarkMode ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300')}
                  >
                    Desmarcar Todas
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 text-xs flex-1">
              {(['Comercial', 'Gestão de Projetos', 'Orçamentos', 'Conteúdo & Website', 'Financeiro', 'Fiscal', 'Configurações'] as const).map((category) => {
                const modules = permissionModules.filter((module) => module.category === category)
                if (modules.length === 0) return null
                const categoryKeys = permissionItems.filter((item) => item.category === category)
                const allCategorySelected = categoryKeys.every((item) => configuredPermissions[item.key] === true)

                return (
                  <section key={category} aria-label={category} className="space-y-2">
                    <div className={cn('flex items-center justify-between border-b pb-2', isDarkMode ? 'border-slate-700' : 'border-slate-200')}>
                      <h4 className={cn('font-bold uppercase text-[10px] tracking-wider', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>{category}</h4>
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(category, !allCategorySelected)}
                        className={cn('text-[10px] font-semibold hover:underline', isDarkMode ? 'text-slate-300' : 'text-[#2E3E4F]')}
                      >
                        {allCategorySelected ? 'Desmarcar Categoria' : 'Selecionar Todos'}
                      </button>
                    </div>
                    {modules.map((module) => (
                      <div key={module.id} className={cn('rounded-xl border p-3 space-y-2', isDarkMode ? 'border-slate-700 bg-slate-800/20' : 'border-slate-200 bg-white')}>
                        <h5 className={cn('text-xs font-semibold', isDarkMode ? 'text-white' : 'text-[#0C1D36]')}>{module.label}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {module.controls.map((control) => (
                            <div key={control.id} className={cn(control.critical && 'sm:col-span-2')}>
                              <PermissionCheckbox
                                id={`permission-${control.id}`}
                                checked={getPermissionControlState(control, configuredPermissions)}
                                onCheckedChange={(enabled) => handleTogglePermissionKeys(control.keys, enabled)}
                                label={control.label}
                                description={control.description}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                )
              })}
            </div>

            <div className={cn('flex items-center justify-between gap-3 flex-wrap pt-3 border-t', isDarkMode ? 'border-slate-700' : 'border-slate-100')}>
              <span className={cn('text-[11px] font-medium', isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                {countCatalogPermissions(configuredPermissions, permissionItems)} de {permissionItems.length} permissões técnicas configuradas
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUserPerms(null)}
                  className={cn('px-4 py-2 rounded-xl text-xs font-bold transition-colors', isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                  className="px-4 py-2 rounded-xl bg-[#2E3E4F] text-white text-xs font-bold hover:bg-[#182331] shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
                >
                  <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4" strokeWidth={2} />
                  <span>{isSavingPermissions ? 'Salvando permissões...' : 'Salvar Permissões no Supabase'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
