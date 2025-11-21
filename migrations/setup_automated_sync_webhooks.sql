/**
 * Setup Automated Sync System
 * 
 * Creates database webhooks that trigger Edge Functions when:
 * 1. New registration submitted in EduSitePro → sync to EduDashPro
 * 2. Registration status updated in EduDashPro → sync back to EduSitePro
 * 
 * Prerequisites:
 * - Deploy Edge Functions first:
 *   supabase functions deploy sync-registration-to-edudash
 *   supabase functions deploy sync-approval-to-edusite
 * 
 * - Set environment variables in Supabase Dashboard:
 *   EDUDASH_SUPABASE_URL=https://lvvvjywrmpcqrpvuptdi.supabase.co
 *   EDUDASH_SERVICE_ROLE_KEY=<secret>
 *   EDUSITE_SUPABASE_URL=https://bppuzibjlxgfwrujzfsz.supabase.co
 *   EDUSITE_SERVICE_ROLE_KEY=<secret>
 */

-- ================================================
-- PART 1: EduSitePro Webhooks (run in EduSitePro)
-- ================================================

-- Create webhook for new registrations
-- Triggers when parent submits registration form
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to registration_requests table
DROP TRIGGER IF EXISTS on_registration_submitted ON registration_requests;
CREATE TRIGGER on_registration_submitted
  AFTER INSERT ON registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_registration_submission();

COMMENT ON TRIGGER on_registration_submitted ON registration_requests IS 
  'Automatically syncs new registration submissions to EduDashPro for admin review';


-- ================================================
-- PART 2: EduDashPro Webhooks (run in EduDashPro)
-- ================================================

-- Create webhook for status updates
-- Triggers when admin approves/rejects registration
CREATE OR REPLACE FUNCTION notify_registration_status_change()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/sync-approval-to-edusite';
BEGIN
  -- Only trigger if status changed to approved, rejected, or waitlisted
  IF NEW.status IS DISTINCT FROM OLD.status AND 
     NEW.status IN ('approved', 'rejected', 'waitlisted') THEN
    
    PERFORM
      net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'record', row_to_json(NEW),
          'old_record', row_to_json(OLD),
          'type', 'status_update'
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to registration_requests table
DROP TRIGGER IF EXISTS on_registration_status_updated ON registration_requests;
CREATE TRIGGER on_registration_status_updated
  AFTER UPDATE ON registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_registration_status_change();

COMMENT ON TRIGGER on_registration_status_updated ON registration_requests IS 
  'Automatically syncs approval/rejection status back to EduSitePro for parent notification';


-- ================================================
-- PART 3: Manual Sync Functions (Fallback)
-- ================================================

-- Function to manually trigger sync if webhook fails
CREATE OR REPLACE FUNCTION manually_sync_registration(registration_id UUID)
RETURNS JSONB AS $$
DECLARE
  reg_record RECORD;
  webhook_url TEXT := 'https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/sync-registration-to-edudash';
  result JSONB;
BEGIN
  -- Get registration record
  SELECT * INTO reg_record FROM registration_requests WHERE id = registration_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration not found');
  END IF;
  
  -- Call webhook
  SELECT content::JSONB INTO result
  FROM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'record', row_to_json(reg_record),
      'type', 'manual_sync'
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION manually_sync_registration(UUID) IS 
  'Manually triggers sync for a specific registration (use if automatic sync fails)';


-- ================================================
-- PART 4: Monitoring & Logging
-- ================================================

-- Create sync_logs table to track all sync operations
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  record_id UUID NOT NULL,
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('edusite_to_edudash', 'edudash_to_edusite')),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('new_registration', 'status_update', 'manual_sync')),
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_record ON sync_logs(record_id);
CREATE INDEX idx_sync_logs_synced_at ON sync_logs(synced_at DESC);
CREATE INDEX idx_sync_logs_success ON sync_logs(success) WHERE success = false;

COMMENT ON TABLE sync_logs IS 
  'Audit log for all database sync operations between EduSitePro and EduDashPro';


-- Grant permissions
GRANT SELECT, INSERT ON sync_logs TO authenticated;
GRANT SELECT, INSERT ON sync_logs TO service_role;

-- Enable RLS
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy: Only admins can view sync logs
CREATE POLICY "Admins can view sync logs" ON sync_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('super_admin', 'principal', 'admin')
    )
  );

-- RLS policy: Service role can insert logs
CREATE POLICY "Service role can log syncs" ON sync_logs
  FOR INSERT
  WITH CHECK (true);
