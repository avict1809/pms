const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthentication() {
  console.log('🔍 Testing authentication...\n');

  try {
    // Test 1: Check if we can access users table (should work now that RLS is disabled)
    console.log('📋 Test 1: Accessing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(3);

    if (usersError) {
      console.log(`❌ Users table access failed: ${usersError.message}`);
    } else {
      console.log(`✅ Users table access successful: Found ${users.length} users`);
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

    // Test 2: Check if we can access projects table
    console.log('\n📋 Test 2: Accessing projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, status')
      .limit(3);

    if (projectsError) {
      console.log(`❌ Projects table access failed: ${projectsError.message}`);
    } else {
      console.log(`✅ Projects table access successful: Found ${projects.length} projects`);
      projects.forEach(project => {
        console.log(`   - ${project.title} (${project.status})`);
      });
    }

    // Test 3: Check if we can access project_members table
    console.log('\n📋 Test 3: Accessing project_members table...');
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('project_id, user_id, role')
      .limit(3);

    if (membersError) {
      console.log(`❌ Project members table access failed: ${membersError.message}`);
    } else {
      console.log(`✅ Project members table access successful: Found ${members.length} members`);
      members.forEach(member => {
        console.log(`   - Project ${member.project_id}, User ${member.user_id} (${member.role})`);
      });
    }

    console.log('\n🎉 Authentication test completed!');
    console.log('💡 If all tests pass, your API routes should now work properly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAuthentication(); 