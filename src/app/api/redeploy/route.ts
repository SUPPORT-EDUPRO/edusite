import { NextRequest, NextResponse } from 'next/server';

import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken || adminToken !== process.env.INTERNAL_ADMIN_TOKEN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { centreId, slug } = body as { centreId?: string; slug?: string };

    if (!centreId && !slug) {
      return NextResponse.json(
        { success: false, message: 'Provide centreId or slug' },
        { status: 400 },
      );
    }

    const supabase = getServiceRoleClient();

    const query = supabase
      .from('centres')
      .select('id, slug, vercel_deploy_hook_url, name, primary_domain')
      .limit(1);

    const { data: centres, error } = centreId
      ? await query.eq('id', centreId)
      : await query.eq('slug', slug as string);

    if (error) {
      console.error('DB error fetching centre:', error);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    const centre = centres?.[0];
    if (!centre) {
      return NextResponse.json({ success: false, message: 'Centre not found' }, { status: 404 });
    }

    const hookUrl = centre.vercel_deploy_hook_url as string | null;
    if (!hookUrl) {
      return NextResponse.json(
        { success: false, message: 'No deploy hook configured for this centre' },
        { status: 400 },
      );
    }

    // Trigger Vercel deploy hook
    const resp = await fetch(hookUrl, { method: 'POST' });
    const ok = resp.ok;

    return NextResponse.json(
      { success: ok, centreId: centre.id, slug: centre.slug },
      {
        status: ok ? 200 : 502,
      },
    );
  } catch (e) {
    console.error('Redeploy error:', e);
    return NextResponse.json(
      { success: false, message: 'Unexpected error triggering redeploy' },
      { status: 500 },
    );
  }
}
