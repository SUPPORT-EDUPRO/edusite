# Multi-Tenant CMS Architecture for EduSitePro

## Overview

EduSitePro is designed as a **multi-tenant SaaS platform** where each educational institution (preschool, school, or education centre) gets their own branded website with CMS capabilities, all managed from a single codebase.

---

## Architecture Components

### 1. **Tenant Identification System**

#### Subdomain-Based Routing
```
youngeagles.edusitepro.org.za  → Young Eagles Education Centre
littlestars.edusitepro.org.za  → Little Stars Preschool
brightfuture.edusitepro.org.za → Bright Future School
```

**How it works:**
- Each organization gets a unique slug (e.g., `youngeagles`)
- Slug is stored in `organizations` table: `slug` column
- Middleware detects subdomain and loads organization-specific content
- All CMS operations are scoped to the tenant's organization_id

#### Fallback: Slug-Based Routing
```
edusitepro.org.za/youngeagles   → Young Eagles (if subdomain not available)
edusitepro.org.za/littlestars   → Little Stars
```

---

### 2. **Database Schema (Multi-Tenant Tables)**

#### Core Tables

**`organizations`** - Tenant Master Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,          -- URL identifier (youngeagles)
  name TEXT NOT NULL,                 -- Display name
  organization_type TEXT,             -- preschool, school, academy
  domain TEXT,                        -- Custom domain (optional)
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  
  -- Features
  features JSONB DEFAULT '{}',        -- Feature flags per tenant
  subscription_tier TEXT DEFAULT 'free',
  
  -- Settings
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`pages`** - Tenant-Specific Pages
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  slug TEXT NOT NULL,                 -- about, admissions, contact
  title TEXT NOT NULL,
  content JSONB,                      -- Page blocks/sections
  seo_meta JSONB,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, slug)       -- Each org has own /about page
);
```

**`blocks`** - Reusable Content Blocks
```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  block_type TEXT NOT NULL,           -- hero, features, pricing, gallery
  content JSONB NOT NULL,             -- Block-specific data
  position INTEGER,                   -- Display order
  page_id UUID REFERENCES pages(id),  -- Parent page
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`media`** - Tenant Media Library
```sql
CREATE TABLE media (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,             -- Supabase Storage URL
  file_type TEXT,                     -- image, video, document
  file_size INTEGER,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`navigation`** - Custom Menus
```sql
CREATE TABLE navigation (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  menu_location TEXT NOT NULL,        -- header, footer, sidebar
  items JSONB NOT NULL,               -- Menu structure
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`registration_requests`** - Already exists! ✅
```sql
-- This is the table we're using for registration management
-- Already has organization_id for multi-tenancy
```

---

### 3. **CMS Admin Panel Structure**

#### Admin Access Levels

**Super Admin (EduSitePro Staff)**
- Access: `/admin` - Master control panel
- Capabilities:
  - Create new organizations
  - Manage all tenants
  - System-wide settings
  - Billing and subscriptions

**Organization Admin (School Principal/Manager)**
- Access: `/admin/org/[slug]` or subdomain admin
- Capabilities:
  - Manage their own organization's content
  - Edit pages, blocks, media
  - Approve registrations for their school
  - Manage staff users
  - View analytics

**Staff (Teachers/Admin Staff)**
- Access: Limited admin panel
- Capabilities:
  - View registrations
  - Manage day-to-day content
  - Upload media

---

### 4. **CMS Features by Tenant**

#### Page Builder
- **Drag & Drop Interface**: Similar to Wix/Squarespace
- **Pre-built Blocks**:
  - Hero Section (with background image, CTA)
  - Features Grid
  - Testimonials
  - Gallery
  - Contact Form
  - Pricing Table
  - Class Schedule
  - Staff Profiles
  - Blog Posts

#### Content Management
- **Pages**: About, Admissions, Programs, Contact, etc.
- **Blog**: News and updates
- **Events**: School calendar
- **Gallery**: Photos and videos
- **Documents**: Policies, forms, brochures

#### Registration System (Already Built!) ✅
- **Public Form**: Custom registration form per school
- **Admin Approval**: We just built `/admin/registrations` page
- **Auto Account Creation**: Approving creates parent account in EduDash Pro
- **Email Notifications**: Welcome emails with credentials

---

### 5. **Row-Level Security (RLS) Policies**

#### Tenant Isolation
Every table with `organization_id` has RLS policies:

```sql
-- Example: Pages table RLS
CREATE POLICY "Users can view their organization's pages"
ON pages FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can edit their organization's pages"
ON pages FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);
```

**Result**: Complete data isolation between tenants automatically!

---

### 6. **Implementation Roadmap**

#### Phase 1: Core CMS (CURRENT STATUS)
- ✅ Multi-tenant database schema
- ✅ Registration system with approval workflow
- ✅ Email automation (welcome emails)
- ✅ Admin panel foundation (`/admin`)
- ✅ Service role authentication
- 🔨 **IN PROGRESS**: Registration management UI

#### Phase 2: Basic CMS Features (NEXT)
- [ ] Page builder with drag-drop blocks
- [ ] Media library management
- [ ] Navigation menu editor
- [ ] Organization settings page
- [ ] User/staff management per org

#### Phase 3: Advanced Features
- [ ] Custom domain mapping (youngeagles.co.za → their site)
- [ ] Email campaign builder
- [ ] Payment processing (Yoco/PayFast integration)
- [ ] Analytics dashboard per organization
- [ ] Multi-language support

#### Phase 4: White-Label & Scaling
- [ ] Custom branding per tenant (remove EduSitePro branding)
- [ ] Subscription tiers (Free, Basic, Pro, Enterprise)
- [ ] API for third-party integrations
- [ ] Mobile app deep linking

---

### 7. **Current Implementation Details**

#### How Young Eagles Uses the System

**Public Website** (`youngeagles.edusitepro.org.za`)
- Static landing page with registration form
- Form submits to `/api/registrations` (POST)
- Data stored in `registration_requests` table with `organization_id`

**Admin Panel** (`edusitepro.org.za/admin/registrations`)
- Staff logs in with Supabase Auth
- Sees list of pending registrations for their organization(s)
- Clicks "Approve" button
- System calls `/api/registrations/approve` which:
  1. Creates Supabase Auth user (parent account)
  2. Creates profile in `profiles` table
  3. Creates student in `students` table
  4. Links to organization
  5. Sends welcome email with login credentials
  6. Updates registration status to 'approved'

**Parent Experience**
- Receives email with login link to https://edudashpro.org.za
- Logs in to mobile/web app
- Can view child's homework, chat with teachers, make payments

---

### 8. **How Other Schools Will Use It**

#### Onboarding Process

**Step 1: Organization Creation** (Super Admin)
```sql
INSERT INTO organizations (slug, name, organization_type) 
VALUES ('littlestars', 'Little Stars Preschool', 'preschool');
```

**Step 2: Admin User Setup**
- Create principal/admin account via Supabase Auth
- Link to organization in `user_organizations` table
- Send login credentials

**Step 3: School Customizes Their Site**
- Principal logs into `/admin`
- Uploads logo, sets colors
- Creates pages (About, Programs, Contact)
- Adds blocks to pages (hero, gallery, pricing)
- Sets up custom registration form fields

**Step 4: Launch**
- Subdomain goes live: `littlestars.edusitepro.org.za`
- Registration form receives applications
- Admin approves → parents get EduDash Pro access

---

### 9. **Multi-Tenant CMS Builder Interface**

#### Proposed UI Components

**`/admin/pages/builder`** - Visual Page Editor
```tsx
<PageBuilder>
  <BlockLibrary>
    - Hero Section
    - Features
    - Gallery
    - Contact Form
    - Pricing
    - Custom HTML
  </BlockLibrary>
  
  <Canvas organizationId={org.id}>
    {/* Drag blocks here */}
    <Block type="hero" data={{...}} />
    <Block type="features" data={{...}} />
  </Canvas>
  
  <PropertiesPanel>
    {/* Edit block settings */}
  </PropertiesPanel>
</PageBuilder>
```

**`/admin/media`** - Media Library
- Upload images, videos, PDFs
- Organize in folders
- Insert into pages/blocks
- All files in Supabase Storage with organization_id prefix

**`/admin/navigation`** - Menu Manager
- Visual menu builder
- Drag to reorder
- Link to pages or external URLs
- Header/footer menus

---

### 10. **Technical Stack**

**Frontend**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Shadcn UI components
- React DnD (drag and drop for builder)

**Backend**
- Supabase (PostgreSQL + Auth + Storage)
- Edge Functions (email, webhooks)
- Row-Level Security for tenant isolation

**Storage**
- Supabase Storage (organized by organization_id)
- CDN for media delivery

**Email**
- Resend API (already integrated!)
- Templated emails per organization

---

### 11. **Revenue Model**

#### Subscription Tiers

**Free Tier**
- 1 website
- 5 pages max
- Basic blocks
- EduSitePro branding
- 50 registrations/year

**Basic (R299/month)**
- Custom subdomain
- 20 pages
- All blocks
- Remove branding
- 200 registrations/year
- Email support

**Pro (R799/month)**
- Everything in Basic
- Custom domain
- Unlimited pages
- Advanced analytics
- Priority support
- Unlimited registrations

**Enterprise (Custom)**
- Multiple sites
- White-label
- Dedicated support
- Custom integrations

---

## Next Steps

### Immediate (This Week)
1. ✅ Build registration management UI
2. Test approval workflow end-to-end
3. Create organization settings page
4. Build simple page editor (start with forms)

### Short Term (Next 2 Weeks)
1. Page builder with drag-drop
2. Media library
3. Navigation menu editor
4. Staff user management

### Medium Term (1-2 Months)
1. Custom domain mapping
2. Payment integration
3. Email campaigns
4. Analytics dashboard

---

## Summary

**What We Have:**
- ✅ Multi-tenant database architecture
- ✅ Registration system with auto-approval
- ✅ Email automation
- ✅ Admin panel foundation
- ✅ Secure tenant isolation (RLS)

**What We're Building:**
- 🔨 Registration management UI (just built!)
- 📋 Page builder and CMS features
- 🎨 Customization options per tenant

**The Vision:**
Every school gets a professional website + registration system + parent portal, all managed from one platform. They customize their branding, manage content, approve registrations, and parents get automatic access to the EduDash Pro app.

**Business Model:**
SaaS subscription (R299-R799/month per school) + one-time setup fees for customization.

---

## Questions?

This is the complete architecture. The registration approval system you asked about is the foundation - now we build the CMS on top of it so each school can manage their own content while all sharing the same powerful backend infrastructure.
