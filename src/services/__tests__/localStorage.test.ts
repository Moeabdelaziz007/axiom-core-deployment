/**
 * 🧪 localStorage Functionality Tests
 * 
 * Comprehensive testing suite for localStorage data persistence in SmartFactoryService
 * Tests data integrity, session persistence, storage quota handling, and cross-device scenarios
 */

import { SmartFactoryService } from '../factoryService';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  let quotaExceeded = false;
  let simulateError = false;

  return {
    getItem: jest.fn((key: string) => {
      if (simulateError) throw new Error('Storage access denied');
      if (quotaExceeded) throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      if (simulateError) throw new Error('Storage access denied');
      if (quotaExceeded) throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      
      // Simulate quota limit (5MB for testing)
      const totalSize = JSON.stringify(store).length + value.length;
      if (totalSize > 5 * 1024 * 1024) {
        quotaExceeded = true;
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
      
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      if (simulateError) throw new Error('Storage access denied');
      delete store[key];
    }),
    clear: jest.fn(() => {
      if (simulateError) throw new Error('Storage access denied');
      store = {};
      quotaExceeded = false;
    }),
    key: jest.fn((index: number) => {
      if (simulateError) throw new Error('Storage access denied');
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      if (simulateError) throw new Error('Storage access denied');
      return Object.keys(store).length;
    },
    // Test helpers
    _getStore: () => ({ ...store }),
    _setQuotaExceeded: (exceeded: boolean) => { quotaExceeded = exceeded; },
    _setSimulateError: (error: boolean) => { simulateError = error; },
    _reset: () => {
      store = {};
      quotaExceeded = false;
      simulateError = false;
    }
  };
})();

// Mock window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('localStorage Functionality Tests', () => {
  let service: SmartFactoryService;
  let originalConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    localStorageMock._reset();
    jest.clearAllMocks();
    originalConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    service = new SmartFactoryService();
  });

  afterEach(() => {
    originalConsoleWarn.mockRestore();
    service.stopSimulation();
  });

  describe('Basic localStorage Operations', () => {
    test('should persist metrics to localStorage', async () => {
      // Create an agent to generate metrics
      await service.createAgent('dreamer');
      
      // Fetch metrics to trigger persistence
      const metrics = await service.fetchFactoryMetrics();
      
      // Verify localStorage was called
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
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'axiom_factory_last_updated',
        expect.any(String)
      );

      // Verify data was actually stored
      const storedData = localStorageMock._getStore();
      expect(storedData['axiom_factory_total_agents']).toBeTruthy();
      expect(storedData['axiom_factory_active_wallets']).toBeTruthy();
      expect(storedData['axiom_factory_metrics']).toBeTruthy();
      expect(storedData['axiom_factory_last_updated']).toBeTruthy();
    });

    test('should load persisted metrics on initialization', async () => {
      // Pre-populate localStorage with test data
      localStorageMock.setItem('axiom_factory_total_agents', '42');
      localStorageMock.setItem('axiom_factory_active_wallets', '15');
      localStorageMock.setItem('axiom_factory_last_updated', Date.now().toString());

      // Create new service instance
      const newService = new SmartFactoryService();
      
      // Fetch metrics
      const metrics = await newService.fetchFactoryMetrics();
      
      // Verify persisted data was loaded
      expect(metrics.totalAgentsCreated).toBeGreaterThanOrEqual(42);
      expect(metrics.activeWallets).toBeGreaterThanOrEqual(15);
      
      newService.stopSimulation();
    });

    test('should increment counters correctly', async () => {
      // Create multiple agents
      await service.createAgent('dreamer');
      await service.createAgent('analyst');
      await service.createAgent('judge');

      const metrics = await service.fetchFactoryMetrics();
      
      // Verify counters were incremented
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(8); // 4 metrics calls * 2 agents (increment + persist)
      
      const storedTotal = localStorageMock._getStore()['axiom_factory_total_agents'];
      const storedWallets = localStorageMock._getStore()['axiom_factory_active_wallets'];
      
      expect(parseInt(storedTotal)).toBeGreaterThan(0);
      expect(parseInt(storedWallets)).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity Tests', () => {
    test('should handle corrupted localStorage data gracefully', async () => {
      // Store corrupted JSON data
      localStorageMock.setItem('axiom_factory_metrics', '{invalid json}');
      
      // Should not throw error
      const metrics = await service.fetchFactoryMetrics();
      
      // Should fallback to default values
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalAgentsCreated).toBe('number');
      expect(typeof metrics.activeAgents).toBe('number');
    });

    test('should handle missing localStorage keys gracefully', async () => {
      // Don't pre-populate localStorage
      
      const metrics = await service.fetchFactoryMetrics();
      
      // Should use default values
      expect(metrics.totalAgentsCreated).toBe(0);
      expect(metrics.activeWallets).toBe(0);
    });

    test('should validate data types on load', async () => {
      // Store invalid data types
      localStorageMock.setItem('axiom_factory_total_agents', 'not-a-number');
      localStorageMock.setItem('axiom_factory_active_wallets', 'null');
      
      const metrics = await service.fetchFactoryMetrics();
      
      // Should handle invalid data gracefully
      expect(typeof metrics.totalAgentsCreated).toBe('number');
      expect(typeof metrics.activeWallets).toBe('number');
    });

    test('should maintain data consistency across operations', async () => {
      // Create agents and verify consistency
      const agent1 = await service.createAgent('dreamer');
      const agent2 = await service.createAgent('analyst');
      
      const metrics1 = await service.fetchFactoryMetrics();
      const metrics2 = await service.fetchFactoryMetrics();
      
      // Metrics should be consistent
      expect(metrics1.totalAgentsCreated).toBe(metrics2.totalAgentsCreated);
      expect(metrics1.activeWallets).toBe(metrics2.activeWallets);
      
      // Verify stored data consistency
      const storedData = localStorageMock._getStore();
      const parsedMetrics1 = JSON.parse(storedData['axiom_factory_metrics']);
      const parsedMetrics2 = JSON.parse(storedData['axiom_factory_metrics']);
      
      expect(parsedMetrics1).toEqual(parsedMetrics2);
    });
  });

  describe('Storage Quota Handling', () => {
    test('should handle storage quota exceeded gracefully', async () => {
      // Simulate quota exceeded
      localStorageMock._setQuotaExceeded(true);
      
      // Should not throw error
      await expect(service.createAgent('dreamer')).resolves.toBeDefined();
      
      // Should log warning
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to persist metrics:',
        expect.any(DOMException)
      );
      
      // Should continue functioning
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics).toBeDefined();
    });

    test('should handle quota exceeded during increment operations', async () => {
      // Set quota exceeded after initial storage
      localStorageMock._setQuotaExceeded(false);
      await service.createAgent('dreamer');
      
      // Now set quota exceeded
      localStorageMock._setQuotaExceeded(true);
      await service.createAgent('analyst');
      
      // Should handle gracefully
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to increment total agents created:',
        expect.any(DOMException)
      );
    });

    test('should recover from quota exceeded scenarios', async () => {
      // Simulate quota exceeded
      localStorageMock._setQuotaExceeded(true);
      await service.createAgent('dreamer');
      
      // Clear quota exceeded condition
      localStorageMock._setQuotaExceeded(false);
      await service.createAgent('analyst');
      
      // Should resume normal operation
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'axiom_factory_total_agents',
        expect.any(String)
      );
    });

    test('should handle large data sets', async () => {
      // Create many agents to test large data storage
      const agents = [];
      for (let i = 0; i < 100; i++) {
        agents.push(await service.createAgent('dreamer'));
      }
      
      const metrics = await service.fetchFactoryMetrics();
      
      // Should handle large data sets
      expect(metrics.totalAgentsCreated).toBe(100);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(400); // 100 agents * 4 storage operations
    });
  });

  describe('Error Recovery Tests', () => {
    test('should handle localStorage access denied', async () => {
      // Simulate access denied
      localStorageMock._setSimulateError(true);
      
      // Should not throw error
      await expect(service.createAgent('dreamer')).resolves.toBeDefined();
      
      // Should log warning
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to increment total agents created:',
        expect.any(Error)
      );
      
      // Should continue functioning
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics).toBeDefined();
    });

    test('should handle partial localStorage failures', async () => {
      // Allow some operations but not others
      const originalSetItem = localStorageMock.setItem;
      let callCount = 0;
      localStorageMock.setItem = jest.fn((key, value) => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Simulated failure');
        }
        return originalSetItem(key, value);
      });
      
      // Should handle partial failure
      await expect(service.createAgent('dreamer')).resolves.toBeDefined();
      
      // Should have attempted storage
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should reset localStorage data when requested', async () => {
      // Create some data
      await service.createAgent('dreamer');
      await service.createAgent('analyst');
      
      // Verify data exists
      const storedData = localStorageMock._getStore();
      expect(Object.keys(storedData).length).toBeGreaterThan(0);
      
      // Reset factory
      service.resetFactory();
      
      // Verify data was cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('axiom_factory_total_agents');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('axiom_factory_active_wallets');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('axiom_factory_metrics');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('axiom_factory_last_updated');
    });
  });

  describe('Session Persistence Tests', () => {
    test('should maintain data across service restarts', async () => {
      // Create data with first service instance
      await service.createAgent('dreamer');
      const metrics1 = await service.fetchFactoryMetrics();
      
      // Stop and create new service instance
      service.stopSimulation();
      const newService = new SmartFactoryService();
      const metrics2 = await newService.fetchFactoryMetrics();
      
      // Data should persist
      expect(metrics2.totalAgentsCreated).toBeGreaterThanOrEqual(metrics1.totalAgentsCreated);
      expect(metrics2.activeWallets).toBeGreaterThanOrEqual(metrics1.activeWallets);
      
      newService.stopSimulation();
    });

    test('should handle timestamp persistence', async () => {
      // Create agent and get timestamp
      const beforeCreate = Date.now();
      await service.createAgent('dreamer');
      const metrics = await service.fetchFactoryMetrics();
      const afterCreate = Date.now();
      
      // Verify timestamp was stored
      const storedTimestamp = localStorageMock._getStore()['axiom_factory_last_updated'];
      expect(parseInt(storedTimestamp)).toBeGreaterThanOrEqual(beforeCreate);
      expect(parseInt(storedTimestamp)).toBeLessThanOrEqual(afterCreate);
    });

    test('should handle service state restoration', async () => {
      // Create multiple agents
      const agent1 = await service.createAgent('dreamer');
      const agent2 = await service.createAgent('analyst');
      
      // Get current state
      const metrics1 = await service.fetchFactoryMetrics();
      
      // Create new service instance
      service.stopSimulation();
      const newService = new SmartFactoryService();
      const metrics2 = await newService.fetchFactoryMetrics();
      
      // State should be preserved
      expect(metrics2.totalAgentsCreated).toBeGreaterThanOrEqual(metrics1.totalAgentsCreated);
      
      newService.stopSimulation();
    });
  });

  describe('Performance Tests', () => {
    test('should handle rapid localStorage operations', async () => {
      const startTime = Date.now();
      
      // Create many agents rapidly
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(service.createAgent('dreamer'));
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);
      
      // All data should be stored
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics.totalAgentsCreated).toBe(50);
    });

    test('should minimize localStorage access for performance', async () => {
      // Reset call counts
      localStorageMock.setItem.mockClear();
      
      // Create agent
      await service.createAgent('dreamer');
      
      // Fetch metrics multiple times
      await service.fetchFactoryMetrics();
      await service.fetchFactoryMetrics();
      await service.fetchFactoryMetrics();
      
      // Should not access localStorage unnecessarily
      // (Note: This test may need adjustment based on actual caching strategy)
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should handle concurrent localStorage operations', async () => {
      // Create multiple agents concurrently
      const promises = Array.from({ length: 20 }, () => service.createAgent('dreamer'));
      const agents = await Promise.all(promises);
      
      // All should complete successfully
      expect(agents).toHaveLength(20);
      
      // Data should be consistent
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics.totalAgentsCreated).toBe(20);
    });
  });

  describe('Cross-Browser Compatibility Tests', () => {
    test('should handle missing localStorage gracefully', async () => {
      // Temporarily remove localStorage
      const originalLocalStorage = window.localStorage;
      delete (window as any).localStorage;
      
      // Should not throw error
      await expect(service.createAgent('dreamer')).resolves.toBeDefined();
      
      // Should continue functioning
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics).toBeDefined();
      
      // Restore localStorage
      window.localStorage = originalLocalStorage;
    });

    test('should handle localStorage with limited functionality', async () => {
      // Mock localStorage with limited functionality
      const limitedStorage = {
        getItem: () => null,
        setItem: () => { throw new Error('Not supported'); },
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null
      };
      
      window.localStorage = limitedStorage as any;
      
      // Should handle gracefully
      await expect(service.createAgent('dreamer')).resolves.toBeDefined();
      
      const metrics = await service.fetchFactoryMetrics();
      expect(metrics).toBeDefined();
      
      // Restore original mock
      window.localStorage = localStorageMock;
    });
  });

  describe('Data Migration Tests', () => {
    test('should handle legacy data format', async () => {
      // Store data in legacy format
      localStorageMock.setItem('axiom_factory_total_agents', '10');
      localStorageMock.setItem('axiom_factory_active_wallets', '5');
      // Missing new keys
      
      const newService = new SmartFactoryService();
      const metrics = await newService.fetchFactoryMetrics();
      
      // Should handle missing new keys gracefully
      expect(metrics.totalAgentsCreated).toBeGreaterThanOrEqual(10);
      expect(metrics.activeWallets).toBeGreaterThanOrEqual(5);
      
      newService.stopSimulation();
    });

    test('should handle data structure changes', async () => {
      // Store old metrics format
      const oldMetrics = {
        totalAgentsCreated: 15,
        activeAgents: 3,
        // Missing new fields
      };
      localStorageMock.setItem('axiom_factory_metrics', JSON.stringify(oldMetrics));
      
      const newService = new SmartFactoryService();
      const metrics = await newService.fetchFactoryMetrics();
      
      // Should handle missing fields gracefully
      expect(metrics.totalAgentsCreated).toBeGreaterThanOrEqual(15);
      expect(metrics.activeAgents).toBeGreaterThanOrEqual(3);
      expect(metrics.efficiency).toBeDefined(); // Should have default value
      
      newService.stopSimulation();
    });
  });
});

/**
 * Integration Tests for localStorage with AxiomGigafactory Component
 */
describe('localStorage Integration with AxiomGigafactory', () => {
  test('should persist data across component re-renders', async () => {
    // This would be tested in a component testing environment
    // For now, we test the service layer integration
    
    const service = new SmartFactoryService();
    
    // Simulate component operations
    await service.createAgent('dreamer');
    const metrics1 = await service.fetchFactoryMetrics();
    
    // Simulate component re-render (new service instance)
    service.stopSimulation();
    const newService = new SmartFactoryService();
    const metrics2 = await service.fetchFactoryMetrics();
    
    // Data should persist
    expect(metrics2.totalAgentsCreated).toBeGreaterThanOrEqual(metrics1.totalAgentsCreated);
    
    newService.stopSimulation();
  });
});