-- Create centre entry for Young Eagles (linking organization to centres table)
INSERT INTO centres (
  id,
  organization_id,
  slug,
  name,
  primary_domain,
  contact_email,
  contact_phone,
  status,
  plan_tier,
  default_subdomain,
  onboarding_status,
  created_at,
  updated_at
) VALUES (
  '6b92f8a5-48e7-4865-b85f-4b92c174e0ef',
  '6b92f8a5-48e7-4865-b85f-4b92c174e0ef',
  'young-eagles',
  'Young Eagles Preschool',
  'young-eagles.edusitepro.org.za',
  'info@youngeagles.co.za',
  '+27123456789',
  'active',
  'pro',
  'young-eagles',
  'completed',
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
  status = 'active',
  onboarding_status = 'completed',
  updated_at = NOW();
