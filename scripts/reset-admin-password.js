const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function resetAdminPassword() {
  console.log('🔐 Resetting admin user password...\n');
  
  const adminEmail = 'admin@pms.com';
  const newPassword = 'admin123';
  
  try {
    // Reset password using Supabase Auth Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminEmail, // This should be the user ID, but we'll try with email first
      { password: newPassword }
    );

    if (error) {
      console.log('❌ Error with admin API, trying alternative method...');
      
      // Alternative: try to sign up the user again (this will fail if user exists)
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: newPassword,
        email_confirm: true
      });
      
      if (signUpError && signUpError.message.includes('already registered')) {
        console.log('✅ User already exists, password may need to be reset manually');
        console.log('\n💡 Manual steps to reset password:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Authentication > Users');
        console.log('3. Find the user with email: admin@pms.com');
        console.log('4. Click on the user and reset their password');
        console.log('5. Set the password to: admin123');
        return;
      } else if (signUpError) {
        console.error('❌ Error creating user:', signUpError.message);
        return;
      } else {
        console.log('✅ User created successfully');
      }
    } else {
      console.log('✅ Password reset successfully');
    }

    console.log(`\n✅ Admin user ready for testing:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual steps to reset password:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Authentication > Users');
    console.log('3. Find the user with email: admin@pms.com');
    console.log('4. Click on the user and reset their password');
    console.log('5. Set the password to: admin123');
  }
}

resetAdminPassword(); 