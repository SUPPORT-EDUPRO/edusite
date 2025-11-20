import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { getRequestId, logError, requireAdminToken } from '@/lib/api/auth-guard';
import { PublishSchema } from '@/lib/api/validators/pageSchemas';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * PUT /api/pages/[id]/publish
 * Toggle publish status and revalidate cache
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);
  const pageId = params.id;

  try {
    const body = await request.json();
    const validation = PublishSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const { is_published } = validation.data;

    // Update publish status
    const { data: page, error } = await supabase
      .from('pages')
      .update({ is_published })
      .eq('id', pageId)
      .select('id, slug, centre_id, is_published')
      .single();

    if (error || !page) {
      logError(requestId, 'page publish', error);
      return NextResponse.json({ error: 'Failed to update publish status' }, { status: 500 });
    }

    // Revalidate the page path for cache
    try {
      revalidatePath(`/${page.slug}`);
    } catch (revalError) {
      // Log but don't fail the request
      logError(requestId, 'revalidation', revalError);
    }

    return NextResponse.json({ page }, { status: 200 });
  } catch (error) {
    logError(requestId, 'publish PUT', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
