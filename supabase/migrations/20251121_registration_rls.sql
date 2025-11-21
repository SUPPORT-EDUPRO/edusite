-- Enable RLS on registration_requests table
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public registration submissions" ON registration_requests;
DROP POLICY IF EXISTS "Organization admins can view their registrations" ON registration_requests;
DROP POLICY IF EXISTS "Organization admins can update registrations" ON registration_requests;
DROP POLICY IF EXISTS "Super admins can view all registrations" ON registration_requests;

-- Allow public inserts (for registration form submissions)
-- Anyone can insert a registration request
CREATE POLICY "Allow public registration submissions"
ON registration_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow organization admins/principals to view their registrations
-- Requires authentication and matching organization_id
CREATE POLICY "Organization admins can view their registrations"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'principal')
  )
);

-- Allow organization admins to update registration status
CREATE POLICY "Organization admins can update registrations"
ON registration_requests
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'principal')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin', 'principal')
  )
);

-- Super admins can view all registrations
CREATE POLICY "Super admins can view all registrations"
ON registration_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

COMMENT ON POLICY "Allow public registration submissions" ON registration_requests IS 
'Allows anyone to submit a registration request without authentication. The API route handles validation.';
