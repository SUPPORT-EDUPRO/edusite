import { NextRequest, NextResponse } from 'next/server';

import { generateRegistrationConfirmation } from '@/lib/email-templates/registration-confirmation';
import { getServiceRoleClient } from '@/lib/supabase';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** A confirmation can only be requested shortly after the application was saved. */
const CONFIRMATION_WINDOW_MS = 30 * 60 * 1000;

/**
 * POST /api/registrations/send-confirmation
 *
 * Sends the confirmation email to the parent of a registration that was just submitted.
 * The recipient, names and fees are read from the saved registration, never from the
 * request, so this endpoint cannot be used to email arbitrary people with arbitrary text.
 */
export async function POST(request: NextRequest) {
  try {
    const { registrationId, parentEmail } = await request.json();

    if (typeof registrationId !== 'string' || !UUID_PATTERN.test(registrationId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceRoleClient();
    const { data: registration } = await supabase
      .from('registration_requests')
      .select(
        'id, organization_id, guardian_name, guardian_email, student_first_name, student_last_name, registration_fee_amount, discount_amount, payment_reference, created_at',
      )
      .eq('id', registrationId)
      .maybeSingle();

    const submittedAt = registration?.created_at ? new Date(registration.created_at).getTime() : 0;
    const emailMatches =
      typeof parentEmail === 'string' &&
      parentEmail.trim().toLowerCase() === String(registration?.guardian_email ?? '').toLowerCase();

    // The same response for "unknown", "too old" and "wrong email" avoids confirming which ids exist.
    if (!registration || !emailMatches || Date.now() - submittedAt > CONFIRMATION_WINDOW_MS) {
      return NextResponse.json(
        { error: 'This confirmation can no longer be sent.' },
        { status: 403 },
      );
    }

    const { data: school } = await supabase
      .from('preschools')
      .select('name')
      .eq('id', registration.organization_id)
      .maybeSingle();

    const registrationFee = Number(registration.registration_fee_amount ?? 0);
    const discountAmount = Number(registration.discount_amount ?? 0);

    const { subject, html } = generateRegistrationConfirmation({
      parentName: registration.guardian_name,
      parentEmail: registration.guardian_email,
      studentName: `${registration.student_first_name} ${registration.student_last_name}`,
      schoolName: school?.name || 'Young Eagles Preschool',
      registrationId: registration.id,
      registrationFee,
      discountApplied: discountAmount > 0,
      originalFee: registrationFee + discountAmount,
      paymentReference: registration.payment_reference ?? undefined,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Supabase URL is not configured' }, { status: 500 });
    }

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        to: registration.guardian_email,
        from: 'noreply@edudashpro.org.za',
        subject,
        body: html,
        is_html: true,
        confirmed: true,
      }),
    });

    if (!emailResponse.ok) {
      console.error('Failed to send confirmation email:', emailResponse.status);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
