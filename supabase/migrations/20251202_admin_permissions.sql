-- Migration: Admin Permissions System
-- Description: Add permissions table for granular admin access control
-- Date: 2025-12-02

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core Permissions
  can_view_registrations BOOLEAN DEFAULT true,
  can_manage_registrations BOOLEAN DEFAULT false,
  can_view_organizations BOOLEAN DEFAULT true,
  can_manage_organizations BOOLEAN DEFAULT false,
  can_approve_organizations BOOLEAN DEFAULT false,
  
  -- Campaign & Marketing
  can_view_campaigns BOOLEAN DEFAULT false,
  can_manage_campaigns BOOLEAN DEFAULT false,
  
  -- Content Management
  can_manage_pages BOOLEAN DEFAULT false,
  can_manage_media BOOLEAN DEFAULT false,
  can_manage_navigation BOOLEAN DEFAULT false,
  can_manage_themes BOOLEAN DEFAULT false,
  
  -- Analytics & Reports
  can_view_analytics BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT false,
  
  -- User Management
  can_manage_users BOOLEAN DEFAULT false,
  can_manage_admins BOOLEAN DEFAULT false, -- Only SuperAdmin can grant this
  
  -- System Settings
  can_manage_settings BOOLEAN DEFAULT false,
  can_manage_centres BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- SuperAdmins can see all permissions
CREATE POLICY "SuperAdmins can view all permissions"
  ON admin_permissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- SuperAdmins can insert/update/delete permissions
CREATE POLICY "SuperAdmins can manage all permissions"
  ON admin_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Admins can view their own permissions
CREATE POLICY "Admins can view own permissions"
  ON admin_permissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to automatically create default permissions for new admins
CREATE OR REPLACE FUNCTION create_default_admin_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO admin_permissions (
      user_id,
      can_view_registrations,
      can_manage_registrations,
      can_view_organizations,
      created_by
    ) VALUES (
      NEW.id,
      true,
      true,
      true,
      auth.uid()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create permissions when profile is created/updated
CREATE TRIGGER on_admin_profile_created
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_admin_permissions();

-- Create updated_at trigger
CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_admin_permissions_user_id ON admin_permissions(user_id);
CREATE INDEX idx_admin_permissions_created_by ON admin_permissions(created_by);

-- Comments
COMMENT ON TABLE admin_permissions IS 'Granular permissions for admin users';
COMMENT ON COLUMN admin_permissions.can_view_registrations IS 'Can view student registration requests';
COMMENT ON COLUMN admin_permissions.can_manage_registrations IS 'Can approve/reject registration requests';
COMMENT ON COLUMN admin_permissions.can_approve_organizations IS 'Can approve new school/organization registrations';
COMMENT ON COLUMN admin_permissions.can_manage_admins IS 'Can create and manage other admin users (SuperAdmin only)';
