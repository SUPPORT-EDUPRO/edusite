-- Create a home page for Young Eagles in the pages table
INSERT INTO pages (
  centre_id,
  slug,
  title,
  meta_description,
  is_published,
  created_at,
  updated_at
) VALUES (
  '6b92f8a5-48e7-4865-b85f-4b92c174e0ef',
  'young-eagles',
  'Young Eagles Education Platform - Premium Daycare & Early Learning',
  'Award-winning daycare and early learning center featuring Society 5.0 integration, STEM programs, and comprehensive child development for ages 6 months to 6 years.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (centre_id, slug) 
DO UPDATE SET
  is_published = true,
  title = EXCLUDED.title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW()
RETURNING id;
