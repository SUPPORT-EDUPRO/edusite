-- Reset password for davecon12martin@outlook.com
-- New password: #Olivia@17

UPDATE auth.users
SET 
  encrypted_password = crypt('#Olivia@17', gen_salt('bf')),
  updated_at = now()
WHERE email = 'davecon12martin@outlook.com';

-- Verify the update
SELECT 
  email, 
  email_confirmed_at IS NOT NULL as email_confirmed,
  encrypted_password IS NOT NULL as has_password,
  updated_at
FROM auth.users 
WHERE email = 'davecon12martin@outlook.com';
