-- Migration: Add missing registration fields to registration_requests table
-- This aligns the database schema with all form fields for better querying and reporting

BEGIN;

-- Guardian/Parent Additional Fields
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS guardian_work_phone VARCHAR(20);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS secondary_guardian_name VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS secondary_guardian_email VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS secondary_guardian_phone VARCHAR(20);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS secondary_guardian_relationship VARCHAR(100);

-- Parent Details (for preschools)
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS mother_phone VARCHAR(20);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS mother_email VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS mother_occupation VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS mother_employer VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS father_phone VARCHAR(20);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS father_email VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS father_occupation VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS father_employer VARCHAR(255);

-- Student Medical/Health Fields
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS student_nationality VARCHAR(100);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS student_home_language VARCHAR(100);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS student_medical_conditions TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS student_allergies TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS student_medication TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS student_dietary_requirements TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS doctor_phone VARCHAR(20);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS birth_certificate_number VARCHAR(100);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS immunization_record TEXT;

-- Emergency Contact
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);

-- Previous School
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS previous_school VARCHAR(255);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS reason_for_transfer TEXT;

-- Preschool-Specific Fields
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS sleeping_habits TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS feeding_habits TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS toilet_trained VARCHAR(50);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS favourite_activities TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS behavioral_concerns TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS developmental_delays TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS special_needs TEXT;

-- Transport & Logistics
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS transport_required BOOLEAN DEFAULT false;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS transport_pickup_address TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS transport_dropoff_address TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS preferred_meal_plan VARCHAR(100);
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS authorized_pickup_persons TEXT;

-- Cultural/Religious
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS religious_considerations TEXT;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS cultural_considerations TEXT;

-- Consent Fields
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS consent_photography BOOLEAN DEFAULT false;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS photo_id_required BOOLEAN DEFAULT false;

-- Marketing
ALTER TABLE registration_requests ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);

COMMIT;

-- Verify the new columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'registration_requests' 
  AND column_name IN (
    'student_allergies', 'student_medical_conditions', 'emergency_contact_name',
    'mother_name', 'father_name', 'transport_required', 'consent_photography'
  )
ORDER BY column_name;
