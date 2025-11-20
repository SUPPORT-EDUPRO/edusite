-- Insert Young Eagles Preschool as the first tenant
INSERT INTO organizations (
  name,
  slug,
  school_code,
  organization_type,
  contact_email,
  contact_phone,
  address,
  min_age,
  max_age,
  grade_levels,
  registration_open,
  registration_message,
  primary_color,
  secondary_color
) VALUES (
  'Young Eagles Preschool',
  'young-eagles',
  'YE-2026',
  'preschool',
  'info@youngeagles.co.za',
  '+27 11 555 1234',
  '123 Education Street, Johannesburg, 2001',
  2,
  6,
  ARRAY['Pre-Primary A', 'Pre-Primary B', 'Reception', 'Grade R'],
  true,
  'Welcome to Young Eagles Preschool! We are now accepting registrations for the 2026 academic year. Join our nurturing environment where young minds take flight!',
  '#3b82f6',
  '#8b5cf6'
) ON CONFLICT (school_code) DO UPDATE SET
  slug = EXCLUDED.slug,
  organization_type = EXCLUDED.organization_type,
  min_age = EXCLUDED.min_age,
  max_age = EXCLUDED.max_age,
  grade_levels = EXCLUDED.grade_levels,
  registration_open = EXCLUDED.registration_open,
  registration_message = EXCLUDED.registration_message;

-- Get the organization ID
SELECT id, name, slug, school_code FROM organizations WHERE slug = 'young-eagles';
