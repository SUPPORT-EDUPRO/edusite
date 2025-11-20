import { NextRequest, NextResponse } from 'next/server';

import { getRequestId, logError, requireAdminToken } from '@/lib/api/auth-guard';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * GET /api/centres
 * List all active centres for the page builder centre selector
 */
export async function GET(request: NextRequest) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);

  try {
    const supabase = getServiceRoleClient();

    const { data: centres, error } = await supabase
      .from('centres')
      .select('id, name, slug, status, plan_tier')
      .eq('status', 'active')
      .order('name');

    if (error) {
      logError(requestId, 'centres fetch', error);
      return NextResponse.json({ error: 'Failed to fetch centres' }, { status: 500 });
    }

    return NextResponse.json({ centres: centres || [] }, { status: 200 });
  } catch (error) {
    logError(requestId, 'centres GET', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
