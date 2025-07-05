require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findAndInsertAdmin() {
  try {
    console.log('Finding admin user in auth...');
    
    // First, let's try to sign in to get the user ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin1@pms.com',
      password: 'admin123456'
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }

    const userId = signInData.user.id;
    console.log('Found user ID:', userId);

    // Now let's check if the user exists in the users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      return;
    }

    if (existingUser) {
      console.log('User already exists in users table:', existingUser);
      return;
    }

    // Insert the user into the users table
    console.log('Inserting user into users table...');
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: 'admin1@pms.com',
        role: 'admin',
        display_name: 'System Administrator',
        is_active: true,
        is_first_login: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting user:', insertError);
      
      // Try with RLS disabled (if we have service role key)
      console.log('Trying alternative approach...');
      const { data: altData, error: altError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'admin1@pms.com',
          role: 'admin',
          display_name: 'System Administrator',
          is_active: true,
          is_first_login: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (altError) {
        console.error('Alternative approach also failed:', altError);
      } else {
        console.log('User inserted successfully:', altData);
      }
    } else {
      console.log('User inserted successfully:', insertData);
    }

    // Verify the user was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('Error verifying user:', verifyError);
    } else {
      console.log('User verified in database:', verifyData);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

findAndInsertAdmin(); 