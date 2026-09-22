import { loadActiveRegistrationCampaign } from '@/lib/load-registration-campaign';
import {
  applyRegistrationFeeDiscount,
  buildRegistrationCampaignPersistFields,
  evaluateRegistrationCampaignCode,
  type MarketingCampaignRow,
  resolveDisplayedRegistrationCampaign,
  selectActiveRegistrationCampaign,
  selectSiblingRegistrationCampaign,
} from '@/lib/registration-campaign';
import { YOUNG_EAGLES_REGISTRATION_FEE_RAND } from '@/lib/young-eagles-fees';

const YOUNG_EAGLES_ORG = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';
const OTHER_ORG = '11111111-2222-3333-4444-555555555555';
const NOW = new Date('2026-09-22T10:00:00+02:00');

function campaign(overrides: Partial<MarketingCampaignRow> = {}): MarketingCampaignRow {
  return {
    id: 'campaign-ye',
    organization_id: YOUNG_EAGLES_ORG,
    name: 'Young Eagles early bird',
    promo_code: 'EAGLES50',
    discount_type: 'percentage',
    discount_value: 50,
    current_redemptions: 2,
    max_redemptions: 40,
    active: true,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    campaign_type: 'early_bird',
    auto_apply: true,
    featured: true,
    ...overrides,
  };
}

describe('tenant-scoped registration campaigns', () => {
  it('hides the banner when the organization has no redeemable campaign', () => {
    expect(selectActiveRegistrationCampaign([], YOUNG_EAGLES_ORG, NOW)).toBeNull();
    expect(
      selectActiveRegistrationCampaign(
        [campaign({ active: false }), campaign({ promo_code: null })],
        YOUNG_EAGLES_ORG,
        NOW,
      ),
    ).toBeNull();
  });

  it('applies 50% of R400 as R200, not R50 off', () => {
    const view = selectActiveRegistrationCampaign([campaign()], YOUNG_EAGLES_ORG, NOW);
    expect(view).toMatchObject({
      code: 'EAGLES50',
      discountType: 'percentage',
      discountValue: 50,
      discountAmount: 200,
      finalAmount: 200,
      remaining: 38,
    });
    expect(applyRegistrationFeeDiscount(campaign(), YOUNG_EAGLES_REGISTRATION_FEE_RAND)).toEqual({
      discountType: 'percentage',
      discountValue: 50,
      discountAmount: 200,
      finalAmount: 200,
    });
    expect(
      applyRegistrationFeeDiscount(
        { discount_type: 'fixed_amount', discount_value: 50 },
        YOUNG_EAGLES_REGISTRATION_FEE_RAND,
      ).discountAmount,
    ).toBe(50);
  });

  it('does not apply expired, not-yet-started, or exhausted campaigns', () => {
    expect(
      selectActiveRegistrationCampaign(
        [campaign({ end_date: '2026-09-01' })],
        YOUNG_EAGLES_ORG,
        NOW,
      ),
    ).toBeNull();
    expect(
      selectActiveRegistrationCampaign(
        [campaign({ start_date: '2026-10-01' })],
        YOUNG_EAGLES_ORG,
        NOW,
      ),
    ).toBeNull();
    expect(
      evaluateRegistrationCampaignCode(
        [campaign({ current_redemptions: 40, max_redemptions: 40 })],
        YOUNG_EAGLES_ORG,
        'EAGLES50',
        NOW,
      ).status,
    ).toBe('exhausted');
    expect(
      evaluateRegistrationCampaignCode(
        [campaign({ end_date: '2026-09-01' })],
        YOUNG_EAGLES_ORG,
        'EAGLES50',
        NOW,
      ).status,
    ).toBe('expired');
  });

  it('never selects another organization campaign for Young Eagles', () => {
    const otherSchool = campaign({
      id: 'campaign-other',
      organization_id: OTHER_ORG,
      promo_code: 'OTHER50',
    });
    expect(selectActiveRegistrationCampaign([otherSchool], YOUNG_EAGLES_ORG, NOW)).toBeNull();
    expect(
      evaluateRegistrationCampaignCode([otherSchool], YOUNG_EAGLES_ORG, 'OTHER50', NOW).status,
    ).toBe('not_found');
    expect(selectActiveRegistrationCampaign([otherSchool], OTHER_ORG, NOW)?.code).toBe('OTHER50');
  });

  it('builds persist fields for campaign id, code, discount type/value, and discounted amount', () => {
    const view = selectActiveRegistrationCampaign([campaign()], YOUNG_EAGLES_ORG, NOW);
    expect(buildRegistrationCampaignPersistFields({ campaign: view })).toEqual({
      campaign_applied: 'campaign-ye',
      coupon_code: 'EAGLES50',
      discount_amount: 200,
      registration_fee_amount: 200,
      campaign_snapshot: {
        campaign_id: 'campaign-ye',
        campaign_code: 'EAGLES50',
        discount_type: 'percentage',
        discount_value: 50,
        discount_amount: 200,
        registration_fee_amount: 200,
      },
    });
    expect(
      buildRegistrationCampaignPersistFields({
        campaign: null,
        typedCode: 'OTHER50',
      }),
    ).toEqual({
      campaign_applied: null,
      coupon_code: 'OTHER50',
      discount_amount: 0,
      registration_fee_amount: 400,
      campaign_snapshot: null,
    });
  });

  it('loads campaigns only for the requested organization id', async () => {
    const filters: Array<[string, unknown]> = [];
    const client = {
      from: (table: string) => {
        expect(table).toBe('marketing_campaigns');
        return {
          select: () => ({
            eq: (column: string, value: unknown) => {
              filters.push([column, value]);
              return {
                eq: (column2: string, value2: unknown) => {
                  filters.push([column2, value2]);
                  return Promise.resolve({ data: [], error: null });
                },
              };
            },
          }),
        };
      },
    };

    await loadActiveRegistrationCampaign(client as never, YOUNG_EAGLES_ORG);
    expect(filters).toEqual([
      ['organization_id', YOUNG_EAGLES_ORG],
      ['active', true],
    ]);
  });
});

describe('sibling registration campaign', () => {
  const sibling = campaign({
    id: 'campaign-sibling',
    name: 'Sibling Discount',
    promo_code: 'SIBLING',
    discount_type: 'waive_registration',
    discount_value: 0,
    campaign_type: 'sibling_discount',
    auto_apply: false,
    featured: false,
  });

  it('waives the full R400 registration fee', () => {
    expect(applyRegistrationFeeDiscount(sibling, YOUNG_EAGLES_REGISTRATION_FEE_RAND)).toEqual({
      discountType: 'waive_registration',
      discountValue: 0,
      discountAmount: 400,
      finalAmount: 0,
    });
  });

  it('does not auto-apply sibling over early bird', () => {
    expect(selectActiveRegistrationCampaign([campaign(), sibling], YOUNG_EAGLES_ORG, NOW)?.code).toBe(
      'EAGLES50',
    );
  });

  it('selects the sibling waiver only when asked for the sibling campaign', () => {
    const view = selectSiblingRegistrationCampaign([campaign(), sibling], YOUNG_EAGLES_ORG, NOW);
    expect(view).toMatchObject({
      code: 'SIBLING',
      discountType: 'waive_registration',
      discountAmount: 400,
      finalAmount: 0,
    });
    expect(selectSiblingRegistrationCampaign([campaign()], YOUNG_EAGLES_ORG, NOW)).toBeNull();
    expect(
      selectSiblingRegistrationCampaign(
        [sibling, campaign({ ...sibling, organization_id: OTHER_ORG, id: 'other-sibling' })],
        OTHER_ORG,
        NOW,
      )?.code,
    ).toBe('SIBLING');
  });

  it('ignores expired or other-tenant sibling campaigns', () => {
    expect(
      selectSiblingRegistrationCampaign([sibling], OTHER_ORG, NOW),
    ).toBeNull();
    expect(
      selectSiblingRegistrationCampaign(
        [campaign({ ...sibling, end_date: '2026-09-01' })],
        YOUNG_EAGLES_ORG,
        NOW,
      ),
    ).toBeNull();
  });

  it('uses the sibling campaign on the form when the sibling checkbox is checked', () => {
    const earlyBird = selectActiveRegistrationCampaign([campaign(), sibling], YOUNG_EAGLES_ORG, NOW);
    const siblingView = selectSiblingRegistrationCampaign([campaign(), sibling], YOUNG_EAGLES_ORG, NOW);

    expect(
      resolveDisplayedRegistrationCampaign({
        siblingEnrolled: true,
        siblingCampaign: siblingView,
        typedCampaign: earlyBird,
        autoCampaign: earlyBird,
      })?.code,
    ).toBe('SIBLING');
    expect(
      resolveDisplayedRegistrationCampaign({
        siblingEnrolled: false,
        siblingCampaign: siblingView,
        typedCampaign: null,
        autoCampaign: earlyBird,
      })?.code,
    ).toBe('EAGLES50');
  });
});
