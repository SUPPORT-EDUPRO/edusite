/**
 * Pricing Configuration for EduSitePro
 * All prices in South African Rand (ZAR)
 */

export interface PricingTier {
  id: string;
  name: string;
  centres: number;
  setupFee: number;
  monthlyPerCentre: number;
  savingsPercent?: number;
  features: string[];
  popular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'solo',
    name: 'Solo Centre',
    centres: 1,
    setupFee: 2999,
    monthlyPerCentre: 199,
    features: [
      'Professional website design',
      'NCF-aligned content',
      '.co.za domain included',
      'SSL certificate',
      'Mobile responsive',
      'Basic SEO optimization',
      'Monthly updates',
      'Email support',
    ],
  },
  {
    id: 'five-pack',
    name: '5-Centre Package',
    centres: 5,
    setupFee: 11995,
    monthlyPerCentre: 179,
    savingsPercent: 20,
    popular: true,
    features: [
      'Everything in Solo Centre',
      'Priority support',
      'Bulk discount (20% off)',
      'Centralized management',
      'Multi-site analytics',
      'Quarterly strategy calls',
      'Custom branding options',
      'Social media integration',
    ],
  },
  {
    id: 'ten-pack',
    name: '10-Centre Package',
    centres: 10,
    setupFee: 19990,
    monthlyPerCentre: 159,
    savingsPercent: 33,
    features: [
      'Everything in 5-Centre Package',
      'Maximum savings (33% off)',
      'Dedicated account manager',
      'Custom template development',
      'Advanced analytics dashboard',
      'White-label options',
      'API access',
      'Training workshops',
    ],
  },
];

/**
 * Calculate total setup cost
 */
export function calculateSetupCost(centreCount: number): number {
  const tier =
    PRICING_TIERS.find((t) => centreCount <= t.centres) || PRICING_TIERS[PRICING_TIERS.length - 1];

  if (!tier) return centreCount * 2999;

  if (centreCount <= tier.centres) {
    return tier.setupFee;
  }

  // For counts beyond defined tiers, calculate based on largest tier
  const largestTier = PRICING_TIERS[PRICING_TIERS.length - 1];
  if (!largestTier) return centreCount * 2999;

  const pricePerCentre = largestTier.setupFee / largestTier.centres;
  return Math.round(centreCount * pricePerCentre);
}

/**
 * Calculate monthly cost
 */
export function calculateMonthlyCost(centreCount: number): number {
  const tier =
    PRICING_TIERS.find((t) => centreCount <= t.centres) || PRICING_TIERS[PRICING_TIERS.length - 1];

  if (!tier) return centreCount * 199;

  if (centreCount <= tier.centres) {
    return tier.monthlyPerCentre * centreCount;
  }

  // For counts beyond defined tiers, use largest tier rate
  const largestTier = PRICING_TIERS[PRICING_TIERS.length - 1];
  if (!largestTier) return centreCount * 199;

  return largestTier.monthlyPerCentre * centreCount;
}

/**
 * Calculate total first year cost
 */
export function calculateFirstYearCost(centreCount: number): number {
  const setup = calculateSetupCost(centreCount);
  const monthly = calculateMonthlyCost(centreCount);
  return setup + monthly * 12;
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercent(centreCount: number): number {
  const soloRate = PRICING_TIERS[0];
  if (!soloRate) return 0;

  const soloTotal = centreCount * (soloRate.setupFee + soloRate.monthlyPerCentre * 12);
  const bulkTotal = calculateFirstYearCost(centreCount);

  return Math.round(((soloTotal - bulkTotal) / soloTotal) * 100);
}

/**
 * Format currency in ZAR
 */
export function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
