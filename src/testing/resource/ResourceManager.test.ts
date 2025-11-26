/**
 * 🔋 AXIOM ENERGY GRID - Resource Manager Tests
 * 
 * Comprehensive test suite for the Resource Manager system
 * covering allocation, cost tracking, optimization, and scaling.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { resourceManager, ResourceManager } from '@/infra/core/ResourceManager';
import { resourceIntegration } from '@/infra/core/ResourceIntegration';
import { ResourceType, ResourceQuota, ResourceUsageLog } from '@/types/agentResources';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('ResourceManager', () => {
  let testAgentId: string;
  let mockQuota: ResourceQuota;

  beforeEach(() => {
    testAgentId = `test_agent_${Date.now()}`;
    mockQuota = {
      agentId: testAgentId,
      tier: 'PRO',
      period: 'DAILY',
      limits: {
        'COMPUTE_MS': 3600000,      // 1 hour
        'AI_TOKENS': 1000000,       // 1M tokens
        'STORAGE_KB': 10485760,     // 10GB
        'NETWORK_REQS': 10000,       // 10K requests
        'SOLANA_LAMPORTS': 10000000  // 0.01 SOL
      },
      used: {
        'COMPUTE_MS': 0,
        'AI_TOKENS': 0,
        'STORAGE_KB': 0,
        'NETWORK_REQS': 0,
        'SOLANA_LAMPORTS': 0
      },
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  afterEach(() => {
    // Clean up test data
    jest.clearAllMocks();
  });

  // ============================================================================
  // RESOURCE ALLOCATION TESTS
  // ============================================================================

  describe('Resource Allocation', () => {
    it('should successfully allocate resources within quota', async () => {
      const resourceType = 'COMPUTE_MS' as ResourceType;
      const amount = 1000; // 1 second

      const checkResult = await resourceManager.checkResourceQuota(testAgentId, resourceType, amount);

      expect(checkResult.allowed).toBe(true);
      expect(checkResult.remainingQuota).toBe(3600000);
      expect(checkResult.costUSD).toBe(0.01); // 1000 * 0.00001
    });

    it('should reject allocation when quota exceeded', async () => {
      const resourceType = 'AI_TOKENS' as ResourceType;
      const amount = 2000000; // 2M tokens (exceeds 1M limit)

      const checkResult = await resourceManager.checkResourceQuota(testAgentId, resourceType, amount);

      expect(checkResult.allowed).toBe(false);
      expect(checkResult.reason).toContain('Insufficient quota');
    });

    it('should allocate resources and update usage', async () => {
      const resourceType = 'STORAGE_KB' as ResourceType;
      const amount = 1024; // 1MB

      const allocation = await resourceManager.allocateResource(testAgentId, resourceType, amount);

      expect(allocation.agentId).toBe(testAgentId);
      expect(allocation.resourceType).toBe(resourceType);
      expect(allocation.allocatedAmount).toBe(amount);
      expect(allocation.costUSD).toBe(0.001024); // 1024 * 0.000001
      expect(allocation.timestamp).toBeInstanceOf(Date);
    });

    it('should throw error when allocating beyond quota', async () => {
      const resourceType = 'NETWORK_REQS' as ResourceType;
      const amount = 20000; // Exceeds 10K limit

      await expect(
        resourceManager.allocateResource(testAgentId, resourceType, amount)
      ).rejects.toThrow('Resource allocation failed');
    });
  });

  // ============================================================================
  // QUOTA MANAGEMENT TESTS
  // ============================================================================

  describe('Quota Management', () => {
    it('should return correct quota information', async () => {
      const quota = await resourceManager.getAgentQuota(testAgentId);

      expect(quota.agentId).toBe(testAgentId);
      expect(quota.tier).toBe('PRO');
      expect(quota.period).toBe('DAILY');
      expect(quota.limits['COMPUTE_MS']).toBe(3600000);
      expect(quota.used['COMPUTE_MS']).toBe(0);
    });

    it('should reset quota when period expires', async () => {
      // Create a quota that expires soon
      const expiredQuota = {
        ...mockQuota,
        resetAt: new Date(Date.now() - 1000) // Expired 1 second ago
      };

      // Mock the cache to return expired quota
      jest.spyOn(resourceManager as any, 'resourceCache', 'get').mockReturnValue(new Map([[testAgentId, expiredQuota]]));

      const quota = await resourceManager.getAgentQuota(testAgentId);

      // Usage should be reset to 0
      expect(quota.used['COMPUTE_MS']).toBe(0);
      expect(quota.used['AI_TOKENS']).toBe(0);
    });
  });

  // ============================================================================
  // COST MANAGEMENT TESTS
  // ============================================================================

  describe('Cost Management', () => {
    it('should calculate resource costs correctly', async () => {
      const resourceType = 'COMPUTE_MS' as ResourceType;
      const amount = 5000; // 5 seconds

      const checkResult = await resourceManager.checkResourceQuota(testAgentId, resourceType, amount);

      expect(checkResult.costUSD).toBe(0.05); // 5000 * 0.00001
    });

    it('should track agent costs over time', async () => {
      // Allocate some resources to generate cost data
      await resourceManager.allocateResource(testAgentId, 'COMPUTE_MS', 1000);
      await resourceManager.allocateResource(testAgentId, 'AI_TOKENS', 1000);

      const costTracking = await resourceManager.getAgentCostTracking(testAgentId);

      expect(costTracking.agentId).toBe(testAgentId);
      expect(costTracking.currency).toBe('USD');
      expect(costTracking.totalCost).toBeGreaterThan(0);
      expect(costTracking.budgetLimit).toBe(10.00);
    });

    it('should trigger budget alerts when threshold exceeded', async () => {
      // Simulate high usage that exceeds budget alert threshold
      const costTracking = await resourceManager.getAgentCostTracking(testAgentId);

      // Mock high cost usage
      jest.spyOn(resourceManager as any, 'getAgentUsageLogs').mockResolvedValue([
        { costUSD: 8.50 }, // Exceeds 80% of $10 budget
        { costUSD: 0.50 }
      ]);

      const updatedCostTracking = await resourceManager.getAgentCostTracking(testAgentId);

      expect(updatedCostTracking.isAlertTriggered).toBe(true);
    });
  });

  // ============================================================================
  // PERFORMANCE OPTIMIZATION TESTS
  // ============================================================================

  describe('Performance Optimization', () => {
    it('should identify performance bottlenecks', async () => {
      // Mock high utilization metrics
      jest.spyOn(resourceManager, 'getResourceMetrics').mockResolvedValue({
        agentId: testAgentId,
        timestamp: new Date(),
        current: {
          compute: { usageMS: 3240000, quotaMS: 3600000, utilizationPercent: 90 },
          aiTokens: { usageTokens: 500000, quotaTokens: 1000000, utilizationPercent: 50 },
          storage: { usageKB: 5242880, quotaKB: 10485760, utilizationPercent: 50 },
          network: { usageReqs: 5000, quotaReqs: 10000, utilizationPercent: 50 },
          blockchain: { usageLamports: 5000000, quotaLamports: 10000000, utilizationPercent: 50 }
        },
        performance: {
          responseTime: { avg: 150, p95: 250, p99: 400 },
          throughput: { requestsPerSecond: 10, tokensPerSecond: 50, computeMSPerSecond: 1000 },
          errorRate: { percentage: 2, count: 5, totalRequests: 250 },
          efficiency: { costPerTask: 0.05, resourceWastePercent: 15, optimizationScore: 85 }
        },
        cost: {
          currentSpendUSD: 2.50,
          projectedDailySpendUSD: 5.00,
          projectedMonthlySpendUSD: 150.00,
          budgetUtilizationPercent: 45,
          costPerUnit: {
            'COMPUTE_MS': 0.00001,
            'AI_TOKENS': 0.000001,
            'STORAGE_KB': 0.000001,
            'NETWORK_REQS': 0.001,
            'SOLANA_LAMPORTS': 0.000001
          }
        }
      } as any);

      const analysis = await resourceManager.analyzePerformance(testAgentId);

      expect(analysis.bottlenecks.length).toBeGreaterThan(0);
      expect(analysis.bottlenecks[0].resourceType).toBe('COMPUTE_MS');
      expect(analysis.bottlenecks[0].severity).toBe('critical');
    });

    it('should generate optimization actions', async () => {
      jest.spyOn(resourceManager, 'getResourceMetrics').mockResolvedValue({
        agentId: testAgentId,
        timestamp: new Date(),
        current: {
          compute: { usageMS: 1800000, quotaMS: 3600000, utilizationPercent: 50 },
          aiTokens: { usageTokens: 500000, quotaTokens: 1000000, utilizationPercent: 50 },
          storage: { usageKB: 5242880, quotaKB: 10485760, utilizationPercent: 50 },
          network: { usageReqs: 5000, quotaReqs: 10000, utilizationPercent: 50 },
          blockchain: { usageLamports: 5000000, quotaLamports: 10000000, utilizationPercent: 50 }
        },
        performance: {
          responseTime: { avg: 150, p95: 250, p99: 400 },
          throughput: { requestsPerSecond: 10, tokensPerSecond: 50, computeMSPerSecond: 1000 },
          errorRate: { percentage: 2, count: 5, totalRequests: 250 },
          efficiency: { costPerTask: 0.05, resourceWastePercent: 15, optimizationScore: 85 }
        },
        cost: {
          currentSpendUSD: 2.50,
          projectedDailySpendUSD: 5.00,
          projectedMonthlySpendUSD: 150.00,
          budgetUtilizationPercent: 45,
          costPerUnit: {
            'COMPUTE_MS': 0.00001,
            'AI_TOKENS': 0.000001,
            'STORAGE_KB': 0.000001,
            'NETWORK_REQS': 0.001,
            'SOLANA_LAMPORTS': 0.000001
          }
        }
      } as any);

      const analysis = await resourceManager.analyzePerformance(testAgentId);

      expect(analysis.optimizationActions.length).toBeGreaterThan(0);
      expect(analysis.optimizationActions[0].type).toBeDefined();
      expect(analysis.optimizationActions[0].priority).toBeDefined();
    });
  });

  // ============================================================================
  // RESOURCE SCALING TESTS
  // ============================================================================

  describe('Resource Scaling', () => {
    it('should get scaling configuration', async () => {
      jest.spyOn(resourceManager, 'getResourceMetrics').mockResolvedValue({
        agentId: testAgentId,
        timestamp: new Date(),
        current: {
          compute: { usageMS: 1800000, quotaMS: 3600000, utilizationPercent: 50 },
          aiTokens: { usageTokens: 500000, quotaTokens: 1000000, utilizationPercent: 50 },
          storage: { usageKB: 5242880, quotaKB: 10485760, utilizationPercent: 50 },
          network: { usageReqs: 5000, quotaReqs: 10000, utilizationPercent: 50 },
          blockchain: { usageLamports: 5000000, quotaLamports: 10000000, utilizationPercent: 50 }
        },
        performance: {
          responseTime: { avg: 150, p95: 250, p99: 400 },
          throughput: { requestsPerSecond: 10, tokensPerSecond: 50, computeMSPerSecond: 1000 },
          errorRate: { percentage: 2, count: 5, totalRequests: 250 },
          efficiency: { costPerTask: 0.05, resourceWastePercent: 15, optimizationScore: 85 }
        },
        cost: {
          currentSpendUSD: 2.50,
          projectedDailySpendUSD: 5.00,
          projectedMonthlySpendUSD: 150.00,
          budgetUtilizationPercent: 45,
          costPerUnit: {
            'COMPUTE_MS': 0.00001,
            'AI_TOKENS': 0.000001,
            'STORAGE_KB': 0.000001,
            'NETWORK_REQS': 0.001,
            'SOLANA_LAMPORTS': 0.000001
          }
        }
      } as any);

      const scaling = await resourceManager.getResourceScaling(testAgentId);

      expect(scaling.agentId).toBe(testAgentId);
      expect(scaling.scalingPolicies).toBeDefined();
      expect(scaling.scalingHistory).toBeDefined();
    });

    it('should execute scaling based on policies', async () => {
      const executeScalingSpy = jest.spyOn(resourceManager, 'executeScaling');

      await resourceManager.executeScaling(testAgentId);

      expect(executeScalingSpy).toHaveBeenCalledWith(testAgentId);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', () => {
    it('should integrate with superpowers framework', async () => {
      const integrationSpy = jest.spyOn(resourceIntegration, 'trackSuperpowerExecution');

      await resourceIntegration.trackSuperpowerExecution(
        testAgentId,
        'data_analysis',
        {
          'COMPUTE_MS': 1000,
          'AI_TOKENS': 500
        }
      );

      expect(integrationSpy).toHaveBeenCalledWith(
        testAgentId,
        'data_analysis',
        expect.objectContaining({
          'COMPUTE_MS': 1000,
          'AI_TOKENS': 500
        })
      );
    });

    it('should find marketplace deals', async () => {
      const deals = await resourceIntegration.findMarketplaceDeals(testAgentId);

      expect(Array.isArray(deals)).toBe(true);
      if (deals.length > 0) {
        expect(deals[0]).toHaveProperty('type');
        expect(deals[0]).toHaveProperty('description');
        expect(deals[0]).toHaveProperty('estimatedSavings');
      }
    });

    it('should share resources between agents', async () => {
      const targetAgentId = `target_agent_${Date.now()}`;

      await resourceIntegration.shareResources(
        testAgentId,
        'COMPUTE_MS',
        1000,
        targetAgentId
      );

      const sharingPools = resourceIntegration.getSharingPools(testAgentId);
      expect(sharingPools.length).toBeGreaterThan(0);
      expect(sharingPools[0].resourceType).toBe('COMPUTE_MS');
      expect(sharingPools[0].availableAmount).toBe(1000);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle invalid resource types', async () => {
      await expect(
        resourceManager.checkResourceQuota(testAgentId, 'INVALID_TYPE' as ResourceType, 1000)
      ).rejects.toThrow();
    });

    it('should handle negative amounts', async () => {
      await expect(
        resourceManager.allocateResource(testAgentId, 'COMPUTE_MS', -100)
      ).rejects.toThrow();
    });

    it('should handle missing agent ID', async () => {
      await expect(
        resourceManager.getAgentQuota('')
      ).rejects.toThrow();
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance Tests', () => {
    it('should handle concurrent resource allocations', async () => {
      const allocations = [];
      const startTime = Date.now();

      // Create 10 concurrent allocations
      for (let i = 0; i < 10; i++) {
        allocations.push(
          resourceManager.allocateResource(testAgentId, 'COMPUTE_MS', 100)
        );
      }

      const results = await Promise.all(allocations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large resource amounts efficiently', async () => {
      const startTime = Date.now();

      await resourceManager.checkResourceQuota(testAgentId, 'AI_TOKENS', 1000000);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
});