-- Theme customization system
-- Stores custom theme configurations per tenant

-- Create themes table
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Color scheme
  colors JSONB NOT NULL DEFAULT '{
    "primary": "#d97706",
    "secondary": "#78716c",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "text": "#1c1917",
    "textMuted": "#78716c"
  }'::jsonb,
  
  -- Typography
  typography JSONB NOT NULL DEFAULT '{
    "fontFamily": "Inter",
    "headingFontFamily": "Inter",
    "fontSize": "16px",
    "lineHeight": "1.5"
  }'::jsonb,
  
  -- Spacing & Layout
  layout JSONB NOT NULL DEFAULT '{
    "containerWidth": "1280px",
    "borderRadius": "0.5rem",
    "spacing": "1rem"
  }'::jsonb,
  
  -- Custom CSS
  custom_css TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for tenant lookups
CREATE INDEX idx_themes_tenant_id ON public.themes(tenant_id);
CREATE INDEX idx_themes_active ON public.themes(tenant_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for themes
-- Public can read active themes for their tenant
CREATE POLICY "Public users can view active themes"
  ON public.themes
  FOR SELECT
  USING (
    is_active = true
    AND tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );

-- Authenticated users can manage their tenant's themes
CREATE POLICY "Users can manage their tenant themes"
  ON public.themes
  FOR ALL
  USING (
    tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );

-- Updated timestamp trigger
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default theme for existing centres
INSERT INTO public.themes (tenant_id, name, is_active)
SELECT 
  id,
  'Default Theme',
  true
FROM public.centres
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE themes.tenant_id = centres.id
);

COMMENT ON TABLE public.themes IS 'Custom theme configurations per tenant';
COMMENT ON COLUMN public.themes.colors IS 'Color scheme with primary, secondary, accent, background, text colors';
COMMENT ON COLUMN public.themes.typography IS 'Font family, sizes, and line heights';
COMMENT ON COLUMN public.themes.layout IS 'Container width, border radius, spacing';
COMMENT ON COLUMN public.themes.custom_css IS 'Additional custom CSS rules';
