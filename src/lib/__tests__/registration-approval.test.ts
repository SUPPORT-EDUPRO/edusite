/**
 * @jest-environment node
 */
import {
  formatStudentId,
  generateSecurePassword,
  getHighestStudentSequence,
  getStudentIdPrefix,
  normalizeOrgCode,
  requiresVerifiedPayment,
  resolveEnrollmentDate,
} from '@/lib/registration-approval';
import { canManageSchoolRegistrations } from '@/lib/registration-staff-policy';

const SCHOOL = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';
const OTHER = '11111111-1111-1111-1111-111111111111';

describe('student ids (match the EduDash Pro app)', () => {
  it('builds the YOU-26- style prefix and next sequence', () => {
    const prefix = getStudentIdPrefix('Young Eagles', new Date('2026-10-14T00:00:00Z'));
    expect(prefix).toBe('YOU-26-');
    const highest = getHighestStudentSequence(
      ['YOU-26-0081', 'YOU-26-0020', 'YOU-25-0999', null, 'YOU-26-abc'],
      prefix,
    );
    expect(highest).toBe(81);
    expect(formatStudentId(prefix, highest + 1)).toBe('YOU-26-0082');
  });

  it('pads short or empty school names', () => {
    expect(normalizeOrgCode('Al')).toBe('ALX');
    expect(normalizeOrgCode('')).toBe('STU');
  });
});

describe('requiresVerifiedPayment', () => {
  it('does not demand payment for waived or zero fees (sibling waiver)', () => {
    expect(requiresVerifiedPayment({ registration_fee_amount: 0 })).toBe(false);
    expect(requiresVerifiedPayment({ registration_fee_amount: '0.00' })).toBe(false);
    expect(
      requiresVerifiedPayment({ registration_fee_amount: 400, registration_fee_waived: true }),
    ).toBe(false);
  });

  it('demands payment for a positive fee', () => {
    expect(requiresVerifiedPayment({ registration_fee_amount: 200 })).toBe(true);
    expect(requiresVerifiedPayment({ registration_fee_amount: '400.00' })).toBe(true);
  });
});

describe('generateSecurePassword and enrollment date', () => {
  it('produces distinct, long passwords', () => {
    const first = generateSecurePassword();
    expect(first).toHaveLength(14);
    expect(first).not.toBe(generateSecurePassword());
  });

  it('prefers the registration start date, else today', () => {
    expect(resolveEnrollmentDate('2027-01-12')).toBe('2027-01-12');
    expect(resolveEnrollmentDate(null, new Date('2026-10-14T08:00:00Z'))).toBe('2026-10-14');
  });
});

describe('canManageSchoolRegistrations', () => {
  it('lets a principal manage only their own school', () => {
    const principal = { role: 'principal', preschool_id: SCHOOL, organization_id: SCHOOL };
    expect(canManageSchoolRegistrations(principal, SCHOOL)).toBe(true);
    expect(canManageSchoolRegistrations(principal, OTHER)).toBe(false);
    expect(canManageSchoolRegistrations(principal, null)).toBe(false);
  });

  it('lets a super admin manage any school', () => {
    expect(
      canManageSchoolRegistrations(
        { role: 'superadmin', preschool_id: null, organization_id: null },
        OTHER,
      ),
    ).toBe(true);
  });

  it('denies parents, teachers and missing profiles', () => {
    for (const role of ['parent', 'teacher', 'student', 'admin']) {
      expect(
        canManageSchoolRegistrations(
          { role, preschool_id: SCHOOL, organization_id: SCHOOL },
          SCHOOL,
        ),
      ).toBe(false);
    }
    expect(canManageSchoolRegistrations(null, SCHOOL)).toBe(false);
  });
});
