import Link from 'next/link';

import { formatZAR, PRICING_TIERS } from '@/lib/pricing';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-amber-600 transition-colors hover:text-amber-700"
        >
          ← Back to Home
        </Link>

        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-stone-900 md:text-5xl">Pricing & Packages</h1>
          <p className="mx-auto max-w-2xl text-lg text-stone-600">
            Choose the perfect package for your ECD centre or network. All prices in South African
            Rand (ZAR).
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl border bg-stone-50 p-8 shadow-md ${
                tier.popular ? 'relative ring-4 ring-amber-500' : 'border-stone-300'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-600 px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-stone-900">{tier.name}</h2>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-stone-900">
                    {formatZAR(tier.setupFee)}
                  </div>
                  <div className="text-stone-600">One-time setup fee</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-4">
                  <div className="text-2xl font-bold text-amber-700">
                    {formatZAR(tier.monthlyPerCentre)}
                  </div>
                  <div className="text-amber-600">per month, per centre</div>
                </div>
                {tier.savingsPercent && (
                  <div className="mt-3 rounded-lg bg-amber-100 p-3 text-center">
                    <div className="font-semibold text-amber-800">
                      Save {tier.savingsPercent}% vs Solo Centre
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h3 className="mb-4 font-semibold text-stone-900">What&apos;s included:</h3>
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="mt-1 mr-2 h-5 w-5 flex-shrink-0 text-amber-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-stone-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/bulk"
                className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
                  tier.popular
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'border-2 border-amber-600 text-amber-600 hover:bg-amber-50'
                }`}
              >
                Get Quote
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-stone-300 bg-stone-50 p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-stone-900">
            What&apos;s Included in All Packages
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold text-amber-700">Technical Features</h3>
              <ul className="space-y-2 text-stone-600">
                <li>✓ .co.za domain registration</li>
                <li>✓ SSL security certificate</li>
                <li>✓ South African hosting</li>
                <li>✓ Mobile-responsive design</li>
                <li>✓ Fast page loading</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-amber-700">Content & Compliance</h3>
              <ul className="space-y-2 text-stone-600">
                <li>✓ NCF curriculum alignment</li>
                <li>✓ POPIA-compliant forms</li>
                <li>✓ Multi-language support</li>
                <li>✓ SEO optimization</li>
                <li>✓ Google Analytics integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
