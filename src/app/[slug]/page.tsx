import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

import { Navigation, type MenuItem } from '@/components/Navigation';
import { FloatingEnrollFab } from '@/components/site/FloatingEnrollFab';
import { getBlock } from '@/lib/blocks';

function srClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = params;

  // Get tenant ID from middleware
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id');

  if (!tenantId) {
    console.error('[Centre Site] No tenant ID found in headers for slug:', slug);
    notFound();
  }

  // Get Supabase client with service role for RLS bypass
  const supabase = srClient();

  // Fetch the page by slug AND centre_id for multi-tenant isolation
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('centre_id', tenantId)
    .eq('is_published', true)
    .single();

  if (pageError || !page) {
    console.error('[Centre Site] Page not found:', { slug, tenantId, error: pageError });
    notFound();
  }

  // Fetch blocks + tenant assets in parallel now that we have a page ID
  const [blocksResult, navMenuResult, organizationResult] = await Promise.all([
    supabase
      .from('page_blocks')
      .select('*')
      .eq('page_id', page.id)
      .order('block_order', { ascending: true }),
    supabase
      .from('navigation_menus')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('organizations')
      .select(
        'name, slug, logo_url, website_url, primary_color, registration_open, registration_message, min_age, max_age'
      )
      .eq('id', tenantId)
      .maybeSingle(),
  ]);

  if (blocksResult.error) {
    console.error('[Centre Site] Error fetching blocks:', blocksResult.error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Page</h1>
          <p className="mt-2 text-stone-600">
            Unable to load page content. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const blocksData = blocksResult.data;
  const navMenuRow = navMenuResult.data as { items?: MenuItem[] } | null;
  const menuItems = (navMenuRow?.items || []) as MenuItem[];
  const organization = organizationResult.data;

  const enrollmentLabel = organization?.registration_open ? 'Now Enrolling' : 'Join Waitlist';
  const registrationMessage = organization?.registration_message
    ? organization.registration_message.length > 70
      ? `${organization.registration_message.slice(0, 67)}…`
      : organization.registration_message
    : organization?.min_age && organization?.max_age
      ? `${organization.min_age}-${organization.max_age} yrs • Limited seats`
      : undefined;

  return (
    <div className="relative">
      <Navigation
        tenantName={organization?.name || page.title}
        tenantLogo={organization?.logo_url || undefined}
        websiteUrl={
          organization?.website_url ||
          (organization?.slug ? `https://${organization.slug.replace(/-/g, '')}.org.za` : undefined)
        }
        accentColor={organization?.primary_color || undefined}
        menuItems={menuItems}
      />
      {/* Render blocks dynamically */}
      {blocksData && blocksData.length > 0 ? (
        blocksData.map((block) => {
          const blockDef = getBlock(block.block_key as any);
          const BlockComponent = blockDef?.component;

          if (!BlockComponent) {
            console.warn(`Block component not found for: ${block.block_key}`);
            return null;
          }

          return <BlockComponent key={block.id} {...block.props} />;
        })
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-stone-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-900">{page.title}</h1>
            <p className="mt-2 text-stone-600">This page has no content yet.</p>
          </div>
        </div>
      )}

      {organization && (
        <FloatingEnrollFab
          href="/register"
          label={enrollmentLabel}
          sublabel={registrationMessage}
          accentColor={organization.primary_color || '#2563eb'}
          pulse={Boolean(organization.registration_open)}
        />
      )}
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  // Get tenant ID from middleware
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id');

  if (!tenantId) {
    return {
      title: 'Page Not Found',
    };
  }

  const supabase = srClient();

  const { data: page } = await supabase
    .from('pages')
    .select('title, meta_description')
    .eq('slug', slug)
    .eq('centre_id', tenantId) // Multi-tenant filtering
    .eq('is_published', true)
    .single();

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
    description: page.meta_description || undefined,
    openGraph: {
      title: page.title,
      description: page.meta_description || undefined,
      type: 'website',
    },
  };
}
