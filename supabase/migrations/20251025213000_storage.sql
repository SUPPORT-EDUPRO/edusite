-- Storage setup for media uploads
-- Creates bucket and RLS policies for tenant-isolated media

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS is already enabled on storage.objects by default in Supabase
-- Skip the ALTER TABLE command as it requires superuser privileges

-- Policy: Anyone can view public media
CREATE POLICY "Public media are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy: Authenticated users can upload to their tenant's folder
CREATE POLICY "Users can upload media to their tenant folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = (current_setting('request.jwt.claims', true)::json->>'tenant_id')
);

-- Policy: Users can update their tenant's media
CREATE POLICY "Users can update their tenant media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = (current_setting('request.jwt.claims', true)::json->>'tenant_id')
);

-- Policy: Users can delete their tenant's media
CREATE POLICY "Users can delete their tenant media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = (current_setting('request.jwt.claims', true)::json->>'tenant_id')
);

-- Create media_library table to track uploaded files with metadata
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.centres(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_media_library_tenant_id ON public.media_library(tenant_id);
CREATE INDEX idx_media_library_mime_type ON public.media_library(mime_type);
CREATE INDEX idx_media_library_created_at ON public.media_library(created_at DESC);

-- Enable RLS
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_library
-- Users can view their tenant's media
CREATE POLICY "Users can view their tenant media library"
  ON public.media_library
  FOR SELECT
  USING (
    tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );

-- Users can insert media for their tenant
CREATE POLICY "Users can add to their tenant media library"
  ON public.media_library
  FOR INSERT
  WITH CHECK (
    tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );

-- Users can update their tenant's media metadata
CREATE POLICY "Users can update their tenant media library"
  ON public.media_library
  FOR UPDATE
  USING (
    tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );

-- Users can delete their tenant's media
CREATE POLICY "Users can delete their tenant media library"
  ON public.media_library
  FOR DELETE
  USING (
    tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );

-- Updated timestamp trigger
CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON public.media_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.media_library IS 'Tracks uploaded media files with metadata and tenant association';
COMMENT ON COLUMN public.media_library.storage_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN public.media_library.public_url IS 'Public URL for accessing the file';
COMMENT ON COLUMN public.media_library.alt_text IS 'Alternative text for accessibility';
