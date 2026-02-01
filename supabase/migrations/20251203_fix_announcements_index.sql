-- ============================================================================
-- FIX ANNOUNCEMENTS TABLE INDEX
-- ============================================================================
-- Purpose: Add missing index for pinned announcements
-- Issue: Index was trying to use is_pinned instead of pinned column
-- ============================================================================

-- Create index for pinned announcements (using correct column name)
CREATE INDEX IF NOT EXISTS idx_announcements_preschool_pinned
ON announcements (preschool_id, pinned DESC, published_at DESC);

-- Verify the fix
COMMENT ON INDEX idx_announcements_preschool_pinned IS 
  'Index for fetching pinned announcements by preschool, sorted by pin status and publish date';
