-- Day 5: Pages and Page Blocks System
-- Create tables for storing page configurations and their block content

-- Drop the old pages table from Day 1 (it had a different schema)
DROP TABLE IF EXISTS public.pages CASCADE;

-- Create new pages table with correct schema
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(centre_id, slug)
);

-- Create page_blocks table to store individual blocks on a page
CREATE TABLE IF NOT EXISTS public.page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_key TEXT NOT NULL,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  block_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_centre_id ON public.pages(centre_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(centre_id, slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON public.pages(centre_id, is_published);
CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id ON public.page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON public.page_blocks(page_id, block_order);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages table
-- Allow centres to read their own pages
CREATE POLICY "Centres can read own pages"
  ON public.pages FOR SELECT
  USING (centre_id = current_setting('app.current_tenant_id', true)::uuid);

-- Allow centres to insert their own pages
CREATE POLICY "Centres can insert own pages"
  ON public.pages FOR INSERT
  WITH CHECK (centre_id = current_setting('app.current_tenant_id', true)::uuid);

-- Allow centres to update their own pages
CREATE POLICY "Centres can update own pages"
  ON public.pages FOR UPDATE
  USING (centre_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (centre_id = current_setting('app.current_tenant_id', true)::uuid);

-- Allow centres to delete their own pages
CREATE POLICY "Centres can delete own pages"
  ON public.pages FOR DELETE
  USING (centre_id = current_setting('app.current_tenant_id', true)::uuid);

-- RLS Policies for page_blocks table
-- Allow centres to read blocks from their own pages
CREATE POLICY "Centres can read own page blocks"
  ON public.page_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_blocks.page_id
      AND pages.centre_id = current_setting('app.current_tenant_id', true)::uuid
    )
  );

-- Allow centres to insert blocks into their own pages
CREATE POLICY "Centres can insert own page blocks"
  ON public.page_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_blocks.page_id
      AND pages.centre_id = current_setting('app.current_tenant_id', true)::uuid
    )
  );

-- Allow centres to update blocks on their own pages
CREATE POLICY "Centres can update own page blocks"
  ON public.page_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_blocks.page_id
      AND pages.centre_id = current_setting('app.current_tenant_id', true)::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_blocks.page_id
      AND pages.centre_id = current_setting('app.current_tenant_id', true)::uuid
    )
  );

-- Allow centres to delete blocks from their own pages
CREATE POLICY "Centres can delete own page blocks"
  ON public.page_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_blocks.page_id
      AND pages.centre_id = current_setting('app.current_tenant_id', true)::uuid
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_blocks_updated_at
  BEFORE UPDATE ON public.page_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
