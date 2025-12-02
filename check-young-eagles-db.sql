-- Check Young Eagles organization in database
SELECT 
  id,
  name,
  slug,
  terms_and_conditions_url,
  registration_open,
  organization_type
FROM organizations
WHERE slug ILIKE '%young%eagles%'
   OR name ILIKE '%young%eagles%'
   OR slug = 'young-eagles'
ORDER BY created_at DESC;
