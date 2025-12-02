/**
 * Comprehensive Error Handling and Recovery Test Suite for SmartFactoryService
 * 
 * This test suite specifically focuses on error scenarios, recovery mechanisms,
 * and robust error handling throughout the SmartFactoryService.
 * 
 * Test Categories:
 * 1. Service Error Simulation
 * 2. Network Failure Scenarios
 * 3. Data Corruption Recovery
 * 4. Concurrent Operation Failures
 * 5. Timeout and Recovery Scenarios
 * 6. Error Boundary Testing
 */

import { SmartFactoryService, smartFactoryService } from '../factoryService';

// Enhanced localStorage mock with error simulation capabilities
const createErrorSimulatingLocalStorage = () => {
  let store: Record<string, string> = {};
  let shouldFail = false;
  let failureType: 'getItem' | 'setItem' | 'removeItem' | 'all' = 'all';
  let failureMessage = 'Simulated localStorage error';
  
  const simulateError = (operation: string) => {
    if (shouldFail && (failureType === operation || failureType === 'all')) {
      throw new Error(failureMessage);
    }
  };
  
  return {
    store,
    setShouldFail: (fail: boolean, type: 'getItem' | 'setItem' | 'removeItem' | 'all' = 'all', message?: string) => {
      shouldFail = fail;
      failureType = type;
      if (message) failureMessage = message;
    },
    getItem: jest.fn((key: string) => {
      simulateError('getItem');
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      simulateError('setItem');
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      simulateError('removeItem');
      delete store[key];
    }),
    clear: jest.fn(() => { store = {}; })
  };
};

// Network failure simulation utilities
const createNetworkFailureSimulator = () => {
  let shouldFail = false;
  let failureRate = 1.0; // 100% failure rate by default
  let failureMessage = 'Network connection failed';
  
  return {
    setShouldFail: (fail: boolean, rate: number = 1.0, message?: string) => {
      shouldFail = fail;
      failureRate = rate;
      if (message) failureMessage = message;
    },
    simulateNetworkCall: () => {
      if (shouldFail && Math.random() < failureRate) {
        throw new Error(failureMessage);
      }
      return Promise.resolve();
    }
  };
};

// Setup global mocks
const localStorageMock = createErrorSimulatingLocalStorage();
const networkSimulator = createNetworkFailureSimulator();

if (typeof window === 'undefined') {
  (global as any).window = { localStorage: localStorageMock };
  (global as any).localStorage = localStorageMock;
} else {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
}

if (typeof localStorage === 'undefined') {
  (global as any).localStorage = localStorageMock;
}

describe('SmartFactoryService Error Handling and Recovery', () => {
  let service: SmartFactoryService;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Stop global singleton to prevent interference
    smartFactoryService.stopSimulation();
    
    service = new SmartFactoryService();
    
    // Reset error simulators
    localStorageMock.setShouldFail(false);
    networkSimulator.setShouldFail(false);
  });

  afterEach(() => {
    service.stopSimulation();
    jest.runAllTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Service Error Simulation', () => {
    it('should handle agent error injection gracefully', async () => {
      const agent = await service.createAgent('dreamer');
      expect(agent.status).toBe('soul_forge');
      
      // Inject error
      const errorResult = service.simulateAgentError(agent.id, 'Test error injection');
      expect(errorResult).toBe(true);
      
      const errorAgent = await service.getAgentStatus(agent.id);
      expect(errorAgent?.status).toBe('error');
      expect(errorAgent?.error).toBe('Test error injection');
      expect(errorAgent?.completedAt).toBeDefined();
      
      // Verify metrics reflect the error
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics.failedAgents).toBeGreaterThanOrEqual(1);
    });

    it('should handle multiple simultaneous agent errors', async () => {
      const agents = [];
      for (let i = 0; i < 5; i++) {
        agents.push(await service.createAgent('dreamer'));
      }
      
      // Inject errors in all agents simultaneously
      const errorResults = agents.map(agent => 
        service.simulateAgentError(agent.id, `Simultaneous error ${agent.id}`)
      );
      
      expect(errorResults.every(result => result === true)).toBe(true);
      
      // Verify all agents are in error state
      for (const agent of agents) {
        const status = await service.getAgentStatus(agent.id);
        expect(status?.status).toBe('error');
        expect(status?.error).toContain('Simultaneous error');
      }
    });

    it('should handle error injection for non-existent agents', async () => {
      const result = service.simulateAgentError('non-existent-agent-id', 'Test error');
      expect(result).toBe(false);
      
      // Should not affect metrics
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics.failedAgents).toBe(0);
    });

    it('should handle error injection for completed agents', async () => {
      const agent = await service.createAgent('analyst');
      
      // Mock Math.random to prevent random errors
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      try {
        // Fast forward to completion
        let completedAgent = await service.getAgentStatus(agent.id);
        while (completedAgent?.status !== 'completed') {
          jest.advanceTimersByTime(2000);
          completedAgent = await service.getAgentStatus(agent.id);
        }
        
        // Try to inject error into completed agent
        const errorResult = service.simulateAgentError(agent.id, 'Error after completion');
        expect(errorResult).toBe(false);
        
        // Agent should remain completed
        const finalStatus = await service.getAgentStatus(agent.id);
        expect(finalStatus?.status).toBe('completed');
      } finally {
        Math.random = originalRandom;
      }
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should recover agents from error state successfully', async () => {
      const agent = await service.createAgent('judge');
      
      // Inject error
      service.simulateAgentError(agent.id, 'Recovery test error');
      
      let errorAgent = await service.getAgentStatus(agent.id);
      expect(errorAgent?.status).toBe('error');
      
      // Recover agent
      const recoveryResult = service.recoverAgent(agent.id);
      expect(recoveryResult).toBe(true);
      
      const recoveredAgent = await service.getAgentStatus(agent.id);
      expect(recoveredAgent?.status).toBe('soul_forge');
      expect(recoveredAgent?.error).toBeUndefined();
      expect(recoveredAgent?.progress).toBe(0);
      expect(recoveredAgent?.stageProgress).toBe(0);
      expect(recoveredAgent?.completedAt).toBeUndefined();
    });

    it('should handle recovery for non-existent agents', async () => {
      const recoveryResult = service.recoverAgent('non-existent-agent');
      expect(recoveryResult).toBe(false);
    });

    it('should handle recovery for non-error state agents', async () => {
      const agent = await service.createAgent('builder');
      
      // Try to recover agent that's not in error state
      const recoveryResult = service.recoverAgent(agent.id);
      expect(recoveryResult).toBe(false);
      
      // Agent should remain in original state
      const status = await service.getAgentStatus(agent.id);
      expect(status?.status).toBe('soul_forge');
    });

    it('should recover multiple agents simultaneously', async () => {
      const agents = [];
      for (let i = 0; i < 3; i++) {
        agents.push(await service.createAgent('dreamer'));
      }
      
      // Inject errors in all agents
      agents.forEach(agent => {
        service.simulateAgentError(agent.id, `Recovery test ${agent.id}`);
      });
      
      // Verify all agents are in error state
      for (const agent of agents) {
        const status = await service.getAgentStatus(agent.id);
        expect(status?.status).toBe('error');
      }
      
      // Recover all agents simultaneously
      const recoveryResults = agents.map(agent => service.recoverAgent(agent.id));
      expect(recoveryResults.every(result => result === true)).toBe(true);
      
      // Verify all agents are recovered
      for (const agent of agents) {
        const status = await service.getAgentStatus(agent.id);
        expect(status?.status).toBe('soul_forge');
        expect(status?.error).toBeUndefined();
      }
    });
  });

  describe('localStorage Error Handling', () => {
    it('should handle localStorage getItem failures gracefully', async () => {
      // Simulate localStorage getItem failure
      localStorageMock.setShouldFail(true, 'getItem', 'localStorage read error');
      
      // Should not throw error
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalAgentsCreated).toBe(0); // Should default to 0
      
      // Should still be able to create agents
      const agent = await service.createAgent('dreamer');
      expect(agent).toBeDefined();
    });

    it('should handle localStorage setItem failures gracefully', async () => {
      // Simulate localStorage setItem failure
      localStorageMock.setShouldFail(true, 'setItem', 'localStorage write error');
      
      // Should not throw error when creating agent
      const agent = await service.createAgent('analyst');
      expect(agent).toBeDefined();
      
      // Should not throw error when fetching metrics
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics).toBeDefined();
    });

    it('should handle localStorage corruption recovery', async () => {
      // Create some agents first
      await service.createAgent('dreamer');
      await service.createAgent('analyst');
      
      // Corrupt localStorage with invalid JSON
      localStorageMock.store['axiom_factory_metrics'] = 'invalid-json-data';
      
      // Should handle corruption gracefully
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalAgentsCreated).toBe('number');
    });

    it('should handle localStorage quota exceeded errors', async () => {
      // Simulate quota exceeded error
      localStorageMock.setShouldFail(true, 'setItem', 'QuotaExceededError: Storage quota exceeded');
      
      // Should handle quota exceeded gracefully
      const agent = await service.createAgent('builder');
      expect(agent).toBeDefined();
      
      // Should continue functioning despite storage errors
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics).toBeDefined();
    });

    it('should recover from temporary localStorage failures', async () => {
      // Simulate temporary failure
      localStorageMock.setShouldFail(true, 'setItem', 'Temporary storage error');
      
      // Create agent during failure
      const agent1 = await service.createAgent('dreamer');
      expect(agent1).toBeDefined();
      
      // Restore localStorage functionality
      localStorageMock.setShouldFail(false);
      
      // Create another agent after recovery
      const agent2 = await service.createAgent('analyst');
      expect(agent2).toBeDefined();
      
      // Verify metrics are working correctly
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics.totalAgentsCreated).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Concurrent Operation Failures', () => {
    it('should handle concurrent agent creation failures', async () => {
      // Create multiple agents concurrently
      const createPromises = [];
      for (let i = 0; i < 10; i++) {
        createPromises.push(service.createAgent('dreamer'));
      }
      
      // All should succeed despite concurrency
      const agents = await Promise.all(createPromises);
      expect(agents).toHaveLength(10);
      
      // Verify all agents have unique IDs
      const agentIds = agents.map(agent => agent.id);
      const uniqueIds = new Set(agentIds);
      expect(uniqueIds.size).toBe(10);
    });

    it('should handle concurrent error injection and recovery', async () => {
      const agents = [];
      for (let i = 0; i < 5; i++) {
        agents.push(await service.createAgent('analyst'));
      }
      
      // Concurrent error injection
      const errorPromises = agents.map(agent => 
        Promise.resolve(service.simulateAgentError(agent.id, `Concurrent error ${agent.id}`))
      );
      const errorResults = await Promise.all(errorPromises);
      expect(errorResults.every(result => result === true)).toBe(true);
      
      // Concurrent recovery
      const recoveryPromises = agents.map(agent => 
        Promise.resolve(service.recoverAgent(agent.id))
      );
      const recoveryResults = await Promise.all(recoveryPromises);
      expect(recoveryResults.every(result => result === true)).toBe(true);
      
      // Verify all agents are recovered
      for (const agent of agents) {
        const status = await service.getAgentStatus(agent.id);
        expect(status?.status).toBe('soul_forge');
        expect(status?.error).toBeUndefined();
      }
    });

    it('should handle race conditions in metrics calculation', async () => {
      // Create multiple agents and fetch metrics concurrently
      const operations = [];
      for (let i = 0; i < 20; i++) {
        operations.push(service.createAgent('dreamer'));
        operations.push(service.fetchFactoryMetrics());
      }
      
      // All operations should complete without errors
      const results = await Promise.all(operations);
      expect(results).toHaveLength(40);
      
      // Verify metrics consistency
      const metricsResults = results.filter(r => typeof r === 'object' && 'totalAgentsCreated' in r);
      expect(metricsResults.length).toBeGreaterThan(0);
      
      metricsResults.forEach(metrics => {
        expect(typeof metrics.totalAgentsCreated).toBe('number');
        expect(metrics.totalAgentsCreated).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Timeout and Recovery Scenarios', () => {
    it('should handle long-running operations without timeout', async () => {
      // Create agent and let it run through all stages
      const agent = await service.createAgent('builder');
      
      // Mock Math.random to prevent random errors
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      try {
        // Simulate long running operation
        let currentAgent = agent;
        let iterations = 0;
        const maxIterations = 50; // Prevent infinite loop
        
        while (currentAgent.status !== 'completed' && iterations < maxIterations) {
          jest.advanceTimersByTime(1000);
          currentAgent = await service.getAgentStatus(agent.id);
          iterations++;
        }
        
        // Should complete eventually
        expect(currentAgent.status).toBe('completed');
      } finally {
        Math.random = originalRandom;
      }
    });

    it('should handle simulation interruption and restart', async () => {
      const agent = await service.createAgent('judge');
      
      // Let simulation run for a bit
      jest.advanceTimersByTime(2000);
      
      // Stop simulation
      service.stopSimulation();
      
      // Agent should still be accessible
      const stoppedAgent = await service.getAgentStatus(agent.id);
      expect(stoppedAgent).toBeDefined();
      
      // Restart simulation
      service.startSimulation();
      
      // Should continue from where it left off
      jest.advanceTimersByTime(2000);
      const restartedAgent = await service.getAgentStatus(agent.id);
      expect(restartedAgent).toBeDefined();
      expect(restartedAgent?.progress).toBeGreaterThanOrEqual(stoppedAgent?.progress || 0);
    });

    it('should handle rapid state changes without corruption', async () => {
      const agent = await service.createAgent('dreamer');
      
      // Rapidly inject and recover from errors
      for (let i = 0; i < 10; i++) {
        service.simulateAgentError(agent.id, `Rapid error ${i}`);
        jest.advanceTimersByTime(100);
        
        service.recoverAgent(agent.id);
        jest.advanceTimersByTime(100);
      }
      
      // Final state should be consistent
      const finalAgent = await service.getAgentStatus(agent.id);
      expect(finalAgent?.status).toBe('soul_forge');
      expect(finalAgent?.error).toBeUndefined();
      expect(finalAgent?.progress).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory and Resource Management', () => {
    it('should clean up completed agents after timeout', async () => {
      const agent = await service.createAgent('analyst');
      
      // Mock Math.random to prevent random errors
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      try {
        // Let agent complete
        let currentAgent = agent;
        while (currentAgent.status !== 'completed') {
          jest.advanceTimersByTime(2000);
          currentAgent = await service.getAgentStatus(agent.id);
        }
        
        // Fast forward past cleanup timeout (5 minutes)
        jest.advanceTimersByTime(6 * 60 * 1000);
        
        // Agent should be cleaned up
        const cleanedAgent = await service.getAgentStatus(agent.id);
        expect(cleanedAgent).toBeNull();
        
        // Should not affect metrics
        const metrics = await service.fetchFactoryMetrics();
        expect(metrics.completedAgents).toBeGreaterThanOrEqual(0);
      } finally {
        Math.random = originalRandom;
      }
    });

    it('should handle memory pressure scenarios', async () => {
      // Create many agents to simulate memory pressure
      const agents = [];
      for (let i = 0; i < 100; i++) {
        agents.push(await service.createAgent('dreamer'));
      }
      
      // Should handle large number of agents
      expect(agents).toHaveLength(100);
      
      // Metrics should still be accurate
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics.activeAgents).toBe(100);
      
      // Cleanup should work correctly
      service.stopSimulation();
      service.resetFactory();
      
      const allAgents = service.getAllAgents();
      expect(allAgents).toHaveLength(0);
    });
  });

  describe('Error Logging and Monitoring', () => {
    it('should log errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate localStorage error
      localStorageMock.setShouldFail(true, 'setItem', 'Test logging error');
      
      await service.createAgent('dreamer');
      
      // Should log warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle error monitoring during metrics calculation', async () => {
      const agent = await service.createAgent('builder');
      
      // Inject error
      service.simulateAgentError(agent.id, 'Monitoring test error');
      
      // Metrics should reflect error state
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics.failedAgents).toBeGreaterThanOrEqual(1);
      expect(metrics.efficiency).toBeLessThan(100);
    });
  });
});

/**
 * Integration tests for complete error handling workflows
 */
describe('SmartFactoryService Error Handling Integration', () => {
  let service: SmartFactoryService;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    smartFactoryService.stopSimulation();
    service = new SmartFactoryService();
    
    localStorageMock.setShouldFail(false);
    networkSimulator.setShouldFail(false);
  });

  afterEach(() => {
    service.stopSimulation();
    jest.runAllTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should handle complete error recovery workflow', async () => {
    // Create multiple agents
    const agents = [];
    for (let i = 0; i < 5; i++) {
      agents.push(await service.createAgent('dreamer'));
    }
    
    // Simulate various error scenarios
    service.simulateAgentError(agents[0].id, 'Critical error');
    service.simulateAgentError(agents[1].id, 'Timeout error');
    service.simulateAgentError(agents[2].id, 'Network error');
    
    // Verify error states
    for (let i = 0; i < 3; i++) {
      const status = await service.getAgentStatus(agents[i].id);
      expect(status?.status).toBe('error');
    }
    
    // Recover all failed agents
    const recoveryResults = [];
    for (let i = 0; i < 3; i++) {
      recoveryResults.push(service.recoverAgent(agents[i].id));
    }
    
    expect(recoveryResults.every(result => result === true)).toBe(true);
    
    // Verify recovery
    for (let i = 0; i < 3; i++) {
      const status = await service.getAgentStatus(agents[i].id);
      expect(status?.status).toBe('soul_forge');
      expect(status?.error).toBeUndefined();
    }
    
    // Verify final metrics
    const finalMetrics = await service.fetchFactoryMetrics();
    expect(finalMetrics.failedAgents).toBe(0);
    expect(finalMetrics.efficiency).toBe(100);
  });

  it('should handle cascading failure scenarios', async () => {
    // Simulate localStorage failure during agent creation
    localStorageMock.setShouldFail(true, 'setItem', 'Cascading failure');
    
    const agents = [];
    for (let i = 0; i < 10; i++) {
      agents.push(await service.createAgent('analyst'));
    }
    
    // All agents should be created despite storage failures
    expect(agents).toHaveLength(10);
    
    // Restore localStorage
    localStorageMock.setShouldFail(false);
    
    // Inject errors in some agents
    for (let i = 0; i < 5; i++) {
      service.simulateAgentError(agents[i].id, `Cascading error ${i}`);
    }
    
    // Recover all agents
    for (let i = 0; i < 5; i++) {
      service.recoverAgent(agents[i].id);
    }
    
    // System should be fully recovered
    const metrics = await service.fetchFactoryMetrics();
    expect(metrics.failedAgents).toBe(0);
    
    // All agents should be in valid state
    for (const agent of agents) {
      const status = await service.getAgentStatus(agent.id);
      expect(status?.status).toMatch(/^(soul_forge|identity_mint|equipping|delivery_dock)$/);
    }
  });
});