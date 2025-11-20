import { supabase } from './supabase';

export interface Centre {
  id: string;
  slug: string;
  name: string;
  primary_domain: string | null;
  default_subdomain: string | null;
  brand_theme: Record<string, unknown>;
  status: string;
  plan_tier: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  vercel_project_name: string | null;
  vercel_deploy_hook_url: string | null;
  branding: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const centreCache = new Map<string, Centre>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get centre by domain (custom or subdomain)
 * Checks cache first, then database
 * Uses anon client with RLS - safe for middleware
 */
export async function getCentreByDomain(hostname: string): Promise<Centre | null> {
  // Check cache
  const cached = centreCache.get(hostname);
  if (cached) return cached;

  // Check centre_domains table first (custom domains)
  // RLS policy should allow public read for verified domains
  const { data: domainData } = await supabase
    .from('centre_domains')
    .select('centre_id, centres(*)')
    .eq('domain', hostname)
    .eq('verification_status', 'verified')
    .single();

  if (domainData?.centres) {
    const centre = domainData.centres as unknown as Centre;
    centreCache.set(hostname, centre);
    setTimeout(() => centreCache.delete(hostname), CACHE_TTL);
    return centre;
  }

  // Check default subdomain pattern (slug.sites.edusitepro.co.za)
  if (hostname.endsWith('.sites.edusitepro.co.za')) {
    const slug = hostname.split('.')[0];

    // RLS policy should allow public read for active centres
    const { data: centreData } = await supabase
      .from('centres')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (centreData) {
      const centre = centreData as Centre;
      centreCache.set(hostname, centre);
      setTimeout(() => centreCache.delete(hostname), CACHE_TTL);
      return centre;
    }
  }

  return null;
}

/**
 * Get centre by slug (direct lookup)
 * Uses anon client with RLS
 */
export async function getCentreBySlug(slug: string): Promise<Centre | null> {
  const { data, error } = await supabase
    .from('centres')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !data) return null;

  return data as Centre;
}

/**
 * Get centre by ID
 * Uses anon client with RLS
 */
export async function getCentreById(id: string): Promise<Centre | null> {
  const { data, error } = await supabase.from('centres').select('*').eq('id', id).single();

  if (error || !data) return null;

  return data as Centre;
}

/**
 * Get centre ID from request headers (set by middleware)
 */
export function getCentreIdFromHeaders(headers: Headers): string | null {
  return headers.get('x-centre-id');
}

/**
 * Clear cache for a specific hostname
 */
export function clearCentreCache(hostname: string): void {
  centreCache.delete(hostname);
}

/**
 * Clear all cache
 */
export function clearAllCentreCache(): void {
  centreCache.clear();
}

/**
 * Get all active centres (for admin dashboard)
 * Note: This should be called from authenticated admin routes
 * where you can use service role or authenticated user context
 */
export async function getAllCentres(filters?: {
  status?: string;
  plan_tier?: string;
}): Promise<Centre[]> {
  // For admin operations, this should be called from an API route
  // with proper authentication. Using anon client here for now.
  let query = supabase.from('centres').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.plan_tier) {
    query = query.eq('plan_tier', filters.plan_tier);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error || !data) return [];

  return data as Centre[];
}
