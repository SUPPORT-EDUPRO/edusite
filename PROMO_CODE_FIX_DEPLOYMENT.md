# Promo Code Redemption Fix - Deployment Guide

## Problem Summary
1. **Issue**: Promo code redemption counter (`marketing_campaigns.current_redemptions`) was incrementing when registrations were submitted, wasting limited slots when registrations were later rejected.
2. **Issue**: Users couldn't see registration fee (R400 or R200 with discount) before clicking submit button.

## Solution Implemented
1. **Counter Increment on Approval Only**: Modified `/src/app/api/registrations/approve/route.ts` to increment counter ONLY when admin approves registration.
2. **Visual Fee Display**: Added prominent fee summary box in registration form showing:
   - Base fee: R400
   - Discount applied (if valid promo code entered)
   - Total amount due
   - Savings amount

## Files Changed

### 1. `/src/app/api/registrations/approve/route.ts`
**Change**: Added promo code redemption counter increment logic before step 9 (registration status update)

```typescript
// 7. Increment promo code redemption counter if campaign was applied
if (registration.campaign_applied) {
  // Atomic increment using SQL function
  const { error: campaignUpdateError } = await supabase.rpc('increment_campaign_redemptions', {
    campaign_id: registration.campaign_applied
  });
  // ... fallback logic if RPC fails
}
```

**Location**: Lines ~170-195 (before registration status update)

### 2. `/increment_campaign_redemptions.sql`
**Purpose**: SQL function for atomic counter increment (prevents race conditions)

**Content**:
```sql
CREATE OR REPLACE FUNCTION increment_campaign_redemptions(campaign_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE marketing_campaigns
  SET current_redemptions = current_redemptions + 1
  WHERE id = campaign_id
  AND current_redemptions < max_redemptions; -- Safety check
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. `/src/components/registration/PublicRegistrationForm.tsx`
**Change**: Added registration fee summary box before submit button

**Features**:
- Shows base R400 fee (struck through if discount applied)
- Shows promo discount breakdown (e.g., "WELCOME2026 Discount (50% off) -R200")
- Shows total amount due in large text
- Shows savings amount if promo valid
- Warning if invalid promo code entered

**Location**: Lines ~2100-2200 (before submit button in form)

## Deployment Steps

### Step 1: Deploy SQL Function
```bash
# Connect to EduSite Pro database
psql "postgresql://postgres.bppuzibjlxgfwrujzfsz:Vh5643qenbxXizCQ@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Run the SQL function
\i /home/king/Desktop/edusitepro/increment_campaign_redemptions.sql

# Verify function created
\df increment_campaign_redemptions

# Test function (optional - DON'T run on production campaign!)
-- SELECT increment_campaign_redemptions('test-campaign-id');
```

### Step 2: Build and Deploy Frontend
```bash
cd /home/king/Desktop/edusitepro

# Install dependencies (if needed)
npm install

# Build Next.js app
npm run build

# Deploy to Vercel (or your hosting platform)
vercel --prod
# OR
git add .
git commit -m "Fix: Promo code redemption counter and add fee display"
git push origin main
```

### Step 3: Verify Deployment
1. **Test Registration Form**:
   - Visit: https://edusitepro.vercel.app/register
   - Enter valid promo code: `WELCOME2026`
   - Verify fee summary shows:
     - Base fee: R400 (struck through)
     - Discount: -R200 (50% off)
     - Total: R200
     - Savings: R200

2. **Test Invalid Promo**:
   - Enter invalid code: `INVALID123`
   - Verify warning appears
   - Fee should show R400 (no discount)

3. **Test Counter Increment**:
   - Submit test registration with WELCOME2026 code
   - Check `marketing_campaigns.current_redemptions` → Should NOT increase yet
   - Admin approves registration
   - Check counter again → Should increase by 1
   - Admin rejects another registration
   - Check counter → Should NOT increase

### Step 4: Database Verification Queries
```sql
-- Check current campaign redemptions
SELECT 
  coupon_code, 
  current_redemptions, 
  max_redemptions,
  (max_redemptions - current_redemptions) AS remaining
FROM marketing_campaigns
WHERE coupon_code = 'WELCOME2026';

-- Check registration requests with campaigns
SELECT 
  id,
  guardian_email,
  student_first_name,
  campaign_applied,
  status,
  created_at,
  reviewed_date
FROM registration_requests
WHERE campaign_applied IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## Testing Checklist

### Test Case 1: Valid Promo Code
- [ ] Enter WELCOME2026 in coupon field
- [ ] Verify green checkmark appears
- [ ] Verify "50% Discount Applied!" message
- [ ] Verify fee summary shows R200 total
- [ ] Verify "You saved R200!" message

### Test Case 2: Invalid Promo Code
- [ ] Enter INVALID123 in coupon field
- [ ] Verify yellow warning appears
- [ ] Verify fee summary shows R400 total
- [ ] No discount shown

### Test Case 3: Empty Promo Code
- [ ] Leave coupon field empty
- [ ] Fee summary shows R400 total
- [ ] No warnings or discount messages

### Test Case 4: Registration Approval Flow
- [ ] Submit registration WITH promo code
- [ ] Verify `registration_requests.campaign_applied` has UUID
- [ ] Check `marketing_campaigns.current_redemptions` → No change
- [ ] Admin approves registration
- [ ] Check counter again → Increased by 1
- [ ] Verify console log: "✅ Promo code redemption counter incremented"

### Test Case 5: Registration Rejection Flow
- [ ] Submit registration WITH promo code
- [ ] Admin rejects registration
- [ ] Check `marketing_campaigns.current_redemptions` → No change
- [ ] Verify slot not wasted

### Test Case 6: Promo Slot Exhaustion
- [ ] Set max_redemptions to current_redemptions
- [ ] Try to use promo code
- [ ] Verify red error: "All X discount slots have been claimed"
- [ ] Fee shows full R400

## Rollback Plan

If issues occur:

### Rollback Frontend
```bash
# Revert Git commit
git revert HEAD
git push origin main

# OR manually revert files
git checkout HEAD~1 -- src/components/registration/PublicRegistrationForm.tsx
git checkout HEAD~1 -- src/app/api/registrations/approve/route.ts
```

### Remove SQL Function (if needed)
```sql
DROP FUNCTION IF EXISTS increment_campaign_redemptions(UUID);
```

## Monitoring

After deployment, monitor:
1. **Registration submission rate** - Should remain stable
2. **Approval/rejection rate** - Should remain stable
3. **Promo code usage** - Counter should only increase on approvals
4. **User feedback** - Check for confusion about fee display

## Expected Behavior

### Before This Fix:
❌ Counter incremented on submission → wasted slots when rejected
❌ No fee visibility → users uncertain about cost

### After This Fix:
✅ Counter increments ONLY on approval → rejected registrations don't waste slots
✅ Fee displayed prominently → users see cost before submitting
✅ Clear savings message → users motivated to use promo codes
✅ Invalid code warnings → prevents confusion

## Contact
If issues arise during deployment, check:
- Supabase logs: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/logs
- Vercel deployment logs: https://vercel.com/dashboard
- Console errors in browser DevTools

## Notes
- SQL function uses `SECURITY DEFINER` to bypass RLS (safe because it only increments counter)
- Fallback logic included if RPC fails (manual fetch-increment-update)
- Fee display is reactive - updates instantly when coupon code changes
- Design matches existing form styling (purple/pink gradient theme)
