# User Deletion Flow Diagram

## Visual Overview

```
                    USER DELETION SYSTEM
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │       Admin UI: /admin/users                    │
    │   • Search & filter users                       │
    │   • Click delete button                         │
    └─────────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │    GET /api/admin/users/[id]                    │
    │   • Fetch user profile                          │
    │   • Count related records                       │
    │   • Return preview data                         │
    └─────────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │    Confirmation Modal                           │
    │   ┌─────────────────────────────────────┐       │
    │   │ User: John Doe (john@example.com)   │       │
    │   │ Role: user                          │       │
    │   │                                     │       │
    │   │ Related Records:                    │       │
    │   │  • 2 registration_requests          │       │
    │   │  • 1 user_organizations             │       │
    │   │                                     │       │
    │   │ ⚠️  This action cannot be undone    │       │
    │   │                                     │       │
    │   │  [Cancel]  [Yes, Delete User]      │       │
    │   └─────────────────────────────────────┘       │
    └─────────────────────────────────────────────────┘
                          │
                    (User confirms)
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │    DELETE /api/admin/users/[id]                 │
    │                                                  │
    │  Comprehensive Deletion Process:                │
    │                                                  │
    │  Step 1: Fetch user details                     │
    │          ├─ email, full_name                    │
    │          └─ Log: "Found user: John Doe"         │
    │                                                  │
    │  Step 2: Delete registration_requests           │
    │          ├─ By guardian_email                   │
    │          ├─ By user_id (if exists)              │
    │          └─ Log: "✓ Deleted 2 registrations"    │
    │                                                  │
    │  Step 3: Delete user_organizations              │
    │          └─ Log: "✓ Deleted 1 record(s)"        │
    │                                                  │
    │  Step 4: Delete user_profiles                   │
    │          └─ (if exists)                         │
    │                                                  │
    │  Step 5: Delete user_preferences                │
    │          └─ (if exists)                         │
    │                                                  │
    │  Step 6: Delete student_parents                 │
    │          ├─ user_id OR parent_id                │
    │          └─ (if exists)                         │
    │                                                  │
    │  Step 7: Delete class_enrollments               │
    │          ├─ user_id OR student_id               │
    │          └─ (if exists)                         │
    │                                                  │
    │  Step 8: Delete user_sessions                   │
    │          └─ (if exists)                         │
    │                                                  │
    │  Step 9: Delete profiles (CRITICAL)             │
    │          └─ Log: "✓ Deleted user profile"       │
    │                                                  │
    │  Step 10: Delete auth.users                     │
    │           ├─ Via Supabase Admin API             │
    │           └─ Log: "✓ Deleted auth record"       │
    │                                                  │
    └─────────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │    Success Response                             │
    │   {                                             │
    │     "success": true,                            │
    │     "message": "User deleted successfully",     │
    │     "deletionLog": [                            │
    │       "Found user: John Doe",                   │
    │       "✓ Deleted 2 registrations",              │
    │       "✓ Deleted 1 user_organizations",         │
    │       "✓ Deleted user profile",                 │
    │       "✓ Deleted auth record"                   │
    │     ],                                          │
    │     "warnings": []                              │
    │   }                                             │
    └─────────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │    UI: Show Detailed Log                        │
    │                                                  │
    │  ✅ User deleted successfully!                  │
    │                                                  │
    │  Deletion Log:                                  │
    │    • Found user: John Doe (john@example.com)    │
    │    • ✓ Deleted 2 registrations                  │
    │    • ✓ Deleted 1 user_organizations             │
    │    • ✓ Deleted user profile                     │
    │    • ✓ Deleted auth record                      │
    │                                                  │
    └─────────────────────────────────────────────────┘
```

## Error Handling Flow

```
                    Deletion Step
                          │
                          ▼
                 ┌────────────────┐
                 │  Try Operation │
                 └────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    ┌──────────────┐          ┌──────────────┐
    │   SUCCESS    │          │    ERROR     │
    └──────────────┘          └──────────────┘
            │                           │
            │                           ▼
            │                  ┌────────────────┐
            │                  │  Is Critical?  │
            │                  └────────────────┘
            │                     │          │
            │                     │          │
            │              ┌──────┘          └──────┐
            │              │ Yes                No  │
            │              ▼                        ▼
            │      ┌──────────────┐      ┌──────────────┐
            │      │ ABORT & FAIL │      │ LOG WARNING  │
            │      └──────────────┘      └──────────────┘
            │              │                        │
            └──────────────┴────────────────────────┘
                          │
                          ▼
                 Continue to Next Step
```

## Table Dependency Map

```
                       profiles (CORE)
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  registration_      user_           student_parents
    requests      organizations     
         │                              │
         │                              ▼
         │                        class_enrollments
         │
         ▼
  (by email AND user_id)


  Critical: profiles must be deleted last (after all dependencies)
  Non-Critical: Other tables can fail without aborting deletion
```

## Database Transaction Flow

```sql
BEGIN TRANSACTION;

  -- Step 1-8: Delete dependent records
  -- (Each wrapped in error handling)
  
  DELETE FROM registration_requests WHERE guardian_email = 'user@email.com';
  -- Log: ✓ or ⚠️
  
  DELETE FROM user_organizations WHERE user_id = 'uuid';
  -- Log: ✓ or ⚠️
  
  -- ... more deletes ...
  
  -- Step 9: Critical - Delete profile
  DELETE FROM profiles WHERE id = 'uuid';
  -- If fails → ROLLBACK
  
  -- Step 10: Delete auth (via API, not in transaction)

COMMIT;
```

## Data Flow

```
User Input (Delete Button)
    ↓
API Request
    ↓
Database Queries (Sequential)
    ↓
Deletion Log Collection
    ↓
Response with Log
    ↓
UI Display
```

## Security Layers

```
┌────────────────────────────────────────┐
│  Browser / UI Layer                    │
│  • Admin role check                    │
│  • Confirmation modal                  │
└────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────┐
│  API Layer                             │
│  • Authentication check                │
│  • Authorization check                 │
│  • Service role for auth deletion      │
└────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────┐
│  Database Layer                        │
│  • RLS policies                        │
│  • SECURITY DEFINER function           │
│  • Foreign key constraints             │
└────────────────────────────────────────┘
```

## Logging & Audit Trail

```
Every Step Logged:
┌─────────────────────────────────────┐
│ Timestamp: 2025-11-24T12:00:00Z     │
│ Admin: admin@edudashpro.org.za      │
│ Action: DELETE_USER                 │
│ Target: john@example.com            │
│                                     │
│ Steps:                              │
│  1. ✓ Found user profile            │
│  2. ✓ Deleted 2 registrations       │
│  3. ✓ Deleted 1 user_org            │
│  4. ⚠️  user_profiles not found     │
│  5. ✓ Deleted profile               │
│  6. ✓ Deleted auth record           │
│                                     │
│ Result: SUCCESS                     │
└─────────────────────────────────────┘
```

## State Machine

```
                    [IDLE]
                      │
                      ▼
              [PREVIEW_REQUESTED]
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    [LOADING_PREVIEW]      [CANCELLED]
          │                       │
          ▼                       │
    [PREVIEW_LOADED]              │
          │                       │
          ▼                       │
    [CONFIRMING]                  │
          │                       │
    ┌─────┴─────┐                 │
    ▼           ▼                 │
[DELETING]  [CANCELLED]           │
    │                             │
    ▼                             │
[DELETED]                         │
    │                             │
    └─────────────────────────────┘
                      │
                      ▼
                   [IDLE]
```

## Performance Characteristics

```
Average Deletion Time by Related Records:

No related records:      < 0.5s  ███
1-10 related records:    0.5-1s  ██████
10-100 related records:  1-2s    ████████████
100+ related records:    2-5s    ██████████████████

Critical Operations Only: ~100ms
With Auth Deletion:      +200ms
```

## Error Recovery Path

```
                  [ERROR OCCURS]
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        [CRITICAL]           [NON-CRITICAL]
              │                   │
              ▼                   ▼
        [ROLLBACK]           [LOG WARNING]
              │                   │
              ▼                   ▼
      [RETURN ERROR]       [CONTINUE]
                                  │
                                  ▼
                          [COMPLETE WITH WARNINGS]
```
