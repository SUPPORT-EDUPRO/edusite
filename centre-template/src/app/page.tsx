export const dynamic = 'force-static';

import Link from 'next/link';

import { supabase } from '@/lib/supabase';

const CENTRE_SLUG = process.env.CENTRE_SLUG!;

async function getData() {
  const { data: centre } = await supabase
    .from('centres')
    .select('id, name, branding, primary_domain')
    .eq('slug', CENTRE_SLUG)
    .eq('status', 'active')
    .maybeSingle();

  if (!centre) return { centre: null, pages: [] as any[] };

  const { data: pages } = await supabase
    .from('pages')
    .select('id, slug, title')
    .eq('centre_id', centre.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  return { centre, pages: pages || [] };
}

export default async function Home() {
  const { centre, pages } = await getData();

  if (!centre) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-2 text-2xl font-bold">Site not configured</h1>
        <p className="text-gray-700">
          No active centre found for CENTRE_SLUG = <code>{CENTRE_SLUG}</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="rounded-2xl bg-emerald-600 p-8 text-white">
        <h1 className="mb-2 text-3xl font-bold">{centre.name}</h1>
        <p className="opacity-90">Official website</p>
      </section>

      <nav className="mt-8 flex flex-wrap gap-3">
        {pages.map((p) => (
          <Link
            key={p.id}
            href={`/${p.slug}`}
            className="rounded border border-emerald-200 px-3 py-1 text-emerald-700 hover:bg-emerald-50"
          >
            {p.title}
          </Link>
        ))}
      </nav>

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-semibold">Welcome</h2>
        <p className="text-gray-700">
          This site is powered by the EduSitePro Hub. Content updates are managed centrally and
          published pages appear here after a redeploy.
        </p>
      </section>
    </main>
  );
}
