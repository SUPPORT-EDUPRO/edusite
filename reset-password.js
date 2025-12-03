const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bppuzibjlxgfwrujzfsz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk1MDEyMywiZXhwIjoyMDQ4NTI2MTIzfQ.m3jCZdivizija6p-5Pqq7NNaNgPLp4IqC5vYCTlxfQjWX2Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      '080f1408-c08a-4bbf-affe-45403a28c775',
      { password: '#Olivia@17' }
    );

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Password reset successfully for davecon12martin@outlook.com');
    console.log('📧 Email: davecon12martin@outlook.com');
    console.log('🔑 New password: #Olivia@17');
    console.log('\nUser can now login at: https://edusitepro.edudashpro.org.za/admin');
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

resetPassword();
