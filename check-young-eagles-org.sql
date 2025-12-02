-- Check Young Eagles organization in database
SELECT 
  id,
  name,
  slug,
  terms_and_conditions_url,
  registration_open
FROM organizations
WHERE name ILIKE '%young%eagles%'
   OR slug ILIKE '%young%eagles%'
ORDER BY created_at DESC
LIMIT 5;
