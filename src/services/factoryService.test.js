/**
 * Simple JavaScript test for SmartFactoryService
 * This file demonstrates basic usage and verifies functionality
 */

// Mock localStorage for Node.js environment
if (typeof global !== 'undefined' && !global.localStorage) {
  global.localStorage = {
    store: {},
    getItem: function(key) {
      return this.store[key] || null;
    },
    setItem: function(key, value) {
      this.store[key] = value;
    },
    removeItem: function(key) {
      delete this.store[key];
    },
    clear: function() {
      this.store = {};
    }
  };
}

// Import the service - using require for CommonJS
const { SmartFactoryService } = require('./factoryService.ts');

/**
 * Test function to verify SmartFactoryService implementation
 */
async function testSmartFactoryService() {
  console.log('🏭 Testing SmartFactoryService...\n');

  try {
    // Create a new service instance
    const service = new SmartFactoryService();
    
    // Test 1: Create a new agent
    console.log('1. Creating a new agent...');
    const agent = await service.createAgent('dreamer');
    console.log('✅ Agent created:', {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      progress: agent.progress
    });

    // Test 2: Get agent status
    console.log('\n2. Getting agent status...');
    const agentStatus = await service.getAgentStatus(agent.id);
    console.log('✅ Agent status:', agentStatus ? {
      id: agentStatus.id,
      status: agentStatus.status,
      progress: agentStatus.progress,
      stageProgress: agentStatus.stageProgress
    } : 'Not found');

    // Test 3: Fetch factory metrics
    console.log('\n3. Fetching factory metrics...');
    const metrics = await service.fetchFactoryMetrics();
    console.log('✅ Factory metrics:', {
      totalAgentsCreated: metrics.totalAgentsCreated,
      activeAgents: metrics.activeAgents,
      completedAgents: metrics.completedAgents,
      failedAgents: metrics.failedAgents,
      efficiency: metrics.efficiency.toFixed(2) + '%'
    });

    // Test 4: Get assembly line status
    console.log('\n4. Getting assembly line status...');
    const assemblyLineStatus = await service.getAssemblyLineStatus();
    console.log('✅ Assembly line status:');
    assemblyLineStatus.forEach((status, index) => {
      console.log(`  Stage ${index + 1}: ${status.stage.name} - ${status.stage.status} (${status.agentsInQueue} agents)`);
    });

    // Test 5: Wait for simulation progress
    console.log('\n5. Waiting for simulation progress...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const updatedAgent = await service.getAgentStatus(agent.id);
    if (updatedAgent) {
      console.log('✅ Agent progress after 3 seconds:', {
        status: updatedAgent.status,
        progress: updatedAgent.progress.toFixed(2) + '%',
        stageProgress: updatedAgent.stageProgress.toFixed(2) + '%',
        walletAddress: updatedAgent.walletAddress || 'Not generated yet',
        tools: updatedAgent.tools || 'Not equipped yet'
      });
    }

    // Test 6: Create multiple agents
    console.log('\n6. Creating multiple agents...');
    const agentTypes = ['analyst', 'judge', 'builder', 'tajer'];
    const agents = [];
    
    for (const type of agentTypes) {
      const newAgent = await service.createAgent(type);
      agents.push(newAgent);
      console.log(`✅ Created ${type} agent: ${newAgent.name}`);
    }

    // Test 7: Final metrics check
    console.log('\n7. Final factory metrics...');
    const finalMetrics = await service.fetchFactoryMetrics();
    console.log('✅ Final metrics:', {
      totalAgentsCreated: finalMetrics.totalAgentsCreated,
      activeAgents: finalMetrics.activeAgents,
      averageProductionTime: finalMetrics.averageProductionTime + 'ms',
      activeWallets: finalMetrics.activeWallets,
      totalToolsLoaded: finalMetrics.totalToolsLoaded
    });

    // Test 8: Error scenario
    console.log('\n8. Testing error scenario...');
    const errorInjected = service.simulateAgentError(agent.id, 'Test error scenario');
    console.log('✅ Error injection successful:', errorInjected);
    
    const errorAgent = await service.getAgentStatus(agent.id);
    console.log('✅ Agent status after error:', {
      status: errorAgent?.status,
      error: errorAgent?.error
    });
    
    // Test 9: Recovery scenario
    console.log('\n9. Testing recovery scenario...');
    const recovered = service.recoverAgent(agent.id);
    console.log('✅ Agent recovery successful:', recovered);
    
    const recoveredAgent = await service.getAgentStatus(agent.id);
    console.log('✅ Agent status after recovery:', {
      status: recoveredAgent?.status,
      error: recoveredAgent?.error
    });

    console.log('\n🎉 All tests completed successfully!');
    
    // Clean up
    service.stopSimulation();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSmartFactoryService()
  .then(() => {
    console.log('\n🏭 SmartFactoryService testing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Testing failed:', error);
    process.exit(1);
  });