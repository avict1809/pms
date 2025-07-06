const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  console.log('🚀 Starting RLS disable process...\n');

  try {
    // Disable RLS on all tables
    const disableRLSQueries = [
      'ALTER TABLE users DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE projects DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE project_proposals DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE files DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE financial_records DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE approval_requests DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE tool_requests DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE system_suggestions DISABLE ROW LEVEL SECURITY;'
    ];

    console.log('📋 Disabling RLS on all tables...');
    for (const query of disableRLSQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`⚠️  Warning for query: ${query}`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ Executed: ${query}`);
      }
    }

    // Drop all RLS policies
    const dropPoliciesQueries = [
      // Users policies
      'DROP POLICY IF EXISTS "Admins can view all users" ON users;',
      'DROP POLICY IF EXISTS "Admins can create users" ON users;',
      'DROP POLICY IF EXISTS "Admins can update users" ON users;',
      'DROP POLICY IF EXISTS "Users can view own profile" ON users;',
      'DROP POLICY IF EXISTS "Users can update own profile" ON users;',
      
      // Projects policies
      'DROP POLICY IF EXISTS "Admins can view all projects" ON projects;',
      'DROP POLICY IF EXISTS "Admins can create projects" ON projects;',
      'DROP POLICY IF EXISTS "Admins can update projects" ON projects;',
      'DROP POLICY IF EXISTS "Users can view project if member" ON projects;',
      'DROP POLICY IF EXISTS "Supervisors can view supervised projects" ON projects;',
      
      // Project members policies
      'DROP POLICY IF EXISTS "Admins can manage project members" ON project_members;',
      'DROP POLICY IF EXISTS "Users can view project members" ON project_members;',
      
      // Project proposals policies
      'DROP POLICY IF EXISTS "Students can create proposals" ON project_proposals;',
      'DROP POLICY IF EXISTS "Students can view own proposals" ON project_proposals;',
      'DROP POLICY IF EXISTS "Admins can manage proposals" ON project_proposals;',
      
      // Tasks policies
      'DROP POLICY IF EXISTS "Users can view project tasks" ON tasks;',
      'DROP POLICY IF EXISTS "Admins can manage tasks" ON tasks;',
      'DROP POLICY IF EXISTS "Supervisors can manage tasks" ON tasks;',
      
      // Task comments policies
      'DROP POLICY IF EXISTS "Users can view task comments" ON task_comments;',
      'DROP POLICY IF EXISTS "Supervisors can create comments" ON task_comments;',
      
      // Files policies
      'DROP POLICY IF EXISTS "Users can view project files" ON files;',
      'DROP POLICY IF EXISTS "Users can upload files" ON files;',
      'DROP POLICY IF EXISTS "Admins can manage files" ON files;',
      
      // Announcements policies
      'DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;',
      'DROP POLICY IF EXISTS "Users can view global announcements" ON announcements;',
      'DROP POLICY IF EXISTS "Users can view project announcements" ON announcements;',
      'DROP POLICY IF EXISTS "Users can view personal announcements" ON announcements;',
      
      // Financial records policies
      'DROP POLICY IF EXISTS "Users can view financial records" ON financial_records;',
      'DROP POLICY IF EXISTS "Users can create financial records" ON financial_records;',
      'DROP POLICY IF EXISTS "Admins can manage financial records" ON financial_records;',
      
      // Approval requests policies
      'DROP POLICY IF EXISTS "Users can view approval requests" ON approval_requests;',
      'DROP POLICY IF EXISTS "Users can create approval requests" ON approval_requests;',
      'DROP POLICY IF EXISTS "Admins can manage approval requests" ON approval_requests;',
      
      // Tool requests policies
      'DROP POLICY IF EXISTS "Users can view tool requests" ON tool_requests;',
      'DROP POLICY IF EXISTS "Users can create tool requests" ON tool_requests;',
      'DROP POLICY IF EXISTS "Admins can manage tool requests" ON tool_requests;',
      
      // System suggestions policies
      'DROP POLICY IF EXISTS "Users can view system suggestions" ON system_suggestions;',
      'DROP POLICY IF EXISTS "Users can create system suggestions" ON system_suggestions;',
      'DROP POLICY IF EXISTS "Admins can manage system suggestions" ON system_suggestions;'
    ];

    console.log('\n🗑️  Dropping all RLS policies...');
    for (const query of dropPoliciesQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`⚠️  Warning for query: ${query}`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ Executed: ${query}`);
      }
    }

    // Verify RLS is disabled
    console.log('\n🔍 Verifying RLS status...');
    const { data: rlsStatus, error: statusError } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .eq('table_schema', 'public')
      .in('table_name', [
        'users', 'projects', 'project_members', 'project_proposals', 
        'tasks', 'task_comments', 'files', 'announcements', 
        'financial_records', 'approval_requests', 'tool_requests', 'system_suggestions'
      ]);

    if (statusError) {
      console.log('⚠️  Could not verify RLS status:', statusError.message);
    } else {
      console.log('\n📊 RLS Status Report:');
      rlsStatus.forEach(table => {
        const status = table.row_security === 'NO' ? '✅ DISABLED' : '❌ ENABLED';
        console.log(`   ${table.table_name}: ${status}`);
      });
    }

    console.log('\n🎉 RLS disable process completed!');
    console.log('⚠️  Note: All tables now have RLS disabled. This means:');
    console.log('   - All authenticated users can access all data');
    console.log('   - No row-level security restrictions are in place');
    console.log('   - Make sure your application-level authorization is properly implemented');

  } catch (error) {
    console.error('❌ Error during RLS disable process:', error);
    process.exit(1);
  }
}

// Run the script
disableRLS(); 