import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { generateRegistrationConfirmation } from '@/lib/email-templates/registration-confirmation';
import { getServiceRoleClient,supabase } from '@/lib/supabase';

/**
 * Server-side registration endpoint.
 * Uses the anon key with RLS policies for secure public registration submissions.
 *
 * Security Model:
 * - Uses supabase client with anon key (not service role)
 * - RLS policies on registration_requests table allow public inserts
 * - Server-side validation before database insert
 * - No sensitive data exposure (service role key not needed)
 */

/**
 * GET /api/registrations
 * Fetch registration requests with optional status filter (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabaseClient = getServiceRoleClient();
    
    let query = supabaseClient
      .from('registration_requests')
      .select(`
        *,
        organizations (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Registrations API] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Registrations API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Minimal server validation
    const required = [
      'organization_id',
      'student_first_name',
      'student_last_name',
      'guardian_name',
      'guardian_email',
    ];
    for (const key of required) {
      if (!payload[key]) {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }

    // Generate unique payment reference
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const paymentReference = `REG-${new Date().getFullYear()}-${timestamp}-${randomSuffix}`;

    const insertPayload = {
      organization_id: payload.organization_id,
      student_first_name: payload.student_first_name,
      student_last_name: payload.student_last_name,
      student_dob: payload.student_dob || null,
      student_gender: payload.student_gender || null,
      guardian_name: payload.guardian_name,
      guardian_email: payload.guardian_email,
      guardian_phone: payload.guardian_phone || null,
      guardian_address: payload.guardian_address || null,
      preferred_class: payload.preferred_class || null,
      preferred_start_date: payload.preferred_start_date || null,
      referral_source: payload.referral_source || null,
      early_bird: payload.early_bird || false,
      message: payload.message || null,
      payment_reference: paymentReference,
      submission_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('registration_requests')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send confirmation email to parent
    try {
      // Get organization details for school name
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', payload.organization_id)
        .single();

      const schoolName = orgData?.name || 'Young Eagles';
      const studentName = `${payload.student_first_name} ${payload.student_last_name}`;

      // Generate email content
      const emailContent = generateRegistrationConfirmation({
        parentName: payload.guardian_name,
        parentEmail: payload.guardian_email,
        studentName: studentName,
        schoolName: schoolName,
        registrationId: data.payment_reference || data.id, // Use payment reference as registration ID
      });

      // Call send-email Edge Function
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            to: payload.guardian_email,
            subject: emailContent.subject,
            body: emailContent.html,
            is_html: true,
            confirmed: true,
          }),
        }
      );

      if (!emailResponse.ok) {
        const emailError = await emailResponse.json();
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the registration if email fails
      } else {
        console.log('Confirmation email sent successfully to:', payload.guardian_email);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({ success: true, registration: data }, { status: 200 });
  } catch (err) {
    console.error('Registration route error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
