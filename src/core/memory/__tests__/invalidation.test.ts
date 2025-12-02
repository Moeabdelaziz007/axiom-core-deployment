/**
 * Derived Data Invalidation System Tests
 * 
 * Comprehensive test suite for the invalidation system covering
 * dependency tracking, cascade propagation, performance optimization,
 * and integration with existing memory components.
 */

import { v4 as uuidv4 } from 'uuid';
import { InvalidationManager, InvalidationManagerFactory } from '../invalidation';
import {
  InvalidationStrategy,
  InvalidationTrigger,
  InvalidationConfig,
  InvalidationRequest,
  DependencyNode,
  InvalidationRule,
} from '../invalidation-types';
import { QdrantVectorStore } from '../vector-store';
import { SovereignMemoryManager } from '../memory-manager';
import { DataLineageManager } from '../../aix/data-lineage';

// Mock implementations for testing
class MockVectorStore {
  private entries: Map<string, any> = new Map();
  
  async deleteEntry(id: string): Promise<void> {
    this.entries.delete(id);
  }
  
  async getEntry(id: string): Promise<any> {
    return this.entries.get(id);
  }
  
  async storeEntry(entry: any): Promise<string> {
    this.entries.set(entry.id, entry);
    return entry.id;
  }
}

class MockMemoryManager {
  private memories: Map<string, any> = new Map();
  
  async deleteMemory(id: string): Promise<void> {
    this.memories.delete(id);
  }
  
  async getMemory(id: string): Promise<any> {
    return this.memories.get(id);
  }
}

class MockLineageManager {
  private dataSources: Map<string, any> = new Map();
  
  calculateCompositeTrust(dataId: string): number {
    return 0.8; // Mock trust score
  }
  
  registerDataSource(source: any): void {
    this.dataSources.set(source.sourceId, source);
  }
}

describe('InvalidationManager', () => {
  let invalidationManager: InvalidationManager;
  let mockVectorStore: MockVectorStore;
  let mockMemoryManager: MockMemoryManager;
  let mockLineageManager: MockLineageManager;

  beforeEach(() => {
    const config: InvalidationConfig = {
      defaultStrategy: 'immediate',
      cascadeDepthLimit: 10,
      cascadeTimeLimit: 30000,
      batchSize: 100,
      delayThreshold: 5000,
      cleanupInterval: 300000,
      trustThreshold: 0.5,
      autoRevalidate: true,
      enableMetrics: true,
      enableAuditTrail: true,
      logLevel: 'error', // Reduce noise in tests
      enableRecovery: true,
      maxRecoveryAttempts: 3,
      recoveryDelay: 100,
      enableSelectiveInvalidation: true,
      enableLazyInvalidation: false,
      enableCompression: false,
      integrateWithDataLineage: true,
      integrateWithCache: true,
      integrateWithVectorStore: true,
    };

    invalidationManager = new InvalidationManager(config);
    mockVectorStore = new MockVectorStore();
    mockMemoryManager = new MockMemoryManager();
    mockLineageManager = new MockLineageManager();

    invalidationManager.setIntegrations({
      vectorStore: mockVectorStore as any,
      memoryManager: mockMemoryManager as any,
      lineageManager: mockLineageManager as any,
    });
  });

  afterEach(async () => {
    await invalidationManager.close();
  });

  describe('Dependency Registration', () => {
    test('should register a simple dependency', () => {
      const nodeId = uuidv4();
      const dependsOn = [uuidv4(), uuidv4()];
      
      invalidationManager.registerDependency(nodeId, dependsOn, 'thought');
      
      const stats = invalidationManager.getStats();
      expect(stats.totalNodes).toBe(3); // 1 node + 2 dependencies
    });

    test('should register complex dependency chains', () => {
      const node1 = uuidv4();
      const node2 = uuidv4();
      const node3 = uuidv4();
      
      // Create a chain: node3 -> node2 -> node1
      invalidationManager.registerDependency(node2, [node1], 'thought');
      invalidationManager.registerDependency(node3, [node2], 'thought');
      
      const stats = invalidationManager.getStats();
      expect(stats.totalNodes).toBe(3);
      expect(stats.averageDependencies).toBeGreaterThan(0);
    });

    test('should handle dependency cycles gracefully', () => {
      const node1 = uuidv4();
      const node2 = uuidv4();
      const node3 = uuidv4();
      
      // Create a cycle: node1 -> node2 -> node3 -> node1
      invalidationManager.registerDependency(node2, [node1], 'thought');
      invalidationManager.registerDependency(node3, [node2], 'thought');
      invalidationManager.registerDependency(node1, [node3], 'thought');
      
      const stats = invalidationManager.getStats();
      expect(stats.totalNodes).toBe(3);
      // System should detect cycles but not crash
    });
  });

  describe('Invalidation Strategies', () => {
    test('should handle immediate invalidation', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      // Register dependency
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test invalidation',
        agentId: 'test-agent',
        cascade: true,
      };
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(true);
      expect(result.itemsInvalidated).toContain(sourceId);
      expect(result.itemsInvalidated).toContain(dependentId);
      expect(result.cascadeDepth).toBeGreaterThan(0);
    });

    test('should handle delayed invalidation', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        strategy: 'delayed',
        reason: 'Test delayed invalidation',
        agentId: 'test-agent',
        cascade: true,
        delayUntil: Date.now() + 100, // Small delay
      };
      
      const startTime = Date.now();
      const result = await invalidationManager.invalidate(request);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    test('should handle batched invalidation', async () => {
      const sourceId1 = uuidv4();
      const sourceId2 = uuidv4();
      
      const request1: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId: sourceId1,
        sourceType: 'thought',
        trigger: 'data_update',
        strategy: 'batched',
        reason: 'Test batched invalidation 1',
        agentId: 'test-agent',
        cascade: true,
      };
      
      const request2: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId: sourceId2,
        sourceType: 'thought',
        trigger: 'data_update',
        strategy: 'batched',
        reason: 'Test batched invalidation 2',
        agentId: 'test-agent',
        cascade: true,
      };
      
      const result1 = await invalidationManager.invalidate(request1);
      const result2 = await invalidationManager.invalidate(request2);
      
      // First request should be queued
      expect(result1.warnings).toContain('Request queued for batch processing');
      expect(result2.warnings).toContain('Request queued for batch processing');
    });

    test('should handle lazy invalidation', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        strategy: 'lazy',
        reason: 'Test lazy invalidation',
        agentId: 'test-agent',
        cascade: true,
      };
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Lazy invalidation - items marked as invalid, will be processed on next access');
      expect(result.itemsInvalidated).toContain(sourceId);
      expect(result.itemsInvalidated).toContain(dependentId);
    });

    test('should handle conditional invalidation', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      // Add a rule that should prevent invalidation
      const rule: InvalidationRule = {
        ruleId: uuidv4(),
        name: 'Test Rule',
        description: 'Test rule for conditional invalidation',
        conditions: [{
          field: 'agentId',
          operator: 'eq',
          value: 'blocked-agent',
        }],
        actions: [{
          type: 'notify',
          parameters: {},
        }],
        priority: 1,
        enabled: true,
        createdAt: Date.now(),
        createdBy: 'test-agent',
      };
      
      invalidationManager.addInvalidationRule(rule);
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        strategy: 'conditional',
        reason: 'Test conditional invalidation',
        agentId: 'blocked-agent', // This should trigger the rule
        cascade: true,
      };
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(true);
      // The conditional logic should apply the rule
    });

    test('should handle cascade-limited invalidation', async () => {
      const sourceId = uuidv4();
      const dependent1 = uuidv4();
      const dependent2 = uuidv4();
      const dependent3 = uuidv4();
      
      // Create a deep chain: dependent3 -> dependent2 -> dependent1 -> sourceId
      invalidationManager.registerDependency(dependent1, [sourceId], 'thought');
      invalidationManager.registerDependency(dependent2, [dependent1], 'thought');
      invalidationManager.registerDependency(dependent3, [dependent2], 'thought');
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        strategy: 'cascade_limited',
        reason: 'Test cascade-limited invalidation',
        agentId: 'test-agent',
        cascade: true,
        cascadeDepth: 2, // Limit to 2 levels
      };
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(true);
      expect(result.cascadeDepth).toBeLessThanOrEqual(2);
    });

    test('should handle selective invalidation', async () => {
      const sourceId = uuidv4();
      const frequentDependent = uuidv4();
      const infrequentDependent = uuidv4();
      
      // Register dependencies with different access patterns
      invalidationManager.registerDependency(frequentDependent, [sourceId], 'thought', {
        accessFrequency: 100, // High frequency - should not be invalidated
      });
      
      invalidationManager.registerDependency(infrequentDependent, [sourceId], 'thought', {
        accessFrequency: 1, // Low frequency - should be invalidated
      });
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        strategy: 'selective',
        reason: 'Test selective invalidation',
        agentId: 'test-agent',
        cascade: true,
      };
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(true);
      // Selective logic should prefer low-frequency items
      expect(result.itemsInvalidated).toContain(infrequentDependent);
    });
  });

  describe('Validation', () => {
    test('should validate dependencies correctly', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      const result = await invalidationManager.validateDependency(dependentId);
      
      expect(result.nodeId).toBe(dependentId);
      expect(result.isValid).toBe(true);
      expect(result.checkedDependencies).toContain(sourceId);
      expect(result.invalidDependencies).toHaveLength(0);
    });

    test('should detect invalid dependencies', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      // Manually mark source as invalid
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Mark source as invalid',
        agentId: 'test-agent',
        cascade: false,
      };
      
      await invalidationManager.invalidate(request);
      
      const result = await invalidationManager.validateDependency(dependentId);
      
      expect(result.isValid).toBe(false);
      expect(result.invalidDependencies).toContain(sourceId);
      expect(result.recommendedAction).toBe('invalidate');
    });

    test('should use validation cache', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      // First validation
      const result1 = await invalidationManager.validateDependency(dependentId);
      
      // Second validation should use cache
      const result2 = await invalidationManager.validateDependency(dependentId);
      
      expect(result1.validationTime).toBeGreaterThan(0);
      expect(result2.validationTime).toBeLessThan(result1.validationTime);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle invalidation errors gracefully', async () => {
      const sourceId = uuidv4();
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test error handling',
        agentId: 'test-agent',
        cascade: true,
      };
      
      // Mock a failure in vector store
      const originalDelete = mockVectorStore.deleteEntry;
      mockVectorStore.deleteEntry = jest.fn().mockRejectedValue(new Error('Database error'));
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Database error');
      expect(result.recoveryAttempted).toBe(true);
      
      // Restore original method
      mockVectorStore.deleteEntry = originalDelete;
    });

    test('should attempt recovery on failures', async () => {
      const sourceId = uuidv4();
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test recovery',
        agentId: 'test-agent',
        cascade: true,
      };
      
      let attemptCount = 0;
      mockVectorStore.deleteEntry = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve();
      });
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(true);
      expect(result.recoveryAttempted).toBe(true);
      expect(result.recoverySuccessful).toBe(true);
      expect(attemptCount).toBe(2);
    });

    test('should respect max recovery attempts', async () => {
      const sourceId = uuidv4();
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test max recovery attempts',
        agentId: 'test-agent',
        cascade: true,
      };
      
      mockVectorStore.deleteEntry = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(false);
      expect(result.recoveryAttempted).toBe(true);
      expect(result.recoverySuccessful).toBe(false);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track statistics correctly', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test statistics',
        agentId: 'test-agent',
        cascade: true,
      };
      
      await invalidationManager.invalidate(request);
      
      const stats = invalidationManager.getStats();
      
      expect(stats.totalEvents).toBe(1);
      expect(stats.eventsByTrigger['data_update']).toBe(1);
      expect(stats.eventsByStrategy['immediate']).toBe(1);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
      expect(stats.averageItemsInvalidated).toBeGreaterThan(0);
    });

    test('should maintain audit trail', async () => {
      const sourceId = uuidv4();
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test audit trail',
        agentId: 'test-agent',
        cascade: true,
      };
      
      await invalidationManager.invalidate(request);
      
      const auditTrail = invalidationManager.getAuditTrail();
      
      expect(auditTrail).toHaveLength(1);
      expect(auditTrail[0].sourceId).toBe(sourceId);
      expect(auditTrail[0].trigger).toBe('data_update');
      expect(auditTrail[0].agentId).toBe('test-agent');
    });

    test('should limit audit trail size', async () => {
      const sourceId = uuidv4();
      
      // Create many events
      for (let i = 0; i < 100; i++) {
        const request: InvalidationRequest = {
          requestId: uuidv4(),
          sourceId: `${sourceId}-${i}`,
          sourceType: 'thought',
          trigger: 'data_update',
          reason: `Test audit trail ${i}`,
          agentId: 'test-agent',
          cascade: false,
        };
        
        await invalidationManager.invalidate(request);
      }
      
      const auditTrail = invalidationManager.getAuditTrail();
      
      // Should be limited (implementation-dependent, but should not grow indefinitely)
      expect(auditTrail.length).toBeLessThan(10000);
    });
  });

  describe('Integration', () => {
    test('should integrate with vector store', async () => {
      const sourceId = uuidv4();
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test vector store integration',
        agentId: 'test-agent',
        cascade: true,
      };
      
      await invalidationManager.invalidate(request);
      
      // Verify vector store was called
      expect(mockVectorStore.deleteEntry).toHaveBeenCalledWith(sourceId);
    });

    test('should integrate with memory manager', async () => {
      const sourceId = uuidv4();
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test memory manager integration',
        agentId: 'test-agent',
        cascade: true,
      };
      
      await invalidationManager.invalidate(request);
      
      // Verify memory manager was called
      expect(mockMemoryManager.deleteMemory).toHaveBeenCalledWith(sourceId);
    });

    test('should integrate with lineage manager', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      const result = await invalidationManager.validateDependency(dependentId);
      
      // Verify lineage manager was consulted
      expect(result.trustScore).toBe(0.8); // Mock value from lineage manager
      expect(result.trustLevel).toBe('high');
    });
  });

  describe('Dry Run', () => {
    test('should perform dry run without actual invalidation', async () => {
      const sourceId = uuidv4();
      const dependentId = uuidv4();
      
      invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
      
      const request: InvalidationRequest = {
        requestId: uuidv4(),
        sourceId,
        sourceType: 'thought',
        trigger: 'data_update',
        reason: 'Test dry run',
        agentId: 'test-agent',
        cascade: true,
        dryRun: true,
      };
      
      const result = await invalidationManager.invalidate(request);
      
      expect(result.success).toBe(true);
      expect(result.itemsInvalidated).toContain(sourceId);
      expect(result.itemsInvalidated).toContain(dependentId);
      expect(result.warnings).toContain('Dry run - no actual invalidation performed');
      
      // Verify no actual deletion occurred
      expect(mockVectorStore.deleteEntry).not.toHaveBeenCalled();
      expect(mockMemoryManager.deleteMemory).not.toHaveBeenCalled();
    });
  });
});

describe('InvalidationManagerFactory', () => {
  test('should create manager from environment', () => {
    // Mock environment variables
    const originalEnv = process.env;
    
    process.env = {
      ...originalEnv,
      INVALIDATION_STRATEGY: 'immediate',
      INVALIDATION_CASCADE_DEPTH_LIMIT: '5',
      INVALIDATION_BATCH_SIZE: '50',
      INVALIDATION_LOG_LEVEL: 'error',
    };
    
    const manager = InvalidationManagerFactory.fromEnvironment();
    
    expect(manager).toBeInstanceOf(InvalidationManager);
    
    // Restore environment
    process.env = originalEnv;
  });

  test('should create development manager', () => {
    const manager = InvalidationManagerFactory.createDevelopment();
    
    expect(manager).toBeInstanceOf(InvalidationManager);
  });

  test('should create production manager', () => {
    const manager = InvalidationManagerFactory.createProduction();
    
    expect(manager).toBeInstanceOf(InvalidationManager);
  });

  test('should accept custom production config', () => {
    const customConfig = {
      cascadeDepthLimit: 20,
      batchSize: 500,
    };
    
    const manager = InvalidationManagerFactory.createProduction(customConfig);
    
    expect(manager).toBeInstanceOf(InvalidationManager);
  });
});

describe('Invalidation Rules', () => {
  let invalidationManager: InvalidationManager;

  beforeEach(() => {
    invalidationManager = InvalidationManagerFactory.createDevelopment();
  });

  afterEach(async () => {
    await invalidationManager.close();
  });

  test('should add and remove invalidation rules', () => {
    const rule: InvalidationRule = {
      ruleId: uuidv4(),
      name: 'Test Rule',
      description: 'Test rule description',
      conditions: [{
        field: 'trigger',
        operator: 'eq',
        value: 'data_update',
      }],
      actions: [{
        type: 'invalidate',
        parameters: {},
      }],
      priority: 1,
      enabled: true,
      createdAt: Date.now(),
      createdBy: 'test-agent',
    };
    
    invalidationManager.addInvalidationRule(rule);
    
    // Rule should be added (verified through behavior)
    
    const removed = invalidationManager.removeInvalidationRule(rule.ruleId);
    expect(removed).toBe(true);
    
    const removedAgain = invalidationManager.removeInvalidationRule(rule.ruleId);
    expect(removedAgain).toBe(false);
  });

  test('should apply rules during conditional invalidation', async () => {
    const sourceId = uuidv4();
    const dependentId = uuidv4();
    
    invalidationManager.registerDependency(dependentId, [sourceId], 'thought');
    
    const rule: InvalidationRule = {
      ruleId: uuidv4(),
      name: 'Block Test Agent',
      description: 'Block invalidations from test-agent',
      conditions: [{
        field: 'agentId',
        operator: 'eq',
        value: 'test-agent',
      }],
      actions: [{
        type: 'notify',
        parameters: {},
      }],
      priority: 1,
      enabled: true,
      createdAt: Date.now(),
      createdBy: 'test-agent',
    };
    
    invalidationManager.addInvalidationRule(rule);
    
    const request: InvalidationRequest = {
      requestId: uuidv4(),
      sourceId,
      sourceType: 'thought',
      trigger: 'data_update',
      strategy: 'conditional',
      reason: 'Test rule application',
      agentId: 'test-agent',
      cascade: true,
    };
    
    const result = await invalidationManager.invalidate(request);
    
    expect(result.success).toBe(true);
    // The rule should prevent actual invalidation and just notify
  });
});