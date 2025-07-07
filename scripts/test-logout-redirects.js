const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLogoutRedirects() {
  console.log('🧪 Testing Logout and First-Time Password Setup Redirects\n');

  try {
    // Test 1: Check if login route exists at /login
    console.log('1️⃣ Testing login route path...');
    const loginResponse = await fetch('http://localhost:3001/login');
    if (loginResponse.ok) {
      console.log('✅ Login route at /login is accessible');
    } else {
      console.log('❌ Login route at /login is not accessible');
    }

    // Test 2: Create a test user for first-time password setup
    console.log('\n2️⃣ Creating test user for first-time password setup...');
    const testEmail = `test-redirect-${Date.now()}@example.com`;
    const testDisplayName = 'Test Redirect User';
    
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'temporary-password-123',
      email_confirm: true,
      user_metadata: { display_name: testDisplayName }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Test user created in auth:', authData.user.id);

    // Create user in database
    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        display_name: testDisplayName,
        role: 'student',
        is_active: true,
        is_first_login: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Error creating database user:', dbError);
      return;
    }

    console.log('✅ Test user created in database:', dbData.id);

    // Test 3: Test first-time password setup redirect
    console.log('\n3️⃣ Testing first-time password setup redirect...');
    const setupResponse = await fetch('http://localhost:3001/api/auth/first-time-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'new-password-123',
        display_name: testDisplayName,
      }),
    });

    const setupData = await setupResponse.json();
    
    if (setupResponse.ok) {
      console.log('✅ First-time password setup successful');
      console.log('📝 Note: The component should redirect to /login after success');
    } else {
      console.log('❌ First-time password setup failed:', setupData.error);
    }

    // Test 4: Test logout functionality
    console.log('\n4️⃣ Testing logout functionality...');
    
    // First, sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'new-password-123'
    });

    if (signInError) {
      console.log('❌ Could not sign in test user:', signInError.message);
    } else {
      console.log('✅ Test user signed in successfully');
      
      // Test logout
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.log('❌ Logout failed:', signOutError.message);
      } else {
        console.log('✅ Logout successful');
        console.log('📝 Note: The sidebar should redirect to /login after logout');
      }
    }

    // Cleanup: Delete test user
    console.log('\n5️⃣ Cleaning up test user...');
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(authData.user.id);
    if (deleteAuthError) {
      console.log('⚠️ Could not delete auth user:', deleteAuthError.message);
    } else {
      console.log('✅ Test auth user deleted');
    }

    const { error: deleteDbError } = await supabase
      .from('users')
      .delete()
      .eq('id', authData.user.id);
    
    if (deleteDbError) {
      console.log('⚠️ Could not delete database user:', deleteDbError.message);
    } else {
      console.log('✅ Test database user deleted');
    }

    console.log('\n🎉 Redirect tests completed!');
    console.log('\n📋 Summary:');
    console.log('- Login route should be at /login');
    console.log('- Logout should redirect to /login');
    console.log('- First-time password setup should redirect to /login');
    console.log('- All redirects should use router.push() for client-side navigation');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLogoutRedirects(); 