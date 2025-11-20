-- Day 1 Essential Tables for Multi-Tenant Architecture
-- Can be run directly in Supabase SQL Editor

-- ============================================
-- ENABLE UUID EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CENTRES TABLE (Core multi-tenant entity)
-- ============================================
CREATE TABLE IF NOT EXISTS centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  name VARCHAR(255) NOT NULL,
  primary_domain VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','suspended','archived')),
  vercel_project_name VARCHAR(255),
  vercel_deploy_hook_url TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  plan_tier VARCHAR(20),
  default_subdomain VARCHAR(100),
  brand_theme JSONB DEFAULT '{}'::jsonb,
  onboarding_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_centres_slug ON centres(slug);
CREATE INDEX IF NOT EXISTS idx_centres_status ON centres(status);
CREATE INDEX IF NOT EXISTS idx_centres_primary_domain ON centres(primary_domain);

-- ============================================
-- CENTRE DOMAINS (Custom domains per centre)
-- ============================================
CREATE TABLE IF NOT EXISTS centre_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  domain VARCHAR(255) UNIQUE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_centre_domains_centre_id ON centre_domains(centre_id);
CREATE INDEX IF NOT EXISTS idx_centre_domains_status ON centre_domains(verification_status);

-- ============================================
-- PAGES (Content pages per centre)
-- ============================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  slug VARCHAR(200) NOT NULL,
  title VARCHAR(255) NOT NULL,
  path VARCHAR(500),
  page_type VARCHAR(50),
  meta_description TEXT,
  seo JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  version INT DEFAULT 1,
  last_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(centre_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_pages_centre_id ON pages(centre_id);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);

-- ============================================
-- SECTIONS (Page sections with structured content)
-- ============================================
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  block_key VARCHAR(100),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  props JSONB DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  order_index INT DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'visible',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_sections_centre_id ON sections(centre_id);

-- ============================================
-- AUTO-UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_centres_updated_at ON centres;
CREATE TRIGGER update_centres_updated_at
  BEFORE UPDATE ON centres
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE centre_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Service role full access (bypasses RLS)
CREATE POLICY "Service role has full access to centres"
  ON centres FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to centre_domains"
  ON centre_domains FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to pages"
  ON pages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to sections"
  ON sections FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public can read verified domains (for SSR/edge lookups)
CREATE POLICY "Public can read verified centre domains"
  ON centre_domains FOR SELECT TO public
  USING (verification_status = 'verified');

-- Public can read published pages only
CREATE POLICY "Public can read published pages"
  ON pages FOR SELECT TO public
  USING (published = true);

-- Public can read sections of published pages
CREATE POLICY "Public can read sections for published pages"
  ON sections FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      WHERE p.id = sections.page_id AND p.published = true
    )
  );

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================
INSERT INTO centres (slug, name, primary_domain, contact_email, status, plan_tier, default_subdomain)
VALUES ('sample-centre', 'Sample ECD Centre', NULL, 'principal@example.org', 'active', 'solo', 'sample-centre.sites.edusitepro.co.za')
ON CONFLICT (slug) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Day 1 essential tables created successfully!';
  RAISE NOTICE 'Created: centres, centre_domains, pages, sections';
  RAISE NOTICE 'Sample centre: sample-centre';
END $$;
