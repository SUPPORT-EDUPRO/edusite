-- Add custom domain support to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255),
ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS domain_verification_token VARCHAR(100);

-- Create index for fast domain lookups
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON organizations(custom_domain) WHERE custom_domain IS NOT NULL;

-- Update Young Eagles with their custom domain
UPDATE organizations 
SET custom_domain = 'youngeagles.org.za',
    domain_verified = true
WHERE slug = 'young-eagles';

-- Create a view for domain resolution (used by middleware)
CREATE OR REPLACE VIEW organization_domains AS
SELECT 
  id AS organization_id,
  name,
  slug,
  custom_domain,
  domain_verified,
  organization_type,
  school_code
FROM organizations
WHERE custom_domain IS NOT NULL AND domain_verified = true;

GRANT SELECT ON organization_domains TO authenticated, anon;

COMMENT ON COLUMN organizations.custom_domain IS 'Custom domain for this organization (e.g., youngeagles.org.za)';
COMMENT ON COLUMN organizations.domain_verified IS 'Whether the custom domain DNS is verified';
COMMENT ON COLUMN organizations.domain_verification_token IS 'Token for DNS TXT record verification';
