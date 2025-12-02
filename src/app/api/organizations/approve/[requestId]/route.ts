import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/organizations/approve/[requestId]
 * 
 * Approve organization registration request
 * Creates organization in EduSitePro AND syncs to EduDashPro
 * Only SuperAdmins can call this endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;

    // Create Supabase clients
    const supabaseEduSite = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const supabaseEduDash = createClient(
      process.env.EDUDASH_SUPABASE_URL!,
      process.env.EDUDASH_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('[Org Approval] Starting approval for request:', requestId);

    // Get the registration request
    const { data: regRequest, error: fetchError } = await supabaseEduSite
      .from('organization_registration_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !regRequest) {
      return NextResponse.json(
        { error: 'Registration request not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (regRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Request already ${regRequest.status}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Create user in EduSitePro auth
    const { data: authData, error: authError } = await supabaseEduSite.auth.admin.createUser({
      email: regRequest.email,
      password: Math.random().toString(36).slice(-12), // Temp password (user will reset)
      email_confirm: true, // Auto-confirm
      user_metadata: {
        full_name: regRequest.full_name,
        role: 'organization_admin',
      },
    });

    if (authError || !authData.user) {
      console.error('[Org Approval] Auth error:', authError);
      return NextResponse.json(
        { error: `Failed to create user: ${authError?.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[Org Approval] User created:', authData.user.id);

    // 2. Create organization in EduSitePro
    const { data: orgData, error: orgError } = await supabaseEduSite
      .from('organizations')
      .insert({
        name: regRequest.organization_name,
        slug: regRequest.organization_slug,
        plan_tier: regRequest.plan_tier,
        max_centres: regRequest.plan_tier === 'solo' ? 1 : regRequest.plan_tier === 'group_5' ? 5 : regRequest.plan_tier === 'group_10' ? 10 : 999,
        primary_contact_name: regRequest.full_name,
        primary_contact_email: regRequest.email,
        primary_contact_phone: regRequest.phone_number,
        address_line1: regRequest.address_line1,
        address_line2: regRequest.address_line2,
        city: regRequest.city,
        province: regRequest.province,
        postal_code: regRequest.postal_code,
        country: regRequest.country,
        subscription_status: 'trialing',
        trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (orgError) {
      console.error('[Org Approval] Organization creation error:', orgError);
      // Cleanup: delete user
      await supabaseEduSite.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `Failed to create organization: ${orgError.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[Org Approval] Organization created:', orgData.id);

    // 3. Create centre in EduSitePro
    const { data: centreData, error: centreError } = await supabaseEduSite
      .from('centres')
      .insert({
        organization_id: orgData.id,
        slug: regRequest.organization_slug,
        name: regRequest.campus_name,
        status: 'active',
        plan_tier: regRequest.plan_tier,
      })
      .select()
      .single();

    if (centreError) {
      console.error('[Org Approval] Centre creation error:', centreError);
      // Cleanup
      await supabaseEduSite.from('organizations').delete().eq('id', orgData.id);
      await supabaseEduSite.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `Failed to create centre: ${centreError.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[Org Approval] Centre created:', centreData.id);

    // 4. Create organization in EduDashPro (schemas now synced!)
    const { data: edudashOrgData, error: edudashOrgError } = await supabaseEduDash
      .from('organizations')
      .insert({
        id: orgData.id, // SAME UUID
        name: regRequest.organization_name,
        slug: regRequest.organization_slug,
        plan_tier: regRequest.plan_tier,
        max_centres: orgData.max_centres,
        primary_contact_name: regRequest.full_name,
        primary_contact_email: regRequest.email,
        primary_contact_phone: regRequest.phone_number,
        billing_email: regRequest.billing_email,
        email: regRequest.email, // Keep legacy field
        phone: regRequest.phone_number, // Keep legacy field
        address: `${regRequest.address_line1}, ${regRequest.city}, ${regRequest.province} ${regRequest.postal_code}`,
        address_line1: regRequest.address_line1,
        address_line2: regRequest.address_line2,
        city: regRequest.city,
        province: regRequest.province,
        state: regRequest.province, // Populate both province and state
        postal_code: regRequest.postal_code,
        country: regRequest.country,
        subscription_status: 'trialing',
        trial_ends_at: orgData.trial_end_date,
        subscription_start_date: orgData.subscription_start_date,
        subscription_end_date: orgData.subscription_end_date,
        status: 'active',
        is_active: true,
      })
      .select()
      .single();

    if (edudashOrgError) {
      console.error('[Org Approval] EduDash org creation error:', edudashOrgError);
      // Continue anyway - can be synced later
    } else {
      console.log('[Org Approval] EduDash organization created:', edudashOrgData.id);
    }

    // 5. Create preschool in EduDashPro
    const { data: preschoolData, error: preschoolError } = await supabaseEduDash
      .from('preschools')
      .insert({
        organization_id: orgData.id,
        name: regRequest.campus_name,
        campus_code: regRequest.campus_code,
        address: regRequest.campus_address,
        principal_id: authData.user.id,
        capacity: regRequest.campus_capacity,
        current_enrollment: 0,
        active: true,
      })
      .select()
      .single();

    if (preschoolError) {
      console.error('[Org Approval] Preschool creation error:', preschoolError);
      // Continue anyway
    } else {
      console.log('[Org Approval] Preschool created:', preschoolData.id);
    }

    // 6. Create user in EduDashPro auth
    const { data: edudashAuthData, error: edudashAuthError } = await supabaseEduDash.auth.admin.createUser({
      email: regRequest.email,
      password: Math.random().toString(36).slice(-12),
      email_confirm: true,
      user_metadata: {
        full_name: regRequest.full_name,
        role: 'principal',
      },
    });

    if (edudashAuthError) {
      console.error('[Org Approval] EduDash auth error:', edudashAuthError);
    } else {
      console.log('[Org Approval] EduDash user created:', edudashAuthData.user.id);
      
      // Update profile in EduDashPro
      await supabaseEduDash
        .from('profiles')
        .update({
          role: 'principal',
          full_name: regRequest.full_name,
          phone_number: regRequest.phone_number,
          preschool_id: preschoolData?.id,
        })
        .eq('id', edudashAuthData.user.id);
    }

    // 7. Update registration request status
    await supabaseEduSite
      .from('organization_registration_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        created_organization_id: orgData.id,
        created_centre_id: centreData.id,
        created_user_id: authData.user.id,
      })
      .eq('id', requestId);

    // 8. Send welcome email with password reset link
    // TODO: Implement email sending

    return NextResponse.json(
      {
        success: true,
        message: 'Organization approved and synced successfully',
        data: {
          organizationId: orgData.id,
          centreId: centreData.id,
          userId: authData.user.id,
          email: regRequest.email,
          organizationName: regRequest.organization_name,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Org Approval] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/organizations/reject/[requestId]
 * 
 * Reject organization registration request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;
    const body = await request.json();
    const { reason } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update request status
    const { error } = await supabase
      .from('organization_registration_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || 'No reason provided',
      })
      .eq('id', requestId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    // TODO: Send rejection email

    return NextResponse.json(
      { success: true, message: 'Request rejected' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
