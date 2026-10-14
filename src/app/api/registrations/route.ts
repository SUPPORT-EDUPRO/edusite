import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  registrationAuthErrorResponse,
  requireRegistrationStaff,
} from '@/lib/registration-staff-auth';
import { getServiceRoleClient } from '@/lib/supabase';

const ALLOWED_STATUS_FILTERS = new Set(['pending', 'approved', 'rejected']);

/**
 * GET /api/registrations
 * Registration requests for the signed-in principal's school (all schools for a super admin).
 */
export async function GET(request: NextRequest) {
  try {
    const staff = await requireRegistrationStaff();
    const status = new URL(request.url).searchParams.get('status');

    let query = getServiceRoleClient()
      .from('registration_requests')
      .select('*, preschools:organization_id ( name )')
      .order('created_at', { ascending: false });

    if (!staff.isSuperAdmin) {
      const schoolId = staff.preschoolId ?? staff.organizationId;
      if (!schoolId) return NextResponse.json({ success: true, data: [] }, { status: 200 });
      query = query.eq('organization_id', schoolId);
    }

    if (status && status !== 'all') {
      if (!ALLOWED_STATUS_FILTERS.has(status)) {
        return NextResponse.json({ error: 'Unknown status filter' }, { status: 400 });
      }
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Registrations API] Error:', error);
      return NextResponse.json({ error: 'Failed to load registrations' }, { status: 500 });
    }

    // The admin screens read the school name from `organizations`.
    const rows = (data ?? []).map(({ preschools, ...row }) => ({
      ...row,
      organizations: preschools ?? null,
    }));
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error) {
    const authResponse = registrationAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('[Registrations API] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * Public intake moved to POST /api/registrations/submit. This legacy endpoint accepted a
 * browser-supplied organization and wrote columns that do not exist, so it stays closed.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been retired. Use /api/registrations/submit.' },
    { status: 410 },
  );
}
