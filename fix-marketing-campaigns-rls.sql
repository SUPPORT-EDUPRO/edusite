-- Fix marketing_campaigns table RLS policies for public access
-- This allows the registration form to query active campaigns

-- Enable RLS if not already enabled
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read of active campaigns" ON marketing_campaigns;
DROP POLICY IF EXISTS "Public can read active marketing campaigns" ON marketing_campaigns;

-- Create policy to allow public read access to active campaigns
CREATE POLICY "Public can read active marketing campaigns"
ON marketing_campaigns
FOR SELECT
TO anon, authenticated
USING (active = true);

-- Grant SELECT permission to anon role
GRANT SELECT ON marketing_campaigns TO anon;
GRANT SELECT ON marketing_campaigns TO authenticated;

-- Verify the table exists and has data
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
