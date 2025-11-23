import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bppuzibjlxgfwrujzfsz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0MzczMCwiZXhwIjoyMDY5MzE5NzMwfQ.5zPPaAo1Jj5-SknVMDwvo1DBCXhmS60obAEckJV7o1I'
)

const { data, error } = await supabase
  .from('registration_requests')
  .select('*')
  .limit(1)

if (data && data[0]) {
  console.log('Available columns:', Object.keys(data[0]))
}
console.log('Error:', error)
