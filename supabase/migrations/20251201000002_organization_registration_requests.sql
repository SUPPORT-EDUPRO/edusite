-- ============================================
-- ORGANIZATION REGISTRATION REQUESTS
-- ============================================
-- Stores pending organization sign-ups that require SuperAdmin approval

CREATE TABLE IF NOT EXISTS organization_registration_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Request Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Personal/Contact Info
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, -- Stored temporarily until approval
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  
  -- Organization Details
  organization_name VARCHAR(255) NOT NULL,
  organization_slug VARCHAR(100) NOT NULL UNIQUE CHECK (organization_slug ~ '^[a-z0-9-]+$'),
  plan_tier VARCHAR(20) DEFAULT 'solo' CHECK (plan_tier IN ('solo', 'group_5', 'group_10', 'enterprise')),
  billing_email VARCHAR(255) NOT NULL,
  
  -- Organization Address
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) DEFAULT 'ZA',
  
  -- Campus/Branch Info
  campus_name VARCHAR(255) NOT NULL,
  campus_code VARCHAR(20),
  campus_address TEXT,
  campus_capacity INTEGER DEFAULT 200,
  
  -- Approval Tracking
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Created IDs (after approval)
  created_organization_id UUID, -- Links to organizations table after approval
  created_centre_id UUID, -- Links to centres table after approval
  created_user_id UUID, -- Links to auth.users after approval
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_reg_requests_status ON organization_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_org_reg_requests_email ON organization_registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_org_reg_requests_slug ON organization_registration_requests(organization_slug);
CREATE INDEX IF NOT EXISTS idx_org_reg_requests_created_at ON organization_registration_requests(created_at DESC);

-- RLS Policies
ALTER TABLE organization_registration_requests ENABLE ROW LEVEL SECURITY;

-- SuperAdmins can see all requests
CREATE POLICY "SuperAdmins full access to org registration requests"
  ON organization_registration_requests FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Public can insert (submit registration)
CREATE POLICY "Public can submit organization registrations"
  ON organization_registration_requests FOR INSERT
  WITH CHECK (true);

-- Users can view their own pending request
CREATE POLICY "Users can view their own registration request"
  ON organization_registration_requests FOR SELECT
  USING (email = auth.jwt()->>'email');

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_org_reg_requests_updated_at ON organization_registration_requests;
CREATE TRIGGER update_org_reg_requests_updated_at
  BEFORE UPDATE ON organization_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE organization_registration_requests IS 'Pending organization sign-ups awaiting SuperAdmin approval';
COMMENT ON COLUMN organization_registration_requests.status IS 'pending = awaiting approval, approved = synced to EduDashPro, rejected = denied';
COMMENT ON COLUMN organization_registration_requests.password_hash IS 'Temporarily stored bcrypt hash - deleted after approval';
COMMENT ON COLUMN organization_registration_requests.created_organization_id IS 'UUID of created organization after approval (for tracking)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Organization registration requests table created!';
  RAISE NOTICE 'SuperAdmins can now approve pending organization sign-ups';
END $$;
