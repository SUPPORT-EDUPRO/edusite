-- ========================================
-- CHECK REGISTRATION FEE STATUS
-- ========================================

-- Step 1: Check what's in the database for this specific registration
SELECT 
  id,
  guardian_email,
  student_first_name || ' ' || student_last_name as student_name,
  coupon_code,  -- Text code they entered
  campaign_applied,  -- UUID reference to marketing_campaigns table
  registration_fee_amount,  -- This is what displays in dashboard
  discount_amount,
  registration_fee_paid,
  status,
  created_at
FROM registration_requests
WHERE id = '00589f26-8ce3-4b0e-9050-544c2c3a3922';

-- Step 2: Check if campaign_applied is properly linked
SELECT 
  rr.id as registration_id,
  rr.guardian_email,
  rr.coupon_code as entered_code,
  rr.campaign_applied as campaign_uuid,
  rr.registration_fee_amount,
  mc.coupon_code as actual_campaign_code,
  mc.discount_percentage,
  mc.discount_amount,
  mc.discount_type
FROM registration_requests rr
LEFT JOIN marketing_campaigns mc ON rr.campaign_applied = mc.id::text
WHERE rr.id = '00589f26-8ce3-4b0e-9050-544c2c3a3922';

-- Step 3: Check the second registration (Viennetta Shaku / Griffith)
SELECT 
  id,
  guardian_email,
  student_first_name || ' ' || student_last_name as student_name,
  coupon_code,
  campaign_applied,
  registration_fee_amount,
  status,
  created_at
FROM registration_requests
WHERE guardian_email ILIKE '%viennetta%' OR guardian_email ILIKE '%shaku%'
ORDER BY created_at DESC;

-- ========================================
-- FIX: If registration_fee_amount is NULL or wrong
-- ========================================

-- Option 1: Fix the specific registration (Nalexis)
UPDATE registration_requests
SET 
  registration_fee_amount = 200.00,  -- Set discounted fee
  campaign_applied = (
    SELECT id::text FROM marketing_campaigns 
    WHERE coupon_code = 'WELCOME2026' 
    AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
    LIMIT 1
  ),
  updated_at = NOW()
WHERE id = '00589f26-8ce3-4b0e-9050-544c2c3a3922'
RETURNING 
  guardian_email,
  student_first_name,
  registration_fee_amount,
  campaign_applied;

-- Option 2: Fix ALL registrations that have WELCOME2026 coupon code but wrong fee
UPDATE registration_requests
SET 
  registration_fee_amount = 200.00,
  campaign_applied = (
    SELECT id::text FROM marketing_campaigns 
    WHERE coupon_code = 'WELCOME2026' 
    AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
    LIMIT 1
  ),
  updated_at = NOW()
WHERE coupon_code ILIKE '%WELCOME2026%'
  AND organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  AND (registration_fee_amount IS NULL OR registration_fee_amount != 200.00)
RETURNING 
  id,
  guardian_email,
  student_first_name,
  registration_fee_amount;

-- ========================================
-- VERIFY THE FIX
-- ========================================

SELECT 
  'Registration Fee Check' as check_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN registration_fee_amount = 200 THEN 1 END) as discounted_count,
  COUNT(CASE WHEN registration_fee_amount = 400 THEN 1 END) as full_price_count,
  COUNT(CASE WHEN registration_fee_amount IS NULL THEN 1 END) as null_fee_count
FROM registration_requests
WHERE organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
  AND coupon_code ILIKE '%WELCOME2026%';
