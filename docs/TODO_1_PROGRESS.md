# TODO #1 Progress: Page Builder API Consolidation

**Status:** 🟡 In Progress (70% Complete)  
**Started:** 2025-01-26 14:09 UTC  
**Last Updated:** 2025-01-26 14:20 UTC

---

## ✅ Completed

### Foundation Files
1. ✅ `src/lib/api/auth-guard.ts` - Token-based authentication guards
2. ✅ `src/lib/api/validators/pageSchemas.ts` - Zod validation schemas
3. ✅ `src/lib/blocks.ts` - validateBlockProps function already exists

### API Routes Created/Updated
1. ✅ `src/app/api/centres/route.ts` - GET centres list (NEW)
2. ✅ `src/app/api/pages/route.ts` - GET list, POST create (UPDATED with new auth)
3. 🟡 `src/app/api/pages/[id]/route.ts` - Partially updated (imports done, methods need completion)

---

## 🚧 Remaining Work

### API Routes to Create
1. ⚪ `src/app/api/pages/[id]/publish/route.ts` - Publish/unpublish endpoint
2. ⚪ `src/app/api/pages/[id]/blocks/[blockId]/route.ts` - Delete single block (optional)

### Fix validateBlockProps Adapter
The existing `validateBlockProps` in `blocks.ts` returns:
```typescript
{ success: true; data: BlockProps<K> } | { success: false; errors: any }
```

But API code expects:
```typescript
{ success: boolean; data?: unknown; error?: string }
```

**Solution:** Create adapter in pages/[id]/route.ts or update validation calls.

### Complete pages/[id]/route.ts
The file is partially updated. Need to:
1. Update GET method implementation (lines 33-71)
2. Update PUT method implementation (lines 73-156)
3. Update DELETE method implementation (lines 158-176)

**Current state:** Only imports are updated, method bodies still use old pattern.

---

## 📝 Code to Complete

### 1. Finish `/src/app/api/pages/[id]/route.ts`

Replace the entire file content after line 6 with:

```typescript
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
```

### 2. Create `/src/app/api/pages/[id]/publish/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

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
```

---

## 🧪 Testing After Completion

### 1. Generate INTERNAL_ADMIN_TOKEN
```bash
openssl rand -hex 32
```

Add to `.env.local`:
```bash
INTERNAL_ADMIN_TOKEN=<generated_token>
```

### 2. Test with curl

```bash
# Set token
TOKEN="your_generated_token"

# Get centres
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/centres

# Create page
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Page","slug":"test","centre_id":"YOUR_CENTRE_UUID"}' \
  http://localhost:3000/api/pages

# Get page
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/pages/PAGE_ID

# Update page
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","blocks":[]}' \
  http://localhost:3000/api/pages/PAGE_ID

# Publish
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_published":true}' \
  http://localhost:3000/api/pages/PAGE_ID/publish

# Delete
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/pages/PAGE_ID
```

### 3. Verify TypeScript
```bash
npm run typecheck
npm run lint
npm run build
```

---

## 📊 Completion Checklist

- [x] Auth guard utility created
- [x] Validation schemas created
- [x] GET /api/centres created
- [x] GET /api/pages updated
- [x] POST /api/pages updated
- [ ] Complete GET /api/pages/[id]
- [ ] Complete PUT /api/pages/[id]
- [ ] Complete DELETE /api/pages/[id]
- [ ] Create PUT /api/pages/[id]/publish
- [ ] Test all endpoints with curl
- [ ] Run npm run verify
- [ ] Mark TODO #1 as complete

---

## 🚀 Next Steps After TODO #1

Once all API routes are complete and tested:

1. **TODO #2:** Wire up Page Builder UI
   - Create CentreSelector component
   - Create PageSelector component
   - Update builder page to call these APIs
   - Implement auto-save

2. **TODO #3:** Add validation and error handling
3. **TODO #4:** QA, documentation, and deploy

---

**Estimated Time Remaining:** 30-45 minutes to complete TODO #1
