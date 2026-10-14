import {
  buildStartupTuitionFees,
  type FeeStructureRow,
  isTuitionFee,
} from '@/lib/registration-fees';

// The active Young Eagles structures as they are in the live database.
const structures: FeeStructureRow[] = [
  {
    id: 'uniform',
    amount: 500,
    fee_type: 'uniform',
    name: 'Uniform Set',
    effective_from: '2026-01-28',
  },
  {
    id: 'reg',
    amount: 400,
    fee_type: 'registration',
    name: 'Registration Fee',
    effective_from: '2026-01-07',
  },
  {
    id: 'age4-6',
    amount: 680,
    fee_type: 'tuition',
    name: 'Monthly School Fees - Ages 4-6',
    grade_levels: ['4-6 years'],
    age_min_months: 48,
    age_max_months: 83,
    effective_from: '2026-01-02',
  },
  {
    id: 'age1-3',
    amount: 720,
    fee_type: 'tuition',
    name: 'Monthly School Fees - Ages 1-3',
    grade_levels: ['1-3 years'],
    age_min_months: 12,
    age_max_months: 47,
    effective_from: '2026-01-13',
  },
];

describe('isTuitionFee', () => {
  it('recognises tuition and monthly school fees only', () => {
    expect(isTuitionFee('tuition', 'x')).toBe(true);
    expect(isTuitionFee('registration', 'Registration Fee')).toBe(false);
    expect(isTuitionFee('uniform', 'Uniform Set')).toBe(false);
  });
});

describe('buildStartupTuitionFees', () => {
  it('bills the start month and the next one at the age-appropriate tuition', () => {
    const fees = buildStartupTuitionFees({
      studentId: 'student-1',
      structures,
      dateOfBirth: '2024-03-03',
      enrollmentDate: '2027-01-12',
    });
    expect(fees.map((fee) => fee.billing_month)).toEqual(['2027-01-01', '2027-02-01']);
    expect(fees.every((fee) => fee.fee_structure_id === 'age1-3' && fee.amount === 720)).toBe(true);
    expect(fees[0]).toMatchObject({
      category_code: 'tuition',
      status: 'pending',
      amount_outstanding: 720,
    });
  });

  it('rolls December into January of the next year', () => {
    const fees = buildStartupTuitionFees({
      studentId: 's',
      structures,
      dateOfBirth: '2021-01-01',
      enrollmentDate: '2026-12-01',
    });
    expect(fees.map((fee) => fee.billing_month)).toEqual(['2026-12-01', '2027-01-01']);
    expect(fees[0]?.fee_structure_id).toBe('age4-6');
  });

  it('creates nothing when there is no tuition structure', () => {
    expect(
      buildStartupTuitionFees({
        studentId: 's',
        structures: structures.filter((fee) => fee.fee_type !== 'tuition'),
        dateOfBirth: '2024-03-03',
        enrollmentDate: '2027-01-12',
      }),
    ).toEqual([]);
  });
});
