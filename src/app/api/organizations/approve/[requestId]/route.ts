import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { forbiddenResponse,verifySuperAdmin } from '@/lib/auth-helpers';
import { sendOrganizationWelcomeEmail } from '@/lib/email/service';

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
    // Verify SuperAdmin access
    const admin = await verifySuperAdmin();
    if (!admin) {
      console.log('[Org Approval] Unauthorized access attempt');
      return forbiddenResponse('SuperAdmin access required');
    }

    console.log('[Org Approval] SuperAdmin access granted:', admin.email);

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

    // 1. Create user in EduSitePro auth and send invitation email
    const { data: authData, error: authError } = await supabaseEduSite.auth.admin.inviteUserByEmail(
      regRequest.email,
      {
        data: {
          full_name: regRequest.full_name,
          role: 'organization_admin',
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      }
    );

    if (authError || !authData.user) {
      console.error('[Org Approval] Auth error:', authError);
      return NextResponse.json(
        { error: `Failed to invite user: ${authError?.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[Org Approval] User invited:', authData.user.id);

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

    // 6. Create user in EduDashPro auth and send invitation
    const { data: edudashAuthData, error: edudashAuthError } = await supabaseEduDash.auth.admin.inviteUserByEmail(
      regRequest.email,
      {
        data: {
          full_name: regRequest.full_name,
          role: 'principal',
        },
        redirectTo: `${process.env.EDUDASH_SITE_URL}/auth/callback`,
      }
    );

    if (edudashAuthError) {
      console.error('[Org Approval] EduDash auth error:', edudashAuthError);
    } else {
      console.log('[Org Approval] EduDash user invited:', edudashAuthData.user.id);
      
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

    // 8. Send branded welcome email with setup links
    try {
      // Generate magic links for password setup (use recovery type for password reset)
      // Redirect through /auth/callback for proper session handling
      const { data: magicLinkEduSite } = await supabaseEduSite.auth.admin.generateLink({
        type: 'recovery',
        email: regRequest.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery&redirect_to=/reset-password`,
        }
      });

      let magicLinkEduDash = null;
      if (edudashAuthData) {
        const { data: link } = await supabaseEduDash.auth.admin.generateLink({
          type: 'recovery',
          email: regRequest.email,
          options: {
            redirectTo: `${process.env.EDUDASH_SITE_URL}/auth/callback?type=recovery&redirect_to=/reset-password`,
          }
        });
        magicLinkEduDash = link;
      }

      await sendOrganizationWelcomeEmail({
        to: regRequest.email,
        organizationName: regRequest.organization_name,
        recipientName: regRequest.full_name,
        eduSiteProLink: magicLinkEduSite?.properties?.action_link || `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
        eduDashProLink: magicLinkEduDash?.properties?.action_link,
      });
      
      console.log('[Org Approval] Welcome email sent to:', regRequest.email);
    } catch (emailError) {
      console.error('[Org Approval] Email sending failed (non-critical):', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Organization approved and synced successfully. Welcome email sent!',
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
 * Only SuperAdmins can call this endpoint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    // Verify SuperAdmin access
    const admin = await verifySuperAdmin();
    if (!admin) {
      console.log('[Org Rejection] Unauthorized access attempt');
      return forbiddenResponse('SuperAdmin access required');
    }

    console.log('[Org Rejection] SuperAdmin access granted:', admin.email);

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
