import { YOUNG_EAGLES_REGISTRATION_FEE_RAND } from '@/lib/young-eagles-fees';

export const REGISTRATION_CAMPAIGN_PERCENTAGE = 50;
export const MARKETING_CAMPAIGN_PUBLIC_COLUMNS =
  'id, organization_id, name, promo_code, discount_type, discount_value, current_redemptions, max_redemptions, active, start_date, end_date, campaign_type, auto_apply, featured';

export interface MarketingCampaignRow {
  id: string;
  organization_id: string;
  name?: string | null;
  promo_code?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  current_redemptions?: number | null;
  max_redemptions?: number | null;
  active?: boolean | null;
  start_date?: string | null;
  end_date?: string | null;
  campaign_type?: string | null;
  auto_apply?: boolean | null;
  featured?: boolean | null;
}

export interface RegistrationCampaignView {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  remaining: number | null;
  maxRedemptions: number | null;
  startDate: string;
  endDate: string;
  autoApply: boolean;
}

export interface RegistrationCampaignPersistFields {
  campaign_applied: string | null;
  coupon_code: string | null;
  discount_amount: number;
  registration_fee_amount: number;
  campaign_snapshot: {
    campaign_id: string;
    campaign_code: string;
    discount_type: string;
    discount_value: number;
    discount_amount: number;
    registration_fee_amount: number;
  } | null;
}

function parseCampaignBoundary(value: string, boundary: 'start' | 'end'): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const suffix = boundary === 'start' ? 'T00:00:00+02:00' : 'T23:59:59.999+02:00';
    return new Date(`${value}${suffix}`);
  }
  return new Date(value);
}

export function remainingCampaignRedemptions(campaign: MarketingCampaignRow): number | null {
  if (campaign.max_redemptions == null) return null;
  return Math.max(0, campaign.max_redemptions - (campaign.current_redemptions ?? 0));
}

export function isCampaignInDateWindow(campaign: MarketingCampaignRow, now = new Date()): boolean {
  if (campaign.start_date) {
    const start = parseCampaignBoundary(campaign.start_date, 'start');
    if (!Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) return false;
  }
  if (campaign.end_date) {
    const end = parseCampaignBoundary(campaign.end_date, 'end');
    if (!Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) return false;
  }
  return true;
}

export function isCampaignRedeemable(
  campaign: MarketingCampaignRow,
  organizationId: string,
  now = new Date(),
): boolean {
  if (campaign.organization_id !== organizationId) return false;
  if (campaign.active === false) return false;
  if (!campaign.promo_code?.trim()) return false;
  if (!isCampaignInDateWindow(campaign, now)) return false;
  const remaining = remainingCampaignRedemptions(campaign);
  if (remaining != null && remaining <= 0) return false;
  return true;
}

export function applyRegistrationFeeDiscount(
  campaign: Pick<MarketingCampaignRow, 'discount_type' | 'discount_value'>,
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): { discountType: string; discountValue: number; discountAmount: number; finalAmount: number } {
  const discountType = campaign.discount_type || 'percentage';
  const discountValue = Number(campaign.discount_value ?? 0);
  let discountAmount = 0;

  if (discountType === 'percentage') {
    discountAmount = Math.round(baseFeeRand * (discountValue / 100));
  } else if (discountType === 'fixed_amount' || discountType === 'fixed') {
    discountAmount = Math.round(discountValue);
  } else if (discountType === 'waive_registration') {
    discountAmount = baseFeeRand;
  }

  discountAmount = Math.min(Math.max(0, discountAmount), baseFeeRand);
  return {
    discountType,
    discountValue,
    discountAmount,
    finalAmount: Math.max(0, baseFeeRand - discountAmount),
  };
}

export function toRegistrationCampaignView(
  campaign: MarketingCampaignRow,
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): RegistrationCampaignView | null {
  const code = campaign.promo_code?.trim();
  if (!code) return null;
  const applied = applyRegistrationFeeDiscount(campaign, baseFeeRand);
  if (applied.discountAmount <= 0) return null;
  return {
    id: campaign.id,
    organizationId: campaign.organization_id,
    code,
    name: campaign.name?.trim() || code,
    discountType: applied.discountType,
    discountValue: applied.discountValue,
    discountAmount: applied.discountAmount,
    finalAmount: applied.finalAmount,
    remaining: remainingCampaignRedemptions(campaign),
    maxRedemptions: campaign.max_redemptions ?? null,
    startDate: campaign.start_date || '',
    endDate: campaign.end_date || '',
    autoApply: campaign.auto_apply === true,
  };
}

function campaignRank(campaign: MarketingCampaignRow): number {
  let rank = 0;
  if (campaign.featured) rank += 8;
  if (campaign.auto_apply) rank += 4;
  if (campaign.campaign_type === 'early_bird') rank += 2;
  if (campaign.discount_type === 'percentage' && Number(campaign.discount_value) === REGISTRATION_CAMPAIGN_PERCENTAGE) {
    rank += 1;
  }
  return rank;
}

export function isSiblingRegistrationCampaign(campaign: MarketingCampaignRow): boolean {
  return campaign.campaign_type === 'sibling_discount';
}

export function selectSiblingRegistrationCampaign(
  rows: MarketingCampaignRow[],
  organizationId: string,
  now = new Date(),
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): RegistrationCampaignView | null {
  const eligible = rows
    .filter((row) => isCampaignRedeemable(row, organizationId, now))
    .filter((row) => isSiblingRegistrationCampaign(row))
    .map((row) => ({ row, view: toRegistrationCampaignView(row, baseFeeRand) }))
    .filter((entry): entry is { row: MarketingCampaignRow; view: RegistrationCampaignView } => entry.view != null)
    .sort((left, right) => {
      const waiveDelta =
        Number(right.row.discount_type === 'waive_registration') -
        Number(left.row.discount_type === 'waive_registration');
      if (waiveDelta !== 0) return waiveDelta;
      return right.view.discountAmount - left.view.discountAmount;
    });

  return eligible[0]?.view ?? null;
}

export function resolveDisplayedRegistrationCampaign(input: {
  siblingEnrolled: boolean;
  siblingCampaign: RegistrationCampaignView | null;
  typedCampaign: RegistrationCampaignView | null;
  autoCampaign: RegistrationCampaignView | null;
}): RegistrationCampaignView | null {
  if (input.siblingEnrolled && input.siblingCampaign) return input.siblingCampaign;
  return input.typedCampaign ?? input.autoCampaign;
}

export function selectActiveRegistrationCampaign(
  rows: MarketingCampaignRow[],
  organizationId: string,
  now = new Date(),
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): RegistrationCampaignView | null {
  const eligible = rows
    .filter((row) => isCampaignRedeemable(row, organizationId, now))
    .filter((row) => toRegistrationCampaignView(row, baseFeeRand) != null)
    .sort((left, right) => {
      const rankDelta = campaignRank(right) - campaignRank(left);
      if (rankDelta !== 0) return rankDelta;
      const remainingDelta =
        (remainingCampaignRedemptions(right) ?? Number.POSITIVE_INFINITY) -
        (remainingCampaignRedemptions(left) ?? Number.POSITIVE_INFINITY);
      if (remainingDelta !== 0) return remainingDelta;
      return String(right.start_date || '').localeCompare(String(left.start_date || ''));
    });

  const selected = eligible[0];
  return selected ? toRegistrationCampaignView(selected, baseFeeRand) : null;
}

export function evaluateRegistrationCampaignCode(
  rows: MarketingCampaignRow[],
  organizationId: string,
  code: string,
  now = new Date(),
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): {
  status: 'empty' | 'not_found' | 'expired' | 'exhausted' | 'applied';
  view: RegistrationCampaignView | null;
  remaining: number | null;
  maxRedemptions: number | null;
} {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { status: 'empty', view: null, remaining: null, maxRedemptions: null };
  }

  const match = rows.find(
    (row) =>
      row.organization_id === organizationId && row.promo_code?.trim().toUpperCase() === normalized,
  );

  if (!match) {
    return { status: 'not_found', view: null, remaining: null, maxRedemptions: null };
  }

  const remaining = remainingCampaignRedemptions(match);
  if (!isCampaignInDateWindow(match, now) || match.active === false) {
    return {
      status: 'expired',
      view: null,
      remaining,
      maxRedemptions: match.max_redemptions ?? null,
    };
  }
  if (remaining != null && remaining <= 0) {
    return {
      status: 'exhausted',
      view: null,
      remaining: 0,
      maxRedemptions: match.max_redemptions ?? null,
    };
  }

  return {
    status: 'applied',
    view: toRegistrationCampaignView(match, baseFeeRand),
    remaining,
    maxRedemptions: match.max_redemptions ?? null,
  };
}

export function matchRegistrationCampaignByCode(
  rows: MarketingCampaignRow[],
  organizationId: string,
  code: string,
  now = new Date(),
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
): RegistrationCampaignView | null {
  return evaluateRegistrationCampaignCode(rows, organizationId, code, now, baseFeeRand).view;
}

export function buildRegistrationCampaignPersistFields(input: {
  campaign: RegistrationCampaignView | null;
  typedCode?: string;
  baseFeeRand?: number;
}): RegistrationCampaignPersistFields {
  const baseFeeRand = input.baseFeeRand ?? YOUNG_EAGLES_REGISTRATION_FEE_RAND;
  const typedCode = input.typedCode?.trim().toUpperCase() || null;
  if (!input.campaign) {
    return {
      campaign_applied: null,
      coupon_code: typedCode,
      discount_amount: 0,
      registration_fee_amount: baseFeeRand,
      campaign_snapshot: null,
    };
  }

  return {
    campaign_applied: input.campaign.id,
    coupon_code: input.campaign.code,
    discount_amount: input.campaign.discountAmount,
    registration_fee_amount: input.campaign.finalAmount,
    campaign_snapshot: {
      campaign_id: input.campaign.id,
      campaign_code: input.campaign.code,
      discount_type: input.campaign.discountType,
      discount_value: input.campaign.discountValue,
      discount_amount: input.campaign.discountAmount,
      registration_fee_amount: input.campaign.finalAmount,
    },
  };
}
