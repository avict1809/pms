const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test user credentials - update these to match your actual admin user
const TEST_EMAIL = 'admin1@pms.com';
const TEST_PASSWORD = 'admin123';

// API endpoints to test
const API_ENDPOINTS = [
  { method: 'GET', path: '/api/admin/finance/projects', name: 'Admin Finance Projects' },
  { method: 'GET', path: '/api/admin/finance/system', name: 'Admin Finance System' },
  { method: 'GET', path: '/api/proposals/all', name: 'All Proposals' },
  { method: 'GET', path: '/api/projects/my-projects', name: 'My Projects' },
  { method: 'GET', path: '/api/announcements', name: 'Announcements' },
  { method: 'GET', path: '/api/approval-requests', name: 'Approval Requests' },
  { method: 'POST', path: '/api/proposals/all', name: 'Create Proposal', body: {
    title: 'Test Proposal',
    description: 'Test description',
    objectives: 'Test objectives',
    methodology: 'Test methodology',
    expected_outcomes: 'Test outcomes',
    timeline: 'Test timeline',
    resources: 'Test resources'
  }},
];

async function signInUser() {
  console.log('🔐 Signing in test user...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (error) {
    console.error('❌ Sign in failed:', error.message);
    console.log('💡 Please update TEST_EMAIL and TEST_PASSWORD in the script to match your admin user');
    return null;
  }

  console.log('✅ Signed in successfully');
  return data.session;
}

async function testEndpoint(baseUrl, endpoint, session) {
  const url = `${baseUrl}${endpoint.path}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };

  const options = {
    method: endpoint.method,
    headers,
  };

  if (endpoint.body) {
    options.body = JSON.stringify(endpoint.body);
  }

  try {
    console.log(`\n🔍 Testing ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
    
    const response = await fetch(url, options);
    const data = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = { raw: data };
    }

    if (response.ok) {
      console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);
      if (parsedData.data) {
        console.log(`   📊 Data count: ${Array.isArray(parsedData.data) ? parsedData.data.length : 'N/A'}`);
      }
    } else {
      console.log(`❌ ${endpoint.name}: FAILED (${response.status})`);
      console.log(`   📝 Error: ${parsedData.error || parsedData.message || 'Unknown error'}`);
    }

    return {
      endpoint: endpoint.name,
      status: response.status,
      success: response.ok,
      data: parsedData
    };
  } catch (error) {
    console.log(`❌ ${endpoint.name}: ERROR`);
    console.log(`   📝 Error: ${error.message}`);
    return {
      endpoint: endpoint.name,
      status: 'ERROR',
      success: false,
      error: error.message
    };
  }
}

async function checkDatabaseStatus() {
  console.log('\n🔍 Checking database status...');
  
  try {
    // Check if RLS is disabled using raw SQL
    const { data: tables, error } = await supabase.rpc('check_rls_status');
    
    if (error) {
      // Fallback: try to query tables directly
      console.log('📊 Checking RLS status by querying tables directly...');
      
      const tablesToCheck = [
        'users', 'projects', 'project_members', 'project_proposals', 
        'tasks', 'task_comments', 'files', 'announcements', 
        'financial_records', 'approval_requests'
      ];
      
      for (const tableName of tablesToCheck) {
        try {
          const { data, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (tableError && tableError.message.includes('permission denied')) {
            console.log(`   ${tableName}: RLS ENABLED ❌`);
          } else {
            console.log(`   ${tableName}: RLS DISABLED ✅`);
          }
        } catch (e) {
          console.log(`   ${tableName}: RLS ENABLED ❌`);
        }
      }
    } else {
      console.log('📊 RLS Status:');
      tables.forEach(table => {
        const status = table.row_security ? 'ENABLED ❌' : 'DISABLED ✅';
        console.log(`   ${table.table_name}: ${status}`);
      });
    }

    // Check project_proposals schema by trying to insert a test record
    console.log('\n📊 Project Proposals Schema Check:');
    try {
      const { data, error } = await supabase
        .from('project_proposals')
        .insert({
          title: 'Test Schema Check',
          description: 'Test',
          objectives: 'Test',
          methodology: 'Test',
          expected_outcomes: 'Test',
          timeline: 'Test',
          resources: 'Test',
          status: 'draft'
        })
        .select();
      
      if (error && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('   ❌ Missing required columns in project_proposals table');
      } else {
        console.log('   ✅ All required columns exist');
        // Clean up test record
        if (data && data[0]) {
          await supabase.from('project_proposals').delete().eq('id', data[0].id);
        }
      }
    } catch (e) {
      console.log('   ❌ Schema check failed:', e.message);
    }

  } catch (error) {
    console.log('❌ Database check failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting API Endpoint Test Suite\n');
  
  // Check database status first
  await checkDatabaseStatus();
  
  // Sign in user
  const session = await signInUser();
  if (!session) {
    console.log('❌ Cannot proceed without authentication');
    console.log('\n💡 To fix this:');
    console.log('1. Update TEST_EMAIL and TEST_PASSWORD in scripts/test-api-endpoints.js');
    console.log('2. Or create an admin user in your database');
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const results = [];

  // Test each endpoint
  for (const endpoint of API_ENDPOINTS) {
    const result = await testEndpoint(baseUrl, endpoint, session);
    results.push(result);
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.endpoint}: ${result.status}`);
    });
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  if (failed > 0) {
    console.log('1. Run the database fix script in Supabase dashboard');
    console.log('2. Check authentication helper implementation');
    console.log('3. Verify API route implementations');
  } else {
    console.log('🎉 All endpoints are working correctly!');
  }
}

// Run the test
main().catch(console.error); 