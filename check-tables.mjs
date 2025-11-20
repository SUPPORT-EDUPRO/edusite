import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bppuzibjlxgfwrujzfsz.supabase.co';
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('📊 Checking existing tables...\n');

const tables = [
  'centres',
  'centre_domains',
  'pages',
  'sections',
  'templates',
  'template_variants',
  'template_blocks',
  'cms_users',
  'memberships',
  'navigation_items',
  'media_assets',
];

for (const table of tables) {
  const { error } = await supabase
    .from(table)
    .select('count')
    .limit(1);
  
  if (error) {
    console.log(`❌ ${table}: does not exist`);
  } else {
    console.log(`✅ ${table}: exists`);
  }
}
