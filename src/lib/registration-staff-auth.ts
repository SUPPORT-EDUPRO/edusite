import { NextResponse } from 'next/server';

import { createClient } from '@/lib/auth';
import {
  canManageSchoolRegistrations,
  isSuperAdminRole,
  SCHOOL_STAFF_ROLES,
} from '@/lib/registration-staff-policy';
import { getServiceRoleClient } from '@/lib/supabase';

export interface RegistrationStaff {
  userId: string;
  role: string;
  isSuperAdmin: boolean;
  preschoolId: string | null;
  organizationId: string | null;
}

export class RegistrationAuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
  }
}

/**
 * Verify the caller server-side (getUser re-validates the token with Supabase, unlike
 * getSession) and load their role from profiles.
 */
export async function requireRegistrationStaff(): Promise<RegistrationStaff> {
  const authClient = createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) throw new RegistrationAuthError('Unauthorized', 401);

  const { data: profile } = await getServiceRoleClient()
    .from('profiles')
    .select('id, role, preschool_id, organization_id')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile?.role ?? '').trim().toLowerCase();
  if (!isSuperAdminRole(role) && !SCHOOL_STAFF_ROLES.has(role)) {
    throw new RegistrationAuthError('Forbidden', 403);
  }

  return {
    userId: user.id,
    role,
    isSuperAdmin: isSuperAdminRole(role),
    preschoolId: profile?.preschool_id ?? null,
    organizationId: profile?.organization_id ?? null,
  };
}

/** Throws unless the staff member may act on this school's registrations. */
export function assertCanManageSchool(
  staff: RegistrationStaff,
  schoolId: string | null | undefined,
): void {
  const allowed = canManageSchoolRegistrations(
    { role: staff.role, preschool_id: staff.preschoolId, organization_id: staff.organizationId },
    schoolId ?? null,
  );
  if (!allowed) throw new RegistrationAuthError('Forbidden', 403);
}

export function registrationAuthErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof RegistrationAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}
