import { NextRequest, NextResponse } from 'next/server';

import { getRequestId, logError, requireAdminToken } from '@/lib/api/auth-guard';
import { PageSaveSchema } from '@/lib/api/validators/pageSchemas';
import { validateBlockProps } from '@/lib/blocks';
import { getServiceRoleClient } from '@/lib/supabase';

/**
 * GET /api/pages/[id]
 * Fetch a single page with all its blocks
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);
  const pageId = params.id;

  try {
    const supabase = getServiceRoleClient();

    // Fetch page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Fetch blocks
    const { data: blocks, error: blocksError } = await supabase
      .from('page_blocks')
      .select('id, block_key, props, block_order')
      .eq('page_id', pageId)
      .order('block_order', { ascending: true });

    if (blocksError) {
      logError(requestId, 'blocks fetch', blocksError);
      return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
    }

    return NextResponse.json(
      {
        page: {
          ...page,
          blocks: blocks || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logError(requestId, 'page GET', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

/**
 * PUT /api/pages/[id]
 * Update page metadata and/or blocks (atomic save)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);
  const pageId = params.id;

  try {
    const body = await request.json();
    const validation = PageSaveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const { title, slug, meta_description, blocks } = validation.data;

    // Update page if fields provided
    const pageUpdates: Record<string, unknown> = {};
    if (title) pageUpdates.title = title;
    if (slug) pageUpdates.slug = slug;
    if (meta_description !== undefined) pageUpdates.meta_description = meta_description;

    if (Object.keys(pageUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('pages')
        .update(pageUpdates)
        .eq('id', pageId);

      if (updateError) {
        logError(requestId, 'page update', updateError);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
      }
    }

    // Update blocks if provided
    if (blocks) {
      // Validate all blocks first
      const blockErrors: Record<number, string> = {};
      blocks.forEach((block, index) => {
        const result = validateBlockProps(block.blockKey as any, block.props);
        if (!result.success) {
          blockErrors[index] = JSON.stringify(result.errors);
        }
      });

      if (Object.keys(blockErrors).length > 0) {
        return NextResponse.json(
          { error: 'Block validation failed', blockErrors },
          { status: 400 }
        );
      }

      // Delete existing blocks
      const { error: deleteError } = await supabase
        .from('page_blocks')
        .delete()
        .eq('page_id', pageId);

      if (deleteError) {
        logError(requestId, 'blocks delete', deleteError);
        return NextResponse.json({ error: 'Failed to update blocks' }, { status: 500 });
      }

      // Insert new blocks
      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block, index) => ({
          page_id: pageId,
          block_key: block.blockKey,
          props: block.props,
          block_order: index,
        }));

        const { error: insertError } = await supabase.from('page_blocks').insert(blocksToInsert);

        if (insertError) {
          logError(requestId, 'blocks insert', insertError);
          return NextResponse.json({ error: 'Failed to save blocks' }, { status: 500 });
        }
      }
    }

    // Fetch updated page with blocks
    const { data: updatedPage } = await supabase.from('pages').select('*').eq('id', pageId).single();

    const { data: updatedBlocks } = await supabase
      .from('page_blocks')
      .select('id, block_key, props, block_order')
      .eq('page_id', pageId)
      .order('block_order', { ascending: true });

    return NextResponse.json(
      {
        page: {
          ...updatedPage,
          blocks: updatedBlocks || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logError(requestId, 'page PUT', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

/**
 * DELETE /api/pages/[id]
 * Delete a page and all its blocks (cascade delete)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);
  const pageId = params.id;

  try {
    const supabase = getServiceRoleClient();

    // Delete page (blocks cascade delete via ON DELETE CASCADE)
    const { error } = await supabase.from('pages').delete().eq('id', pageId);

    if (error) {
      logError(requestId, 'page delete', error);
      return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logError(requestId, 'page DELETE', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
