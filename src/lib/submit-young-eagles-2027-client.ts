import type { SubmitYoungEagles2027Result } from '@/lib/submit-public-registration';
import type { YoungEagles2027RegistrationState } from '@/lib/young-eagles-2027-registration';
import { YOUNG_EAGLES_SCHOOL_NAME, YOUNG_EAGLES_SLUG } from '@/lib/young-eagles-registration';

const SUBMIT_FAILED_MESSAGE = 'Failed to submit registration. Please try again.';

/**
 * Sends the application to the server, which fixes the tenant and fee itself,
 * then asks for the parent confirmation email without blocking the result.
 */
export async function submitYoungEagles2027ToServer(
  values: YoungEagles2027RegistrationState,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitYoungEagles2027Result> {
  let response: Response;
  try {
    response = await fetchImpl('/api/registrations/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });
  } catch {
    throw new Error('We could not reach the server. Check your connection and try again.');
  }

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    registration?: SubmitYoungEagles2027Result;
  } | null;

  if (!response.ok || !payload?.registration) {
    throw new Error(payload?.error || SUBMIT_FAILED_MESSAGE);
  }

  const registration = payload.registration;
  void fetchImpl('/api/registrations/send-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parentEmail: registration.guardianEmail,
      parentName: registration.guardianName,
      studentName: registration.childName,
      schoolName: YOUNG_EAGLES_SCHOOL_NAME,
      registrationFee: registration.registrationFeeAmount,
      discountApplied: registration.discountAmount > 0,
      discountAmount: registration.discountAmount,
      registrationId: registration.id,
      paymentReference: registration.paymentReference,
      organizationSlug: YOUNG_EAGLES_SLUG,
    }),
  }).catch(() => undefined);

  return registration;
}
