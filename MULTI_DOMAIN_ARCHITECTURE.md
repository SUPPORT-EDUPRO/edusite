# Multi-Domain Architecture for EduSitePro

## Overview
EduSitePro supports **three domain access patterns** for each organization:

1. **Platform Subdomain**: `{slug}.edusitepro.vercel.app` (e.g., `young-eagles.edusitepro.vercel.app`)
2. **Custom Domain**: Organization's own domain (e.g., `youngeagles.org.za`)
3. **Direct Route**: Via platform with slug (e.g., `edusitepro.vercel.app/young-eagles/register`)

## How It Works

### For Parents/Users
When parents visit any of these URLs, they should reach the **same registration experience**:

- `youngeagles.org.za/register` → Young Eagles registration form
- `young-eagles.edusitepro.vercel.app/register` → Young Eagles registration form
- `edusitepro.vercel.app/young-eagles/register` → Young Eagles registration form

### For Organizations (Schools)
Each organization can choose their preferred setup:

#### Option 1: Use Their Own Domain (Recommended)
**Best for**: Established schools with existing domains

- Parents visit: `youngeagles.org.za`
- Marketing site runs on: `youngeagles.org.za`
- Registration at: `youngeagles.org.za/register`
- Admin dashboard at: `youngeagles.org.za/admin`

**Setup Required**:
1. Point DNS A record to Vercel IP
2. Add domain to Vercel project
3. Verify domain in EduSitePro admin
4. System auto-detects organization via domain

#### Option 2: Use Platform Subdomain
**Best for**: New schools or those without domains

- Parents visit: `young-eagles.edusitepro.vercel.app`
- Registration at: `young-eagles.edusitepro.vercel.app/register`
- No DNS setup required
- Instant activation

#### Option 3: Hybrid (Current Young Eagles Setup)
**Best for**: Transition period or multi-site setups

- Marketing site: `youngeagles.org.za` (separate PWA/static site)
- Registration: Links to `edusitepro.vercel.app/young-eagles/register`
- Admin: Uses platform directly

## Technical Implementation

### 1. Middleware Domain Resolution

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if this is a custom domain
  const organization = await getOrganizationByDomain(hostname);
  
  if (organization) {
    // Set tenant context
    response.headers.set('x-tenant-id', organization.id);
    response.headers.set('x-tenant-slug', organization.slug);
    return response;
  }
  
  // Check slug-based routing
  // /young-eagles/register → extract 'young-eagles'
  const slugMatch = path.match(/^\/([^\/]+)/);
  if (slugMatch) {
    const slug = slugMatch[1];
    const org = await getOrganizationBySlug(slug);
    if (org) {
      response.headers.set('x-tenant-id', org.id);
    }
  }
}
```

### 2. Database Schema

```sql
-- organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  domain_verified BOOLEAN DEFAULT false,
  school_code TEXT UNIQUE NOT NULL,
  organization_type organization_type NOT NULL
);

-- Fast domain lookup
CREATE INDEX idx_organizations_custom_domain 
ON organizations(custom_domain) 
WHERE custom_domain IS NOT NULL;
```

### 3. Registration Routes

All these routes point to the same component:

```
/register → Uses tenant from middleware (domain/subdomain)
/{slug}/register → Uses slug to identify tenant
/admin/register → Admin creates registration for specific school
```

## Current Young Eagles Setup

### Marketing Site (youngeagles.org.za)
- **Location**: `/Desktop/youngeagles-education-platform`
- **Tech**: React PWA (Vite)
- **Port**: 5174
- **Purpose**: Marketing, info, programs showcase

### Registration System (EduSitePro)
- **Location**: `/Desktop/edusitepro`
- **Tech**: Next.js 14
- **Port**: 3002 (dev), production on Vercel
- **Purpose**: Student registration, admin dashboard, data management

## What Needs to Happen

### Phase 1: Update Young Eagles PWA (Immediate)
1. **Remove old PWA deeplink** from homepage
2. **Update "Register for 2026" button** to point to:
   ```
   https://edusitepro.vercel.app/young-eagles/register
   ```
3. **Add visual indication** that registration opens in secure platform

### Phase 2: Custom Domain Integration (Next Sprint)
1. **Deploy EduSitePro** to Vercel
2. **Add `youngeagles.org.za`** as custom domain in Vercel
3. **Update DNS** A record to point to Vercel
4. **Verify domain** in database
5. **Update links** to use `youngeagles.org.za/register`

### Phase 3: Unified Experience (Future)
1. **Migrate marketing content** to EduSitePro templates
2. **Single deployment** per organization
3. **Full branding control** via admin panel
4. **No separate PWA** needed

## For New Organizations

When a school signs up for a "group package":

### Step 1: Organization Setup
```sql
INSERT INTO organizations (
  name, 
  slug, 
  custom_domain,
  school_code, 
  organization_type
) VALUES (
  'Sunrise Primary School',
  'sunrise-primary',
  'sunriseprimary.co.za', -- Their domain
  'SPS-2026',
  'primary_school'
);
```

### Step 2: Vercel Deployment
- Create Vercel project (or use multi-tenant project)
- Add custom domain to Vercel
- Point DNS to Vercel

### Step 3: DNS Configuration
School updates their DNS records:
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 4: Verification
- System checks DNS propagation
- Verifies SSL certificate issuance
- Marks domain as verified in database

### Step 5: Go Live
- Parents visit: `sunriseprimary.co.za`
- See: Branded homepage with school's content
- Register at: `sunriseprimary.co.za/register`
- Access: Full multi-tenant isolation via RLS

## Security & Isolation

### Row-Level Security (RLS)
Every query automatically filters by `organization_id`:

```sql
CREATE POLICY "Users see own org data"
ON registration_requests
FOR SELECT
USING (organization_id = current_setting('request.jwt.claims')::json->>'organization_id');
```

### Middleware Tenant Context
```typescript
// Every request gets tenant context
headers: {
  'x-tenant-id': '123e4567-e89b-12d3-a456-426614174000',
  'x-tenant-slug': 'young-eagles'
}
```

### Data Isolation Guarantee
- Organizations NEVER see each other's data
- Database enforces isolation via RLS
- No shared state between tenants
- Each organization appears as if they have their own app

## Migration Path for Young Eagles

### Current State
✅ Marketing site: `youngeagles.org.za` (localhost:5174)
✅ Registration: `localhost:3002/register` (EduSitePro)
❌ Disconnected user experience
❌ Old PWA deeplink still present

### Step 1 (This Week)
- [ ] Update PWA homepage: Remove old deeplink
- [ ] Update "Register" button: Link to EduSitePro staging/prod URL
- [ ] Deploy EduSitePro to Vercel
- [ ] Test registration flow end-to-end

### Step 2 (Next Week)
- [ ] Add `youngeagles.org.za` to Vercel project
- [ ] Update DNS records
- [ ] Verify domain in database
- [ ] Update all links to use custom domain

### Step 3 (Future)
- [ ] Migrate marketing content to EduSitePro
- [ ] Decommission separate PWA
- [ ] Single deployment, single domain
- [ ] Full admin control of content

## File Changes Needed

### 1. Young Eagles PWA (youngeagles-education-platform)
**File**: `src/components/Hero.jsx` (or similar)

**Current**:
```jsx
<button onClick={() => openPWA()}>
  Register for 2026
</button>
```

**Update to**:
```jsx
<a 
  href="https://edusitepro.vercel.app/young-eagles/register"
  target="_blank"
  rel="noopener noreferrer"
  className="register-button"
>
  Register for 2026
  <ExternalLinkIcon />
</a>
```

### 2. EduSitePro Middleware
Already supports custom domains via `getCentreByDomain()`

### 3. Add Organization Domain Helpers
**File**: `src/lib/organizations.ts`

```typescript
export async function getOrganizationByDomain(domain: string) {
  const { data } = await supabase
    .from('organization_domains')
    .select('*')
    .eq('custom_domain', domain)
    .eq('domain_verified', true)
    .single();
  return data;
}
```

## Vercel Configuration

### Multi-Tenant Approach (Single Project)
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/router"
    }
  ]
}
```

### Per-Organization Approach (Multiple Projects)
Each school gets their own Vercel project:
- `youngeagles-site` → youngeagles.org.za
- `sunrise-primary-site` → sunriseprimary.co.za

Shared Supabase backend ensures data consistency.

## Recommended Approach

**Use Single Multi-Tenant Project** with custom domain mapping:

**Pros**:
- Single codebase
- Easier updates
- Cost-effective
- Centralized management

**Cons**:
- Slightly more complex routing
- All schools on same deployment

**When to use per-org projects**:
- School wants custom Next.js modifications
- School has special compliance needs
- School wants full control of deployment

---

## Summary

**Current**: Young Eagles has marketing site (PWA) + separate registration (EduSitePro)

**Next**: Link from PWA to EduSitePro registration

**Future**: Single deployment with custom domain, full integration

**For new schools**: Choose custom domain or platform subdomain, instant multi-tenant setup

This architecture supports both centralized SaaS and white-label deployments! 🎯
