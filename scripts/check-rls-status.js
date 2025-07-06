const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLSStatus() {
  console.log('🔍 Checking current RLS status...\n');

  try {
    // Test access to different tables to see if RLS is blocking access
    const tables = [
      'users', 'projects', 'project_members', 'project_proposals', 
      'tasks', 'task_comments', 'files', 'announcements', 
      'financial_records', 'approval_requests', 'tool_requests', 'system_suggestions'
    ];

    console.log('📊 Testing table access with current RLS settings:');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ACCESS DENIED - ${error.message}`);
        } else {
          console.log(`✅ ${table}: ACCESS ALLOWED`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ERROR - ${err.message}`);
      }
    }

    console.log('\n💡 To disable RLS completely, you need to:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the SQL script from: supabase/disable-rls-complete.sql');
    console.log('4. Or manually disable RLS on each table in the Table Editor');

  } catch (error) {
    console.error('❌ Error checking RLS status:', error);
    process.exit(1);
  }
}

// Run the script
checkRLSStatus(); 