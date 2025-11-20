import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// POST /api/admin/seed
// Seeds a sample page with all blocks and array-heavy content
export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    // Determine tenant/centre
    const tenantId = request.headers.get('x-tenant-id');
    let centreId = tenantId || '';

    if (!centreId) {
      const { data: centre } = await supabase
        .from('centres')
        .select('id')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      if (!centre) {
        return NextResponse.json({ error: 'No active centre found to seed.' }, { status: 400 });
      }
      centreId = centre.id as string;
    }

    // Upsert a page called 'showcase'
    const slug = 'showcase';
    const title = 'Component Showcase';

    // Try to find existing
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .eq('centre_id', centreId)
      .eq('slug', slug)
      .single();

    let pageId = existing?.id as string | undefined;

    if (!pageId) {
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          centre_id: centreId,
          slug,
          title,
          meta_description: 'Demo showcasing all blocks',
          is_published: true,
        })
        .select('id')
        .single();
      if (pageError) throw pageError;
      pageId = page!.id as string;
    }

    // Clear existing blocks
    await supabase.from('page_blocks').delete().eq('page_id', pageId);

    // Build sample blocks
    const blocks: any[] = [
      {
        block_key: 'hero',
        props: {
          title: 'Welcome to EduSitePro',
          subtitle: 'All blocks preview with seeded content',
          backgroundImage: '/images/hero.jpg',
        },
      },
      {
        block_key: 'features',
        props: {
          title: 'Our Features',
          subtitle: 'Why centres choose us',
          columns: 3,
          features: [
            { title: 'Safe', description: 'Built-in RLS isolation', icon: '🔒' },
            { title: 'Fast', description: 'Next.js App Router', icon: '⚡' },
            { title: 'Beautiful', description: 'Tailwind v4 design', icon: '🎨' },
          ],
        },
      },
      {
        block_key: 'programGrid',
        props: {
          title: 'Our Programs',
          subtitle: 'NCF aligned',
          columns: 3,
          programs: [
            {
              title: 'Early Maths',
              description: 'Numbers and shapes',
              icon: '🔢',
              ageRange: '3-4',
              ncfPillars: ['Mathematics'],
            },
            {
              title: 'Creativity',
              description: 'Art and music',
              icon: '🎵',
              ageRange: '4-5',
              ncfPillars: ['Creativity & Imagination'],
            },
            {
              title: 'Well-being',
              description: 'Healthy habits',
              icon: '🧘',
              ageRange: '3-5',
              ncfPillars: ['Well-being'],
            },
          ],
        },
      },
      {
        block_key: 'staffCards',
        props: {
          title: 'Our Team',
          subtitle: 'Caring professionals',
          columns: 3,
          showQualifications: true,
          staff: [
            {
              name: 'Lerato M.',
              role: 'Principal',
              bio: '10+ years ECD leadership',
              photo: '/images/staff1.jpg',
              qualifications: ['ECD Cert'],
            },
            {
              name: 'Sipho D.',
              role: 'Teacher',
              bio: 'Play-based learning',
              photo: '/images/staff2.jpg',
              qualifications: ['B.Ed'],
            },
            {
              name: 'Aisha K.',
              role: 'Assistant',
              bio: 'Loves story time',
              photo: '/images/staff3.jpg',
              qualifications: [],
            },
          ],
        },
      },
      {
        block_key: 'testimonials',
        props: {
          title: 'What Parents Say',
          subtitle: 'Trusted by families',
          showRatings: true,
          testimonials: [
            {
              quote: 'Amazing centre and staff!',
              author: 'Nomsa',
              role: 'Parent',
              photo: '',
              rating: 5,
            },
            {
              quote: 'Our child thrives here.',
              author: 'Thabo',
              role: 'Parent',
              photo: '',
              rating: 5,
            },
          ],
        },
      },
      {
        block_key: 'gallery',
        props: {
          title: 'Gallery',
          subtitle: 'Our happy kids',
          columns: 3,
          showCaptions: true,
          items: [
            {
              type: 'image',
              url: '/images/gallery1.jpg',
              thumbnail: '',
              caption: 'Play time',
              alt: 'Kids playing',
            },
            {
              type: 'image',
              url: '/images/gallery2.jpg',
              thumbnail: '',
              caption: 'Art time',
              alt: 'Kids painting',
            },
            {
              type: 'image',
              url: '/images/gallery3.jpg',
              thumbnail: '',
              caption: 'Outdoor fun',
              alt: 'Kids outside',
            },
          ],
        },
      },
      {
        block_key: 'feesTable',
        props: {
          title: 'Fees',
          subtitle: 'Affordable options',
          showDescriptions: true,
          showFrequency: true,
          note: 'All fees are per month unless stated otherwise.',
          categories: [
            {
              category: 'Tuition',
              rows: [
                {
                  service: 'Half Day',
                  description: '08:00 - 12:00',
                  amount: 'R1,500',
                  frequency: 'per month',
                },
                {
                  service: 'Full Day',
                  description: '08:00 - 17:00',
                  amount: 'R2,200',
                  frequency: 'per month',
                },
              ],
            },
            {
              category: 'Extras',
              rows: [
                {
                  service: 'Transport',
                  description: 'Within 5km',
                  amount: 'R400',
                  frequency: 'per month',
                },
              ],
            },
          ],
        },
      },
      {
        block_key: 'contactCTA',
        props: {
          title: 'Get in touch',
          description: 'We would love to hear from you',
          phone: '012 345 6789',
          email: 'hello@example.com',
          address: '123 Main Road, Johannesburg',
        },
      },
    ];

    // Insert blocks in order
    const { error: insertError } = await supabase
      .from('page_blocks')
      .insert(
        blocks.map((b, i) => ({
          page_id: pageId,
          block_key: b.block_key,
          props: b.props,
          block_order: i,
        })),
      );
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, pageId, slug });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
