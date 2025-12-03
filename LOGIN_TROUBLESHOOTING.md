# EduSitePro Login Troubleshooting Guide

## Overview
Based on the Young Eagles multi-tenant architecture investigation, here's how login and dashboard access works in EduSitePro.

## Multi-Tenant Architecture

### Tenant Identification (3 Methods)

1. **Custom Domain** (e.g., `youngeagles.org.za`)
   - Organizations table has `custom_domain` field
   - Must be DNS verified: `domain_verified = true`
   - Middleware queries: `SELECT id FROM organizations WHERE custom_domain = 'youngeagles.org.za'`

2. **Subdomain** (e.g., `young-eagles.edusitepro.org.za`)
   - Extracts slug from first part of hostname
   - Middleware queries: `SELECT id FROM organizations WHERE slug = 'young-eagles'`

3. **Localhost Development**
   - Uses authenticated user's `organization_id` from profiles table
   - Falls back to platform admin mode if user has no organization

### Platform vs Tenant Access

| Domain | Route | Tenant Context | User Role Required |
|--------|-------|----------------|-------------------|
| `edusitepro.edudashpro.org.za` | `/admin` | **NONE** (Platform mode) | `superadmin` |
| `edusitepro.edudashpro.org.za` | `/dashboard` | User's `organization_id` | `principal_admin`, `principal`, `admin` |
| `young-eagles.edusitepro.org.za` | `/admin` | Young Eagles org | `principal_admin`, `principal`, `admin` |
| `youngeagles.org.za` | `/admin` | Young Eagles org | `principal_admin`, `principal`, `admin` |
| `localhost:3000` | `/admin` | User's org (auto-detected) | Any admin role |

## Dashboard Access Logic

### Admin Dashboard (`/admin`)

**Requirements:**
1. Authenticated user (valid session)
2. User profile exists in `profiles` table
3. User has `role` and `organization_id` set
4. Middleware sets `x-tenant-id` header based on domain/slug

**Data Filtering:**
```typescript
// Admin dashboard shows organization-specific data
const { data: centre } = await supabase
  .from('centres')
  .select('*')
  .eq('organization_id', tenantId) // From x-tenant-id header
  .single();

const { data: registrations } = await supabase
  .from('registrations')
  .select('*')
  .eq('organization_id', tenantId); // RLS enforces this too
```

**Platform Admin vs Tenant Admin:**
```typescript
const isPlatformAdmin = profile?.role === 'superadmin' && !tenantId;

if (isPlatformAdmin) {
  // Show all centres, all pages, platform-wide stats
} else {
  // Show only this organization's data (filtered by tenantId)
}
```

## Common Login Issues

### Issue 1: "Cannot access dashboard after login"

**Symptom:** User logs in successfully but gets redirected to login again

**Diagnosis:**
```sql
-- Check if profile exists
SELECT id, email, role, organization_id 
FROM profiles 
WHERE email = 'user@example.com';
```

**Possible Causes:**
- ❌ Profile missing from `profiles` table
- ❌ `role` is NULL or invalid
- ❌ `organization_id` is NULL (for tenant admins)
- ❌ Session cookie not being set correctly

**Fix:**
```sql
-- Create profile if missing
INSERT INTO profiles (id, email, role, organization_id)
VALUES (
  'user-uuid-from-auth-users',
  'user@example.com',
  'principal_admin',
  'org-uuid-here'
);

-- Update existing profile
UPDATE profiles
SET role = 'principal_admin',
    organization_id = 'org-uuid-here'
WHERE email = 'user@example.com';
```

### Issue 2: "Redirect URI mismatch (Google OAuth)"

**Symptom:** Error 400 when clicking "Sign in with Google"

**Diagnosis:**
Check Google Cloud Console → APIs & Services → Credentials

**Required Callback URL:**
```
https://bppuzibjlxgfwrujzfsz.supabase.co/auth/v1/callback
```

**Fix:**
1. Go to Google Cloud Console
2. Select project
3. Navigate to: APIs & Services → Credentials
4. Click OAuth 2.0 Client ID
5. Add to "Authorized redirect URIs"
6. Save

### Issue 3: "Access denied to /admin"

**Symptom:** User redirected to `/login?error=unauthorized`

**Diagnosis:**
```sql
-- Check user role
SELECT email, role, organization_id
FROM profiles
WHERE email = 'user@example.com';
```

**Possible Causes:**
- ❌ User role is not `superadmin` (for platform admin)
- ❌ User role is not `principal_admin`, `principal`, or `admin` (for tenant admin)
- ❌ Middleware blocking access due to role mismatch

**Fix:**
```sql
-- For platform admin access
UPDATE profiles
SET role = 'superadmin',
    organization_id = NULL  -- Platform admins have no org
WHERE email = 'user@example.com';

-- For tenant admin access
UPDATE profiles
SET role = 'principal_admin',
    organization_id = 'org-uuid-here'
WHERE email = 'user@example.com';
```

### Issue 4: "Organization not found"

**Symptom:** Login works but dashboard shows no data or errors

**Diagnosis:**
```sql
-- Check if organization exists
SELECT id, name, slug, custom_domain, domain_verified
FROM organizations
WHERE slug = 'your-org-slug';

-- Check if user linked to organization
SELECT p.email, p.organization_id, o.name, o.slug
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email = 'user@example.com';
```

**Possible Causes:**
- ❌ Organization doesn't exist in database
- ❌ Organization slug mismatch with URL
- ❌ Custom domain not verified
- ❌ User's `organization_id` doesn't match existing org

**Fix:**
```sql
-- Create organization
INSERT INTO organizations (id, name, slug, custom_domain, domain_verified)
VALUES (
  gen_random_uuid(),
  'Young Eagles Preschool',
  'young-eagles',
  'youngeagles.org.za',
  true
);

-- Link user to organization
UPDATE profiles
SET organization_id = (SELECT id FROM organizations WHERE slug = 'young-eagles')
WHERE email = 'user@example.com';
```

## Registration Approval Flow

### How Organizations Get Created

1. **User submits registration** at `/[slug]/register`
   ```typescript
   POST /api/organizations/register
   Body: { organizationSlug, organizationName, email, ... }
   ```

2. **Creates registration request**
   ```sql
   INSERT INTO registration_requests (
     organization_name,
     organization_slug,
     email,
     status  -- 'pending'
   )
   ```

3. **Platform admin approves** at `/admin/organization-requests`
   ```typescript
   POST /api/organizations/approve/${requestId}
   ```

4. **Approval creates:**
   - Organization record (with UUID)
   - User account (via Supabase Auth)
   - Profile record (linked to organization)
   - Centre record (for website)
   - Syncs to EduDashPro database (same UUID)

5. **Sends invite email** with login link

### Verification Steps

```sql
-- Check registration request
SELECT id, email, organization_name, organization_slug, status, created_organization_id
FROM registration_requests
WHERE email = 'user@example.com';

-- Check if organization was created
SELECT id, name, slug
FROM organizations
WHERE id = (
  SELECT created_organization_id 
  FROM registration_requests 
  WHERE email = 'user@example.com'
);

-- Check if profile was created and linked
SELECT id, email, role, organization_id
FROM profiles
WHERE email = 'user@example.com';
```

## Localhost Development Tips

### Auto-Detection
On localhost, middleware automatically detects tenant context from user's profile:
```typescript
if (hostname.startsWith('localhost')) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', session.user.id)
    .single();
  
  tenantId = profile?.organization_id;
}
```

### Testing Platform Admin
```sql
-- Become platform admin (no organization)
UPDATE profiles
SET role = 'superadmin',
    organization_id = NULL
WHERE email = 'your@email.com';
```

Then access: `http://localhost:3000/admin`

### Testing Tenant Admin
```sql
-- Become tenant admin (with organization)
UPDATE profiles
SET role = 'principal_admin',
    organization_id = (SELECT id FROM organizations WHERE slug = 'young-eagles')
WHERE email = 'your@email.com';
```

Then access: `http://localhost:3000/admin` (will show Young Eagles data)

## Debugging Checklist

### When login fails, check in order:

1. ✅ **User exists in `auth.users`**
   ```sql
   SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'user@example.com';
   ```

2. ✅ **Profile exists and linked**
   ```sql
   SELECT id, email, role, organization_id FROM profiles WHERE email = 'user@example.com';
   ```

3. ✅ **Organization exists** (for tenant admins)
   ```sql
   SELECT id, name, slug FROM organizations WHERE id = 'org-uuid';
   ```

4. ✅ **Role is valid**
   - Platform admin: `superadmin`
   - Tenant admin: `principal_admin`, `principal`, or `admin`

5. ✅ **Middleware sets tenant headers**
   - Check browser DevTools → Network → Request Headers
   - Look for: `x-tenant-id` and `x-organization-slug`

6. ✅ **RLS policies allow access**
   ```sql
   -- Test as specific user
   SET request.jwt.claim.sub = 'user-uuid';
   SELECT * FROM centres WHERE organization_id = 'org-uuid';
   ```

7. ✅ **Google OAuth callback URL** (if using Google Sign-In)
   - Must be: `https://bppuzibjlxgfwrujzfsz.supabase.co/auth/v1/callback`
   - Added to Google Cloud Console

## Quick Fix Commands

### Reset user to platform admin:
```sql
UPDATE profiles
SET role = 'superadmin', organization_id = NULL
WHERE email = 'admin@example.com';
```

### Reset user to tenant admin:
```sql
UPDATE profiles
SET role = 'principal_admin',
    organization_id = (SELECT id FROM organizations WHERE slug = 'your-org-slug')
WHERE email = 'user@example.com';
```

### Create missing profile:
```sql
INSERT INTO profiles (id, email, role, organization_id)
SELECT 
  id,
  email,
  'principal_admin',
  (SELECT id FROM organizations WHERE slug = 'your-org-slug')
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (id) DO UPDATE
SET role = 'principal_admin',
    organization_id = (SELECT id FROM organizations WHERE slug = 'your-org-slug');
```

### Verify organization setup:
```sql
-- Complete org verification query
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.slug,
  o.custom_domain,
  o.domain_verified,
  COUNT(DISTINCT p.id) as user_count,
  COUNT(DISTINCT c.id) as centre_count
FROM organizations o
LEFT JOIN profiles p ON p.organization_id = o.id
LEFT JOIN centres c ON c.organization_id = o.id
WHERE o.slug = 'your-org-slug'
GROUP BY o.id, o.name, o.slug, o.custom_domain, o.domain_verified;
```

## Next Steps

After fixing login issues:

1. **Verify dashboard loads correctly**
   - Check stats display proper counts
   - Verify RLS filters data by organization
   - Test quick actions navigate correctly

2. **Test multi-tenant isolation**
   - Login as different org users
   - Verify each sees only their data
   - Check middleware sets correct tenant headers

3. **Configure custom domain** (optional)
   ```sql
   UPDATE organizations
   SET custom_domain = 'yourdomain.org.za',
       domain_verified = true
   WHERE slug = 'your-org-slug';
   ```

4. **Set up DNS** (if using custom domain)
   - Add CNAME: `yourdomain.org.za` → `edusitepro.vercel.app`
   - Wait for DNS propagation
   - Verify in admin dashboard

## Reference Files

- Middleware: `src/middleware.ts` - Tenant resolution logic
- Admin Dashboard: `src/app/admin/page.tsx` - Data filtering by tenant
- Login Page: `src/app/(auth)/login/page.tsx` - Auth flow
- Multi-domain Docs: `MULTI_DOMAIN_ARCHITECTURE.md` - Complete architecture guide
- Database Check: `check-user-login.sql` - Diagnostic queries
