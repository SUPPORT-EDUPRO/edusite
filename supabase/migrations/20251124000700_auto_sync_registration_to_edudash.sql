-- Migration: Auto-sync new registrations to EduDashPro
-- Description: Automatically triggers sync when a new registration is created in EduSitePro

-- Function to trigger registration sync to EduDashPro
CREATE OR REPLACE FUNCTION trigger_sync_registration_to_edudash()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
BEGIN
  -- Get the Edge Function URL
  function_url := current_setting('app.supabase_url', true) || '/functions/v1/sync-registration-to-edudash';
  
  -- Call the Edge Function asynchronously
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new registrations
DROP TRIGGER IF EXISTS on_registration_insert_sync_to_edudash ON registration_requests;
CREATE TRIGGER on_registration_insert_sync_to_edudash
  AFTER INSERT ON registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_registration_to_edudash();

COMMENT ON FUNCTION trigger_sync_registration_to_edudash() IS 'Automatically syncs new registrations from EduSite to EduDash for admin review';
COMMENT ON TRIGGER on_registration_insert_sync_to_edudash ON registration_requests IS 'Auto-sync trigger for new registration submissions';
