# Automated Registration Sync Deployment Guide

Complete end-to-end automation: Parent submits form → Record appears in EduDashPro → Admin approves → Status updates back to EduSitePro

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REGISTRATION FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

1. Parent submits form on Young Eagles PWA
   ↓
2. Form routes to EduSitePro Public Registration Form
   ↓
3. Form saves to EduSitePro registration_requests table
   ↓
4. Database trigger fires → Calls Edge Function
   ↓
5. Edge Function creates matching record in EduDashPro
   ↓
6. Admin views registration in EduDashPro mobile app
   ↓
7. Admin approves/rejects in app
   ↓
8. Database trigger fires → Calls reverse Edge Function
   ↓
9. Edge Function updates status in EduSitePro
   ↓
10. Parent sees status update (future: email notification)
```

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Service role keys for both databases
- Access to Supabase Dashboard for both projects

## Step 1: Deploy Edge Functions

### 1.1 Login to Supabase

```bash
# Link to EduSitePro project
cd /home/king/Desktop/edusitepro
supabase link --project-ref bppuzibjlxgfwrujzfsz
```

### 1.2 Set Environment Variables

```bash
# Set secrets for Edge Functions
supabase secrets set EDUDASH_SUPABASE_URL="https://lvvvjywrmpcqrpvuptdi.supabase.co"
supabase secrets set EDUDASH_SERVICE_ROLE_KEY="<your-edudash-service-role-key>"
supabase secrets set EDUSITE_SUPABASE_URL="https://bppuzibjlxgfwrujzfsz.supabase.co"
supabase secrets set EDUSITE_SERVICE_ROLE_KEY="<your-edusite-service-role-key>"
```

To get service role keys:
- EduSitePro: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/settings/api
- EduDashPro: https://supabase.com/dashboard/project/lvvvjywrmpcqrpvuptdi/settings/api

### 1.3 Deploy Functions

```bash
# Deploy forward sync (EduSitePro → EduDashPro)
supabase functions deploy sync-registration-to-edudash

# Deploy reverse sync (EduDashPro → EduSitePro)
supabase functions deploy sync-approval-to-edusite
```

### 1.4 Verify Deployment

Visit Supabase Dashboard → Edge Functions:
- https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/functions

You should see both functions listed with status "Active"

## Step 2: Setup Database Webhooks

### 2.1 Enable pg_net Extension (if not already)

```sql
-- Run in BOTH EduSitePro and EduDashPro SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2.2 Configure Service Role Key Setting

```sql
-- Run in EduSitePro
ALTER DATABASE postgres SET app.settings.service_role_key TO '<your-edusite-service-role-key>';

-- Run in EduDashPro
ALTER DATABASE postgres SET app.settings.service_role_key TO '<your-edudash-service-role-key>';
```

### 2.3 Run Webhook Migration

Run the migration file in the appropriate databases:

**In EduSitePro (bppuzibjlxgfwrujzfsz):**
```bash
psql "postgresql://postgres.bppuzibjlxgfwrujzfsz:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  -f migrations/setup_automated_sync_webhooks.sql
```

Only run PART 1 and PART 3-4 from the migration file.

**In EduDashPro (lvvvjywrmpcqrpvuptdi):**
```bash
psql "postgresql://postgres.lvvvjywrmpcqrpvuptdi:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  -f migrations/setup_automated_sync_webhooks.sql
```

Only run PART 2 and PART 3-4 from the migration file.

## Step 3: Verify Triggers

### 3.1 Check Triggers in EduSitePro

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_registration_submitted', 'on_registration_status_updated');
```

Expected output:
```
trigger_name                | event_manipulation | event_object_table    | action_statement
on_registration_submitted   | INSERT             | registration_requests | EXECUTE FUNCTION notify_registration_submission()
```

### 3.2 Check Triggers in EduDashPro

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_registration_status_updated';
```

Expected output:
```
trigger_name                  | event_manipulation | event_object_table    | action_statement
on_registration_status_updated | UPDATE             | registration_requests | EXECUTE FUNCTION notify_registration_status_change()
```

## Step 4: Test End-to-End Flow

### 4.1 Submit Test Registration

1. Open Young Eagles PWA: http://localhost:5174
2. Click "Register Now" button
3. Fill out registration form with test data:
   - Child Name: Test Child
   - Date of Birth: 2023-01-15 (should auto-assign to "Curious Cubs")
   - Guardian Email: test@example.com
4. Submit form

### 4.2 Verify Record in EduSitePro

```sql
-- Run in EduSitePro
SELECT 
  id, 
  student_first_name, 
  student_last_name,
  guardian_email,
  class_id,
  status,
  created_at
FROM registration_requests
WHERE guardian_email = 'test@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

### 4.3 Verify Record Auto-Created in EduDashPro

```sql
-- Run in EduDashPro
SELECT 
  id, 
  student_first_name, 
  student_last_name,
  guardian_email,
  class_id,
  status,
  created_at
FROM registration_requests
WHERE guardian_email = 'test@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**✅ SUCCESS:** If record exists in both databases with same `id`, sync is working!

### 4.4 Test Status Update (Reverse Sync)

```sql
-- Run in EduDashPro
UPDATE registration_requests
SET 
  status = 'approved',
  reviewed_date = NOW(),
  reviewed_by = (SELECT id FROM profiles WHERE role = 'principal' LIMIT 1),
  internal_notes = 'Test approval via automated sync'
WHERE guardian_email = 'test@example.com';
```

### 4.5 Verify Status Synced Back to EduSitePro

```sql
-- Run in EduSitePro
SELECT 
  status,
  reviewed_date,
  internal_notes,
  updated_at
FROM registration_requests
WHERE guardian_email = 'test@example.com';
```

**✅ SUCCESS:** If status = 'approved' and fields are updated, reverse sync is working!

## Step 5: Monitor Sync Operations

### 5.1 View Sync Logs

```sql
-- Run in either database
SELECT 
  sync_direction,
  sync_type,
  success,
  error_message,
  synced_at
FROM sync_logs
ORDER BY synced_at DESC
LIMIT 20;
```

### 5.2 Check Edge Function Logs

Visit Supabase Dashboard → Edge Functions → Select function → Logs:
- https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/functions/sync-registration-to-edudash/logs
- https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/functions/sync-approval-to-edusite/logs

### 5.3 Find Failed Syncs

```sql
-- Find all failed sync attempts
SELECT 
  record_id,
  sync_direction,
  error_message,
  synced_at,
  request_payload
FROM sync_logs
WHERE success = false
ORDER BY synced_at DESC;
```

### 5.4 Manually Retry Failed Sync

```sql
-- If a sync failed, retry manually
SELECT manually_sync_registration('<registration-id-here>');
```

## Step 6: Configure EduDashPro Mobile App

### 6.1 Enable Registration Approval Screen

In EduDashPro mobile app, ensure principals/admins can:
- View pending registrations
- Approve/reject with notes
- Filter by status (pending, approved, rejected, waitlisted)

### 6.2 Add Notifications (Optional)

Configure push notifications to alert admins when new registrations arrive:
- Use OneSignal or Firebase Cloud Messaging
- Trigger notification in Edge Function after successful sync

## Troubleshooting

### Issue: Edge Function Returns 500 Error

**Solution:**
1. Check Edge Function logs in Supabase Dashboard
2. Verify environment variables are set: `supabase secrets list`
3. Ensure service role keys are correct
4. Check database RLS policies allow service role to insert

### Issue: Webhook Not Triggering

**Solution:**
1. Verify pg_net extension is installed: `SELECT * FROM pg_available_extensions WHERE name = 'pg_net';`
2. Check trigger exists: `\df notify_registration_submission` (in psql)
3. Verify service role key is configured in database settings
4. Test webhook manually: `SELECT manually_sync_registration('<id>');`

### Issue: Record Created in EduDashPro but Wrong Data

**Solution:**
1. Check field mapping in Edge Function code
2. Verify schema matches between databases
3. Add logging to Edge Function to debug payload
4. Check for NULL values in required fields

### Issue: Status Not Syncing Back

**Solution:**
1. Verify trigger on UPDATE in EduDashPro exists
2. Check Edge Function logs for errors
3. Ensure status change is to 'approved', 'rejected', or 'waitlisted'
4. Verify EduSitePro database is reachable from Edge Function

## Security Checklist

- [ ] Service role keys are stored as Supabase secrets (not in code)
- [ ] RLS policies enabled on all tables
- [ ] Edge Functions validate organization_id before syncing
- [ ] Webhook endpoints protected by Authorization header
- [ ] sync_logs table has RLS (only admins can view)
- [ ] Manual sync function restricted to service role

## Maintenance

### Weekly Tasks
- Review sync_logs for failed operations
- Monitor Edge Function execution time (should be < 1 second)
- Check for orphaned records (in one DB but not the other)

### Monthly Tasks
- Archive old sync_logs (> 90 days)
- Review and optimize database triggers
- Update Edge Function dependencies if needed

## Next Steps

1. **Email Notifications**: Send confirmation email when registration is approved/rejected
2. **Parent Dashboard**: Allow parents to view their registration status
3. **Waitlist Management**: Auto-notify when space becomes available
4. **Bulk Operations**: Support bulk approve/reject in admin panel
5. **Analytics**: Track registration funnel conversion rates

## Related Documentation

- [Database Sync Strategy](./DATABASE_SYNC_STRATEGY.md)
- [Registration Request Schema](./docs/registration-schema.md)
- [EduDashPro Mobile App](../edudashpro/README.md)
- [Young Eagles PWA](../youngeagles-education-platform/README.md)
