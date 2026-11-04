import { MOCK_USER_PROFILE, MOCK_TEAM_DIRECTORY, MOCK_CLIENT_PROJECTS, MOCK_SAVED_QUOTES, MOCK_HOME_PROJECTS } from '@/components/admin/mock-crm-data'
import { TAB_PERMISSION_KEYS } from '@/components/admin/tabs/users-permissions-tab'

export function createClient() {
  const channelObj: any = {
    on: () => channelObj,
    subscribe: (cb?: any) => {
      if (typeof cb === 'function') cb('SUBSCRIBED')
      return channelObj
    },
    unsubscribe: () => {},
  }

  return {
    from: (table: string) => {
      let currentData: any[] = []
      if (table === 'profiles') {
        currentData = MOCK_TEAM_DIRECTORY.map((u) => ({
          ...u,
          operational_role_id: u.role_id,
          operational_role: { id: u.role_id, name: u.role_name, slug: u.role_slug },
        }))
      } else if (table === 'projects') {
        currentData = MOCK_HOME_PROJECTS
      } else if (table === 'client_projects') {
        currentData = MOCK_CLIENT_PROJECTS
      } else if (table === 'quotes') {
        currentData = MOCK_SAVED_QUOTES
      } else if (table === 'payments') {
        currentData = []
      } else if (table === 'contracts') {
        currentData = []
      } else if (table === 'roles') {
        currentData = [
          { id: 'role-1', name: 'Administrador Master', slug: 'admin' },
          { id: 'role-2', name: 'Designer UI/UX', slug: 'designer' },
          { id: 'role-3', name: 'Desenvolvedor Full Stack', slug: 'developer' },
        ]
      } else if (table === 'permissions') {
        currentData = TAB_PERMISSION_KEYS.map((p) => ({
          permission_key: p.key,
          label: p.label,
          category: p.category,
          description: p.description,
        }))
      }

      const chain: any = {
        select: (cols: string = '*') => chain,
        order: (col: string, opts?: any) => chain,
        eq: (col: string, val: any) => chain,
        neq: (col: string, val: any) => chain,
        in: (col: string, vals: any[]) => chain,
        maybeSingle: async () => ({
          data: currentData[0] || null,
          error: null,
        }),
        single: async () => ({
          data: currentData[0] || null,
          error: null,
        }),
        then: (resolve: any) => resolve({ data: currentData, error: null }),
        insert: async (data: any) => ({ data, error: null }),
        update: (data: any) => chain,
        delete: () => chain,
      }
      return chain
    },
    rpc: async (fn: string, params?: any) => {
      if (fn === 'get_team_directory') {
        return { data: MOCK_TEAM_DIRECTORY, error: null }
      }
      if (fn === 'get_my_permissions') {
        return { data: MOCK_USER_PROFILE.effective_permissions, error: null }
      }
      if (fn === 'get_team_permissions' || fn === 'get_team_permissions_catalog') {
        const snapshots = MOCK_TEAM_DIRECTORY.map((u) => ({
          user_id: u.user_id,
          effective_permissions: MOCK_USER_PROFILE.effective_permissions,
          role_permissions: MOCK_USER_PROFILE.effective_permissions,
          permission_overrides: {},
        }))
        return {
          data: snapshots,
          error: null,
        }
      }
      return { data: null, error: null }
    },
    channel: () => channelObj,
    removeChannel: () => {},
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: MOCK_USER_PROFILE.user_id,
            email: MOCK_USER_PROFILE.email,
          },
        },
        error: null,
      }),
      signOut: async () => {},
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  } as any
}
