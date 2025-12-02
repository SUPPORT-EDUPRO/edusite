# Admin Permissions Migration Guide

## Quick Start (SuperAdmin)

### 1. Run the Migration
Open Supabase SQL Editor for **EduSitePro** database and execute:

```bash
# Location: /home/king/Desktop/edusitepro/supabase/migrations/20251202_admin_permissions.sql
```

Or run via Supabase CLI:
```bash
cd /home/king/Desktop/edusitepro
supabase db push
```

### 2. Verify Table Created
```sql
-- Check table exists
SELECT * FROM admin_permissions LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'admin_permissions';

-- Check trigger exists
SELECT tgname, tgtype FROM pg_trigger WHERE tgrelid = 'admin_permissions'::regclass;
```

### 3. Access Admin Management
1. Login as SuperAdmin: https://edusitepro.edudashpro.org.za/admin
2. Navigate to **Admin Management** (👥 icon in sidebar)
3. Click **Create Admin** button

### 4. Create Your First Admin
**Example: Registration Manager**
- Email: `registrations@edudashpro.org.za`
- Permissions:
  - ✅ View Registrations
  - ✅ Approve/Reject Registrations
  - ✅ View Organizations
  - ❌ All others

**Example: Content Manager**
- Email: `content@edudashpro.org.za`
- Permissions:
  - ✅ Manage Pages
  - ✅ Manage Media Library
  - ✅ Manage Navigation
  - ✅ Manage Themes
  - ❌ Access to registrations/organizations

## Migration Details

### What Gets Created

1. **Table: `admin_permissions`**
   - 17 permission columns (boolean)
   - RLS policies for SuperAdmin/Admin access
   - Indexes on user_id and created_by

2. **Trigger: `on_admin_profile_created`**
   - Auto-creates default permissions when profile.role = 'admin'
   - Runs on INSERT or UPDATE of profiles.role

3. **Function: `create_default_admin_permissions()`**
   - Sets default permissions:
     - can_view_registrations: true
     - can_manage_registrations: true
     - can_view_organizations: true
     - All others: false

### Rollback (if needed)

```sql
-- Drop everything in reverse order
DROP TRIGGER IF EXISTS on_admin_profile_created ON profiles;
DROP FUNCTION IF EXISTS create_default_admin_permissions();
DROP TABLE IF EXISTS admin_permissions CASCADE;
```

## Testing Checklist

- [ ] SuperAdmin can view /admin/admins page
- [ ] Create admin button opens modal
- [ ] Email validation works (rejects invalid emails)
- [ ] Permission checkboxes toggle correctly
- [ ] Creating admin sends invitation email
- [ ] New admin appears in list immediately
- [ ] Edit permissions modal loads existing permissions
- [ ] Updating permissions saves successfully
- [ ] Cannot edit SuperAdmin permissions (buttons hidden)
- [ ] Cannot delete SuperAdmin users (buttons hidden)
- [ ] Delete admin removes user completely
- [ ] New admins receive email with password reset link
- [ ] New admins can login with invited email

## Common Issues

### Issue: "Table admin_permissions does not exist"
**Solution:** Run the migration SQL script in Supabase SQL Editor

### Issue: "Permission denied for table admin_permissions"
**Solution:** Check RLS policies are created. SuperAdmin role must match in profiles table.

### Issue: "Invitation email not sent"
**Solution:** Check Supabase Auth email settings. SMTP must be configured.

### Issue: "Cannot create admin - profile insert failed"
**Solution:** Ensure profiles table exists and has id, email, role columns.

## Permission Reference

| Permission | Description | Default |
|-----------|-------------|---------|
| `can_view_registrations` | View student registration list | ✅ |
| `can_manage_registrations` | Approve/reject registrations | ✅ |
| `can_view_organizations` | View schools/orgs list | ✅ |
| `can_manage_organizations` | Edit organization details | ❌ |
| `can_approve_organizations` | Approve new school signups | ❌ |
| `can_view_campaigns` | View promo campaigns | ❌ |
| `can_manage_campaigns` | Create/edit campaigns | ❌ |
| `can_manage_pages` | Use page builder | ❌ |
| `can_manage_media` | Upload/delete media | ❌ |
| `can_manage_navigation` | Edit site menu | ❌ |
| `can_manage_themes` | Change site theme | ❌ |
| `can_view_analytics` | View dashboard stats | ❌ |
| `can_export_data` | Export to CSV/Excel | ❌ |
| `can_manage_users` | Delete regular users | ❌ |
| `can_manage_admins` | Create/edit admins | ❌ (SuperAdmin only) |
| `can_manage_settings` | Edit site settings | ❌ |
| `can_manage_centres` | Manage ECD centres | ❌ |

## Next Steps After Migration

1. ✅ Run migration SQL
2. ✅ Verify table and policies
3. ✅ Create first admin via UI
4. ✅ Test admin login with invitation link
5. ✅ Verify permissions enforce correctly
6. ✅ Document admin accounts for team

## Support

- Migration file: `supabase/migrations/20251202_admin_permissions.sql`
- Documentation: `ADMIN_MANAGEMENT_FEATURE.md`
- UI: `/admin/admins`
- API: `/api/admin/users`
