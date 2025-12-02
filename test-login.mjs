import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('\n🔐 Testing login...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'king@youngeagles.org.za',
    password: '#Olivia@17',
  });

  if (error) {
    console.error('❌ Login error:', error);
    return;
  }

  console.log('✅ Login successful!');
  console.log('User ID:', data.user.id);
  console.log('Email:', data.user.email);
  console.log('Session:', data.session ? 'Created' : 'None');

  // Check profile
  console.log('\n📋 Checking profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile error:', profileError);
  } else {
    console.log('✅ Profile found:');
    console.log(JSON.stringify(profile, null, 2));
  }
}

testLogin();
