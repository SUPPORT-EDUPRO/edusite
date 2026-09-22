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

  return (
    <aside
      aria-label={`${campaign.code} registration campaign`}
      className="-mt-2 -mx-2 mb-6 overflow-hidden rounded-xl border-2 border-purple-500 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-1 shadow-lg"
    >
      <div className="flex flex-col items-center justify-between gap-3 rounded-lg bg-white px-5 py-4 sm:flex-row dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 px-4 py-2 dark:bg-purple-900/50">
            <p className="text-xs font-semibold tracking-wider text-purple-600 uppercase dark:text-purple-400">
              Promo Code
            </p>
            <p className="font-mono text-xl font-bold text-purple-700 sm:text-2xl dark:text-purple-300">
              {campaign.code}
            </p>
          </div>
          <div className="border-l border-gray-200 pl-4 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">Registration fee</p>
            <p className="text-lg font-bold">
              <span className="text-gray-400 line-through dark:text-gray-500">
                {formatYoungEaglesRandWithCents(baseFeeRand)}
              </span>
              <span className="mx-2 text-green-600 dark:text-green-400">→</span>
              <span className="text-green-600 dark:text-green-500">
                {formatYoungEaglesRandWithCents(campaign.finalAmount)}
              </span>
            </p>
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">{discountLabel}</p>
          </div>
        </div>
        {campaign.remaining != null && campaign.remaining > 0 ? (
          <span
            className={`rounded-full px-4 py-2 text-sm font-bold text-white ${
              campaign.remaining <= 10
                ? 'bg-red-600'
                : campaign.remaining <= 25
                  ? 'bg-orange-500'
                  : 'bg-purple-600'
            }`}
          >
            {campaign.remaining} spots left
          </span>
        ) : null}
      </div>
    </aside>
  );
}
