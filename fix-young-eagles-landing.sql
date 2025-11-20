-- Create landing page for Young Eagles Preschool
INSERT INTO organization_landing_pages (
  organization_id,
  hero_title,
  hero_subtitle,
  hero_cta_text,
  hero_cta_link,
  about_title,
  about_description,
  is_published,
  created_at,
  updated_at
) VALUES (
  '6b92f8a5-48e7-4865-b85f-4b92c174e0ef',
  'Welcome to Young Eagles Preschool',
  'Nurturing young minds to soar to new heights in Pretoria',
  'Enroll Your Child',
  '/register',
  'About Young Eagles',
  'Young Eagles Preschool is a premier early childhood education center in Pretoria, Gauteng. We provide a nurturing and stimulating environment where children learn through play, exploration, and discovery. Our experienced educators are committed to developing the whole child - intellectually, socially, emotionally, and physically.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (organization_id) 
DO UPDATE SET
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
