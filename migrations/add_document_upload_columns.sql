-- Add document upload columns to registration_requests table
-- These replace the student_id_number field with URLs to uploaded documents

-- Student document columns
ALTER TABLE registration_requests
ADD COLUMN IF NOT EXISTS student_birth_certificate_url TEXT,
ADD COLUMN IF NOT EXISTS student_clinic_card_url TEXT;

-- Parent document columns
ALTER TABLE registration_requests
ADD COLUMN IF NOT EXISTS guardian_id_document_url TEXT;

-- Add document upload status tracking
ALTER TABLE registration_requests
ADD COLUMN IF NOT EXISTS documents_uploaded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS documents_deadline TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days');

-- Add comments for documentation
COMMENT ON COLUMN registration_requests.student_birth_certificate_url IS 'URL to uploaded birth certificate (Supabase Storage)';
COMMENT ON COLUMN registration_requests.student_clinic_card_url IS 'URL to uploaded clinic card/Road to Health card (Supabase Storage)';
COMMENT ON COLUMN registration_requests.guardian_id_document_url IS 'URL to uploaded parent/guardian ID document (Supabase Storage)';
COMMENT ON COLUMN registration_requests.documents_uploaded IS 'Whether all required documents have been uploaded';
COMMENT ON COLUMN registration_requests.documents_deadline IS 'Deadline for uploading required documents (7 days from registration)';

-- We can optionally drop the student_id_number column if no longer needed
-- Uncomment the next line if you want to remove it completely:
-- ALTER TABLE registration_requests DROP COLUMN IF EXISTS student_id_number;
