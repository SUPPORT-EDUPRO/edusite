# Quick Reference: User Deletion System

## Tables Checked During Deletion

```
┌─────────────────────────────────────────────────────────────┐
│  USER DELETION CASCADE                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. registration_requests (by guardian_email)               │
│  2. registration_requests (by user_id, if exists)           │
│  3. user_organizations                                       │
│  4. user_profiles                                            │
│  5. user_preferences                                         │
│  6. student_parents (user_id AND parent_id)                 │
│  7. class_enrollments (user_id AND student_id)              │
│  8. user_sessions                                            │
│  9. profiles (CRITICAL - must succeed)                      │
│ 10. auth.users (via Supabase Admin API)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Commands

### Preview Deletion (API)
```bash
curl http://localhost:3000/api/admin/users/USER_UUID
```

### Execute Deletion (API)
```bash
curl -X DELETE http://localhost:3000/api/admin/users/USER_UUID
```

### Delete via SQL
```sql
SELECT delete_user_and_related_records(
  'USER_UUID_HERE',
  'user@email.com'
);
```

### Check Related Records (SQL)
```sql
-- Count registration requests by email
SELECT COUNT(*) FROM registration_requests 
WHERE guardian_email = 'user@email.com';

-- Count user organizations
SELECT COUNT(*) FROM user_organizations 
WHERE user_id = 'USER_UUID';

-- Check profile exists
SELECT * FROM profiles WHERE id = 'USER_UUID';
```

## UI Access

**URL**: `/admin/users`

**Steps**:
1. Search/filter for user
2. Click 🗑️ delete button
3. Review preview modal
4. Confirm deletion
5. View detailed log

## Response Format

### Success
```json
{
  "success": true,
  "message": "User John Doe (john@example.com) successfully deleted",
  "userId": "uuid",
  "deletionLog": [
    "Found user profile: John Doe (john@example.com)",
    "✓ Deleted 2 registration request(s)",
    "✓ Deleted user profile",
    "✓ Deleted authentication record"
  ],
  "warnings": ["Optional warnings here"],
  "timestamp": "2025-11-24T12:00:00Z"
}
```

### Error
```json
{
  "success": false,
  "error": "Failed to delete user profile",
  "details": "Error message here",
  "deletionLog": ["Actions taken before error"],
  "errors": ["List of errors"]
}
```

## Adding New Tables

To add a new table to the deletion cascade:

### 1. Update API Route
Add to `/src/app/api/admin/users/[id]/route.ts`:

```typescript
// In DELETE handler
try {
  const { data: records } = await supabase
    .from('your_new_table')
    .select('id')
    .eq('user_id', userId);

  if (records && records.length > 0) {
    const { error: deleteError } = await supabase
      .from('your_new_table')
      .delete()
      .eq('user_id', userId);

    if (!deleteError) {
      deletionLog.push(`✓ Deleted ${records.length} record(s) from your_new_table`);
    }
  }
} catch (error) {
  console.debug('your_new_table check (optional):', error);
}
```

### 2. Update SQL Function
Add to `/delete-user-function.sql`:

```sql
-- Step N: Delete from your_new_table
BEGIN
  DELETE FROM your_new_table 
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  IF affected_rows > 0 THEN
    deletion_log := deletion_log || jsonb_build_object(
      'step', 'your_new_table',
      'message', format('Deleted %s record(s) from your_new_table', affected_rows)
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Table might not exist
END;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Profile deletion failed" | Check foreign key constraints, verify no circular references |
| "Auth user deletion failed" | Ensure using service_role key, not anon key |
| "No records deleted" | User might not exist, check profiles and auth.users tables |
| "Table doesn't exist" | Normal if table not created yet, logged as debug not error |

## Testing Checklist

- [ ] Delete user with no related records
- [ ] Delete user with registration requests
- [ ] Delete user with multiple related records
- [ ] Verify auth.users deletion
- [ ] Check deletion log accuracy
- [ ] Test with missing tables (should not error)
- [ ] Verify orphaned records cleaned up
- [ ] Check audit trail completeness

## File Locations

```
edusitepro/
├── src/
│   └── app/
│       ├── api/
│       │   └── admin/
│       │       └── users/
│       │           └── [id]/
│       │               └── route.ts          # API endpoint
│       └── admin/
│           └── users/
│               └── page.tsx                 # Admin UI
├── delete-user-function.sql                # SQL function
├── USER_DELETION_GUIDE.md                  # Full guide
└── COMPREHENSIVE_DELETE_IMPLEMENTATION.md  # Summary
```

## Environment Requirements

- ✅ Service role Supabase key configured
- ✅ Admin role exists in profiles table
- ✅ RLS policies allow admin access
- ✅ Foreign key constraints properly defined

## Performance Notes

- Deletion is synchronous (blocking)
- Typical deletion time: 1-3 seconds
- Handles up to ~1000 related records efficiently
- For bulk deletions, consider background job

## Security Notes

- ✅ Requires admin authentication
- ✅ Uses service role for auth operations
- ✅ SQL function uses SECURITY DEFINER
- ✅ All operations logged for audit
- ❌ No soft delete (hard delete only)
- ❌ No undo (permanent)

## Related Documentation

- **Full Guide**: `USER_DELETION_GUIDE.md`
- **Implementation Summary**: `COMPREHENSIVE_DELETE_IMPLEMENTATION.md`
- **Database Standards**: `WARP.md`
- **Admin Setup**: `ADMIN_SETUP_GUIDE.md`
