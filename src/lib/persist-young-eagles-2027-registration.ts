import type { SupabaseClient } from '@supabase/supabase-js';

import { CURRENT_ACADEMIC_YEAR, defaultPreferredStartDate } from '@/lib/academic-year';
import {
  buildRegistrationCampaignPersistFields,
  type RegistrationCampaignView,
} from '@/lib/registration-campaign';
import type { YoungEagles2027RegistrationState } from '@/lib/young-eagles-2027-registration';
import { YOUNG_EAGLES_REGISTRATION_FEE_RAND } from '@/lib/young-eagles-fees';
import {
  YOUNG_EAGLES_ORGANIZATION_ID,
  YOUNG_EAGLES_SCHOOL_NAME,
} from '@/lib/young-eagles-registration';

type RegistrationQueryClient = Pick<SupabaseClient, 'from'>;

export interface PersistYoungEagles2027Input {
  organizationId: string;
  values: YoungEagles2027RegistrationState;
  campaign: RegistrationCampaignView | null;
}

export interface PersistYoungEagles2027Result {
  id: string;
  paymentReference: string;
  registrationFeeAmount: number;
  discountAmount: number;
  campaignCode: string | null;
}

export function splitPersonName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, ' ');
  const space = trimmed.indexOf(' ');
  if (space === -1) {
    return { firstName: trimmed, lastName: trimmed };
  }

  return {
    firstName: trimmed.slice(0, space),
    lastName: trimmed.slice(space + 1).trim(),
  };
}

function buildPaymentReference(): string {
  return `REG-${CURRENT_ACADEMIC_YEAR}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

export function buildYoungEagles2027RegistrationRow(input: PersistYoungEagles2027Input) {
  if (input.organizationId !== YOUNG_EAGLES_ORGANIZATION_ID) {
    throw new Error('Young Eagles registration can only be submitted for Young Eagles Preschool.');
  }

  const child = splitPersonName(input.values.childLegalName);
  const persistFields = buildRegistrationCampaignPersistFields({
    campaign: input.campaign,
    typedCode: input.campaign?.code,
    baseFeeRand: YOUNG_EAGLES_REGISTRATION_FEE_RAND,
  });
  const paymentReference = buildPaymentReference();

  return {
    paymentReference,
    persistFields,
    row: {
      organization_id: YOUNG_EAGLES_ORGANIZATION_ID,
      guardian_name: input.values.guardianLegalName.trim(),
      guardian_email: input.values.email.trim(),
      guardian_phone: input.values.mobile.trim(),
      guardian_address: input.values.address.trim() || null,
      secondary_guardian_relationship: input.values.relationship,
      student_first_name: child.firstName,
      student_last_name: child.lastName,
      student_dob: input.values.childDateOfBirth,
      emergency_contact_name: input.values.emergencyContact.trim() || null,
      emergency_contact_phone: input.values.emergencyContactPhone.trim() || null,
      emergency_contact_relation: input.values.emergencyContactRelationship.trim() || null,
      preferred_start_date: defaultPreferredStartDate(),
      special_requests: [
        input.values.intendedStart,
        input.values.healthSupportDisclosure,
        input.values.alternateContact,
        input.values.communicationPreference,
      ]
        .map((value) => value.trim())
        .filter(Boolean)
        .join('\n'),
      coupon_code: persistFields.coupon_code,
      sibling_enrolled: input.values.siblingEnrolled,
      campaign_applied: persistFields.campaign_applied,
      discount_amount: persistFields.discount_amount,
      registration_fee_amount: persistFields.registration_fee_amount,
      registration_fee_paid: false,
      academic_year: CURRENT_ACADEMIC_YEAR,
      status: 'pending',
      priority_points: input.values.siblingEnrolled ? 5 : 0,
      consent_photography: input.values.mediaPermission === 'yes',
      consent_marketing: input.values.contactConsent,
      terms_accepted: input.values.termsConsent,
      payment_reference: paymentReference,
      documents: {
        source: 'young-eagles-2027',
        school_name: YOUNG_EAGLES_SCHOOL_NAME,
        child_preferred_name: input.values.childPreferredName || null,
        intended_start: input.values.intendedStart,
        document_preference: input.values.documentPreference,
        documents: {
          birth_certificate: input.values.birthCertificate,
          clinic_card: input.values.clinicCard,
          guardian_id: input.values.guardianId,
        },
        media_permission: input.values.mediaPermission,
        campaign: persistFields.campaign_snapshot,
      },
    },
  };
}

export async function persistYoungEagles2027Registration(
  client: RegistrationQueryClient,
  input: PersistYoungEagles2027Input,
): Promise<PersistYoungEagles2027Result> {
  const { paymentReference, persistFields, row } = buildYoungEagles2027RegistrationRow(input);

  if (row.student_dob) {
    const { data: existing } = await client
      .from('registration_requests')
      .select('id, status')
      .eq('organization_id', YOUNG_EAGLES_ORGANIZATION_ID)
      .eq('student_first_name', row.student_first_name)
      .eq('student_last_name', row.student_last_name)
      .eq('student_dob', row.student_dob)
      .maybeSingle();

    if (existing) {
      throw new Error(
        `A registration for ${row.student_first_name} ${row.student_last_name} already exists. Please contact the school if you need to update information.`,
      );
    }
  }

  const { data, error } = await client
    .from('registration_requests')
    .insert(row)
    .select('id')
    .single();
  if (error || !data?.id) {
    throw new Error(error?.message || 'Failed to submit registration. Please try again.');
  }

  return {
    id: data.id,
    paymentReference,
    registrationFeeAmount: persistFields.registration_fee_amount,
    discountAmount: persistFields.discount_amount,
    campaignCode: persistFields.coupon_code,
  };
}
