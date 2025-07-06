const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFirstTimeLogin() {
  console.log('🧪 Testing First-Time Login Flow...\n');

  try {
    // 1. Create a test user in the database (simulating admin creating user)
    console.log('1. Creating test user in database...');
    const testEmail = `test-user-${Date.now()}@example.com`;
    const testUser = {
      email: testEmail,
      display_name: 'Test User',
      role: 'student',
      is_active: true,
      is_first_login: true
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create test user:', createError);
      return;
    }

    console.log('✅ Test user created:', createdUser.email);

    // 2. Test the check-user API
    console.log('\n2. Testing check-user API...');
    const checkResponse = await fetch('http://localhost:3000/api/auth/check-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });

    const checkData = await checkResponse.json();
    
    if (!checkResponse.ok) {
      console.error('❌ Check user API failed:', checkData);
      return;
    }

    console.log('✅ User check successful:', checkData.message);

    // 3. Test the first-time setup API
    console.log('\n3. Testing first-time setup API...');
    const setupResponse = await fetch('http://localhost:3000/api/auth/first-time-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'testpassword123',
        display_name: 'Test User',
      }),
    });

    const setupData = await setupResponse.json();
    
    if (!setupResponse.ok) {
      console.error('❌ First-time setup API failed:', setupData);
      return;
    }

    console.log('✅ First-time setup successful:', setupData.message);

    // 4. Verify user was updated in database
    console.log('\n4. Verifying database update...');
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('is_first_login, password_set_at')
      .eq('email', testEmail)
      .single();

    if (fetchError) {
      console.error('❌ Failed to fetch updated user:', fetchError);
      return;
    }

    console.log('✅ Database updated:', {
      is_first_login: updatedUser.is_first_login,
      password_set_at: updatedUser.password_set_at
    });

    // 5. Test login with new password
    console.log('\n5. Testing login with new password...');
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'testpassword123'
    });

    if (signInError) {
      console.error('❌ Login failed:', signInError);
      return;
    }

    console.log('✅ Login successful:', authData.user.email);

    // 6. Clean up - delete test user
    console.log('\n6. Cleaning up test user...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('email', testEmail);

    if (deleteError) {
      console.error('⚠️ Failed to delete test user:', deleteError);
    } else {
      console.log('✅ Test user deleted');
    }

    console.log('\n🎉 First-time login flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFirstTimeLogin(); 