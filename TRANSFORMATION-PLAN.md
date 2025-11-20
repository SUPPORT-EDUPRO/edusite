# 🚀 EduSitePro Transformation Plan

## From Marketing Site to Full SaaS Platform

**Timeline:** 2 weeks (Launch by 2025-11-08)  
**Last Updated:** 2025-10-25  
**Status:** Planning → Implementation

---

## 🎯 Vision

Transform EduSitePro from a simple marketing website into a **comprehensive programs and services engine for South African ECD organizations**, enabling:

- ✅ **One-click website creation** from NCF-aligned templates
- ✅ **Multi-tenant CMS** with role-based access control
- ✅ **Internal admin dashboard** for monitoring, provisioning, and support
- ✅ **Client portal** for content management, analytics, and service requests
- ✅ **Marketing services marketplace** (social media, content, SEO)
- ✅ **Automated billing and subscriptions** (ZAR-native payment providers)
- ✅ **Performance monitoring and analytics aggregation**
- ✅ **POPIA-compliant** data handling and consent management

---

## 📊 Success Metrics (Instrumented by Day 10)

1. **Lead Metrics**
   - Lead volume and quality (form submissions, bulk quotes)
   - Conversion rate to paid subscriptions
   - Average deal size and time-to-close

2. **Product Metrics**
   - EduDash Pro deep-link click-through rate
   - Active centres and websites deployed
   - Portal engagement (logins, CMS edits, service orders)

3. **Technical Metrics**
   - SEO indexed pages per centre
   - Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)
   - Uptime (target: 99.9%)
   - Time to provision new centre (target: <3 minutes)

4. **Business Metrics**
   - Monthly Recurring Revenue (MRR)
   - Average Revenue Per Centre (ARPC)
   - Customer Acquisition Cost (CAC)
   - Net Promoter Score (NPS)

---

## 🏗️ Architecture Overview

### Stack

- **Frontend:** Next.js 14.2.5 App Router, React 18, TypeScript 5, Tailwind CSS v4
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Hosting:** Vercel (Cape Town region, edge functions, cron)
- **Analytics:** PostHog (product), Vercel Analytics (web vitals)
- **Monitoring:** Sentry (errors), custom uptime checks
- **Payments:** Paystack/Peach Payments (ZAR-native)
- **Emails:** Resend/Mailgun (transactional, notifications)

### Multi-Tenancy Model

**Single Codebase, Domain-Based Tenant Resolution**

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Deployment                        │
├─────────────────────────────────────────────────────────────┤
│  www.edusitepro.co.za         → Marketing site              │
│  portal.edusitepro.co.za      → Client portal (auth)        │
│  admin.edusitepro.co.za       → Internal admin (super)      │
│  *.sites.edusitepro.co.za     → Centre sites (wildcard)     │
│  custom-domain.co.za          → Centre sites (custom DNS)   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Next.js Middleware (Tenant Resolver)            │
│  - Parse Host header                                         │
│  - Query centre_domains or match default_subdomain           │
│  - Inject centre_id into request context                     │
│  - Route to appropriate app group                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Row-Level Security                  │
│  - All tables have centre_id column                          │
│  - Policies enforce tenant isolation                         │
│  - super_admin role has cross-tenant access                  │
│  - Audit log tracks all privileged actions                   │
└─────────────────────────────────────────────────────────────┘
```

### Rendering Strategy

1. **Marketing Site** (www): Static + ISR, aggressive caching
2. **Portal/Admin**: Server-side rendered (RSC), server actions for mutations
3. **Centre Sites**: SSR with per-route caching + on-demand revalidation after publish
4. **API Routes**: For webhooks, integrations, legacy compatibility

---

## 🗄️ Database Schema Enhancements

### Core Tables (extend existing schema)

#### Multi-Tenancy & Provisioning

```sql
-- centres (existing) - add columns
ALTER TABLE centres ADD COLUMN plan_tier VARCHAR(20);
ALTER TABLE centres ADD COLUMN default_subdomain VARCHAR(100);
ALTER TABLE centres ADD COLUMN brand_theme JSONB DEFAULT '{}';
ALTER TABLE centres ADD COLUMN onboarding_status VARCHAR(20) DEFAULT 'pending';

-- templates (new)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ncf_alignment_tags TEXT[],
  default_pages JSONB,
  default_blocks JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- template_variants (new)
CREATE TABLE template_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id),
  key VARCHAR(100) NOT NULL,
  tokens JSONB, -- color palette, typography, spacing
  component_overrides JSONB,
  UNIQUE(template_id, key)
);

-- template_blocks (new)
CREATE TABLE template_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  props_schema JSONB, -- zod schema as JSON
  render_hint VARCHAR(100),
  category VARCHAR(50)
);
```

#### Content Management

```sql
-- pages (existing) - add columns
ALTER TABLE pages ADD COLUMN path VARCHAR(500);
ALTER TABLE pages ADD COLUMN page_type VARCHAR(50);
ALTER TABLE pages ADD COLUMN seo JSONB DEFAULT '{}';
ALTER TABLE pages ADD COLUMN published BOOLEAN DEFAULT false;
ALTER TABLE pages ADD COLUMN version INT DEFAULT 1;
ALTER TABLE pages ADD COLUMN last_published_at TIMESTAMPTZ;

-- sections (existing) - add columns
ALTER TABLE sections ADD COLUMN block_key VARCHAR(100);
ALTER TABLE sections ADD COLUMN props JSONB DEFAULT '{}';
ALTER TABLE sections ADD COLUMN order_index INT DEFAULT 0;
ALTER TABLE sections ADD COLUMN visibility VARCHAR(20) DEFAULT 'visible';
```

#### Users & Permissions

```sql
-- cms_users (new)
CREATE TABLE cms_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- memberships (new)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES cms_users(id),
  centre_id UUID REFERENCES centres(id),
  role VARCHAR(50) CHECK (role IN (
    'super_admin', 'ops_admin', 'marketing_manager',
    'centre_admin', 'editor', 'viewer'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, centre_id)
);
```

#### Marketing Services

```sql
-- marketing_services (new)
CREATE TABLE marketing_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_price_cents INT NOT NULL,
  sla_days INT,
  deliverables JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- service_packages (new)
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  includes JSONB, -- array of service_ids + quantities
  price_cents INT NOT NULL,
  cadence VARCHAR(20) CHECK (cadence IN ('one_off', 'monthly', 'quarterly')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- service_orders (new)
CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id),
  package_id UUID REFERENCES service_packages(id),
  status VARCHAR(20) DEFAULT 'submitted',
  priority VARCHAR(20) DEFAULT 'normal',
  submitted_by UUID REFERENCES cms_users(id),
  assigned_to UUID REFERENCES cms_users(id),
  due_date DATE,
  brief JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- service_tasks (new)
CREATE TABLE service_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES service_orders(id),
  type VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  assignee UUID REFERENCES cms_users(id),
  attachments JSONB,
  checklist JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Billing & Subscriptions

```sql
-- subscriptions (new)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id),
  tier VARCHAR(20), -- solo, five_pack, ten_pack
  provider VARCHAR(50), -- paystack, peach, payfast
  provider_customer_id VARCHAR(255),
  provider_subscription_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  setup_fee_paid BOOLEAN DEFAULT false,
  next_billing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- invoices (new)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id),
  amount_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  status VARCHAR(20) DEFAULT 'pending',
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Analytics & Monitoring

```sql
-- analytics_summary (new)
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id),
  period DATE NOT NULL,
  sessions INT DEFAULT 0,
  pageviews INT DEFAULT 0,
  avg_cwv JSONB, -- {lcp, cls, inp}
  conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(centre_id, period)
);

-- uptime_checks (new)
CREATE TABLE uptime_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id),
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  status_code INT,
  ttfb_ms INT,
  p95_ms INT
);

-- deploy_events (new)
CREATE TABLE deploy_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id),
  type VARCHAR(50), -- create, revalidate, domain_add
  triggered_by UUID REFERENCES cms_users(id),
  vercel_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Audit & Compliance

```sql
-- audit_log (new)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES cms_users(id),
  centre_id UUID REFERENCES centres(id),
  action VARCHAR(100) NOT NULL,
  object_type VARCHAR(50),
  object_id UUID,
  diff JSONB, -- before/after snapshot
  ip INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- utm_clicks (new)
CREATE TABLE utm_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES centres(id),
  source VARCHAR(100),
  medium VARCHAR(100),
  campaign VARCHAR(100),
  content VARCHAR(100),
  term VARCHAR(100),
  url TEXT,
  referrer TEXT,
  session_id VARCHAR(255),
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security (RLS) Policies

```sql
-- Example: pages table RLS
CREATE POLICY "super_admin_all_access" ON pages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid()
      AND m.role = 'super_admin'
    )
  );

CREATE POLICY "centre_members_read_own" ON pages
  FOR SELECT TO authenticated
  USING (
    centre_id IN (
      SELECT centre_id FROM memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "centre_admins_write_own" ON pages
  FOR INSERT TO authenticated
  WITH CHECK (
    centre_id IN (
      SELECT centre_id FROM memberships
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'centre_admin', 'editor')
    )
  );

-- Public can read published pages
CREATE POLICY "public_read_published" ON pages
  FOR SELECT TO public
  USING (published = true);
```

---

## 🎨 Template System Architecture

### Block-Based Composition

Each template is composed of **reusable, schema-driven blocks**:

#### Example Blocks

1. **Hero** - Full-width hero with title, subtitle, CTA, background image
2. **ProgramGrid** - NCF-aligned programs showcase with cards
3. **StaffCards** - Team/staff profiles with photos and bios
4. **FeesTable** - Pricing/fees comparison table
5. **Testimonials** - Parent/organization testimonials carousel
6. **ComplianceBadges** - NCF, POPIA, registration status badges
7. **ContactCTA** - Contact form with location map
8. **Calendar** - Events/activities calendar widget
9. **Gallery** - Photo gallery with lightbox
10. **RichText** - WYSIWYG text content block

#### Block Props Schema (Zod → JSON)

```typescript
// Example: Hero block
const heroSchema = z.object({
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  backgroundImage: z.string().url().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().url().optional(),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
});
```

### Theme Variants

**Base Palette:** Stone + Amber (current brand)

**Variants:**

1. **Clean** - Minimal, modern, high whitespace
2. **Playful** - Rounded corners, vibrant accents, illustrations
3. **Professional** - Traditional, serif typography, navy tones
4. **Community** - Warm, earthy, welcoming

Each variant provides:

- Color tokens (primary, secondary, accent, neutral scales)
- Typography scale (font families, sizes, weights)
- Spacing scale (margins, paddings)
- Border radius values
- Component overrides (button styles, card styles)

---

## 🔑 Key Features Deep Dive

### 1. One-Click Website Creation (Admin)

**User Flow:**

1. Admin navigates to `admin.edusitepro.co.za/centres/new`
2. Fills in form:
   - Centre name, slug (auto-suggested), address, contacts
   - Plan tier (Solo, 5-pack, 10-pack)
   - Template selection (preview thumbnails)
   - Variant selection (Clean, Playful, Professional, Community)
   - Domain mode: Default subdomain or custom domain
3. Clicks "Create Centre"
4. System:
   - Creates `centres` record
   - Seeds `pages` and `sections` from template
   - Applies variant theme tokens
   - Creates default `memberships` for invited admin
   - Adds `centre_domains` record
   - Triggers deploy hook
   - Sends invite email with portal link
5. Output: Live preview URL + portal credentials

**Technical Implementation:**

```typescript
// /app/api/admin/centres/create/route.ts
export async function POST(request: Request) {
  const adminToken = request.headers.get('x-admin-token');
  if (!isValidAdmin(adminToken)) return unauthorized();

  const { name, slug, templateKey, variantKey, planTier, contacts } = await request.json();

  // 1. Create centre
  const centre = await createCentre({ name, slug, planTier });

  // 2. Seed content from template
  await seedCentreContent(centre.id, templateKey, variantKey);

  // 3. Create invite
  const invite = await createInvite(centre.id, contacts.email, 'centre_admin');

  // 4. Add default domain
  const subdomain = `${slug}.sites.edusitepro.co.za`;
  await addDomain(centre.id, subdomain, true);

  // 5. Trigger revalidation
  await revalidateCentre(centre.id);

  // 6. Send email
  await sendInviteEmail(invite);

  return json({ success: true, centre, previewUrl: subdomain });
}
```

### 2. Multi-Tenant CMS (Client Portal)

**Authentication:**

- Supabase Auth (email/password + OTP)
- Google OAuth (optional)
- Invite-based onboarding

**Roles & Permissions:**

- `super_admin` - Full cross-tenant access
- `ops_admin` - Cross-tenant read + limited write
- `marketing_manager` - Cross-tenant service orders
- `centre_admin` - Full access to own centre
- `editor` - Content editing only
- `viewer` - Read-only access

**CMS Features:**

#### Pages Manager

- List all pages (home, about, programs, contact, etc.)
- Create new page (select page_type for SEO presets)
- Duplicate page
- Draft vs Published state
- Version history with rollback
- Bulk publish

#### Section Editor

- Visual drag-and-drop reordering
- Add block from catalog (modal with previews)
- Configure block props (schema-driven form)
- Live preview (iframe or side-by-side)
- Mobile/desktop preview toggle
- Visibility toggles (hide on mobile, hide for non-logged-in)

#### Media Library

- Supabase Storage buckets per centre
- Drag-and-drop upload
- Image optimization (WebP, responsive sizes)
- Alt text required (accessibility)
- Focal point selection
- Usage tracking (which pages use this asset)
- Bulk delete with warnings

#### Navigation Builder

- Header menu (logo, links, CTA)
- Footer menu (columns, social links)
- Drag-and-drop reordering
- Nested dropdowns
- Visibility rules

#### SEO Manager

- Per-page title, meta description
- Open Graph tags (auto-generated + editable)
- JSON-LD structured data presets
- Canonical URLs
- Robots directives
- Sitemap auto-generation

### 3. Marketing Services Marketplace

**Service Catalog:**

| Service        | Price (ZAR)    | SLA     | Deliverables                                   |
| -------------- | -------------- | ------- | ---------------------------------------------- |
| Social Starter | R999/mo        | 5 days  | 8 posts/mo, 2 platforms, UTM tracking          |
| Social Pro     | R1,999/mo      | 3 days  | 16 posts/mo, 4 platforms, monthly report       |
| Content Pack   | R1,499 one-off | 10 days | 5 blog posts, SEO optimization                 |
| SEO Audit      | R1,999 one-off | 7 days  | Technical audit, keyword research, action plan |
| Logo Design    | R2,499 one-off | 14 days | 3 concepts, 2 revisions, brand guide           |

**Order Flow:**

1. Client browses services in portal
2. Clicks "Request Service"
3. Fills in brief (goals, brand voice, channels, assets)
4. Submits order → status: `submitted`
5. Internal team reviews brief → assigns tasks
6. Team delivers proofs → client reviews in portal
7. Client approves/requests revisions
8. Final delivery + invoice generated

**Internal Task Board (Admin):**

- Kanban view: Submitted → In Progress → Review → Delivered
- SLA alerts (due in 1 day, overdue)
- File attachments (Supabase Storage)
- Approval workflows
- Time tracking (optional)

### 4. Billing & Subscriptions

**Payment Providers (South Africa):**

1. **Paystack** (preferred) - Recurring subscriptions + one-off setup fees
2. **Peach Payments** - ZAR-native, good for enterprises
3. **PayFast** - Fallback, widely used

**Pricing Tiers:**

- **Solo:** R2,999 setup + R199/mo
- **5-Pack:** R11,995 setup + R179/mo per centre (20% discount)
- **10-Pack:** R19,990 setup + R159/mo per centre (33% discount)

**Implementation:**

```typescript
// Webhook handler
export async function POST(request: Request) {
  const signature = request.headers.get('x-paystack-signature');
  const payload = await request.json();

  if (!verifySignature(signature, payload)) return badRequest();

  switch (payload.event) {
    case 'subscription.create':
      await activateSubscription(payload.data);
      break;
    case 'charge.success':
      if (payload.data.metadata?.setup_fee) {
        await markSetupFeePaid(payload.data.metadata.centre_id);
      }
      break;
    case 'subscription.disable':
      await suspendCentre(payload.data.subscription_code);
      break;
  }

  return json({ success: true });
}
```

**Portal Billing Page:**

- Current plan overview
- Usage metrics (centres, storage, bandwidth)
- Invoice history (download PDFs)
- Update payment method (redirect to provider)
- Cancel/downgrade request (ticketing system)

### 5. Analytics & Monitoring

**Data Sources:**

1. **PostHog** - Product analytics (user actions, funnels)
2. **Vercel Analytics** - Web vitals, traffic trends
3. **Supabase** - Database queries (usage patterns)
4. **Custom Uptime** - Synthetic checks every 5 minutes

**Aggregation Pipeline:**

```typescript
// Vercel Cron: runs nightly at 02:00 SAST
export async function GET(request: Request) {
  const yesterday = subDays(new Date(), 1);

  const centres = await getCentres({ status: 'active' });

  for (const centre of centres) {
    const posthogData = await fetchPostHogMetrics(centre.id, yesterday);
    const vercelData = await fetchVercelMetrics(centre.primary_domain, yesterday);

    await upsertAnalyticsSummary({
      centre_id: centre.id,
      period: yesterday,
      sessions: posthogData.sessions,
      pageviews: vercelData.pageviews,
      avg_cwv: vercelData.cwv,
      conversions: posthogData.conversions,
    });
  }

  return json({ success: true, processed: centres.length });
}
```

**Admin Dashboard Metrics:**

- Total centres, active subscriptions, MRR
- Lead conversion funnel (marketing → paid)
- Top performing centres (traffic, conversions)
- Service orders (submitted, in progress, completed)
- System health (uptime %, avg response time)
- Recent errors (Sentry)

**Client Portal Analytics:**

- Traffic trends (30 days, 90 days)
- Top pages (pageviews, avg time on page)
- Conversion events (contact form, phone clicks)
- Referrer sources
- Core Web Vitals trends

### 6. Vercel Automation

**Deploy Strategy:**

- Single Vercel project for all tenants
- Content changes trigger on-demand revalidation (no full rebuild)
- Schema/config changes trigger full deploy

**Domain Management:**

```typescript
// Add custom domain via Vercel API
export async function addCustomDomain(centreId: string, domain: string) {
  const vercelToken = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  const response = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  });

  const data = await response.json();

  if (data.verification) {
    // Store verification requirements in database
    await updateDomain(centreId, domain, {
      verification_status: 'pending',
      verification_method: data.verification[0].type, // CNAME or TXT
      verification_value: data.verification[0].value,
    });
  }

  return data;
}
```

**Wildcard Subdomain Setup:**

1. Configure DNS: `*.sites.edusitepro.co.za` CNAME → `cname.vercel-dns.com`
2. Add wildcard domain in Vercel project settings
3. Middleware resolves tenant from subdomain pattern

**On-Demand Revalidation:**

```typescript
// After publish
export async function publishPage(pageId: string) {
  const page = await getPage(pageId);

  // Update page state
  await updatePage(pageId, {
    published: true,
    version: page.version + 1,
    last_published_at: new Date(),
  });

  // Revalidate affected routes
  revalidateTag(`centre-${page.centre_id}`);
  revalidateTag(`page-${pageId}`);
  revalidatePath(`/${page.path}`);

  // Log deploy event
  await logDeployEvent({
    centre_id: page.centre_id,
    type: 'revalidate',
    triggered_by: page.updated_by,
  });
}
```

---

## 📅 Two-Week Implementation Schedule

### Week 1: Foundation & Core Platform

Progress (2025-10-26):
- Option 1 completed: API consolidation (pages, publish, centres) and UI wiring
- Validation and safeguards implemented in builder
- Verify passed (lint/typecheck/tests/build)

#### Day 1 (Mon): Architecture & Database

- ✅ Finalize architecture decisions
- ✅ Design tenancy resolver (middleware)
- ✅ Document security model (RLS policies)
- ✅ Create database migration plan
- ✅ Set up environments (dev, preview, prod)

#### Day 2 (Tue): Database & Templates

- ✅ Implement database migrations (all new tables + RLS)
- ✅ Seed template library (6 templates + blocks)
- ✅ Configure wildcard domain on Vercel
- ✅ Create template variant system

#### Day 3 (Wed): Site Renderer

- ✅ Implement SSR site renderer with tenant context
- ✅ Build block components (Hero, ProgramGrid, etc.)
- ✅ Apply theming system (design tokens)
- ✅ Create domain resolution middleware

#### Day 4 (Thu): One-Click Provisioning

- ✅ Build admin centre creation UI
- ✅ Implement centre seeding API
- ✅ Create invite flow (Supabase Auth)
- ✅ Test default subdomain deployment

#### Day 5 (Fri): Admin Dashboard

- ✅ Build centres table with filters
- ✅ Add actions (create, suspend, impersonate, revalidate)
- ✅ Implement deploy hooks API
- ✅ Set up Vercel cron scaffolding

### Week 2: Portal, Services & Launch

#### Day 6 (Mon): Portal Foundation

- ✅ Implement portal auth (login, invite flow)
- ✅ Build memberships system (roles, RLS)
- ✅ Create portal shell (nav, overview dashboard)
- ✅ Add analytics/billing/services tabs

#### Day 7 (Tue): CMS Editor

- ✅ Build pages manager (list, create, duplicate)
- ✅ Implement section editor (add/move/remove blocks)
- ✅ Create media library (Supabase Storage)
- ✅ Add navigation builder
- ✅ Implement publish with revalidateTag

#### Day 8 (Wed): Marketing Services

- ✅ Build service catalog in portal
- ✅ Create order submission flow
- ✅ Implement internal task board (admin)
- ✅ Add proof upload and approval workflow

#### Day 9 (Thu): Billing Integration

- ✅ Integrate Paystack/Peach Payments
- ✅ Create checkout flows (setup + subscription)
- ✅ Implement webhook handlers
- ✅ Build portal billing page (invoices, payment method)

#### Day 10 (Fri): Analytics & Monitoring

- ✅ Implement analytics aggregation (PostHog + Vercel)
- ✅ Set up uptime cron (every 5 mins)
- ✅ Integrate Sentry error tracking
- ✅ Build admin/portal dashboards

#### Day 11 (Sat): Compliance & SEO

- ✅ POPIA compliance (consent, policies, data handling)
- ✅ Per-centre sitemap and robots.txt
- ✅ Dynamic OG images (Vercel OG)
- ✅ Accessibility audit (WCAG 2.1 AA)

#### Day 12 (Sun): QA & Performance

- ✅ Provision 5 pilot centres with real content
- ✅ Lighthouse performance tuning (target: 90+)
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Mobile responsiveness check

#### Day 13 (Mon): UAT & Training

- ✅ User acceptance testing with team
- ✅ Record Loom training videos (portal, CMS, services)
- ✅ Fix critical blockers
- ✅ Prepare launch communications

#### Day 14 (Tue): Launch 🚀

- ✅ Enable marketing site CTAs
- ✅ Soft onboard first cohort (5 centres)
- ✅ Monitor errors, performance, conversions
- ✅ Celebrate! 🎉

---

## ✅ Acceptance Criteria

Each deliverable must meet these criteria before marking as complete:

### Admin Dashboard

- [ ] Create a centre in <3 minutes
- [ ] Shows live status (active/suspended)
- [ ] Displays last publish timestamp
- [ ] Shows uptime status
- [ ] Impersonation works (log in as centre admin)
- [ ] Revalidate button triggers ISR
- [ ] Domain add/edit functional

### Template System

- [ ] Choose base template (6 options)
- [ ] Select variant (4 options)
- [ ] Theme tokens applied correctly
- [ ] Add/remove/reorder blocks persists
- [ ] Preview renders accurately
- [ ] Mobile preview works

### Vercel Automation

- [ ] New centre live at subdomain in <2 minutes
- [ ] Custom domain verification guide auto-generated
- [ ] DNS instructions clear and accurate
- [ ] Wildcard subdomain resolves correctly
- [ ] On-demand revalidation works

### Client CMS

- [ ] Create/edit/publish a page
- [ ] Media upload with alt text enforced
- [ ] Version rollback functional
- [ ] Revalidation triggers on publish
- [ ] Navigation builder persists changes
- [ ] SEO fields populate meta tags

### Monitoring & Analytics

- [ ] Admin sees sessions, top pages, uptime
- [ ] Portal shows simplified snapshot
- [ ] Uptime checks run every 5 mins
- [ ] Analytics summary updates nightly
- [ ] Core Web Vitals tracked

### Marketing Services

- [ ] Client can browse catalog
- [ ] Order submission creates tasks
- [ ] Team can assign and deliver proofs
- [ ] Approval workflow functional
- [ ] Invoices generated on completion

### Portal

- [ ] Login with email/password works
- [ ] Invite flow sends email
- [ ] Role-based access enforced
- [ ] Can access CMS/analytics/services/billing
- [ ] Update plan/payment method

### Pricing & Subscriptions

- [ ] Checkout flow completes successfully
- [ ] Setup fee recorded
- [ ] Monthly subscription active
- [ ] Invoice visible in portal
- [ ] Webhook handlers tested (sandbox)

---

## 🌟 Out-of-This-World Enhancements (Post-Launch)

### Phase 2 (Within 30 Days)

1. **EduCopilot (AI Assistant)**
   - Generates NCF-aligned page copy per template
   - Suggests program descriptions based on age group
   - Creates weekly activity highlights
   - Writes SEO-optimized meta descriptions
   - Tech: OpenAI GPT-4 + custom prompts

2. **Smart Brandizer**
   - Upload centre logo → auto-extract color palette
   - AI suggests complementary colors
   - Instant theme preview across all templates
   - One-click apply
   - Tech: Color Thief + ML palette generation

3. **Dynamic OG Image Generator**
   - Branded social share images per page
   - Centre logo + custom text + theme colors
   - Auto-generated on publish
   - Tech: Vercel OG + Satori

4. **Lead Routing Rules**
   - Auto-assign inbound leads to service tasks
   - SLA alerts (response within 24 hours)
   - Email/Slack notifications
   - Escalation workflows

### Phase 3 (Within 90 Days)

5. **Lighthouse CI Gate**
   - Prevent performance regressions
   - PRs must keep LCP < 2.5s, INP < 200ms
   - Block deployment if scores drop >10 points
   - Tech: Lighthouse CI + GitHub Actions

6. **QR Code Generator**
   - Auto-generate printable QR posters
   - Link to contact/enrol pages
   - UTM tracking for offline attribution
   - Download as PDF/PNG

7. **Compliance Badges**
   - Surface compliance status on sites
   - "NCF Aligned", "POPIA Compliant", "Registered with DSD"
   - Build trust with parents/organizations
   - Pull from existing compliance_documents table

8. **Social Media Scheduler**
   - Buffer API integration
   - Schedule posts from approved assets
   - Meta Graph API for insights
   - Auto-inject UTMs

9. **Multi-Language Support**
   - Content translation (EN, AF, ZU, XH)
   - Language switcher in templates
   - Locale-specific sitemap
   - Tech: i18next + translation management system

10. **Advanced Analytics**
    - Conversion funnels
    - A/B testing framework
    - Heat maps (Clarity integration)
    - Session recordings (PostHog)

---

## 🎯 Business Logic Refinements

### Positioning (Speak to ECD Organizations, Not Parents)

**Before:** "Professional websites for ECD centres"  
**After:** "Programs and services engine for ECD organizations"

**Key Messages:**

- "Save 10 hours/week on admin and marketing"
- "Stay NCF-aligned, POPIA-compliant automatically"
- "Grow enrolments with proven digital strategies"
- "From lead to enrolled child in 3 clicks"

### Offers & Guarantees

1. **Setup Week Guarantee**
   - Live website in 72 hours with NCF-aligned content baseline
   - Money-back if not satisfied

2. **Growth Bundle** (First 90 Days)
   - Website + Social Starter + SEO Quick Wins
   - Bundled discount: R4,997 (save R1,500)

3. **Bulk Provisioning Wizard**
   - Upload CSV with 5/10 centres
   - Shared branding but localized details (address, contacts)
   - All live within 24 hours

### Proof of Value

1. **KPI Snapshots vs Cohort Benchmarks**
   - "Your website loads 2x faster than similar centres"
   - "Your contact form conversion is in the top 10%"

2. **Monthly "Website Health" Email**
   - Uptime, performance, traffic trends
   - Actionable recommendations (e.g., "Add testimonials to boost trust")

### Expansion Lanes

1. **ECD Directory** (B2B Showcase)
   - Public directory of all EduSitePro centres
   - Filter by province, NCF programs
   - Regional badges (e.g., "Top 5 in Gauteng")
   - Drives authority and backlinks (SEO)

2. **Case Studies Library**
   - Success stories from pilot centres
   - Before/after screenshots
   - Quotes from principals
   - Downloadable PDFs for sales

3. **Partner Integrations**
   - Payment gateways (PayFast, SnapScan)
   - Calendar integrations (Google Calendar, iCal)
   - Parent communication (WhatsApp Business API)

---

## ⚠️ Risk Register & Mitigations

| Risk                          | Impact   | Probability | Mitigation                                                 |
| ----------------------------- | -------- | ----------- | ---------------------------------------------------------- |
| **Scope Creep**               | High     | High        | MLP locked; defer social scheduler to Phase 2              |
| **Custom Domains Delays**     | Medium   | Medium      | Default subdomain immediately; clear DNS guide             |
| **Payment Provider Friction** | High     | Low         | Test in sandbox early; manual invoicing fallback           |
| **RLS Policy Mistakes**       | Critical | Low         | Thorough policy tests; restrict service role; code reviews |
| **Performance Issues**        | Medium   | Medium      | Enforce image optimization; lazy loading; size limits      |
| **Vercel Rate Limits**        | Medium   | Low         | Cache aggressively; batch revalidation calls               |
| **Data Migration Errors**     | High     | Low         | Backup before migrations; test on staging first            |
| **Auth/Security Breach**      | Critical | Very Low    | Regular security audits; rotate keys; MFA for admins       |

---

## 🚀 Go-Live Plan

### Pre-Launch Checklist

- [ ] All migrations applied to production database
- [ ] Vercel environment variables configured
- [ ] Wildcard domain configured and tested
- [ ] Payment provider webhooks set up
- [ ] Sentry error tracking active
- [ ] PostHog analytics configured
- [ ] Email templates tested (Resend)
- [ ] 5 pilot centres provisioned
- [ ] Admin/portal training completed
- [ ] Legal pages updated (Privacy, Terms)
- [ ] POPIA compliance audit passed
- [ ] Performance targets met (Lighthouse 90+)
- [ ] Cross-browser testing complete

### Launch Day Sequence

1. **09:00 SAST** - Enable marketing site CTAs
2. **09:30 SAST** - Send launch email to pilot centres
3. **10:00 SAST** - Monitor Sentry for errors
4. **11:00 SAST** - Check uptime dashboard
5. **14:00 SAST** - Review analytics (traffic, conversions)
6. **17:00 SAST** - End-of-day retrospective

### Post-Launch Monitoring (First 7 Days)

- **Daily:** Check error rates, uptime, core web vitals
- **Daily:** Review support tickets (expected: onboarding questions)
- **Daily:** Monitor payment webhooks (failed transactions)
- **Day 3:** Performance review (optimize bottlenecks)
- **Day 7:** User feedback survey (NPS, feature requests)

### Rollback Plan

- **Feature Flags:** Disable new blocks if causing issues
- **Version Rollback:** Revert to previous publish version
- **Database Rollback:** Restore from hourly backups (< 1 hour data loss)
- **Vercel Rollback:** Previous deployment (< 5 mins downtime)

---

## 📦 Implementation Checklist

### Packages & Dependencies

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.0",
    "zod": "^4.1.12",
    "react-hook-form": "^7.65.0",
    "@hookform/resolvers": "^5.2.2",
    "next-seo": "^6.8.0",
    "@sentry/nextjs": "^8.0.0",
    "posthog-js": "^1.275.1",
    "posthog-node": "^4.0.0",
    "tailwindcss": "^4",
    "class-variance-authority": "^0.7.1",
    "tailwind-merge": "^3.3.1",
    "lucide-react": "^0.545.0",
    "date-fns": "^3.0.0",
    "framer-motion": "^12.23.24"
  }
}
```

### External Services Setup

1. **Supabase**
   - [ ] Create project (Cape Town region)
   - [ ] Run migrations
   - [ ] Configure RLS policies
   - [ ] Set up Storage buckets
   - [ ] Enable Auth providers

2. **Vercel**
   - [ ] Deploy project (cpt1 region)
   - [ ] Configure environment variables
   - [ ] Add wildcard domain
   - [ ] Set up cron jobs
   - [ ] Enable Analytics

3. **Paystack/Peach Payments**
   - [ ] Create account
   - [ ] Generate API keys (test + live)
   - [ ] Configure webhooks
   - [ ] Test transactions

4. **Resend/Mailgun**
   - [ ] Verify domain
   - [ ] Configure SPF/DKIM
   - [ ] Create email templates
   - [ ] Test delivery

5. **PostHog**
   - [ ] Create project
   - [ ] Configure API keys
   - [ ] Set up dashboards
   - [ ] Enable session recordings

6. **Sentry**
   - [ ] Create project
   - [ ] Configure error tracking
   - [ ] Set up alerts
   - [ ] Test error reporting

---

## 📞 Support & Operations

### Runbook (Incident Response)

#### Scenario: Site Down (Uptime Check Failed)

1. **Check Vercel Status:** https://vercel-status.com
2. **Check Supabase Status:** https://status.supabase.com
3. **Verify DNS:** `dig centre-slug.sites.edusitepro.co.za`
4. **Check Logs:** Vercel logs + Sentry errors
5. **Rollback:** If recent deploy, revert to previous
6. **Communicate:** Update status page, notify affected centres

#### Scenario: Payment Webhook Failed

1. **Check Webhook Logs:** Paystack/Peach dashboard
2. **Verify Signature:** Ensure secret key matches
3. **Manual Retry:** Re-send webhook from provider dashboard
4. **Fallback:** Manually update subscription status in database
5. **Alert:** Notify finance team

#### Scenario: RLS Policy Breach (User Sees Wrong Data)

1. **Immediate:** Suspend affected user account
2. **Investigate:** Check audit_log for actions
3. **Fix:** Review and correct RLS policy
4. **Test:** Verify policy with multiple test users
5. **Deploy:** Apply fix to production
6. **Notify:** Inform affected centres (if data exposed)

### Training Materials

1. **Admin Training** (30 mins)
   - Creating centres
   - Managing users
   - Monitoring dashboard
   - Service order fulfillment

2. **Portal Training** (45 mins)
   - Logging in
   - Editing pages
   - Uploading media
   - Requesting services
   - Viewing analytics

3. **CMS Tutorial** (60 mins)
   - Page structure
   - Adding sections
   - Configuring blocks
   - Publishing workflow
   - SEO best practices

---

## 🎉 Success Definition

**Launch is successful if:**

1. ✅ 5 pilot centres live and functional
2. ✅ Zero critical bugs in first 48 hours
3. ✅ Uptime > 99.5% in first week
4. ✅ Core Web Vitals meet targets (LCP < 2.5s)
5. ✅ At least 1 service order submitted and completed
6. ✅ At least 1 payment successfully processed
7. ✅ Admin dashboard shows accurate real-time data
8. ✅ Client portal CMS edits revalidate correctly
9. ✅ NPS > 8 from pilot centres
10. ✅ Zero data breaches or RLS violations

**Business targets (30 days post-launch):**

- 20+ active centres
- R100,000+ MRR
- 10+ service orders/month
- 5+ EduDash Pro conversions
- SEO: 50+ indexed pages per centre
- Performance: Lighthouse 90+ on all centres

---

## 📚 References & Resources

### Documentation

- [Supabase Multi-Tenancy Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Domains API](https://vercel.com/docs/rest-api/endpoints/domains)
- [Paystack Webhooks](https://paystack.com/docs/payments/webhooks/)
- [POPIA Compliance Checklist](https://www.michalsons.com/focus-areas/privacy-and-data-protection/popia)

### Tools

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Playwright](https://playwright.dev/) (E2E testing)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Design

- [Tailwind UI](https://tailwindui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Last Updated:** 2025-10-25  
**Next Review:** 2025-11-01 (post-launch retrospective)  
**Owner:** King (Product Lead)  
**Contributors:** EduSitePro Team

---

## 🔐 User Management & RBAC Implementation Roadmap

### Phase 1: Authentication Foundation (Week 1)

**Priority:** Immediate  
**Timeline:** 5 working days

#### Day 1: Complete Auth Library

- [ ] Complete `src/lib/auth.ts` with session helpers
  - `getSession()` - Read session from cookies
  - `requireAuth()` - Protect routes, redirect if unauthorized
  - `requireRole()` - Check user has required role
- [ ] Test session creation and validation
- [ ] Test cookie handling and expiration

#### Day 2: Protect Admin Routes

- [ ] Update `src/middleware.ts` to check authentication for `/admin/*`
- [ ] Redirect to `/login` if not authenticated
- [ ] Allow public access to marketing and centre sites
- [ ] Test route protection with authenticated/unauthenticated users

#### Day 3: Test Login/Logout Flow

- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test logout and session clearing
- [ ] Test redirect after login
- [ ] Verify session persistence across page loads

#### Day 4: Create First Super Admin

- [ ] Create SQL script to add first super admin user
- [ ] Run script via Supabase SQL Editor
- [ ] Test super admin login
- [ ] Verify super admin can access all admin routes

#### Day 5: Week 1 Review & Documentation

- [ ] Document authentication flow
- [ ] Create troubleshooting guide
- [ ] Review security considerations
- [ ] Plan Week 2 tasks

### Phase 2: RBAC Foundation (Week 2)

**Priority:** High  
**Timeline:** 5 working days

#### Day 6: Create Permissions System

- [ ] Create `src/lib/permissions.ts` with helper functions
  - `getUserPermissions(userId)` - Fetch user's memberships and roles
  - `canAccessOrganization(permissions, orgId)` - Check org access
  - `canAccessCentre(permissions, centreId)` - Check centre access
  - `getHighestRole(memberships)` - Determine user's highest role
- [ ] Test permission checks for all roles

#### Day 7: Add Permission Checks to Server Actions

- [ ] Audit all existing server actions
- [ ] Add permission checks to organization actions
- [ ] Add permission checks to centre actions
- [ ] Add permission checks to page/content actions
- [ ] Test unauthorized access attempts

#### Day 8-9: User Management UI

- [ ] Create `src/app/admin/users/page.tsx` (list all users)
- [ ] Create `src/app/admin/users/new/page.tsx` (create user)
- [ ] Create `src/app/admin/users/[id]/page.tsx` (edit user, manage memberships)
- [ ] Add user list to admin sidebar navigation
- [ ] Test user creation and editing

#### Day 10: Invitation Email System

- [ ] Create invitation token generation
- [ ] Create invitation email template
- [ ] Implement email sending via Resend
- [ ] Create invitation acceptance page
- [ ] Test complete invitation flow

### Phase 3: Multi-Tenant Portal (Week 3)

**Priority:** Medium  
**Timeline:** 5 working days

#### Day 11: Portal Subdomain Routing

- [ ] Update middleware to handle `portal.edusitepro.co.za`
- [ ] Add authentication check for portal routes
- [ ] Inject user permissions into request headers
- [ ] Test portal routing and authentication

#### Day 12: Customer Dashboard

- [ ] Create `src/app/(portal)/dashboard/page.tsx`
- [ ] Show user's accessible centres/organizations
- [ ] Display key metrics per centre
- [ ] Add quick actions (edit pages, upload media)

#### Day 13: Centre-Specific Portal Pages

- [ ] Create `src/app/(portal)/centres/page.tsx` (list centres)
- [ ] Create `src/app/(portal)/centres/[id]/pages/page.tsx` (manage pages)
- [ ] Create `src/app/(portal)/centres/[id]/media/page.tsx` (manage media)
- [ ] Create `src/app/(portal)/centres/[id]/settings/page.tsx` (centre settings)

#### Day 14: Portal Navigation & Shell

- [ ] Create portal layout with navigation
- [ ] Add user profile dropdown
- [ ] Add breadcrumbs for navigation
- [ ] Test navigation between portal sections

#### Day 15: Portal Testing

- [ ] Test as Organization Admin (multiple centres)
- [ ] Test as Centre Admin (single centre)
- [ ] Test as Editor (content only)
- [ ] Test as Viewer (read-only)
- [ ] Fix any permission issues

### Phase 4: Polish & Testing (Week 4)

**Priority:** High  
**Timeline:** 5 working days

#### Day 16: Security Audit

- [ ] Audit all routes for permission checks
- [ ] Verify RLS policies enforce database-level isolation
- [ ] Ensure service role key never exposed to client
- [ ] Test for privilege escalation vulnerabilities
- [ ] Test for data leakage between tenants

#### Day 17: Role-Based UI Rendering

- [ ] Hide admin features from non-admin users
- [ ] Hide organization features from centre admins
- [ ] Show appropriate actions based on role
- [ ] Test UI with different roles

#### Day 18: Audit Logging

- [ ] Create audit log entries for sensitive actions
  - User creation/deletion
  - Role changes
  - Organization/centre changes
  - Content publishing
- [ ] Create audit log viewer in admin UI
- [ ] Test audit log capture

#### Day 19: Load Testing

- [ ] Test with multiple concurrent users
- [ ] Test with multiple organizations
- [ ] Test with large datasets
- [ ] Optimize slow queries
- [ ] Monitor database connection pool

#### Day 20: Documentation & Training

- [ ] Document user management workflows
- [ ] Document role-based permissions
- [ ] Create user training materials
- [ ] Record video tutorials
- [ ] Update ADMIN_GUIDE.md

### Security Checklist

Before going live with auth:

- [ ] All admin routes protected in middleware
- [ ] All server actions check permissions
- [ ] Service role key NEVER exposed to client
- [ ] RLS policies enforce database-level isolation
- [ ] Password reset flow tested
- [ ] Email verification enabled (optional but recommended)
- [ ] Rate limiting on auth endpoints
- [ ] Session timeout configured (e.g., 7 days)
- [ ] HTTPS enforced in production
- [ ] Audit logging for admin actions
- [ ] MFA for super admin accounts (optional)
- [ ] Regular security audits scheduled
- [ ] Key rotation policy established

### Roles & Permissions Matrix

| Role                   | Access Scope                | Can View      | Can Edit        | Can Delete      | Can Manage Users |
| ---------------------- | --------------------------- | ------------- | --------------- | --------------- | ---------------- |
| **Super Admin**        | All organizations & centres | ✅ All        | ✅ All          | ✅ All          | ✅ All           |
| **Organization Admin** | Own organization & centres  | ✅ Own org    | ✅ Own org      | ✅ Centres only | ✅ Own org       |
| **Centre Admin**       | Assigned centre(s)          | ✅ Own centre | ✅ Own centre   | ❌              | ✅ Own centre    |
| **Editor**             | Assigned centre(s)          | ✅ Own centre | ✅ Content only | ❌              | ❌               |
| **Viewer**             | Assigned centre(s)          | ✅ Own centre | ❌              | ❌              | ❌               |

### Implementation Notes

**Database Schema** (already exists):

- `cms_users` table for user authentication
- `memberships` table for role assignments
- `organizations` table for multi-centre groups
- `centres` table for individual centres

**Auth Provider**: Supabase Auth (already integrated)

- Email/password authentication
- Magic link support (optional)
- OAuth providers (Google, Microsoft - optional)
- Built-in session management
- Seamless RLS integration

**Session Management**:

- Server-side session storage (Supabase)
- Cookie-based session tokens
- 7-day session expiration
- Automatic session refresh
- Secure, HttpOnly cookies

**Permission Checks**:

- Middleware-level route protection
- Server action permission checks
- Database-level RLS policies
- UI-level role-based rendering

### Testing Strategy

#### Unit Tests

- [ ] Test permission helper functions
- [ ] Test session creation/validation
- [ ] Test role checks

#### Integration Tests

- [ ] Test complete auth flow (login → access → logout)
- [ ] Test permission enforcement across roles
- [ ] Test RLS policies with different users

#### E2E Tests

- [ ] Test user creation and invitation flow
- [ ] Test multi-tenant data isolation
- [ ] Test role-based UI rendering
- [ ] Test concurrent user sessions

### Success Criteria

**Phase 1 Complete When:**

- [ ] Super admin can login and access admin UI
- [ ] Unauthenticated users redirected to login
- [ ] Session persists across page loads
- [ ] Logout clears session correctly

**Phase 2 Complete When:**

- [ ] All server actions check permissions
- [ ] Users can be created and assigned roles
- [ ] Invitation emails sent successfully
- [ ] New users can accept invites and login

**Phase 3 Complete When:**

- [ ] Portal accessible at `portal.edusitepro.co.za`
- [ ] Users see only their assigned centres
- [ ] Centre admins can manage their centre
- [ ] Editors can edit content only
- [ ] Viewers have read-only access

**Phase 4 Complete When:**

- [ ] Security audit passed
- [ ] Load testing passed
- [ ] Audit logging working
- [ ] Documentation complete
- [ ] Training materials ready

### Future Enhancements (Post Phase 4)

**Advanced Features:**

- [ ] Two-factor authentication (2FA)
- [ ] SSO integration (SAML, OAuth)
- [ ] Advanced audit log filtering
- [ ] User activity analytics
- [ ] Session management dashboard
- [ ] IP whitelisting for admin
- [ ] Automated security scanning
- [ ] Compliance reporting (POPIA)

---

🚀 **Let's build something extraordinary!**
