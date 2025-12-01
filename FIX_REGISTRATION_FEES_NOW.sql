-- ========================================
-- COMPREHENSIVE FIX FOR REGISTRATION FEES
-- Run these queries ONE AT A TIME to diagnose and fix
-- ========================================

-- 🔍 STEP 1: CHECK CURRENT STATE
-- Check Nalexis registration (the one showing R400 in dashboard)
SELECT 
  'Nalexis Registration' as label,
  id,
  guardian_email,
  student_first_name,
  coupon_code,
  registration_fee_amount,
  discount_amount,
  campaign_applied,
  status
FROM registration_requests
WHERE guardian_email = 'nalexisdlamini@gmail.com'
ORDER BY created_at DESC;

-- 🔍 STEP 2: CHECK IF IT'S A CACHE ISSUE
-- Force refresh by checking directly
SELECT 
  id,
  COALESCE(registration_fee_amount, 400) as displayed_fee,
  registration_fee_amount as actual_db_value,
  coupon_code
FROM registration_requests
WHERE id = '00589f26-8ce3-4b0e-9050-544c2c3a3922';

-- 🔍 STEP 3: CHECK THE MARKETING CAMPAIGN
SELECT 
  id,
  coupon_code,
  discount_type,
  discount_percentage,
  discount_amount,
  current_redemptions,
  max_redemptions
FROM marketing_campaigns
WHERE coupon_code = 'WELCOME2026'
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';

-- ✅ FIX 1: Set the fee amount explicitly
UPDATE registration_requests
SET 
  registration_fee_amount = 200,
  discount_amount = 50,  -- 50% discount
  campaign_applied = (
    SELECT id::text 
    FROM marketing_campaigns 
    WHERE coupon_code = 'WELCOME2026' 
    AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  ),
  updated_at = NOW()
WHERE id = '00589f26-8ce3-4b0e-9050-544c2c3a3922';

-- ✅ FIX 2: Also fix Griffith if needed
UPDATE registration_requests
SET 
  registration_fee_amount = 200,
  discount_amount = 50,
  campaign_applied = (
    SELECT id::text 
    FROM marketing_campaigns 
    WHERE coupon_code = 'WELCOME2026' 
    AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  ),
  updated_at = NOW()
WHERE guardian_email ILIKE '%viennetta%'
  AND coupon_code ILIKE '%WELCOME%';

-- 🔍 VERIFY: Check all registrations with WELCOME2026
SELECT 
  id,
  guardian_email,
  student_first_name,
  coupon_code,
  registration_fee_amount,
  discount_amount,
  status,
  'Expected: R200' as expected_fee
FROM registration_requests
WHERE coupon_code ILIKE '%WELCOME2026%'
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
ORDER BY created_at DESC;

-- ========================================
-- IF DASHBOARD STILL SHOWS WRONG VALUE:
-- Clear browser cache and hard refresh (Ctrl+Shift+R)
-- ========================================
