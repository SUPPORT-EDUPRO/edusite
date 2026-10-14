import { randomInt } from 'crypto';

export const STUDENT_ID_SEQUENCE_LENGTH = 4;
export const STUDENT_ID_MAX_ATTEMPTS = 6;

/** Same student-ID scheme as the EduDash Pro app (e.g. YOU-26-0081). */
export function normalizeOrgCode(value: string | null | undefined): string {
  const cleaned = (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length >= 3) return cleaned.slice(0, 3);
  if (cleaned.length > 0) return cleaned.padEnd(3, 'X');
  return 'STU';
}

export function getStudentIdPrefix(
  schoolName: string | null | undefined,
  now = new Date(),
): string {
  const year = String(now.getFullYear()).slice(-2);
  return `${normalizeOrgCode(schoolName)}-${year}-`;
}

export function getHighestStudentSequence(
  studentIds: Array<string | null | undefined>,
  prefix: string,
): number {
  const pattern = new RegExp(`^\\d{${STUDENT_ID_SEQUENCE_LENGTH}}$`);
  return studentIds.reduce((highest, studentId) => {
    if (!studentId?.startsWith(prefix)) return highest;
    const suffix = studentId.slice(prefix.length);
    return pattern.test(suffix) ? Math.max(highest, Number.parseInt(suffix, 10)) : highest;
  }, 0);
}

export function formatStudentId(prefix: string, sequence: number): string {
  return `${prefix}${String(sequence).padStart(STUDENT_ID_SEQUENCE_LENGTH, '0')}`;
}

/** A registration fee must be verified before approval unless it is waived or zero. */
export function requiresVerifiedPayment(registration: {
  registration_fee_amount?: number | string | null;
  registration_fee_waived?: boolean | null;
}): boolean {
  if (registration.registration_fee_waived) return false;
  return Number(registration.registration_fee_amount ?? 0) > 0;
}

const PASSWORD_CHARSET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';

export function generateSecurePassword(length = 14): string {
  let password = '';
  for (let index = 0; index < length; index += 1) {
    password += PASSWORD_CHARSET.charAt(randomInt(PASSWORD_CHARSET.length));
  }
  return password;
}

export function resolveEnrollmentDate(
  preferredStartDate: string | null | undefined,
  today = new Date(),
): string {
  if (preferredStartDate && /^\d{4}-\d{2}-\d{2}/.test(preferredStartDate)) {
    return preferredStartDate.slice(0, 10);
  }
  return today.toISOString().slice(0, 10);
}
