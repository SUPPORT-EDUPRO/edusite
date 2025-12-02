import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySuperAdmin, forbiddenResponse } from '@/lib/auth-helpers';
import { sendOrganizationWelcomeEmail } from '@/lib/email/service';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/organizations/resend-invite/[userId]
 * 
 * Resend invitation email to an organization user who was created without proper invitation
 * Only SuperAdmins can call this endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify SuperAdmin access
    const admin = await verifySuperAdmin();
    if (!admin) {
      return forbiddenResponse('SuperAdmin access required');
    }

    const { userId } = params;

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

    // Get user info from EduSitePro
    const { data: userData, error: userError } = await supabaseEduSite.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const userEmail = userData.user.email;
    const fullName = userData.user.user_metadata?.full_name || 'there';
    console.log('[Resend Invite] Processing for user:', userEmail);

    // Get organization info from registration request
    const { data: orgRequest } = await supabaseEduSite
      .from('organization_registration_requests')
      .select('organization_name, full_name')
      .eq('created_user_id', userId)
      .single();

    const organizationName = orgRequest?.organization_name || 'Your Organization';
    const recipientName = orgRequest?.full_name || fullName;

    // For already-registered users, use recovery link (password reset)
    // Redirect through /auth/callback which will then route to /reset-password
    const { data: inviteLinkEduSite, error: linkErrorEduSite } = await supabaseEduSite.auth.admin.generateLink({
      type: 'recovery',
      email: userEmail!,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery&redirect_to=/reset-password`,
      }
    });

    if (linkErrorEduSite) {
      console.error('[Resend Invite] EduSitePro recovery link error:', linkErrorEduSite);
      throw new Error(`Failed to generate EduSitePro link: ${linkErrorEduSite.message}`);
    }

    console.log('[Resend Invite] EduSitePro recovery link generated');

    // Check if user exists in EduDashPro
    const { data: edudashUserData } = await supabaseEduDash.auth.admin.listUsers();
    const edudashUser = edudashUserData.users.find(u => u.email === userEmail);

    let inviteLinkEduDash = null;
    if (edudashUser) {
      const { data: link, error: linkErrorEduDash } = await supabaseEduDash.auth.admin.generateLink({
        type: 'recovery',
        email: userEmail!,
        options: {
          redirectTo: `${process.env.EDUDASH_SITE_URL}/auth/callback?type=recovery&redirect_to=/reset-password`,
        }
      });

      if (linkErrorEduDash) {
        console.error('[Resend Invite] EduDashPro recovery link error:', linkErrorEduDash);
      } else {
        inviteLinkEduDash = link;
        console.log('[Resend Invite] EduDashPro recovery link generated');
      }
    }

    // Send branded welcome email with magic links
    console.log('[Resend Invite] About to send email with API key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    
    const emailResult = await sendOrganizationWelcomeEmail({
      to: userEmail!,
      organizationName,
      recipientName,
      eduSiteProLink: inviteLinkEduSite.properties.action_link,
      eduDashProLink: inviteLinkEduDash?.properties?.action_link,
    });
    
    console.log('[Resend Invite] Email result:', emailResult);

    return NextResponse.json(
      {
        success: true,
        message: `Welcome email sent to ${userEmail} via ${emailResult.provider}`,
        data: {
          eduSiteProLink: inviteLinkEduSite.properties.action_link,
          eduDashProLink: inviteLinkEduDash?.properties?.action_link,
          emailProvider: emailResult.provider,
          emailId: emailResult.id,
        }
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Resend Invite] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
}
