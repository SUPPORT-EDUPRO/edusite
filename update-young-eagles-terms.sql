-- Update Young Eagles Preschool with Terms and Conditions URL
-- Run this in Supabase SQL Editor

UPDATE organizations
SET 
  terms_and_conditions_url = 'https://edusitepro.vercel.app/terms-young-eagles.html',
  updated_at = NOW()
WHERE slug = 'young-eagles-preschool'
   OR name ILIKE '%young eagles%';

-- Verify the update
SELECT 
  id,
  name,
  slug,
  terms_and_conditions_url,
  registration_open
FROM organizations
WHERE slug = 'young-eagles-preschool'
   OR name ILIKE '%young eagles%';
