-- Fix zanelemakunyane@gmail.com profile and organization linkage
-- Created: 2025-12-03

-- First, let's check current state and output diagnostics
DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_user_role text;
  v_user_org_id uuid;
  v_org_name text;
  v_org_slug text;
  v_has_registration boolean;
  v_registration_org_id uuid;
BEGIN
  -- Check if user exists in auth.users
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE email = 'zanelemakunyane@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ User zanelemakunyane@gmail.com does NOT exist in auth.users';
    RAISE NOTICE 'ACTION REQUIRED: User must sign up first at /login';
    RETURN;
  END IF;

  RAISE NOTICE '✅ User exists in auth.users: ID = %', v_user_id;

  -- Check profile
  SELECT role, organization_id INTO v_user_role, v_user_org_id
  FROM profiles
  WHERE id = v_user_id;

  IF v_user_role IS NULL THEN
    RAISE NOTICE '❌ Profile does NOT exist for this user';
    RAISE NOTICE 'Will create profile below...';
  ELSE
    RAISE NOTICE '✅ Profile exists: role = %, organization_id = %', 
      COALESCE(v_user_role, 'NULL'), 
      COALESCE(v_user_org_id::text, 'NULL');
  END IF;

  -- Check if user has organization linked
  IF v_user_org_id IS NOT NULL THEN
    SELECT name, slug INTO v_org_name, v_org_slug
    FROM organizations
    WHERE id = v_user_org_id;
    
    IF v_org_name IS NOT NULL THEN
      RAISE NOTICE '✅ User linked to organization: % (slug: %)', v_org_name, v_org_slug;
    ELSE
      RAISE NOTICE '❌ User has organization_id but organization does not exist!';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  User has NO organization_id (cannot access tenant dashboard)';
  END IF;

  -- Check registration requests
  SELECT created_organization_id INTO v_registration_org_id
  FROM registration_requests
  WHERE email = 'zanelemakunyane@gmail.com'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_registration_org_id IS NOT NULL THEN
    RAISE NOTICE '✅ Registration request found with created_organization_id: %', v_registration_org_id;
    RAISE NOTICE 'Will link user to this organization...';
  ELSE
    RAISE NOTICE '⚠️  No registration request found';
    RAISE NOTICE 'Will check for default organization to use...';
  END IF;

  -- Now let's fix the profile
  -- Strategy:
  -- 1. If registration request exists with created_organization_id, use that
  -- 2. Otherwise, use Young Eagles as default (slug: young-eagles)
  -- 3. Set role to principal_admin

  DECLARE
    v_target_org_id uuid;
    v_target_org_name text;
  BEGIN
    -- Try to get org from registration request first
    IF v_registration_org_id IS NOT NULL THEN
      v_target_org_id := v_registration_org_id;
      
      SELECT name INTO v_target_org_name
      FROM organizations
      WHERE id = v_target_org_id;
      
      RAISE NOTICE '→ Using organization from registration request: % (ID: %)', v_target_org_name, v_target_org_id;
    ELSE
      -- Fall back to Young Eagles (or first available org)
      SELECT id, name INTO v_target_org_id, v_target_org_name
      FROM organizations
      WHERE slug = 'young-eagles'
      LIMIT 1;
      
      IF v_target_org_id IS NULL THEN
        -- If Young Eagles doesn't exist, use any org
        SELECT id, name INTO v_target_org_id, v_target_org_name
        FROM organizations
        ORDER BY created_at ASC
        LIMIT 1;
      END IF;
      
      IF v_target_org_id IS NOT NULL THEN
        RAISE NOTICE '→ Using default organization: % (ID: %)', v_target_org_name, v_target_org_id;
      ELSE
        RAISE NOTICE '❌ NO ORGANIZATIONS EXIST! Cannot fix profile.';
        RAISE NOTICE 'ACTION REQUIRED: Create an organization first via /admin/organizations';
        RETURN;
      END IF;
    END IF;

    -- Now upsert the profile
    INSERT INTO profiles (id, email, role, organization_id, created_at, updated_at)
    VALUES (
      v_user_id,
      'zanelemakunyane@gmail.com',
      'principal_admin',
      v_target_org_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'principal_admin',
        organization_id = v_target_org_id,
        updated_at = NOW();

    RAISE NOTICE '✅ Profile fixed successfully!';
    RAISE NOTICE '   - User ID: %', v_user_id;
    RAISE NOTICE '   - Email: zanelemakunyane@gmail.com';
    RAISE NOTICE '   - Role: principal_admin';
    RAISE NOTICE '   - Organization: % (ID: %)', v_target_org_name, v_target_org_id;
    RAISE NOTICE '';
    RAISE NOTICE '✨ User can now log in and access: http://localhost:3000/admin';
    RAISE NOTICE '   or: https://edusitepro.edudashpro.org.za/admin';
  END;
END $$;

-- Verify the fix
SELECT 
  '=== VERIFICATION ===' as status,
  p.id as user_id,
  p.email,
  p.role,
  o.name as organization,
  o.slug as org_slug,
  o.custom_domain
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email = 'zanelemakunyane@gmail.com';
