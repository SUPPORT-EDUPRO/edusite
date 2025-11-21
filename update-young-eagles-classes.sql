-- Update Young Eagles classes to match actual age groups
-- 6 months - 1 year: Little Explorers
-- 1-3 years: Curious Cubs  
-- 4-6 years: Panda

BEGIN;

-- Delete existing incorrect classes
DELETE FROM classes WHERE organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';

-- Insert correct classes
INSERT INTO classes (
  organization_id,
  name,
  grade_level,
  academic_year,
  max_students,
  current_students,
  active,
  class_type,
  age_range,
  duration,
  created_at,
  updated_at
) VALUES 
-- Little Explorers (6 months - 1 year)
(
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1',
  'Little Explorers',
  'Infant',
  '2026',
  15,
  0,
  true,
  'full_day',
  '6 months - 1 year',
  'Full Day',
  NOW(),
  NOW()
),
-- Curious Cubs (1-3 years)
(
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1',
  'Curious Cubs',
  'Toddler',
  '2026',
  20,
  0,
  true,
  'full_day',
  '1-3 years',
  'Full Day',
  NOW(),
  NOW()
),
-- Panda (4-6 years)
(
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1',
  'Panda',
  'PreK',
  '2026',
  25,
  0,
  true,
  'full_day',
  '4-6 years',
  'Full Day',
  NOW(),
  NOW()
);

COMMIT;

-- Verify
SELECT id, name, age_range, grade_level, academic_year, max_students, active 
FROM classes 
WHERE organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1' 
ORDER BY 
  CASE 
    WHEN name = 'Little Explorers' THEN 1
    WHEN name = 'Curious Cubs' THEN 2
    WHEN name = 'Panda' THEN 3
  END;
