-- Sync Young Eagles organization ID across databases
-- EduDashPro uses: ba79097c-1b93-4b48-bcbe-df73878ab4d1
-- EduSitePro currently uses: 6b92f8a5-48e7-4865-b85f-4b92c174e0ef
-- Strategy: Create new org with correct ID, migrate data, delete old org

BEGIN;

-- Step 1: Temporarily rename old org slug to avoid conflict
UPDATE organizations 
SET slug = 'young-eagles-old-temp'
WHERE id = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef';

-- Step 2: Insert new organization with EduDashPro ID using existing data
INSERT INTO organizations (
  id, name, slug, organization_type, logo_url, primary_color, secondary_color,
  registration_open, registration_message, min_age, max_age, 
  terms_and_conditions_url, terms_and_conditions_text,
  created_at, updated_at
)
SELECT 
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1', -- New ID from EduDashPro
  name, 'young-eagles', organization_type, logo_url, primary_color, secondary_color,
  registration_open, registration_message, min_age, max_age,
  terms_and_conditions_url, terms_and_conditions_text,
  created_at, NOW()
FROM organizations 
WHERE id = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef';

-- Step 3: Update all foreign key references
UPDATE centres SET organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1' 
WHERE organization_id = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef';

UPDATE classes SET organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1' 
WHERE organization_id = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef';

UPDATE registration_requests SET organization_id = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1' 
WHERE organization_id = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef';

-- Step 4: Delete old organization record
DELETE FROM organizations WHERE id = '6b92f8a5-48e7-4865-b85f-4b92c174e0ef';

COMMIT;

-- Step 5: Verify the update
SELECT id, name, slug, organization_type, registration_open 
FROM organizations 
WHERE name ILIKE '%Young Eagles%';
