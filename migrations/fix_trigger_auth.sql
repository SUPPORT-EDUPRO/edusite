-- Update trigger function to use hardcoded service role key
CREATE OR REPLACE FUNCTION notify_registration_submission()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/sync-registration-to-edudash';
  service_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0MzczMCwiZXhwIjoyMDY5MzE5NzMwfQ.5zPPaAo1Jj5-SknVMDwvo1DBCXhmS60obAEckJV7o1I';
BEGIN
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'type', 'new_registration'
      )
    );
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to call webhook: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION notify_registration_submission() IS 'Triggers Edge Function to sync registration to EduDashPro';
