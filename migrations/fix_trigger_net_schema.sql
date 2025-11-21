-- Fix trigger function to use extensions.net schema
CREATE OR REPLACE FUNCTION notify_registration_submission()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/sync-registration-to-edudash';
BEGIN
  PERFORM
    extensions.net.http_post(
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Trigger function fixed' as result;
