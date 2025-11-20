# 🔐 Security Architecture - Admin Access & Multi-Tenancy

## Overview

EduSitePro has **two completely separate areas**:
1. **Public Area** - No authentication (registration forms, landing pages)
2. **Admin Area** - Secure authentication required

---

## 🌍 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     PUBLIC AREA                              │
│                  (No Login Required)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  youngeagles.org.za                                         │
│       ↓                                                      │
│  [Register Button]                                          │
│       ↓                                                      │
│  edusitepro.edudashpro.org.za/register                     │
│  edusitepro.edudashpro.org.za/young-eagles (landing)       │
│                                                              │
│  ✅ Anyone can access                                       │
│  ✅ No login needed                                         │
│  ✅ Parents fill forms                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     ADMIN AREA                               │
│              (Authentication Required)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  edusitepro.edudashpro.org.za/admin                        │
│       ↓                                                      │
│  🔒 Login Required (Supabase Auth)                          │
│       ↓                                                      │
│  Check user_organizations table                             │
│       ↓                                                      │
│  Show ONLY their organization's data (RLS)                  │
│                                                              │
│  ❌ Must be logged in                                       │
│  ❌ Must have organization access                           │
│  ❌ Can only see their own data                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 How Admin Access Works

### Step 1: Admin Gets Credentials

**When school signs up for EduSitePro:**

```sql
-- 1. Create organization
INSERT INTO organizations (name, slug) 
VALUES ('Young Eagles Preschool', 'young-eagles');

-- 2. Create admin user (via Supabase Auth)
-- This happens through signup flow or invite email

-- 3. Link user to organization
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  'user-uuid-from-supabase-auth',
  'org-uuid-from-step-1',
  'admin'
);
```

**Admin receives email:**
```
Subject: Welcome to EduSitePro - Young Eagles Preschool

Your admin account has been created!

Email: admin@youngeagles.org.za
Temporary Password: [auto-generated]

Login here: https://edusitepro.edudashpro.org.za/login

Please change your password on first login.
```

---

### Step 2: Admin Logs In

**Login Flow:**

```
1. Admin visits: edusitepro.edudashpro.org.za/login
   
2. Enters credentials:
   - Email: admin@youngeagles.org.za
   - Password: [their password]

3. System checks:
   ✓ Valid email/password (Supabase Auth)
   ✓ User exists in user_organizations table
   ✓ Has role (admin, principal, staff)

4. If valid:
   → Redirect to /admin/dashboard
   → Session created (JWT token in cookie)
   → RLS policies activate (only see their org data)

5. If invalid:
   → Show error message
   → Stay on login page
```

---

### Step 3: Row-Level Security (RLS) Enforces Data Isolation

**Database automatically filters data:**

```sql
-- When admin queries marketing_campaigns
SELECT * FROM marketing_campaigns;

-- RLS policy adds automatic WHERE clause:
SELECT * FROM marketing_campaigns
WHERE organization_id IN (
  SELECT organization_id 
  FROM user_organizations 
  WHERE user_id = auth.uid()  -- Logged-in user
);

-- Result: Admin only sees THEIR campaigns, not other schools'
```

**This happens automatically on EVERY query!**

---

## 🛡️ Security Layers

### Layer 1: Authentication (Supabase Auth)
```
✅ Email/password authentication
✅ JWT tokens (httpOnly cookies)
✅ Session management
✅ Password hashing (bcrypt)
✅ Password reset flows
✅ Email verification
```

### Layer 2: Authorization (user_organizations table)
```sql
-- Who has access to which organization
CREATE TABLE user_organizations (
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  role VARCHAR(50), -- 'admin', 'principal', 'teacher', 'staff'
  created_at TIMESTAMP DEFAULT NOW()
);

-- One user can belong to multiple organizations
-- Each organization can have multiple users
```

### Layer 3: Row-Level Security (RLS)
```sql
-- Every table has RLS enabled
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their organization's data
CREATE POLICY "Users see own org campaigns"
ON marketing_campaigns FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);
```

### Layer 4: Application-Level Guards
```typescript
// Admin layout checks authentication before rendering
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  redirect('/login'); // Not logged in
}

// Check organization access
const { data: userOrgs } = await supabase
  .from('user_organizations')
  .select('organization_id, role')
  .eq('user_id', session.user.id);

if (!userOrgs || userOrgs.length === 0) {
  return <AccessDenied />; // No organization access
}
```

---

## 🎯 Real Example: Young Eagles Admin

### Scenario: Principal Logs In

**Step-by-Step:**

1. **Principal visits:** `edusitepro.edudashpro.org.za/admin`
2. **Redirected to:** `/login` (not authenticated)
3. **Enters credentials:**
   - Email: `principal@youngeagles.org.za`
   - Password: `SecurePassword123!`
4. **System verifies:**
   - ✅ Email/password correct (Supabase Auth)
   - ✅ User linked to Young Eagles org
   - ✅ Role: `admin`
5. **Redirected to:** `/admin/dashboard`
6. **Dashboard queries:**
   ```sql
   SELECT * FROM marketing_campaigns;
   ```
7. **RLS automatically adds:**
   ```sql
   WHERE organization_id = 'young-eagles-org-id'
   ```
8. **Principal sees:**
   - Only Young Eagles campaigns
   - Only Young Eagles registrations
   - Only Young Eagles payments
   - Only Young Eagles classes

**Principal CANNOT see:**
- ❌ Other schools' data
- ❌ Other schools' campaigns
- ❌ Other schools' students
- ❌ Other schools' anything

**Database enforces this at the SQL level!**

---

## 🚪 Access Control Matrix

| User Type | Can Access Public? | Can Access Admin? | Can See Other Orgs? |
|-----------|-------------------|-------------------|---------------------|
| **Public (Parents)** | ✅ Yes | ❌ No | ❌ No |
| **Logged-in Admin** | ✅ Yes | ✅ Yes | ❌ No (only own org) |
| **Super-Admin** | ✅ Yes | ✅ Yes | ✅ Yes (all orgs) |

---

## 🔐 No Button on Public Site Needed

**Important:** Schools do NOT put admin button on public website!

**❌ WRONG:**
```
youngeagles.org.za
  [Register] [Admin Login] ← Don't do this!
```

**✅ CORRECT:**
```
youngeagles.org.za
  [Register for 2026] ← Only public action

Admins know to go directly to:
  edusitepro.edudashpro.org.za/admin
```

**Why?**
- Cleaner user experience for parents
- Admins remember their admin URL
- No confusion between public/admin
- Better security (don't advertise admin access)

---

## 🎓 Admin URL Options

### Option 1: Direct Admin URL (Recommended)
```
https://edusitepro.edudashpro.org.za/admin
```
**Admin bookmarks this URL**

### Option 2: Organization-Specific (Future)
```
https://edusitepro.edudashpro.org.za/admin/young-eagles
```
**Auto-selects organization if user has multiple**

### Option 3: Custom Subdomain (Enterprise)
```
https://young-eagles.edusitepro.org.za/admin
```
**White-label branding**

---

## 🔒 Password Security

### Requirements
```javascript
Minimum 8 characters
At least 1 uppercase letter
At least 1 lowercase letter
At least 1 number
At least 1 special character
```

### Password Reset Flow
```
1. Admin clicks "Forgot Password" on login page
2. Enters email: admin@youngeagles.org.za
3. Receives reset link email
4. Clicks link (valid for 1 hour)
5. Sets new password
6. Redirected to login
```

### Two-Factor Authentication (Optional)
```
Future enhancement:
- SMS verification
- Authenticator app (Google Authenticator)
- Email code verification
```

---

## 📊 Audit Trail

**Every admin action is logged:**

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(100), -- 'create_campaign', 'approve_payment', etc.
  resource_type VARCHAR(50), -- 'campaign', 'payment', etc.
  resource_id UUID,
  changes JSONB, -- Before/after values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example log entry:**
```json
{
  "user_id": "admin-user-uuid",
  "organization_id": "young-eagles-uuid",
  "action": "create_campaign",
  "resource_type": "campaign",
  "resource_id": "campaign-uuid",
  "changes": {
    "name": "Early Bird 2026",
    "discount_value": 20,
    "promo_code": "EARLYBIRD2026"
  },
  "ip_address": "102.65.123.45",
  "created_at": "2025-11-16T10:30:00Z"
}
```

---

## 🎯 Common Scenarios

### Scenario 1: New Admin Gets Access

```
1. EduSitePro team creates account:
   - Email: newadmin@youngeagles.org.za
   - Sends invite email with temp password

2. Admin receives email:
   Subject: You've been invited to EduSitePro
   
   Click here to set your password:
   https://edusitepro.edudashpro.org.za/invite/[token]

3. Admin clicks link, sets password

4. Admin can now login at:
   https://edusitepro.edudashpro.org.za/login

5. RLS automatically shows only Young Eagles data
```

### Scenario 2: Admin Forgets Password

```
1. Admin goes to login page
2. Clicks "Forgot Password?"
3. Enters email: admin@youngeagles.org.za
4. Receives reset email
5. Clicks link, sets new password
6. Logs in successfully
```

### Scenario 3: Admin Tries to Access Another School's Data

```
1. Admin logged in as Young Eagles
2. Tries to manually visit:
   /admin/campaigns?org_id=other-school-uuid

3. Query runs:
   SELECT * FROM campaigns WHERE id = 'other-school-campaign'

4. RLS policy blocks it:
   - User's org = Young Eagles
   - Campaign's org = Other School
   - No match → Returns empty result

5. Admin sees: "Campaign not found" or empty list
```

---

## 🚀 Setup for New School

**When onboarding new organization:**

```sql
-- 1. Create organization
INSERT INTO organizations (name, slug, registration_open)
VALUES ('New School', 'new-school', true)
RETURNING id;

-- 2. Admin creates account via signup page
-- (Supabase Auth handles this)

-- 3. Link user to organization
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES (
  '[user-uuid-from-signup]',
  '[org-uuid-from-step-1]',
  'admin'
);

-- 4. Done! Admin can now:
-- - Login at /login
-- - Manage campaigns
-- - Configure settings
-- - View registrations
-- - All isolated to their organization
```

---

## 🔐 Security Checklist

### ✅ Implemented
- [x] Supabase Auth (email/password)
- [x] JWT session management
- [x] Row-Level Security (RLS)
- [x] user_organizations authorization
- [x] Admin layout authentication guard
- [x] Password hashing (automatic via Supabase)
- [x] HTTPS encryption (via Vercel)
- [x] Multi-tenant data isolation

### 🔜 Coming Soon
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging
- [ ] IP whitelisting (enterprise)
- [ ] Session timeout configuration
- [ ] Role-based permissions (fine-grained)
- [ ] Failed login attempt tracking
- [ ] Security alerts

---

## 📞 Support

**For Admins:**
- Forgot password: Self-service via login page
- Account issues: support@edusitepro.org.za
- Security concerns: security@edusitepro.org.za

**For EduSitePro Team:**
- User management: Supabase dashboard
- Organization setup: SQL scripts
- Access control: user_organizations table

---

## Summary: No Button Needed on Public Site!

**Public Site (youngeagles.org.za):**
- ✅ Register button → Registration form
- ❌ NO admin button

**Admin Access (Direct URL):**
- 🔒 https://edusitepro.edudashpro.org.za/admin
- 🔒 Requires login
- 🔒 Shows only their org data
- 🔒 Database-level security (RLS)

**Security is handled by:**
1. Authentication (must login)
2. Authorization (user_organizations table)
3. RLS (automatic data filtering)
4. Application guards (layout checks)

**Admins simply:**
1. Bookmark admin URL
2. Login when needed
3. Manage their school
4. Logout when done

**No public-facing admin access needed! 🎉**
