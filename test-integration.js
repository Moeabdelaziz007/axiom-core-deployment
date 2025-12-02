/**
 * Integration Test for Smart Factory User Flows
 * Tests the complete integration between SmartFactoryService and UI
 */

// Mock browser environment for testing
global.window = {
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
};

// Mock fetch for React Query
global.fetch = jest.fn();

// Import the service using a CommonJS approach
const fs = require('fs');
const path = require('path');

// Read the service file and eval it to avoid TypeScript import issues
const servicePath = path.join(__dirname, 'src/services/factoryService.ts');
const serviceCode = fs.readFileSync(servicePath, 'utf8');

// Create a mock module system
const mockModule = {
  exports: {},
  SmartFactoryService: null
};

// Execute the service code in our mock environment
eval(`
  ${serviceCode.replace(/export\s+type\s+AgentType/g, 'let AgentType')}
  
  // Mock console methods to capture output
  const originalConsole = console;
  const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  console = mockConsole;
  
  // Execute the service code
  ${serviceCode.replace(/export\s+{\s*SmartFactoryService[^}]*}/g, 'mockModule.exports = { SmartFactoryService: ')}
  
  // Restore console
  console = originalConsole;
`);

const { SmartFactoryService } = mockModule.exports;

// Test results tracker
const testResults = {
  agentCreation: { passed: 0, failed: 0, errors: [] },
  stageProgression: { passed: 0, failed: 0, errors: [] },
  errorHandling: { passed: 0, failed: 0, errors: [] },
  dataPersistence: { passed: 0, failed: 0, errors: [] },
  performance: { passed: 0, failed: 0, errors: [] }
};

/**
 * Test 1: Agent Creation Flow
 */
async function testAgentCreation() {
  console.log('🧪 Testing Agent Creation Flow...');
  
  try {
    const service = new SmartFactoryService();
    
    for (const agentType of ['dreamer', 'analyst', 'judge', 'builder', 'tajer', 'aqar', 'mawid', 'sofra']) {
      console.log(`  Creating ${agentType} agent...`);
      
      const agent = await service.createAgent(agentType);
      
      // Validate agent creation
      if (!agent || !agent.id || !agent.name || agent.type !== agentType) {
        throw new Error(`Invalid agent created for type ${agentType}`);
      }
      
      console.log(`  ✅ ${agent.name} created successfully`);
      testResults.agentCreation.passed++;
    }
    
    // Stop the service
    service.stopSimulation();
    
    console.log(`✅ Agent Creation Flow: ${testResults.agentCreation.passed}/8 passed`);
    
  } catch (error) {
    testResults.agentCreation.failed++;
    testResults.agentCreation.errors.push(error.message);
    console.error(`❌ Agent Creation Flow Error: ${error.message}`);
  }
}

/**
 * Test 2: Stage Progression Flow
 */
async function testStageProgression() {
  console.log('🔄 Testing Stage Progression Flow...');
  
  try {
    const service = new SmartFactoryService();
    
    // Create test agent
    const testAgent = await service.createAgent('dreamer');
    const agentId = testAgent.id;
    
    // Simulate time progression by manually advancing the simulation
    let progressionComplete = false;
    let checks = 0;
    
    while (!progressionComplete && checks < 25) { // Max 25 checks (25 seconds)
      service.updateSimulation(); // Manually trigger update
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const agent = await service.getAgentStatus(agentId);
      if (!agent) {
        throw new Error('Agent lost during progression test');
      }
      
      console.log(`  Stage ${checks}: ${agent.status} (${agent.progress.toFixed(1)}%)`);
      
      // Check if completed or failed
      if (agent.status === 'completed' || agent.status === 'error') {
        progressionComplete = true;
        
        if (agent.status === 'completed') {
          // Validate completion requirements
          if (!agent.walletAddress || agent.walletAddress.length !== 44) {
            throw new Error('Invalid wallet address on completion');
          }
          
          if (!agent.tools || agent.tools.length === 0) {
            throw new Error('No tools assigned on completion');
          }
          
          testResults.stageProgression.passed++;
          console.log(`  ✅ Agent completed successfully with wallet: ${agent.walletAddress.substring(0, 8)}...`);
        } else {
          testResults.stageProgression.failed++;
          testResults.stageProgression.errors.push(agent.error || 'Unknown error');
          console.log(`  ❌ Agent failed: ${agent.error}`);
        }
      }
      
      checks++;
    }
    
    service.stopSimulation();
    
    if (!progressionComplete) {
      throw new Error('Stage progression test timed out');
    }
    
    console.log(`✅ Stage Progression Flow: PASSED`);
    
  } catch (error) {
    testResults.stageProgression.failed++;
    testResults.stageProgression.errors.push(error.message);
    console.error(`❌ Stage Progression Flow Error: ${error.message}`);
  }
}

/**
 * Test 3: Error Handling and Recovery
 */
async function testErrorHandling() {
  console.log('🛡️ Testing Error Handling and Recovery...');
  
  try {
    const service = new SmartFactoryService();
    
    // Create agent for error testing
    const testAgent = await service.createAgent('analyst');
    const agentId = testAgent.id;
    
    // Simulate error
    const errorInjected = service.simulateAgentError(agentId, 'Test error for recovery');
    if (!errorInjected) {
      throw new Error('Error simulation failed');
    }
    
    // Verify error state
    const errorAgent = await service.getAgentStatus(agentId);
    if (errorAgent.status !== 'error' || !errorAgent.error) {
      throw new Error('Agent not in error state after simulation');
    }
    
    // Test recovery
    const recovered = service.recoverAgent(agentId);
    if (!recovered) {
      throw new Error('Agent recovery failed');
    }
    
    // Verify recovery state
    const recoveredAgent = await service.getAgentStatus(agentId);
    if (recoveredAgent.status !== 'soul_forge' || recoveredAgent.error) {
      throw new Error('Agent not properly recovered');
    }
    
    testResults.errorHandling.passed++;
    console.log(`  ✅ Error handling and recovery working correctly`);
    console.log(`✅ Error Handling Flow: PASSED`);
    
    service.stopSimulation();
    
  } catch (error) {
    testResults.errorHandling.failed++;
    testResults.errorHandling.errors.push(error.message);
    console.error(`❌ Error Handling Flow Error: ${error.message}`);
  }
}

/**
 * Test 4: Data Persistence
 */
async function testDataPersistence() {
  console.log('💾 Testing Data Persistence...');
  
  try {
    const service = new SmartFactoryService();
    
    // Get initial metrics
    const initialMetrics = await service.fetchFactoryMetrics();
    
    // Create some agents to affect metrics
    await service.createAgent('builder');
    await service.createAgent('tajer');
    
    // Get updated metrics
    const updatedMetrics = await service.fetchFactoryMetrics();
    
    // Validate metrics updates
    if (updatedMetrics.totalAgentsCreated <= initialMetrics.totalAgentsCreated) {
      throw new Error('Total agents created not updated');
    }
    
    if (updatedMetrics.activeAgents < 0) {
      throw new Error('Active agents count invalid');
    }
    
    // Test data persistence
    if (global.window.localStorage.setItem.mock.calls.length === 0) {
      throw new Error('Data persistence not working');
    }
    
    // Verify specific persistence calls
    const totalAgentsCall = global.window.localStorage.setItem.mock.calls.find(
      call => call[0] === 'axiom_factory_total_agents'
    );
    
    if (!totalAgentsCall) {
      throw new Error('Total agents not persisted');
    }
    
    testResults.dataPersistence.passed++;
    console.log(`  ✅ Metrics: ${updatedMetrics.totalAgentsCreated} total, ${updatedMetrics.activeAgents} active`);
    console.log(`  ✅ Data persistence working correctly`);
    console.log(`✅ Data Persistence Flow: PASSED`);
    
    service.stopSimulation();
    
  } catch (error) {
    testResults.dataPersistence.failed++;
    testResults.dataPersistence.errors.push(error.message);
    console.error(`❌ Data Persistence Flow Error: ${error.message}`);
  }
}

/**
 * Test 5: Performance Metrics
 */
async function testPerformanceMetrics() {
  console.log('⚡ Testing Performance Metrics...');
  
  try {
    const service = new SmartFactoryService();
    
    const startTime = Date.now();
    
    // Create multiple agents to test performance
    const creationPromises = [];
    for (let i = 0; i < 5; i++) {
      creationPromises.push(service.createAgent('dreamer'));
    }
    
    const agents = await Promise.all(creationPromises);
    const endTime = Date.now();
    
    const totalTime = endTime - startTime;
    const avgCreationTime = totalTime / 5;
    
    // Performance criteria
    if (avgCreationTime > 100) {
      throw new Error(`Average creation time too high: ${avgCreationTime}ms`);
    }
    
    if (totalTime > 5000) {
      throw new Error(`Total creation time too high: ${totalTime}ms`);
    }
    
    testResults.performance.passed++;
    console.log(`  ✅ 5 agents created in ${totalTime}ms (avg: ${avgCreationTime.toFixed(1)}ms)`);
    console.log(`✅ Performance Metrics Flow: PASSED`);
    
    service.stopSimulation();
    
  } catch (error) {
    testResults.performance.failed++;
    testResults.performance.errors.push(error.message);
    console.error(`❌ Performance Metrics Flow Error: ${error.message}`);
  }
}

/**
 * Run all integration tests
 */
async function runAllIntegrationTests() {
  console.log('🏭 Starting Smart Factory Integration Tests...\n');
  
  const startTime = Date.now();
  
  // Run all integration tests
  await testAgentCreation();
  await testStageProgression();
  await testErrorHandling();
  await testDataPersistence();
  await testPerformanceMetrics();
  
  const endTime = Date.now();
  const totalTestTime = endTime - startTime;
  
  // Generate comprehensive report
  console.log('\n📋 INTEGRATION TEST REPORT');
  console.log('=' .repeat(50));
  console.log(`Total Test Time: ${totalTestTime}ms`);
  console.log('\n📊 RESULTS SUMMARY:');
  
  const categories = [
    { name: 'Agent Creation', data: testResults.agentCreation },
    { name: 'Stage Progression', data: testResults.stageProgression },
    { name: 'Error Handling', data: testResults.errorHandling },
    { name: 'Data Persistence', data: testResults.dataPersistence },
    { name: 'Performance Metrics', data: testResults.performance }
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  categories.forEach(category => {
    const { name, data } = category;
    const status = data.failed === 0 ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${name}: ${status}`);
    console.log(`  Passed: ${data.passed}`);
    console.log(`  Failed: ${data.failed}`);
    
    if (data.errors.length > 0) {
      console.log('  Errors:');
      data.errors.forEach(error => console.log(`    - ${error}`));
    }
    
    totalPassed += data.passed;
    totalFailed += data.failed;
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`OVERALL RESULT: ${totalFailed === 0 ? '✅ ALL INTEGRATION TESTS PASSED' : '❌ SOME INTEGRATION TESTS FAILED'}`);
  console.log(`Total Passed: ${totalPassed}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  // Performance assessment
  if (totalTestTime < 30000) { // Less than 30 seconds
    console.log('⚡ Integration Performance: EXCELLENT');
  } else if (totalTestTime < 60000) { // Less than 1 minute
    console.log('🚀 Integration Performance: GOOD');
  } else {
    console.log('⚠️ Integration Performance: NEEDS OPTIMIZATION');
  }
  
  return {
    success: totalFailed === 0,
    totalPassed,
    totalFailed,
    successRate: (totalPassed / (totalPassed + totalFailed)) * 100,
    testTime: totalTestTime,
    testResults
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllIntegrationTests().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Integration test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllIntegrationTests,
  testAgentCreation,
  testStageProgression,
  testErrorHandling,
  testDataPersistence,
  testPerformanceMetrics,
  testResults
};