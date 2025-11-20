# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 🎯 Project Overview

**EduSitePro** is a multi-tenant SaaS platform that enables South African Early Childhood Development (ECD) centres to create professional, NCF-aligned websites. It serves as a marketing funnel and lead generation system that drives users to EduDash Pro (the main platform).

**Golden Rule**: Always design with ECD centres, parents, and children at the center. Every feature must make website creation simpler, faster, and more effective for lead generation.

## 🔨 Common Development Commands

### Project Setup & Development

```bash
# Install dependencies (use ci for consistent installs)
npm ci

# Development
npm run dev              # Start dev server on http://localhost:3000
npm run start:clear      # Start with cache cleared (if needed)

# Build & Production
npm run build            # Production build (must pass before deployment)
npm run start            # Start production server
```

### Code Quality & Linting (REQUIRED before commits)

```bash
# TypeScript type checking
npm run typecheck        # Must pass before commit

# ESLint code linting (max 2 warnings allowed)
npm run lint
npm run lint:fix         # Auto-fix linting issues

# Prettier formatting
npm run format           # Format with Prettier
npm run format:check     # Check formatting without changes

# All Quality Checks
npm run verify           # Runs lint, typecheck, test, and build
```

### Testing & Quality Assurance

```bash
# Testing
npm test                 # Run Jest tests (currently passes with no tests)
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report

# Note: Quality gates enforced via CI/CD pipeline
```

### Template Verification

```bash
# Verify all 6 NCF templates are working
./scripts/verify-templates.sh

# With custom port
./scripts/verify-templates.sh 3000
```

### Database Operations

```bash
# CRITICAL: Always use Supabase migrations for schema changes
# Never use local Docker or direct SQL execution

# Create new migration
supabase migration new <descriptive-name>

# Apply migrations to remote (NO --local flag)
supabase db push

# Verify no schema drift
supabase db diff  # Must show no changes after push

# Existing migrations (in order):
# 1. 20251025160000_day1_essential.sql
# 2. 20251025174000_day2_templates_users.sql
# 3. 20251025185000_day5_pages.sql
# 4. 20251025190000_add_public_tenant_resolution_policies.sql
# 5. 20251025212500_themes.sql
# 6. 20251025213000_storage.sql
# 7. 20251025214500_navigation_menus.sql
```

## 🏗️ High-Level Architecture

### Technology Stack

- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5 (strict mode: `strict: true`, `noUncheckedIndexedAccess: true`)
- **Styling**: Tailwind CSS v4 + Typography Plugin
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Forms**: React Hook Form + Zod validation
- **Analytics**: Vercel Analytics, PostHog
- **Email**: Resend
- **Content**: MDX with frontmatter (gray-matter, remark-mdx-frontmatter)
- **UI Performance**: React Server Components (RSC) by default
- **Monitoring**: Sentry (planned)

### Core Architecture Patterns

**Multi-Tenant Security Model**

- Every database query filtered by `centre_id`
- Strict RLS policies enforcing data isolation
- Role-based access control (RBAC): super_admin, centre_admin, editor, viewer
- Service role operations server-side only (protected API routes)

**Static-First Rendering**

- Marketing site: Static + ISR, aggressive caching
- Centre sites: SSR with per-route caching + on-demand revalidation
- Admin portal: Server-side rendered (RSC), server actions for mutations
- API routes: For webhooks, integrations, admin operations

**Block Component System**

- Flexible page building with self-contained block components
- Each block: Component + Props type + Zod schema
- Runtime validation before database writes
- 10 blocks total across 8 categories

### Domain Resolution Strategy

The middleware resolves tenants based on hostname:

- Centre creation requires a primary domain. Default fallback is `{slug}.sites.edusitepro.co.za` and is prefilled in the form. If a custom domain is chosen, the default subdomain is still added for preview and stays verified until custom domain is verified.

- **Marketing**: `www.edusitepro.co.za` → marketing site
- **Admin**: `admin.edusitepro.co.za` → internal admin dashboard
- **Portal**: `portal.edusitepro.co.za` → client portal (planned)
- **Centre Sites**: `{slug}.sites.edusitepro.co.za` → tenant websites
- **Custom Domains**: `www.example.co.za` → verified custom domains

**Middleware Flow** (`src/middleware.ts`):

1. Parse hostname from request
2. Query Supabase for centre via RLS-enabled anonymous client
3. Inject `x-tenant-id` header into request
4. Cache result for 5 minutes

**Security**: Uses Row-Level Security (RLS) policies—NO service role key required in middleware. Database enforces tenant isolation.

## Block Component System

### Block Architecture

EduSitePro uses a **block-based content system** for flexible page building. Each block is a self-contained component with its own props schema.

**Block Registry** (`src/lib/blocks.ts`):

- 10 blocks total: Hero, RichText, ContactCTA, ProgramGrid, StaffCards, Testimonials, Gallery, Stats, Features, FeesTable
- Each block exports: Component, Props type, Zod schema
- Categories: header, content, contact, feature, media, team, pricing

**Block Definition Structure**:

```typescript
interface BlockDefinition {
  key: string; // Unique identifier
  displayName: string; // Human-readable name
  category: string; // Grouping
  component: ComponentType; // React component
  schema: ZodSchema; // Validation schema
  description?: string; // Help text
}
```

### Working with Blocks

**Adding a new block**:

1. Create component: `src/components/blocks/MyBlock.tsx`
2. Export props type and Zod schema from component
3. Register in `src/lib/blocks.ts`:
   - Import component, schema, and types
   - Add to `BLOCKS` registry
   - Add to `BlockProps` type union
4. Test validation with `validateBlockProps()`

**Block validation**: All blocks use Zod schemas for runtime validation. Use `validateBlockProps(key, props)` before rendering.

## Database Schema

### Core Tables

- **centres**: Tenants (ECD centres), includes slug, domains, branding, plan_tier
- **centre_domains**: Custom domain mappings with verification status
- **pages**: Content pages per centre (slug, title, status, is_homepage)
- **page_sections**: Block instances (block_key, props JSONB, order_index)
- **themes**: Centre-specific theme configurations
- **navigation_menus**: Dynamic navigation structures
- **templates**: Reusable page templates (planned)
- **cms_users** / **memberships**: User authentication and roles (planned)

### Row-Level Security (RLS)

All tenant data is isolated via RLS policies:

- Anonymous users can read **active** centres and **verified** domains
- Authenticated users can only access their assigned centres
- Service role bypasses RLS (use sparingly, only in admin API routes)

**Important**: Use the anonymous Supabase client in middleware and public-facing pages. Service role key should ONLY be used in protected API routes.

## File Structure & Conventions

### Path Aliases

Use `@/` for imports: `import { supabase } from '@/lib/supabase'`

### Key Directories

```
src/
├── app/                 # Next.js App Router pages
│   ├── (marketing)/    # Marketing site routes (grouped)
│   ├── admin/          # Admin dashboard (builder, centres, themes, media)
│   ├── templates/      # NCF template pages
│   ├── api/            # API routes (lead capture, webhooks)
│   └── [slug]/         # Dynamic centre site routes
├── components/
│   ├── blocks/         # Block components (Hero, Gallery, etc.)
│   ├── admin/          # Admin UI (BlockSelector, FormFields, etc.)
│   ├── forms/          # Form components
│   └── site/           # Shared site components
├── lib/
│   ├── blocks.ts       # Block registry
│   ├── tenancy.ts      # Multi-tenant resolution
│   ├── supabase.ts     # Supabase client
│   └── templates/      # Template utilities and registry
└── types/              # TypeScript definitions
```

### MDX Content

NCF-aligned educational templates are stored in `content/templates/*.mdx` with frontmatter metadata. Cover images in `public/templates/*.png`.

## Environment Variables

**Required for Development**:

```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Anon/public key (safe for client)
NEXT_PUBLIC_SITE_URL=             # Base URL (localhost:3000 for dev)
NEXT_PUBLIC_EDUDASH_APP_URL=      # EduDash Pro app URL for deep links
NEXT_PUBLIC_TENANT_BASE_DOMAIN=   # Default: sites.edusitepro.co.za
```

**Optional/Production**:

```bash
SUPABASE_SERVICE_ROLE_KEY=        # Only for admin API routes
RESEND_API_KEY=                   # Email sending
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=    # Form protection
NEXT_PUBLIC_POSTHOG_KEY=          # Analytics
```

Copy `.env.example` to `.env.local` and populate before starting development.

## Development Workflow

### Testing Multi-Tenancy Locally

Edit `/etc/hosts`:

```
127.0.0.1  sunnydays.sites.edusitepro.local
127.0.0.1  admin.edusitepro.local
```

Then visit:

- Marketing: `http://localhost:3000`
- Centre: `http://sunnydays.sites.edusitepro.local:3000`
- Admin: `http://admin.edusitepro.local:3000`

### Before Committing

```bash
npm run verify  # Must pass: lint, typecheck, test, build
```

Husky pre-commit hooks run `lint-staged` (Prettier + ESLint on staged files).

### Deployment

**Vercel** (automatic on push to main):

1. Connects to GitHub repository
2. Runs `npm run build` (includes typecheck)
3. Deploys to edge functions
4. Configure environment variables in Vercel dashboard

**DNS Configuration** for custom domains:

```
Type:  CNAME
Name:  edusitepro (or www)
Value: cname.vercel-dns.com
```

## 📚 Official Documentation References

### Critical: Always Reference Current API Versions

**Master Reference**: Verify code suggestions are compatible with these versions:

#### Next.js 14.2.5

**Documentation**: https://nextjs.org/docs

✅ **CORRECT App Router Patterns**:

```typescript
// ✅ Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ Client Component (when needed)
'use client';
import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState()}>Click</button>;
}

// ✅ Server Actions
export async function submitForm(formData: FormData) {
  'use server';
  // Server-side logic
}
```

#### Supabase JS v2

**Documentation**: https://supabase.com/docs/reference/javascript/introduction

✅ **CORRECT v2 Patterns**:

```typescript
// ✅ Multi-tenant query (REQUIRED pattern)
const { data, error } = await supabase.from('pages').select('*').eq('centre_id', centreId); // REQUIRED for tenant isolation!

// ✅ Insert with centre_id
const { data, error } = await supabase.from('pages').insert({
  title: 'About Us',
  centre_id: centreId, // REQUIRED!
  slug: 'about',
});

// ✅ Update with RLS protection
const { data, error } = await supabase
  .from('pages')
  .update({ status: 'published' })
  .eq('id', pageId)
  .eq('centre_id', centreId); // REQUIRED!
```

#### TypeScript 5

**Documentation**: https://www.typescriptlang.org/docs/

✅ **CRITICAL tsconfig for Next.js**:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Zod Validation

**Documentation**: https://zod.dev/

```typescript
import { z } from 'zod';

// ✅ Define schema
const PageSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title required').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug'),
  centre_id: z.string().uuid(),
  status: z.enum(['draft', 'published', 'archived']),
});

// ✅ Infer TypeScript type from schema
type Page = z.infer<typeof PageSchema>;

// ✅ Validate data
const result = PageSchema.safeParse(data);
if (result.success) {
  const validPage: Page = result.data;
} else {
  const errors = result.error.flatten();
  console.error('Validation errors:', errors.fieldErrors);
}
```

## ⚠️ Common Pitfalls & Solutions

### Multi-Tenant Data Leakage

**Problem**: Forgetting to filter by `centre_id`.  
**Solution**: ALWAYS include centre filter in queries.

```typescript
// ❌ WRONG: No tenant filter
const { data } = await supabase.from('pages').select('*');

// ✅ CORRECT: With tenant isolation
const { data } = await supabase.from('pages').select('*').eq('centre_id', centreId); // REQUIRED!
```

### Block Props Validation

**Problem**: Saving invalid block props to database.  
**Solution**: Always validate with Zod before saving.

```typescript
import { validateBlockProps } from '@/lib/blocks';

// ❌ WRONG: No validation
await supabase.from('page_sections').insert({ block_key: 'hero', props });

// ✅ CORRECT: Validate first
const result = validateBlockProps('hero', props);
if (result.success) {
  await supabase.from('page_sections').insert({
    block_key: 'hero',
    props: result.data,
  });
} else {
  console.error('Validation errors:', result.errors);
}
```

### Server vs Client Components

**Problem**: Using client-only features in Server Components.  
**Solution**: Use `'use client'` directive when needed.

```typescript
// ❌ WRONG: useState in Server Component
export default function Page() {
  const [state, setState] = useState();  // Error!
  return <div>{state}</div>;
}

// ✅ CORRECT: Mark as Client Component
'use client';
import { useState } from 'react';

export default function Page() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

### Missing RLS Policies

**Problem**: Database operations fail due to missing RLS policies.  
**Solution**: Ensure RLS policies exist for all tables.

```sql
-- ✅ CORRECT: RLS policy for centres table
CREATE POLICY "Public can read active centres"
ON centres FOR SELECT
TO anon
USING (status = 'active');

-- ✅ CORRECT: RLS policy for pages table
CREATE POLICY "Centre admins can manage pages"
ON pages FOR ALL
TO authenticated
USING (centre_id = auth.uid()::text);
```

## 🚨 Critical Development Rules

### Database Operations (NON-NEGOTIABLE)

- **NEVER** execute SQL directly via Supabase Dashboard for schema changes
- **ALWAYS** use `supabase migration new` for schema changes
- **ALWAYS** use `supabase db push` (no --local flag)
- **ALWAYS** verify no drift with `supabase db diff` after push
- **ALWAYS** include RLS policies in migrations

### Security & Authentication

- **NEVER** expose service role keys on client-side
- **ALWAYS** use anonymous Supabase client in middleware
- **ALWAYS** maintain RLS policies for tenant isolation
- **ALWAYS** validate block props with Zod before database writes
- **ALWAYS** filter queries by `centre_id` for multi-tenant isolation

### File Organization

- Use path alias `@/` for all imports: `import { supabase } from '@/lib/supabase'`
- Keep components under 400 lines (extract to subcomponents)
- Keep screens under 500 lines
- Keep utilities/services under 500 lines
- Extract StyleSheets to separate files if >200 lines

## Code Style & Best Practices

### TypeScript

- **Strict mode enabled** (`strict: true`, `noUncheckedIndexedAccess: true`)
- Always export types alongside components
- Use Zod schemas for runtime validation, infer types with `z.infer<>`
- Prefer explicit return types for public functions

### React

- Use React Server Components (RSC) by default
- Add `"use client"` directive only when necessary (forms, interactivity)
- Prefer composition over prop drilling
- Use semantic HTML and ARIA attributes

### Styling

- Use Tailwind utility classes (v4 with `@import` syntax)
- Consistent spacing scale (px-4, py-6, etc.)
- Mobile-first responsive design
- Dark mode support via `dark:` variants

#### Accessibility & Contrast

- Do not use white text on white or near-white backgrounds. Maintain at least WCAG AA contrast (4.5:1) for text.
- Primary buttons: bg-amber-700 text-white (hover:bg-amber-800). Disabled buttons: bg-stone-200 text-stone-500; never white-on-light.
- Input fields: text-stone-900, placeholder:text-stone-400, labels text-stone-800.
- Avoid using color alone to convey state; pair with icons/text. Provide focus-visible rings for keyboard users.

### Zod Schemas

- Define schemas alongside components
- Export both schema and inferred type
- Use descriptive error messages: `z.string().min(1, "Title required")`
- Validate at runtime before database writes

## South African & NCF Compliance

### NCF Pillars

Templates must align with these six pillars:

1. Well-being
2. Identity & Belonging
3. Communication
4. Mathematics
5. Creativity & Imagination
6. Knowledge & Understanding of the World

### POPIA Compliance

- Privacy-first data handling
- Explicit consent for data collection
- Right to access and deletion (planned)
- Local hosting in South Africa

### Localization

- English primary, Afrikaans/Zulu support planned
- ZAR currency formatting
- South African date formats
- Local payment providers (Paystack, Peach Payments)

## Common Tasks

### Add a new page to a centre site

1. Insert into `pages` table with `centre_id` and `slug`
2. Insert blocks into `page_sections` with `page_id`, `block_key`, `props`, `order_index`
3. Use `validateBlockProps()` before saving props
4. Revalidate Next.js cache: `revalidatePath()`

### Create a new block

1. Component: `src/components/blocks/MyBlock.tsx`
2. Export: `MyBlock`, `MyBlockProps`, `myBlockSchema`
3. Register: Add to `BLOCKS` in `src/lib/blocks.ts`
4. Add to type union: `BlockProps<K extends BlockKey>`

### Update database schema

1. Create migration: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Include RLS policies for new tables
3. Test locally with `supabase db push`
4. Document in `SYSTEM_DOCUMENTATION.md`

## ✅ Pre-Implementation Checklist

**Purpose**: Validate requirements before starting any feature implementation.

### Before Writing Code

#### 1. Requirements Validation

- [ ] User story or feature spec is clear and unambiguous
- [ ] Acceptance criteria are defined
- [ ] Success metrics identified

#### 2. Documentation Review

- [ ] Reviewed relevant section in WARP.md
- [ ] Verified current package versions in package.json
- [ ] Checked Next.js, Supabase, TypeScript documentation

#### 3. Architecture & Design

- [ ] Component fits within file size limits (≤400 lines components, ≤500 lines screens)
- [ ] Multi-tenant isolation pattern planned (centre_id filters)
- [ ] Server vs Client Component decision made
- [ ] Error states and empty states designed

#### 4. Database Changes (if applicable)

- [ ] Migration file created with `supabase migration new <name>`
- [ ] RLS policies defined for tenant isolation
- [ ] Service role usage limited to protected API routes only
- [ ] NO direct SQL execution in Supabase Dashboard

#### 5. API & Data Layer

- [ ] Supabase v2 syntax verified
- [ ] All queries include centre_id filter
- [ ] Block props validation with Zod before saving
- [ ] Error handling implemented
- [ ] Loading states defined

#### 6. UI & Styling

- [ ] Tailwind CSS v4 utility classes used
- [ ] Mobile-first responsive design
- [ ] Dark mode support via `dark:` variants
- [ ] South African localization (ZAR currency, date formats)

#### 7. TypeScript & Type Safety

- [ ] TypeScript strict mode patterns used
- [ ] Zod schemas defined for validation
- [ ] Proper type imports/exports
- [ ] No `any` types (or justified with comment)

#### 8. Security & Compliance

- [ ] Row Level Security (RLS) policies enforce tenant isolation
- [ ] No sensitive keys in client code
- [ ] Service role operations server-side only
- [ ] POPIA compliance for data handling

### After Implementation

- [ ] Run `npm run typecheck` (must pass)
- [ ] Run `npm run lint` (max 2 warnings)
- [ ] Run `npm run build` (must succeed)
- [ ] Test multi-tenant data isolation
- [ ] Verify dark mode works
- [ ] Create PR with documentation references
- [ ] Code review by peer

## Troubleshooting

### Build Failures

```bash
# Clean build cache
rm -rf .next node_modules/.cache
npm run build
```

### Template 404s

```bash
# MDX templates not loading
rm -rf .next && npm run dev
```

### Middleware Not Resolving Tenant

- Check centre exists: `SELECT * FROM centres WHERE slug='sunnydays' AND status='active'`
- Verify RLS policies: `GRANT SELECT ON centres TO anon`
- Clear cache: Restart dev server

### TypeScript Errors

- Run `npm run typecheck` to see all errors
- Check `tsconfig.json` paths: `@/*` should resolve to `./src/*`
- Ensure block schemas are properly exported

## 📚 Key Documentation

### Project Documentation

- **README.md** - Project overview, features, setup
- **WARP.md** - This file (highest authority for development)
- **SYSTEM_DOCUMENTATION.md** - Detailed architecture, database schema, progress tracker
- **TRANSFORMATION-PLAN.md** - 2-week roadmap to full SaaS platform

### Technical Documentation

- **docs/templates-system.md** - NCF template architecture
- **docs/deployment-guide.md** - Vercel deployment guide
- **supabase/migrations/** - Database schema evolution

### Admin Dashboard (In Progress)

**Location**: `src/app/admin/*`

Current features:

- Centre management dashboard
- Page builder with block selector
- Block props editor with form fields
- Theme customization (in progress)

Access: `http://localhost:3000/admin` (authentication planned)

## 📋 Development Workflow

1. **Before Starting**: Review `WARP.md` and `TRANSFORMATION-PLAN.md` for current execution plan
2. **Feature Development**: Server-first design, handle empty states properly
3. **Database Changes**: Use migration workflow, never direct SQL execution
4. **Code Quality**: TypeScript strict mode, ESLint compliance (max 2 warnings)
5. **Testing**: Test multi-tenant isolation, verify on localhost and `/etc/hosts` domains
6. **Security**: Maintain RLS policies, never expose sensitive keys
7. **Documentation**: Update relevant docs when adding features
8. **PR Submission**: Include "Documentation Sources" section with links to official docs consulted

## 🔧 Build & Deployment

### Environment Configuration

- `.env.local` contains development secrets (not committed)
- `.env.example` shows required environment variables
- Production builds use Vercel automatic deployment
- Copy `.env.example` to `.env.local` and populate before starting

### CI/CD Pipeline

- Quality gates: TypeScript, ESLint, build validation
- Automatic deployment on push to main
- Preview deployments for pull requests
- Environment variables managed in Vercel dashboard

### Key Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_EDUDASH_APP_URL=

# Optional/Production
SUPABASE_SERVICE_ROLE_KEY=      # Only for admin API routes
RESEND_API_KEY=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```
