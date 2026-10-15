import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getServiceRoleClient } from '@/lib/supabase';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

const REFERENCE_PATTERN = /^REG-\d{4}-\d{10,}-[A-Z0-9]{5}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_LOOKUPS_PER_WINDOW = 12;
const recentLookups = new Map<string, number[]>();

function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (recentLookups.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  recentLookups.set(key, recent);
  return recent.length > MAX_LOOKUPS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: 'Too many checks. Please wait and try again.' },
      { status: 429 },
    );
  }

  let body: { reference?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Enter your reference and email address.' }, { status: 400 });
  }

  const reference = typeof body.reference === 'string' ? body.reference.trim().toUpperCase() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!REFERENCE_PATTERN.test(reference) || !email || email.length > 254) {
    return NextResponse.json(
      { error: 'Enter a valid reference and email address.' },
      { status: 400 },
    );
  }

  const { data, error } = await getServiceRoleClient()
    .from('registration_requests')
    .select(
      'student_first_name, status, created_at, registration_fee_amount, registration_fee_paid, registration_fee_waived, payment_verified, documents_uploaded, rejection_reason',
    )
    .eq('organization_id', YOUNG_EAGLES_ORGANIZATION_ID)
    .eq('payment_reference', reference)
    .eq('guardian_email', email)
    .maybeSingle();

  if (error) {
    console.error('[Registration status]', error.message);
    return NextResponse.json(
      { error: 'We could not check the application right now.' },
      { status: 500 },
    );
  }
  if (!data) {
    // Keep this response deliberately vague so the endpoint does not confirm whether a reference exists.
    return NextResponse.json(
      {
        error:
          'We could not match those details. Check the reference and email from your confirmation.',
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    application: {
      childFirstName: data.student_first_name,
      status: data.status,
      submittedAt: data.created_at,
      registrationFeeAmount: Number(data.registration_fee_amount ?? 0),
      registrationFeePaid: Boolean(data.registration_fee_paid),
      registrationFeeWaived: Boolean(data.registration_fee_waived),
      paymentVerified: Boolean(data.payment_verified),
      documentsUploaded: Boolean(data.documents_uploaded),
      rejectionReason: data.status === 'rejected' ? data.rejection_reason : null,
    },
  });
}
