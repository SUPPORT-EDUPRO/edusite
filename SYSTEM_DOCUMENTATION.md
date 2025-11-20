# EduSitePro - Complete System Documentation

**Last Updated:** 2025-01-25  
**Current Version:** v0.1.0-alpha  
**Status:** Day 4 In Progress - Block Props Editor Complete  
**Phase:** Foundation (Phase 1) ~45% Complete

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Multi-Tenancy System](#multi-tenancy-system)
5. [Block Component System](#block-component-system)
6. [Template System](#template-system)
7. [Development Progress](#development-progress)
8. [Setup & Installation](#setup--installation)
9. [Security Model](#security-model)
10. [Database Schema](#database-schema)

---

## System Overview

**EduSitePro** is a multi-tenant SaaS platform that enables South African Early Childhood Development (ECD) centres to quickly deploy professional, NCF-aligned websites.

### Key Features

- 🏢 **Multi-tenant architecture** - One codebase serves hundreds of centres
- 🎨 **Block-based page builder** - Drag-and-drop content blocks
- 📚 **NCF-aligned templates** - Pre-built educational activity templates
- 🔐 **Row-level security** - Database-enforced tenant isolation
- 🚀 **Edge deployment** - Fast global performance via Vercel
- 📱 **Responsive design** - Mobile-first, accessible interfaces

### Target Users

1. **ECD Centre Owners** - Create and manage their centre's website
2. **Parents** - Browse programs, enroll, view updates
3. **Platform Admins** - Manage all centres, content, billing

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser/Client                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Middleware (Edge)                       │
│  - Domain Resolution (RLS-based)                            │
│  - Tenant Identification                                     │
│  - Request Header Injection                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  Marketing Site  │    │  Centre Sites    │
│  (edusitepro.*) │    │  (*.sites.*)     │
└──────────────────┘    └──────────────────┘
        │                         │
        └────────────┬────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Database                          │
│  - Centres (tenants)                                        │
│  - Pages                                                     │
│  - Sections (blocks)                                         │
│  - Templates                                                 │
│  - RLS Policies                                              │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User visits domain** (e.g., `sunnydays.sites.edusitepro.co.za`)
2. **Middleware intercepts** request at edge
3. **Tenant resolution** via RLS query (cached 5min)
4. **Header injection** adds `x-centre-id` to request
5. **Page rendering** fetches tenant-specific data
6. **Response delivery** with personalized content

---

## Technology Stack

### Frontend

- **Framework:** Next.js 14.2.5 (App Router)
- **Language:** TypeScript 5.5.4
- **Styling:** Tailwind CSS 3.4.1
- **UI Components:** Custom + shadcn/ui patterns
- **Forms:** React Hook Form + Zod validation
- **Icons:** Inline SVG (Heroicons style)

### Backend

- **Runtime:** Node.js 20.x
- **Database:** Supabase (PostgreSQL 15)
- **Auth:** Supabase Auth (planned)
- **Storage:** Supabase Storage (for images)
- **Caching:** In-memory Map (5min TTL)

### DevOps

- **Hosting:** Vercel (Edge Functions)
- **Database:** Supabase Cloud
- **CI/CD:** Vercel Git integration
- **Monitoring:** Sentry (planned)
- **Analytics:** PostHog

### Development Tools

- **Package Manager:** npm
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Git Hooks:** Husky (planned)

---

## Multi-Tenancy System

### Domain Strategy

EduSitePro supports three types of domains:

1. **Marketing Site**
   - Primary: `www.edusitepro.co.za`
   - Routes: `/`, `/pricing`, `/templates`, `/bulk`

2. **Default Subdomains**
   - Pattern: `{slug}.sites.edusitepro.co.za`
   - Example: `sunnydays.sites.edusitepro.co.za`
   - Auto-provisioned for each centre

3. **Custom Domains** (Future)
   - Example: `www.sunnydaysecd.co.za`
   - Requires DNS verification

### Tenant Resolution

**Method:** Row-Level Security (RLS) queries with anonymous client

```typescript
// Middleware queries active centres using anon key
const centre = await supabase
  .from('centres')
  .select('*')
  .eq('slug', slug)
  .eq('status', 'active')
  .single();
```

**Benefits:**

- ✅ No service role key in environment
- ✅ Database-enforced security
- ✅ 5-minute in-memory caching
- ✅ Edge-compatible queries

### Tenant Isolation

Each tenant's data is isolated via:

1. **Foreign Keys:** All content linked to `centre_id`
2. **RLS Policies:** Database-level access control
3. **Middleware Headers:** Request-scoped context
4. **Query Filters:** Application-level checks

---

## Block Component System

### Overview

EduSitePro uses a **block-based content system** inspired by WordPress Gutenberg and Notion.

### Block Structure

```typescript
interface BlockDefinition {
  key: string; // Unique identifier
  displayName: string; // Human-readable name
  category: 'header' | 'content'; // Grouping
  component: ComponentType<any>; // React component
  schema: ZodSchema; // Validation schema
  description?: string; // Help text
  thumbnail?: string; // Preview image
}
```

### Available Blocks (10 total)

| Block            | Category | Description              | Schema Fields                  |
| ---------------- | -------- | ------------------------ | ------------------------------ |
| **Hero**         | header   | Full-width hero with CTA | title, subtitle, image, cta    |
| **RichText**     | content  | WYSIWYG text editor      | content (HTML)                 |
| **ContactCTA**   | contact  | Contact form + info      | title, phone, email, address   |
| **ProgramGrid**  | content  | Programs showcase        | programs[], columns            |
| **StaffCards**   | team     | Staff profiles           | staff[], columns               |
| **Testimonials** | content  | Reviews with ratings     | testimonials[], showRatings    |
| **Gallery**      | media    | Photo/video gallery      | items[], columns, showCaptions |
| **Stats**        | content  | Key metrics              | stats[], variant, columns      |
| **Features**     | feature  | Feature highlights       | features[], variant, columns   |
| **FeesTable**    | pricing  | Pricing tables           | categories[], showDescriptions |

### Block Registry

**Location:** `src/lib/blocks.ts`

```typescript
// Register a block
export const BLOCKS: Record<string, BlockDefinition> = {
  hero: {
    key: 'hero',
    displayName: 'Hero',
    category: 'header',
    component: Hero,
    schema: heroSchema,
  },
  // ... more blocks
};

// Use blocks
const block = getBlock('hero');
const result = validateBlockProps('hero', props);
```

### Schema Validation

Every block uses **Zod** for runtime validation:

```typescript
export const heroSchema = z.object({
  title: z.string().min(1, 'Title required').max(100),
  subtitle: z.string().max(200).optional(),
  backgroundImage: z.string().url().optional(),
  cta: z
    .object({
      text: z.string(),
      href: z.string(),
    })
    .optional(),
});

export type HeroProps = z.infer<typeof heroSchema>;
```

### Creating a New Block

1. Create component file: `src/components/blocks/MyBlock.tsx`
2. Define Zod schema: `myBlockSchema`
3. Export schema and types
4. Register in `src/lib/blocks.ts`
5. Add to type union in `BlockProps`

---

## Template System

### Overview

Templates are **pre-built content structures** for common use cases (e.g., "Program Page", "About Page", "Contact Page").

### Template Structure

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'page' | 'section';
  sections: Section[]; // Ordered list of blocks
  isDefault: boolean;
  previewImage?: string;
}

interface Section {
  blockKey: BlockKey;
  props: Record<string, any>;
  order: number;
}
```

### Template Registry

**Location:** `src/lib/templates/registry.ts`

Contains metadata for:

- NCF-aligned activity templates
- Page templates (planned)
- Section templates (planned)

### Using Templates

```typescript
// Load template
const template = getTemplateBySlug('welcome-play');

// Instantiate with centre data
const page = instantiateTemplate(template, {
  centreName: 'Sunny Days ECD',
  centreId: 'uuid',
});

// Save to database
await savePage(page);
```

---

## Page Builder Data Flow

1. Tenant resolution injects x-centre-id via middleware (cached).
2. Admin selects centre in builder (CentreSelector).
3. Page list fetched via GET /api/pages?centre_id=UUID.
4. Creating a page calls POST /api/pages with title, slug, centre_id.
5. Loading a page calls GET /api/pages/[id] returning blocks.
6. Editing blocks validates props against Zod schemas (client) and again on save (server).
7. Saving calls PUT /api/pages/[id] with ordered blocks; server validates and persists to page_blocks.
8. Publishing calls PUT /api/pages/[id]/publish; server flips is_published and revalidates path.

## Development Progress

### ✅ Day 1 Complete (2025-01-24)

**Theme:** Foundation & Multi-Tenancy Setup

1. **Database Schema**
   - Created migration: `20250125000001_create_initial_schema.sql`
   - Tables: centres, centre_domains, pages, page_sections, templates
   - RLS policies: Basic tenant isolation

2. **Middleware & Tenancy**
   - Built tenant resolution system
   - Domain-based routing
   - In-memory caching (5min TTL)

3. **Initial Blocks**
   - Hero block with CTA
   - RichText content block
   - ContactCTA form block

**Files Created:**

- `supabase/migrations/20250125000001_create_initial_schema.sql`
- `src/lib/tenancy.ts`
- `src/middleware.ts`
- `src/components/blocks/Hero.tsx`
- `src/components/blocks/RichText.tsx`
- `src/components/blocks/ContactCTA.tsx`
- `src/lib/blocks.ts`

---

### ✅ Day 2 Complete (2025-01-25)

**Theme:** Block Library Expansion & Security Hardening

1. **New Block Components (7)**
   - ProgramGrid - Educational programs showcase
   - StaffCards - Team member profiles
   - Testimonials - Reviews with star ratings
   - Gallery - Mixed media gallery
   - Stats - Metrics display (3 variants)
   - Features - Feature highlights (3 layouts)
   - FeesTable - Pricing tables with categories

2. **Security Improvements**
   - Refactored to RLS-based tenant resolution
   - Removed service role key requirement
   - Created `TENANT_RESOLUTION.md` documentation
   - Added RLS migration: `20250125000002_add_public_tenant_resolution_policies.sql`

3. **Bug Fixes**
   - Fixed middleware routing (removed incorrect rewrites)
   - Created placeholder partner logos
   - Fixed TypeScript build errors

4. **Documentation**
   - Created `docs/DAY_2_PROGRESS.md`
   - Created `docs/TENANT_RESOLUTION.md`

**Files Created:**

- `src/components/blocks/ProgramGrid.tsx`
- `src/components/blocks/StaffCards.tsx`
- `src/components/blocks/Testimonials.tsx`
- `src/components/blocks/Gallery.tsx`
- `src/components/blocks/Stats.tsx`
- `src/components/blocks/Features.tsx`
- `src/components/blocks/FeesTable.tsx`
- `supabase/migrations/20250125000002_add_public_tenant_resolution_policies.sql`
- `docs/TENANT_RESOLUTION.md`
- `docs/DAY_2_PROGRESS.md`
- `public/partners/hasc-logo.png`
- `public/partners/soa-logo.png`

**Build Status:** ✅ All checks passing, 27 static pages

---

### ✅ Day 3 Complete (2025-01-25)

**Theme:** Admin Dashboard & Page Builder Foundation

1. **Admin Dashboard**
   - Created professional admin layout with sidebar navigation
   - Built dashboard home page with stats and quick actions
   - Implemented responsive layout with header and content areas
   - Added navigation for all admin sections

2. **Page Builder Foundation**
   - Built page builder interface with 3-panel layout
   - Created block selector component with search/filtering
   - Implemented block add/remove/reorder functionality
   - Added properties panel structure (ready for forms)

3. **Block Library UI**
   - Searchable block library with 10 blocks
   - Category filtering (8 categories)
   - Block cards with descriptions
   - Visual feedback on hover/selection

4. **User Experience**
   - Drag-free reordering with up/down buttons
   - Visual block selection highlighting
   - Empty state guidance
   - Professional UI matching design system

**Files Created:**

- `src/components/admin/AdminLayout.tsx`
- `src/components/admin/BlockSelector.tsx`
- `src/app/admin/builder/page.tsx`

**Files Modified:**

- `src/app/admin/page.tsx` (new dashboard design)
- `SYSTEM_DOCUMENTATION.md` (Day 3 progress)

**Build Status:** ✅ All checks passing, admin routes working

---

### 🚧 Day 4 In Progress (2025-01-25)

**Theme:** Block Props Editor & Database Integration

**Completed:**

1. **Form Field Components** ✅
   - TextField with character counter
   - TextAreaField with multi-row support
   - NumberField with min/max/step
   - CheckboxField for booleans
   - SelectField with options
   - ImageField with live preview

2. **Block Props Editor** ✅
   - Integrated with page builder
   - Real-time prop updates
   - Support for 6 block types
   - Validation feedback
   - Fallback for unsupported blocks

3. **Page Builder Enhancement** ✅
   - Properties panel now functional
   - Live editing of block props
   - Props persist across blocks
   - Visual feedback on changes

**In Progress:**

4. **Database Integration**
   - [ ] API routes for pages CRUD
   - [ ] API routes for sections CRUD
   - [ ] Save/load page builder state
   - [ ] Publish/draft workflow

5. **Advanced Editors**
   - [ ] Array field editors (testimonials, programs, etc.)
   - [ ] Dynamic schema parsing
   - [ ] Complex nested objects

**Files Created (Day 4):**

- `src/components/admin/FormFields.tsx` (6 field components)
- `src/components/admin/BlockPropsEditor.tsx`

**Files Modified:**

- `src/app/admin/builder/page.tsx` (props editor integration)

---

## Setup & Installation

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Supabase account
- Vercel account (for deployment)

### Local Development Setup

1. **Clone repository**

   ```bash
   git clone https://github.com/yourusername/edusitepro.git
   cd edusitepro
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # Service role key only needed for admin operations
   # SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run database migrations**

   ```bash
   # Via Supabase CLI
   supabase db push

   # Or manually in Supabase SQL Editor
   # Run files in supabase/migrations/ in order
   ```

5. **Start dev server**

   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

### Testing Different Tenants Locally

Use `/etc/hosts` to test multi-tenancy:

```bash
# Add to /etc/hosts
127.0.0.1  sunnydays.sites.edusitepro.local
127.0.0.1  admin.edusitepro.local
```

Then visit:

- Marketing: `http://localhost:3000`
- Centre: `http://sunnydays.sites.edusitepro.local:3000`
- Admin: `http://admin.edusitepro.local:3000`

---

## Security Model

### Authentication (Planned)

- **Method:** Supabase Auth with JWT
- **Providers:** Email/password, Google, Microsoft
- **Roles:** `platform_admin`, `centre_admin`, `centre_staff`

### Authorization

**Row-Level Security (RLS) Policies:**

```sql
-- Centres: Public read for active centres
CREATE POLICY "Public can read active centres"
ON centres FOR SELECT
TO anon
USING (status = 'active');

-- Pages: Centre admins can manage their pages
CREATE POLICY "Centre admins can manage pages"
ON pages FOR ALL
TO authenticated
USING (centre_id = auth.uid()::text);
```

### Data Protection

- ✅ No sensitive keys in code
- ✅ Database-enforced tenant isolation
- ✅ HTTPS-only in production
- ✅ Content Security Policy headers
- 🔜 Rate limiting on forms
- 🔜 CAPTCHA on public forms

### Secrets Management

- **Development:** `.env.local` (gitignored)
- **Production:** Vercel environment variables
- **Never commit:** Service role keys, API keys

---

## Database Schema

### Core Tables

#### `centres` (Tenants)

```sql
CREATE TABLE centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  primary_domain TEXT,
  default_subdomain TEXT,
  plan_tier TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `centre_domains` (Custom Domains)

```sql
CREATE TABLE centre_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `pages` (Content Pages)

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  status TEXT DEFAULT 'draft',
  is_homepage BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(centre_id, slug)
);
```

#### `page_sections` (Block Instances)

```sql
CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  block_key TEXT NOT NULL,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `templates` (Page Templates)

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT FALSE,
  preview_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Relationships

```
centres (1) ──< (N) centre_domains
centres (1) ──< (N) pages
pages (1) ──< (N) page_sections
templates (N) ──< (1) pages (via template_id FK)
```

---

## API Routes (Planned)

### Admin API

- `POST /api/admin/centres` - Create centre
- `GET /api/admin/centres` - List centres
- `PUT /api/admin/centres/:id` - Update centre
- `DELETE /api/admin/centres/:id` - Delete centre

### Pages API

- `POST /api/admin/pages` - Create page
- `GET /api/admin/pages/:id` - Get page
- `PUT /api/admin/pages/:id` - Update page
- `DELETE /api/admin/pages/:id` - Delete page

### Sections API

- `POST /api/admin/sections` - Add block to page
- `PUT /api/admin/sections/:id` - Update block props
- `DELETE /api/admin/sections/:id` - Remove block
- `PUT /api/admin/sections/reorder` - Reorder blocks

---

## Deployment

### Vercel Deployment

1. **Connect GitHub repository**
2. **Configure environment variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY (for admin API)
   ```
3. **Deploy**
   - Automatic on git push
   - Preview deployments for PRs
   - Production on main branch

### Custom Domains

1. **Add domain in Vercel**
2. **Update DNS records**
   ```
   CNAME  www  cname.vercel-dns.com
   ```
3. **Verify in database**
   ```sql
   UPDATE centre_domains
   SET verification_status = 'verified'
   WHERE domain = 'example.com';
   ```

---

## Performance Optimization

### Current Optimizations

- ✅ Edge middleware (low latency routing)
- ✅ 5-minute tenant cache
- ✅ Static page generation where possible
- ✅ Image optimization via Next.js Image
- ✅ Tailwind CSS tree-shaking

### Planned Optimizations

- 🔜 CDN caching for static assets
- 🔜 Database query optimization
- 🔜 Lazy loading for blocks
- 🔜 Service worker for offline mode
- 🔜 Redis cache for hot data

---

## Testing Strategy

### Unit Tests (Planned)

- Block component rendering
- Schema validation
- Utility functions
- Tenant resolution logic

### Integration Tests (Planned)

- Block registry operations
- Template instantiation
- Database migrations
- API endpoints

### E2E Tests (Planned)

- User flows (create page, add blocks)
- Multi-tenant isolation
- Form submissions
- Admin dashboard

---

## Troubleshooting

### Common Issues

**Issue:** "Missing SUPABASE_SERVICE_ROLE_KEY"  
**Solution:** This is only needed for admin operations. For development, the app uses RLS with anon key.

**Issue:** "Centre not found" in middleware  
**Solution:** Ensure centre exists in database with `status='active'` and correct slug.

**Issue:** Images not loading  
**Solution:** Check `public/` directory structure and Next.js Image configuration.

**Issue:** TypeScript errors in blocks  
**Solution:** Ensure schema is exported and imported in `blocks.ts` registry.

---

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow Airbnb React style guide
- Use Prettier for formatting
- Write JSDoc comments for public APIs

### Commit Messages

```
feat: Add testimonials block component
fix: Resolve middleware routing issue
docs: Update system documentation
refactor: Simplify tenant cache logic
test: Add unit tests for blocks registry
```

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with description
5. Address review feedback
6. Merge after approval

---

## Roadmap

### Phase 1: Foundation (Current)

- ✅ Multi-tenant architecture
- ✅ Block component system
- ✅ Basic admin dashboard
- 🚧 Template system

### Phase 2: Builder

- 🔜 Drag-and-drop page builder
- 🔜 Visual block editor
- 🔜 Template marketplace
- 🔜 Theme customization

### Phase 3: Features

- 🔜 Online enrollment forms
- 🔜 Parent portal
- 🔜 Payment integration
- 🔜 Email notifications

### Phase 4: Scale

- 🔜 White-label solution
- 🔜 API for integrations
- 🔜 Mobile app
- 🔜 Advanced analytics

---

## Support & Resources

- **Documentation:** `/docs` directory
- **GitHub Issues:** For bug reports and features
- **Email:** support@edusitepro.co.za
- **Slack:** (Internal team channel)

---

## Appendix

### Glossary

- **Block:** Reusable content component (Hero, Gallery, etc.)
- **Centre:** ECD facility (tenant in multi-tenant system)
- **NCF:** National Curriculum Framework (South Africa)
- **RLS:** Row-Level Security (PostgreSQL feature)
- **Section:** Instance of a block on a page
- **Template:** Pre-configured page structure
- **Tenant:** Independent customer (centre) in the system

### References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)
- [NCF Framework](https://www.education.gov.za/)

---

**End of Documentation**  
_This document is updated after each development sprint._
