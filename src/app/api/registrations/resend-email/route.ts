import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/auth';
import { generateRegistrationConfirmation } from '@/lib/email-templates/registration-confirmation';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * POST /api/registrations/resend-email
 * 
 * Resend the registration confirmation email to a parent
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authSupabase = createClient();
    const { data: { session } } = await authSupabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role client for admin operations
    const supabase = getServiceRoleClient();

    // Get request body
    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    // Get registration details
    const { data: registration, error: regError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Get organization details for school name
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', registration.organization_id)
      .single();

    const schoolName = orgData?.name || 'Young Eagles Education Centre';

    // Generate email content
    const emailContent = generateRegistrationConfirmation({
      parentName: registration.guardian_name,
      parentEmail: registration.guardian_email,
      studentName: `${registration.student_first_name} ${registration.student_last_name}`,
      schoolName: schoolName,
      registrationId: registration.id,
      registrationFee: registration.registration_fee_amount || 400,
      discountApplied: registration.discount_amount && registration.discount_amount > 0,
      originalFee: 400,
      paymentReference: registration.payment_reference,
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
          to: registration.guardian_email,
          subject: emailContent.subject,
          body: emailContent.html,
          is_html: true,
          confirmed: true,
        }),
      }
    );

    if (!emailResponse.ok) {
      const emailError = await emailResponse.json();
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        { error: `Failed to send email: ${emailError.error || 'Unknown error'}` },
        { status: 500 }
      );
    }

    console.log('Confirmation email resent successfully to:', registration.guardian_email);

    return NextResponse.json({
      success: true,
      message: 'Email resent successfully',
      data: {
        email: registration.guardian_email,
        registrationId: registration.id,
      }
    });

  } catch (error) {
    console.error('Resend email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
