-- SQL function to atomically increment marketing campaign redemption counter
-- This ensures that concurrent approvals don't cause race conditions

CREATE OR REPLACE FUNCTION increment_campaign_redemptions(campaign_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE marketing_campaigns
  SET current_redemptions = current_redemptions + 1
  WHERE id = campaign_id
  AND current_redemptions < max_redemptions; -- Safety check: don't exceed max
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_campaign_redemptions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_campaign_redemptions(UUID) TO service_role;

-- Usage example:
-- SELECT increment_campaign_redemptions('ba79097c-1b93-4b48-bcbe-df73878ab4d1');
