-- Create function to track promo code usage
CREATE OR REPLACE FUNCTION track_promo_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- If a campaign was applied, increment the redemption counter
  IF NEW.campaign_applied IS NOT NULL THEN
    UPDATE marketing_campaigns
    SET 
      current_redemptions = current_redemptions + 1,
      conversions_count = conversions_count + 1,
      updated_at = NOW()
    WHERE id = NEW.campaign_applied;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on registration_requests
DROP TRIGGER IF EXISTS track_promo_usage ON registration_requests;
CREATE TRIGGER track_promo_usage
  AFTER INSERT ON registration_requests
  FOR EACH ROW
  WHEN (NEW.campaign_applied IS NOT NULL)
  EXECUTE FUNCTION track_promo_code_usage();

COMMENT ON TRIGGER track_promo_usage ON registration_requests IS 
  'Automatically tracks promo code usage and increments redemption counter';

SELECT 'Promo code tracking trigger created' as result;
