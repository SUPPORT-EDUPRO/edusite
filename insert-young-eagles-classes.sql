-- Insert Young Eagles classes into EduSitePro
-- Using unified organization ID: ba79097c-1b93-4b48-bcbe-df73878ab4d1
-- (Same across EduDashPro and EduSitePro)

-- Insert Pandas class (using existing ID from EduDashPro)
INSERT INTO classes (
  id,
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
) VALUES (
  '83913891-d269-416f-8ff3-e2476a538bc4',
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1',
  'Pandas',
  'PreK-2',
  '2026',
  20,
  0,
  true,
  'full_day',
  '2-3 years',
  'Full Day',
  '2025-08-27 10:10:26.167+00',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  age_range = EXCLUDED.age_range,
  academic_year = EXCLUDED.academic_year,
  updated_at = NOW();

-- Insert Curious Cubs class (new class)
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
) VALUES (
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1',
  'Curious Cubs',
  'PreK-3',
  '2026',
  20,
  0,
  true,
  'full_day',
  '3-4 years',
  'Full Day',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the classes were created
SELECT 
  id,
  name,
  age_range,
  grade_level,
  academic_year,
  max_students,
  active
FROM classes
WHERE organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1'
ORDER BY age_range;
