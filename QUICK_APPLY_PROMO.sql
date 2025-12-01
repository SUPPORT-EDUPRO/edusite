-- ✅ QUICK FIX: Apply WELCOME2026 Promo Code Retroactively
-- Copy this entire script, replace the email, and run in Supabase SQL Editor

-- 📋 PARENT DETAILS
-- Email: nalexisdlamini@gmail.com  👈 CHANGE THIS
-- Registration ID: 00589f26-8ce3-4b0e-9050-544c2c3a3922  👈 CHANGE THIS

-- ✅ Step 1: Verify slots are available
SELECT 
  'SLOTS AVAILABLE: ' || (max_redemptions - current_redemptions) || ' out of ' || max_redemptions as message,
  CASE 
    WHEN current_redemptions < max_redemptions THEN '✅ You can apply the promo code'
    ELSE '❌ NO SLOTS - Cannot apply promo code'
  END as can_apply
FROM marketing_campaigns
WHERE coupon_code = 'WELCOME2026'
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';

-- ✅ Step 2: Apply promo code (only if step 1 says ✅)
UPDATE registration_requests
SET 
  campaign_applied = (
    SELECT id FROM marketing_campaigns 
    WHERE coupon_code = 'WELCOME2026' 
    AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  ),
  registration_fee_amount = 200.00,  -- R400 → R200 (50% off)
  updated_at = NOW()
WHERE id = '00589f26-8ce3-4b0e-9050-544c2c3a3922'  -- 👈 CHANGE THIS
  AND campaign_applied IS NULL
RETURNING 
  guardian_email,
  student_first_name,
  registration_fee_amount as new_fee,
  'Promo code applied successfully! ✅' as result;

-- ✅ Step 3: Increment the campaign counter
UPDATE marketing_campaigns
SET 
  current_redemptions = current_redemptions + 1,
  updated_at = NOW()
WHERE coupon_code = 'WELCOME2026'
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  AND current_redemptions < max_redemptions
RETURNING 
  coupon_code,
  current_redemptions,
  max_redemptions,
  (max_redemptions - current_redemptions) as slots_remaining,
  'Counter updated! ✅' as result;

-- ✅ Done! Now verify:
SELECT 
  '✅ PROMO CODE APPLIED SUCCESSFULLY!' as status,
  guardian_email,
  student_first_name || ' ' || student_last_name as student_name,
  'R' || registration_fee_amount || ' (was R400)' as discounted_fee,
  'WELCOME2026 (50% off)' as promo_applied
FROM registration_requests
WHERE id = '00589f26-8ce3-4b0e-9050-544c2c3a3922';  -- 👈 CHANGE THIS
