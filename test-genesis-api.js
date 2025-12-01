/**
 * Comprehensive Test Suite for Genesis API - Agent Sovereignty Protocol
 * Tests MENA localization, agent creation, and integration points
 */

const BASE_URL = 'http://localhost:3000/api/genesis';

// Test data for different MENA regions
const TEST_DATA = {
  validAgents: [
    {
      name: 'Egyptian Trader Agent',
      agentName: 'Ahmed_Tajer_Egypt',
      blueprintId: 'blueprint-tajer-001',
      region: 'egypt',
      languagePreference: 'ar-eg',
      agentType: 'TAJER',
      culturalContext: {
        businessEtiquette: ['respect_for_authority', 'personal_relationships_first'],
        communicationStyle: 'indirect',
        trustBuildingMechanisms: ['personal_introduction', 'family_connections'],
        timeOrientation: 'present',
        hierarchySensitivity: 'high'
      }
    },
    {
      name: 'Gulf Travel Agent',
      agentName: 'Khalid_Musafir_Gulf',
      blueprintId: 'blueprint-musafir-001',
      region: 'gulf',
      languagePreference: 'ar-ae',
      agentType: 'MUSAFIR',
      culturalContext: {
        businessEtiquette: ['formal_greetings', 'business_card_exchange'],
        communicationStyle: 'formal',
        trustBuildingMechanisms: ['religious_similarity', 'tribal_connections'],
        timeOrientation: 'future',
        hierarchySensitivity: 'high'
      }
    },
    {
      name: 'Levantine Dining Agent',
      agentName: 'Layla_Sofra_Levantine',
      blueprintId: 'blueprint-sofra-001',
      region: 'levantine',
      languagePreference: 'ar-lb',
      agentType: 'SOFRA',
      culturalContext: {
        businessEtiquette: ['warm_greetings', 'coffee_culture'],
        communicationStyle: 'indirect',
        trustBuildingMechanisms: ['personal_networks', 'regional_pride'],
        timeOrientation: 'present',
        hierarchySensitivity: 'medium'
      }
    },
    {
      name: 'North African Advisor',
      agentName: 'Youssef_Mostashar_NA',
      blueprintId: 'blueprint-mostashar-001',
      region: 'north_africa',
      languagePreference: 'ar',
      agentType: 'MOSTASHAR',
      culturalContext: {
        businessEtiquette: ['french_influence', 'arab_hospitality'],
        communicationStyle: 'direct',
        trustBuildingMechanisms: ['business_acumen', 'religious_respect'],
        timeOrientation: 'past',
        hierarchySensitivity: 'medium'
      }
    }
  ],
  invalidRegions: [
    { region: 'invalid_region', expectedError: 'Invalid region' },
    { region: 'usa', expectedError: 'Invalid region' },
    { region: 'europe', expectedError: 'Invalid region' },
    { region: '', expectedError: 'Missing required fields' }
  ],
  invalidAgentTypes: [
    { agentType: 'INVALID_TYPE', expectedError: 'Invalid agent type' },
    { agentType: 'TRADER', expectedError: 'Invalid agent type' },
    { agentType: '', expectedError: 'should not fail if optional' }
  ],
  missingFields: [
    { missing: 'agentName', expectedError: 'Missing required fields' },
    { missing: 'blueprintId', expectedError: 'Missing required fields' },
    { missing: 'region', expectedError: 'Missing required fields' },
    { missing: 'all', expectedError: 'Missing required fields' }
  ]
};

// Utility functions
function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${timestamp} ${statusIcon} ${testName}: ${status}${details ? ' - ' + details : ''}`);
}

function logRequest(method, url, body = null) {
  console.log(`\n📡 ${method} ${url}`);
  if (body) {
    console.log('📦 Request Body:', JSON.stringify(body, null, 2));
  }
}

function logResponse(status, data) {
  console.log(`📬 Response Status: ${status}`);
  console.log('📋 Response Data:', JSON.stringify(data, null, 2));
}

// Test functions
async function testGetGenesis() {
  logTest('GET Genesis Endpoint', 'RUNNING');
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    logResponse(response.status, data);
    
    if (response.status === 200 && data.status === 'SUCCESS') {
      logTest('GET Genesis Endpoint', 'PASS', 'Genesis agent awakened successfully');
      return true;
    } else {
      logTest('GET Genesis Endpoint', 'FAIL', `Unexpected response: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('GET Genesis Endpoint', 'FAIL', `Error: ${error.message}`);
    return false;
  }
}

async function testValidAgentCreation(testCase) {
  const testName = `Create Valid Agent - ${testCase.name}`;
  logTest(testName, 'RUNNING');
  
  try {
    logRequest('POST', BASE_URL, testCase);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase)
    });
    
    const data = await response.json();
    logResponse(response.status, data);
    
    // Validate response structure
    const expectedFields = ['success', 'agentId', 'axiomId', 'publicKey', 'culturalContext', 
                          'languagePreference', 'sovereigntyLevel', 'region', 'walletAddress'];
    
    if (response.status === 201 && data.success === true) {
      const missingFields = expectedFields.filter(field => !(field in data));
      if (missingFields.length === 0) {
        logTest(testName, 'PASS', `Agent created with ID: ${data.agentId}`);
        return { success: true, data };
      } else {
        logTest(testName, 'FAIL', `Missing response fields: ${missingFields.join(', ')}`);
        return { success: false, error: `Missing fields: ${missingFields.join(', ')}` };
      }
    } else {
      logTest(testName, 'FAIL', `Creation failed: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (error) {
    logTest(testName, 'FAIL', `Request error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testInvalidRegion(testCase) {
  const testName = `Invalid Region Test - ${testCase.region}`;
  logTest(testName, 'RUNNING');
  
  const requestBody = {
    agentName: 'Test Agent',
    blueprintId: 'test-blueprint',
    region: testCase.region
  };
  
  try {
    logRequest('POST', BASE_URL, requestBody);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    logResponse(response.status, data);
    
    if (response.status === 400 && data.error && data.error.includes(testCase.expectedError)) {
      logTest(testName, 'PASS', 'Correctly rejected invalid region');
      return true;
    } else {
      logTest(testName, 'FAIL', 'Should have rejected invalid region');
      return false;
    }
  } catch (error) {
    logTest(testName, 'FAIL', `Request error: ${error.message}`);
    return false;
  }
}

async function testMissingFields(testCase) {
  const testName = `Missing Fields Test - ${testCase.missing}`;
  logTest(testName, 'RUNNING');
  
  let requestBody = {
    agentName: 'Test Agent',
    blueprintId: 'test-blueprint',
    region: 'egypt'
  };
  
  if (testCase.missing === 'all') {
    requestBody = {};
  } else {
    delete requestBody[testCase.missing];
  }
  
  try {
    logRequest('POST', BASE_URL, requestBody);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    logResponse(response.status, data);
    
    if (response.status === 400 && data.error && data.error.includes(testCase.expectedError)) {
      logTest(testName, 'PASS', 'Correctly rejected missing fields');
      return true;
    } else {
      logTest(testName, 'FAIL', 'Should have rejected missing fields');
      return false;
    }
  } catch (error) {
    logTest(testName, 'FAIL', `Request error: ${error.message}`);
    return false;
  }
}

async function testInvalidAgentType(testCase) {
  const testName = `Invalid Agent Type Test - ${testCase.agentType}`;
  logTest(testName, 'RUNNING');
  
  const requestBody = {
    agentName: 'Test Agent',
    blueprintId: 'test-blueprint',
    region: 'egypt',
    agentType: testCase.agentType
  };
  
  try {
    logRequest('POST', BASE_URL, requestBody);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    logResponse(response.status, data);
    
    if (testCase.expectedError === 'should not fail if optional') {
      if (response.status === 201 || response.status === 400) {
        logTest(testName, 'PASS', 'Handled optional agent type correctly');
        return true;
      }
    } else if (response.status === 400 && data.error && data.error.includes(testCase.expectedError)) {
      logTest(testName, 'PASS', 'Correctly rejected invalid agent type');
      return true;
    } else {
      logTest(testName, 'FAIL', 'Should have rejected invalid agent type');
      return false;
    }
  } catch (error) {
    logTest(testName, 'FAIL', `Request error: ${error.message}`);
    return false;
  }
}

async function testBlueprintValidation() {
  logTest('Blueprint Validation Test', 'RUNNING');
  
  const requestBody = {
    agentName: 'Test Agent',
    blueprintId: 'non-existent-blueprint',
    region: 'egypt'
  };
  
  try {
    logRequest('POST', BASE_URL, requestBody);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    logResponse(response.status, data);
    
    if (response.status === 404 && data.error && data.error.includes('Blueprint not found')) {
      logTest('Blueprint Validation Test', 'PASS', 'Correctly rejected non-existent blueprint');
      return true;
    } else {
      logTest('Blueprint Validation Test', 'FAIL', 'Should have rejected non-existent blueprint');
      return false;
    }
  } catch (error) {
    logTest('Blueprint Validation Test', 'FAIL', `Request error: ${error.message}`);
    return false;
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Genesis API Test Suite');
  console.log('=====================================');
  
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    testResults: []
  };
  
  // Test 1: GET Genesis endpoint
  results.totalTests++;
  const getGenesisResult = await testGetGenesis();
  if (getGenesisResult) {
    results.passedTests++;
    results.testResults.push({ test: 'GET Genesis', status: 'PASS' });
  } else {
    results.failedTests++;
    results.testResults.push({ test: 'GET Genesis', status: 'FAIL' });
  }
  
  // Test 2: Valid agent creation for each MENA region
  for (const testCase of TEST_DATA.validAgents) {
    results.totalTests++;
    const result = await testValidAgentCreation(testCase);
    if (result.success) {
      results.passedTests++;
      results.testResults.push({ test: `Valid Agent - ${testCase.name}`, status: 'PASS' });
    } else {
      results.failedTests++;
      results.testResults.push({ test: `Valid Agent - ${testCase.name}`, status: 'FAIL', error: result.error });
    }
  }
  
  // Test 3: Invalid region validation
  for (const testCase of TEST_DATA.invalidRegions) {
    results.totalTests++;
    const result = await testInvalidRegion(testCase);
    if (result) {
      results.passedTests++;
      results.testResults.push({ test: `Invalid Region - ${testCase.region}`, status: 'PASS' });
    } else {
      results.failedTests++;
      results.testResults.push({ test: `Invalid Region - ${testCase.region}`, status: 'FAIL' });
    }
  }
  
  // Test 4: Missing fields validation
  for (const testCase of TEST_DATA.missingFields) {
    results.totalTests++;
    const result = await testMissingFields(testCase);
    if (result) {
      results.passedTests++;
      results.testResults.push({ test: `Missing Fields - ${testCase.missing}`, status: 'PASS' });
    } else {
      results.failedTests++;
      results.testResults.push({ test: `Missing Fields - ${testCase.missing}`, status: 'FAIL' });
    }
  }
  
  // Test 5: Invalid agent type validation
  for (const testCase of TEST_DATA.invalidAgentTypes) {
    results.totalTests++;
    const result = await testInvalidAgentType(testCase);
    if (result) {
      results.passedTests++;
      results.testResults.push({ test: `Invalid Agent Type - ${testCase.agentType}`, status: 'PASS' });
    } else {
      results.failedTests++;
      results.testResults.push({ test: `Invalid Agent Type - ${testCase.agentType}`, status: 'FAIL' });
    }
  }
  
  // Test 6: Blueprint validation
  results.totalTests++;
  const blueprintResult = await testBlueprintValidation();
  if (blueprintResult) {
    results.passedTests++;
    results.testResults.push({ test: 'Blueprint Validation', status: 'PASS' });
  } else {
    results.failedTests++;
    results.testResults.push({ test: 'Blueprint Validation', status: 'FAIL' });
  }
  
  // Generate final report
  console.log('\n=====================================');
  console.log('📊 TEST SUITE SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests} ✅`);
  console.log(`Failed: ${results.failedTests} ❌`);
  console.log(`Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(2)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  results.testResults.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} ${result.test}: ${result.status}${result.error ? ' - ' + result.error : ''}`);
  });
  
  return results;
}

// Check if server is running before starting tests
async function checkServerHealth() {
  try {
    const response = await fetch('http://localhost:3000/health', { 
      method: 'GET',
      timeout: 5000 
    });
    return response.status < 500; // Any response means server is running
  } catch (error) {
    return false;
  }
}

// Main execution
if (require.main === module) {
  checkServerHealth().then(isServerRunning => {
    if (!isServerRunning) {
      console.log('❌ Server is not running on http://localhost:3000');
      console.log('Please start the server with: npm run dev');
      process.exit(1);
    }
    
    runAllTests().then(results => {
      process.exit(results.failedTests > 0 ? 1 : 0);
    });
  });
}

module.exports = {
  runAllTests,
  testGetGenesis,
  testValidAgentCreation,
  testInvalidRegion,
  testMissingFields,
  testInvalidAgentType,
  testBlueprintValidation,
  TEST_DATA
};