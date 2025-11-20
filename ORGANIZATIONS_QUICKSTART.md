# Organizations Quick Start Guide

## ✅ What's Complete

The multi-centre organizations feature is now fully functional!

### Database

- ✅ `organizations` table created
- ✅ `centres.organization_id` foreign key added
- ✅ Automatic centre limit enforcement via triggers
- ✅ Existing centres migrated to implicit organizations

### Admin UI

- ✅ Organizations list at `/admin/organizations`
- ✅ Create organization form at `/admin/organizations/new`
- ✅ Plan summary cards showing counts
- ✅ Navigation links in sidebar

## 🚀 Try It Now

### 1. View Organizations

```
http://localhost:3002/admin/organizations
```

You'll see:

- 2 existing organizations (both Solo plans)
- Plan summary cards (Solo, Group 5, Group 10, Enterprise counts)
- Table with organization details

### 2. Create a New Organization

**Example: Group 5 Franchise**

1. Click "Create Organization"
2. Fill in:
   - **Name**: Sunshine Learning Centers
   - **Slug**: sunshine-learning
   - **Plan**: Group 5 - R799/month (5 centres)
   - **Contact**: Sarah Johnson
   - **Email**: sarah@sunshinelearning.co.za
   - **Phone**: +27 82 123 4567
3. Click "Create Organization"

**Result**:

- Organization created with `max_centres = 5`
- Subscription status = "trialing" (14-day free trial)
- Can now add up to 5 centres

### 3. Add Centres to Organization

_Note: Centre creation form needs to be updated to select organization_

**Coming next**: Update the centre creation form to:

1. Show dropdown of available organizations
2. Display: "ABC Learning (Group 10) - 3/10 centres used"
3. Disable organizations at capacity
4. Validate against limit before creation

## 💰 Pricing Clarification

### Per Organization (NOT per centre)

| Plan       | Monthly Cost | Max Centres | Effective Cost per Centre  |
| ---------- | ------------ | ----------- | -------------------------- |
| Solo       | R199         | 1           | R199/centre                |
| Group 5    | R799         | 5           | R160/centre (20% discount) |
| Group 10   | R1,499       | 10          | R150/centre (25% discount) |
| Enterprise | Custom       | Unlimited   | Negotiated                 |

### Examples

**Example 1: Solo Plan**

- Organization: Little Stars Montessori
- Plan: Solo (R199/mo)
- Centres: 1 (Little Stars)
- **Total Monthly Cost**: R199

**Example 2: Group 5 Plan**

- Organization: ABC Learning Group
- Plan: Group 5 (R799/mo)
- Centres: 3 active
  - ABC Pretoria
  - ABC Johannesburg
  - ABC Cape Town
- **Total Monthly Cost**: R799 (R266/centre)
- **Remaining Capacity**: 2 more centres

**Example 3: Group 10 at Capacity**

- Organization: Sunshine Network
- Plan: Group 10 (R1,499/mo)
- Centres: 10 active (at limit)
- **Total Monthly Cost**: R1,499 (R150/centre)
- **Action Required**: Upgrade to add more centres

## 📊 Database Verification

Check your organizations:

```sql
SELECT
  name,
  plan_tier,
  max_centres,
  subscription_status,
  status
FROM organizations
ORDER BY created_at DESC;
```

Check centre distribution:

```sql
SELECT
  o.name as org_name,
  o.plan_tier,
  o.max_centres,
  COUNT(c.id) as centre_count,
  CASE
    WHEN o.max_centres = 0 THEN 'Unlimited'
    ELSE CONCAT(COUNT(c.id), '/', o.max_centres)
  END as usage
FROM organizations o
LEFT JOIN centres c ON o.id = c.organization_id
GROUP BY o.id, o.name, o.plan_tier, o.max_centres
ORDER BY o.created_at DESC;
```

Revenue report:

```sql
SELECT
  plan_tier,
  COUNT(*) as orgs,
  CASE plan_tier
    WHEN 'solo' THEN 199
    WHEN 'group_5' THEN 799
    WHEN 'group_10' THEN 1499
    ELSE 0
  END as price,
  COUNT(*) * CASE plan_tier
    WHEN 'solo' THEN 199
    WHEN 'group_5' THEN 799
    WHEN 'group_10' THEN 1499
    ELSE 0
  END as mrr
FROM organizations
WHERE subscription_status IN ('active', 'trialing')
GROUP BY plan_tier;
```

## 🛠️ Next Steps

### Immediate (High Priority)

1. **Update Centre Creation Form**
   - Add organization selector dropdown
   - Show available capacity
   - Validate against limits

2. **Edit Organization Page**
   - Create `/admin/organizations/[id]/page.tsx`
   - Allow plan changes
   - Show centres list
   - Billing information

### Short Term

3. **Payment Integration**
   - Stripe/Paystack setup
   - Webhook handlers
   - Invoice generation

4. **Trial & Subscription Management**
   - Trial expiry notifications
   - Payment reminders
   - Auto-suspend on non-payment

### Long Term

5. **Customer Portal**
   - Self-service plan upgrades
   - Usage analytics
   - Invoice history

6. **Advanced Features**
   - Multi-user access (org admins + centre admins)
   - Shared templates across organization
   - Bulk operations
   - API access for Enterprise

## 🐛 Troubleshooting

### Organizations page shows 404

- **Cause**: Page not created yet
- **Fix**: Pages now created at `/admin/organizations/*`

### Can't create organization

- **Error**: Slug must be unique
- **Fix**: Use different slug (e.g., "abc-learning-2")

### Centre limit not enforcing

- **Check**: Database trigger exists
- **Verify**:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'enforce_centre_limit';
  ```

### Pricing confusion

- **Remember**: Price is per **organization**, not per centre
- Group 5 = R799/mo for up to 5 centres (not R799 per centre)

## 📚 Full Documentation

- **Technical Details**: `ORGANIZATIONS_FEATURE.md`
- **Step-by-Step Workflow**: `ORGANIZATIONS_WORKFLOW.md`
- **Migration SQL**: `supabase/migrations/20251026102900_organizations.sql`

---

**Ready to test?** Go to http://localhost:3002/admin/organizations and create your first multi-centre organization! 🎉
