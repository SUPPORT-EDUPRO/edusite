import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { forbiddenResponse,verifyAdmin } from '@/lib/auth-helpers';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/organizations/requests
 * 
 * Fetch organization registration requests
 * Requires Admin authentication (SuperAdmin or Platform Admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify Admin access (SuperAdmin or Platform Admin)
    const admin = await verifyAdmin();
    if (!admin) {
      console.log('[Org Requests] Unauthorized access attempt');
      return forbiddenResponse('Admin access required');
    }

    console.log('[Org Requests] Admin access granted:', admin.email, 'Role:', admin.role);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or null for all

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    let query = supabase
      .from('organization_registration_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('[Org Requests] Error fetching:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: requests },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Org Requests] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
}
