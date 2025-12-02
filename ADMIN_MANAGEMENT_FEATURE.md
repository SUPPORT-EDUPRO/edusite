# SuperAdmin: Admin Management Feature

## Overview
SuperAdmin can create platform admins and control their access to specific features using granular permission toggles.

## Database Schema

### Table: `admin_permissions`
Tracks permissions for each admin user. Created via migration `20251202_admin_permissions.sql`.

**Columns:**
- `id` - UUID primary key
- `user_id` - References auth.users (unique)
- Core Permissions:
  - `can_view_registrations` - View student registrations
  - `can_manage_registrations` - Approve/reject registrations
  - `can_view_organizations` - View school/org list
  - `can_manage_organizations` - Edit organizations
  - `can_approve_organizations` - Approve new school registrations
- Campaign & Marketing:
  - `can_view_campaigns` - View promo campaigns
  - `can_manage_campaigns` - Create/edit campaigns
- Content Management:
  - `can_manage_pages` - Edit pages in page builder
  - `can_manage_media` - Upload/delete media
  - `can_manage_navigation` - Edit site navigation
  - `can_manage_themes` - Change themes/colors
- Analytics & Reports:
  - `can_view_analytics` - View dashboard analytics
  - `can_export_data` - Export data to CSV/Excel
- User Management:
  - `can_manage_users` - View/delete regular users
  - `can_manage_admins` - Create/edit other admins (SuperAdmin only)
- System Settings:
  - `can_manage_settings` - Edit site settings
  - `can_manage_centres` - Manage ECD centres

**Default Permissions for New Admins:**
- View registrations: ✅
- Manage registrations: ✅
- View organizations: ✅
- All others: ❌

**Trigger:** Automatically creates default permissions when new admin profile is created.

## User Interface

### `/admin/admins` - Admin Management Page
**Access:** SuperAdmin only

**Features:**
1. **Stats Cards:**
   - Total Admins
   - SuperAdmins count
   - Platform Admins count

2. **Admin List Table:**
   - Shows all admin & superadmin users
   - Displays email, role, created date
   - Action buttons: Edit Permissions, Delete
   - SuperAdmins cannot be edited or deleted

3. **Create Admin Modal:**
   - Email input with validation
   - Grouped permission checkboxes:
     - Registrations
     - Organizations
     - Campaigns & Marketing
     - Content Management
     - Analytics & Data
     - System
   - Sends invitation email automatically

4. **Edit Permissions Modal:**
   - Same grouped permissions UI
   - Real-time toggle updates
   - Cannot edit SuperAdmin permissions

## API Endpoints

### `GET /api/admin/users`
**Auth:** SuperAdmin only  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2025-12-02T...",
      "permissions": {
        "can_view_registrations": true,
        "can_manage_registrations": true,
        ...
      }
    }
  ]
}
```

### `POST /api/admin/users`
**Auth:** SuperAdmin only  
**Body:**
```json
{
  "email": "newadmin@example.com",
  "permissions": {
    "can_view_registrations": true,
    ...
  }
}
```
**Actions:**
1. Creates auth.users record
2. Creates profiles record with role='admin'
3. Creates admin_permissions record
4. Sends invitation email via Supabase Auth

### `PATCH /api/admin/users/[id]`
**Auth:** SuperAdmin only  
**Body:**
```json
{
  "permissions": {
    "can_view_registrations": true,
    ...
  }
}
```
**Actions:**
- Updates admin_permissions table
- Cannot modify SuperAdmin permissions

### `DELETE /api/admin/users/[id]`
**Auth:** SuperAdmin only  
**Actions:**
- Deletes auth.users (cascades to profiles and admin_permissions)
- Cannot delete SuperAdmin users

## Security

### Row-Level Security (RLS)
- SuperAdmins can view/manage all permissions
- Admins can view their own permissions (read-only)
- All other roles have no access

### Validation
- Email validation required
- Cannot edit/delete SuperAdmin users
- Service role key required for auth operations

## Usage Examples

### Creating an Admin with Limited Permissions
```typescript
// SuperAdmin creates an admin who can only view/approve registrations
const newAdmin = {
  email: 'registrations-admin@school.com',
  permissions: {
    can_view_registrations: true,
    can_manage_registrations: true,
    can_view_organizations: true,
    // All others default to false
  }
};
```

### Creating a Content Manager
```typescript
// SuperAdmin creates an admin for content management
const contentAdmin = {
  email: 'content@school.com',
  permissions: {
    can_manage_pages: true,
    can_manage_media: true,
    can_manage_navigation: true,
    can_manage_themes: true,
    // No access to registrations or organizations
  }
};
```

## Navigation
- **Admin Management** link added to AdminLayout sidebar
- Icon: 👥
- Description: "Manage platform admins"
- Position: After "Centres", before "User Management"

## Migration Steps
1. Run `20251202_admin_permissions.sql` in Supabase SQL Editor
2. Deploy code with updated `/admin/admins` page
3. Verify table exists: `SELECT * FROM admin_permissions;`
4. Test creating first admin via UI

## Future Enhancements
- Audit log for permission changes
- Bulk permission presets (e.g., "Content Manager", "Registration Manager")
- Permission expiration dates
- Email notifications when permissions change
- Admin activity dashboard
