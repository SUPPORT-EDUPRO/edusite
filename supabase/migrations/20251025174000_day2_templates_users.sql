-- Day 2 Migration: Templates, Variants, Blocks, and User Management
-- Extends Day 1 with template system and authentication

-- ============================================
-- TEMPLATES LIBRARY
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ncf_alignment_tags TEXT[],
  default_pages JSONB DEFAULT '[]'::jsonb,
  default_blocks JSONB DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_key ON templates(key);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);

-- ============================================
-- TEMPLATE VARIANTS (Themes)
-- ============================================
CREATE TABLE IF NOT EXISTS template_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tokens JSONB NOT NULL DEFAULT '{}'::jsonb, -- Design tokens (colors, fonts, spacing)
  component_overrides JSONB DEFAULT '{}'::jsonb,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, key)
);

CREATE INDEX IF NOT EXISTS idx_template_variants_template_id ON template_variants(template_id);

-- ============================================
-- TEMPLATE BLOCKS (Block Definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS template_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('header', 'content', 'contact', 'feature', 'media', 'footer')),
  description TEXT,
  props_schema JSONB NOT NULL DEFAULT '{}'::jsonb, -- Zod schema as JSON
  render_hint VARCHAR(100),
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_blocks_key ON template_blocks(key);
CREATE INDEX IF NOT EXISTS idx_template_blocks_category ON template_blocks(category);

-- ============================================
-- CMS USERS (Links to Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS cms_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_users_email ON cms_users(email);

-- ============================================
-- MEMBERSHIPS (User-Centre Roles)
-- ============================================
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES cms_users(id) ON DELETE CASCADE,
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN (
    'super_admin', 'ops_admin', 'marketing_manager',
    'centre_admin', 'editor', 'viewer'
  )),
  invited_by UUID REFERENCES cms_users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, centre_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_centre_id ON memberships(centre_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);

-- ============================================
-- NAVIGATION ITEMS (Menu Structure)
-- ============================================
CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  parent_id UUID REFERENCES navigation_items(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nav_items_centre_id ON navigation_items(centre_id);
CREATE INDEX IF NOT EXISTS idx_nav_items_parent_id ON navigation_items(parent_id);

-- ============================================
-- MEDIA ASSETS (File Metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  alt_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  uploaded_by UUID REFERENCES cms_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_centre_id ON media_assets(centre_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON media_assets(uploaded_by);

-- ============================================
-- AUTO-UPDATE TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_users_updated_at ON cms_users;
CREATE TRIGGER update_cms_users_updated_at
  BEFORE UPDATE ON cms_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nav_items_updated_at ON navigation_items;
CREATE TRIGGER update_nav_items_updated_at
  BEFORE UPDATE ON navigation_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access templates"
  ON templates FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access template_variants"
  ON template_variants FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access template_blocks"
  ON template_blocks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access cms_users"
  ON cms_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access memberships"
  ON memberships FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access navigation_items"
  ON navigation_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access media_assets"
  ON media_assets FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public can read active templates and blocks
CREATE POLICY "Public can read active templates"
  ON templates FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Public can read template variants"
  ON template_variants FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can read active template blocks"
  ON template_blocks FOR SELECT TO public
  USING (is_active = true);

-- Public can read navigation items for active centres
CREATE POLICY "Public can read navigation items"
  ON navigation_items FOR SELECT TO public
  USING (
    is_visible = true AND
    EXISTS (
      SELECT 1 FROM centres c
      WHERE c.id = navigation_items.centre_id AND c.status = 'active'
    )
  );

-- ============================================
-- SEED DATA
-- ============================================

-- Insert base templates
INSERT INTO templates (key, name, description, ncf_alignment_tags, is_active)
VALUES 
  ('ecd-basic', 'ECD Basic', 'Clean and simple template for ECD centres', ARRAY['Well-Being', 'Identity & Belonging', 'Communication'], true),
  ('ecd-modern', 'ECD Modern', 'Modern template with bold visuals', ARRAY['Creativity', 'Mathematics', 'Knowledge of the World'], true),
  ('ecd-community', 'ECD Community', 'Community-focused template with warm tones', ARRAY['Well-Being', 'Identity & Belonging'], true)
ON CONFLICT (key) DO NOTHING;

-- Insert template variants (themes)
INSERT INTO template_variants (template_id, key, name, description, tokens)
SELECT 
  t.id,
  'clean',
  'Clean',
  'Minimal design with high whitespace',
  '{"colors": {"primary": "#44403c", "secondary": "#d97706", "accent": "#fef3c7"}, "fonts": {"heading": "Inter", "body": "Inter"}, "spacing": {"unit": 8}, "radius": {"sm": 4, "md": 8, "lg": 16}}'::jsonb
FROM templates t WHERE t.key = 'ecd-basic'
ON CONFLICT (template_id, key) DO NOTHING;

INSERT INTO template_variants (template_id, key, name, description, tokens)
SELECT 
  t.id,
  'playful',
  'Playful',
  'Rounded corners and vibrant colors',
  '{"colors": {"primary": "#ec4899", "secondary": "#8b5cf6", "accent": "#fbbf24"}, "fonts": {"heading": "Inter", "body": "Inter"}, "spacing": {"unit": 12}, "radius": {"sm": 8, "md": 16, "lg": 24}}'::jsonb
FROM templates t WHERE t.key = 'ecd-modern'
ON CONFLICT (template_id, key) DO NOTHING;

-- Insert template blocks
INSERT INTO template_blocks (key, display_name, category, description, props_schema, is_active)
VALUES
  ('hero', 'Hero', 'header', 'Full-width hero section', '{"title": "string", "subtitle": "string", "backgroundImage": "string", "ctaText": "string", "ctaLink": "string"}'::jsonb, true),
  ('richText', 'Rich Text', 'content', 'WYSIWYG text content', '{"content": "string", "maxWidth": "string"}'::jsonb, true),
  ('contactCTA', 'Contact CTA', 'contact', 'Contact form with info', '{"title": "string", "phone": "string", "email": "string"}'::jsonb, true)
ON CONFLICT (key) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Day 2 tables created successfully!';
  RAISE NOTICE 'Added: templates, template_variants, template_blocks';
  RAISE NOTICE 'Added: cms_users, memberships, navigation_items, media_assets';
  RAISE NOTICE 'Sample data: 3 templates, 2 variants, 3 blocks';
END $$;
