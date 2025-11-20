-- Navigation menu system
-- Stores customizable navigation menus per tenant

-- Create navigation_menus table
CREATE TABLE IF NOT EXISTS public.navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Menu',
  is_active BOOLEAN DEFAULT true,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for tenant lookups
CREATE INDEX idx_navigation_menus_tenant_id ON public.navigation_menus(tenant_id);
CREATE INDEX idx_navigation_menus_active ON public.navigation_menus(tenant_id, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read active menus for their tenant
CREATE POLICY "Public users can view active navigation menus"
  ON public.navigation_menus
  FOR SELECT
  USING (
    is_active = true
    AND tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );

-- Authenticated users can manage their tenant's menus
CREATE POLICY "Users can manage their tenant navigation menus"
  ON public.navigation_menus
  FOR ALL
  USING (
    tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );

-- Updated timestamp trigger
CREATE TRIGGER update_navigation_menus_updated_at
  BEFORE UPDATE ON public.navigation_menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default navigation for existing centres
INSERT INTO public.navigation_menus (tenant_id, name, is_active, items)
SELECT 
  id,
  'Main Menu',
  true,
  '[
    {"id": "home", "label": "Home", "url": "/", "type": "internal", "order": 0},
    {"id": "about", "label": "About", "url": "/about", "type": "internal", "order": 1},
    {"id": "contact", "label": "Contact", "url": "/contact", "type": "internal", "order": 2}
  ]'::jsonb
FROM public.centres
WHERE NOT EXISTS (
  SELECT 1 FROM public.navigation_menus WHERE navigation_menus.tenant_id = centres.id
);

COMMENT ON TABLE public.navigation_menus IS 'Customizable navigation menus per tenant';
COMMENT ON COLUMN public.navigation_menus.items IS 'Array of menu items with id, label, url, type (internal/external/page), order, and optional children for dropdowns';
