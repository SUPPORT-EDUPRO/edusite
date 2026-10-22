import type { SupabaseClient } from '@supabase/supabase-js';

import {
  loadActiveRegistrationCampaign,
  loadSiblingRegistrationCampaign,
} from '@/lib/load-registration-campaign';
import {
  persistYoungEagles2027Registration,
  type PersistYoungEagles2027Result,
} from '@/lib/persist-young-eagles-2027-registration';
import { resolveDisplayedRegistrationCampaign } from '@/lib/registration-campaign';
import {
  initialYoungEagles2027RegistrationState,
  type SelectedRegistrationDocument,
  validateYoungEagles2027Step,
  type YoungEagles2027RegistrationState,
} from '@/lib/young-eagles-2027-registration';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

type ServerClient = Pick<SupabaseClient, 'from'>;

const MAX_SHORT_TEXT = 200;
const MAX_LONG_TEXT = 2000;
const MAX_CHILD_AGE_YEARS = 8;

const LONG_TEXT_FIELDS = new Set<keyof YoungEagles2027RegistrationState>([
  'address',
  'healthSupportDisclosure',
]);

export class RegistrationInputError extends Error {}

function readText(raw: Record<string, unknown>, key: keyof YoungEagles2027RegistrationState) {
  const value = raw[key];
  if (value == null || value === '') return '';
  if (typeof value !== 'string') {
    throw new RegistrationInputError('The registration form contained an invalid value.');
  }
  const limit = LONG_TEXT_FIELDS.has(key) ? MAX_LONG_TEXT : MAX_SHORT_TEXT;
  return value.trim().slice(0, limit);
}

function readFlag(raw: Record<string, unknown>, key: keyof YoungEagles2027RegistrationState) {
  return raw[key] === true;
}

function readDocument(
  raw: Record<string, unknown>,
  key: 'birthCertificate' | 'clinicCard' | 'guardianId',
): SelectedRegistrationDocument | null {
  const value = raw[key];
  if (value == null) return null;
  if (typeof value !== 'object') {
    throw new RegistrationInputError('The registration form contained an invalid document.');
  }
  const doc = value as Record<string, unknown>;
  const sizeBytes = Number(doc.sizeBytes);
  if (typeof doc.fileName !== 'string' || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw new RegistrationInputError('The registration form contained an invalid document.');
  }
  return {
    fileName: doc.fileName.slice(0, 255),
    sizeBytes,
    mimeType: typeof doc.mimeType === 'string' ? doc.mimeType.slice(0, 100) : '',
  };
}

/**
 * Whitelist every field the browser may supply. Anything not listed here
 * (organization, fee, discount, status, payment fields) is decided on the server.
 */
export function sanitizeYoungEagles2027Values(
  rawValues: unknown,
): YoungEagles2027RegistrationState {
  if (!rawValues || typeof rawValues !== 'object' || Array.isArray(rawValues)) {
    throw new RegistrationInputError('The registration form was empty.');
  }
  const raw = rawValues as Record<string, unknown>;
  const text = (key: keyof YoungEagles2027RegistrationState) => readText(raw, key);

  const documentPreference = text('documentPreference');
  const mediaPermission = text('mediaPermission');

  return {
    ...initialYoungEagles2027RegistrationState,
    guardianLegalName: text('guardianLegalName'),
    email: text('email').toLowerCase(),
    mobile: text('mobile').replace(/\D/g, ''),
    relationship: text('relationship'),
    alternateContact: text('alternateContact').replace(/\D/g, ''),
    address: text('address'),
    communicationPreference: text('communicationPreference'),
    emergencyContact: text('emergencyContact'),
    emergencyContactRelationship: text('emergencyContactRelationship'),
    emergencyContactPhone: text('emergencyContactPhone').replace(/\D/g, ''),
    siblingEnrolled: readFlag(raw, 'siblingEnrolled'),
    childLegalName: text('childLegalName'),
    childPreferredName: text('childPreferredName'),
    childDateOfBirth: text('childDateOfBirth'),
    intendedStart: text('intendedStart'),
    healthSupportDisclosure: text('healthSupportDisclosure'),
    documentPreference:
      documentPreference === 'upload-now' || documentPreference === 'upload-later'
        ? documentPreference
        : '',
    birthCertificate: readDocument(raw, 'birthCertificate'),
    clinicCard: readDocument(raw, 'clinicCard'),
    guardianId: readDocument(raw, 'guardianId'),
    contactConsent: readFlag(raw, 'contactConsent'),
    privacyConsent: readFlag(raw, 'privacyConsent'),
    termsConsent: readFlag(raw, 'termsConsent'),
    mediaPermission:
      mediaPermission === 'yes' || mediaPermission === 'not-now' || mediaPermission === 'ask-me'
        ? mediaPermission
        : '',
  };
}

export function validateChildDateOfBirth(value: string, now = new Date()): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Enter the child’s date of birth.';
  const dob = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(dob.getTime()) || dob.toISOString().slice(0, 10) !== value) {
    return 'Enter a valid date of birth for the child.';
  }
  if (dob.getTime() > now.getTime()) return 'The child’s date of birth cannot be in the future.';
  const oldest = new Date(now);
  oldest.setUTCFullYear(oldest.getUTCFullYear() - MAX_CHILD_AGE_YEARS);
  if (dob.getTime() < oldest.getTime()) {
    return 'This registration is for children aged up to 8 years. Please contact the school.';
  }
  return '';
}

export type SubmitYoungEagles2027Result = PersistYoungEagles2027Result & {
  guardianEmail: string;
  guardianName: string;
  childName: string;
};

/**
 * Public Young Eagles 2027 intake. The tenant is fixed on the server, the fee and
 * campaign are re-resolved from the database (never trusted from the browser),
 * and the insert runs with the service role because the table has no public
 * INSERT policy.
 */
export async function submitYoungEagles2027Application(
  client: ServerClient,
  rawValues: unknown,
): Promise<SubmitYoungEagles2027Result> {
  const values = sanitizeYoungEagles2027Values(rawValues);

  for (const step of [0, 1, 2]) {
    const message = validateYoungEagles2027Step(step, values);
    if (message) throw new RegistrationInputError(message);
  }
  const dobMessage = validateChildDateOfBirth(values.childDateOfBirth);
  if (dobMessage) throw new RegistrationInputError(dobMessage);

  const [activeCampaign, siblingCampaign] = await Promise.all([
    loadActiveRegistrationCampaign(client, YOUNG_EAGLES_ORGANIZATION_ID),
    loadSiblingRegistrationCampaign(client, YOUNG_EAGLES_ORGANIZATION_ID),
  ]);
  const campaign = resolveDisplayedRegistrationCampaign({
    siblingEnrolled: values.siblingEnrolled,
    siblingCampaign,
    typedCampaign: null,
    autoCampaign: activeCampaign,
  });

  const result = await persistYoungEagles2027Registration(client, {
    organizationId: YOUNG_EAGLES_ORGANIZATION_ID,
    values,
    campaign,
  });

  return {
    ...result,
    guardianEmail: values.email,
    guardianName: values.guardianLegalName,
    childName: values.childLegalName,
  };
}
