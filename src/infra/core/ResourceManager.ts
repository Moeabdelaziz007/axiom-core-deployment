/**
 * 🔋 AXIOM ENERGY GRID - Resource Manager
 * 
 * Core resource management system that handles allocation, tracking,
 * and optimization of all agent resources in the Axiom ecosystem.
 * 
 * This is the central engine that manages the "Energy Grid" concept:
 * - AI Tokens (Gemini calls)
 * - Crypto (Solana gas fees)  
 * - Time (Cloudflare Workers compute)
 * - Memory (D1/R2 storage)
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { 
  ResourceType, 
  ResourceQuota, 
  ResourceUsageLog, 
  OptimizationRule,
  ResourceTier,
  ResourcePeriod
} from '@/types/resources';

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface ResourceAllocation {
  agentId: string;
  resourceType: ResourceType;
  requestedAmount: number;
  allocatedAmount: number;
  costUSD: number;
  timestamp: Date;
}

export interface ResourceCheckResult {
  allowed: boolean;
  remainingQuota: number;
  costUSD: number;
  reason?: string;
}

export interface ResourceMetrics {
  agentId: string;
  timestamp: Date;
  current: {
    compute: { usageMS: number; quotaMS: number; utilizationPercent: number };
    aiTokens: { usageTokens: number; quotaTokens: number; utilizationPercent: number };
    storage: { usageKB: number; quotaKB: number; utilizationPercent: number };
    network: { usageReqs: number; quotaReqs: number; utilizationPercent: number };
    blockchain: { usageLamports: number; quotaLamports: number; utilizationPercent: number };
  };
  performance: {
    responseTime: { avg: number; p95: number; p99: number };
    throughput: { requestsPerSecond: number; tokensPerSecond: number; computeMSPerSecond: number };
    errorRate: { percentage: number; count: number; totalRequests: number };
    efficiency: { costPerTask: number; resourceWastePercent: number; optimizationScore: number };
  };
  cost: {
    currentSpendUSD: number;
    projectedDailySpendUSD: number;
    projectedMonthlySpendUSD: number;
    budgetUtilizationPercent: number;
    costPerUnit: Record<ResourceType, number>;
  };
}

export interface AgentCostTracking {
  agentId: string;
  periodStart: Date;
  periodEnd: Date;
  computeCost: number;
  storageCost: number;
  networkCost: number;
  totalCost: number;
  currency: string;
  budgetLimit?: number;
  budgetAlertThreshold?: number;
  isAlertTriggered: boolean;
}

export interface PerformanceOptimization {
  agentId: string;
  metrics: ResourceMetrics;
  bottlenecks: Array<{
    resourceType: ResourceType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  optimizationActions: Array<{
    type: 'THROTTLE' | 'SCALE_UP' | 'SCALE_DOWN' | 'CACHE' | 'KILL' | 'NOTIFY';
    resourceType: ResourceType;
    priority: number;
    estimatedImpact: string;
  }>;
}

export interface ResourceScaling {
  agentId: string;
  currentMetrics: ResourceMetrics;
  scalingPolicies: Array<{
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    threshold: number;
    action: 'scale_up' | 'scale_down';
    cooldownSeconds: number;
    isActive: boolean;
  }>;
  scalingHistory: Array<{
    timestamp: Date;
    type: 'scale_up' | 'scale_down';
    resource: string;
    reason: string;
    previousValue: number;
    newValue: number;
  }>;
}

// ============================================================================
// RESOURCE MANAGER CLASS
// ============================================================================

export class ResourceManager {
  private static instance: ResourceManager;
  private resourceCache = new Map<string, ResourceQuota>();
  private usageCache = new Map<string, ResourceUsageLog[]>();
  private optimizationRules = new Map<string, OptimizationRule[]>();
  private costTracking = new Map<string, AgentCostTracking>();

  private constructor() {
    this.initializeDefaultRules();
  }

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  // ============================================================================
  // RESOURCE ALLOCATION & QUOTA MANAGEMENT
  // ============================================================================

  /**
   * Check if an agent has sufficient quota for a resource request
   */
  public async checkResourceQuota(
    agentId: string, 
    resourceType: ResourceType, 
    requestedAmount: number
  ): Promise<ResourceCheckResult> {
    const quota = await this.getAgentQuota(agentId);
    const currentUsage = quota.used[resourceType] || 0;
    const limit = quota.limits[resourceType] || 0;
    const remainingQuota = Math.max(0, limit - currentUsage);
    
    // Calculate cost based on resource type
    const costUSD = this.calculateResourceCost(resourceType, requestedAmount);
    
    const allowed = currentUsage + requestedAmount <= limit;
    
    return {
      allowed,
      remainingQuota,
      costUSD,
      reason: allowed ? undefined : `Insufficient quota: ${currentUsage}/${limit} ${resourceType}`
    };
  }

  /**
   * Allocate resources to an agent
   */
  public async allocateResource(
    agentId: string,
    resourceType: ResourceType,
    amount: number,
    taskId?: string
  ): Promise<ResourceAllocation> {
    // Check quota first
    const checkResult = await this.checkResourceQuota(agentId, resourceType, amount);
    if (!checkResult.allowed) {
      throw new Error(`Resource allocation failed: ${checkResult.reason}`);
    }

    // Update usage
    const quota = await this.getAgentQuota(agentId);
    quota.used[resourceType] = (quota.used[resourceType] || 0) + amount;
    quota.updatedAt = new Date();
    
    // Log the usage
    const usageLog: ResourceUsageLog = {
      id: this.generateId(),
      agentId,
      taskId,
      resourceType,
      amount,
      costUSD: checkResult.costUSD,
      timestamp: new Date()
    };

    await this.logUsage(usageLog);
    this.resourceCache.set(agentId, quota);

    return {
      agentId,
      resourceType,
      requestedAmount: amount,
      allocatedAmount: amount,
      costUSD: checkResult.costUSD,
      timestamp: new Date()
    };
  }

  /**
   * Get agent's current quota and usage
   */
  public async getAgentQuota(agentId: string): Promise<ResourceQuota> {
    // Check cache first
    if (this.resourceCache.has(agentId)) {
      const cached = this.resourceCache.get(agentId)!;
      // Reset if period expired
      if (cached.resetAt < new Date()) {
        await this.resetAgentQuota(agentId);
        return this.resourceCache.get(agentId)!;
      }
      return cached;
    }

    // Load from database (mock implementation)
    const quota: ResourceQuota = {
      agentId,
      tier: 'PRO',
      period: 'DAILY',
      limits: {
        'COMPUTE_MS': 3600000,      // 1 hour compute time
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
      resetAt: this.calculateResetTime('DAILY'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.resourceCache.set(agentId, quota);
    return quota;
  }

  /**
   * Reset agent's quota when period expires
   */
  private async resetAgentQuota(agentId: string): Promise<void> {
    const quota = this.resourceCache.get(agentId);
    if (!quota) return;

    // Reset usage to zero
    quota.used = Object.keys(quota.used).reduce((acc, key) => {
      acc[key as ResourceType] = 0;
      return acc;
    }, {} as Record<ResourceType, number>);

    quota.resetAt = this.calculateResetTime(quota.period);
    quota.updatedAt = new Date();
    
    this.resourceCache.set(agentId, quota);
  }

  // ============================================================================
  // COST MANAGEMENT
  // ============================================================================

  /**
   * Calculate cost for resource usage
   */
  private calculateResourceCost(resourceType: ResourceType, amount: number): number {
    const costs: Record<ResourceType, number> = {
      'COMPUTE_MS': 0.00001,        // $0.00001 per ms
      'AI_TOKENS': 0.000001,       // $0.000001 per token
      'STORAGE_KB': 0.000001,      // $0.000001 per KB
      'NETWORK_REQS': 0.001,       // $0.001 per request
      'SOLANA_LAMPORTS': 0.000001  // $0.000001 per lamport
    };
    
    return amount * (costs[resourceType] || 0);
  }

  /**
   * Get cost tracking for an agent
   */
  public async getAgentCostTracking(agentId: string): Promise<AgentCostTracking> {
    if (this.costTracking.has(agentId)) {
      return this.costTracking.get(agentId)!;
    }

    // Calculate from usage logs (mock implementation)
    const usageLogs = await this.getAgentUsageLogs(agentId);
    const costs = usageLogs.reduce((acc, log) => {
      switch (log.resourceType) {
        case 'COMPUTE_MS':
          acc.computeCost += log.costUSD;
          break;
        case 'STORAGE_KB':
          acc.storageCost += log.costUSD;
          break;
        case 'NETWORK_REQS':
          acc.networkCost += log.costUSD;
          break;
        default:
          break;
      }
      acc.totalCost += log.costUSD;
      return acc;
    }, { computeCost: 0, storageCost: 0, networkCost: 0, totalCost: 0 });

    const tracking: AgentCostTracking = {
      agentId,
      periodStart: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      periodEnd: new Date(),
      ...costs,
      currency: 'USD',
      budgetLimit: 10.00, // $10 daily budget
      budgetAlertThreshold: 0.8, // 80% alert threshold
      isAlertTriggered: costs.totalCost > 8.00
    };

    this.costTracking.set(agentId, tracking);
    return tracking;
  }

  // ============================================================================
  // PERFORMANCE OPTIMIZATION
  // ============================================================================

  /**
   * Analyze agent performance and identify optimization opportunities
   */
  public async analyzePerformance(agentId: string): Promise<PerformanceOptimization> {
    const metrics = await this.getResourceMetrics(agentId);
    const bottlenecks = this.identifyBottlenecks(metrics);
    const optimizationActions = this.generateOptimizationActions(bottlenecks);

    return {
      agentId,
      metrics,
      bottlenecks,
      optimizationActions
    };
  }

  /**
   * Identify performance bottlenecks
   */
  private identifyBottlenecks(metrics: ResourceMetrics): Array<{
    resourceType: ResourceType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }> {
    const bottlenecks = [];

    // Check compute utilization
    if (metrics.current.compute.utilizationPercent > 90) {
      bottlenecks.push({
        resourceType: 'COMPUTE_MS',
        severity: 'critical',
        description: `Compute utilization at ${metrics.current.compute.utilizationPercent}%`,
        recommendation: 'Scale up compute resources or optimize task execution'
      });
    } else if (metrics.current.compute.utilizationPercent > 75) {
      bottlenecks.push({
        resourceType: 'COMPUTE_MS',
        severity: 'high',
        description: `Compute utilization at ${metrics.current.compute.utilizationPercent}%`,
        recommendation: 'Monitor closely and consider scaling if trend continues'
      });
    }

    // Check AI token efficiency
    if (metrics.performance.efficiency.costPerTask > 0.10) {
      bottlenecks.push({
        resourceType: 'AI_TOKENS',
        severity: 'medium',
        description: `High cost per task: $${metrics.performance.efficiency.costPerTask}`,
        recommendation: 'Optimize prompts or use smaller models for routine tasks'
      });
    }

    // Check error rate
    if (metrics.performance.errorRate.percentage > 5) {
      bottlenecks.push({
        resourceType: 'NETWORK_REQS',
        severity: 'high',
        description: `High error rate: ${metrics.performance.errorRate.percentage}%`,
        recommendation: 'Investigate API integrations and implement retry logic'
      });
    }

    return bottlenecks;
  }

  /**
   * Generate optimization actions based on bottlenecks
   */
  private generateOptimizationActions(bottlenecks: Array<{
    resourceType: ResourceType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>): Array<{
    type: 'THROTTLE' | 'SCALE_UP' | 'SCALE_DOWN' | 'CACHE' | 'KILL' | 'NOTIFY';
    resourceType: ResourceType;
    priority: number;
    estimatedImpact: string;
  }> {
    return bottlenecks.map(bottleneck => {
      let type: any = 'NOTIFY';
      let priority = 1;
      let estimatedImpact = 'Low';

      switch (bottleneck.severity) {
        case 'critical':
          type = 'SCALE_UP';
          priority = 1;
          estimatedImpact = 'High - Immediate relief';
          break;
        case 'high':
          type = 'NOTIFY';
          priority = 2;
          estimatedImpact = 'Medium - Requires attention';
          break;
        case 'medium':
          type = 'CACHE';
          priority = 3;
          estimatedImpact = 'Medium - Cost reduction';
          break;
        case 'low':
          type = 'THROTTLE';
          priority = 4;
          estimatedImpact = 'Low - Efficiency improvement';
          break;
      }

      return {
        type,
        resourceType: bottleneck.resourceType,
        priority,
        estimatedImpact
      };
    });
  }

  // ============================================================================
  // RESOURCE SCALING
  // ============================================================================

  /**
   * Get resource scaling configuration and history
   */
  public async getResourceScaling(agentId: string): Promise<ResourceScaling> {
    const currentMetrics = await this.getResourceMetrics(agentId);
    const scalingPolicies = await this.getScalingPolicies(agentId);
    const scalingHistory = await this.getScalingHistory(agentId);

    return {
      agentId,
      currentMetrics,
      scalingPolicies,
      scalingHistory
    };
  }

  /**
   * Execute scaling based on policies and current metrics
   */
  public async executeScaling(agentId: string): Promise<void> {
    const scaling = await this.getResourceScaling(agentId);
    
    for (const policy of scaling.scalingPolicies) {
      if (!policy.isActive) continue;

      const currentValue = this.getMetricValue(scaling.currentMetrics, policy.metric);
      const shouldScale = this.evaluateCondition(currentValue, policy.operator, policy.threshold);

      if (shouldScale) {
        await this.applyScalingAction(agentId, policy.action, policy.metric);
        await this.logScalingEvent(agentId, policy.action, policy.metric, currentValue, policy.threshold);
      }
    }
  }

  // ============================================================================
  // INTEGRATION WITH EXISTING FRAMEWORKS
  // ============================================================================

  /**
   * Integrate with AgentSuperpowersFramework for resource tracking
   */
  public async integrateWithSuperpowers(agentId: string): Promise<void> {
    // This would connect with the existing AgentSuperpowersFramework
    // to track resource usage during agent operations
    console.log(`Integrating resource management for agent: ${agentId}`);
  }

  /**
   * Integrate with PerformanceAnalyticsEngine for optimization
   */
  public async integrateWithPerformanceEngine(agentId: string): Promise<void> {
    // This would connect with the existing PerformanceAnalyticsEngine
    // to enhance optimization recommendations
    console.log(`Integrating performance optimization for agent: ${agentId}`);
  }

  /**
   * Integrate with AgentMarketplaceEngine for cost-effective resources
   */
  public async integrateWithMarketplace(agentId: string): Promise<void> {
    // This would connect with the existing AgentMarketplaceEngine
    // to find cost-effective resource acquisition options
    console.log(`Integrating marketplace resources for agent: ${agentId}`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get comprehensive resource metrics for an agent
   */
  public async getResourceMetrics(agentId: string): Promise<ResourceMetrics> {
    const quota = await this.getAgentQuota(agentId);
    const usageLogs = await this.getAgentUsageLogs(agentId);
    const costTracking = await this.getAgentCostTracking(agentId);

    // Calculate current usage percentages
    const current = {
      compute: {
        usageMS: quota.used['COMPUTE_MS'] || 0,
        quotaMS: quota.limits['COMPUTE_MS'] || 0,
        utilizationPercent: ((quota.used['COMPUTE_MS'] || 0) / (quota.limits['COMPUTE_MS'] || 1)) * 100
      },
      aiTokens: {
        usageTokens: quota.used['AI_TOKENS'] || 0,
        quotaTokens: quota.limits['AI_TOKENS'] || 0,
        utilizationPercent: ((quota.used['AI_TOKENS'] || 0) / (quota.limits['AI_TOKENS'] || 1)) * 100
      },
      storage: {
        usageKB: quota.used['STORAGE_KB'] || 0,
        quotaKB: quota.limits['STORAGE_KB'] || 0,
        utilizationPercent: ((quota.used['STORAGE_KB'] || 0) / (quota.limits['STORAGE_KB'] || 1)) * 100
      },
      network: {
        usageReqs: quota.used['NETWORK_REQS'] || 0,
        quotaReqs: quota.limits['NETWORK_REQS'] || 0,
        utilizationPercent: ((quota.used['NETWORK_REQS'] || 0) / (quota.limits['NETWORK_REQS'] || 1)) * 100
      },
      blockchain: {
        usageLamports: quota.used['SOLANA_LAMPORTS'] || 0,
        quotaLamports: quota.limits['SOLANA_LAMPORTS'] || 0,
        utilizationPercent: ((quota.used['SOLANA_LAMPORTS'] || 0) / (quota.limits['SOLANA_LAMPORTS'] || 1)) * 100
      }
    };

    // Mock performance metrics
    const performance = {
      responseTime: { avg: 150, p95: 250, p99: 400 },
      throughput: { 
        requestsPerSecond: 10, 
        tokensPerSecond: 50, 
        computeMSPerSecond: 1000 
      },
      errorRate: { percentage: 2, count: 5, totalRequests: 250 },
      efficiency: { 
        costPerTask: costTracking.totalCost / Math.max(usageLogs.length, 1), 
        resourceWastePercent: 15, 
        optimizationScore: 85 
      }
    };

    // Cost breakdown
    const cost = {
      currentSpendUSD: costTracking.totalCost,
      projectedDailySpendUSD: costTracking.totalCost * 1.1,
      projectedMonthlySpendUSD: costTracking.totalCost * 30,
      budgetUtilizationPercent: (costTracking.totalCost / (costTracking.budgetLimit || 1)) * 100,
      costPerUnit: {
        'COMPUTE_MS': 0.00001,
        'AI_TOKENS': 0.000001,
        'STORAGE_KB': 0.000001,
        'NETWORK_REQS': 0.001,
        'SOLANA_LAMPORTS': 0.000001
      }
    };

    return {
      agentId,
      timestamp: new Date(),
      current,
      performance,
      cost
    };
  }

  /**
   * Get usage logs for an agent
   */
  private async getAgentUsageLogs(agentId: string): Promise<ResourceUsageLog[]> {
    return this.usageCache.get(agentId) || [];
  }

  /**
   * Log resource usage
   */
  private async logUsage(usageLog: ResourceUsageLog): Promise<void> {
    const logs = this.usageCache.get(usageLog.agentId) || [];
    logs.push(usageLog);
    this.usageCache.set(usageLog.agentId, logs);
  }

  /**
   * Get scaling policies for an agent
   */
  private async getScalingPolicies(agentId: string): Promise<Array<{
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    threshold: number;
    action: 'scale_up' | 'scale_down';
    cooldownSeconds: number;
    isActive: boolean;
  }>> {
    return [
      {
        metric: 'compute_utilization',
        operator: '>',
        threshold: 80,
        action: 'scale_up',
        cooldownSeconds: 300,
        isActive: true
      },
      {
        metric: 'compute_utilization',
        operator: '<',
        threshold: 20,
        action: 'scale_down',
        cooldownSeconds: 600,
        isActive: true
      }
    ];
  }

  /**
   * Get scaling history for an agent
   */
  private async getScalingHistory(agentId: string): Promise<Array<{
    timestamp: Date;
    type: 'scale_up' | 'scale_down';
    resource: string;
    reason: string;
    previousValue: number;
    newValue: number;
  }>> {
    return [];
  }

  /**
   * Initialize default optimization rules
   */
  private initializeDefaultRules(): void {
    // Default rules would be loaded from configuration
  }

  /**
   * Calculate reset time for quota period
   */
  private calculateResetTime(period: ResourcePeriod): Date {
    const now = new Date();
    switch (period) {
      case 'DAILY':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'MONTHLY':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get metric value from metrics object
   */
  private getMetricValue(metrics: ResourceMetrics, metric: string): number {
    switch (metric) {
      case 'compute_utilization':
        return metrics.current.compute.utilizationPercent;
      case 'ai_tokens_utilization':
        return metrics.current.aiTokens.utilizationPercent;
      case 'storage_utilization':
        return metrics.current.storage.utilizationPercent;
      case 'network_utilization':
        return metrics.current.network.utilizationPercent;
      case 'error_rate':
        return metrics.performance.errorRate.percentage;
      case 'cost_per_task':
        return metrics.performance.efficiency.costPerTask;
      default:
        return 0;
    }
  }

  /**
   * Evaluate condition for scaling
   */
  private evaluateCondition(
    currentValue: number, 
    operator: '>' | '<' | '=' | '>=' | '<=', 
    threshold: number
  ): boolean {
    switch (operator) {
      case '>':
        return currentValue > threshold;
      case '<':
        return currentValue < threshold;
      case '=':
        return currentValue === threshold;
      case '>=':
        return currentValue >= threshold;
      case '<=':
        return currentValue <= threshold;
      default:
        return false;
    }
  }

  /**
   * Apply scaling action
   */
  private async applyScalingAction(
    agentId: string, 
    action: 'scale_up' | 'scale_down', 
    metric: string
  ): Promise<void> {
    console.log(`Applying ${action} for agent ${agentId} based on ${metric}`);
    // Implementation would adjust quotas or resources
  }

  /**
   * Log scaling event
   */
  private async logScalingEvent(
    agentId: string,
    action: 'scale_up' | 'scale_down',
    resource: string,
    previousValue: number,
    newValue: number
  ): Promise<void> {
    console.log(`Scaling event: ${agentId} ${action} ${resource} from ${previousValue} to ${newValue}`);
    // Implementation would log to database
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const resourceManager = ResourceManager.getInstance();