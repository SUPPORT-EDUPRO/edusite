-- =====================================================
-- EDUSITEPRO ADMIN & CUSTOM DOMAIN SETUP
-- =====================================================

-- Step 1: Create user_organizations table for admin access control
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_orgs_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org_id ON user_organizations(organization_id);

-- Enable RLS
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own organization memberships"
ON user_organizations FOR SELECT
USING (user_id = auth.uid());

-- Step 2: Add custom_domain column to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS domain_verification_token TEXT;

-- Index for domain lookups
CREATE INDEX IF NOT EXISTS idx_orgs_custom_domain ON organizations(custom_domain);
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON organizations(slug);

-- Step 3: Create admin users table for EduSitePro staff
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view all admin users
CREATE POLICY "Admins can view admin users"
ON admin_users FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Step 4: Create function to create tenant admin
CREATE OR REPLACE FUNCTION create_tenant_admin(
  p_organization_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_password TEXT,
  p_role TEXT DEFAULT 'owner'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('provider', 'email'),
    jsonb_build_object('full_name', p_full_name),
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO v_user_id;

  -- Create profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    preschool_id
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    'principal_admin',
    p_organization_id
  );

  -- Link to organization
  INSERT INTO user_organizations (
    user_id,
    organization_id,
    role
  ) VALUES (
    v_user_id,
    p_organization_id,
    p_role
  );

  -- Return result
  v_result := json_build_object(
    'success', TRUE,
    'user_id', v_user_id,
    'email', p_email,
    'organization_id', p_organization_id
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', FALSE,
    'error', SQLERRM
  );
END;
$$;

-- Step 5: Create helper function to verify custom domain
CREATE OR REPLACE FUNCTION verify_custom_domain(p_domain TEXT)
RETURNS TABLE(
  organization_id UUID,
  organization_name TEXT,
  slug TEXT,
  verified BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.domain_verified
  FROM organizations o
  WHERE o.custom_domain = p_domain
  OR o.slug = REPLACE(SPLIT_PART(p_domain, '.', 1), 'www', '')
  LIMIT 1;
END;
$$;

-- Step 6: Sample data - Create first admin user for testing
-- Password: Admin@123 (CHANGE THIS IN PRODUCTION!)
/*
SELECT create_tenant_admin(
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1'::UUID,
  'admin@youngeagles.co.za',
  'Young Eagles Admin',
  'Admin@123',
  'owner'
);
*/

-- Step 7: Update organizations for custom domain support
UPDATE organizations 
SET 
  custom_domain = 'youngeagles.co.za',
  domain_verified = FALSE
WHERE slug = 'youngeagles';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check user_organizations
SELECT 
  uo.id,
  uo.user_id,
  u.email,
  uo.organization_id,
  o.name as org_name,
  uo.role,
  uo.created_at
FROM user_organizations uo
JOIN auth.users u ON u.id = uo.user_id
JOIN organizations o ON o.id = uo.organization_id
ORDER BY uo.created_at DESC;

-- Check organizations with domains
SELECT 
  id,
  name,
  slug,
  custom_domain,
  domain_verified,
  created_at
FROM organizations
ORDER BY created_at DESC;
