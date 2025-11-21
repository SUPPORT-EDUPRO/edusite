# Quick Reference: Registration Sync System

## 🚀 Quick Start

```bash
# Deploy entire sync system
cd /home/king/Desktop/edusitepro
./deploy-automated-sync.sh
```

## 🔍 Quick Checks

### Check if sync is working
```sql
-- Recent syncs (run in either database)
SELECT 
  sync_direction,
  sync_type,
  success,
  synced_at
FROM sync_logs
ORDER BY synced_at DESC
LIMIT 5;
```

### Check for failed syncs
```sql
-- Failed syncs only
SELECT 
  record_id,
  error_message,
  synced_at
FROM sync_logs
WHERE success = false
ORDER BY synced_at DESC;
```

### Verify triggers are active
```sql
-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%registration%';
```

## 🛠️ Common Tasks

### Manually sync a specific registration
```sql
-- Use if automatic sync failed
SELECT manually_sync_registration('registration-uuid-here');
```

### Check registration status
```sql
-- In EduSitePro
SELECT id, student_first_name, guardian_email, status, created_at
FROM registration_requests
WHERE guardian_email = 'parent@example.com';

-- In EduDashPro (should match)
SELECT id, student_first_name, guardian_email, status, created_at
FROM registration_requests
WHERE guardian_email = 'parent@example.com';
```

### View Edge Function logs
- EduSitePro Dashboard: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz/functions
- Select function → Logs tab
- Filter by date/error level

## 📊 Monitoring Queries

### Sync success rate (last 24 hours)
```sql
SELECT 
  sync_direction,
  COUNT(*) as total_syncs,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM sync_logs
WHERE synced_at > NOW() - INTERVAL '24 hours'
GROUP BY sync_direction;
```

### Average sync time
```sql
-- Check response_payload for execution time
SELECT 
  sync_type,
  AVG(EXTRACT(EPOCH FROM (synced_at - created_at))) as avg_seconds
FROM sync_logs
WHERE success = true
  AND synced_at > NOW() - INTERVAL '7 days'
GROUP BY sync_type;
```

### Pending registrations needing review
```sql
-- Run in EduDashPro
SELECT 
  COUNT(*) as pending_count,
  MIN(created_at) as oldest_pending
FROM registration_requests
WHERE status = 'pending';
```

## 🐛 Troubleshooting

### Issue: Record not appearing in EduDashPro
```sql
-- 1. Check if it's in EduSitePro
SELECT * FROM registration_requests WHERE id = 'uuid-here';

-- 2. Check sync logs for that record
SELECT * FROM sync_logs WHERE record_id = 'uuid-here';

-- 3. If log shows failure, read error_message
-- 4. Fix issue and manually retry:
SELECT manually_sync_registration('uuid-here');
```

### Issue: Status not syncing back
```sql
-- 1. Verify status was changed to approved/rejected/waitlisted
SELECT status FROM registration_requests WHERE id = 'uuid-here';

-- 2. Check if trigger fired
SELECT * FROM sync_logs 
WHERE record_id = 'uuid-here' 
  AND sync_direction = 'edudash_to_edusite';

-- 3. If no log entry, trigger didn't fire - check trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_registration_status_updated';
```

### Issue: Edge Function 500 error
```bash
# View function logs
supabase functions logs sync-registration-to-edudash --project-ref bppuzibjlxgfwrujzfsz

# Check environment variables are set
supabase secrets list --project-ref bppuzibjlxgfwrujzfsz

# Redeploy if needed
supabase functions deploy sync-registration-to-edudash --project-ref bppuzibjlxgfwrujzfsz
```

## 📞 Service Info

### EduSitePro Supabase
- Project Ref: `bppuzibjlxgfwrujzfsz`
- URL: https://bppuzibjlxgfwrujzfsz.supabase.co
- Dashboard: https://supabase.com/dashboard/project/bppuzibjlxgfwrujzfsz

### EduDashPro Supabase
- Project Ref: `lvvvjywrmpcqrpvuptdi`
- URL: https://lvvvjywrmpcqrpvuptdi.supabase.co
- Dashboard: https://supabase.com/dashboard/project/lvvvjywrmpcqrpvuptdi

### Young Eagles
- Organization ID: `ba79097c-1b93-4b48-bcbe-df73878ab4d1`
- PWA URL: http://localhost:5174
- Registration Form: http://localhost:3002/registration/young-eagles

## 🔐 Security Reminders

- ✅ Service role keys stored as Supabase secrets (not in code)
- ✅ RLS enabled on all tables
- ✅ Edge Functions validate organization_id
- ✅ Webhook endpoints require Authorization header
- ✅ sync_logs table has RLS (admins only)

## 📚 Documentation

- Full Deployment Guide: `AUTOMATED_SYNC_DEPLOYMENT_GUIDE.md`
- Architecture Overview: `AUTOMATED_SYNC_ARCHITECTURE.md`
- Database Sync Strategy: `DATABASE_SYNC_STRATEGY.md`
- Field Mapping: `REGISTRATION_FIELDS_AUDIT.md`

## 🎯 Success Indicators

✅ Sync is working if:
- New registrations appear in both databases within 1-2 seconds
- sync_logs shows success = true
- Status updates sync back to EduSitePro
- No errors in Edge Function logs
- Both databases have same organization_id: ba79097c-1b93-4b48-bcbe-df73878ab4d1
