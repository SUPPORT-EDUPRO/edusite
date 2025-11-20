-- =====================================================
-- COMPLETE ORGANIZATION ONBOARDING WORKFLOW
-- Creates organization + admin user + default settings
-- =====================================================

-- This would be run by EduSitePro team when onboarding a new school
-- Or automated via an admin panel

-- Example: Onboarding "ABC Primary School"

BEGIN;

-- STEP 1: Create Organization
INSERT INTO organizations (
  name,
  slug,
  organization_type,
  registration_open,
  registration_message,
  min_age,
  max_age,
  school_code,
  academic_year
) VALUES (
  'ABC Primary School',
  'abc-primary',
  'primary_school',
  true,
  'Now enrolling for 2026 academic year!',
  6,
  13,
  'ABC-2026',
  '2026'
) RETURNING id;

-- Store the organization ID for use in next steps
-- In real implementation, this would be captured programmatically
-- For this example, let's say it returns: 'org-abc-uuid'

-- STEP 2: Create Admin User Account
-- This is done via Supabase Auth API, not SQL
-- The admin signup flow would look like:

/*
Via Supabase Admin API or invite system:

const { data: user, error } = await supabase.auth.admin.createUser({
  email: 'admin@abcprimary.co.za',
  password: 'TempPassword123!', // Auto-generated secure password
  email_confirm: true, // Auto-confirm email
  user_metadata: {
    full_name: 'Principal John Smith',
    organization_slug: 'abc-primary',
    role: 'admin'
  }
});

// User gets email:
// "Welcome to EduSitePro! Your account has been created.
//  Email: admin@abcprimary.co.za
//  Temporary Password: TempPassword123!
//  Please login and change your password: https://edusitepro.edudashpro.org.za/login"
*/

-- STEP 3: Link User to Organization
-- After user is created in Supabase Auth, link them to the org
INSERT INTO user_organizations (
  user_id,
  organization_id,
  role,
  permissions
) VALUES (
  'user-abc-admin-uuid', -- From Supabase Auth createUser response
  'org-abc-uuid', -- From Step 1
  'admin',
  ARRAY['manage_organization', 'manage_campaigns', 'manage_registrations', 'manage_payments', 'manage_classes']
);

-- STEP 4: Set Default Fee Structure
INSERT INTO organization_fee_structures (
  organization_id,
  fee_type,
  amount,
  description,
  payment_frequency,
  mandatory,
  active,
  academic_year
) VALUES 
  ('org-abc-uuid', 'registration_fee', 500.00, 'One-time registration fee', 'once', true, true, '2026'),
  ('org-abc-uuid', 'tuition_monthly', 3500.00, 'Monthly tuition fee', 'monthly', true, true, '2026');

-- STEP 5: Create Default Landing Page
INSERT INTO organization_landing_pages (
  organization_id,
  hero_title,
  hero_subtitle,
  hero_cta_text,
  stats,
  published
) VALUES (
  'org-abc-uuid',
  'Welcome to ABC Primary School',
  'Providing quality education since 2010',
  'Register Your Child',
  '{"students": 0, "teachers": 0, "years": 15, "satisfaction": 95}',
  true
);

-- STEP 6: Create Welcome Campaign (Optional)
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
  auto_apply,
  active,
  featured
) VALUES (
  'org-abc-uuid',
  'Welcome Early Bird Special',
  'early_bird',
  'Register in your first month and save 20%!',
  'percentage',
  20.00,
  'WELCOME20',
  50,
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  true,
  true
);

-- STEP 7: Create Audit Log Entry
INSERT INTO audit_logs (
  user_id,
  organization_id,
  action,
  resource_type,
  changes,
  ip_address
) VALUES (
  'edusitepro-admin-uuid', -- System admin who created the org
  'org-abc-uuid',
  'create_organization',
  'organization',
  '{"name": "ABC Primary School", "slug": "abc-primary", "admin_email": "admin@abcprimary.co.za"}',
  '127.0.0.1'
);

COMMIT;

-- =====================================================
-- AUTOMATED ONBOARDING FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_new_organization(
  p_org_name TEXT,
  p_org_slug TEXT,
  p_org_type TEXT,
  p_admin_email TEXT,
  p_admin_name TEXT,
  p_min_age INTEGER DEFAULT NULL,
  p_max_age INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_org_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Create organization
  INSERT INTO organizations (
    name,
    slug,
    organization_type,
    registration_open,
    min_age,
    max_age,
    academic_year
  ) VALUES (
    p_org_name,
    p_org_slug,
    p_org_type,
    true,
    p_min_age,
    p_max_age,
    '2026'
  ) RETURNING id INTO v_org_id;

  -- 2. Set default fee structure
  INSERT INTO organization_fee_structures (
    organization_id,
    fee_type,
    amount,
    description,
    payment_frequency,
    mandatory,
    active,
    academic_year
  ) VALUES 
    (v_org_id, 'registration_fee', 500.00, 'Registration fee', 'once', true, true, '2026');

  -- 3. Create default landing page
  INSERT INTO organization_landing_pages (
    organization_id,
    hero_title,
    published
  ) VALUES (
    v_org_id,
    'Welcome to ' || p_org_name,
    true
  );

  -- 4. Return success with organization details
  v_result := jsonb_build_object(
    'success', true,
    'organization_id', v_org_id,
    'organization_slug', p_org_slug,
    'admin_email', p_admin_email,
    'admin_url', 'https://edusitepro.edudashpro.org.za/login',
    'public_url', 'https://edusitepro.edudashpro.org.za/' || p_org_slug,
    'registration_url', 'https://edusitepro.edudashpro.org.za/register'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXAMPLE USAGE
-- =====================================================

-- Create new organization (database side)
SELECT create_new_organization(
  'ABC Primary School',           -- Organization name
  'abc-primary',                   -- Slug (URL-friendly)
  'primary_school',                -- Type
  'admin@abcprimary.co.za',       -- Admin email
  'Principal John Smith',          -- Admin name
  6,                               -- Min age
  13                               -- Max age
);

-- Returns:
/*
{
  "success": true,
  "organization_id": "uuid-here",
  "organization_slug": "abc-primary",
  "admin_email": "admin@abcprimary.co.za",
  "admin_url": "https://edusitepro.edudashpro.org.za/login",
  "public_url": "https://edusitepro.edudashpro.org.za/abc-primary",
  "registration_url": "https://edusitepro.edudashpro.org.za/register"
}
*/

-- Then the application would:
-- 1. Create Supabase Auth user
-- 2. Link user to organization via user_organizations
-- 3. Send welcome email to admin

-- =====================================================
-- AUDIT LOG TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- =====================================================
-- USER_ORGANIZATIONS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- References auth.users (Supabase Auth)
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- 'admin', 'principal', 'teacher', 'staff'
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id);

-- Enable RLS
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own organization memberships
CREATE POLICY "Users see own org memberships"
ON user_organizations FOR SELECT
USING (user_id = auth.uid());

-- Policy: Admins can manage users in their organization
CREATE POLICY "Admins manage org users"
ON user_organizations FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'principal')
  )
);

COMMENT ON TABLE user_organizations IS 'Links users to organizations with roles and permissions';
COMMENT ON TABLE audit_logs IS 'Tracks all admin actions for compliance and security';
