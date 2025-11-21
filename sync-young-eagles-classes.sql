-- Sync Young Eagles classes to EduSitePro database
-- Organization ID: ba79097c-1b93-4b48-bcbe-df73878ab4d1

-- Insert Pandas class (2-3 years)
INSERT INTO classes (
  organization_id,
  name,
  grade_level,
  academic_year,
  active,
  max_students,
  current_students,
  class_type,
  age_range,
  created_at,
  updated_at
) VALUES (
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1',
  'Pandas',
  'PreK-2',
  '2026',
  true,
  20,
  0,
  'full_day',
  '2-3 years',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert Curious Cubs class (3-4 years)
INSERT INTO classes (
  organization_id,
  name,
  grade_level,
  academic_year,
  active,
  max_students,
  current_students,
  class_type,
  age_range,
  created_at,
  updated_at
) VALUES (
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1',
  'Curious Cubs',
  'PreK-3',
  '2026',
  true,
  20,
  0,
  'full_day',
  '3-4 years',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the classes were created
SELECT 
  id,
  name,
  grade_level,
  academic_year,
  age_range,
  max_students,
  active
FROM classes
WHERE organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
ORDER BY age_range;
