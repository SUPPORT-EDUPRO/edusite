-- ============================================
-- Setup Dave Conradie as Tertiary Admin
-- ============================================
-- This creates the tenant admin account in edusitepro (CMS platform)
-- The account should already exist in edudashpro (education platform)
-- Both accounts share the same organization_id for cross-platform tenant isolation

-- ============================================
-- STEP 1: Find or Create Organization
-- ============================================

-- Check if organization exists
DO $$
DECLARE
  existing_org_id UUID;
  shared_org_id UUID := '550e8400-e29b-41d4-a716-446655440001'::UUID; -- Shared with edudashpro
BEGIN
  -- Check if organization already exists
  SELECT id INTO existing_org_id
  FROM organizations
  WHERE id = shared_org_id;
  
  -- If not exists, create it
  IF existing_org_id IS NULL THEN
    INSERT INTO organizations (
      id,
      name,
      slug,
      plan_tier,
      max_centres,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      subscription_status,
      status
    ) VALUES (
      shared_org_id,
      'Dave Conradie Tertiary Education',
      'davecon-tertiary',
      'enterprise',
      999, -- Unlimited for tertiary
      'Dave Conradie',
      'davecon12martin@outlook.com',
      '+27123456789',
      'active',
      'active'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Organization created with ID: %', shared_org_id;
  ELSE
    RAISE NOTICE '✅ Organization already exists with ID: %', existing_org_id;
  END IF;
END $$;

-- ============================================
-- STEP 2: Create User in auth.users
-- ============================================

-- Note: This creates the user in Supabase Auth
-- If user already exists, this will skip
DO $$
DECLARE
  new_user_id UUID;
  shared_org_id UUID := '550e8400-e29b-41d4-a716-446655440001'::UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'davecon12martin@outlook.com';
  
  IF new_user_id IS NULL THEN
    -- Create user (requires password reset)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'davecon12martin@outlook.com',
      crypt('TempPassword123!', gen_salt('bf')), -- Will be reset
      NOW(),
      NOW(),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object(
        'full_name', 'Dave Conradie',
        'role', 'organization_admin',
        'organization_id', shared_org_id::text
      ),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;
    
    RAISE NOTICE '✅ User created with ID: %', new_user_id;
    RAISE NOTICE '📧 Email: davecon12martin@outlook.com';
    RAISE NOTICE '🔐 Temp Password: TempPassword123! (MUST reset immediately)';
  ELSE
    RAISE NOTICE '✅ User already exists with ID: %', new_user_id;
  END IF;
  
  -- ============================================
  -- STEP 3: Create Profile
  -- ============================================
  
  -- Create or update profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    organization_id
  ) VALUES (
    new_user_id,
    'davecon12martin@outlook.com',
    'Dave Conradie',
    'organization_admin',
    shared_org_id
  )
  ON CONFLICT (id) DO UPDATE SET
    organization_id = shared_org_id,
    role = 'organization_admin',
    updated_at = NOW();
  
  RAISE NOTICE '✅ Profile created/updated for user';
  
END $$;

-- ============================================
-- STEP 4: Create Centre (Campus)
-- ============================================

DO $$
DECLARE
  shared_org_id UUID := '550e8400-e29b-41d4-a716-446655440001'::UUID;
  centre_id UUID;
BEGIN
  -- Check if centre exists
  SELECT id INTO centre_id
  FROM centres
  WHERE organization_id = shared_org_id
  AND slug = 'main-campus';
  
  IF centre_id IS NULL THEN
    INSERT INTO centres (
      organization_id,
      name,
      slug,
      code,
      status,
      capacity,
      contact_email,
      contact_phone,
      address_line1,
      city,
      province,
      postal_code,
      country
    ) VALUES (
      shared_org_id,
      'Main Campus - Dave Conradie Tertiary',
      'main-campus',
      'DC-MAIN',
      'active',
      500,
      'davecon12martin@outlook.com',
      '+27123456789',
      '123 Education Street',
      'Cape Town',
      'Western Cape',
      '8001',
      'ZA'
    )
    RETURNING id INTO centre_id;
    
    RAISE NOTICE '✅ Centre created with ID: %', centre_id;
  ELSE
    RAISE NOTICE '✅ Centre already exists with ID: %', centre_id;
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check organization
SELECT 
  id,
  name,
  slug,
  plan_tier,
  primary_contact_email,
  status
FROM organizations
WHERE id = '550e8400-e29b-41d4-a716-446655440001'::UUID;

-- Check user and profile
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.organization_id,
  o.name as organization_name
FROM auth.users u
JOIN profiles p ON p.id = u.id
JOIN organizations o ON o.id = p.organization_id
WHERE u.email = 'davecon12martin@outlook.com';

-- Check centre
SELECT 
  c.id,
  c.name,
  c.slug,
  c.code,
  c.status,
  o.name as organization_name
FROM centres c
JOIN organizations o ON o.id = c.organization_id
WHERE o.id = '550e8400-e29b-41d4-a716-446655440001'::UUID;

-- ============================================
-- SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ EDUSITEPRO TENANT ADMIN SETUP COMPLETE';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Organization ID: 550e8400-e29b-41d4-a716-446655440001';
  RAISE NOTICE 'This ID is SHARED with EduDashPro for tenant isolation';
  RAISE NOTICE '';
  RAISE NOTICE 'Login Credentials:';
  RAISE NOTICE '  Email: davecon12martin@outlook.com';
  RAISE NOTICE '  Password: TempPassword123!';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: User must reset password on first login';
  RAISE NOTICE '';
  RAISE NOTICE 'Platform Access:';
  RAISE NOTICE '  📝 EduSitePro (CMS): https://edusitepro.edudashpro.org.za';
  RAISE NOTICE '  🎓 EduDashPro (LMS): https://edudashpro.org.za';
  RAISE NOTICE '';
  RAISE NOTICE 'Both platforms use the SAME organization_id for data isolation';
  RAISE NOTICE '=================================================';
END $$;
