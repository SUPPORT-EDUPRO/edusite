import {
  formatYoungEaglesRand,
  formatYoungEaglesRandWithCents,
  YOUNG_EAGLES_AFTERCARE_FEE_RAND,
  YOUNG_EAGLES_MONTHLY_FEES,
  YOUNG_EAGLES_REGISTRATION_FEE_RAND,
} from '@/lib/young-eagles-fees';

describe('Young Eagles published fees', () => {
  it('sets the baby monthly fee at R950, aftercare at R300.00, and registration at R400', () => {
    expect(YOUNG_EAGLES_REGISTRATION_FEE_RAND).toBe(400);
    expect(YOUNG_EAGLES_AFTERCARE_FEE_RAND).toBe(300);
    expect(formatYoungEaglesRandWithCents(YOUNG_EAGLES_AFTERCARE_FEE_RAND)).toBe('R300.00');
    expect(YOUNG_EAGLES_MONTHLY_FEES[0]).toMatchObject({
      id: 'baby',
      label: '6 months - 1 year',
      amountRand: 950,
    });
    expect(formatYoungEaglesRand(YOUNG_EAGLES_MONTHLY_FEES[0].amountRand)).toBe('R950');
    expect(YOUNG_EAGLES_MONTHLY_FEES.map((tier) => tier.amountRand)).toEqual([950, 720, 680]);
  });
});
