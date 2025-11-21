const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bppuzibjlxgfwrujzfsz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDM3MzAsImV4cCI6MjA2OTMxOTczMH0.LcoKy-VzT6nKLPjcb6BXKHocj4E7DuUQPyH_bmfGbWA';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Checking classes for Young Eagles (ba79097c-1b93-4b48-bcbe-df73878ab4d1)...\n');
  
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('organization_id', 'ba79097c-1b93-4b48-bcbe-df73878ab4d1')
    .order('grade_level');
  
  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log(`Found ${data.length} classes:\n`);
    data.forEach(cls => {
      console.log(`- ${cls.name} (Grade: ${cls.grade_level}, Year: ${cls.academic_year}, Active: ${cls.active})`);
      console.log(`  Age Range: ${cls.age_range || 'N/A'}`);
      console.log(`  Type: ${cls.class_type || 'N/A'}`);
      console.log(`  Capacity: ${cls.current_students || 0}/${cls.max_students || 'N/A'}`);
      console.log('');
    });
  } else {
    console.log('No classes found.');
  }
})();
