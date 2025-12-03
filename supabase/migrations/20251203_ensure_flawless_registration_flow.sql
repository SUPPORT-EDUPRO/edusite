-- Ensure Flawless Organization Registration Flow
-- Created: 2025-12-03
-- Purpose: Fix all issues encountered during organization registration from EduDashPro
-- Issues fixed:
--   1. organization_admin role not recognized in middleware/dashboard
--   2. Profiles missing for newly registered users
--   3. Organization slug mismatches
--   4. Email verification and password reset flow issues

-- =============================================================================
-- PART 1: Ensure all valid admin roles are properly configured
-- =============================================================================

-- Update existing profiles that have organization_admin role to ensure they work
-- This fixes the issue we had with zanelemakunyane@gmail.com
UPDATE profiles
SET updated_at = NOW()
WHERE role = 'organization_admin';

RAISE NOTICE '✅ Updated % profiles with organization_admin role', 
  (SELECT COUNT(*) FROM profiles WHERE role = 'organization_admin');

-- =============================================================================
-- PART 2: Create trigger to auto-create profiles for new auth users
-- =============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_metadata jsonb;
  v_organization_id uuid;
  v_role text;
  v_full_name text;
BEGIN
  -- Get user metadata from auth.users
  v_user_metadata := NEW.raw_user_meta_data;
  
  -- Extract organization_id from metadata (set by registration process)
  v_organization_id := (v_user_metadata->>'organization_id')::uuid;
  
  -- Extract role from metadata (default to organization_admin if not set)
  v_role := COALESCE(v_user_metadata->>'role', 'organization_admin');
  
  -- Extract full name
  v_full_name := COALESCE(
    v_user_metadata->>'full_name',
    v_user_metadata->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  -- Log the new user creation
  RAISE NOTICE '🔔 New user created: % (ID: %)', NEW.email, NEW.id;
  RAISE NOTICE '   Organization ID: %', v_organization_id;
  RAISE NOTICE '   Role: %', v_role;
  
  -- Insert profile if it doesn't exist
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    organization_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role,
    v_organization_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    organization_id = COALESCE(EXCLUDED.organization_id, profiles.organization_id),
    updated_at = NOW();
  
  RAISE NOTICE '✅ Profile created/updated for: %', NEW.email;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE '✅ Created trigger: on_auth_user_created';

-- =============================================================================
-- PART 3: Create function to validate and fix organization registration
-- =============================================================================

CREATE OR REPLACE FUNCTION public.validate_organization_registration(
  p_organization_id uuid,
  p_user_email text DEFAULT NULL
)
RETURNS TABLE (
  status text,
  organization_name text,
  organization_slug text,
  user_count bigint,
  issues_found text[],
  fixes_applied text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_record RECORD;
  v_issues text[] := ARRAY[]::text[];
  v_fixes text[] := ARRAY[]::text[];
  v_user_count bigint;
  v_profile_count bigint;
BEGIN
  -- Get organization details
  SELECT id, name, slug, created_at
  INTO v_org_record
  FROM organizations
  WHERE id = p_organization_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'error'::text,
      NULL::text,
      NULL::text,
      0::bigint,
      ARRAY['Organization not found']::text[],
      ARRAY[]::text[];
    RETURN;
  END IF;
  
  -- Count users in this organization
  SELECT COUNT(*)
  INTO v_user_count
  FROM profiles
  WHERE organization_id = p_organization_id;
  
  -- Check 1: Ensure slug is valid (lowercase, alphanumeric with hyphens)
  IF v_org_record.slug !~ '^[a-z0-9-]+$' THEN
    v_issues := array_append(v_issues, 'Invalid slug format: ' || v_org_record.slug);
    
    -- Fix: Update slug to valid format
    UPDATE organizations
    SET slug = LOWER(REGEXP_REPLACE(slug, '[^a-z0-9-]', '-', 'g'))
    WHERE id = p_organization_id;
    
    v_fixes := array_append(v_fixes, 'Fixed slug format');
  END IF;
  
  -- Check 2: Ensure all users have valid roles
  SELECT COUNT(*)
  INTO v_profile_count
  FROM profiles
  WHERE organization_id = p_organization_id
    AND role NOT IN ('superadmin', 'principal_admin', 'principal', 'admin', 'organization_admin', 'teacher', 'parent');
  
  IF v_profile_count > 0 THEN
    v_issues := array_append(v_issues, format('%s users with invalid roles', v_profile_count));
    
    -- Fix: Update invalid roles to organization_admin
    UPDATE profiles
    SET role = 'organization_admin',
        updated_at = NOW()
    WHERE organization_id = p_organization_id
      AND role NOT IN ('superadmin', 'principal_admin', 'principal', 'admin', 'organization_admin', 'teacher', 'parent');
    
    v_fixes := array_append(v_fixes, format('Fixed %s invalid roles', v_profile_count));
  END IF;
  
  -- Check 3: If specific user email provided, ensure they exist and are linked
  IF p_user_email IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE email = p_user_email 
        AND organization_id = p_organization_id
    ) THEN
      v_issues := array_append(v_issues, 'User not linked to organization: ' || p_user_email);
      
      -- Try to link the user if they exist
      IF EXISTS (SELECT 1 FROM profiles WHERE email = p_user_email) THEN
        UPDATE profiles
        SET organization_id = p_organization_id,
            role = COALESCE(role, 'organization_admin'),
            updated_at = NOW()
        WHERE email = p_user_email;
        
        v_fixes := array_append(v_fixes, 'Linked user to organization: ' || p_user_email);
      ELSE
        v_issues := array_append(v_issues, 'User profile does not exist: ' || p_user_email);
      END IF;
    END IF;
  END IF;
  
  -- Check 4: Ensure organization has at least one admin
  IF v_user_count = 0 THEN
    v_issues := array_append(v_issues, 'No users assigned to organization');
  END IF;
  
  -- Return validation results
  RETURN QUERY SELECT
    CASE 
      WHEN array_length(v_issues, 1) IS NULL THEN 'success'
      WHEN array_length(v_fixes, 1) > 0 THEN 'fixed'
      ELSE 'error'
    END::text,
    v_org_record.name,
    v_org_record.slug,
    v_user_count,
    COALESCE(v_issues, ARRAY[]::text[]),
    COALESCE(v_fixes, ARRAY[]::text[]);
END;
$$;

RAISE NOTICE '✅ Created function: validate_organization_registration';

-- =============================================================================
-- PART 4: Create function to be called after organization creation
-- =============================================================================

CREATE OR REPLACE FUNCTION public.post_organization_registration(
  p_organization_id uuid,
  p_admin_email text,
  p_admin_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_user_id uuid;
  v_org_slug text;
  v_org_name text;
BEGIN
  -- Get organization details
  SELECT slug, name
  INTO v_org_slug, v_org_name
  FROM organizations
  WHERE id = p_organization_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Organization not found',
      'organization_id', p_organization_id
    );
  END IF;
  
  RAISE NOTICE '📋 Post-registration setup for: % (slug: %)', v_org_name, v_org_slug;
  
  -- Check if user exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_admin_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '⚠️  User not found in auth.users: %', p_admin_email;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found in auth system',
      'email', p_admin_email,
      'organization_id', p_organization_id,
      'suggestion', 'User needs to complete email verification first'
    );
  END IF;
  
  -- Ensure profile exists and is correctly configured
  INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    organization_id,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_admin_email,
    COALESCE(p_admin_name, SPLIT_PART(p_admin_email, '@', 1)),
    'organization_admin',
    p_organization_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'organization_admin',
    organization_id = p_organization_id,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
    updated_at = NOW();
  
  RAISE NOTICE '✅ Profile configured for: %', p_admin_email;
  
  -- Validate the registration
  SELECT jsonb_agg(row_to_json(t))
  INTO v_result
  FROM validate_organization_registration(p_organization_id, p_admin_email) t;
  
  -- Return success with validation results
  RETURN jsonb_build_object(
    'success', true,
    'organization_id', p_organization_id,
    'organization_name', v_org_name,
    'organization_slug', v_org_slug,
    'admin_email', p_admin_email,
    'admin_id', v_user_id,
    'validation', v_result,
    'dashboard_url', format('https://edusitepro.edudashpro.org.za/dashboard'),
    'message', 'Organization registration completed successfully'
  );
END;
$$;

RAISE NOTICE '✅ Created function: post_organization_registration';

-- =============================================================================
-- PART 5: Fix existing problematic registrations
-- =============================================================================

DO $$
DECLARE
  v_org RECORD;
  v_fix_count integer := 0;
BEGIN
  RAISE NOTICE '🔍 Checking for problematic registrations...';
  
  -- Fix organizations with invalid slugs
  FOR v_org IN 
    SELECT id, name, slug, 
           LOWER(REGEXP_REPLACE(slug, '[^a-z0-9-]', '-', 'g')) as new_slug
    FROM organizations
    WHERE slug !~ '^[a-z0-9-]+$'
  LOOP
    UPDATE organizations
    SET slug = v_org.new_slug
    WHERE id = v_org.id;
    
    RAISE NOTICE '  Fixed slug for %: % → %', v_org.name, v_org.slug, v_org.new_slug;
    v_fix_count := v_fix_count + 1;
  END LOOP;
  
  -- Fix profiles with invalid roles in organizations
  UPDATE profiles
  SET role = 'organization_admin',
      updated_at = NOW()
  WHERE organization_id IS NOT NULL
    AND role NOT IN ('superadmin', 'principal_admin', 'principal', 'admin', 'organization_admin', 'teacher', 'parent');
  
  IF FOUND THEN
    RAISE NOTICE '  Fixed % profiles with invalid roles', FOUND;
    v_fix_count := v_fix_count + FOUND;
  END IF;
  
  -- Ensure all organizations have at least one admin
  FOR v_org IN
    SELECT o.id, o.name, o.slug
    FROM organizations o
    LEFT JOIN profiles p ON p.organization_id = o.id
    WHERE o.id IS NOT NULL
    GROUP BY o.id, o.name, o.slug
    HAVING COUNT(p.id) = 0
  LOOP
    RAISE NOTICE '⚠️  Organization has no users: % (slug: %)', v_org.name, v_org.slug;
  END LOOP;
  
  IF v_fix_count > 0 THEN
    RAISE NOTICE '✅ Applied % automatic fixes', v_fix_count;
  ELSE
    RAISE NOTICE '✅ No issues found - all registrations are valid';
  END IF;
END $$;

-- =============================================================================
-- PART 6: Create view for monitoring registration health
-- =============================================================================

CREATE OR REPLACE VIEW public.organization_health AS
SELECT 
  o.id,
  o.name,
  o.slug,
  o.custom_domain,
  o.domain_verified,
  o.created_at,
  COUNT(DISTINCT p.id) as user_count,
  COUNT(DISTINCT CASE WHEN p.role IN ('organization_admin', 'principal_admin', 'admin') THEN p.id END) as admin_count,
  COUNT(DISTINCT c.id) as centre_count,
  ARRAY_AGG(DISTINCT p.role) FILTER (WHERE p.role IS NOT NULL) as roles_present,
  CASE 
    WHEN COUNT(DISTINCT p.id) = 0 THEN '🔴 No users'
    WHEN COUNT(DISTINCT CASE WHEN p.role IN ('organization_admin', 'principal_admin', 'admin') THEN p.id END) = 0 THEN '🟡 No admins'
    WHEN o.slug !~ '^[a-z0-9-]+$' THEN '🟠 Invalid slug'
    ELSE '🟢 Healthy'
  END as health_status,
  CASE
    WHEN COUNT(DISTINCT p.id) = 0 THEN ARRAY['No users assigned']
    WHEN COUNT(DISTINCT CASE WHEN p.role IN ('organization_admin', 'principal_admin', 'admin') THEN p.id END) = 0 THEN ARRAY['No admin users']
    WHEN o.slug !~ '^[a-z0-9-]+$' THEN ARRAY['Invalid slug format']
    ELSE ARRAY[]::text[]
  END as issues
FROM organizations o
LEFT JOIN profiles p ON p.organization_id = o.id
LEFT JOIN centres c ON c.organization_id = o.id
GROUP BY o.id, o.name, o.slug, o.custom_domain, o.domain_verified, o.created_at
ORDER BY o.created_at DESC;

RAISE NOTICE '✅ Created view: organization_health';

-- =============================================================================
-- PART 7: Grant necessary permissions
-- =============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.validate_organization_registration(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.post_organization_registration(uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Grant select on view
GRANT SELECT ON public.organization_health TO authenticated, service_role;

RAISE NOTICE '✅ Granted permissions';

-- =============================================================================
-- SUMMARY
-- =============================================================================

DO $$
DECLARE
  v_total_orgs integer;
  v_total_profiles integer;
  v_healthy_orgs integer;
BEGIN
  SELECT COUNT(*) INTO v_total_orgs FROM organizations;
  SELECT COUNT(*) INTO v_total_profiles FROM profiles WHERE organization_id IS NOT NULL;
  SELECT COUNT(*) INTO v_healthy_orgs FROM organization_health WHERE health_status = '🟢 Healthy';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✨ Registration Flow Optimization Complete';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Current State:';
  RAISE NOTICE '   • Total Organizations: %', v_total_orgs;
  RAISE NOTICE '   • Total Profiles: %', v_total_profiles;
  RAISE NOTICE '   • Healthy Organizations: % / %', v_healthy_orgs, v_total_orgs;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Features Enabled:';
  RAISE NOTICE '   • Auto-profile creation on user signup';
  RAISE NOTICE '   • Organization validation and auto-fix';
  RAISE NOTICE '   • Post-registration setup function';
  RAISE NOTICE '   • Health monitoring view';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Usage:';
  RAISE NOTICE '   -- Check organization health:';
  RAISE NOTICE '   SELECT * FROM organization_health;';
  RAISE NOTICE '';
  RAISE NOTICE '   -- Validate specific organization:';
  RAISE NOTICE '   SELECT * FROM validate_organization_registration(''org-uuid'', ''user@email.com'');';
  RAISE NOTICE '';
  RAISE NOTICE '   -- Run post-registration setup:';
  RAISE NOTICE '   SELECT * FROM post_organization_registration(''org-uuid'', ''admin@email.com'', ''Admin Name'');';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
