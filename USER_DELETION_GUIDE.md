# Comprehensive User Deletion System

## Overview

The user deletion system has been enhanced to handle **cascading deletes** across all related tables gracefully. When a user is deleted, the system automatically checks and cleans up all associated records from:

- ✅ `registration_requests` (by email and user_id)
- ✅ `user_organizations`
- ✅ `user_profiles`
- ✅ `user_preferences`
- ✅ `student_parents`
- ✅ `class_enrollments`
- ✅ `user_sessions`
- ✅ `profiles` (user profile)
- ✅ `auth.users` (authentication record)

## Features

### 1. **Graceful Error Handling**
- Checks if tables exist before attempting deletion
- Continues deletion process even if some tables are missing
- Logs warnings for non-critical failures
- Returns detailed deletion log with all actions taken

### 2. **Preview Before Delete**
- Shows user details and related record counts
- Warns if user has dependent records
- Requires explicit confirmation

### 3. **Comprehensive Deletion Log**
- Records every table checked
- Shows number of records deleted from each table
- Lists any errors or warnings encountered
- Provides full audit trail

## Usage

### Via Admin UI

1. Navigate to **Admin Panel → Users**
2. Click the **Delete** button (🗑️) next to the user
3. Review the deletion preview:
   - User details
   - Related records count
   - Warning messages
4. Confirm deletion
5. View detailed deletion log

### Via API

**Get user details and related records:**

```bash
GET /api/admin/users/[id]
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name",
    "role": "user"
  },
  "relatedRecords": {
    "registration_requests": 2,
    "user_organizations": 1
  },
  "canDelete": true,
  "warnings": "This user has related records that will also be deleted"
}
```

**Delete user:**

```bash
DELETE /api/admin/users/[id]
```

Response:
```json
{
  "success": true,
  "message": "User John Doe (john@example.com) successfully deleted",
  "userId": "uuid",
  "deletionLog": [
    "Found user profile: John Doe (john@example.com)",
    "Found 2 registration request(s)",
    "✓ Deleted registration: Child Name 1",
    "✓ Deleted registration: Child Name 2",
    "✓ Deleted 1 record(s) from user_organizations",
    "✓ Deleted user profile",
    "✓ Deleted authentication record"
  ],
  "warnings": [
    "Auth user deletion requires admin API call"
  ],
  "timestamp": "2025-11-24T12:00:00Z"
}
```

### Via SQL Function

```sql
-- Delete user with detailed log
SELECT delete_user_and_related_records(
  'user-uuid-here',
  'user@email.com'
);
```

Response:
```json
{
  "success": true,
  "user_id": "uuid",
  "user_email": "user@email.com",
  "user_name": "User Name",
  "deletion_log": [
    {
      "step": "user_lookup",
      "message": "Found user: User Name (user@email.com)"
    },
    {
      "step": "registration_requests_by_email",
      "message": "Deleted 2 registration request(s) by email"
    },
    {
      "step": "profiles",
      "message": "Deleted user profile"
    }
  ],
  "errors": [],
  "timestamp": "2025-11-24T12:00:00Z"
}
```

## Implementation Details

### Tables Checked (in order)

1. **registration_requests**
   - Checks by `guardian_email` (always)
   - Checks by `user_id` (if column exists)
   - This handles parent registration records

2. **user_organizations**
   - Links between users and organizations
   - Organization admin assignments

3. **user_profiles**
   - Extended user profile data
   - Custom fields and metadata

4. **user_preferences**
   - User settings and preferences
   - UI customizations

5. **student_parents**
   - Parent-child relationships
   - Checks both `user_id` and `parent_id`

6. **class_enrollments**
   - Student class assignments
   - Checks both `user_id` and `student_id`

7. **user_sessions**
   - Active login sessions
   - Session tokens

8. **profiles** (CRITICAL)
   - Main user profile
   - Must succeed or deletion fails

9. **auth.users** (REQUIRES SERVICE_ROLE)
   - Authentication credentials
   - Handled via Supabase Admin API

### Error Handling Strategy

- **Non-critical errors**: Logged as warnings, deletion continues
- **Critical errors**: Deletion aborted, transaction rolled back
- **Missing tables/columns**: Silently skipped (not errors)

### Security

- ✅ Requires admin role to delete users
- ✅ Uses service_role for auth.users deletion
- ✅ SQL function uses SECURITY DEFINER
- ✅ All operations logged for audit trail

## Files Added/Modified

### New Files

1. **`/src/app/api/admin/users/[id]/route.ts`**
   - GET: Preview user deletion
   - DELETE: Execute comprehensive deletion

2. **`/src/app/admin/users/page.tsx`**
   - User management UI
   - Delete confirmation modal
   - Detailed deletion log display

3. **`/delete-user-function.sql`**
   - SQL function for database-level deletion
   - Can be called from migrations or scripts

### Documentation

- **`/USER_DELETION_GUIDE.md`** (this file)
  - Complete usage guide
  - API documentation
  - Implementation details

## Testing

### Test Scenarios

1. ✅ Delete user with no related records
2. ✅ Delete user with registration requests
3. ✅ Delete user with multiple related records
4. ✅ Delete user where some tables don't exist
5. ✅ Verify auth.users deletion
6. ✅ Check deletion log accuracy

### Test Commands

```bash
# Test via SQL
SELECT delete_user_and_related_records(
  'test-user-uuid',
  'test@example.com'
);

# Test via API (from terminal)
curl -X DELETE http://localhost:3000/api/admin/users/test-user-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Migration

To add the SQL function to your database:

```bash
cd /home/king/Desktop/edusitepro
psql "$DATABASE_URL" -f delete-user-function.sql
```

Or via Supabase SQL Editor:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste contents of `delete-user-function.sql`
4. Run query

## Troubleshooting

### Issue: "Profile deletion failed"

**Cause**: Foreign key constraints or RLS policies blocking deletion

**Solution**: Check for remaining foreign key references:
```sql
SELECT table_name, constraint_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';
```

### Issue: "Auth user deletion failed"

**Cause**: Requires service_role permissions

**Solution**: Ensure `getServiceRoleClient()` is using service role key, not anon key

### Issue: "No records deleted"

**Cause**: User might not exist or already deleted

**Solution**: Check user existence first:
```sql
SELECT * FROM profiles WHERE id = 'user-uuid';
SELECT * FROM auth.users WHERE id = 'user-uuid';
```

## Best Practices

1. **Always preview before deleting**
   - Use GET endpoint to see what will be deleted
   - Review related records count

2. **Backup before bulk deletions**
   - Export user data if needed for records
   - Keep audit logs

3. **Monitor deletion logs**
   - Check for patterns in warnings
   - Identify missing tables that should exist

4. **Test in staging first**
   - Verify deletion behavior with your schema
   - Check for custom tables not in default list

## Future Enhancements

- [ ] Soft delete option (mark as deleted instead of removing)
- [ ] Scheduled deletion (delete after X days)
- [ ] Bulk user deletion
- [ ] Export user data before deletion
- [ ] Email notification to user before deletion
- [ ] Undo deletion (from backup/soft delete)

## Support

For issues or questions:
- Check deletion logs for specific error messages
- Review related records in preview
- Test SQL function directly for database-level debugging
- Consult `WARP.md` for database operation standards
