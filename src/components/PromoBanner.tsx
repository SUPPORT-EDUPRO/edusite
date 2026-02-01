'use client';

import { Gift,Sparkles, Timer, X } from 'lucide-react';
import { useState } from 'react';

interface PromoBannerProps {
  code?: string;
  discountValue?: number;
  discountType?: 'percentage' | 'fixed_amount' | 'waive_registration' | 'first_month_free';
  endDate?: string;
}

export function PromoBanner({ 
  code = 'WELCOME2026', 
  discountValue = 50,
  discountType = 'percentage',
  endDate = '2026-04-01'
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const daysRemaining = Math.ceil(
    (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const discountLabel = (() => {
    if (discountType === 'percentage') return `${discountValue}% OFF`;
    if (discountType === 'fixed_amount') return `R${discountValue} OFF`;
    if (discountType === 'waive_registration') return '100% OFF';
    if (discountType === 'first_month_free') return 'First Month Free';
    return `${discountValue}% OFF`;
  })();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 animate-gradient-x">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left section - Icon and headline */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Gift className="h-6 w-6 text-white animate-bounce" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <h3 className="text-lg font-bold sm:text-xl lg:text-2xl">
                  Limited Time Offer!
                </h3>
              </div>
              <p className="text-sm text-white/90 sm:text-base">
                Get <span className="font-extrabold text-yellow-300 text-xl sm:text-2xl">{discountLabel}</span> registration fees
              </p>
            </div>
          </div>

          {/* Center section - Promo code */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg border-2 border-white/50">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Use Code</p>
                <p className="text-2xl font-black text-purple-600 font-mono tracking-wider">
                  {code}
                </p>
              </div>
            </div>

            {/* Timer badge */}
            {daysRemaining > 0 && (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 shadow-lg">
                <Timer className="h-5 w-5 text-orange-700 animate-pulse" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-orange-900 uppercase">Only</p>
                  <p className="text-lg font-black text-orange-900 leading-none">
                    {daysRemaining}
                  </p>
                  <p className="text-xs font-semibold text-orange-900">
                    {daysRemaining === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right section - CTA and close button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const element = document.getElementById('registration-form');
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="group relative overflow-hidden rounded-lg bg-white px-6 py-3 font-bold text-purple-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Claim Discount
                <Sparkles className="h-4 w-4 animate-spin" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 opacity-0 transition-opacity group-hover:opacity-20" />
            </button>

            <button
              onClick={() => setIsVisible(false)}
              className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Close banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile timer */}
        {daysRemaining > 0 && (
          <div className="mt-3 flex justify-center sm:hidden">
            <div className="flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 shadow-lg">
              <Timer className="h-4 w-4 text-orange-700 animate-pulse" />
              <p className="text-sm font-bold text-orange-900">
                Only {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}
