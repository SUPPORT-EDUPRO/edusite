-- Check zanelemakunyane@gmail.com profile and organization linkage

-- 1. Check user in auth.users
SELECT 'AUTH USER:' as check_type, id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'zanelemakunyane@gmail.com';

-- 2. Check profile details
SELECT 'PROFILE:' as check_type, p.id as user_id, p.email, p.role, p.organization_id, o.name as organization_name, o.slug as organization_slug
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email = 'zanelemakunyane@gmail.com';

-- 3. Check registration requests
SELECT 'REGISTRATION:' as check_type, id, email, organization_name, organization_slug, status, created_organization_id, created_at
FROM registration_requests
WHERE email = 'zanelemakunyane@gmail.com'
ORDER BY created_at DESC;

-- 4. List all organizations (to see what's available)
SELECT 'AVAILABLE ORGS:' as check_type, id, name, slug, custom_domain, domain_verified
FROM organizations
ORDER BY created_at DESC
LIMIT 10;
