-- Add missing columns to EduDashPro classes table to align with EduSitePro
-- This allows both systems to share the same data structure

-- Add organization_id (maps to preschool_id in EduDashPro)
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add academic_year
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(10) DEFAULT '2026';

-- Add class_type
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS class_type VARCHAR(50);

-- Add age_range (text representation like "2-3 years")
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS age_range VARCHAR(50);

-- Add duration
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS duration VARCHAR(50);

-- Standardize column names (rename existing columns)
ALTER TABLE classes 
RENAME COLUMN capacity TO max_students;

ALTER TABLE classes 
RENAME COLUMN current_enrollment TO current_students;

ALTER TABLE classes 
RENAME COLUMN is_active TO active;

-- Backfill organization_id from preschool_id
UPDATE classes 
SET organization_id = preschool_id 
WHERE organization_id IS NULL AND preschool_id IS NOT NULL;

-- Backfill age_range from age_min and age_max
UPDATE classes 
SET age_range = CONCAT(age_min, '-', age_max, ' years')
WHERE age_range IS NULL AND age_min IS NOT NULL AND age_max IS NOT NULL;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'classes' 
ORDER BY ordinal_position;
