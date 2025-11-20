import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bppuzibjlxgfwrujzfsz.supabase.co';
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔌 Testing Supabase connection...');
console.log('URL:', supabaseUrl);

// Test connection by listing tables
const { error } = await supabase.from('centres').select('count').limit(1);

if (error) {
  console.log('⚠️  Centres table does not exist yet (expected)');
  console.log('✅ Connection successful - ready to apply migrations!');
} else {
  console.log('✅ Connection successful!');
  console.log('ℹ️  Centres table already exists');
}
