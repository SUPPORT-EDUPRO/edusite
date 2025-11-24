-- Fix Admin Access for EduSitePro
-- This script checks and fixes admin access issues

-- Step 1: Check current profiles
SELECT 
  id,
  email,
  full_name,
  role,
  organization_id,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Set admin role for specific user (replace with actual email)
-- UPDATE profiles 
-- SET role = 'superadmin',
--     full_name = COALESCE(full_name, 'Admin User')
-- WHERE email = 'your-email@example.com';

-- Step 3: Create a new superadmin user if needed
-- First, check if user exists in auth.users
-- SELECT id, email FROM auth.users WHERE email = 'admin@edusitepro.org.za';

-- Then insert/update in profiles
-- INSERT INTO profiles (id, email, full_name, role, organization_id)
-- VALUES (
--   'user-uuid-from-auth-users',
--   'admin@edusitepro.org.za',
--   'EduSitePro Admin',
--   'superadmin',
--   NULL  -- Platform admin doesn't need organization_id
-- )
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'superadmin',
--     full_name = 'EduSitePro Admin';

-- Step 4: Verify the fix
-- SELECT id, email, full_name, role, organization_id
-- FROM profiles
-- WHERE email = 'your-email@example.com';
