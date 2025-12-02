import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySuperAdmin, forbiddenResponse } from '@/lib/auth-helpers';

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

    // Send invitation to EduSitePro
    const { error: inviteErrorEduSite } = await supabaseEduSite.auth.admin.inviteUserByEmail(
      userEmail!,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      }
    );

    if (inviteErrorEduSite) {
      console.error('[Resend Invite] EduSitePro error:', inviteErrorEduSite);
    }

    // Check if user exists in EduDashPro and send invitation there too
    const { data: edudashUser } = await supabaseEduDash
      .from('auth.users')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (edudashUser) {
      const { error: inviteErrorEduDash } = await supabaseEduDash.auth.admin.inviteUserByEmail(
        userEmail!,
        {
          redirectTo: `${process.env.EDUDASH_SITE_URL}/auth/callback`,
        }
      );

      if (inviteErrorEduDash) {
        console.error('[Resend Invite] EduDashPro error:', inviteErrorEduDash);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Invitation emails sent to ${userEmail}`,
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
