-- Restore profiles from auth.users
-- This will recreate profile entries for all users in auth.users

-- Insert profiles for all auth users that don't have a profile yet
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  CASE 
    -- Set admin@edusitepro.org.za as superadmin
    WHEN au.email = 'admin@edusitepro.org.za' THEN 'superadmin'
    -- Set king@edusitepro.org.za as superadmin
    WHEN au.email = 'king@edusitepro.org.za' THEN 'superadmin'
    -- Set king@youngeagles.org.za as principal (organization admin)
    WHEN au.email = 'king@youngeagles.org.za' THEN 'principal'
    -- Default to user role for others
    ELSE 'user'
  END as role,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify the restored profiles
SELECT 
  id,
  email,
  full_name,
  role,
  organization_id,
  preschool_id,
  created_at
FROM profiles
ORDER BY created_at;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Profiles restored from auth.users table';
    RAISE NOTICE '📧 Check the output above to verify all profiles';
    RAISE NOTICE '🔐 Admin users have been assigned admin roles';
END $$;
