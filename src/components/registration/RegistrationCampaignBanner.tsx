'use client';

import type { RegistrationCampaignView } from '@/lib/registration-campaign';
import {
  formatYoungEaglesRandWithCents,
  YOUNG_EAGLES_REGISTRATION_FEE_RAND,
} from '@/lib/young-eagles-fees';

interface RegistrationCampaignBannerProps {
  campaign: RegistrationCampaignView;
  baseFeeRand?: number;
}

export function RegistrationCampaignBanner({
  campaign,
  baseFeeRand = YOUNG_EAGLES_REGISTRATION_FEE_RAND,
}: RegistrationCampaignBannerProps) {
  const discountLabel =
    campaign.discountType === 'percentage'
      ? `${campaign.discountValue}% OFF`
      : campaign.discountType === 'waive_registration'
        ? 'FEE WAIVED'
        : `R${campaign.discountAmount} OFF`;

  const spotsLeft =
    campaign.remaining != null && campaign.remaining > 0 ? campaign.remaining : null;

  return (
    <aside
      aria-label={`${campaign.code} registration campaign`}
      className="mb-6 rounded-[20px] border border-[#d9d0fb] bg-gradient-to-r from-[#f8f5ff] to-[#fff6ee] p-4 shadow-[0_8px_24px_rgba(118,81,214,0.10)] sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
          <div className="rounded-xl bg-[#efe9ff] px-4 py-2">
            <p className="text-[11px] font-extrabold tracking-[0.12em] text-[#6d4ccc] uppercase">
              Promo code
            </p>
            <p className="font-mono text-xl font-extrabold text-[#4b2fa8]">{campaign.code}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#64748b]">Registration fee</p>
            <p className="text-lg font-extrabold text-[#172f56]">
              <span className="font-bold text-[#94a3b8] line-through">
                {formatYoungEaglesRandWithCents(baseFeeRand)}
              </span>
              <span aria-hidden="true" className="mx-2 text-[#238265]">
                →
              </span>
              <span className="text-[#238265]">
                {formatYoungEaglesRandWithCents(campaign.finalAmount)}
              </span>
            </p>
            <p className="text-xs font-bold text-[#6d4ccc]">{discountLabel}</p>
          </div>
        </div>
        {spotsLeft != null ? (
          <span
            className={`rounded-full px-4 py-2 text-sm font-extrabold text-white ${
              spotsLeft <= 10 ? 'bg-red-600' : spotsLeft <= 25 ? 'bg-orange-500' : 'bg-[#6d4ccc]'
            }`}
          >
            {spotsLeft} spots left
          </span>
        ) : null}
      </div>
    </aside>
  );
}
