import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// CORS headers for cross-origin requests from EduDashPro
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, use specific origin
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * OPTIONS /api/organizations/register
 * Handle CORS preflight request
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * POST /api/organizations/register
 * 
 * Submit organization registration request (pending SuperAdmin approval)
 * This endpoint is called from BOTH EduDashPro and EduSitePro registration forms
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Personal info
      email,
      password,
      fullName,
      phoneNumber,
      
      // Organization info
      organizationName,
      organizationSlug,
      planTier,
      billingEmail,
      
      // Organization address
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      country,
      
      // Campus info
      campusName,
      campusCode,
      campusAddress,
      campusCapacity,
    } = body;

    // Validation
    if (!email || !password || !fullName || !phoneNumber) {
      return NextResponse.json(
        { error: 'Personal information is incomplete' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!organizationName || !organizationSlug || !billingEmail) {
      return NextResponse.json(
        { error: 'Organization information is incomplete' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!addressLine1 || !city || !province || !postalCode) {
      return NextResponse.json(
        { error: 'Organization address is incomplete' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!campusName) {
      return NextResponse.json(
        { error: 'Campus name is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate formats
    if (!/^[a-z0-9-]+$/.test(organizationSlug)) {
      return NextResponse.json(
        { error: 'Organization slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (campusCode && !/^[A-Z0-9-]+$/.test(campusCode)) {
      return NextResponse.json(
        { error: 'Campus code must be uppercase letters, numbers, and hyphens' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Supabase client
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

    console.log('[Org Registration] Starting registration request...');

    // Check for duplicate email or slug
    const { data: existing } = await supabase
      .from('organization_registration_requests')
      .select('id, email, organization_slug, status')
      .or(`email.eq.${email},organization_slug.eq.${organizationSlug}`)
      .single();

    if (existing) {
      if (existing.email === email) {
        return NextResponse.json(
          { error: 'An organization with this email is already registered or pending approval' },
          { status: 409 }
        );
      }
      if (existing.organization_slug === organizationSlug) {
        return NextResponse.json(
          { error: 'This organization slug is already taken. Please choose a different one.' },
          { status: 409 }
        );
      }
    }

    // Hash password for temporary storage
    const passwordHash = await bcrypt.hash(password, 12);

    // Create registration request
    const { data: registrationRequest, error: requestError } = await supabase
      .from('organization_registration_requests')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone_number: phoneNumber,
        
        organization_name: organizationName,
        organization_slug: organizationSlug,
        plan_tier: planTier || 'solo',
        billing_email: billingEmail,
        
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        province,
        postal_code: postalCode,
        country: country || 'ZA',
        
        campus_name: campusName,
        campus_code: campusCode || null,
        campus_address: campusAddress || addressLine1,
        campus_capacity: campusCapacity || 200,
        
        status: 'pending',
      })
      .select()
      .single();

    if (requestError) {
      console.error('[Org Registration] Error:', requestError);
      
      if (requestError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Email or organization slug already exists' },
          { status: 409, headers: corsHeaders }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to submit registration: ${requestError.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[Org Registration] Request created:', registrationRequest.id);

    // TODO: Send notification to SuperAdmin (email or dashboard notification)
    // await sendAdminNotification(registrationRequest);

    return NextResponse.json(
      {
        success: true,
        message: 'Registration submitted successfully. A SuperAdmin will review your application shortly.',
        data: {
          requestId: registrationRequest.id,
          email: registrationRequest.email,
          organizationName: registrationRequest.organization_name,
          status: 'pending',
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Org Registration] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
}
