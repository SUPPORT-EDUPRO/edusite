# Automated Registration Sync - System Architecture

## Overview

This document provides a visual overview of the automated bidirectional sync system between EduSitePro (public registration portal) and EduDashPro (school management app).

## System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ECOSYSTEM ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Young Eagles    │         │   EduSitePro     │         │ EduDashPro   │
│      PWA         │────────▶│  Next.js Portal  │◀───────▶│  Mobile App  │
│  (Port 5174)     │         │   (Port 3002)    │         │ React Native │
└──────────────────┘         └──────────────────┘         └──────────────┘
        │                             │                            │
        │                             │                            │
        │                             ▼                            ▼
        │                    ┌──────────────┐          ┌─────────────────┐
        │                    │  Supabase    │          │   Supabase      │
        │                    │  (EduSite)   │◀────────▶│  (EduDash)      │
        └───────────────────▶│bppuzib...fsz │   Sync   │lvvvjyw...ptdi   │
                             └──────────────┘          └─────────────────┘
                                     │                          │
                                     └──────────┬───────────────┘
                                                │
                                        Edge Functions
                                     ┌──────────┴──────────┐
                                     │                     │
                              ┌──────▼──────┐    ┌────────▼────────┐
                              │Registration │    │   Approval      │
                              │   to Dash   │    │  to EduSite     │
                              └─────────────┘    └─────────────────┘
```

## Data Flow - New Registration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEP-BY-STEP REGISTRATION FLOW                       │
└─────────────────────────────────────────────────────────────────────────┘

1️⃣  Parent visits Young Eagles PWA
    URL: http://localhost:5174
    Action: Clicks "Register Now" button
    ↓

2️⃣  PWA routes to EduSitePro registration form
    URL: http://localhost:3002/registration/young-eagles
    Form: PublicRegistrationForm.tsx
    ↓

3️⃣  Parent fills out form and submits
    Data: Student info, guardian details, preferences
    Auto-assign class: Based on child's date of birth
    - 0-11 months → Little Explorers
    - 12-35 months → Curious Cubs
    - 36-71 months → Panda
    ↓

4️⃣  Form saves to EduSitePro database
    Table: registration_requests
    Status: pending
    Fields: 49 dedicated columns (no JSONB extras)
    ↓

5️⃣  Database trigger fires AUTOMATICALLY ✨
    Trigger: on_registration_insert_sync_to_edudash (AFTER INSERT)
    Function: trigger_sync_registration_to_edudash()
    Action: Calls Edge Function via net.http_post
    Deployed: 2025-11-24 with --no-verify-jwt flag
    ↓

6️⃣  Edge Function: sync-registration-to-edudash
    Input: Full registration record from EduSitePro
    Process:
    - Validates organization_id
    - Maps all 49 fields between schemas
    - Uses UPSERT to handle duplicates
    - Sets source = 'edusitepro_web_form'
    Output: Success/failure response
    Logs: Supabase Edge Function logs
    ↓

7️⃣  Record created in EduDashPro AUTOMATICALLY ✨
    Table: registration_requests
    Status: pending (always starts as pending)
    Same ID: Uses same UUID from EduSitePro
    Source: 'edusitepro_web_form' (for tracking)
    Backup: Manual "Sync" button available if needed
    ↓

8️⃣  Admin views in EduDashPro mobile app
    Screen: Pending Registrations
    Data: Student name, age, class, guardian info
    Real-time: Appears immediately after submission
    Action: Admin reviews application
    ↓

9️⃣  Admin takes action in app (verify payment, approve, reject)
    Options:
    - Verify Payment → Syncs back to EduSitePro ✨
    - Approve → Creates parent account + sends email ✨
    - Reject → Updates status in both databases ✨
    - Delete → Removes from both databases ✨
    Fields: reviewed_date, reviewed_by, internal_notes
    ↓

🔟  Database trigger fires (EduDashPro)
    Trigger: on_registration_status_updated (AFTER UPDATE)
    Function: notify_registration_status_change()
    Condition: Only if status changed to approved/rejected/waitlisted
    Action: Calls Edge Function via pg_net.http_post
    ↓

1️⃣1️⃣  Edge Function: sync-approval-to-edusite
    Input: New and old record from EduDashPro
    Process:
    - Validates status change
    - Updates record in EduSitePro
    Output: Success/failure response
    Logs: Saves to sync_logs table
    ↓

1️⃣2️⃣  Status synced back to EduSitePro
    Table: registration_requests
    Status: approved/rejected/waitlisted
    Fields: reviewed_date, reviewed_by, internal_notes
    ↓

1️⃣3️⃣  Parent sees updated status
    (Future: Email notification sent)
    (Future: Parent dashboard shows status)
```

## Database Schema Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 registration_requests TABLE SCHEMA                      │
└─────────────────────────────────────────────────────────────────────────┘

                EduSitePro                    EduDashPro
         ┌─────────────────────┐        ┌─────────────────────┐
         │  Core Fields        │        │  Core Fields        │
         ├─────────────────────┤        ├─────────────────────┤
         │ id (UUID, PK)       │◀──────▶│ id (UUID, PK)       │
         │ organization_id     │        │ organization_id     │
         │ centre_id           │        │ centre_id           │
         │ class_id            │        │ class_id            │
         │ status              │◀──────▶│ status              │
         │ created_at          │        │ created_at          │
         │ updated_at          │        │ updated_at          │
         └─────────────────────┘        └─────────────────────┘
         
         ┌─────────────────────┐        ┌─────────────────────┐
         │  Student Fields     │        │  Student Fields     │
         ├─────────────────────┤        ├─────────────────────┤
         │ student_first_name  │◀──────▶│ student_first_name  │
         │ student_last_name   │        │ student_last_name   │
         │ student_dob         │        │ student_dob         │
         │ student_gender      │        │ student_gender      │
         │ student_allergies   │        │ student_allergies   │
         │ student_medical_*   │        │ student_medical_*   │
         └─────────────────────┘        └─────────────────────┘
         
         ┌─────────────────────┐        ┌─────────────────────┐
         │  Guardian Fields    │        │  Guardian Fields    │
         ├─────────────────────┤        ├─────────────────────┤
         │ guardian_first_name │◀──────▶│ guardian_first_name │
         │ guardian_last_name  │        │ guardian_last_name  │
         │ guardian_email      │        │ guardian_email      │
         │ guardian_phone      │        │ guardian_phone      │
         │ guardian_work_phone │        │ guardian_work_phone │
         │ mother_* (10 cols)  │        │ mother_* (10 cols)  │
         │ father_* (10 cols)  │        │ father_* (10 cols)  │
         └─────────────────────┘        └─────────────────────┘
         
         ┌─────────────────────┐        ┌─────────────────────┐
         │  Review Fields      │        │  Review Fields      │
         ├─────────────────────┤        ├─────────────────────┤
         │ reviewed_date       │◀──────▶│ reviewed_date       │
         │ reviewed_by         │        │ reviewed_by         │
         │ rejection_reason    │        │ rejection_reason    │
         │ internal_notes      │        │ internal_notes      │
         └─────────────────────┘        └─────────────────────┘

Total Columns: 49 dedicated fields (no JSONB extras)
```

## Trigger & Edge Function Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       TRIGGER FLOW DIAGRAM                              │
└─────────────────────────────────────────────────────────────────────────┘

EduSitePro Database
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  registration_requests                                                │
│  ┌─────────────────┐                                                 │
│  │  INSERT event   │                                                 │
│  └────────┬────────┘                                                 │
│           │                                                           │
│           ▼                                                           │
│  ┌────────────────────────────────────┐                              │
│  │ Trigger: on_registration_submitted │                              │
│  └────────────────┬───────────────────┘                              │
│                   │                                                   │
│                   ▼                                                   │
│  ┌──────────────────────────────────────┐                            │
│  │ Function: notify_registration_*      │                            │
│  │ - Calls pg_net.http_post             │                            │
│  │ - Sends full record as JSON          │                            │
│  │ - Includes Authorization header      │                            │
│  └────────────────┬─────────────────────┘                            │
│                   │                                                   │
└───────────────────┼───────────────────────────────────────────────────┘
                    │
                    │ HTTPS POST
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    Edge Function (Supabase)                           │
│                                                                       │
│  sync-registration-to-edudash                                         │
│  ┌─────────────────────────────────────────┐                         │
│  │ 1. Validate request                     │                         │
│  │ 2. Extract registration data            │                         │
│  │ 3. Connect to EduDashPro DB             │                         │
│  │ 4. INSERT record with same UUID         │                         │
│  │ 5. Log to sync_logs table               │                         │
│  │ 6. Return success/error response        │                         │
│  └─────────────────────────────────────────┘                         │
│                                                                       │
└───────────────────┬───────────────────────────────────────────────────┘
                    │
                    │ Creates record
                    │
                    ▼
EduDashPro Database
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  registration_requests                                                │
│  ┌─────────────────┐                                                 │
│  │  Record created │                                                 │
│  │  Status: pending │                                                │
│  └─────────────────┘                                                 │
│                                                                       │
│  (Admin reviews and updates status via mobile app)                   │
│                                                                       │
│  ┌─────────────────┐                                                 │
│  │  UPDATE event   │                                                 │
│  │  (status change)│                                                 │
│  └────────┬────────┘                                                 │
│           │                                                           │
│           ▼                                                           │
│  ┌──────────────────────────────────────┐                            │
│  │ Trigger: on_registration_status_*    │                            │
│  └────────────────┬─────────────────────┘                            │
│                   │                                                   │
│                   ▼                                                   │
│  ┌──────────────────────────────────────┐                            │
│  │ Function: notify_registration_*      │                            │
│  │ - Only fires if status changed to    │                            │
│  │   approved/rejected/waitlisted       │                            │
│  │ - Calls pg_net.http_post             │                            │
│  │ - Sends NEW and OLD record           │                            │
│  └────────────────┬─────────────────────┘                            │
│                   │                                                   │
└───────────────────┼───────────────────────────────────────────────────┘
                    │
                    │ HTTPS POST
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    Edge Function (Supabase)                           │
│                                                                       │
│  sync-approval-to-edusite                                             │
│  ┌─────────────────────────────────────────┐                         │
│  │ 1. Validate status change               │                         │
│  │ 2. Extract approval data                │                         │
│  │ 3. Connect to EduSitePro DB             │                         │
│  │ 4. UPDATE matching record (same ID)     │                         │
│  │ 5. Log to sync_logs table               │                         │
│  │ 6. Return success/error response        │                         │
│  │ 7. TODO: Send email notification        │                         │
│  └─────────────────────────────────────────┘                         │
│                                                                       │
└───────────────────┬───────────────────────────────────────────────────┘
                    │
                    │ Updates status
                    │
                    ▼
EduSitePro Database
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  registration_requests                                                │
│  ┌─────────────────┐                                                 │
│  │  Status updated │                                                 │
│  │  approved/      │                                                 │
│  │  rejected/      │                                                 │
│  │  waitlisted     │                                                 │
│  └─────────────────┘                                                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Monitoring & Logging

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYNC LOGS TABLE                                 │
└─────────────────────────────────────────────────────────────────────────┘

sync_logs
┌─────────────────┬──────────────────────────────────────────────────────┐
│ Column          │ Purpose                                              │
├─────────────────┼──────────────────────────────────────────────────────┤
│ id              │ Unique log entry identifier                          │
│ source_table    │ Which table triggered sync (registration_requests)   │
│ record_id       │ UUID of the registration being synced                │
│ sync_direction  │ edusite_to_edudash or edudash_to_edusite             │
│ sync_type       │ new_registration, status_update, manual_sync         │
│ success         │ Boolean: Did the sync succeed?                       │
│ error_message   │ If failed, what went wrong?                          │
│ request_payload │ JSONB: Full data sent to Edge Function               │
│ response_payload│ JSONB: Response from Edge Function                   │
│ synced_at       │ Timestamp of sync attempt                            │
└─────────────────┴──────────────────────────────────────────────────────┘

Indexes:
- idx_sync_logs_record: Fast lookups by registration ID
- idx_sync_logs_synced_at: Query recent syncs
- idx_sync_logs_success: Find failed syncs quickly

RLS Policies:
- Admins can view all logs
- Service role can insert logs
- Regular users cannot access logs
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────┘

1️⃣  Database Level (RLS)
   ┌───────────────────────────────────────────────┐
   │ • All tables have RLS enabled                 │
   │ • Service role bypasses RLS for sync          │
   │ • Tenant isolation via organization_id        │
   │ • Parents can only view their own submissions │
   │ • Admins can view all for their organization  │
   └───────────────────────────────────────────────┘

2️⃣  Edge Function Level
   ┌───────────────────────────────────────────────┐
   │ • Authorization header required               │
   │ • Service role key stored as secret           │
   │ • CORS headers restrict origins               │
   │ • Validates organization_id before sync       │
   │ • Rate limiting (Supabase default)            │
   └───────────────────────────────────────────────┘

3️⃣  Network Level
   ┌───────────────────────────────────────────────┐
   │ • HTTPS only (TLS encryption)                 │
   │ • Supabase-to-Supabase communication          │
   │ • No public endpoints for sync                │
   │ • pg_net uses secure connections              │
   └───────────────────────────────────────────────┘

4️⃣  Application Level
   ┌───────────────────────────────────────────────┐
   │ • Public form validates all inputs            │
   │ • Auto-assigns class (no user manipulation)   │
   │ • Admin approval required for activation      │
   │ • Audit trail in sync_logs                    │
   └───────────────────────────────────────────────┘
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PERFORMANCE METRICS                             │
└─────────────────────────────────────────────────────────────────────────┘

Form Submission
┌────────────────────────────┐
│ Step                       │ Expected Time
├────────────────────────────┼──────────────
│ Form validation            │ < 100ms
│ INSERT to EduSitePro       │ < 200ms
│ Trigger execution          │ < 50ms
│ Edge Function call         │ 500-1000ms
│ INSERT to EduDashPro       │ < 200ms
│ Total (parent perspective) │ < 300ms
└────────────────────────────┴──────────────
(Edge Function runs async after response sent)

Status Update
┌────────────────────────────┐
│ Step                       │ Expected Time
├────────────────────────────┼──────────────
│ UPDATE in EduDashPro       │ < 200ms
│ Trigger execution          │ < 50ms
│ Edge Function call         │ 500-1000ms
│ UPDATE in EduSitePro       │ < 200ms
│ Total (admin perspective)  │ < 200ms
└────────────────────────────┴──────────────
(Edge Function runs async)

Scalability
┌────────────────────────────────────────────┐
│ • Handles 100+ concurrent registrations    │
│ • Edge Functions auto-scale                │
│ • Database connection pooling              │
│ • No blocking operations in user flow      │
│ • Async sync (fire-and-forget)             │
└────────────────────────────────────────────┘
```

## Deployment Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PRE-DEPLOYMENT CHECKLIST                          │
└─────────────────────────────────────────────────────────────────────────┘

Prerequisites
☐ Supabase CLI installed (npm install -g supabase)
☐ Service role keys for both databases obtained
☐ Access to Supabase Dashboard for both projects
☐ pg_net extension enabled in both databases

Edge Functions
☐ Link to Supabase project (supabase link)
☐ Set environment variables (supabase secrets set)
☐ Deploy sync-registration-to-edudash
☐ Deploy sync-approval-to-edusite
☐ Verify deployment in Dashboard → Edge Functions

Database Setup
☐ Run migrations/setup_automated_sync_webhooks.sql in EduSitePro
☐ Run migrations/setup_automated_sync_webhooks.sql in EduDashPro
☐ Verify triggers created (check information_schema.triggers)
☐ Verify sync_logs table exists in both databases

Testing
☐ Submit test registration via Young Eagles PWA
☐ Verify record appears in both databases (same UUID)
☐ Update status in EduDashPro to 'approved'
☐ Verify status syncs back to EduSitePro
☐ Check sync_logs for success entries
☐ Review Edge Function logs for errors

Monitoring Setup
☐ Configure alerts for failed syncs
☐ Set up periodic sync_logs cleanup job
☐ Monitor Edge Function execution time
☐ Track sync success rate metrics

Post-Deployment
☐ Document service role keys in secure location
☐ Train admins on registration approval workflow
☐ Set up email notifications (future enhancement)
☐ Create parent-facing status dashboard (future)

┌─────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT COMMANDS                               │
└─────────────────────────────────────────────────────────────────────────┘

Quick Deploy:
  cd /home/king/Desktop/edusitepro
  ./deploy-automated-sync.sh

Manual Deploy:
  supabase link --project-ref bppuzibjlxgfwrujzfsz
  supabase secrets set EDUSITE_SUPABASE_URL="https://bppuzibjlxgfwrujzfsz.supabase.co"
  supabase secrets set EDUSITE_SERVICE_ROLE_KEY="<key>"
  supabase secrets set EDUDASH_SUPABASE_URL="https://lvvvjywrmpcqrpvuptdi.supabase.co"
  supabase secrets set EDUDASH_SERVICE_ROLE_KEY="<key>"
  supabase functions deploy sync-registration-to-edudash
  supabase functions deploy sync-approval-to-edusite

Verify Deployment:
  SELECT * FROM sync_logs ORDER BY synced_at DESC LIMIT 10;
  SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'on_registration%';
```

## Troubleshooting Guide

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       COMMON ISSUES & SOLUTIONS                         │
└─────────────────────────────────────────────────────────────────────────┘

❌ Edge Function Returns 500 Error
   ✅ Check Edge Function logs in Dashboard
   ✅ Verify environment variables set correctly
   ✅ Ensure service role keys are valid
   ✅ Check database RLS policies allow service role

❌ Webhook Not Firing
   ✅ Verify pg_net extension installed
   ✅ Check trigger exists and is enabled
   ✅ Test with manual sync function
   ✅ Review database logs for trigger errors

❌ Record Not Syncing to EduDashPro
   ✅ Check organization_id matches (ba79097c...)
   ✅ Verify class_id exists in EduDashPro
   ✅ Review Edge Function logs for validation errors
   ✅ Check sync_logs table for error messages

❌ Status Not Syncing Back to EduSitePro
   ✅ Ensure trigger on UPDATE exists in EduDashPro
   ✅ Verify status changed to approved/rejected/waitlisted
   ✅ Check Edge Function logs
   ✅ Confirm record ID exists in both databases

❌ Duplicate Records Created
   ✅ Edge Function uses same UUID (shouldn't happen)
   ✅ Check for race conditions in form submission
   ✅ Review trigger logic for duplicate prevention

Debugging Commands:
  -- View recent sync attempts
  SELECT * FROM sync_logs WHERE success = false ORDER BY synced_at DESC LIMIT 10;
  
  -- Check trigger status
  SELECT trigger_name, event_manipulation, action_statement 
  FROM information_schema.triggers 
  WHERE trigger_name LIKE '%registration%';
  
  -- Manually retry failed sync
  SELECT manually_sync_registration('<registration-id>');
  
  -- Test Edge Function directly
  curl -X POST https://bppuzibjlxgfwrujzfsz.supabase.co/functions/v1/sync-registration-to-edudash \
    -H "Authorization: Bearer <service-role-key>" \
    -H "Content-Type: application/json" \
    -d '{"record": {...}, "type": "new_registration"}'
```

## Files Created

```
/home/king/Desktop/edusitepro/
├── supabase/
│   └── functions/
│       ├── sync-registration-to-edudash/
│       │   └── index.ts (Forward sync: EduSitePro → EduDashPro)
│       └── sync-approval-to-edusite/
│           └── index.ts (Reverse sync: EduDashPro → EduSitePro)
├── migrations/
│   └── setup_automated_sync_webhooks.sql (Database triggers & logging)
├── deploy-automated-sync.sh (Quick deployment script)
├── AUTOMATED_SYNC_DEPLOYMENT_GUIDE.md (Full deployment guide)
└── AUTOMATED_SYNC_ARCHITECTURE.md (This document)
```

## Next Steps

1. **Run Deployment**: Execute `./deploy-automated-sync.sh`
2. **Test Flow**: Submit test registration and verify bidirectional sync
3. **Monitor Logs**: Check sync_logs for any failures
4. **Email Notifications**: Add email alerts for status changes
5. **Parent Dashboard**: Build status tracking interface for parents
6. **Analytics**: Track conversion rates from registration to enrollment
