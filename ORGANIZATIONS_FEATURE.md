# Organizations & Multi-Centre Support

## Overview

EduSitePro now supports **Organizations** - allowing groups to manage multiple ECD centres under one subscription.

## Plan Tiers

| Plan           | Max Centres | Price (per organization) | Cost per Centre     | Use Case                               |
| -------------- | ----------- | ------------------------ | ------------------- | -------------------------------------- |
| **Solo**       | 1           | R199/mo                  | R199                | Single independent ECD centre          |
| **Group 5**    | 5           | R799/mo                  | R160 (20% discount) | Small franchise or multi-site operator |
| **Group 10**   | 10          | R1,499/mo                | R150 (25% discount) | Medium franchise network               |
| **Enterprise** | Unlimited   | Custom                   | Negotiated          | Large organizations with many sites    |

**Important**: Pricing is per **organization**, not per centre. Group plans offer volume discounts.

## Database Schema

### organizations table

```sql
- id (UUID)
- name (e.g., "ABC Learning Group")
- slug (URL-friendly identifier)
- plan_tier ('solo', 'group_5', 'group_10', 'enterprise')
- max_centres (1, 5, 10, or 0 for unlimited)
- primary_contact_name/email/phone
- billing_email
- address fields (line1, line2, city, province, postal_code)
- stripe_customer_id (for billing integration)
- subscription_status ('active', 'trialing', 'past_due', 'canceled', 'suspended')
- subscription dates
- status ('active', 'suspended', 'archived')
```

### Updated centres table

```sql
- organization_id (FK to organizations) - REQUIRED
- All existing fields remain
```

## Features

### 1. Automatic Centre Limit Enforcement

A database trigger (`check_centre_limit()`) prevents creating more centres than allowed by the plan:

- Solo: Maximum 1 centre
- Group 5: Maximum 5 centres
- Group 10: Maximum 10 centres
- Enterprise: Unlimited

### 2. Hierarchy

```
Organization: ABC Learning Group (Group 10 Plan)
├── Centre 1: Little Stars Pretoria
├── Centre 2: Little Stars Johannesburg
├── Centre 3: Little Stars Cape Town
└── ... (up to 10 centres)
```

### 3. Migration Strategy

Existing centres are automatically migrated to implicit organizations:

- Each existing centre gets its own organization
- Organization name: "{Centre Name} Organization"
- Organization slug: "{centre-slug}-org"
- Plan tier inherited from centre's plan_tier

## Admin UI Flow

### Creating a New Organization

1. Admin → Organizations → "Create Organization"
2. Fill in:
   - Organization name
   - Plan tier (solo/group_5/group_10/enterprise)
   - Contact details
   - Billing information
3. System automatically sets `max_centres` based on plan

### Adding Centres to an Organization

1. Admin → Centres → "Create Centre"
2. Select parent organization from dropdown
3. System validates against organization's centre limit
4. If limit reached, show error: "Organization has reached its limit of X centres"

## Migration File

**Location**: `supabase/migrations/20251026102900_organizations.sql`

**To Apply**:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the migration SQL
3. Run it
4. Verify with: `SELECT * FROM organizations;`

## Next Steps

### Admin UI Tasks

- [ ] Create Organizations management page (`/admin/organizations`)
- [ ] Update Centre creation form to select organization
- [ ] Show organization details on centre list
- [ ] Add "Centres remaining" indicator
- [ ] Organization billing dashboard

### Billing Integration

- [ ] Stripe integration for subscriptions
- [ ] Plan upgrade/downgrade flow
- [ ] Usage-based billing tracking
- [ ] Invoice generation

### User Permissions

- [ ] Organization-level admins (can manage all centres)
- [ ] Centre-level admins (can only manage their centre)
- [ ] Role-based access control (RBAC)

## Example Use Cases

### Use Case 1: Solo Centre

- Owner: Sarah (independent centre)
- Plan: Solo (R199/mo)
- Centres: 1 (Little Stars Montessori)

### Use Case 2: Small Franchise

- Owner: ABC Learning Group
- Plan: Group 5 (R799/mo)
- Centres:
  - ABC Learning Pretoria
  - ABC Learning Centurion
  - ABC Learning Midrand

### Use Case 3: Large Network

- Owner: EduCare South Africa
- Plan: Enterprise (Custom pricing)
- Centres: 25+ locations nationwide
- Features: Custom branding, dedicated support, API access

## Benefits

1. **For Customers**:
   - Cost savings for multi-site operators
   - Centralized billing
   - Shared branding and templates
   - Bulk content updates

2. **For EduSitePro**:
   - Higher contract values
   - Lower churn (harder to leave when managing multiple sites)
   - Upsell opportunities (solo → group plans)
   - Better market positioning vs competitors

## Pricing Strategy

- **Solo**: Entry point for single centres
- **Group 5**: ~20% discount per centre vs 5x solo
- **Group 10**: ~25% discount per centre vs 10x solo
- **Enterprise**: Custom (includes white-label, API, dedicated support)
