/**
 * Comprehensive User Flow Testing Script for Smart Factory Integration
 * Tests complete agent creation pipeline from start to finish
 */

const { SmartFactoryService } = require('./src/services/factoryService.ts');

// Test configuration
const TEST_CONFIG = {
  agentTypes: ['dreamer', 'analyst', 'judge', 'builder', 'tajer', 'aqar', 'mawid', 'sofra'],
  maxTestDuration: 30000, // 30 seconds max per test
  progressCheckInterval: 1000, // Check progress every second
};

// Flow test results tracker
const flowResults = {
  agentCreation: { passed: 0, failed: 0, errors: [] },
  stageProgression: { passed: 0, failed: 0, errors: [] },
  completion: { passed: 0, failed: 0, errors: [] },
  metrics: { passed: 0, failed: 0, errors: [] },
  performance: { passed: 0, failed: 0, errors: [] }
};

/**
 * Test 1: Agent Creation Flow
 */
async function testAgentCreation() {
  console.log('🧪 Testing Agent Creation Flow...');
  
  try {
    for (const agentType of TEST_CONFIG.agentTypes) {
      console.log(`  Creating ${agentType} agent...`);
      
      const startTime = Date.now();
      const agent = await SmartFactoryService.createAgent(agentType);
      const endTime = Date.now();
      
      // Validate agent creation
      if (!agent || !agent.id || !agent.name || agent.type !== agentType) {
        throw new Error(`Invalid agent created for type ${agentType}`);
      }
      
      // Check creation time
      const creationTime = endTime - startTime;
      if (creationTime > 1000) {
        console.warn(`  ⚠️ Slow creation time: ${creationTime}ms for ${agentType}`);
      }
      
      console.log(`  ✅ ${agent.name} created successfully (${creationTime}ms)`);
      flowResults.agentCreation.passed++;
    }
    
    flowResults.agentCreation.passed = TEST_CONFIG.agentTypes.length;
    console.log(`✅ Agent Creation Flow: ${flowResults.agentCreation.passed}/${TEST_CONFIG.agentTypes.length} passed`);
    
  } catch (error) {
    flowResults.agentCreation.failed++;
    flowResults.agentCreation.errors.push(error.message);
    console.error(`❌ Agent Creation Flow Error: ${error.message}`);
  }
}

/**
 * Test 2: Stage Progression Flow
 */
async function testStageProgression() {
  console.log('🔄 Testing Stage Progression Flow...');
  
  try {
    // Create test agent
    const testAgent = await SmartFactoryService.createAgent('dreamer');
    const agentId = testAgent.id;
    
    let progressionComplete = false;
    let checkCount = 0;
    const maxChecks = TEST_CONFIG.maxTestDuration / TEST_CONFIG.progressCheckInterval;
    
    while (!progressionComplete && checkCount < maxChecks) {
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.progressCheckInterval));
      
      const agent = await SmartFactoryService.getAgentStatus(agentId);
      if (!agent) {
        throw new Error('Agent lost during progression test');
      }
      
      console.log(`  Stage ${checkCount}: ${agent.status} (${agent.progress.toFixed(1)}%)`);
      
      // Validate stage progression
      const validStages = ['soul_forge', 'identity_mint', 'equipping', 'delivery_dock', 'completed', 'error'];
      if (!validStages.includes(agent.status)) {
        throw new Error(`Invalid stage: ${agent.status}`);
      }
      
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
          
          if (!agent.completedAt || agent.completedAt <= agent.createdAt) {
            throw new Error('Invalid completion timestamp');
          }
          
          flowResults.stageProgression.passed++;
          console.log(`  ✅ Agent completed successfully with wallet: ${agent.walletAddress.substring(0, 8)}...`);
        } else {
          flowResults.stageProgression.failed++;
          flowResults.stageProgression.errors.push(agent.error || 'Unknown error');
          console.log(`  ❌ Agent failed: ${agent.error}`);
        }
      }
      
      checkCount++;
    }
    
    if (!progressionComplete) {
      throw new Error('Stage progression test timed out');
    }
    
    console.log(`✅ Stage Progression Flow: ${flowResults.stageProgression.passed} passed, ${flowResults.stageProgression.failed} failed`);
    
  } catch (error) {
    flowResults.stageProgression.failed++;
    flowResults.stageProgression.errors.push(error.message);
    console.error(`❌ Stage Progression Flow Error: ${error.message}`);
  }
}

/**
 * Test 3: Multiple Simultaneous Agent Creation
 */
async function testSimultaneousCreation() {
  console.log('🚀 Testing Multiple Simultaneous Agent Creation...');
  
  try {
    const creationPromises = [];
    const startTime = Date.now();
    
    // Create 5 agents simultaneously
    for (let i = 0; i < 5; i++) {
      const agentType = TEST_CONFIG.agentTypes[i % TEST_CONFIG.agentTypes.length];
      creationPromises.push(SmartFactoryService.createAgent(agentType));
    }
    
    const agents = await Promise.all(creationPromises);
    const endTime = Date.now();
    
    // Validate all agents created successfully
    if (agents.length !== 5) {
      throw new Error(`Expected 5 agents, got ${agents.length}`);
    }
    
    // Check for duplicate IDs
    const agentIds = agents.map(a => a.id);
    const uniqueIds = new Set(agentIds);
    if (uniqueIds.size !== agentIds.length) {
      throw new Error('Duplicate agent IDs detected');
    }
    
    const totalTime = endTime - startTime;
    console.log(`  ✅ 5 agents created simultaneously in ${totalTime}ms`);
    
    flowResults.performance.passed++;
    console.log(`✅ Simultaneous Creation Flow: PASSED`);
    
  } catch (error) {
    flowResults.performance.failed++;
    flowResults.performance.errors.push(error.message);
    console.error(`❌ Simultaneous Creation Flow Error: ${error.message}`);
  }
}

/**
 * Test 4: Error Handling and Recovery
 */
async function testErrorHandling() {
  console.log('🛡️ Testing Error Handling and Recovery...');
  
  try {
    // Create agent for error testing
    const testAgent = await SmartFactoryService.createAgent('analyst');
    const agentId = testAgent.id;
    
    // Simulate error
    const errorInjected = SmartFactoryService.simulateAgentError(agentId, 'Test error for recovery');
    if (!errorInjected) {
      throw new Error('Error simulation failed');
    }
    
    // Verify error state
    const errorAgent = await SmartFactoryService.getAgentStatus(agentId);
    if (errorAgent.status !== 'error' || !errorAgent.error) {
      throw new Error('Agent not in error state after simulation');
    }
    
    // Test recovery
    const recovered = SmartFactoryService.recoverAgent(agentId);
    if (!recovered) {
      throw new Error('Agent recovery failed');
    }
    
    // Verify recovery state
    const recoveredAgent = await SmartFactoryService.getAgentStatus(agentId);
    if (recoveredAgent.status !== 'soul_forge' || recoveredAgent.error) {
      throw new Error('Agent not properly recovered');
    }
    
    flowResults.completion.passed++;
    console.log(`  ✅ Error handling and recovery working correctly`);
    console.log(`✅ Error Handling Flow: PASSED`);
    
  } catch (error) {
    flowResults.completion.failed++;
    flowResults.completion.errors.push(error.message);
    console.error(`❌ Error Handling Flow Error: ${error.message}`);
  }
}

/**
 * Test 5: Metrics and Data Persistence
 */
async function testMetricsAndPersistence() {
  console.log('📊 Testing Metrics and Data Persistence...');
  
  try {
    // Get initial metrics
    const initialMetrics = await SmartFactoryService.fetchFactoryMetrics();
    
    // Create some agents to affect metrics
    await SmartFactoryService.createAgent('builder');
    await SmartFactoryService.createAgent('tajer');
    
    // Wait a bit for progression
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get updated metrics
    const updatedMetrics = await SmartFactoryService.fetchFactoryMetrics();
    
    // Validate metrics updates
    if (updatedMetrics.totalAgentsCreated <= initialMetrics.totalAgentsCreated) {
      throw new Error('Total agents created not updated');
    }
    
    if (updatedMetrics.activeAgents < 0) {
      throw new Error('Active agents count invalid');
    }
    
    if (updatedMetrics.efficiency < 0 || updatedMetrics.efficiency > 100) {
      throw new Error('Efficiency metric out of range');
    }
    
    // Test data persistence
    if (typeof localStorage !== 'undefined') {
      const persistedCount = localStorage.getItem('axiom_factory_total_agents');
      if (!persistedCount || parseInt(persistedCount) < updatedMetrics.totalAgentsCreated) {
        throw new Error('Data persistence not working');
      }
    }
    
    flowResults.metrics.passed++;
    console.log(`  ✅ Metrics: ${updatedMetrics.totalAgentsCreated} total, ${updatedMetrics.activeAgents} active`);
    console.log(`  ✅ Data persistence working correctly`);
    console.log(`✅ Metrics and Persistence Flow: PASSED`);
    
  } catch (error) {
    flowResults.metrics.failed++;
    flowResults.metrics.errors.push(error.message);
    console.error(`❌ Metrics and Persistence Flow Error: ${error.message}`);
  }
}

/**
 * Run all flow tests
 */
async function runAllFlowTests() {
  console.log('🏭 Starting Smart Factory User Flow Tests...\n');
  
  const startTime = Date.now();
  
  // Run all flow tests
  await testAgentCreation();
  await testStageProgression();
  await testSimultaneousCreation();
  await testErrorHandling();
  await testMetricsAndPersistence();
  
  const endTime = Date.now();
  const totalTestTime = endTime - startTime;
  
  // Generate comprehensive report
  console.log('\n📋 USER FLOW TEST REPORT');
  console.log('=' .repeat(50));
  console.log(`Total Test Time: ${totalTestTime}ms`);
  console.log('\n📊 RESULTS SUMMARY:');
  
  const categories = [
    { name: 'Agent Creation', data: flowResults.agentCreation },
    { name: 'Stage Progression', data: flowResults.stageProgression },
    { name: 'Error Handling', data: flowResults.completion },
    { name: 'Metrics & Persistence', data: flowResults.metrics },
    { name: 'Performance', data: flowResults.performance }
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
  console.log(`OVERALL RESULT: ${totalFailed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Total Passed: ${totalPassed}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  // Performance assessment
  if (totalTestTime < 60000) { // Less than 1 minute
    console.log('⚡ Performance: EXCELLENT');
  } else if (totalTestTime < 120000) { // Less than 2 minutes
    console.log('🚀 Performance: GOOD');
  } else {
    console.log('⚠️ Performance: NEEDS OPTIMIZATION');
  }
  
  return {
    success: totalFailed === 0,
    totalPassed,
    totalFailed,
    successRate: (totalPassed / (totalPassed + totalFailed)) * 100,
    testTime: totalTestTime,
    flowResults
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllFlowTests().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllFlowTests,
  testAgentCreation,
  testStageProgression,
  testSimultaneousCreation,
  testErrorHandling,
  testMetricsAndPersistence,
  flowResults
};