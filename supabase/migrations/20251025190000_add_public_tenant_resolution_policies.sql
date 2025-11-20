-- Migration: Add RLS policies for public tenant resolution
-- Description: Allow anon users to read active centres and verified domains
-- This enables middleware to resolve tenants without service role key

-- Enable RLS on centres table (if not already enabled)
ALTER TABLE centres ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active centres
-- This is safe because we only expose active centres to resolve domains
CREATE POLICY "Allow public read access to active centres"
ON centres
FOR SELECT
TO anon
USING (status = 'active');

-- Enable RLS on centre_domains table (if not already enabled)
ALTER TABLE centre_domains ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to verified domains
-- This allows middleware to resolve custom domains without authentication
CREATE POLICY "Allow public read access to verified domains"
ON centre_domains
FOR SELECT
TO anon
USING (verification_status = 'verified');

-- Note: Write operations (INSERT, UPDATE, DELETE) still require authentication
-- These policies only allow read access for tenant resolution
