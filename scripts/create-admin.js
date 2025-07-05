const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// Debug: Check if environment variables are loaded
console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin1@pms.com',
      password: 'admin123456',
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('✅ Auth user created successfully!');
    console.log('📧 Email: admin1@pms.com');
    console.log('🔑 Password: admin123456');
    console.log('🆔 User ID:', authData.user?.id);
    console.log('');
    console.log('⚠️  IMPORTANT: Now you need to manually insert the user record in the database.');
    console.log('📝 Go to Supabase Dashboard > SQL Editor and run the script in supabase/insert-admin.sql');
    console.log('🔄 Replace the user ID in the script with:', authData.user?.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 