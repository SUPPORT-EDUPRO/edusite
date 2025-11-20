-- =====================================================
-- Organizations Directory - Public Listing Feature
-- =====================================================
-- Purpose: Allow public viewing of all registered organizations
-- Created: November 16, 2025
-- =====================================================

-- Add public visibility fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS directory_listing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS listing_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS established_year INTEGER,
ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_teachers INTEGER DEFAULT 0;

-- Create index for public directory queries
CREATE INDEX IF NOT EXISTS idx_organizations_directory 
ON organizations(directory_listing, is_public, organization_type) 
WHERE directory_listing = true AND is_public = true;

CREATE INDEX IF NOT EXISTS idx_organizations_featured 
ON organizations(featured, listing_order) 
WHERE featured = true;

-- =====================================================
-- View: Public Organizations Directory
-- =====================================================
-- Returns all organizations that should be listed in public directory
-- with aggregated stats and campaign info

CREATE OR REPLACE VIEW public_organizations_directory AS
SELECT 
  o.id,
  o.name,
  o.slug,
  o.organization_type,
  o.tagline,
  o.logo_url,
  o.primary_color,
  o.secondary_color,
  o.city,
  o.province,
  o.country,
  o.established_year,
  o.total_students,
  o.total_teachers,
  o.featured,
  o.listing_order,
  o.created_at,
  
  -- Landing page info
  lp.hero_title,
  lp.hero_subtitle,
  
  -- Active campaigns count
  (
    SELECT COUNT(*) 
    FROM marketing_campaigns mc 
    WHERE mc.organization_id = o.id 
    AND mc.active = true 
    AND mc.start_date <= NOW() 
    AND mc.end_date >= NOW()
  ) as active_campaigns_count,
  
  -- Best current discount
  (
    SELECT MAX(
      CASE 
        WHEN mc.discount_type = 'percentage' THEN mc.discount_value
        ELSE 0
      END
    )
    FROM marketing_campaigns mc 
    WHERE mc.organization_id = o.id 
    AND mc.active = true 
    AND mc.start_date <= NOW() 
    AND mc.end_date >= NOW()
    AND mc.discount_type = 'percentage'
  ) as best_discount_percentage,
  
  -- Registration fee (lowest)
  (
    SELECT MIN(amount)
    FROM organization_fee_structures ofs
    WHERE ofs.organization_id = o.id
    AND ofs.fee_type = 'registration_fee'
    AND ofs.active = true
  ) as registration_fee,
  
  -- Monthly tuition (lowest)
  (
    SELECT MIN(amount)
    FROM organization_fee_structures ofs
    WHERE ofs.organization_id = o.id
    AND ofs.fee_type = 'tuition_monthly'
    AND ofs.active = true
  ) as monthly_tuition

FROM organizations o
LEFT JOIN organization_landing_pages lp ON lp.organization_id = o.id
WHERE o.directory_listing = true 
AND o.is_public = true
ORDER BY o.featured DESC, o.listing_order ASC, o.name ASC;

-- Grant public read access to the view
GRANT SELECT ON public_organizations_directory TO anon, authenticated;

-- =====================================================
-- Function: Get Organizations by Category
-- =====================================================

CREATE OR REPLACE FUNCTION get_organizations_by_category(
  p_category VARCHAR DEFAULT NULL,
  p_search VARCHAR DEFAULT NULL,
  p_province VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  organization_type VARCHAR,
  tagline TEXT,
  logo_url TEXT,
  primary_color VARCHAR,
  secondary_color VARCHAR,
  city VARCHAR,
  province VARCHAR,
  country VARCHAR,
  established_year INTEGER,
  total_students INTEGER,
  total_teachers INTEGER,
  featured BOOLEAN,
  hero_title TEXT,
  hero_subtitle TEXT,
  active_campaigns_count BIGINT,
  best_discount_percentage NUMERIC,
  registration_fee NUMERIC,
  monthly_tuition NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pod.id,
    pod.name,
    pod.slug,
    pod.organization_type::text::varchar,
    pod.tagline,
    pod.logo_url,
    pod.primary_color,
    pod.secondary_color,
    pod.city,
    pod.province,
    pod.country,
    pod.established_year,
    pod.total_students,
    pod.total_teachers,
    pod.featured,
    pod.hero_title,
    pod.hero_subtitle,
    pod.active_campaigns_count,
    pod.best_discount_percentage,
    pod.registration_fee,
    pod.monthly_tuition
  FROM public_organizations_directory pod
  WHERE 
    (p_category IS NULL OR pod.organization_type::text = p_category)
    AND (p_search IS NULL OR pod.name ILIKE '%' || p_search || '%' OR pod.city ILIKE '%' || p_search || '%')
    AND (p_province IS NULL OR pod.province = p_province)
  ORDER BY pod.featured DESC, pod.listing_order ASC, pod.name ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION get_organizations_by_category TO anon, authenticated;

-- =====================================================
-- Function: Get Organization Stats Summary
-- =====================================================

CREATE OR REPLACE FUNCTION get_directory_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_organizations', COUNT(*),
    'by_type', json_object_agg(organization_type::text, type_count) FILTER (WHERE organization_type IS NOT NULL),
    'by_province', json_object_agg(COALESCE(province, 'Unknown'), province_count) FILTER (WHERE province IS NOT NULL),
    'total_students', SUM(total_students),
    'total_teachers', SUM(total_teachers),
    'featured_count', SUM(CASE WHEN featured THEN 1 ELSE 0 END)
  ) INTO v_stats
  FROM (
    SELECT 
      organization_type,
      province,
      total_students,
      total_teachers,
      featured,
      COUNT(*) OVER (PARTITION BY organization_type) as type_count,
      COUNT(*) OVER (PARTITION BY COALESCE(province, 'Unknown')) as province_count
    FROM public_organizations_directory
  ) subquery;
  
  RETURN v_stats;
END;
$$;

GRANT EXECUTE ON FUNCTION get_directory_stats TO anon, authenticated;

-- =====================================================
-- Update Young Eagles to be publicly listed
-- =====================================================

UPDATE organizations 
SET 
  directory_listing = true,
  is_public = true,
  featured = true,
  listing_order = 1,
  city = 'Pretoria',
  province = 'Gauteng',
  country = 'ZA',
  tagline = 'Nurturing young minds through quality early childhood education',
  established_year = 2020,
  total_students = 120,
  total_teachers = 8
WHERE slug = 'young-eagles';

-- =====================================================
-- Sample: Add more example organizations for directory
-- =====================================================

-- Example Preschool
INSERT INTO organizations (
  name, 
  slug, 
  organization_type,
  min_age,
  max_age,
  directory_listing,
  is_public,
  city,
  province,
  tagline,
  established_year,
  total_students,
  total_teachers,
  logo_url,
  primary_color,
  secondary_color
) VALUES (
  'Little Stars Preschool',
  'little-stars',
  'preschool'::organization_type,
  2,
  6,
  true,
  true,
  'Johannesburg',
  'Gauteng',
  'Where every child is a star',
  2015,
  85,
  6,
  'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=LS',
  '#FF6B6B',
  '#4ECDC4'
) ON CONFLICT (slug) DO NOTHING;

-- Example Primary School
INSERT INTO organizations (
  name, 
  slug, 
  organization_type,
  min_age,
  max_age,
  directory_listing,
  is_public,
  city,
  province,
  tagline,
  established_year,
  total_students,
  total_teachers,
  logo_url,
  primary_color,
  secondary_color
) VALUES (
  'Sunshine Primary School',
  'sunshine-primary',
  'primary_school'::organization_type,
  6,
  13,
  true,
  true,
  'Cape Town',
  'Western Cape',
  'Empowering learners for a bright future',
  2010,
  450,
  22,
  'https://via.placeholder.com/200x200/FFD93D/FFFFFF?text=SPS',
  '#FFD93D',
  '#6BCB77'
) ON CONFLICT (slug) DO NOTHING;

-- Example High School
INSERT INTO organizations (
  name, 
  slug, 
  organization_type,
  min_age,
  max_age,
  directory_listing,
  is_public,
  city,
  province,
  tagline,
  established_year,
  total_students,
  total_teachers,
  logo_url,
  primary_color,
  secondary_color
) VALUES (
  'Excellence High School',
  'excellence-high',
  'high_school'::organization_type,
  13,
  18,
  true,
  true,
  'Durban',
  'KwaZulu-Natal',
  'Excellence in education, character in service',
  2005,
  800,
  45,
  'https://via.placeholder.com/200x200/4D96FF/FFFFFF?text=EHS',
  '#4D96FF',
  '#6BCB77'
) ON CONFLICT (slug) DO NOTHING;

-- Create landing pages for sample orgs
INSERT INTO organization_landing_pages (organization_id, hero_title, hero_subtitle)
SELECT id, name, tagline
FROM organizations
WHERE slug IN ('little-stars', 'sunshine-primary', 'excellence-high')
ON CONFLICT (organization_id) DO NOTHING;

-- Create sample fees for Little Stars
INSERT INTO organization_fee_structures (organization_id, fee_type, amount, description, active)
SELECT id, 'registration_fee', 450, 'One-time registration fee', true
FROM organizations WHERE slug = 'little-stars'
ON CONFLICT DO NOTHING;

INSERT INTO organization_fee_structures (organization_id, fee_type, amount, description, active)
SELECT id, 'tuition_monthly', 2200, 'Monthly tuition fee', true
FROM organizations WHERE slug = 'little-stars'
ON CONFLICT DO NOTHING;

-- Create sample fees for Sunshine Primary
INSERT INTO organization_fee_structures (organization_id, fee_type, amount, description, active)
SELECT id, 'registration_fee', 600, 'One-time registration fee', true
FROM organizations WHERE slug = 'sunshine-primary'
ON CONFLICT DO NOTHING;

INSERT INTO organization_fee_structures (organization_id, fee_type, amount, description, active)
SELECT id, 'tuition_monthly', 3200, 'Monthly tuition fee', true
FROM organizations WHERE slug = 'sunshine-primary'
ON CONFLICT DO NOTHING;

-- Create sample fees for Excellence High
INSERT INTO organization_fee_structures (organization_id, fee_type, amount, description, active)
SELECT id, 'registration_fee', 800, 'One-time registration fee', true
FROM organizations WHERE slug = 'excellence-high'
ON CONFLICT DO NOTHING;

INSERT INTO organization_fee_structures (organization_id, fee_type, amount, description, active)
SELECT id, 'tuition_monthly', 4500, 'Monthly tuition fee', true
FROM organizations WHERE slug = 'excellence-high'
ON CONFLICT DO NOTHING;

-- =====================================================
-- RLS Policies for Public Access
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public organizations are viewable by everyone" ON organizations;

-- Anyone can view public organizations
CREATE POLICY "Public organizations are viewable by everyone"
ON organizations FOR SELECT
TO anon, authenticated
USING (directory_listing = true AND is_public = true);

-- =====================================================
-- Summary
-- =====================================================

COMMENT ON VIEW public_organizations_directory IS 
'Public directory view of all organizations that have opted into public listing. 
Includes stats, active campaigns, and fee information.';

COMMENT ON FUNCTION get_organizations_by_category IS 
'Retrieves organizations filtered by category, search term, and province. 
Supports pagination with limit and offset parameters.';

COMMENT ON FUNCTION get_directory_stats IS 
'Returns summary statistics for the organizations directory including counts by type and province.';

-- =====================================================
-- Verification Query
-- =====================================================

-- Test the directory view
SELECT 
  name,
  organization_type,
  city,
  province,
  total_students,
  active_campaigns_count,
  best_discount_percentage,
  registration_fee
FROM public_organizations_directory
ORDER BY featured DESC, name ASC;

-- Test the function
SELECT * FROM get_organizations_by_category(
  p_category := 'preschool',
  p_search := NULL,
  p_province := NULL,
  p_limit := 10,
  p_offset := 0
);

-- Test stats
SELECT get_directory_stats();
