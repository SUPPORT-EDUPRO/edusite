/**
 * Deep Link Integration with EduDash Pro
 * Provides seamless funnel from EduSitePro to EduDash Pro mobile app
 */

export interface DeepLinkParams {
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  template_slug?: string;
  [key: string]: string | undefined;
}

const DEEP_LINK_BASE = process.env.NEXT_PUBLIC_EDUDASH_DEEP_LINK_BASE || 'edudashpro://';
const ANDROID_STORE_URL =
  process.env.NEXT_PUBLIC_ANDROID_STORE_URL ||
  'https://play.google.com/store/apps/details?id=com.edudashpro';
const IOS_STORE_URL =
  process.env.NEXT_PUBLIC_IOS_STORE_URL || 'https://apps.apple.com/app/idXXXXXXXXX';

/**
 * Build a deep link URL to EduDash Pro with UTM tracking
 */
export function buildDeepLink(path: string, params?: DeepLinkParams): string {
  const url = new URL(path, DEEP_LINK_BASE);

  // Default UTM parameters
  const finalParams: DeepLinkParams = {
    utm_source: 'edusitepro',
    utm_medium: 'website',
    utm_campaign: 'website_conversion',
    ...params,
  };

  // Add all parameters to URL
  Object.entries(finalParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

/**
 * Get the appropriate store URL based on platform
 */
export function getStoreUrl(platform: 'android' | 'ios' | 'auto' = 'auto'): string {
  if (platform === 'android') return ANDROID_STORE_URL;
  if (platform === 'ios') return IOS_STORE_URL;

  // Auto-detect platform
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return ANDROID_STORE_URL;
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return IOS_STORE_URL;
  }

  return ANDROID_STORE_URL; // Default
}

/**
 * Add UTM parameters to store URL
 */
export function buildStoreUrl(
  platform: 'android' | 'ios' | 'auto' = 'auto',
  campaign?: string,
): string {
  const baseUrl = getStoreUrl(platform);
  const url = new URL(baseUrl);

  url.searchParams.set('utm_source', 'edusitepro');
  url.searchParams.set('utm_medium', 'website');
  url.searchParams.set('utm_campaign', campaign || 'app_download');

  return url.toString();
}

/**
 * Check if device supports deep links
 */
export function supportsDeepLinks(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('android') || userAgent.includes('iphone') || userAgent.includes('ipad')
  );
}

/**
 * Attempt to open deep link, fallback to store
 */
export function openDeepLinkOrStore(
  path: string,
  params?: DeepLinkParams,
  campaign?: string,
): void {
  if (typeof window === 'undefined') return;

  const deepLink = buildDeepLink(path, params);
  const storeUrl = buildStoreUrl('auto', campaign);

  // Try to open deep link
  window.location.href = deepLink;

  // Fallback to store after delay if app not installed
  setTimeout(() => {
    window.location.href = storeUrl;
  }, 1500);
}
