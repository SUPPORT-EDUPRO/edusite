# Organizations Workflow Guide

## 🎯 Overview

This guide walks you through managing multi-centre organizations in EduSitePro Admin.

## 📋 Table of Contents

1. [Understanding Organizations](#understanding-organizations)
2. [Creating an Organization](#creating-an-organization)
3. [Adding Centres to an Organization](#adding-centres-to-an-organization)
4. [Managing Organizations](#managing-organizations)
5. [Plan Upgrades & Downgrades](#plan-upgrades--downgrades)
6. [Billing & Subscriptions](#billing--subscriptions)

---

## Understanding Organizations

### What is an Organization?

An **Organization** is a billing entity that can manage one or multiple ECD centres under a single subscription.

### Plan Tiers

| Plan           | Max Centres | Monthly Cost | Use Case                      |
| -------------- | ----------- | ------------ | ----------------------------- |
| **Solo**       | 1           | R199         | Single independent ECD centre |
| **Group 5**    | 5           | R799         | Small franchise (R160/centre) |
| **Group 10**   | 10          | R1,499       | Medium network (R150/centre)  |
| **Enterprise** | Unlimited   | Custom       | Large organizations           |

### Hierarchy Structure

```
Organization: ABC Learning Group (Group 10)
├── Centre 1: ABC Learning Pretoria
│   ├── Pages: Home, About, Programs, Contact
│   ├── Domain: abc-pretoria.sites.edusitepro.co.za
│   └── Status: Active
├── Centre 2: ABC Learning Johannesburg
│   ├── Pages: Home, About, Programs
│   ├── Domain: abc-joburg.sites.edusitepro.co.za
│   └── Status: Active
└── Centre 3: ABC Learning Cape Town
    ├── Pages: Home, About
    ├── Domain: abc-capetown.sites.edusitepro.co.za
    └── Status: Draft
```

---

## Creating an Organization

### Step 1: Navigate to Organizations

1. Log in to Admin: `http://localhost:3002/admin`
2. Click **"Organizations"** in the left sidebar (🏢)
3. Click **"Create Organization"** button

### Step 2: Fill in Organization Details

#### Required Fields:

- **Organization Name**: e.g., "ABC Learning Group"
- **Slug**: Auto-generated from name (e.g., "abc-learning-group")
  - Used in URLs and identifiers
  - Must be lowercase, numbers, and hyphens only
- **Plan Tier**: Select from dropdown
  - Solo (1 centre)
  - Group 5 (5 centres)
  - Group 10 (10 centres)
  - Enterprise (unlimited)

#### Optional Fields:

- **Primary Contact Name**: Person responsible for account
- **Primary Contact Email**: Main contact email
- **Primary Contact Phone**: Contact number with country code
- **Billing Email**: Separate email for invoices (if different)
- **Address**: Physical/postal address for billing

#### Subscription Fields (Admin Only):

- **Subscription Status**: active, trialing, past_due, canceled, suspended
- **Trial End Date**: If on trial period
- **Subscription Start/End Dates**: Billing cycle dates

### Step 3: Save & Verify

1. Click **"Create Organization"**
2. System automatically sets `max_centres` based on plan:
   - Solo → 1
   - Group 5 → 5
   - Group 10 → 10
   - Enterprise → 0 (unlimited)
3. Organization appears in the list

### Example: Creating a Group 5 Organization

```
Organization Name: Sunshine Learning Centers
Slug: sunshine-learning  (auto-generated)
Plan Tier: Group 5
Max Centres: 5 (auto-set)
Primary Contact: Sarah Johnson
Email: sarah@sunshinelearning.co.za
Phone: +27 82 123 4567
Status: Active
Subscription Status: Trialing (14-day trial)
```

---

## Adding Centres to an Organization

### Step 1: Navigate to Centres

1. Go to **Admin → Centres**
2. Click **"Create Centre"**

### Step 2: Select Parent Organization

1. **Organization Dropdown**: Shows all active organizations
   - Displays: Name, Plan, Centres Used/Max
   - Example: "ABC Learning Group (Group 10) - 3/10 centres"
2. If organization is at limit, it will be disabled with message:
   ```
   ❌ ABC Learning Group - Limit Reached (5/5 centres)
   ```

### Step 3: Fill in Centre Details

- **Centre Name**: e.g., "ABC Learning Pretoria"
- **Slug**: e.g., "abc-pretoria"
- **Contact Info**: Centre-specific contact details
- **Status**: active, suspended, archived

### Step 4: Automatic Validation

When you click "Create Centre", the system:

1. Checks organization's centre limit
2. If limit reached → Shows error:
   ```
   ❌ Centre limit reached.
   Organization can have maximum 5 centres (current: 5)
   ```
3. If under limit → Creates centre and links to organization

### Example Workflow: Adding 3 Centres to Group 5

```
1. Create Organization: "Little Stars Network" (Group 5)
   → max_centres = 5

2. Add Centre 1: "Little Stars Pretoria"
   → Centre count: 1/5 ✅

3. Add Centre 2: "Little Stars Johannesburg"
   → Centre count: 2/5 ✅

4. Add Centre 3: "Little Stars Cape Town"
   → Centre count: 3/5 ✅
   → Remaining: 2 centres

5. Try to add 6th centre → ❌ Error: Limit reached
```

---

## Managing Organizations

### Viewing Organization Details

1. Go to **Admin → Organizations**
2. Click **"Edit"** next to any organization

### Information Displayed:

- **Organization Name & Slug**
- **Plan Tier** with colored badge
- **Centre Usage**: "3 / 5" with progress indicator
- **Subscription Status**: active, trialing, past_due, etc.
- **Account Status**: active, suspended, archived
- **Billing Information**
- **List of Centres** under this organization

### Editing an Organization

1. Update organization details
2. **Cannot change plan tier directly** (see Plan Upgrades below)
3. Can update contact info, billing email, address
4. Can suspend/reactivate organization

### Viewing Organization's Centres

```
Organization: ABC Learning Group
├── Centres (3):
│   ├── ABC Learning Pretoria
│   │   Status: Active | Pages: 5 | Domain: abc-pretoria.sites...
│   ├── ABC Learning Johannesburg
│   │   Status: Active | Pages: 3 | Domain: abc-joburg.sites...
│   └── ABC Learning Cape Town
│       Status: Draft | Pages: 0 | Domain: abc-capetown.sites...
```

---

## Plan Upgrades & Downgrades

### Upgrading from Solo to Group 5

**Scenario**: Centre grows and wants to open additional locations

1. Go to **Admin → Organizations**
2. Click organization → **"Edit"**
3. Change **Plan Tier**: Solo → Group 5
4. System updates:
   - `plan_tier` = 'group_5'
   - `max_centres` = 5
5. Organization can now add 4 more centres

**Billing**: Pro-rated charge for upgrade

### Upgrading from Group 5 to Group 10

**Scenario**: Franchise expanding beyond 5 locations

1. Edit organization
2. Change **Plan Tier**: Group 5 → Group 10
3. System updates `max_centres` = 10
4. Can now add 5 more centres

**Billing**: Pro-rated upgrade (R799 → R1,499)

### Upgrading to Enterprise

**Scenario**: Large organization with 10+ centres

1. Contact sales team (manual process)
2. Custom pricing negotiated
3. Admin sets **Plan Tier**: Enterprise
4. `max_centres` = 0 (unlimited)
5. Additional features unlocked:
   - White-label branding
   - API access
   - Dedicated support
   - Custom integrations

### Downgrading (Requires Manual Intervention)

**Scenario**: Organization wants to reduce from Group 10 → Group 5

**Problem**: Already has 7 centres, but Group 5 max is 5

**Solution**:

1. Organization must archive/delete 2 centres first
2. Once centre count ≤ 5, can downgrade
3. System validates before allowing plan change

---

## Billing & Subscriptions

### Subscription Statuses

| Status        | Meaning            | Actions Available                |
| ------------- | ------------------ | -------------------------------- |
| **active**    | Paid and current   | Full access                      |
| **trialing**  | Free trial period  | Full access, upgrade prompt      |
| **past_due**  | Payment failed     | Limited access, payment required |
| **canceled**  | Subscription ended | Read-only access                 |
| **suspended** | Admin suspended    | No access                        |

### Trial Period Flow

```
Day 1: Organization created
       → subscription_status = 'trialing'
       → trial_end_date = +14 days
       → Full access to all features

Day 14: Trial ends
        → Prompt for payment
        → If paid → status = 'active'
        → If unpaid → status = 'past_due'

Day 21: Grace period ends (if past_due)
        → status = 'canceled'
        → Centres become read-only
```

### Payment Webhook Flow

```
1. User submits payment (Stripe/Paystack)
2. Payment processor sends webhook
3. EduSitePro receives webhook:
   POST /api/webhooks/payment
   {
     "organization_id": "...",
     "amount": 799,
     "status": "success"
   }
4. Update organization:
   - subscription_status = 'active'
   - subscription_start_date = NOW()
   - subscription_end_date = +30 days
5. Send confirmation email
```

### Invoice Generation

**Monthly billing cycle**:

1. System checks `subscription_end_date`
2. If approaching end date (7 days before):
   - Generate invoice
   - Send to `billing_email`
3. If payment succeeds:
   - Extend subscription by 30 days
4. If payment fails:
   - status → 'past_due'
   - Retry after 3 days
   - Send reminder emails

---

## Admin Dashboard Views

### Organizations List

```
╔════════════════════════════════════════════════════════════════╗
║ Organizations                                                  ║
╠════════════════════════════════════════════════════════════════╣
║ Organization           Plan     Centres  Subscription  Status ║
║────────────────────────────────────────────────────────────────║
║ ABC Learning Group     Group 10  3/10    Active       Active  ║
║ Sunshine Centers       Group 5   5/5     Active       Active  ║
║ Little Stars Network   Solo      1/1     Trialing     Active  ║
║ Big Dreams ECD         Group 5   2/5     Past Due     Suspend ║
╚════════════════════════════════════════════════════════════════╝
```

### Plan Summary Cards

```
┌─────────────┬─────────────┬─────────────┬──────────────┐
│ Solo Plans  │ Group 5     │ Group 10    │ Enterprise   │
│     15      │      8      │      3      │      1       │
│ R199/mo ea  │ R799/mo ea  │ R1,499/mo   │ Custom       │
└─────────────┴─────────────┴─────────────┴──────────────┘
```

---

## Quick Reference

### Centre Limit Enforcement

**Database Trigger** automatically validates:

```sql
-- When creating a new centre
IF org.max_centres > 0 AND current_count >= org.max_centres THEN
  RAISE EXCEPTION 'Centre limit reached'
END IF
```

### Checking Available Slots

```typescript
// In UI
const remainingSlots = org.max_centres === 0 ? Infinity : org.max_centres - org.centre_count;

if (remainingSlots === 0) {
  // Disable "Add Centre" button
  // Show upgrade prompt
}
```

### Common Scenarios

**Scenario 1: Solo Centre Wants to Add Second Location**

1. Current: Solo plan (1 centre)
2. Action: Upgrade to Group 5
3. Result: Can add 4 more centres

**Scenario 2: Group 5 at Capacity**

1. Current: 5/5 centres used
2. Action: Try to add 6th centre → ❌ Blocked
3. Solution: Upgrade to Group 10

**Scenario 3: Downgrade with Too Many Centres**

1. Current: Group 10 with 7 centres
2. Want: Downgrade to Group 5
3. Problem: 7 > 5 centres
4. Solution: Archive 2 centres first, then downgrade

---

## Database Queries

### Find organizations at limit:

```sql
SELECT o.name, o.plan_tier, o.max_centres, COUNT(c.id) as centre_count
FROM organizations o
LEFT JOIN centres c ON o.id = c.organization_id
GROUP BY o.id
HAVING COUNT(c.id) >= o.max_centres AND o.max_centres > 0;
```

### List all centres by organization:

```sql
SELECT
  o.name as org_name,
  o.plan_tier,
  c.name as centre_name,
  c.slug,
  c.status
FROM organizations o
LEFT JOIN centres c ON o.id = c.organization_id
ORDER BY o.name, c.name;
```

### Monthly revenue report:

```sql
SELECT
  plan_tier,
  COUNT(*) as org_count,
  CASE plan_tier
    WHEN 'solo' THEN 199
    WHEN 'group_5' THEN 799
    WHEN 'group_10' THEN 1499
    ELSE 0
  END as monthly_price,
  COUNT(*) * CASE plan_tier
    WHEN 'solo' THEN 199
    WHEN 'group_5' THEN 799
    WHEN 'group_10' THEN 1499
    ELSE 0
  END as total_mrr
FROM organizations
WHERE subscription_status = 'active'
GROUP BY plan_tier;
```

---

## Troubleshooting

### Problem: Can't add centre - limit reached

**Solution**: Check organization plan tier and upgrade if needed

### Problem: Organization shows 0/5 centres but won't let me add more

**Cause**: Archived centres still count toward limit
**Solution**: Query shows only active centres, but trigger counts all non-archived

### Problem: Downgrade blocked

**Cause**: Too many centres for target plan
**Solution**: Archive centres until count ≤ target plan's max_centres

---

## Next Steps

- [ ] Implement payment integration (Stripe/Paystack)
- [ ] Build organization billing dashboard
- [ ] Add usage analytics per organization
- [ ] Create customer-facing organization portal
- [ ] Implement plan upgrade/downgrade UI
- [ ] Add email notifications for billing events
- [ ] Build organization admin role (can manage all their centres)

---

**Need Help?** Contact support or check the main documentation in `ORGANIZATIONS_FEATURE.md`
