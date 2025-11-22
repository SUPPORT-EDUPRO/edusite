-- ========================================
-- EDUSITEPRO DATABASE FIXES
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. Add campaign_applied column to registration_requests
ALTER TABLE registration_requests 
ADD COLUMN IF NOT EXISTS campaign_applied TEXT;

CREATE INDEX IF NOT EXISTS idx_registration_requests_campaign_applied 
ON registration_requests(campaign_applied) 
WHERE campaign_applied IS NOT NULL;

COMMENT ON COLUMN registration_requests.campaign_applied IS 'Marketing campaign code applied during registration (e.g., WELCOME2026)';

-- 2. Fix marketing_campaigns RLS policies
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of active campaigns" ON marketing_campaigns;
DROP POLICY IF EXISTS "Public can read active marketing campaigns" ON marketing_campaigns;

CREATE POLICY "Public can read active marketing campaigns"
ON marketing_campaigns
FOR SELECT
TO anon, authenticated
USING (active = true);

GRANT SELECT ON marketing_campaigns TO anon;
GRANT SELECT ON marketing_campaigns TO authenticated;

-- 3. Verify changes
SELECT 
  'campaign_applied column exists' as check_name,
  EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'registration_requests' 
    AND column_name = 'campaign_applied'
  ) as result
UNION ALL
SELECT 
  'marketing_campaigns has RLS enabled' as check_name,
  relrowsecurity as result
FROM pg_class
WHERE relname = 'marketing_campaigns';

-- 4. Show active campaigns
SELECT 
  id, 
  organization_id, 
  promo_code, 
  coupon_code,
  discount_type,
  discount_percentage,
  discount_amount,
  current_redemptions,
  max_redemptions,
  active
FROM marketing_campaigns
WHERE active = true
LIMIT 5;
