-- Check if admin user exists
SELECT 
  au.id as user_id,
  au.email,
  au.created_at,
  p.full_name,
  p.role,
  p.organization_id,
  o.name as org_name,
  o.slug as org_slug,
  o.custom_domain
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE au.email = 'king@youngeagles.org.za';

-- Check auth.users directly
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'king@youngeagles.org.za';

-- Check profiles
SELECT * FROM profiles WHERE email = 'king@youngeagles.org.za';
