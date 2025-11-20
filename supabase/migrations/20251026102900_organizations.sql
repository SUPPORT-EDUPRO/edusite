-- Organizations and Multi-Centre Support
-- Enables groups to manage multiple ECD centres under one subscription

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  
  -- Subscription & Billing
  plan_tier VARCHAR(20) NOT NULL DEFAULT 'solo' CHECK (plan_tier IN ('solo', 'group_5', 'group_10', 'enterprise')),
  max_centres INT NOT NULL DEFAULT 1, -- 1 for solo, 5 for group_5, 10 for group_10, unlimited for enterprise
  
  -- Organization Details
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(50),
  billing_email VARCHAR(255),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'ZA',
  
  -- Billing & Subscription
  stripe_customer_id VARCHAR(255),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'suspended')),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  
  -- Settings
  branding JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);

-- ============================================
-- UPDATE CENTRES TABLE
-- ============================================
-- Add organization_id foreign key to centres
ALTER TABLE centres ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Migrate existing centres to organizations (create implicit organization for each)
DO $$
DECLARE
  centre_record RECORD;
  new_org_id UUID;
BEGIN
  FOR centre_record IN SELECT * FROM centres WHERE organization_id IS NULL LOOP
    -- Create an organization for this centre
    INSERT INTO organizations (
      name,
      slug,
      plan_tier,
      max_centres,
      primary_contact_email,
      primary_contact_phone,
      status
    ) VALUES (
      centre_record.name || ' Organization',
      centre_record.slug || '-org',
      COALESCE(centre_record.plan_tier, 'solo'),
      1,
      centre_record.contact_email,
      centre_record.contact_phone,
      centre_record.status
    )
    RETURNING id INTO new_org_id;
    
    -- Link centre to new organization
    UPDATE centres SET organization_id = new_org_id WHERE id = centre_record.id;
  END LOOP;
END $$;

-- Now make organization_id required
ALTER TABLE centres ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_centres_organization_id ON centres(organization_id);

-- ============================================
-- ROW LEVEL SECURITY FOR ORGANIZATIONS
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role has full access to organizations"
  ON organizations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Authenticated users can read their own organizations (TODO: based on memberships)
CREATE POLICY "Users can read their organizations"
  ON organizations FOR SELECT TO authenticated
  USING (true); -- TODO: Add proper membership check

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTION: Check centre limit
-- ============================================
CREATE OR REPLACE FUNCTION check_centre_limit()
RETURNS TRIGGER AS $$
DECLARE
  org_max_centres INT;
  current_centre_count INT;
BEGIN
  -- Get organization's max centres
  SELECT max_centres INTO org_max_centres
  FROM organizations
  WHERE id = NEW.organization_id;
  
  -- Count current centres for this organization
  SELECT COUNT(*) INTO current_centre_count
  FROM centres
  WHERE organization_id = NEW.organization_id
    AND status != 'archived';
  
  -- Check if limit exceeded (allow if enterprise/unlimited)
  IF org_max_centres > 0 AND current_centre_count >= org_max_centres THEN
    RAISE EXCEPTION 'Centre limit reached. Organization can have maximum % centres (current: %)', 
      org_max_centres, current_centre_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to centres table
DROP TRIGGER IF EXISTS enforce_centre_limit ON centres;
CREATE TRIGGER enforce_centre_limit
  BEFORE INSERT ON centres
  FOR EACH ROW
  EXECUTE FUNCTION check_centre_limit();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Organizations table created successfully!';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  - Multi-centre support (solo, group_5, group_10, enterprise)';
  RAISE NOTICE '  - Automatic centre limit enforcement';
  RAISE NOTICE '  - Billing and subscription tracking';
  RAISE NOTICE '  - Existing centres migrated to implicit organizations';
END $$;
