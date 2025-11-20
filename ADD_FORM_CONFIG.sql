-- Add form_config column to organizations table
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE IF EXISTS public.organizations 
ADD COLUMN IF NOT EXISTS form_config JSONB;

COMMENT ON COLUMN public.organizations.form_config IS 
  'JSONB configuration for public registration form visibility flags: { showDetailedParentInfo, showSecondaryGuardian, showTransport, showMealPlan, showDoctorInfo, showEmergencyContact }';

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'organizations' 
  AND column_name = 'form_config';
