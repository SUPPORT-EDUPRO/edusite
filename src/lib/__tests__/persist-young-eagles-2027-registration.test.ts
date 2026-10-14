import { CURRENT_ACADEMIC_YEAR, defaultPreferredStartDate } from '@/lib/academic-year';
import {
  buildYoungEagles2027RegistrationRow,
  persistYoungEagles2027Registration,
  splitPersonName,
} from '@/lib/persist-young-eagles-2027-registration';
import { initialYoungEagles2027RegistrationState } from '@/lib/young-eagles-2027-registration';
import { YOUNG_EAGLES_ORGANIZATION_ID } from '@/lib/young-eagles-registration';

const values = {
  ...initialYoungEagles2027RegistrationState,
  guardianLegalName: 'Naledi Mokoena',
  email: 'naledi@example.com',
  mobile: '+27 72 000 0000',
  relationship: 'Parent',
  childLegalName: 'Amahle Mokoena',
  childDateOfBirth: '2020-04-12',
  intendedStart: 'Start of the 2027 school year',
  siblingEnrolled: true,
  termsConsent: true,
  contactConsent: true,
  mediaPermission: 'yes' as const,
};

const campaign = {
  id: 'campaign-sibling',
  organizationId: YOUNG_EAGLES_ORGANIZATION_ID,
  code: 'SIBLING',
  name: 'Sibling waiver',
  discountType: 'waive_registration' as const,
  discountValue: 0,
  discountAmount: 400,
  finalAmount: 0,
  remaining: 8,
  maxRedemptions: 20,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  autoApply: false,
};

describe('persistYoungEagles2027Registration', () => {
  it('splits a child legal name without inventing a surname', () => {
    expect(splitPersonName('Amahle Mokoena')).toEqual({
      firstName: 'Amahle',
      lastName: 'Mokoena',
    });
    expect(splitPersonName('Amahle')).toEqual({
      firstName: 'Amahle',
      lastName: 'Amahle',
    });
  });

  it('builds a Young Eagles 2027 insert for the live tenant only', () => {
    const built = buildYoungEagles2027RegistrationRow({
      organizationId: YOUNG_EAGLES_ORGANIZATION_ID,
      values,
      campaign,
    });

    expect(built.row.organization_id).toBe(YOUNG_EAGLES_ORGANIZATION_ID);
    expect(built.row.academic_year).toBe(CURRENT_ACADEMIC_YEAR);
    expect(built.row.preferred_start_date).toBe(defaultPreferredStartDate());
    expect(built.row.student_first_name).toBe('Amahle');
    expect(built.row.student_last_name).toBe('Mokoena');
    expect(built.row.sibling_enrolled).toBe(true);
    expect(built.row.campaign_applied).toBe('campaign-sibling');
    expect(built.row.coupon_code).toBe('SIBLING');
    expect(built.row.discount_amount).toBe(400);
    expect(built.row.registration_fee_amount).toBe(0);
    expect(built.row.terms_accepted).toBe(true);
  });

  it('rejects a forged organization id', () => {
    expect(() =>
      buildYoungEagles2027RegistrationRow({
        organizationId: '00000000-0000-0000-0000-000000000000',
        values,
        campaign: null,
      }),
    ).toThrow('Young Eagles registration can only be submitted for Young Eagles Preschool.');
  });

  it('persists a pending row and rejects a duplicate child', async () => {
    let inserted = null as Record<string, unknown> | null;
    const client = {
      from() {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async maybeSingle() {
            return { data: inserted ? { id: 'existing', status: 'pending' } : null };
          },
          insert(row: Record<string, unknown>) {
            inserted = row;
            return {
              select() {
                return this;
              },
              async single() {
                return { data: { id: 'reg-1' }, error: null };
              },
            };
          },
        };
      },
    };

    const first = await persistYoungEagles2027Registration(client as never, {
      organizationId: YOUNG_EAGLES_ORGANIZATION_ID,
      values,
      campaign: null,
    });
    expect(first.id).toBe('reg-1');
    expect(inserted?.academic_year).toBe(CURRENT_ACADEMIC_YEAR);
    expect(inserted?.organization_id).toBe(YOUNG_EAGLES_ORGANIZATION_ID);
    expect(inserted?.status).toBe('pending');

    await expect(
      persistYoungEagles2027Registration(client as never, {
        organizationId: YOUNG_EAGLES_ORGANIZATION_ID,
        values,
        campaign: null,
      }),
    ).rejects.toThrow('already exists');
  });
});
