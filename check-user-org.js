const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserOrganization() {
  const email = 'zanelelwndl@gmail.com';
  
  console.log(`🔍 Checking organization for: ${email}\n`);
  
  // 1. Check profiles table
  console.log('1️⃣ Checking profiles table...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      role,
      organization_id,
      organizations (
        id,
        name,
        slug,
        organization_type
      ),
      created_at
    `)
    .eq('email', email)
    .single();

  if (profileError) {
    console.log('   ℹ️  User not found in profiles table');
  } else {
    console.log('   ✅ User found in profiles:');
    console.log(`      Email: ${profile.email}`);
    console.log(`      Name: ${profile.full_name || 'N/A'}`);
    console.log(`      Role: ${profile.role || 'N/A'}`);
    console.log(`      Organization ID: ${profile.organization_id || 'None'}`);
    if (profile.organizations) {
      console.log(`      Organization: ${profile.organizations.name} (${profile.organizations.slug})`);
      console.log(`      Type: ${profile.organizations.organization_type}`);
    }
    console.log(`      Created: ${new Date(profile.created_at).toLocaleString()}\n`);
  }
  
  // 2. Check registration_requests table
  console.log('2️⃣ Checking registration_requests table...');
  const { data: registrations, error: regError } = await supabase
    .from('registration_requests')
    .select(`
      id,
      guardian_email,
      guardian_name,
      student_first_name,
      student_last_name,
      status,
      organization_id,
      organizations (
        name,
        slug
      ),
      registration_fee_paid,
      campaign_applied,
      discount_amount,
      registration_fee_amount,
      created_at
    `)
    .eq('guardian_email', email)
    .order('created_at', { ascending: false });

  if (regError) {
    console.log('   ❌ Error:', regError.message);
  } else if (!registrations || registrations.length === 0) {
    console.log('   ℹ️  No registration requests found');
  } else {
    console.log(`   ✅ Found ${registrations.length} registration(s):`);
    registrations.forEach((reg, index) => {
      console.log(`\n   Registration ${index + 1}:`);
      console.log(`      Student: ${reg.student_first_name} ${reg.student_last_name}`);
      console.log(`      Guardian: ${reg.guardian_name} (${reg.guardian_email})`);
      console.log(`      Status: ${reg.status}`);
      console.log(`      Organization: ${reg.organizations?.name || 'N/A'} (${reg.organizations?.slug || 'N/A'})`);
      console.log(`      Fee Paid: ${reg.registration_fee_paid ? 'Yes' : 'No'}`);
      console.log(`      Fee Amount: R${reg.registration_fee_amount || 0}`);
      if (reg.campaign_applied) {
        console.log(`      Campaign: ${reg.campaign_applied} (R${reg.discount_amount} discount)`);
      }
      console.log(`      Created: ${new Date(reg.created_at).toLocaleString()}`);
    });
  }
  
  // 3. Check Young Eagles organization
  console.log('\n3️⃣ Checking Young Eagles organization...');
  const { data: youngEagles, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, organization_type, registration_open, created_at')
    .or('slug.eq.young-eagles,name.ilike.%young eagles%');

  if (orgError) {
    console.log('   ❌ Error:', orgError.message);
  } else if (!youngEagles || youngEagles.length === 0) {
    console.log('   ⚠️  Young Eagles organization not found!');
  } else {
    console.log('   ✅ Found Young Eagles organization(s):');
    youngEagles.forEach(org => {
      console.log(`      Name: ${org.name}`);
      console.log(`      Slug: ${org.slug}`);
      console.log(`      ID: ${org.id}`);
      console.log(`      Type: ${org.organization_type}`);
      console.log(`      Registration Open: ${org.registration_open ? 'Yes' : 'No'}`);
      console.log(`      Created: ${new Date(org.created_at).toLocaleString()}\n`);
    });
  }
}

checkUserOrganization().catch(console.error);
