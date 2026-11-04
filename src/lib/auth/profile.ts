import type { UserProfileWithRole } from './permissions'

export const PROFILE_WITH_ROLE_SELECT =
  'id,user_id,full_name,email,role_id,is_active,roles!profiles_role_id_fkey(id,name,slug)'

export interface ProfileRoleRecord {
  id: string
  name: string
  slug: string
}

export interface ProfileWithRoleRecord {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  role_id: string | null
  is_active: boolean | null
  roles: ProfileRoleRecord | readonly ProfileRoleRecord[] | null
}

/** Normalize only the role related to profiles.role_id, without Auth metadata or email fallbacks. */
export interface PermissionSnapshotDetails {
  permission_overrides?: Record<string, boolean>
  role_permissions?: readonly string[]
}

export function mapProfileWithRole(
  profile: ProfileWithRoleRecord,
  effectivePermissions: readonly string[] = [],
  details: PermissionSnapshotDetails = {},
): UserProfileWithRole {
  const related = profile.roles
  const candidate = !related
    ? null
    : 'slug' in related
      ? related
      : related.length === 1
        ? related[0]
        : null
  const role = candidate?.id === profile.role_id ? candidate : null

  return {
    id: profile.id,
    user_id: profile.user_id,
    full_name: profile.full_name || profile.email?.split('@')[0] || 'Usuário',
    email: profile.email ?? '',
    role_id: profile.role_id,
    role_name: role?.name ?? null,
    role_slug: role?.slug ?? '',
    is_active: profile.is_active === true,
    effective_permissions: profile.is_active === true ? [...new Set(effectivePermissions)] : [],
    permission_overrides: details.permission_overrides ? { ...details.permission_overrides } : {},
    role_permissions: details.role_permissions ? [...details.role_permissions] : [],
  }
}
