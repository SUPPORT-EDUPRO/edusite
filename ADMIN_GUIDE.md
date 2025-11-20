# EduSitePro Admin Guide

## 🎯 System Overview

EduSitePro is a multi-tenant SaaS platform for South African ECD centres. As a super admin, you manage:

- **Organizations** - Multi-centre groups (Group 5, Group 10, Enterprise)
- **Centres** - Individual ECD centres (Solo or part of organization)
- **Websites** - Each centre gets its own website and domain
- **Users** - Centre staff with role-based permissions (planned)

---

## 📊 Dashboard Overview

Access: `http://localhost:3002/admin` (or your domain)

### Key Metrics

- **Total Centres** - Count of all active centres
- **Active Pages** - Published content across all centres
- **Total Blocks** - Available content blocks
- **Templates** - NCF-aligned templates

### Quick Actions

- Manage Centres
- Build Pages
- Browse Templates
- Settings

---

## 🏢 Organizations Management

### What is an Organization?

An **Organization** is a billing entity that manages multiple ECD centres under one subscription. Each centre gets its own independent website.

**Example**:

```
Sunshine Learning Centers (Group 5 - R799/mo)
├── Centre 1: Sunshine Pretoria → www.sunshinepta.co.za
├── Centre 2: Sunshine Centurion → www.sunshinecent.co.za
├── Centre 3: Sunshine Midrand → www.sunshinemidrand.co.za
└── Capacity: 2 more centres can be added
```

### Plan Tiers

| Plan           | Max Centres | Monthly Cost | Per Centre Cost | Use Case            |
| -------------- | ----------- | ------------ | --------------- | ------------------- |
| **Group 5**    | 5           | R799         | R160            | Small franchise     |
| **Group 10**   | 10          | R1,499       | R150            | Medium network      |
| **Enterprise** | Unlimited   | Custom       | Negotiated      | Large organizations |

**Note**: Solo plans (R199/mo for 1 centre) are managed directly in the Centres tab.

### Creating an Organization

1. **Navigate**: Admin → Organizations → Create Organization
2. **Fill Required Fields**:
   - **Name**: e.g., "ABC Learning Group"
   - **Slug**: e.g., "abc-learning" (auto-generated, must be unique)
   - **Plan Tier**: Group 5, Group 10, or Enterprise
3. **Optional Fields**:
   - Primary Contact Name/Email/Phone
   - Billing Email (for invoices)
   - Address
4. **System Auto-Sets**:
   - `max_centres` based on plan (5, 10, or 0 for unlimited)
   - `subscription_status` = "trialing" (14-day trial)
5. **Click**: "Create Organization"

### Managing Organizations

**View All**: Admin → Organizations

Shows:

- Organization name and slug
- Plan tier (badge)
- Centre usage (e.g., "3/5")
- Subscription status (active, trialing, past_due, etc.)
- Account status

**Edit Organization**: Click "Edit" on any organization

You can:

- ✅ Update contact information
- ✅ Change plan tier (upgrade/downgrade with validation)
- ✅ Update billing email
- ✅ View list of centres
- ✅ Delete (only if no centres)

**Plan Changes**:

- **Upgrade**: Immediate - new capacity available
- **Downgrade**: Requires centre count ≤ target plan limit
  - Example: Can't downgrade from Group 10 → Group 5 if you have 7 centres

---

## 🏫 Centres Management

### What is a Centre?

A **Centre** is an individual ECD centre with its own:

- ✅ Website (subdomain or custom domain)
- ✅ Pages and content
- ✅ Contact information
- ✅ Branding (logo, colors)
- ✅ Staff and programs

### Creating a Centre

#### Solo Centre (R199/mo)

1. **Navigate**: Admin → Centres → Create Centre
2. **Fill Required Fields**:
   - Centre Name: "Little Stars Montessori"
   - Slug: "little-stars"
   - Organization: Create implicit solo organization
3. **System Creates**:
   - Centre with default subdomain: `little-stars.sites.edusitepro.co.za`
   - Solo organization for billing

#### Centre in a Group Organization

1. **Navigate**: Admin → Centres → Create Centre
2. **Select Organization**: Choose from dropdown (shows capacity)
   - Example: "ABC Learning (Group 5) - 3/5 centres used"
3. **Fill Centre Details**:
   - Centre Name: "ABC Learning Pretoria"
   - Slug: "abc-pretoria"
   - Contact info (optional)
4. **System Validates**:
   - Checks organization hasn't reached centre limit
   - Creates centre and links to organization
   - Website available at: `abc-pretoria.sites.edusitepro.co.za`

### Managing Centres

**View All**: Admin → Centres

Shows:

- Centre name and slug
- Default/custom domain
- Status (active, suspended, archived)
- Plan tier (from parent organization)

**Edit Centre**: Click "Edit" on any centre

You can:

- ✅ Update centre details
- ✅ Change organization (future)
- ✅ Set custom domain
- ✅ Update contact info
- ✅ Delete centre (removes from organization count)

### Custom Domains

Each centre can have a custom domain:

1. **Edit Centre**: Set "Primary Domain" field
2. **Verify Domain**: Add DNS record (CNAME)
3. **Configure in Vercel**: Add domain to project
4. **Status**: Updates from "pending" → "verified"

---

## 🎨 Building Centre Websites

### Page Builder

**Access**: Admin → Page Builder

1. **Select Page**: Choose from left sidebar or create new
2. **Add Blocks**: Drag blocks from library
   - Hero, Gallery, ContactCTA, Programs, Staff, etc.
3. **Edit Props**: Click block → edit in right panel
4. **Reorder**: Drag blocks up/down or use arrows
5. **Save**: Auto-saves every 2 seconds
6. **Publish**: Click "Publish" to make live

### Available Blocks (10 total)

- **Hero**: Header with image, title, CTA
- **RichText**: Formatted text content
- **ContactCTA**: Contact form and info
- **ProgramGrid**: Display programmes
- **StaffCards**: Staff profiles
- **Testimonials**: Parent reviews
- **Gallery**: Photo gallery
- **Stats**: Key metrics
- **Features**: Feature highlights
- **FeesTable**: Pricing table

### Templates

6 NCF-aligned templates available:

1. Well-being Focus
2. Identity & Belonging
3. Communication
4. Mathematics
5. Creativity & Imagination
6. Knowledge & Understanding

**Use Template**: Admin → Browse Templates → Select → Apply to Centre

---

## 💰 Billing & Subscriptions

### Subscription Lifecycle

```
Day 1: Organization created
       ↓ subscription_status = "trialing"
       ↓ trial_end_date = +14 days

Day 14: Trial ends
        ↓ Prompt for payment
        ↓ If paid → "active"
        ↓ If unpaid → "past_due"

Day 21: Grace period ends
        ↓ status = "canceled"
        ↓ Centres become read-only
```

### Subscription Statuses

| Status        | Meaning            | Actions                          |
| ------------- | ------------------ | -------------------------------- |
| **active**    | Paid and current   | Full access                      |
| **trialing**  | Free trial         | Full access                      |
| **past_due**  | Payment failed     | Limited access, payment required |
| **canceled**  | Subscription ended | Read-only                        |
| **suspended** | Admin suspended    | No access                        |

### Manual Status Changes

As super admin, you can:

1. **Edit Organization** → Change "Status" field
2. Options: active, suspended, archived

**Use Cases**:

- **Suspend**: Non-payment, policy violation
- **Archive**: Closed permanently

---

## 🔐 User Management & RBAC (Planned)

### Current State

- Single super admin account (you)
- All centres managed by super admin

### Planned User Roles

#### Super Admin (You)

- **Access**: Everything across all organizations and centres
- **Can**:
  - Create/edit/delete any organization
  - Create/edit/delete any centre
  - Manage all users
  - Configure platform settings
  - View all analytics

#### Organization Admin

- **Access**: All centres within their organization
- **Can**:
  - View/edit organization details
  - Add/remove centres (within limit)
  - Manage organization users
  - View organization analytics
  - Cannot: Delete organization, change plan without approval

#### Centre Admin

- **Access**: Specific centre(s) assigned to them
- **Can**:
  - Edit centre details
  - Build/edit pages
  - Upload media
  - View centre analytics
  - Cannot: Delete centre, change organization

#### Editor

- **Access**: Specific centre(s), limited permissions
- **Can**:
  - Edit pages and content
  - Upload media
  - Cannot: Change centre settings, delete pages

#### Viewer

- **Access**: Read-only to specific centre(s)
- **Can**:
  - View pages and analytics
  - Cannot: Edit anything

### Implementing User Management

**Database Tables Needed** (from existing migration):

```sql
-- cms_users table
CREATE TABLE cms_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- memberships table (links users to centres/orgs)
CREATE TABLE memberships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES cms_users(id),
  centre_id UUID REFERENCES centres(id),
  organization_id UUID REFERENCES organizations(id),
  role VARCHAR(50) CHECK (role IN (
    'super_admin', 'org_admin', 'centre_admin', 'editor', 'viewer'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### How to Add Users (When Implemented)

1. **Super Admin Creates User**:

   ```
   Admin → Users → Create User
   - Email: john@abclearning.co.za
   - Name: John Smith
   - Role: Centre Admin
   - Assign to: ABC Learning Pretoria
   ```

2. **User Receives Email**:
   - Invitation link
   - Set password
   - Login to portal

3. **User Access**:
   - Sees only assigned centres
   - Can only perform actions allowed by role

### Implementation Priority

**Phase 1: Basic Auth** (Next)

- [ ] Supabase Auth setup
- [ ] User registration/login
- [ ] Role assignment

**Phase 2: RBAC** (After)

- [ ] Permission checks in middleware
- [ ] Role-based UI rendering
- [ ] Audit logging

**Phase 3: Self-Service** (Future)

- [ ] Customer portal (portal.edusitepro.co.za)
- [ ] Centre admins can manage their own content
- [ ] Organization admins can add centres

---

## 📈 Analytics & Reporting

### Current Metrics

**Dashboard**:

- Centre count by plan
- Total pages published
- Block usage

### Planned Analytics

**Organization Level**:

- Centre performance comparison
- Aggregate traffic across centres
- Lead conversion rates
- Revenue by plan tier

**Centre Level**:

- Page views and unique visitors
- Form submissions
- Top pages
- Traffic sources

**Implementation**: PostHog, Vercel Analytics, custom dashboards

---

## 🛠️ Common Admin Tasks

### Add a Multi-Centre Organization

1. Admin → Organizations → Create
2. Name: "Sunshine Learning Centers"
3. Plan: Group 5
4. Fill contact info
5. Create → Organization ready with 0/5 centres

### Add Centres to Organization

Repeat for each location:

1. Admin → Centres → Create
2. Select Organization: "Sunshine Learning Centers"
3. Centre Name: "Sunshine Pretoria"
4. Slug: "sunshine-pretoria"
5. Create → Website available at `sunshine-pretoria.sites.edusitepro.co.za`

### Upgrade Organization Plan

1. Admin → Organizations → Edit [organization]
2. Change Plan Tier: Group 5 → Group 10
3. System updates: max_centres = 10
4. Can now add 5 more centres

### Handle Non-Payment

1. Admin → Organizations → Edit [organization]
2. View subscription_status (past_due, canceled)
3. Options:
   - Contact customer for payment
   - Suspend: Change status to "suspended"
   - Grace period: Leave as "past_due"

### Migrate Centre Between Organizations

(Manual process for now):

1. Note current centre details
2. Create new centre in target organization
3. Copy content/pages
4. Delete old centre
5. Update DNS

---

## 🔧 Technical Operations

### Database Access

**Via Supabase Dashboard**:

- URL: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz
- SQL Editor for queries
- Table Editor for data

**Via CLI** (connection pooler):

```bash
psql -h aws-0-ap-southeast-1.pooler.supabase.com \
     -p 6543 \
     -U postgres.bppuzibjlxgfwrujzfsz \
     -d postgres
```

### Common Queries

**Check organization capacity**:

```sql
SELECT
  o.name,
  o.plan_tier,
  o.max_centres,
  COUNT(c.id) as centre_count
FROM organizations o
LEFT JOIN centres c ON o.id = c.organization_id
WHERE o.plan_tier != 'solo'
GROUP BY o.id
ORDER BY o.created_at DESC;
```

**Monthly revenue**:

```sql
SELECT
  plan_tier,
  COUNT(*) as orgs,
  CASE plan_tier
    WHEN 'group_5' THEN 799
    WHEN 'group_10' THEN 1499
    ELSE 0
  END as monthly_price,
  COUNT(*) * CASE plan_tier
    WHEN 'group_5' THEN 799
    WHEN 'group_10' THEN 1499
    ELSE 0
  END as mrr
FROM organizations
WHERE subscription_status IN ('active', 'trialing')
  AND plan_tier != 'solo'
GROUP BY plan_tier;
```

### Backup & Recovery

**Supabase automatic backups**:

- Daily backups (7-day retention)
- Point-in-time recovery

**Manual backup**:

```bash
pg_dump -h ... -U ... > backup.sql
```

---

## 📚 Additional Documentation

- **ORGANIZATIONS_FEATURE.md** - Technical details
- **ORGANIZATIONS_WORKFLOW.md** - Detailed workflows
- **ORGANIZATIONS_QUICKSTART.md** - Quick start guide
- **WARP.md** - Development guide

---

## 🆘 Support & Troubleshooting

### Common Issues

**Can't create centre - limit reached**:

- Check organization plan and current usage
- Upgrade plan or archive centres

**Domain not working**:

- Verify DNS CNAME record
- Check domain verification status
- Wait for DNS propagation (up to 48 hours)

**User can't login**:

- Verify email confirmation
- Check user role assignment
- Reset password via Supabase Auth

### Getting Help

**Internal**:

- Check `SYSTEM_DOCUMENTATION.md`
- Review error logs in Vercel
- Check Supabase logs

**External**:

- Supabase Community
- Next.js Documentation
- Vercel Support

---

**Last Updated**: 2025-10-26  
**System Version**: v0.1.0
