const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserCreation() {
  try {
    console.log('🧪 Testing user creation with matching IDs...\n');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = {
      email: testEmail,
      display_name: 'Test User',
      role: 'student',
      is_active: true
    };

    console.log('📝 Creating test user...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Name: ${testUser.display_name}`);
    console.log(`   Role: ${testUser.role}\n`);

    // Create user via API
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      return;
    }

    const apiData = await response.json();
    const createdUser = apiData.data;
    
    console.log('✅ User created via API:');
    console.log(`   Database ID: ${createdUser.id}`);
    console.log(`   Email: ${createdUser.email}`);
    console.log(`   Role: ${createdUser.role}\n`);

    // Check if user exists in Supabase Auth
    console.log('🔍 Checking Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(createdUser.id);

    if (authError) {
      console.error('❌ Auth Error:', authError.message);
      return;
    }

    console.log('✅ User found in Supabase Auth:');
    console.log(`   Auth ID: ${authUser.user.id}`);
    console.log(`   Email: ${authUser.user.email}`);
    console.log(`   Metadata:`, authUser.user.user_metadata);

    // Compare IDs
    console.log('\n🔍 ID Comparison:');
    console.log(`   Database ID: ${createdUser.id}`);
    console.log(`   Auth ID:     ${authUser.user.id}`);
    
    if (createdUser.id === authUser.user.id) {
      console.log('✅ SUCCESS: IDs match!');
    } else {
      console.log('❌ FAILURE: IDs do not match!');
    }

    // Clean up - delete the test user
    console.log('\n🧹 Cleaning up test user...');
    await supabase.auth.admin.deleteUser(createdUser.id);
    console.log('✅ Test user deleted from Auth');

    const { error: dbDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', createdUser.id);
    
    if (dbDeleteError) {
      console.error('❌ Error deleting from database:', dbDeleteError);
    } else {
      console.log('✅ Test user deleted from database');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testUserCreation(); 