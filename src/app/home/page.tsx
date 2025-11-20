import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Homepage route that redirects to the centre's homepage or first published page
 * Accessed via: {slug}.sites.edusitepro.co.za/home
 */
export default async function HomePage() {
  // Get tenant ID from middleware
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id');

  if (!tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900">No Centre Found</h1>
          <p className="mt-2 text-stone-600">This domain is not associated with any ECD centre.</p>
        </div>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();

  // Try to find a page marked as homepage
  const { data: homepage } = await supabase
    .from('pages')
    .select('slug')
    .eq('centre_id', tenantId)
    .eq('is_published', true)
    .eq('slug', 'home')
    .single();

  if (homepage) {
    redirect(`/${homepage.slug}`);
  }

  // If no homepage, get the first published page
  const { data: firstPage } = await supabase
    .from('pages')
    .select('slug')
    .eq('centre_id', tenantId)
    .eq('is_published', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (firstPage) {
    redirect(`/${firstPage.slug}`);
  }

  // No published pages found
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100">
      <div className="text-center">
        <div className="mb-6 inline-block rounded-full bg-amber-100 p-6">
          <svg
            className="h-16 w-16 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-stone-900">Website Under Construction</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-stone-600">
          This ECD centre website is being set up. Please check back soon!
        </p>
        <div className="mt-8">
          <a
            href="https://edusitepro.co.za"
            className="inline-block rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Learn About EduSitePro
          </a>
        </div>
      </div>
    </div>
  );
}

// Metadata
export async function generateMetadata() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id');

  if (!tenantId) {
    return {
      title: 'Centre Not Found',
    };
  }

  const supabase = await createServerSupabaseClient();

  // Get centre info
  const { data: centre } = await supabase
    .from('centres')
    .select('name')
    .eq('id', tenantId)
    .single();

  return {
    title: centre?.name || 'ECD Centre',
    description: `Welcome to ${centre?.name || 'our ECD centre'}`,
  };
}
