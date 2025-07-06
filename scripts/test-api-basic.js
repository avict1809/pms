require('dotenv').config();

// API endpoints to test without authentication
const API_ENDPOINTS = [
  { method: 'GET', path: '/api/admin/finance/projects', name: 'Admin Finance Projects' },
  { method: 'GET', path: '/api/admin/finance/system', name: 'Admin Finance System' },
  { method: 'GET', path: '/api/proposals/all', name: 'All Proposals' },
  { method: 'GET', path: '/api/projects/my-projects', name: 'My Projects' },
  { method: 'GET', path: '/api/announcements', name: 'Announcements' },
  { method: 'GET', path: '/api/approval-requests', name: 'Approval Requests' },
];

async function testEndpoint(baseUrl, endpoint) {
  const url = `${baseUrl}${endpoint.path}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  const options = {
    method: endpoint.method,
    headers,
  };

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

    if (response.status === 401) {
      console.log(`✅ ${endpoint.name}: AUTHENTICATION REQUIRED (${response.status})`);
      console.log(`   📝 This is expected - the endpoint is working but needs authentication`);
    } else if (response.status === 403) {
      console.log(`✅ ${endpoint.name}: ACCESS DENIED (${response.status})`);
      console.log(`   📝 This is expected - the endpoint is working but needs proper permissions`);
    } else if (response.ok) {
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
      success: response.ok || response.status === 401 || response.status === 403,
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

async function main() {
  console.log('🚀 Starting Basic API Endpoint Test Suite\n');
  console.log('📝 This test checks if API routes are accessible (401/403 responses are expected)\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const results = [];

  // Test each endpoint
  for (const endpoint of API_ENDPOINTS) {
    const result = await testEndpoint(baseUrl, endpoint);
    results.push(result);
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Accessible: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.endpoint}: ${result.status}`);
    });
  }

  console.log('\n🎯 INTERPRETATION:');
  console.log('✅ 401/403 responses = API routes are working correctly');
  console.log('❌ 500/404 responses = API routes have issues');
  console.log('❌ Connection errors = Server not running or network issues');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. If you see 401/403 responses, the API routes are working correctly');
  console.log('2. Reset the admin password manually in Supabase dashboard');
  console.log('3. Run the full test with authentication');
}

// Run the test
main().catch(console.error); 