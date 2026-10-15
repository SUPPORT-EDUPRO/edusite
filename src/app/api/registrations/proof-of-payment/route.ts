import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  proofUploadErrorMessage,
  REGISTRATION_REFERENCE_PATTERN,
  validateProofOfPaymentFile,
} from '@/lib/proof-of-payment';
import { getServiceRoleClient } from '@/lib/supabase';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 8;
const recentUploads = new Map<string, number[]>();

function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (recentUploads.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  recentUploads.set(key, recent);
  return recent.length > MAX_UPLOADS_PER_WINDOW;
}

/**
 * POST /api/registrations/proof-of-payment (multipart: reference, email, file)
 *
 * A parent adds proof of payment to their own application. The reference and the guardian email
 * must both match, then the file goes through the same DashPro edge function the principal's
 * upload link uses, so it lands in the private proof-of-payments bucket and shows up in the app.
 */
export async function POST(request: NextRequest) {
  const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: 'Too many uploads. Please wait a few minutes.' },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
  }

  const reference = String(form.get('reference') ?? '')
    .trim()
    .toUpperCase();
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  const file = form.get('file');
  if (!REGISTRATION_REFERENCE_PATTERN.test(reference) || !email || email.length > 254) {
    return NextResponse.json(
      { error: 'Enter a valid reference and email address.' },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Choose your proof of payment file.' }, { status: 400 });
  }
  const fileError = validateProofOfPaymentFile(file);
  if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });

  const supabase = getServiceRoleClient();
  const { data: registration, error: registrationError } = await supabase
    .from('registration_requests')
    .select(
      'id, student_first_name, student_last_name, guardian_name, registration_fee_amount, payment_reference',
    )
    .eq('organization_id', YOUNG_EAGLES_ORGANIZATION_ID)
    .eq('payment_reference', reference)
    .eq('guardian_email', email)
    .maybeSingle();

  if (registrationError) {
    console.error('[Proof of payment lookup]', registrationError.message);
    return NextResponse.json(
      { error: 'We could not check your registration right now. Please try again shortly.' },
      { status: 503 },
    );
  }

  if (!registration) {
    return NextResponse.json(
      {
        error:
          'We could not match those details. Check the reference and email from your confirmation.',
      },
      { status: 404 },
    );
  }

  const fileBase64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  const { data, error } = await supabase.functions.invoke('registration-pop-upload', {
    body: {
      action: 'submit',
      registration_id: registration.id,
      email,
      file_base64: fileBase64,
      file_name: file.name,
      mime_type: file.type === 'image/jpg' ? 'image/jpeg' : file.type,
    },
  });

  // supabase-js reports a non-2xx reply as `error`; the JSON body with our error code is on error.context.
  let code: string | undefined = (data as { error?: string } | null)?.error;
  if (error && !code) {
    try {
      const context = (error as { context?: Response }).context;
      code = ((await context?.json()) as { error?: string } | undefined)?.error;
    } catch {
      code = undefined;
    }
  }
  if (error || !(data as { success?: boolean } | null)?.success) {
    console.error('[Proof of payment]', code ?? (error as Error | null)?.message);
    const mapped = proofUploadErrorMessage(code);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }

  // Best effort: tell the principal and admins. A failed notification never fails the upload.
  try {
    const { error: notificationError } = await supabase.functions.invoke(
      'notifications-dispatcher',
      {
        body: {
          event_type: 'pop_uploaded',
          preschool_id: YOUNG_EAGLES_ORGANIZATION_ID,
          student_name:
            `${registration.student_first_name || ''} ${registration.student_last_name || ''}`.trim(),
          parent_name: registration.guardian_name,
          payment_amount: registration.registration_fee_amount,
          payment_reference: registration.payment_reference,
          send_immediately: true,
        },
      },
    );
    if (notificationError) {
      console.error('[Proof of payment notification]', notificationError.message);
    }
  } catch (notificationError) {
    console.error('[Proof of payment notification]', notificationError);
  }

  return NextResponse.json({ success: true });
}
