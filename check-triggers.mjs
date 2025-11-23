import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bppuzibjlxgfwrujzfsz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0MzczMCwiZXhwIjoyMDY5MzE5NzMwfQ.5zPPaAo1Jj5-SknVMDwvo1DBCXhmS60obAEckJV7o1I'
)

// Check table columns
const { data: columns } = await supabase.rpc('exec_sql', {
  sql: `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'registration_requests' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `
})

console.log('Columns:', columns)
