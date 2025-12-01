-- =====================================================
-- APPLY PROMO CODE RETROACTIVELY TO EXISTING REGISTRATIONS
-- =====================================================
-- Use this script when a parent registered without a promo code
-- and you want to manually apply it for them.
--
-- ⚠️ IMPORTANT: This does NOT auto-increment the campaign counter.
-- You must manually check if slots are available before running this!
-- =====================================================

-- Step 1: Find the parent's registration
-- Replace 'parent@email.com' with actual parent email
SELECT 
  id,
  guardian_email,
  student_first_name,
  student_last_name,
  campaign_applied,
  registration_fee_amount,
  status,
  created_at
FROM registration_requests
WHERE guardian_email = 'nalexisdlamini@gmail.com'  -- 👈 CHANGE THIS
ORDER BY created_at DESC;

-- Step 2: Check if promo code has available slots
-- Replace 'WELCOME2026' with the promo code you want to apply
SELECT 
  id,
  promo_code,
  coupon_code,
  discount_type,
  discount_percentage,
  discount_amount,
  current_redemptions,
  max_redemptions,
  (max_redemptions - current_redemptions) AS slots_remaining,
  CASE 
    WHEN current_redemptions >= max_redemptions THEN '❌ FULL - Cannot apply'
    ELSE '✅ Available'
  END as status,
  active,
  start_date,
  end_date
FROM marketing_campaigns
WHERE coupon_code = 'WELCOME2026'  -- 👈 CHANGE THIS IF NEEDED
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';  -- Young Eagles

-- Step 3: Get the campaign ID (copy this for step 4)
SELECT 
  id as campaign_id,
  coupon_code,
  discount_percentage,
  discount_amount
FROM marketing_campaigns
WHERE coupon_code = 'WELCOME2026'
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';

-- =====================================================
-- Step 4: APPLY THE PROMO CODE RETROACTIVELY
-- ⚠️ ONLY RUN THIS IF SLOTS ARE AVAILABLE (Step 2 shows ✅)
-- =====================================================

-- Option A: If you know the campaign ID directly
UPDATE registration_requests
SET 
  campaign_applied = 'WELCOME2026',  -- 👈 Campaign ID from Step 3
  registration_fee_amount = 200.00,  -- Discounted amount (R400 → R200 for 50% off)
  updated_at = NOW()
WHERE guardian_email = 'nalexisdlamini@gmail.com'  -- 👈 CHANGE THIS
  AND id = '00589f26-8ce3-4b0e-9050-544c2c3a3922'  -- 👈 OPTIONAL: Specific registration ID from Step 1
  AND campaign_applied IS NULL;  -- Only update if no campaign was applied yet

-- Option B: If you want to calculate discount automatically
-- (Use this if you're not sure of the final amount)
WITH campaign AS (
  SELECT 
    id,
    discount_type,
    discount_percentage,
    discount_amount
  FROM marketing_campaigns
  WHERE coupon_code = 'WELCOME2026'
    AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
),
original_fee AS (
  SELECT 400.00 AS base_amount  -- Young Eagles registration fee
)
UPDATE registration_requests rr
SET 
  campaign_applied = (SELECT id FROM campaign),
  registration_fee_amount = CASE
    WHEN (SELECT discount_type FROM campaign) = 'percentage' THEN
      (SELECT base_amount FROM original_fee) * (1 - (SELECT discount_percentage FROM campaign) / 100.0)
    WHEN (SELECT discount_type FROM campaign) = 'fixed_amount' THEN
      (SELECT base_amount FROM original_fee) - (SELECT discount_amount FROM campaign)
    ELSE
      (SELECT base_amount FROM original_fee)
  END,
  updated_at = NOW()
WHERE rr.guardian_email = 'nalexisdlamini@gmail.com'  -- 👈 CHANGE THIS
  AND rr.campaign_applied IS NULL;

-- =====================================================
-- Step 5: MANUALLY INCREMENT THE REDEMPTION COUNTER
-- ⚠️ ONLY RUN THIS AFTER STEP 4 SUCCEEDS
-- =====================================================

UPDATE marketing_campaigns
SET 
  current_redemptions = current_redemptions + 1,
  updated_at = NOW()
WHERE coupon_code = 'WELCOME2026'
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  AND current_redemptions < max_redemptions;  -- Safety check

-- =====================================================
-- Step 6: VERIFY THE CHANGES
-- =====================================================

-- Check the updated registration
SELECT 
  id,
  guardian_email,
  student_first_name,
  campaign_applied,
  registration_fee_amount,
  status,
  updated_at
FROM registration_requests
WHERE guardian_email = 'nalexisdlamini@gmail.com'  -- 👈 CHANGE THIS
ORDER BY updated_at DESC;

-- Check the updated campaign counter
SELECT 
  coupon_code,
  current_redemptions,
  max_redemptions,
  (max_redemptions - current_redemptions) AS slots_remaining
FROM marketing_campaigns
WHERE coupon_code = 'WELCOME2026'
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';

-- =====================================================
-- QUICK REFERENCE: Common Promo Codes
-- =====================================================

-- Young Eagles promo codes:
-- WELCOME2026 - 50% off registration (R400 → R200)
-- EARLYBIRD2026 - 20% off registration (R400 → R320)
-- SIBLINGS15 - 15% off for siblings

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- Issue 1: "No slots remaining"
-- → Check max_redemptions vs current_redemptions
-- → Increase max_redemptions if needed:
--   UPDATE marketing_campaigns 
--   SET max_redemptions = 200 
--   WHERE coupon_code = 'WELCOME2026';

-- Issue 2: "Parent already has a campaign applied"
-- → Remove existing campaign first:
--   UPDATE registration_requests
--   SET campaign_applied = NULL
--   WHERE guardian_email = 'parent@email.com';

-- Issue 3: "Multiple registrations for same parent"
-- → Use the registration ID to target specific one:
--   WHERE id = '00589f26-8ce3-4b0e-9050-544c2c3a3922'

-- =====================================================
-- SAFER ALTERNATIVE: Mark for manual review instead
-- =====================================================

-- Instead of directly updating, you can mark it for review:
UPDATE registration_requests
SET 
  notes = COALESCE(notes, '') || E'\n\n⚠️ ADMIN NOTE: Parent requested WELCOME2026 promo code retroactively. Please verify and adjust fee from R400 to R200.',
  updated_at = NOW()
WHERE guardian_email = 'nalexisdlamini@gmail.com'  -- 👈 CHANGE THIS
  AND campaign_applied IS NULL;

-- Then admin can review in the dashboard and manually adjust the fee.
