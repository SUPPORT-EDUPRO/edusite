-- Add organization type support for different educational institutions
-- This supports: Preschools, K-12 Schools, FET Colleges, Training Organizations

-- Add organization_type enum
CREATE TYPE organization_type AS ENUM (
  'preschool',
  'primary_school',
  'high_school',
  'k12_school',
  'fet_college',
  'training_center',
  'university',
  'other'
);

-- Add new columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS organization_type organization_type DEFAULT 'preschool',
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS registration_message TEXT,
ADD COLUMN IF NOT EXISTS min_age INTEGER,
ADD COLUMN IF NOT EXISTS max_age INTEGER,
ADD COLUMN IF NOT EXISTS grade_levels TEXT[];

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Update existing Young Eagles record
UPDATE organizations 
SET 
  organization_type = 'preschool',
  slug = 'young-eagles',
  min_age = 2,
  max_age = 6,
  grade_levels = ARRAY['Pre-Primary A', 'Pre-Primary B', 'Reception', 'Grade R'],
  registration_open = true,
  registration_message = 'Welcome to Young Eagles Preschool! We are now accepting registrations for the 2026 academic year.'
WHERE name = 'Young Eagles Preschool';

-- Add organization type specific fields to classes table
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS class_type VARCHAR(50), -- e.g., 'toddler', 'grade', 'course', 'module'
ADD COLUMN IF NOT EXISTS age_range VARCHAR(50), -- e.g., '2-3 years', '13-18 years'
ADD COLUMN IF NOT EXISTS duration VARCHAR(50), -- e.g., 'Full Year', 'Semester', '6 Months'
ADD COLUMN IF NOT EXISTS prerequisites TEXT[];

-- Add comments for clarity
COMMENT ON COLUMN organizations.organization_type IS 'Type of educational institution';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly identifier for website builder (e.g., young-eagles)';
COMMENT ON COLUMN organizations.logo_url IS 'URL to organization logo for branding';
COMMENT ON COLUMN organizations.primary_color IS 'Primary brand color (hex format)';
COMMENT ON COLUMN organizations.secondary_color IS 'Secondary brand color (hex format)';
COMMENT ON COLUMN organizations.registration_open IS 'Whether registration is currently accepting new applications';
COMMENT ON COLUMN organizations.registration_message IS 'Custom message shown on registration page';
COMMENT ON COLUMN organizations.min_age IS 'Minimum age for enrollment';
COMMENT ON COLUMN organizations.max_age IS 'Maximum age for enrollment';
COMMENT ON COLUMN organizations.grade_levels IS 'Available grade levels/classes for this organization type';

COMMENT ON COLUMN classes.class_type IS 'Type of class based on organization type';
COMMENT ON COLUMN classes.age_range IS 'Age range for this class';
COMMENT ON COLUMN classes.duration IS 'Duration of the class/course';

-- Create function to generate slug from organization name
CREATE OR REPLACE FUNCTION generate_organization_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
DROP TRIGGER IF EXISTS trg_generate_organization_slug ON organizations;
CREATE TRIGGER trg_generate_organization_slug
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION generate_organization_slug();

-- Create view for organization branding info (useful for website builder)
CREATE OR REPLACE VIEW organization_branding AS
SELECT 
  id,
  name,
  slug,
  organization_type,
  logo_url,
  primary_color,
  secondary_color,
  website_url,
  registration_open,
  registration_message,
  min_age,
  max_age,
  grade_levels,
  contact_email,
  contact_phone,
  address
FROM organizations;

-- Grant permissions
GRANT SELECT ON organization_branding TO authenticated, anon;

-- Sample data for different organization types (for testing)
INSERT INTO organizations (name, organization_type, slug, min_age, max_age, grade_levels, school_code, contact_email, contact_phone, address) 
VALUES 
  (
    'Sunrise Primary School',
    'primary_school',
    'sunrise-primary',
    6,
    13,
    ARRAY['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'],
    'SPS-2026',
    'info@sunriseprimary.co.za',
    '+27 11 234 5678',
    '456 Education Ave, Johannesburg'
  ),
  (
    'Techwise FET College',
    'fet_college',
    'techwise-fet',
    16,
    25,
    ARRAY['N1', 'N2', 'N3', 'N4', 'N5', 'N6'],
    'TWF-2026',
    'admissions@techwise.ac.za',
    '+27 11 345 6789',
    '789 College Road, Pretoria'
  ),
  (
    'Skills Development Academy',
    'training_center',
    'skills-dev-academy',
    18,
    60,
    ARRAY['Certificate Programs', 'Short Courses', 'Learnerships'],
    'SDA-2026',
    'register@skillsdev.co.za',
    '+27 11 456 7890',
    '321 Training Street, Cape Town'
  )
ON CONFLICT (school_code) DO NOTHING;

-- Create sample classes for each organization type
INSERT INTO classes (name, grade_level, class_type, age_range, max_students, current_students, organization_id, academic_year)
SELECT 
  'Grade 1 - Morning Class',
  'Grade 1',
  'grade',
  '6-7 years',
  30,
  0,
  id,
  '2026'
FROM organizations WHERE slug = 'sunrise-primary'
ON CONFLICT DO NOTHING;

INSERT INTO classes (name, grade_level, class_type, age_range, duration, max_students, current_students, organization_id, academic_year)
SELECT 
  'N4 Engineering Studies',
  'N4',
  'course',
  '16+ years',
  '1 Year',
  40,
  0,
  id,
  '2026'
FROM organizations WHERE slug = 'techwise-fet'
ON CONFLICT DO NOTHING;

INSERT INTO classes (name, grade_level, class_type, age_range, duration, max_students, current_students, organization_id, academic_year)
SELECT 
  'Digital Marketing Certificate',
  'Certificate Programs',
  'course',
  '18+ years',
  '6 Months',
  25,
  0,
  id,
  '2026'
FROM organizations WHERE slug = 'skills-dev-academy'
ON CONFLICT DO NOTHING;
