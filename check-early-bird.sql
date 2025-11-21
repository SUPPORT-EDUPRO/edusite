-- Check early bird campaign status
SELECT 
  id,
  promo_code,
  coupon_code,
  discount_type,
  discount_percentage,
  discount_amount,
  current_redemptions,
  max_redemptions,
  (max_redemptions - current_redemptions) as remaining,
  active,
  start_date,
  end_date,
  created_at
FROM marketing_campaigns
WHERE organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
ORDER BY created_at DESC;
