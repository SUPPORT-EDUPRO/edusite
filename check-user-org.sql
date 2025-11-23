-- Check if zanelelwndl@gmail.com is linked to Young Eagles
-- Also check registration_requests

-- 1. Check profiles table
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.organization_id,
  o.name as organization_name,
  o.slug as organization_slug,
  p.created_at
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email = 'zanelelwndl@gmail.com';

-- 2. Check registration_requests table
SELECT 
  rr.id,
  rr.guardian_email,
  rr.guardian_name,
  rr.student_first_name,
  rr.student_last_name,
  rr.status,
  rr.organization_id,
  o.name as organization_name,
  o.slug as organization_slug,
  rr.registration_fee_paid,
  rr.campaign_applied,
  rr.discount_amount,
  rr.registration_fee_amount,
  rr.created_at
FROM registration_requests rr
LEFT JOIN organizations o ON rr.organization_id = o.id
WHERE rr.guardian_email = 'zanelelwndl@gmail.com'
ORDER BY rr.created_at DESC;

-- 3. Check Young Eagles organization details
SELECT 
  id,
  name,
  slug,
  organization_type,
  registration_open,
  created_at
FROM organizations
WHERE slug = 'young-eagles' OR name ILIKE '%young eagles%';
