export const dynamic = 'force-static';

import { supabase } from '@/lib/supabase';

const CENTRE_SLUG = process.env.CENTRE_SLUG!;

export async function generateStaticParams() {
  const { data: centre } = await supabase
    .from('centres')
    .select('id')
    .eq('slug', CENTRE_SLUG)
    .eq('status', 'active')
    .maybeSingle();

  if (!centre) return [];

  const { data: pages } = await supabase
    .from('pages')
    .select('slug')
    .eq('centre_id', centre.id)
    .eq('is_published', true);

  return (pages || []).map((p) => ({ slug: p.slug }));
}

async function getPage(slug: string) {
  const { data: centre } = await supabase
    .from('centres')
    .select('id, name')
    .eq('slug', CENTRE_SLUG)
    .maybeSingle();
  if (!centre) return null;

  const { data: page } = await supabase
    .from('pages')
    .select('id, title, slug')
    .eq('centre_id', centre.id)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (!page) return null;

  const { data: sections } = await supabase
    .from('sections')
    .select('type, content, sort_order')
    .eq('page_id', page.id)
    .order('sort_order', { ascending: true });

  return { page, sections: sections || [] };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const data = await getPage(params.slug);

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
        <p className="text-gray-700">This page is not published or does not exist.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">{data.page.title}</h1>
      <div className="space-y-6">
        {data.sections.map((s, i) => (
          <section key={i} className="rounded-lg border p-4">
            <pre className="text-sm whitespace-pre-wrap text-gray-700">
              {JSON.stringify(s.content, null, 2)}
            </pre>
          </section>
        ))}
      </div>
    </main>
  );
}
