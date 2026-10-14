/**
 * Roles allowed to manage registrations. This mirrors the live row level security on
 * registration_requests: principals for their own school, super admins for every school.
 */
export const SUPER_ADMIN_ROLES = new Set(['superadmin', 'super_admin']);
export const SCHOOL_STAFF_ROLES = new Set(['principal', 'principal_admin']);

export interface StaffProfile {
  id: string;
  role: string | null;
  preschool_id: string | null;
  organization_id: string | null;
}

export function isSuperAdminRole(role: string | null | undefined): boolean {
  return SUPER_ADMIN_ROLES.has((role ?? '').trim().toLowerCase());
}

/** Pure decision: may this profile act on registrations of the given school? */
export function canManageSchoolRegistrations(
  profile: Pick<StaffProfile, 'role' | 'preschool_id' | 'organization_id'> | null,
  schoolId: string | null,
): boolean {
  if (!profile?.role) return false;
  const role = profile.role.trim().toLowerCase();
  if (SUPER_ADMIN_ROLES.has(role)) return true;
  if (!SCHOOL_STAFF_ROLES.has(role) || !schoolId) return false;
  return profile.preschool_id === schoolId || profile.organization_id === schoolId;
}
