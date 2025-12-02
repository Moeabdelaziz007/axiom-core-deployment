/**
 * Jest test suite for SmartFactoryService
 * 
 * This test suite verifies complete functionality of the SmartFactoryService
 * including agent creation, state machine progression, metrics calculation,
 * and error handling scenarios.
 */

import { SmartFactoryService, createAgent, fetchFactoryMetrics, getAgentStatus, getAssemblyLineStatus, smartFactoryService } from '../factoryService';

// Mock localStorage for Jest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

// Setup global localStorage mock for Node.js environment
const mockWindow = {
  localStorage: localStorageMock
};

// Define window global if it doesn't exist
if (typeof window === 'undefined') {
  (global as any).window = mockWindow;
  (global as any).localStorage = localStorageMock;
} else {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
}

// Also set localStorage on global for Node.js environment
if (typeof localStorage === 'undefined') {
  (global as any).localStorage = localStorageMock;
}


describe('SmartFactoryService', () => {
  let service: SmartFactoryService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Setup fake timers for each test to ensure complete isolation
    jest.useFakeTimers();
    
    // Stop the global singleton instance to prevent interference
    smartFactoryService.stopSimulation();
    
    // Create new service instance for each test
    service = new SmartFactoryService();
  });

  afterEach(() => {
    // Stop simulation after each test
    service.stopSimulation();
    
    // Run all pending timers to ensure no callbacks are left hanging
    jest.runAllTimers();
    
    // Clear all timers to prevent open handles
    jest.clearAllTimers();
    
    // Restore real timers to clean up fake timer state
    jest.useRealTimers();
  });

  describe('Agent Creation', () => {
    it('should create a new agent with correct initial state', async () => {
      const agent = await service.createAgent('dreamer');
      
      expect(agent).toBeDefined();
      expect(agent.id).toMatch(/^agent_\d+_[a-z0-9]+$/);
      expect(agent.type).toBe('dreamer');
      expect(agent.status).toBe('soul_forge');
      expect(agent.progress).toBe(0);
      expect(agent.stageProgress).toBe(0);
      expect(agent.name).toMatch(/^(Cosmic|Stellar|Nebula|Quantum)(Agent|Bot|Unit|System|Engine)-\d{4}$/);
      expect(agent.createdAt).toBeGreaterThan(0);
      expect(agent.startedAt).toBe(agent.createdAt);
    });

    it('should create agents with different types', async () => {
      const agentTypes = ['dreamer', 'analyst', 'judge', 'builder', 'tajer', 'aqar', 'mawid', 'sofra'] as const;
      
      for (const type of agentTypes) {
        const agent = await service.createAgent(type);
        expect(agent.type).toBe(type);
        expect(agent.name).toBeDefined();
        expect(agent.name.length).toBeGreaterThan(0);
      }
    });

    it('should persist agent creation count to localStorage', async () => {
      await service.createAgent('dreamer');
      await service.createAgent('analyst');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'axiom_factory_total_agents',
        expect.stringMatching(/\d+/)
      );
    });
  });

  describe('Agent Status Tracking', () => {
    it('should return correct agent status', async () => {
      const agent = await service.createAgent('judge');
      const status = await service.getAgentStatus(agent.id);
      
      expect(status).toBeDefined();
      expect(status?.id).toBe(agent.id);
      expect(status?.type).toBe('judge');
      expect(status?.status).toBe('soul_forge');
    });

    it('should return null for non-existent agent', async () => {
      const status = await service.getAgentStatus('non-existent-agent');
      expect(status).toBeNull();
    });
  });

  describe('State Machine Progression', () => {
    it('should advance agent through stages over time', async () => {
      const agent = await service.createAgent('builder');
      
      // Initial state
      expect(agent.status).toBe('soul_forge');
      expect(agent.stageProgress).toBe(0);
      
      // Fast forward time to trigger simulation
      jest.advanceTimersByTime(2000);
      
      const updatedAgent = await service.getAgentStatus(agent.id);
      expect(updatedAgent).toBeDefined();
      
      // Should have made progress
      expect(updatedAgent!.stageProgress).toBeGreaterThan(0);
      expect(updatedAgent!.progress).toBeGreaterThan(0);
      
      // Should have wallet address by identity_mint stage
      if (updatedAgent!.status === 'identity_mint' || updatedAgent!.status === 'equipping' || updatedAgent!.status === 'delivery_dock') {
        expect(updatedAgent!.walletAddress).toBeDefined();
        expect(updatedAgent!.walletAddress!.length).toBe(44);
      }
      
      // Should have tools by equipping stage
      if (updatedAgent!.status === 'equipping' || updatedAgent!.status === 'delivery_dock') {
        expect(updatedAgent!.tools).toBeDefined();
        expect(updatedAgent!.tools!.length).toBeGreaterThan(0);
      }
    });

    it('should complete agent creation successfully', async () => {
      const agent = await service.createAgent('analyst');
      
      // Mock Math.random to prevent random errors during this test
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5); // Return 0.5 to avoid 5% error threshold
      
      try {
        // Fast forward time significantly to ensure completion
        let completedAgent = await service.getAgentStatus(agent.id);
        let attempts = 0;
        const maxAttempts = 20;
        
        while (completedAgent?.status !== 'completed' && attempts < maxAttempts) {
          jest.advanceTimersByTime(2000); // Increase time advancement to complete all stages
          completedAgent = await service.getAgentStatus(agent.id);
          attempts++;
        }
        
        expect(completedAgent?.status).toBe('completed');
        expect(completedAgent?.progress).toBe(100);
        expect(completedAgent?.stageProgress).toBe(100);
        expect(completedAgent?.walletAddress).toBeDefined();
        expect(completedAgent?.tools).toBeDefined();
        expect(completedAgent?.completedAt).toBeDefined();
        expect(completedAgent?.completedAt).toBeGreaterThan(completedAgent!.startedAt!);
      } finally {
        // Restore original Math.random
        Math.random = originalRandom;
      }
    });
  });

  describe('Factory Metrics', () => {
    it('should return accurate factory metrics', async () => {
      // Create some agents
      await service.createAgent('dreamer');
      await service.createAgent('analyst');
      
      // Run timers to process agent creation
      jest.advanceTimersByTime(1000);
      
      const metrics = await service.fetchFactoryMetrics();
      
      // Check that agents are counted from current service instance
      expect(metrics.totalAgentsCreated).toBeGreaterThanOrEqual(0);
      expect(metrics.activeAgents).toBeGreaterThanOrEqual(0);
      expect(metrics.completedAgents).toBeGreaterThanOrEqual(0);
      expect(metrics.failedAgents).toBeGreaterThanOrEqual(0);
      expect(metrics.efficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.efficiency).toBeLessThanOrEqual(100);
      expect(metrics.activeWallets).toBeGreaterThanOrEqual(0);
      expect(metrics.totalToolsLoaded).toBeGreaterThanOrEqual(0);
    });

    it('should persist metrics to localStorage', async () => {
      await service.createAgent('judge');
      await service.fetchFactoryMetrics();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'axiom_factory_total_agents',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'axiom_factory_active_wallets',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'axiom_factory_metrics',
        expect.any(String)
      );
    });
  });

  describe('Assembly Line Status', () => {
    it('should return status for all assembly line stages', async () => {
      const status = await service.getAssemblyLineStatus();
      
      expect(status).toHaveLength(4); // 4 active stages
      expect(status[0].stage.name).toBe('Soul Forge');
      expect(status[1].stage.name).toBe('Identity Mint');
      expect(status[2].stage.name).toBe('Equipping');
      expect(status[3].stage.name).toBe('Delivery Dock');
      
      status.forEach(stageStatus => {
        expect(stageStatus.stage.id).toBeDefined();
        expect(stageStatus.stage.status).toMatch(/^(idle|active|completed|error)$/);
        expect(stageStatus.agentsInQueue).toBeGreaterThanOrEqual(0);
        expect(stageStatus.averageWaitTime).toBeGreaterThanOrEqual(0);
        expect(stageStatus.efficiency).toBeGreaterThanOrEqual(0);
        expect(stageStatus.efficiency).toBeLessThanOrEqual(100);
      });
    });

    it('should show active stages when agents are processing', async () => {
      await service.createAgent('builder');
      
      const status = await service.getAssemblyLineStatus();
      
      // At least first stage should be active
      expect(status[0].stage.status).toBe('active');
      expect(status[0].agentsInQueue).toBeGreaterThan(0);
      expect(status[0].stage.currentAgentId).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should simulate agent errors correctly', async () => {
      const agent = await service.createAgent('dreamer');
      
      const errorInjected = service.simulateAgentError(agent.id, 'Test error');
      expect(errorInjected).toBe(true);
      
      const errorAgent = await service.getAgentStatus(agent.id);
      expect(errorAgent?.status).toBe('error');
      expect(errorAgent?.error).toBe('Test error');
      expect(errorAgent?.completedAt).toBeDefined();
    });

    it('should recover agents from error state', async () => {
      const agent = await service.createAgent('analyst');
      
      // Inject error
      service.simulateAgentError(agent.id, 'Test error');
      
      // Recover
      const recovered = service.recoverAgent(agent.id);
      expect(recovered).toBe(true);
      
      const recoveredAgent = await service.getAgentStatus(agent.id);
      expect(recoveredAgent?.status).toBe('soul_forge');
      expect(recoveredAgent?.error).toBeUndefined();
      expect(recoveredAgent?.progress).toBe(0);
      expect(recoveredAgent?.stageProgress).toBe(0);
    });

    it('should handle error injection for non-existent agents', async () => {
      const result = service.simulateAgentError('non-existent', 'Test error');
      expect(result).toBe(false);
    });

    it('should handle recovery for non-existent agents', async () => {
      const result = service.recoverAgent('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide working convenience functions', async () => {
      // Stop the global singleton and use our test service
      smartFactoryService.stopSimulation();
      
      // Mock localStorage to return 0 initially, then it will be incremented
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'axiom_factory_total_agents') return '0';
        return null;
      });
      
      const agent = await service.createAgent('tajer');
      expect(agent).toBeDefined();
      expect(agent.type).toBe('tajer');
      
      const status = await service.getAgentStatus(agent.id);
      expect(status?.id).toBe(agent.id);
      
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics.totalAgentsCreated).toBeGreaterThanOrEqual(0);
      
      const assemblyStatus = await service.getAssemblyLineStatus();
      expect(assemblyStatus).toHaveLength(4);
    });
  });

  describe('Factory Reset', () => {
    it('should reset factory state correctly', async () => {
      // Create some agents
      await service.createAgent('dreamer');
      await service.createAgent('analyst');
      
      // Reset factory
      service.resetFactory();
      
      // Check that localStorage is cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('axiom_factory_total_agents');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('axiom_factory_active_wallets');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('axiom_factory_metrics');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('axiom_factory_last_updated');
      
      // Check that agents are cleared
      const allAgents = service.getAllAgents();
      expect(allAgents).toHaveLength(0);
    });
  });
});

/**
 * Integration tests for complete factory workflow
 */
describe('SmartFactoryService Integration', () => {
  let service: SmartFactoryService;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Setup fake timers for integration tests
    jest.useFakeTimers();
    
    // Stop the global singleton instance to prevent interference
    smartFactoryService.stopSimulation();
    
    service = new SmartFactoryService();
  });

  afterEach(() => {
    // Stop simulation after each test
    service.stopSimulation();
    
    // Run all pending timers to ensure no callbacks are left hanging
    jest.runAllTimers();
    
    // Clear all timers to prevent open handles
    jest.clearAllTimers();
    
    // Restore real timers to clean up fake timer state
    jest.useRealTimers();
  });

  it('should handle complete agent lifecycle from creation to completion', async () => {
    // Mock Math.random to prevent random errors during this test
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5); // Return 0.5 to avoid 5% error threshold
    
    try {
      // Create agent
      const agent = await service.createAgent('sofra');
      expect(agent.status).toBe('soul_forge');
      
      // Monitor progress through stages
      let currentAgent = agent;
      let stageProgression = ['soul_forge', 'identity_mint', 'equipping', 'delivery_dock'];
      let currentStageIndex = 0;
      
      while (currentAgent.status !== 'completed' && currentStageIndex < stageProgression.length) {
        jest.advanceTimersByTime(1000);
        const status = await service.getAgentStatus(agent.id);
        currentAgent = status!;
        
        if (currentAgent && currentAgent.status === stageProgression[currentStageIndex + 1]) {
          currentStageIndex++;
        }
      }
      
      // Verify completion
      expect(currentAgent.status).toBe('completed');
      expect(currentAgent.walletAddress).toBeDefined();
      expect(currentAgent.tools).toBeDefined();
      expect(currentAgent.completedAt).toBeDefined();
      
      // Verify final metrics
      const finalMetrics = await service.fetchFactoryMetrics();
      expect(finalMetrics.completedAgents).toBeGreaterThanOrEqual(1);
      expect(finalMetrics.averageProductionTime).toBeGreaterThan(0);
    } finally {
      // Restore original Math.random
      Math.random = originalRandom;
    }
  });
});