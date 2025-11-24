# EduSitePro Edge Function Environment Variables

## Required Environment Variables for sync-registration-to-edudash

You need to add these environment variables in the Supabase Dashboard for the EduSitePro project:

### Dashboard Location:
1. Go to: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/functions
2. Click on "Edge Functions" in the left sidebar
3. Click on "sync-registration-to-edudash"
4. Go to "Settings" tab
5. Add the following environment variables:

### Environment Variables:

```bash
# EduDashPro Database Connection
EDUDASH_SUPABASE_URL=https://lvvvjywrmpcqrpvuptdi.supabase.co
EDUDASH_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dnZqeXdybXBjcXJwdnVwdGRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTc0Nzk4NiwiZXhwIjoyMDM1MzIzOTg2fQ.MJ-KqDTH3c8jV1FcIyDxCBXKE38V-Nxef2eXlTnPgHc
```

## Testing After Setup

After adding the environment variables:

1. Submit a new registration via EduSitePro website
2. Check if it automatically appears in EduDashPro admin panel
3. Monitor Edge Function logs for any errors:
   - Go to: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/functions
   - Click on "sync-registration-to-edudash"
   - Click "Logs" tab

## Verification Query

Run this in EduDashPro database to see synced registrations:

```sql
SELECT 
  id,
  student_first_name || ' ' || student_last_name as student_name,
  guardian_email,
  status,
  source,
  created_at
FROM registration_requests
WHERE source = 'edusitepro_web_form'
ORDER BY created_at DESC
LIMIT 5;
```

## Sync Flow

**New Registration Flow:**
1. Parent submits registration on EduSitePro website
2. Registration saved to EduSitePro database
3. Trigger fires: `on_registration_insert_sync_to_edudash`
4. Edge Function called: `sync-registration-to-edudash`
5. Registration synced to EduDashPro with status='pending'
6. Admin sees registration in EduDashPro dashboard
7. Admin can verify payment, approve, etc.
8. All approval/payment actions sync back to EduSitePro

**Backup Sync Button:**
- The manual "Sync" button in EduDashPro remains as a backup
- Use it if automatic sync fails or to resync existing registrations
