# 🚀 EduSitePro Quick Start Guide

## Start Building Today (Day 1)

**Goal:** Get your development environment ready and implement the foundation for the multi-tenant SaaS platform.

---

## ⚡ Immediate Actions (Next 2 Hours)

### 1. Review the Transformation Plan

```bash
# Read the comprehensive plan
cat TRANSFORMATION-PLAN.md

# Review the todo list
# (Already created - 25 detailed tasks)
```

### 2. Set Up Development Environment

```bash
# 1. Ensure dependencies are up to date
npm install

# 2. Add new required packages
npm install @supabase/ssr@^0.5.1 \
  @sentry/nextjs@^8.0.0 \
  posthog-node@^4.0.0 \
  date-fns@^3.0.0

# 3. Create environment file for local development
cp .env.example .env.local
```

### 3. Database Setup (Supabase)

**Option A: Use existing Supabase project**

```bash
# Link to existing project
npx supabase link --project-ref <your-project-ref>

# Pull current schema
npx supabase db pull
```

**Option B: Create new project**

1. Go to https://supabase.com/dashboard
2. Create new project (Cape Town region recommended)
3. Note down:
   - Project URL
   - Anon Key
   - Service Role Key
4. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### 4. Apply Database Migrations

```bash
# Create migrations directory if not exists
mkdir -p supabase/migrations

# Copy the enhanced schema
cp supabase/schema.sql supabase/migrations/20251025000001_enhanced_schema.sql

# Apply migrations
npx supabase db push
```

---

## 📋 Day 1 Checklist (8 hours)

### Morning (4 hours)

- [ ] **Architecture Review** (1 hour)
  - Read `TRANSFORMATION-PLAN.md` sections: Vision, Architecture, Database Schema
  - Understand multi-tenancy model
  - Review routing strategy (marketing/portal/admin/sites)

- [ ] **Database Implementation** (2 hours)
  - Apply enhanced schema migrations
  - Test RLS policies with sample data
  - Create test centres and users
  - Verify memberships and roles work

- [ ] **Middleware Foundation** (1 hour)
  - Create `src/middleware.ts` for tenant resolution
  - Implement domain-based routing logic
  - Test subdomain resolution locally (use `/etc/hosts`)

### Afternoon (4 hours)

- [ ] **Tenancy Resolver** (2 hours)
  - Create `src/lib/tenancy.ts` with helper functions
  - Implement `getCentreFromHost()` function
  - Add caching layer for tenant lookups
  - Write unit tests

- [ ] **Template Block System** (2 hours)
  - Design block component structure
  - Create first 3 blocks (Hero, RichText, ContactCTA)
  - Define props schemas with Zod
  - Test rendering with sample data

---

## 🛠️ Key Files to Create Today

### 1. Middleware (`src/middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCentreByDomain } from '@/lib/tenancy';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Marketing site
  if (hostname === 'www.edusitepro.co.za' || hostname === 'edusitepro.co.za') {
    return NextResponse.rewrite(new URL('/app/(marketing)', request.url));
  }

  // Admin portal
  if (hostname === 'admin.edusitepro.co.za') {
    return NextResponse.rewrite(new URL('/app/(admin)', request.url));
  }

  // Client portal
  if (hostname === 'portal.edusitepro.co.za') {
    return NextResponse.rewrite(new URL('/app/(portal)', request.url));
  }

  // Centre sites (*.sites.edusitepro.co.za or custom domains)
  const centre = await getCentreByDomain(hostname);

  if (centre) {
    const response = NextResponse.rewrite(new URL('/app/site', request.url));
    response.headers.set('x-centre-id', centre.id);
    return response;
  }

  // 404 if no match
  return new NextResponse('Not Found', { status: 404 });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 2. Tenancy Library (`src/lib/tenancy.ts`)

```typescript
import { getServiceRoleClient } from './supabase';

interface Centre {
  id: string;
  slug: string;
  name: string;
  primary_domain: string;
  default_subdomain: string;
  brand_theme: Record<string, unknown>;
  status: string;
}

const centreCache = new Map<string, Centre>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCentreByDomain(hostname: string): Promise<Centre | null> {
  // Check cache
  const cached = centreCache.get(hostname);
  if (cached) return cached;

  const supabase = getServiceRoleClient();

  // Check centre_domains table first (custom domains)
  const { data: domainData } = await supabase
    .from('centre_domains')
    .select('centre_id, centres(*)')
    .eq('domain', hostname)
    .eq('verification_status', 'verified')
    .single();

  if (domainData?.centres) {
    const centre = domainData.centres as unknown as Centre;
    centreCache.set(hostname, centre);
    setTimeout(() => centreCache.delete(hostname), CACHE_TTL);
    return centre;
  }

  // Check default subdomain pattern (slug.sites.edusitepro.co.za)
  if (hostname.endsWith('.sites.edusitepro.co.za')) {
    const slug = hostname.split('.')[0];

    const { data: centreData } = await supabase
      .from('centres')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (centreData) {
      const centre = centreData as Centre;
      centreCache.set(hostname, centre);
      setTimeout(() => centreCache.delete(hostname), CACHE_TTL);
      return centre;
    }
  }

  return null;
}

export function getCentreIdFromHeaders(headers: Headers): string | null {
  return headers.get('x-centre-id');
}
```

### 3. Enhanced Database Migration

Already exists in `supabase/schema.sql` - just need to apply it:

```bash
# Create migration file
npx supabase migration new enhanced_multi_tenant_schema

# Copy enhanced schema to migration file
# Then apply:
npx supabase db push
```

---

## 🧪 Testing Your Setup

### 1. Test Database Connection

```bash
# Create a test script
cat > test-db.mjs << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase.from('centres').select('*').limit(1);

if (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}

console.log('✅ Database connected successfully!');
console.log('Sample centre:', data);
EOF

node test-db.mjs
```

### 2. Test Tenant Resolution

```bash
# Add test hosts (Linux/Mac)
sudo echo "127.0.0.1 test-centre.sites.edusitepro.co.za" >> /etc/hosts

# Create test centre in database
# Then access: http://test-centre.sites.edusitepro.co.za:3000
```

### 3. Verify RLS Policies

```sql
-- In Supabase SQL Editor
-- Test super_admin access
SELECT * FROM pages; -- Should work

-- Test centre_admin access (will need auth.uid())
-- Create test users via Supabase Auth dashboard
```

---

## 📝 Key Decisions Needed Today

### 1. Supabase Project Setup

- **Decision:** Use existing project or create new?
- **Recommendation:** Create new project for clean start
- **Region:** Cape Town (cpt1) for best SA performance

### 2. Domain Strategy

- **Decision:** Purchase `.co.za` domain now or later?
- **Recommendation:** Purchase now, set up DNS early
  - `www.edusitepro.co.za` - Marketing
  - `portal.edusitepro.co.za` - Client portal
  - `admin.edusitepro.co.za` - Internal admin
  - `*.sites.edusitepro.co.za` - Centre sites (wildcard)

### 3. Payment Provider

- **Decision:** Paystack, Peach Payments, or PayFast?
- **Recommendation:** Start with Paystack (best API, ZAR support)
- **Action:** Create account today, get test keys

---

## 🎯 End of Day 1 Goals

By end of day, you should have:

1. ✅ Enhanced database schema applied
2. ✅ Middleware routing working (basic)
3. ✅ Tenant resolution functional
4. ✅ 1-2 test centres created
5. ✅ First template blocks rendering
6. ✅ RLS policies tested
7. ✅ Environment variables configured
8. ✅ Development server running smoothly

---

## 🚀 Day 2 Preview

Tomorrow you'll focus on:

- Template variant system (4 themes)
- Block component library (10 blocks)
- Admin dashboard foundation
- Centre creation API endpoint
- Seeding functionality

---

## 🆘 Troubleshooting

### Issue: Middleware not resolving domains

**Solution:** Check `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    middleware: true,
  },
};

export default nextConfig;
```

### Issue: RLS policies blocking queries

**Solution:** Use service role client for admin operations:

```typescript
import { getServiceRoleClient } from '@/lib/supabase';
const supabase = getServiceRoleClient(); // Bypasses RLS
```

### Issue: Local subdomain testing not working

**Solution:** Use `localhost` with query params for testing:

```
http://localhost:3000?centre_slug=test-centre
```

---

## 📚 Resources for Day 1

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Multi-Tenant Architecture Patterns](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/multi-tenant-data-isolation.html)

---

## ✅ Quick Validation Checklist

Before moving to Day 2:

- [ ] Database migrations applied without errors
- [ ] Can query centres table via Supabase dashboard
- [ ] Middleware file created and compiling
- [ ] Tenancy resolver returns centre for test domain
- [ ] At least 1 template block component created
- [ ] Environment variables all set
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No linting errors: `npm run lint`

---

**Next:** After completing Day 1, review `TRANSFORMATION-PLAN.md` Day 2 section and continue implementation.

**Questions?** Check TODO list for detailed guidance on each task.

🚀 Let's build something amazing!
