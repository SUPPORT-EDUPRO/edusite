#!/usr/bin/env node

/**
 * Create Admin User for EduSitePro
 * 
 * Usage:
 *   node create-admin.mjs <email> <password> <organization-id> [full-name]
 * 
 * Example:
 *   node create-admin.mjs admin@youngeagles.co.za SecurePass123! ba79097c-1b93-4b48-bcbe-df73878ab4d1 "Admin User"
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser(email, password, organizationId, fullName) {
  console.log('🔧 Creating admin user...\n');
  console.log(`Email: ${email}`);
  console.log(`Organization ID: ${organizationId}`);
  console.log(`Full Name: ${fullName || 'Not provided'}\n`);

  try {
    // Step 1: Create auth user
    console.log('1️⃣  Creating Supabase Auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || 'Admin User',
        role: 'principal_admin',
      }
    });

    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`);
    }

    console.log(`✅ Auth user created: ${authData.user.id}\n`);

    // Step 2: Create profile
    console.log('2️⃣  Creating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName || 'Admin User',
        role: 'principal_admin',
        preschool_id: organizationId,
        organization_id: organizationId,
      });

    if (profileError) {
      console.warn(`⚠️  Profile creation warning: ${profileError.message}`);
      console.warn('(Profile might already exist or table structure different)');
    } else {
      console.log('✅ Profile created\n');
    }

    // Step 3: Try to create user_organizations link (if table exists)
    console.log('3️⃣  Linking to organization...');
    const { error: linkError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: authData.user.id,
        organization_id: organizationId,
        role: 'owner'
      });

    if (linkError) {
      console.warn(`⚠️  Organization link warning: ${linkError.message}`);
      console.warn('(Table might not exist yet - run migration SQL first)');
    } else {
      console.log('✅ Linked to organization\n');
    }

    console.log('🎉 SUCCESS! Admin user created\n');
    console.log('═══════════════════════════════════════');
    console.log('LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Login at: ${process.env.NEXT_PUBLIC_SITE_URL}/login`);
    console.log('═══════════════════════════════════════\n');

    return authData.user;

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: node create-admin.mjs <email> <password> <organization-id> [full-name]');
  console.error('\nExample:');
  console.error('  node create-admin.mjs admin@youngeagles.co.za Pass123! ba79097c-1b93-4b48-bcbe-df73878ab4d1 "Admin User"');
  process.exit(1);
}

const [email, password, organizationId, fullName] = args;

createAdminUser(email, password, organizationId, fullName || 'Admin User')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
