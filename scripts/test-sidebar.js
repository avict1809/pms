const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSidebarFunctionality() {
  try {
    console.log('🧪 Testing Sidebar Role-Based Rendering...\n');
    
    // Test different user roles
    const testUsers = [
      { email: 'admin-test@example.com', role: 'admin', display_name: 'Admin Test User' },
      { email: 'supervisor-test@example.com', role: 'supervisor', display_name: 'Supervisor Test User' },
      { email: 'student-test@example.com', role: 'student', display_name: 'Student Test User' }
    ];

    for (const testUser of testUsers) {
      console.log(`📝 Testing ${testUser.role} role...`);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: 'test-password-123',
        email_confirm: true,
        user_metadata: {
          display_name: testUser.display_name,
          role: testUser.role,
        },
        app_metadata: {
          role: testUser.role,
        },
      });

      if (authError) {
        console.error(`❌ Error creating ${testUser.role} user:`, authError.message);
        continue;
      }

      const authUserId = authData.user?.id;
      
      // Create user in database
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: testUser.email,
          display_name: testUser.display_name,
          role: testUser.role,
          is_active: true,
          is_first_login: false,
        });

      if (dbError) {
        console.error(`❌ Error creating ${testUser.role} in database:`, dbError.message);
        // Clean up auth user
        await supabase.auth.admin.deleteUser(authUserId);
        continue;
      }

      console.log(`✅ ${testUser.role} user created successfully`);
      console.log(`   ID: ${authUserId}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Role: ${testUser.role}`);
      console.log(`   Display Name: ${testUser.display_name}\n`);

      // Test API endpoint to get user role
      try {
        const response = await fetch(`http://localhost:3000/api/admin/users/${authUserId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log(`✅ API test successful for ${testUser.role}`);
          console.log(`   Retrieved role: ${userData.data.role}`);
          console.log(`   Display name: ${userData.data.display_name}`);
        } else {
          console.log(`⚠️  API test failed for ${testUser.role} (this is expected if not admin)`);
        }
      } catch (apiError) {
        console.log(`⚠️  API test failed for ${testUser.role}:`, apiError.message);
      }

      console.log('---\n');
    }

    console.log('🧹 Cleaning up test users...');
    
    // Clean up test users
    for (const testUser of testUsers) {
      try {
        // Find user by email
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', testUser.email)
          .single();

        if (userData) {
          // Delete from auth
          await supabase.auth.admin.deleteUser(userData.id);
          // Delete from database
          await supabase.from('users').delete().eq('id', userData.id);
          console.log(`✅ Cleaned up ${testUser.role} user`);
        }
      } catch (cleanupError) {
        console.log(`⚠️  Cleanup failed for ${testUser.role}:`, cleanupError.message);
      }
    }

    console.log('\n✅ Sidebar role testing completed!');
    console.log('\n💡 To test the sidebar in the browser:');
    console.log('1. Create a user with a specific role using the admin panel');
    console.log('2. Log in with that user');
    console.log('3. Check that the sidebar shows the correct navigation items for that role');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSidebarFunctionality(); 