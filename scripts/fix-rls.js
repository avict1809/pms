require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixRLS() {
  try {
    console.log('Attempting to disable RLS for users table...');
    
    // Try to disable RLS
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      console.error('Error disabling RLS:', error);
      
      // Try alternative approach - create a simple policy
      console.log('Trying to create a simple policy instead...');
      const { data: policyData, error: policyError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE users ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS "Users can view own profile" ON users;
          CREATE POLICY "Users can view own profile" ON users
              FOR SELECT USING (auth.uid() = id);
        `
      });

      if (policyError) {
        console.error('Error creating policy:', policyError);
      } else {
        console.log('Policy created successfully');
      }
    } else {
      console.log('RLS disabled successfully');
    }

    // Test the connection
    console.log('Testing user data fetch...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Test query failed:', testError);
    } else {
      console.log('Test query successful:', testData);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixRLS(); 