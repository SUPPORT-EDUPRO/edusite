/**
 * Organization Sync API
 * Called by EduDashPro after creating a new organization
 * Ensures proper setup and validation
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/organizations/sync
 * 
 * Syncs organization from EduDashPro and ensures proper setup
 * 
 * Body:
 * {
 *   organization_id: string (UUID),
 *   organization_name: string,
 *   organization_slug: string,
 *   admin_email: string,
 *   admin_name?: string,
 *   custom_domain?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organization_id,
      organization_name,
      organization_slug,
      admin_email,
      admin_name,
      custom_domain,
    } = body;

    // Validate required fields
    if (!organization_id || !organization_name || !organization_slug || !admin_email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['organization_id', 'organization_name', 'organization_slug', 'admin_email'],
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[Org Sync] Starting sync for:', organization_name, '(', organization_slug, ')');
    console.log('[Org Sync] Admin:', admin_email);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Step 1: Ensure organization exists
    const { data: existingOrg, error: orgCheckError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .eq('id', organization_id)
      .single();

    if (orgCheckError && orgCheckError.code !== 'PGRST116') {
      console.error('[Org Sync] Error checking organization:', orgCheckError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error checking organization',
          details: orgCheckError.message,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!existingOrg) {
      // Create organization if it doesn't exist
      console.log('[Org Sync] Creating organization...');
      
      const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert({
          id: organization_id,
          name: organization_name,
          slug: organization_slug,
          custom_domain: custom_domain || null,
          domain_verified: false,
        })
        .select()
        .single();

      if (createError) {
        console.error('[Org Sync] Error creating organization:', createError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create organization',
            details: createError.message,
          },
          { status: 500, headers: corsHeaders }
        );
      }

      console.log('[Org Sync] ✅ Organization created:', newOrg.name);
    } else {
      console.log('[Org Sync] ✅ Organization already exists:', existingOrg.name);
    }

    // Step 2: Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    const userExists = authUser?.users?.find((u) => u.email === admin_email);

    if (!userExists) {
      console.log('[Org Sync] ⚠️  User not found in auth.users:', admin_email);
      
      return NextResponse.json(
        {
          success: true,
          warning: 'User not yet in auth system - waiting for email verification',
          organization_id,
          organization_name,
          organization_slug,
          admin_email,
          next_step: 'User needs to verify email and complete signup',
          dashboard_url: `https://edusitepro.edudashpro.org.za/dashboard`,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Step 3: Run post-registration setup via database function
    const { data: setupResult, error: setupError } = await supabase.rpc(
      'post_organization_registration',
      {
        p_organization_id: organization_id,
        p_admin_email: admin_email,
        p_admin_name: admin_name || null,
      }
    );

    if (setupError) {
      console.error('[Org Sync] Error in post-registration setup:', setupError);
      return NextResponse.json(
        {
          success: false,
          error: 'Post-registration setup failed',
          details: setupError.message,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[Org Sync] ✅ Post-registration setup complete');
    console.log('[Org Sync] Result:', setupResult);

    // Step 4: Create default centre for the organization
    const { data: existingCentre } = await supabase
      .from('centres')
      .select('id')
      .eq('organization_id', organization_id)
      .single();

    if (!existingCentre) {
      const { error: centreError } = await supabase.from('centres').insert({
        name: organization_name,
        slug: organization_slug,
        organization_id: organization_id,
        domain: `${organization_slug}.edusitepro.org.za`,
        plan: 'free',
        status: 'active',
      });

      if (centreError) {
        console.error('[Org Sync] Error creating centre:', centreError);
      } else {
        console.log('[Org Sync] ✅ Created default centre');
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Organization synced successfully',
        organization_id,
        organization_name,
        organization_slug,
        admin_email,
        admin_configured: true,
        dashboard_url: `https://edusitepro.edudashpro.org.za/dashboard`,
        setup_result: setupResult,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Org Sync] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error during sync',
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
