import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bppuzibjlxgfwrujzfsz.supabase.co';
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🧪 Testing Tenant Resolution\n');

// Get sample centre
const { data: centre, error } = await supabase
  .from('centres')
  .select('*')
  .eq('slug', 'sample-centre')
  .single();

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log('✅ Centre found!');
console.log('ID:', centre.id);
console.log('Slug:', centre.slug);
console.log('Name:', centre.name);
console.log('Status:', centre.status);
console.log('Plan:', centre.plan_tier);
console.log('Subdomain:', centre.default_subdomain);
console.log('\n✅ Tenant resolution is working!');
