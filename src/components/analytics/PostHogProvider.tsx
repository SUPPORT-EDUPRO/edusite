'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

let isPostHogInitialized = false;

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  const isProduction = process.env.NODE_ENV === 'production';

  // Only initialize PostHog if we have a key and we're in production or explicitly enabled
  if (posthogKey && (isProduction || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true')) {
    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        // Disable session recording by default (enable after consent)
        disable_session_recording: true,
        // Respect Do Not Track
        respect_dnt: true,
        // Don't auto-capture events until consent is given
        autocapture: false,
        // Capture page views manually
        capture_pageview: false,
        // POPIA compliance: mask all text and input values by default
        mask_all_text: true,
        mask_all_element_attributes: true,
        // Store data in South Africa region if available
        person_profiles: 'identified_only',
        // Prevent errors in development
        loaded: (_posthog) => {
          if (process.env.NODE_ENV === 'development') console.log('PostHog loaded');
        },
      });
      isPostHogInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isPostHogInitialized) return;

    // Check for analytics consent (from cookie banner)
    const consent = localStorage.getItem('analytics-consent');

    if (consent === 'granted') {
      try {
        // Enable analytics features with consent
        posthog.opt_in_capturing();

        // Only start session recording if the method exists
        if (typeof posthog.startSessionRecording === 'function') {
          posthog.startSessionRecording();
        }

        // Enable autocapture
        posthog.set_config({ autocapture: true });

        // Capture the initial page view
        posthog.capture('$pageview');
      } catch (error) {
        console.error('PostHog error:', error);
      }
    } else if (consent === 'denied') {
      posthog.opt_out_capturing();
    }
  }, []);

  // If PostHog is not initialized, just return children without provider
  if (!isPostHogInitialized) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/**
 * Helper to grant analytics consent
 */
export function grantAnalyticsConsent() {
  if (!isPostHogInitialized) return;

  localStorage.setItem('analytics-consent', 'granted');

  try {
    posthog.opt_in_capturing();

    // Use correct method name
    if (typeof posthog.startSessionRecording === 'function') {
      posthog.startSessionRecording();
    }

    posthog.set_config({ autocapture: true });
    posthog.capture('consent_granted');
  } catch (error) {
    console.error('Failed to grant analytics consent:', error);
  }
}

/**
 * Helper to revoke analytics consent
 */
export function revokeAnalyticsConsent() {
  if (!isPostHogInitialized) {
    localStorage.setItem('analytics-consent', 'denied');
    return;
  }

  localStorage.setItem('analytics-consent', 'denied');

  try {
    posthog.opt_out_capturing();
    posthog.reset();
  } catch (error) {
    console.error('Failed to revoke analytics consent:', error);
  }
}
