-- Check user profile and organization linkage for login troubleshooting
-- Run this to verify user has correct role and organization_id

-- Check user profile details
SELECT 
  p.id as user_id,
  p.email,
  p.role,
  p.organization_id,
  o.name as organization_name,
  o.slug as organization_slug,
  o.custom_domain,
  o.domain_verified
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email = 'YOUR_EMAIL_HERE'; -- Replace with actual email

-- Check if organization exists
SELECT 
  id,
  name,
  slug,
  custom_domain,
  domain_verified,
  created_at
FROM organizations
WHERE slug = 'your-org-slug'; -- Replace with actual slug

-- Check registration requests (if user was invited)
SELECT 
  id,
  email,
  organization_name,
  organization_slug,
  status,
  created_organization_id,
  created_at
FROM registration_requests
WHERE email = 'YOUR_EMAIL_HERE'; -- Replace with actual email

-- Verify RLS policies allow access
-- (This checks if profile exists and role is set correctly)
SELECT 
  COUNT(*) as profile_count,
  COUNT(DISTINCT organization_id) as org_count,
  string_agg(DISTINCT role, ', ') as roles
FROM profiles
WHERE email = 'YOUR_EMAIL_HERE'; -- Replace with actual email
