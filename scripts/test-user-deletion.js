const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testUserDeletion() {
  console.log('🧪 Testing User Deletion Functionality...\n');

  try {
    // 1. Create a test user in auth
    console.log('1. Creating test user in Supabase Auth...');
    const testEmail = `test-delete-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: authUser, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (authCreateError) {
      console.error('❌ Error creating auth user:', authCreateError);
      return;
    }

    console.log('✅ Test user created in auth:', authUser.user.id);

    // 2. Create corresponding record in users table
    console.log('\n2. Creating user record in database...');
    const { data: dbUser, error: dbCreateError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: testEmail,
        display_name: 'Test Delete User',
        role: 'student',
        is_active: true,
        is_first_login: false
      })
      .select()
      .single();

    if (dbCreateError) {
      console.error('❌ Error creating database user:', dbCreateError);
      return;
    }

    console.log('✅ User record created in database:', dbUser.id);

    // 3. Test the deletion API
    console.log('\n3. Testing deletion API...');
    const response = await fetch(`http://localhost:3000/api/admin/users/${authUser.user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ API deletion failed:', result);
      return;
    }

    console.log('✅ API deletion successful:', result);

    // 4. Verify user is deleted from auth
    console.log('\n4. Verifying user deleted from auth...');
    const { data: authCheck, error: authCheckError } = await supabaseAdmin.auth.admin.getUserById(authUser.user.id);
    
    if (authCheckError && authCheckError.message.includes('User not found')) {
      console.log('✅ User successfully deleted from auth');
    } else if (authCheckError) {
      console.log('⚠️  Auth check error (might be expected):', authCheckError.message);
    } else {
      console.log('❌ User still exists in auth:', authCheck.user.id);
    }

    // 5. Verify user is deleted from database
    console.log('\n5. Verifying user deleted from database...');
    const { data: dbCheck, error: dbCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.user.id)
      .single();

    if (dbCheckError && dbCheckError.code === 'PGRST116') {
      console.log('✅ User successfully deleted from database');
    } else if (dbCheckError) {
      console.log('⚠️  Database check error:', dbCheckError);
    } else {
      console.log('❌ User still exists in database:', dbCheck.id);
    }

    console.log('\n🎉 User deletion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserDeletion(); 