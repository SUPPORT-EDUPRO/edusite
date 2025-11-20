import { NextRequest, NextResponse } from 'next/server';

import { getRequestId, logError, requireAdminToken } from '@/lib/api/auth-guard';
import { PageUpsertSchema } from '@/lib/api/validators/pageSchemas';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * GET /api/pages?centre_id=xxx
 * List all pages for a specific centre
 */
export async function GET(request: NextRequest) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const centreId = searchParams.get('centre_id');

  if (!centreId) {
    return NextResponse.json({ error: 'centre_id query parameter is required' }, { status: 400 });
  }

  try {
    const supabase = getServiceRoleClient();

    const { data: pages, error } = await supabase
      .from('pages')
      .select('id, title, slug, is_published, created_at, updated_at')
      .eq('centre_id', centreId)
      .order('created_at', { ascending: false });

    if (error) {
      logError(requestId, 'pages list', error);
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }

    return NextResponse.json({ pages: pages || [] }, { status: 200 });
  } catch (error) {
    logError(requestId, 'pages GET', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

/**
 * POST /api/pages
 * Create a new page
 */
export async function POST(request: NextRequest) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);

  try {
    const body = await request.json();
    const validation = PageUpsertSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const { title, slug, centre_id, meta_description, is_published } = validation.data;

    // Check if slug already exists for this centre
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .eq('centre_id', centre_id)
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'A page with this slug already exists for this centre' },
        { status: 409 }
      );
    }

    // Create page
    const { data: page, error } = await supabase
      .from('pages')
      .insert({
        title,
        slug,
        centre_id,
        meta_description,
        is_published: is_published || false,
      })
      .select('id, title, slug, centre_id, is_published, created_at')
      .single();

    if (error) {
      logError(requestId, 'page create', error);
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    logError(requestId, 'pages POST', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
