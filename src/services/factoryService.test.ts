/**
 * Test file for SmartFactoryService
 * This file demonstrates the usage and verifies the functionality
 */

import { SmartFactoryService, createAgent, fetchFactoryMetrics, getAgentStatus, getAssemblyLineStatus } from './factoryService';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// Setup global window with localStorage mock
if (typeof window === 'undefined') {
  (global as any).window = { localStorage: localStorageMock };
}

/**
 * Test function to verify the SmartFactoryService implementation
 */
async function testSmartFactoryService(): Promise<void> {
  console.log('🏭 Testing SmartFactoryService...\n');

  try {
    // Test 1: Create a new agent
    console.log('1. Creating a new agent...');
    const agent = await createAgent('dreamer');
    console.log('✅ Agent created:', {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      progress: agent.progress
    });

    // Test 2: Get agent status
    console.log('\n2. Getting agent status...');
    const agentStatus = await getAgentStatus(agent.id);
    console.log('✅ Agent status:', agentStatus ? {
      id: agentStatus.id,
      status: agentStatus.status,
      progress: agentStatus.progress,
      stageProgress: agentStatus.stageProgress
    } : 'Not found');

    // Test 3: Fetch factory metrics
    console.log('\n3. Fetching factory metrics...');
    const metrics = await fetchFactoryMetrics();
    console.log('✅ Factory metrics:', {
      totalAgentsCreated: metrics.totalAgentsCreated,
      activeAgents: metrics.activeAgents,
      completedAgents: metrics.completedAgents,
      failedAgents: metrics.failedAgents,
      efficiency: metrics.efficiency.toFixed(2) + '%'
    });

    // Test 4: Get assembly line status
    console.log('\n4. Getting assembly line status...');
    const assemblyLineStatus = await getAssemblyLineStatus();
    console.log('✅ Assembly line status:');
    assemblyLineStatus.forEach((status, index) => {
      console.log(`  Stage ${index + 1}: ${status.stage.name} - ${status.stage.status} (${status.agentsInQueue} agents)`);
    });

    // Test 5: Wait for simulation progress
    console.log('\n5. Waiting for simulation progress...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const updatedAgent = await getAgentStatus(agent.id);
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
      const newAgent = await createAgent(type as any);
      agents.push(newAgent);
      console.log(`✅ Created ${type} agent: ${newAgent.name}`);
    }

    // Test 7: Final metrics check
    console.log('\n7. Final factory metrics...');
    const finalMetrics = await fetchFactoryMetrics();
    console.log('✅ Final metrics:', {
      totalAgentsCreated: finalMetrics.totalAgentsCreated,
      activeAgents: finalMetrics.activeAgents,
      averageProductionTime: finalMetrics.averageProductionTime + 'ms',
      activeWallets: finalMetrics.activeWallets,
      totalToolsLoaded: finalMetrics.totalToolsLoaded
    });

    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test error scenarios
 */
async function testErrorScenarios(): Promise<void> {
  console.log('\n🔧 Testing error scenarios...\n');

  try {
    const service = new SmartFactoryService();
    
    // Create an agent
    const agent = await service.createAgent('dreamer');
    console.log('1. Created agent for error testing:', agent.name);
    
    // Simulate an error
    const errorInjected = service.simulateAgentError(agent.id, 'Test error scenario');
    console.log('2. Error injection successful:', errorInjected);
    
    // Check agent status after error
    const errorAgent = await service.getAgentStatus(agent.id);
    console.log('3. Agent status after error:', {
      status: errorAgent?.status,
      error: errorAgent?.error
    });
    
    // Recover from error
    const recovered = service.recoverAgent(agent.id);
    console.log('4. Agent recovery successful:', recovered);
    
    // Check agent status after recovery
    const recoveredAgent = await service.getAgentStatus(agent.id);
    console.log('5. Agent status after recovery:', {
      status: recoveredAgent?.status,
      error: recoveredAgent?.error
    });
    
    console.log('\n✅ Error scenario tests completed!');
    
  } catch (error) {
    console.error('❌ Error scenario test failed:', error);
  }
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testSmartFactoryService()
    .then(() => testErrorScenarios())
    .then(() => {
      console.log('\n🏭 SmartFactoryService testing complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Testing failed:', error);
      process.exit(1);
    });
}

export { testSmartFactoryService, testErrorScenarios };