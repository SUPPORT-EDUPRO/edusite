import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bppuzibjlxgfwrujzfsz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0MzczMCwiZXhwIjoyMDY5MzE5NzMwfQ.5zPPaAo1Jj5-SknVMDwvo1DBCXhmS60obAEckJV7o1I'
)

const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
console.log('Auth Users:', JSON.stringify(authUsers?.users?.map(u => ({
  id: u.id,
  email: u.email,
  role: u.role,
  created_at: u.created_at
})), null, 2))

const { data: profiles, error: profileError } = await supabase
  .from('user_profiles')
  .select('*')
  .order('created_at', { ascending: true })

console.log('\nUser Profiles:', JSON.stringify(profiles?.map(p => ({
  user_id: p.user_id,
  email: p.email,
  role: p.role,
  organization_id: p.organization_id,
  is_platform_admin: p.is_platform_admin
})), null, 2))
