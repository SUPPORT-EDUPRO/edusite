-- EduSitePro Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- ============================================
-- ENABLE UUID EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LEADS TABLE
-- Store all bulk quote form submissions
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Info
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  -- Request Details
  centre_count INT NOT NULL CHECK (centre_count > 0),
  provinces TEXT[] NOT NULL,
  preferred_languages TEXT[] NOT NULL,
  message TEXT,
  interested_in_edudash_pro BOOLEAN DEFAULT false,
  
  -- Business Data
  estimated_value DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  
  -- Attribution (UTM tracking)
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  referrer TEXT,
  
  -- Follow-up
  assigned_to UUID,
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  conversion_date TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for API routes)
CREATE POLICY "Service role has full access to leads"
  ON leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- LEAD NOTES TABLE
-- CRM-style notes for each lead
-- ============================================
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  note TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'call', 'email', 'meeting')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to lead_notes"
  ON lead_notes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TENANTS TABLE
-- Multi-tenant configuration for bulk clients
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  domain VARCHAR(255) UNIQUE NOT NULL,
  
  -- Branding
  name VARCHAR(255) NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#059669',
  secondary_color VARCHAR(7) DEFAULT '#F59E0B',
  
  -- Template & Features
  template_id VARCHAR(50) DEFAULT 'basic',
  features JSONB DEFAULT '{}',
  
  -- Contact Info
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  
  -- Subscription
  plan VARCHAR(50) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to tenants"
  ON tenants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Public can read active tenants (for website rendering)
CREATE POLICY "Anyone can read active tenants"
  ON tenants
  FOR SELECT
  USING (status = 'active');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (optional - for development)
-- ============================================

-- Default tenant
INSERT INTO tenants (slug, domain, name, template_id, status)
VALUES ('default', 'edusitepro.edudashpro.org.za', 'EduSitePro Marketing', 'marketing', 'active')
ON CONFLICT (domain) DO NOTHING;

-- ============================================
-- VIEWS (optional - for analytics)
-- ============================================

-- Lead conversion funnel
CREATE OR REPLACE VIEW lead_funnel AS
SELECT 
  status,
  COUNT(*) as count,
  SUM(estimated_value) as total_value,
  AVG(estimated_value) as avg_value
FROM leads
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'new' THEN 1
    WHEN 'contacted' THEN 2
    WHEN 'qualified' THEN 3
    WHEN 'converted' THEN 4
    WHEN 'lost' THEN 5
  END;

-- Monthly lead stats
CREATE OR REPLACE VIEW monthly_leads AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_leads,
  SUM(estimated_value) FILTER (WHERE status = 'converted') as revenue
FROM leads
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;


-- ============================================
-- CENTRE PLATFORM TABLES (Multi-centre hub)
-- ============================================

-- CENTRES (core entity for each ECD centre)
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_centres_slug ON centres(slug);
CREATE INDEX IF NOT EXISTS idx_centres_status ON centres(status);
CREATE INDEX IF NOT EXISTS idx_centres_primary_domain ON centres(primary_domain);

ALTER TABLE centres ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY IF NOT EXISTS "Service role has full access to centres"
  ON centres FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- CENTRE DOMAINS (custom domains per centre)
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

ALTER TABLE centre_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to centre_domains"
  ON centre_domains FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Optional: allow public read of verified domains (for SSR/edge lookups)
CREATE POLICY IF NOT EXISTS "Public can read verified centre domains"
  ON centre_domains FOR SELECT TO public
  USING (verification_status = 'verified');

-- PAGES (content pages per centre)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  slug VARCHAR(200) NOT NULL,
  title VARCHAR(255) NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(centre_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_pages_centre_id ON pages(centre_id);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to pages"
  ON pages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public can read published pages only
CREATE POLICY IF NOT EXISTS "Public can read published pages"
  ON pages FOR SELECT TO public
  USING (is_published = true);

-- SECTIONS (page sections with structured content)
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_sections_centre_id ON sections(centre_id);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to sections"
  ON sections FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public can read sections of published pages
CREATE POLICY IF NOT EXISTS "Public can read sections for published pages"
  ON sections FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM pages p
      WHERE p.id = sections.page_id AND p.is_published = true
    )
  );

-- NAVIGATION ITEMS (optional menu structure)
CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  parent_id UUID,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nav_items_centre_id ON navigation_items(centre_id);

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to navigation_items"
  ON navigation_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Public can read navigation_items"
  ON navigation_items FOR SELECT TO public
  USING (true);

-- MEDIA ASSETS (files in storage, metadata-only here)
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  type VARCHAR(50),
  alt_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_centre_id ON media_assets(centre_id);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to media_assets"
  ON media_assets FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- CROWDFUNDING CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_raised NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','cancelled')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_centre_id ON campaigns(centre_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to campaigns"
  ON campaigns FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public can read active campaigns
CREATE POLICY IF NOT EXISTS "Public can read active campaigns"
  ON campaigns FOR SELECT TO public
  USING (status = 'active');

-- DONATIONS (records of contributions)
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  donor_name VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ZAR',
  payment_ref VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_centre_id ON donations(centre_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to donations"
  ON donations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- COMPLIANCE DOCUMENTS
CREATE TABLE IF NOT EXISTS compliance_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  doc_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected')),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_docs_centre_id ON compliance_documents(centre_id);

ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to compliance_documents"
  ON compliance_documents FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- COMPLIANCE APPLICATIONS (guided applications)
CREATE TABLE IF NOT EXISTS compliance_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  application_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected')),
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_apps_centre_id ON compliance_applications(centre_id);

ALTER TABLE compliance_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role has full access to compliance_applications"
  ON compliance_applications FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Triggers for updated_at on new tables
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

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (optional - development only)
-- ============================================

-- Example centre (safe to remove in production)
INSERT INTO centres (slug, name, primary_domain, contact_email, status)
VALUES ('sample-centre', 'Sample ECD Centre', 'sample-centre.example.org.za', 'principal@example.org', 'active')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO centre_domains (centre_id, domain, is_primary, verification_status)
SELECT id, 'sample-centre.example.org.za', true, 'pending' FROM centres WHERE slug = 'sample-centre'
ON CONFLICT (domain) DO NOTHING;
