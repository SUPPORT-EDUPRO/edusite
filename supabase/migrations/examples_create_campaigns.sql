-- =====================================================
-- EXAMPLE: Creating Different Campaigns for Different Organizations
-- =====================================================

-- Example 1: Young Eagles - 20% Early Bird (Already Created)
-- This was created in the migration

-- Example 2: Another School - 50% First Month Free
INSERT INTO marketing_campaigns (
  organization_id,
  name,
  campaign_type,
  description,
  terms_conditions,
  discount_type,
  discount_value,
  promo_code,
  max_redemptions,
  start_date,
  end_date,
  auto_apply,
  active,
  featured
)
VALUES (
  'another-school-org-id-here',  -- Different organization
  'Back to School Special - 50% OFF',
  'seasonal_promo',
  'Register now and get 50% off your registration fee! Limited time offer.',
  'Valid for new students only. Cannot be combined with other offers.',
  'percentage',
  50.00,  -- 50% discount!
  'BACKTOSCHOOL50',
  200,  -- First 200 registrations
  '2025-12-01 00:00:00',
  '2026-02-28 23:59:59',
  false,  -- Manual promo code entry required
  true,
  true
);

-- Example 3: Premium School - Fixed Amount Discount
INSERT INTO marketing_campaigns (
  organization_id,
  name,
  campaign_type,
  description,
  terms_conditions,
  discount_type,
  discount_value,
  promo_code,
  start_date,
  end_date,
  active,
  featured
)
VALUES (
  'premium-school-org-id',
  'R1000 Off Registration',
  'early_bird',
  'Save R1000 when you register before January 15th!',
  'New students only.',
  'fixed_amount',
  1000.00,  -- R1000 flat discount
  'SAVE1000',
  '2025-11-01 00:00:00',
  '2026-01-15 23:59:59',
  true,
  true
);

-- Example 4: Sibling Discount Campaign
INSERT INTO marketing_campaigns (
  organization_id,
  name,
  campaign_type,
  description,
  terms_conditions,
  discount_type,
  discount_value,
  max_discount_amount,  -- Cap the discount
  promo_code,
  start_date,
  end_date,
  active
)
VALUES (
  'any-school-org-id',
  'Sibling Discount - 30% Off',
  'sibling_discount',
  'Register multiple children and save 30% on each additional child!',
  'Second child onwards receives 30% discount on registration.',
  'percentage',
  30.00,
  500.00,  -- Maximum R500 discount per child
  'SIBLINGS30',
  '2025-11-01 00:00:00',
  '2026-12-31 23:59:59',
  true
);

-- Example 5: Completely Free Registration (100% waiver)
INSERT INTO marketing_campaigns (
  organization_id,
  name,
  campaign_type,
  description,
  discount_type,
  discount_value,
  promo_code,
  max_redemptions,
  start_date,
  end_date,
  active,
  featured
)
VALUES (
  'scholarship-school-id',
  'Full Registration Fee Waiver',
  'scholarship',
  'Qualifying students can register for FREE!',
  'waive_registration',  -- Special type that waives entire fee
  0,  -- Value not used for waive_registration type
  'SCHOLARSHIP2026',
  50,
  '2025-11-01 00:00:00',
  '2026-12-31 23:59:59',
  true,
  true
);

-- =====================================================
-- HOW TO CREATE CAMPAIGNS FOR YOUR ORGANIZATION
-- =====================================================

-- Step 1: Get your organization ID
SELECT id, name, slug FROM organizations WHERE slug = 'your-school-slug';

-- Step 2: Create your campaign
INSERT INTO marketing_campaigns (
  organization_id,
  name,
  campaign_type,
  description,
  discount_type,
  discount_value,
  promo_code,
  start_date,
  end_date,
  active,
  featured
)
VALUES (
  'your-organization-id-from-step-1',
  'Your Campaign Name',
  'early_bird',  -- or 'sibling_discount', 'referral_bonus', etc.
  'Your campaign description',
  'percentage',  -- or 'fixed_amount', 'waive_registration'
  50.00,  -- Your discount percentage or amount
  'YOUR_PROMO_CODE',
  NOW(),
  '2026-12-31 23:59:59',
  true,
  true
);

-- Step 3: View all campaigns for your organization
SELECT 
  name,
  promo_code,
  discount_type,
  discount_value,
  current_redemptions,
  max_redemptions,
  start_date::date,
  end_date::date,
  active
FROM marketing_campaigns
WHERE organization_id = 'your-organization-id'
ORDER BY created_at DESC;

-- =====================================================
-- UPDATING EXISTING CAMPAIGNS
-- =====================================================

-- Change discount from 20% to 50%
UPDATE marketing_campaigns
SET 
  discount_value = 50.00,
  name = 'Early Bird Registration 2026 - 50% OFF!',
  updated_at = NOW()
WHERE promo_code = 'EARLYBIRD2026';

-- Extend campaign deadline
UPDATE marketing_campaigns
SET 
  end_date = '2026-03-31 23:59:59',
  updated_at = NOW()
WHERE promo_code = 'EARLYBIRD2026';

-- Increase redemption limit
UPDATE marketing_campaigns
SET 
  max_redemptions = 500,  -- Increase from 100 to 500
  updated_at = NOW()
WHERE promo_code = 'EARLYBIRD2026';

-- Deactivate a campaign
UPDATE marketing_campaigns
SET active = false, updated_at = NOW()
WHERE promo_code = 'EARLYBIRD2026';

-- =====================================================
-- MULTIPLE CAMPAIGNS FOR ONE ORGANIZATION
-- =====================================================

-- You can run multiple campaigns simultaneously!
-- Example: Young Eagles runs 3 campaigns at once

-- Campaign 1: Early Bird
INSERT INTO marketing_campaigns (organization_id, name, campaign_type, discount_type, discount_value, promo_code, start_date, end_date, active)
SELECT id, 'Early Bird - 20% OFF', 'early_bird', 'percentage', 20.00, 'EARLYBIRD20', NOW(), '2026-01-31', true
FROM organizations WHERE slug = 'young-eagles';

-- Campaign 2: Sibling Discount (runs year-round)
INSERT INTO marketing_campaigns (organization_id, name, campaign_type, discount_type, discount_value, promo_code, start_date, end_date, active)
SELECT id, 'Sibling Discount - 15% OFF', 'sibling_discount', 'percentage', 15.00, 'SIBLINGS15', NOW(), '2026-12-31', true
FROM organizations WHERE slug = 'young-eagles';

-- Campaign 3: Referral Bonus
INSERT INTO marketing_campaigns (organization_id, name, campaign_type, discount_type, discount_value, promo_code, start_date, end_date, active)
SELECT id, 'Refer a Friend - R200 Credit', 'referral_bonus', 'fixed_amount', 200.00, 'REFER200', NOW(), '2026-12-31', true
FROM organizations WHERE slug = 'young-eagles';
