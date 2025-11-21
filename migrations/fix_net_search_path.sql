-- Add net schema to search path and fix trigger function
ALTER DATABASE postgres SET search_path TO public, extensions;

-- Recreate trigger function using net.http_post directly
CREATE OR REPLACE FUNCTION notify_registration_submission()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/sync-registration-to-edudash';
BEGIN
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'type', 'new_registration'
      )
    );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block the insert
    RAISE WARNING 'Failed to call webhook: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Trigger function updated with proper search_path' as result;
