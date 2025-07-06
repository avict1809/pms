const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findAdminUsers() {
  console.log('🔍 Searching for admin users in the database...\n');
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, display_name, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    if (users.length === 0) {
      console.log('❌ No admin users found in the database');
      console.log('\n💡 You need to create an admin user first:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to Authentication > Users');
      console.log('3. Create a new user or update an existing user');
      console.log('4. Then update the users table to set role = "admin"');
      return;
    }

    console.log(`✅ Found ${users.length} admin user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Display Name: ${user.display_name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });

    console.log('💡 Update the TEST_EMAIL in scripts/test-api-endpoints.js with one of these emails');
    console.log('💡 You may need to reset the password in Supabase Authentication > Users');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findAdminUsers(); 