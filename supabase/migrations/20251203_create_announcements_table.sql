-- ============================================================================
-- ANNOUNCEMENTS TABLE FOR EDUSITEPRO
-- ============================================================================
-- Purpose: Create announcements table for school-wide communications
-- Used by: Young Eagles dashboard, principal/teacher announcements
-- ============================================================================

-- ============================================================================
-- 1. CREATE ANNOUNCEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preschool_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'teachers', 'parents', 'students')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]'::jsonb,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Add foreign key to organizations (preschools)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'announcements_preschool_id_fkey'
        AND table_name = 'announcements'
    ) THEN
        ALTER TABLE announcements 
        ADD CONSTRAINT announcements_preschool_id_fkey 
        FOREIGN KEY (preschool_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key to auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'announcements_author_id_fkey'
        AND table_name = 'announcements'
    ) THEN
        ALTER TABLE announcements 
        ADD CONSTRAINT announcements_author_id_fkey 
        FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_announcements_preschool_id
ON announcements (preschool_id);

CREATE INDEX IF NOT EXISTS idx_announcements_author_id
ON announcements (author_id);

CREATE INDEX IF NOT EXISTS idx_announcements_published_at
ON announcements (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_preschool_published
ON announcements (preschool_id, is_published, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_preschool_pinned
ON announcements (preschool_id, is_pinned DESC, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_scheduled
ON announcements (scheduled_for) WHERE scheduled_for IS NOT NULL;

-- ============================================================================
-- 4. ENABLE RLS AND CREATE POLICIES
-- ============================================================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view announcements from their preschool
DROP POLICY IF EXISTS announcements_select_policy ON announcements;
CREATE POLICY announcements_select_policy ON announcements
FOR SELECT
USING (
  -- Allow if user is associated with the preschool
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE
      p.id = auth.uid()
      AND p.organization_id = announcements.preschool_id
  )
  OR
  -- Allow super admins
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE
      p.id = auth.uid()
      AND p.role = 'super_admin'
  )
);

-- Policy: Principals and admins can create announcements
DROP POLICY IF EXISTS announcements_insert_policy ON announcements;
CREATE POLICY announcements_insert_policy ON announcements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE
      p.id = auth.uid()
      AND p.organization_id = announcements.preschool_id
      AND p.role IN ('principal', 'admin', 'super_admin')
  )
  AND author_id = auth.uid()
);

-- Policy: Authors and admins can update announcements
DROP POLICY IF EXISTS announcements_update_policy ON announcements;
CREATE POLICY announcements_update_policy ON announcements
FOR UPDATE
USING (
  author_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE
      p.id = auth.uid()
      AND p.organization_id = announcements.preschool_id
      AND p.role IN ('principal', 'admin', 'super_admin')
  )
);

-- Policy: Authors and admins can delete announcements
DROP POLICY IF EXISTS announcements_delete_policy ON announcements;
CREATE POLICY announcements_delete_policy ON announcements
FOR DELETE
USING (
  author_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles AS p
    WHERE
      p.id = auth.uid()
      AND p.organization_id = announcements.preschool_id
      AND p.role IN ('principal', 'admin', 'super_admin')
  )
);

-- ============================================================================
-- 5. CREATE UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS announcements_updated_at_trigger ON announcements;
CREATE TRIGGER announcements_updated_at_trigger
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON announcements TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration creates the announcements table with:
-- - Full RLS policies for multi-tenant isolation
-- - Support for pinned, scheduled, and prioritized announcements
-- - Attachment support via JSONB
-- - View tracking
-- - Auto-updated timestamps
-- ============================================================================
