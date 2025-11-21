-- Create function to sync new registration to EduDashPro
-- This runs automatically when a new registration is submitted

CREATE OR REPLACE FUNCTION sync_registration_to_edudash()
RETURNS TRIGGER AS $$
DECLARE
  edudash_conn TEXT := 'host=aws-0-ap-southeast-1.pooler.supabase.com port=6543 dbname=postgres user=postgres.lvvvjywrmpcqrpvuptdi password=YOUR_PASSWORD';
BEGIN
  -- Insert into EduDashPro's registration_requests or pending_enrollments table
  PERFORM dblink_exec(
    edudash_conn,
    format(
      'INSERT INTO registration_requests (
        id, organization_id, guardian_name, guardian_email, guardian_phone,
        student_first_name, student_last_name, student_dob, student_gender,
        preferred_class, preferred_start_date, academic_year, status,
        special_requests, student_allergies, student_medical_conditions,
        emergency_contact_name, emergency_contact_phone,
        created_at, source
      ) VALUES (
        %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L
      ) ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW()',
      NEW.id, NEW.organization_id, NEW.guardian_name, NEW.guardian_email, 
      NEW.guardian_phone, NEW.student_first_name, NEW.student_last_name,
      NEW.student_dob, NEW.student_gender, NEW.preferred_class,
      NEW.preferred_start_date, NEW.academic_year, NEW.status,
      NEW.special_requests, NEW.student_allergies, NEW.student_medical_conditions,
      NEW.emergency_contact_name, NEW.emergency_contact_phone,
      NEW.created_at, 'edusitepro_form'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after insert
DROP TRIGGER IF EXISTS on_registration_created ON registration_requests;
CREATE TRIGGER on_registration_created
  AFTER INSERT ON registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION sync_registration_to_edudash();

-- Create function to sync status updates FROM EduDashPro back to EduSitePro
CREATE OR REPLACE FUNCTION sync_status_from_edudash()
RETURNS TRIGGER AS $$
DECLARE
  edusite_conn TEXT := 'host=aws-0-ap-southeast-1.pooler.supabase.com port=6543 dbname=postgres user=postgres.bppuzibjlxgfwrujzfsz password=YOUR_PASSWORD';
BEGIN
  -- Only sync if status changed to approved or rejected
  IF (OLD.status IS DISTINCT FROM NEW.status) AND 
     (NEW.status IN ('approved', 'rejected')) THEN
    
    PERFORM dblink_exec(
      edusite_conn,
      format(
        'UPDATE registration_requests SET 
          status = %L,
          reviewed_date = %L,
          reviewed_by = %L,
          rejection_reason = %L,
          internal_notes = %L,
          updated_at = NOW()
        WHERE id = %L',
        NEW.status, NEW.reviewed_date, NEW.reviewed_by,
        NEW.rejection_reason, NEW.internal_notes, NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger needs to be created on EduDashPro database
-- Run this on EduDashPro:
-- DROP TRIGGER IF EXISTS on_registration_status_changed ON registration_requests;
-- CREATE TRIGGER on_registration_status_changed
--   AFTER UPDATE ON registration_requests
--   FOR EACH ROW
--   EXECUTE FUNCTION sync_status_from_edudash();
