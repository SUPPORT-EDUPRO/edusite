# EduSitePro - Phase 1 Implementation Summary
## Options 1-4: Complete Roadmap & Progress Tracker

**Document Version:** 1.0  
**Date:** 2025-01-26  
**Status:** Ready for Implementation  
**Estimated Timeline:** 8-12 working days

---

## 🎯 Executive Summary

This document provides a comprehensive implementation plan for transforming EduSitePro from a prototype into a production-ready SaaS platform with:

1. **Functional Page Builder** with database persistence and real-time autosave
2. **Secure Authentication & RBAC** with role-based access control
3. **Centre Management Dashboard** with one-click provisioning
4. **Platform Settings** for email, analytics, and security configuration

**Current State:** Day 4 Complete - Admin dashboard and page builder UI built, but not connected to database

**Target State:** Full-stack platform with secure auth, multi-tenant centre management, and production-ready admin tools

---

## ✅ Completed Work (Day 0-4)

### Day 1-2: Foundation
- ✅ Multi-tenant architecture with RLS-based tenant resolution
- ✅ 10 block components (Hero, RichText, ContactCTA, ProgramGrid, StaffCards, Testimonials, Gallery, Stats, Features, FeesTable)
- ✅ Database migrations (centres, pages, page_blocks, themes, navigation, storage)
- ✅ Security hardening (removed service role from middleware)

### Day 3: Admin Dashboard
- ✅ Professional admin layout with sidebar navigation
- ✅ Dashboard home page with stats and quick actions
- ✅ Responsive layout with header and content areas

### Day 4: Page Builder UI
- ✅ Page builder interface with 3-panel layout
- ✅ Block selector component with search/filtering
- ✅ Block add/remove/reorder functionality (client-side only)
- ✅ Block props editor with 6 form field types
- ✅ Properties panel structure with real-time updates

### Day 0 (Just Completed):
- ✅ Environment verified (`npm run verify` passed)
- ✅ Lint warnings fixed (0 errors, 0 warnings)
- ✅ Created API foundation:
  - `src/lib/api/auth-guard.ts` - Token-based auth guard
  - `src/lib/api/validators/pageSchemas.ts` - Zod schemas for validation

---

## 🚀 Option 1: Page Builder Database Integration

**Goal:** Connect the page builder UI to the database with full CRUD operations, block validation, and publish workflow.

**Estimated Time:** 2-3 days

### 1.1 API Routes (Day 5)

**Files to Create:**

```
src/app/api/
├── centres/route.ts              # GET centres list
├── pages/route.ts                # GET list, POST create
├── pages/[id]/route.ts           # GET, PUT, DELETE single page
├── pages/[id]/publish/route.ts   # PUT publish/unpublish
└── pages/[id]/blocks/[blockId]/route.ts  # DELETE single block (optional)
```

**API Endpoints:**

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| GET | `/api/centres` | List all active centres | 200, 401, 500 |
| GET | `/api/pages?centre_id=xxx` | List pages for centre | 200, 400, 401, 500 |
| POST | `/api/pages` | Create new page | 201, 400, 401, 409, 500 |
| GET | `/api/pages/[id]` | Get page with blocks | 200, 401, 404, 500 |
| PUT | `/api/pages/[id]` | Update page + blocks | 200, 400, 401, 500 |
| DELETE | `/api/pages/[id]` | Delete page | 204, 401, 500 |
| PUT | `/api/pages/[id]/publish` | Publish/unpublish | 200, 400, 401, 500 |

**Authentication:** Temporary `INTERNAL_ADMIN_TOKEN` (Bearer token in Authorization header)

**Validation:**
- All requests validated with Zod schemas
- Block props validated against BLOCKS registry before save
- centre_id required on all queries (multi-tenant isolation)
- Slug uniqueness enforced per centre

**Key Features:**
- Pseudo-atomic save: Update page → delete blocks → bulk insert with normalized order
- Block validation aggregates errors before save
- Revalidate Next.js cache on publish
- Request logging with unique request IDs

### 1.2 UI Components (Day 6)

**Files to Create:**

```
src/components/admin/
├── CentreSelector.tsx     # Dropdown of centres with localStorage persistence
├── SaveStatus.tsx         # Small indicator (Saving.../Saved/Unsaved changes)
└── PageSelector.tsx       # Enhanced with search, Draft/Published badges
```

**Files to Modify:**

```
src/app/admin/builder/page.tsx  # Wire up API calls, auto-save, publish
```

**UI/UX Features:**

**Centre Selector:**
- Dropdown with search
- Persist last selected centre in localStorage
- Auto-fetch pages on change
- Loading states

**Page Selector:**
- List all pages for selected centre
- Search by title/slug
- Draft/Published status badges
- "New Page" button → prompts for title/slug → calls POST /api/pages
- Click page → loads in builder
- Delete icon with confirmation

**Builder Page:**
- `loadPage(pageId)`: GET /api/pages/[id] and populate state
- `savePage()`: PUT /api/pages/[id] with { title, slug, blocks }
- **Auto-save:** Debounce 2s after last change; show SaveStatus indicator
- **Publish toggle:** PUT /api/pages/[id]/publish with confirmation modal
- **Delete page:** Confirmation → DELETE /api/pages/[id] → navigate back
- Persist `lastEditedPageId` in localStorage for session continuity

**Accessibility:**
- Keyboard shortcuts (Ctrl+S to save)
- Announce save state via `aria-live="polite"`
- Focus management on modal open/close

### 1.3 Validation & Error Handling (Day 6-7)

**Block Validation:**
- Validate all blocks before save using `validateBlockProps(blockKey, props)`
- Aggregate errors: `{ blockErrors: { 0: "Title required", 2: "Invalid URL" } }`
- Show inline errors in properties panel
- Sticky error summary at top with jump links

**UX Patterns:**
- Optimistic UI for add/remove/reorder
- Rollback on API failure with toast notification
- Disable publish if validation fails
- Show validation errors immediately in form fields

**Performance:**
- Tag responses with cache keys: `centre:{centreId}:pages`
- Strip `undefined` from block props before save
- Lazy load heavy modals (publish confirmation, delete confirmation)

### 1.4 QA & Documentation (Day 7)

**Testing:**
- Unit tests for 10 block schemas with fixtures
- API smoke tests (REST client): 200/400/409/404 flows
- Manual flows:
  - Create page → add 3 blocks → autosave → reload → state restored
  - Publish → view on centre site → cache revalidated
  - Delete block/page with confirmations

**Commands:**
```bash
npm run verify              # Must pass
npm run test                # Unit tests
vercel --prod               # Deploy to preview
```

**Documentation Updates:**
- Update `SYSTEM_DOCUMENTATION.md` (Page Builder data flow section)
- Update `TRANSFORMATION-PLAN.md` (Day 5-7 progress)
- Create API reference in `docs/API_REFERENCE.md`

---

## 🔐 Option 2: Authentication & RBAC

**Goal:** Secure the platform with Supabase Auth, implement role-based access control, and protect all admin routes.

**Estimated Time:** 3-4 days

### 2.1 Auth Library & Middleware (Day 8)

**Files to Create/Modify:**

```
src/lib/
├── auth.ts               # Already exists - enhance with requireRole()
├── permissions.ts        # New - RBAC helpers
└── middleware.ts         # Modify - protect /admin/*, inject user context
```

**Middleware Rules:**
- If path starts with `/admin` and no session → redirect to `/login`
- Inject user ID into request headers (`x-user-id`) for API routes
- **Important:** Do NOT use service role in middleware; use anon client only
- Allow marketing and centre sites without auth

**Permission Functions:**

```typescript
// src/lib/permissions.ts
export async function canAccessCentre(userId: string, centreId: string): Promise<boolean>
export async function canEditContent(userId: string, centreId: string): Promise<boolean>
export async function canManageUsers(userId: string): Promise<boolean>
export function hasRole(memberships: Membership[], role: Role): boolean
```

**RLS Alignment:**
- Verify policies exist for `pages`, `page_blocks`, `centres` tied to `memberships`
- Ensure every API query filters by `centre_id` (already done in Option 1)

### 2.2 Login UI & Session Management (Day 9)

**Files to Create:**

```
src/app/
├── login/page.tsx                        # Login page
├── components/auth/LoginForm.tsx         # Email/password form with RHF + Zod
└── api/auth/
    ├── login/route.ts                    # POST wrapper for signInWithPassword
    ├── logout/route.ts                   # Already exists - verify
    └── me/route.ts                       # GET user + memberships
```

**Login Flow:**
1. User visits `/admin` without session → redirect to `/login`
2. Enter email/password → POST `/api/auth/login`
3. Server calls `supabase.auth.signInWithPassword()`
4. On success: set session cookie → redirect to `/admin`
5. On error: show inline errors (invalid credentials, rate limit)

**Admin Layout Enhancement:**

```
src/components/admin/AdminLayout.tsx
```

- Show user profile in header (avatar, name, role badge)
- Logout button → POST `/api/auth/logout` → clear session → redirect to `/login`

### 2.3 Create First Super Admin (Day 9)

**Approach 1: Automated Script (Preferred)**

```
scripts/seed-first-admin.ts
```

**Script Logic:**
```typescript
// Use SUPABASE_SERVICE_ROLE_KEY
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@edusitepro.co.za',
  password: generateSecurePassword(),
  email_confirm: true,
});

// Insert into cms_users
await supabase.from('cms_users').insert({ id: data.user.id, email, name: 'Super Admin' });

// Insert into memberships (platform-level super_admin)
await supabase.from('memberships').insert({
  user_id: data.user.id,
  centre_id: null,  // Platform admin, not tied to a centre
  role: 'super_admin',
});
```

**Run Command:**
```bash
npm run seed:first-admin
# Or: ts-node scripts/seed-first-admin.ts
```

**Approach 2: Manual (Fallback)**
1. Supabase Dashboard → Auth → Create user manually
2. Run SQL:
```sql
INSERT INTO cms_users (id, email, name) VALUES ('USER_UUID', 'admin@example.com', 'Admin');
INSERT INTO memberships (user_id, role) VALUES ('USER_UUID', 'super_admin');
```

**Security:**
- Store credentials in password manager
- Force password reset on first login
- Rotate credentials after setup

### 2.4 Secure All API Routes (Day 10)

**Scope:** Update `/api/pages/*`, `/api/admin/*`, `/api/centres`

**Changes Per Route:**
```typescript
// Before (Option 1)
const authError = requireAdminToken(request);

// After (Option 2)
const user = await requireAuth();
const memberships = await getUserMemberships(user.id);

// For centre-specific operations
if (!canAccessCentre(memberships, centreId)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// For content editing
if (!canEditContent(memberships, centreId)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Remove Token Auth:**
- Keep `INTERNAL_ADMIN_TOKEN` as feature flag for local dev only
- Production: Always use Supabase Auth

**Acceptance Criteria:**
- Unauthenticated user → 401
- Insufficient role → 403
- Super admin can access everything
- Centre admin can only access assigned centres
- Editor can edit content, not settings
- Admin UI hides actions user cannot perform

---

## 🏢 Option 4: Centre Management Dashboard

**Goal:** Build comprehensive centre management with one-click provisioning, domain management, and bulk import.

**Estimated Time:** 4-5 days

### 4.1 Centres List Enhancements (Day 11)

**Files to Modify:**

```
src/app/admin/centres/page.tsx
src/app/api/admin/centres/route.ts
```

**Features:**
- **Filters:** status (active/suspended), plan_tier, organization_id
- **Search:** name/slug (case-insensitive ILIKE)
- **Sort:** created_at desc (default), name asc, status
- **Pagination:** limit=10, page param, total count display
- **Quick Stats:** Total centres, Active, Suspended (single aggregated query)

**RBAC:**
- `super_admin` sees all centres
- `centre_admin` sees only assigned centres
- Filter query based on role

**UX:**
- URL-driven filters: `?status=active&plan_tier=solo&page=2`
- Shareable query strings
- "Clear filters" button
- Export to CSV button (optional)

### 4.2 Centre Creation Wizard (Day 12)

**Files to Create:**

```
src/app/admin/centres/new/page.tsx         # Multi-step wizard
src/components/admin/forms/CentreWizard/
├── Step1BasicInfo.tsx                      # Name, slug validation
├── Step2Organization.tsx                   # Select/create org
├── Step3PlanTier.tsx                       # Solo/Group5/Group10/Enterprise
├── Step4Domain.tsx                         # Subdomain preview
├── Step5Template.tsx                       # 6 NCF templates
└── Step6Confirmation.tsx                   # Review & submit
src/app/api/admin/centres/check-slug/route.ts  # Live slug availability
```

**Wizard Steps:**

1. **Basic Info**
   - Centre name (required, 1-100 chars)
   - Slug (auto-suggest from name, validate uniqueness live)
   - Contact email, phone (optional)

2. **Organization**
   - Select existing organization OR
   - "Create new organization" (inline form)
   - For solo plans: auto-create single-centre org

3. **Plan Tier**
   - Radio buttons: Solo (R199/mo), Group 5 (R799/mo), Group 10 (R1,499/mo), Enterprise (custom)
   - Show pricing, features comparison

4. **Domain**
   - Show default subdomain: `{slug}.sites.edusitepro.co.za`
   - Option to add custom domain later
   - DNS preview (informational)

5. **Template**
   - Visual selector with 6 NCF templates
   - Preview thumbnail, description, NCF alignment tags
   - "Start blank" option

6. **Confirmation**
   - Review all selections
   - Submit → calls `/api/admin/centres/provision`

**Validation:**
- Zod schema per step
- Cannot proceed to next step until valid
- Show inline errors immediately

### 4.3 One-Click Provisioning API (Day 12-13)

**Files to Create:**

```
src/app/api/admin/centres/provision/route.ts
src/lib/provisioning.ts
src/components/admin/TemplateSelector.tsx
```

**Endpoint:** `POST /api/admin/centres/provision`

**Request Body:**
```typescript
{
  name: string;
  slug: string;
  template_key: string;  // 'welcome-play', 'outdoor-adventure', etc.
  organization_id: string;
  plan_tier: 'solo' | 'group_5' | 'group_10' | 'enterprise';
  admin_email?: string;  // Optional: send welcome email
  custom_domain?: string;  // Optional: add custom domain
}
```

**Provisioning Logic:**

1. **Create Centre**
   ```sql
   INSERT INTO centres (name, slug, organization_id, plan_tier, status)
   VALUES (...) RETURNING id;
   ```

2. **Create Default Domain**
   ```sql
   INSERT INTO centre_domains (centre_id, domain, verification_status)
   VALUES (centre_id, '{slug}.sites.edusitepro.co.za', 'verified');
   ```

3. **Create Default Theme**
   ```sql
   INSERT INTO themes (centre_id, colors, fonts, ...)
   VALUES (centre_id, default_tokens);
   ```

4. **Seed Content from Template**
   - Fetch template from registry: `getTemplateByKey(template_key)`
   - Create pages from `template.pages`
   - Create page_blocks from `template.blocks`
   - Replace placeholders: `{{centre_name}}`, `{{centre_slug}}`

5. **Create Navigation Menu**
   ```sql
   INSERT INTO navigation_items (centre_id, label, url, sort_order)
   VALUES
     (centre_id, 'Home', '/', 0),
     (centre_id, 'About', '/about', 1),
     (centre_id, 'Programs', '/programs', 2),
     (centre_id, 'Contact', '/contact', 3);
   ```

6. **Send Welcome Email (if admin_email provided)**
   - Use Resend API
   - Include portal login link, getting started guide

**Response:**
```json
{
  "centre_id": "uuid",
  "preview_url": "https://slug.sites.edusitepro.co.za",
  "admin_portal_url": "https://portal.edusitepro.co.za?centre={centre_id}"
}
```

**Error Handling:**
- Rollback on failure (wrap in transaction if possible)
- Return detailed error: which step failed
- Log to Sentry

### 4.4 Centre Settings & Domain Management (Day 13-14)

**Files to Create:**

```
src/app/admin/centres/[id]/page.tsx          # Tabbed layout
src/app/admin/centres/[id]/domains/page.tsx  # Domain management
src/components/admin/DomainVerificationInstructions.tsx
src/app/api/admin/centres/[id]/domains/route.ts
```

**Tabs:**

1. **General**
   - Name, slug (slug not editable after creation)
   - Status: Active/Suspended toggle
   - Plan tier (read-only or editable for super_admin)
   - Contact info

2. **Branding**
   - Logo upload (Supabase Storage)
   - Theme colors (color picker)
   - Font selection (dropdown)
   - Preview changes live

3. **Domains**
   - List domains (default subdomain + custom domains)
   - Add custom domain button → modal with form
   - Show DNS instructions: `CNAME www cname.vercel-dns.com`
   - Verification status: Pending/Verified with check icon
   - Set primary domain (radio buttons)
   - Remove domain (confirmation, warn if primary)

4. **Users** (Option 2 dependency)
   - List users with access to this centre
   - Invite user → send email with magic link
   - Change role: Centre Admin / Editor / Viewer
   - Remove access

5. **Danger Zone**
   - Suspend centre (reversible)
   - Delete centre (requires typing centre slug to confirm)

**DB Migration for Domains:**

```sql
ALTER TABLE centre_domains ADD COLUMN verification_token TEXT;
ALTER TABLE centre_domains ADD COLUMN verification_method TEXT DEFAULT 'CNAME';
```

### 4.5 Centre Dashboard & Monitoring (Day 14)

**Files to Create:**

```
src/app/admin/centres/[id]/dashboard/page.tsx
src/app/admin/centres/[id]/monitoring/page.tsx
```

**Dashboard Widgets:**

1. **Content Stats**
   - Total pages: `COUNT(pages WHERE centre_id=...)`
   - Published pages: `COUNT(pages WHERE centre_id=... AND is_published=true)`
   - Last updated: `MAX(pages.updated_at)`

2. **Recent Activity Feed**
   - Last 10 page edits/publishes
   - Format: "Page 'About Us' published by John Doe 2 hours ago"

3. **Domain Status**
   - Primary domain with verification badge
   - Custom domains list with status

4. **Analytics Preview** (if configured)
   - PostHog: Sessions, pageviews (last 30 days)
   - Vercel Analytics: Core Web Vitals snapshot

5. **Monitoring** (Sentry/Vercel integration)
   - Error count (last 24h)
   - Uptime percentage
   - Response time (p50, p95)

**Performance:**
- Use React Server Components with Suspense
- Cache stats for 60 seconds: `revalidate: 60`
- Lazy load heavy charts

### 4.6 Bulk Centre Import (Day 15)

**Files to Create:**

```
src/app/admin/centres/import/page.tsx
src/app/api/admin/centres/import/route.ts
```

**CSV Format:**

```csv
name,slug,organization,plan_tier,admin_email,template_key
Sunny Days ECD,sunny-days,Sunny Days Group,solo,admin@sunnydays.co.za,welcome-play
Happy Kids,happy-kids,Happy Kids Group,group_5,admin@happykids.co.za,outdoor-adventure
```

**Flow:**

1. **Upload CSV**
   - Drag-and-drop or file picker
   - Validate headers match expected format
   - Parse all rows with Zod

2. **Preview & Validate**
   - Show table with all rows
   - Highlight validation errors per row (red border)
   - Allow editing inline
   - Show error count: "3 rows have errors"

3. **Confirm & Import**
   - Disable if errors exist
   - Process sequentially with progress bar
   - Show: "Processing 5 of 10..."
   - Handle partial failures: continue processing, log errors

4. **Results**
   - Success count, failure count
   - Download error CSV with reasons
   - Link to newly created centres

**Polish:**
- Empty states with illustrations
- Loading skeletons during data fetch
- Toast notifications for success/error

---

## ⚙️ Option 3: Platform Settings

**Goal:** Create admin settings pages for platform configuration (email, analytics, security, integrations).

**Estimated Time:** 2-3 days

### 3.1 Settings Table & Library (Day 16)

**DB Migration:**

```sql
CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  category TEXT CHECK (category IN ('general', 'email', 'analytics', 'security', 'integrations')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admin can access
CREATE POLICY "Super admins can manage settings"
  ON platform_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
```

**Files to Create:**

```
src/lib/settings.ts
src/app/api/admin/settings/route.ts
```

**Settings Library:**

```typescript
// src/lib/settings.ts
export async function getSetting(key: string): Promise<any>
export async function updateSetting(key: string, value: any): Promise<void>
export async function getSettingsByCategory(category: string): Promise<Record<string, any>>

// Built-in cache (5 min TTL)
const settingsCache = new Map<string, { value: any; expires: number }>();
```

**API Endpoint:**

```typescript
// GET /api/admin/settings?category=email
// PUT /api/admin/settings { key: 'email.smtp_host', value: 'smtp.resend.com' }
```

**Env Fallbacks:**
- If setting not in DB, read from env vars (read-only)
- Show warning: "This setting is from environment. Changes require redeploy."

### 3.2 Settings Pages (Day 16-17)

**Files to Create:**

```
src/app/admin/settings/
├── general/page.tsx
├── email/page.tsx
├── analytics/page.tsx
├── security/page.tsx
└── integrations/page.tsx
```

**General Settings:**
- Platform name (shown in header, emails)
- Timezone (for date formatting)
- Region: Country, currency (ZAR), date format (YYYY-MM-DD)
- Logo upload (for emails, admin header)
- Favicon upload

**Email Settings:**
- Provider: Resend (default), SMTP custom
- Resend API key (password field)
- Default from email: `noreply@edusitepro.co.za`
- Default reply-to email
- Email templates list/edit (future)
- "Send test email" button

**Analytics Settings:**
- PostHog project key
- Vercel Analytics toggle (on/off)
- Google Analytics 4 ID
- GTM container ID
- Privacy mode toggle (anonymize IPs)

**Security Settings:**
- API key management (list/create/revoke)
- Regenerate `INTERNAL_ADMIN_TOKEN` button (rotate immediately)
- Session timeout config (default: 7 days)
- 2FA enforcement toggle (placeholder)
- Password policy: min length, complexity

**Integrations Settings:**
- Webhook URLs (for external services)
- Vercel deployment webhook (trigger redeploy)
- Supabase connection status check
- Domain verification helper text

**Validation:**
- Zod schemas per settings group
- Block unknown keys
- Sensitive fields (API keys) stored with encryption if available

### 3.3 Environment Inspector & QA (Day 17)

**Files to Create:**

```
src/app/admin/settings/environment/page.tsx
```

**Env Inspector:**
- List all required env vars
- Show which are set/missing
- Show value preview (first 4 chars + ****, for security)
- Copy `.env.example` button
- Warning banner: "Server-only vars require redeploy"

**QA:**
- End-to-end: Save setting → refresh page → persists
- Send test email success path
- Analytics keys appear on centre sites (view source)

**Deploy:**
```bash
npm run verify
supabase db push  # Apply migrations
vercel --prod      # Deploy
```

---

## 📊 Progress Tracker

### Option 1: Page Builder Database Integration

| Task | Estimated Time | Status |
|------|----------------|--------|
| 1.1 API Routes Creation | 1 day | 🟡 In Progress (foundation done) |
| 1.2 UI Components (CentreSelector, PageSelector, SaveStatus) | 0.5 day | ⚪ Not Started |
| 1.3 Wire Page Builder UI | 0.5 day | ⚪ Not Started |
| 1.4 Validation & Error Handling | 0.5 day | ⚪ Not Started |
| 1.5 QA & Documentation | 0.5 day | ⚪ Not Started |
| **Total** | **3 days** | **10% Complete** |

### Option 2: Authentication & RBAC

| Task | Estimated Time | Status |
|------|----------------|--------|
| 2.1 Auth Library & Middleware | 1 day | ⚪ Not Started |
| 2.2 Login UI & Session Management | 1 day | ⚪ Not Started |
| 2.3 Create First Super Admin | 0.5 day | ⚪ Not Started |
| 2.4 Secure All API Routes | 1 day | ⚪ Not Started |
| **Total** | **3.5 days** | **0% Complete** |

### Option 4: Centre Management

| Task | Estimated Time | Status |
|------|----------------|--------|
| 4.1 Centres List Enhancements | 0.5 day | ⚪ Not Started |
| 4.2 Centre Creation Wizard | 1 day | ⚪ Not Started |
| 4.3 One-Click Provisioning API | 1 day | ⚪ Not Started |
| 4.4 Centre Settings & Domain Management | 1 day | ⚪ Not Started |
| 4.5 Centre Dashboard & Monitoring | 0.5 day | ⚪ Not Started |
| 4.6 Bulk Centre Import | 0.5 day | ⚪ Not Started |
| **Total** | **4.5 days** | **0% Complete** |

### Option 3: Platform Settings

| Task | Estimated Time | Status |
|------|----------------|--------|
| 3.1 Settings Table & Library | 0.5 day | ⚪ Not Started |
| 3.2 Settings Pages (General, Email, Analytics, Security, Integrations) | 2 days | ⚪ Not Started |
| 3.3 Environment Inspector & QA | 0.5 day | ⚪ Not Started |
| **Total** | **3 days** | **0% Complete** |

### Overall Progress

**Total Estimated Time:** 14 days  
**Completed:** Day 0 (Kickoff) + 10% of Option 1 = **~5% Overall**  
**Remaining:** ~13 days

---

## 🎯 Success Criteria

### Option 1 (Page Builder) - Complete When:
- ✅ Create new page with title/slug validation
- ✅ Add/remove/reorder blocks with drag-and-drop
- ✅ Edit block props with inline validation errors
- ✅ Auto-save every 2 seconds after changes
- ✅ Publish/unpublish with confirmation
- ✅ Delete page with confirmation
- ✅ Page state persists after reload
- ✅ Published pages appear on centre site with cache revalidation

### Option 2 (Auth/RBAC) - Complete When:
- ✅ Login with email/password works
- ✅ Unauthenticated users redirected to `/login`
- ✅ Session persists across page loads
- ✅ Super admin can access all centres
- ✅ Centre admin can only access assigned centres
- ✅ Editor can edit content but not settings
- ✅ Logout clears session and redirects
- ✅ API routes return 401/403 based on role

### Option 4 (Centre Management) - Complete When:
- ✅ List centres with filters, search, pagination
- ✅ Create centre via wizard (6 steps)
- ✅ One-click provision seeds content from template
- ✅ Domain management (add, verify, set primary, remove)
- ✅ Centre dashboard shows stats and activity
- ✅ Bulk import from CSV with validation

### Option 3 (Settings) - Complete When:
- ✅ Update general settings (platform name, timezone, logo)
- ✅ Configure email settings and send test email
- ✅ Set analytics keys (PostHog, GA4)
- ✅ Manage API keys (create, revoke)
- ✅ Settings persist after refresh
- ✅ Environment inspector shows var status

---

## 🚀 Next Steps

### Immediate (Today/Tomorrow):
1. **Complete Option 1 API Routes**
   - Create all files from `docs/IMPLEMENTATION_GUIDE_OPTIONS_1-4.md`
   - Test with curl/Postman
   - Verify database writes

2. **Wire Up Page Builder UI**
   - Create CentreSelector, PageSelector, SaveStatus components
   - Modify builder page to call APIs
   - Test full flow: create → edit → save → publish

3. **Start Option 2 Auth**
   - Enhance `src/lib/auth.ts` with `requireRole()`
   - Create `src/lib/permissions.ts`
   - Protect middleware

### Short-term (This Week):
- Complete Options 1 & 2
- Begin Option 4 (Centres)
- Deploy to preview environment

### Medium-term (Next Week):
- Complete Options 4 & 3
- Full QA sweep
- Production deployment
- User training materials

---

## 📚 Additional Resources

### Documentation References
- **API Guide:** `docs/IMPLEMENTATION_GUIDE_OPTIONS_1-4.md`
- **System Docs:** `SYSTEM_DOCUMENTATION.md`
- **Transformation Plan:** `TRANSFORMATION-PLAN.md`
- **WARP Rules:** `WARP.md`

### Testing Tools
- REST Client: Thunder Client (VS Code extension)
- Token Generator: `openssl rand -hex 32`
- Database: Supabase Dashboard SQL Editor

### Deployment
- Preview: `vercel --prod`
- Production: Git push to main (auto-deploy)
- Migrations: `supabase db push`

---

**Document Status:** Ready for handoff. All 4 options fully planned with code examples, timelines, and acceptance criteria.

**Last Updated:** 2025-01-26 13:48 UTC
