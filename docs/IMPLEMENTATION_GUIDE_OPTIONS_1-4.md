# EduSitePro Implementation Guide: Options 1-4

**Status:** In Progress  
**Date:** 2025-01-26  
**Timeline:** Complete implementation of Page Builder API, Auth/RBAC, Centre Management, and Settings

---

## ✅ Completed: Kickoff & Guardrails

**Status:** ✅ DONE

- Environment verified: All required vars present in `.env.local`
- Baseline checks passed:
  - `npm run verify` ✅ (lint: 0 warnings, typecheck: ✅, tests: ✅, build: ✅)
  - TypeScript strict mode enabled
  - All migrations applied
- Created foundation files:
  - `src/lib/api/auth-guard.ts` - Temporary token authentication
  - `src/lib/api/validators/pageSchemas.ts` - Zod validation schemas

---

## 🚀 OPTION 1: Page Builder Database Integration

### Overview
Connect the page builder UI to the database with full CRUD operations, block validation, and publish workflow.

### Files to Create

#### 1. `/src/app/api/centres/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken, getRequestId, logError } from '@/lib/api/auth-guard';
import { getServiceRoleClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);
  
  try {
    const supabase = getServiceRoleClient();
    
    const { data: centres, error } = await supabase
      .from('centres')
      .select('id, name, slug, status, plan_tier')
      .eq('status', 'active')
      .order('name');

    if (error) {
      logError(requestId, 'centres fetch', error);
      return NextResponse.json(
        { error: 'Failed to fetch centres' },
        { status: 500 }
      );
    }

    return NextResponse.json({ centres }, { status: 200 });
  } catch (error) {
    logError(requestId, 'centres GET', error);
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

#### 2. `/src/app/api/pages/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken, getRequestId, logError } from '@/lib/api/auth-guard';
import { getServiceRoleClient } from '@/lib/supabase';
import { PageUpsertSchema } from '@/lib/api/validators/pageSchemas';

// GET /api/pages?centre_id=xxx - List pages for a centre
export async function GET(request: NextRequest) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const centreId = searchParams.get('centre_id');

  if (!centreId) {
    return NextResponse.json(
      { error: 'centre_id query parameter is required' },
      { status: 400 }
    );
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

// POST /api/pages - Create new page
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
```

#### 3. `/src/app/api/pages/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken, getRequestId, logError } from '@/lib/api/auth-guard';
import { getServiceRoleClient } from '@/lib/supabase';
import { PageSaveSchema } from '@/lib/api/validators/pageSchemas';
import { validateBlockProps } from '@/lib/blocks';

// GET /api/pages/[id] - Fetch page with blocks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

// PUT /api/pages/[id] - Update page and blocks (atomic save)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        const result = validateBlockProps(block.blockKey, block.props);
        if (!result.success) {
          blockErrors[index] = result.error;
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

        const { error: insertError } = await supabase
          .from('page_blocks')
          .insert(blocksToInsert);

        if (insertError) {
          logError(requestId, 'blocks insert', insertError);
          return NextResponse.json({ error: 'Failed to save blocks' }, { status: 500 });
        }
      }
    }

    // Fetch updated page with blocks
    const { data: updatedPage } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();

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

// DELETE /api/pages/[id] - Delete page and all its blocks
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

#### 4. `/src/app/api/pages/[id]/publish/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminToken, getRequestId, logError } from '@/lib/api/auth-guard';
import { getServiceRoleClient } from '@/lib/supabase';
import { PublishSchema } from '@/lib/api/validators/pageSchemas';

// PUT /api/pages/[id]/publish - Toggle publish status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

### Export validateBlockProps from blocks.ts

Add this to `/src/lib/blocks.ts`:

```typescript
export function validateBlockProps(blockKey: string, props: Record<string, unknown>): {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
} {
  const block = BLOCKS[blockKey];
  
  if (!block) {
    return {
      success: false,
      error: `Unknown block type: ${blockKey}`,
    };
  }

  const result = block.schema.safeParse(props);
  
  if (!result.success) {
    return {
      success: false,
      error: JSON.stringify(result.error.format()),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
```

---

## 📝 Next Steps

**This guide will continue with:**
- Option 1: UI components (CentreSelector, PageSelector, SaveStatus)
- Option 2: Authentication & RBAC implementation
- Option 3: Platform settings
- Option 4: Centre management features

**To implement all routes above:**
1. Create each file with the provided code
2. Test with REST client (Thunder Client, Postman, or curl)
3. Wire up the Page Builder UI (next section)
4. Run `npm run verify` after each major change

**Environment Required:**
- `INTERNAL_ADMIN_TOKEN` in `.env.local` (generate with `openssl rand -hex 32`)
- `SUPABASE_SERVICE_ROLE_KEY` for database operations

**Testing Endpoints:**
```bash
# Get centres
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/centres

# Create page
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Page","slug":"test","centre_id":"UUID"}' \
  http://localhost:3000/api/pages

# Get page with blocks
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/pages/PAGE_ID
```

---

**Status:** Implementation in progress. Continue with UI wiring next.
