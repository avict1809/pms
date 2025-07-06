const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@pms.com')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing admin:', checkError);
      return;
    }

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    console.log('Creating admin user...');
    
    // Create admin user
    const { data: newAdmin, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@pms.com',
          display_name: 'System Administrator',
          role: 'admin',
          is_active: true,
          is_first_login: false,
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating admin user:', insertError);
      return;
    }

    console.log('Admin user created successfully:', newAdmin);
    console.log('Email: admin@pms.com');
    console.log('Role: admin');
    console.log('Status: active');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser(); 