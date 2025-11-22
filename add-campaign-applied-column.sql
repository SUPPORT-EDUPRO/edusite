-- Add campaign_applied column to registration_requests table
ALTER TABLE registration_requests 
ADD COLUMN IF NOT EXISTS campaign_applied TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_registration_requests_campaign_applied 
ON registration_requests(campaign_applied) 
WHERE campaign_applied IS NOT NULL;

-- Add comment
COMMENT ON COLUMN registration_requests.campaign_applied IS 'Marketing campaign code applied during registration (e.g., WELCOME2026)';
