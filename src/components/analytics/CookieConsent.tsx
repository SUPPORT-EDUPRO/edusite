'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { grantAnalyticsConsent, revokeAnalyticsConsent } from './PostHogProvider';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    grantAnalyticsConsent();
    setShowBanner(false);
  };

  const handleDecline = () => {
    revokeAnalyticsConsent();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-stone-200 bg-white p-4 shadow-lg md:p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h3 className="mb-2 font-semibold text-stone-900">Cookie Preferences</h3>
            <p className="text-sm text-stone-600">
              We use cookies to improve your experience and analyze site traffic in compliance with{' '}
              <Link href="/legal/privacy" className="text-amber-600 underline hover:text-amber-700">
                POPIA
              </Link>
              . You can manage your preferences at any time in our{' '}
              <Link
                href="/legal/cookie-policy"
                className="text-amber-600 underline hover:text-amber-700"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="rounded-lg border-2 border-stone-300 px-6 py-2 font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="rounded-lg bg-amber-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-amber-700"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
