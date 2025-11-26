/**
 * 🔋 AXIOM ENERGY GRID - Resource Definitions
 * 
 * Comprehensive resource type definitions for the Axiom agent ecosystem
 * covering compute, AI tokens, storage, network, and blockchain resources.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

// ============================================================================
// CORE RESOURCE TYPES
// ============================================================================

export type ResourceType = 
  | 'COMPUTE_MS'      // Worker execution time in milliseconds
  | 'AI_TOKENS'       // LLM Token usage (Gemini, GPT, etc.)
  | 'STORAGE_KB'      // D1/R2 Storage in kilobytes
  | 'NETWORK_REQS'    // API Calls (Tavily, etc.)
  | 'SOLANA_LAMPORTS'; // Blockchain transaction fees in lamports

export type ResourceTier = 
  | 'FREE'           // Free tier with basic limits
  | 'PRO'            // Professional tier with standard limits
  | 'ENTERPRISE'     // Enterprise tier with high limits
  | 'CUSTOM';         // Custom tier with negotiated limits

export type ResourcePeriod = 
  | 'SECONDLY'
  | 'MINUTELY'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY';

// ============================================================================
// RESOURCE QUOTA AND USAGE INTERFACES
// ============================================================================

/**
 * Resource quota configuration for agents
 */
export interface ResourceQuota {
  agentId: string;
  tier: ResourceTier;
  period: ResourcePeriod;
  limits: Record<ResourceType, number>;
  used: Record<ResourceType, number>;
  resetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resource usage log entry
 */
export interface ResourceUsageLog {
  id: string;
  agentId: string;
  taskId?: string;
  sessionId?: string;
  resourceType: ResourceType;
  amount: number;
  costUSD: number;
  metadata?: {
    [key: string]: any;
  };
  timestamp: Date;
}

/**
 * Resource cost breakdown
 */
export interface ResourceCost {
  resourceType: ResourceType;
  unit: string;
  unitCost: number; // Cost per unit in USD
  totalCost: number; // Total cost in USD
  currency: string;
}

/**
 * Agent resource tier configuration
 */
export interface AgentTier {
  tier: ResourceTier;
  name: string;
  description: string;
  pricing: {
    compute: {
      baseCostPerMS: number; // Cost per millisecond
      freeQuotaMS: number; // Free quota in milliseconds
    };
    aiTokens: {
      baseCostPerToken: number; // Cost per token
      freeQuotaTokens: number; // Free token quota
    };
    storage: {
      baseCostPerKB: number; // Cost per kilobyte
      freeQuotaKB: number; // Free storage quota
    };
    network: {
      baseCostPerReq: number; // Cost per API request
      freeQuotaReqs: number; // Free request quota
    };
    blockchain: {
      baseCostPerLamport: number; // Cost per lamport
      freeQuotaLamports: number; // Free lamport quota
    };
  };
  limits: {
    compute: {
      maxMSPerPeriod: Record<ResourcePeriod, number>;
    };
    aiTokens: {
      maxTokensPerPeriod: Record<ResourcePeriod, number>;
    };
    storage: {
      maxKBPerPeriod: Record<ResourcePeriod, number>;
    };
    network: {
      maxReqsPerPeriod: Record<ResourcePeriod, number>;
    };
    blockchain: {
      maxLamportsPerPeriod: Record<ResourcePeriod, number>;
    };
  };
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// OPTIMIZATION RULES
// ============================================================================

/**
 * Resource optimization rule
 */
export interface OptimizationRule {
  id: string;
  agentId: string;
  name: string;
  description: string;
  condition: OptimizationCondition;
  threshold: number;
  action: OptimizationAction;
  autoExecute: boolean;
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
}

/**
 * Optimization condition types
 */
export type OptimizationCondition = 
  | 'HIGH_USAGE'        // Resource usage above threshold
  | 'LOW_EFFICIENCY'    // Resource efficiency below threshold
  | 'BUDGET_RISK'       // Budget at risk of being exceeded
  | 'PERFORMANCE_DEGRADE' // Performance degradation detected
  | 'COST_SPIKE'        // Sudden cost increase
  | 'RESOURCE_WASTE'     // Resource waste detected
  | 'PREDICTIVE_SCALE'  // Predictive scaling needed
  | 'TIME_BASED';       // Time-based optimization

/**
 * Optimization action types
 */
export type OptimizationAction = 
  | 'THROTTLE'         // Throttle resource usage
  | 'SCALE_DOWN'        // Scale down resources
  | 'SCALE_UP'          // Scale up resources
  | 'NOTIFY'           // Send notification
  | 'KILL'             // Terminate process/task
  | 'CACHE'            // Enable caching
  | 'COMPRESS'         // Enable compression
  | 'OPTIMIZE_QUERY'    // Optimize database queries
  | 'SWITCH_PROVIDER'   // Switch to cheaper provider
  | 'SCHEDULE_TASK'    // Schedule task for off-peak hours
  | 'UPGRADE_TIER'     // Upgrade to higher tier
  | 'DOWNGRADE_TIER';  // Downgrade to lower tier

// ============================================================================
// RESOURCE ALLOCATION REQUESTS
// ============================================================================

/**
 * Resource allocation request
 */
export interface ResourceAllocationRequest {
  id: string;
  agentId: string;
  taskId?: string;
  sessionId?: string;
  
  // Resource requirements
  requirements: {
    compute: {
      minMS: number;
      maxMS?: number;
      priority: 'low' | 'normal' | 'high' | 'critical';
    };
    aiTokens?: {
      estimatedTokens: number;
      model: string;
      temperature?: number;
      maxTokens?: number;
    };
    storage?: {
      requiredKB: number;
      type: 'hot' | 'cold' | 'archive';
      retentionDays?: number;
    };
    network?: {
      estimatedReqs: number;
      endpoints: string[];
      timeoutMS?: number;
    };
    blockchain?: {
      estimatedLamports: number;
      priority: 'slow' | 'standard' | 'fast';
    };
  };
  
  // Allocation constraints
  constraints: {
    maxCostUSD?: number;
    maxTimeMS?: number;
    requiredBy?: Date;
    allowOverage?: boolean;
    preferFreeQuota?: boolean;
  };
  
  // Request metadata
  metadata: {
    requestId: string;
    userId?: string;
    purpose: string;
    tags?: string[];
  };
  
  // Status
  status: 'pending' | 'approved' | 'allocated' | 'rejected' | 'completed' | 'failed';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Resource allocation response
 */
export interface ResourceAllocationResponse {
  requestId: string;
  allocationId: string;
  status: 'approved' | 'partial' | 'rejected';
  
  // Allocated resources
  allocated: {
    compute: {
      allocatedMS: number;
      actualMS: number;
    };
    aiTokens?: {
      allocatedTokens: number;
      actualTokens: number;
      model: string;
    };
    storage?: {
      allocatedKB: number;
      actualKB: number;
      location: string;
    };
    network?: {
      allocatedReqs: number;
      actualReqs: number;
    };
    blockchain?: {
      allocatedLamports: number;
      actualLamports: number;
      priority: string;
    };
  };
  
  // Cost information
  cost: {
    estimatedCostUSD: number;
    actualCostUSD: number;
    currency: string;
    breakdown: ResourceCost[];
  };
  
  // Time information
  timing: {
    allocatedAt: Date;
    expiresAt?: Date;
    duration: number; // milliseconds
  };
  
  // Response metadata
  metadata: {
    message: string;
    warnings?: string[];
    recommendations?: string[];
  };
}

// ============================================================================
// RESOURCE MONITORING
// ============================================================================

/**
 * Real-time resource metrics
 */
export interface ResourceMetrics {
  agentId: string;
  timestamp: Date;
  
  // Current usage
  current: {
    compute: {
      usageMS: number;
      quotaMS: number;
      utilizationPercent: number;
    };
    aiTokens: {
      usageTokens: number;
      quotaTokens: number;
      utilizationPercent: number;
    };
    storage: {
      usageKB: number;
      quotaKB: number;
      utilizationPercent: number;
    };
    network: {
      usageReqs: number;
      quotaReqs: number;
      utilizationPercent: number;
    };
    blockchain: {
      usageLamports: number;
      quotaLamports: number;
      utilizationPercent: number;
    };
  };
  
  // Performance metrics
  performance: {
    responseTime: {
      avg: number;
      p95: number;
      p99: number;
    };
    throughput: {
      requestsPerSecond: number;
      tokensPerSecond: number;
      computeMSPerSecond: number;
    };
    errorRate: {
      percentage: number;
      count: number;
      totalRequests: number;
    };
    efficiency: {
      costPerTask: number;
      resourceWastePercent: number;
      optimizationScore: number; // 0-100
    };
  };
  
  // Cost metrics
  cost: {
    currentSpendUSD: number;
    projectedDailySpendUSD: number;
    projectedMonthlySpendUSD: number;
    budgetUtilizationPercent: number;
    costPerUnit: {
      compute: number;
      aiTokens: number;
      storage: number;
      network: number;
      blockchain: number;
    };
  };
}

/**
 * Resource alert configuration
 */
export interface ResourceAlert {
  id: string;
  agentId: string;
  type: 'QUOTA_EXCEEDED' | 'BUDGET_WARNING' | 'EFFICIENCY_LOW' | 'COST_SPIKE' | 'RESOURCE_WASTE';
  severity: 'info' | 'warning' | 'error' | 'critical';
  threshold: number;
  currentValue: number;
  message: string;
  resourceType: ResourceType;
  autoResolve: boolean;
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default resource tiers configuration
 */
export const DEFAULT_TIERS: Record<ResourceTier, AgentTier> = {
  FREE: {
    tier: 'FREE',
    name: 'Free Tier',
    description: 'Basic resource allocation for development and testing',
    pricing: {
      compute: {
        baseCostPerMS: 0.00001, // $0.00001 per millisecond
        freeQuotaMS: 3600000 // 1 hour free per day
      },
      aiTokens: {
        baseCostPerToken: 0.000001, // $0.000001 per token
        freeQuotaTokens: 1000000 // 1M tokens free per month
      },
      storage: {
        baseCostPerKB: 0.000001, // $0.000001 per KB
        freeQuotaKB: 10485760 // 10GB free per month
      },
      network: {
        baseCostPerReq: 0.001, // $0.001 per request
        freeQuotaReqs: 10000 // 10K requests free per month
      },
      blockchain: {
        baseCostPerLamport: 0.000001, // $0.000001 per lamport
        freeQuotaLamports: 10000000 // 0.01 SOL free per month
      }
    },
    limits: {
      compute: {
        maxMSPerPeriod: {
          SECONDLY: 1000,
          MINUTELY: 60000,
          HOURLY: 3600000,
          DAILY: 86400000,
          WEEKLY: 604800000,
          MONTHLY: 2592000000
        }
      },
      aiTokens: {
        maxTokensPerPeriod: {
          SECONDLY: 1000,
          MINUTELY: 60000,
          HOURLY: 1000000,
          DAILY: 10000000,
          WEEKLY: 50000000,
          MONTHLY: 1000000000
        }
      },
      storage: {
        maxKBPerPeriod: {
          SECONDLY: 10240,
          MINUTELY: 614400,
          HOURLY: 36864000,
          DAILY: 10485760,
          WEEKLY: 73400320,
          MONTHLY: 314572800
        }
      },
      network: {
        maxReqsPerPeriod: {
          SECONDLY: 10,
          MINUTELY: 600,
          HOURLY: 36000,
          DAILY: 10000,
          WEEKLY: 60000,
          MONTHLY: 250000
        }
      },
      blockchain: {
        maxLamportsPerPeriod: {
          SECONDLY: 1000000,
          MINUTELY: 60000000,
          HOURLY: 3600000000,
          DAILY: 10000000000,
          WEEKLY: 50000000000,
          MONTHLY: 200000000000
        }
      }
    },
    features: ['Basic compute', 'AI tokens', 'Storage', 'Network requests', 'Blockchain transactions'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  PRO: {
    tier: 'PRO',
    name: 'Professional Tier',
    description: 'Enhanced resource allocation for production workloads',
    pricing: {
      compute: {
        baseCostPerMS: 0.000008, // $0.000008 per millisecond (20% discount)
        freeQuotaMS: 7200000 // 2 hours free per day
      },
      aiTokens: {
        baseCostPerToken: 0.0000008, // $0.0000008 per token (20% discount)
        freeQuotaTokens: 5000000 // 5M tokens free per month
      },
      storage: {
        baseCostPerKB: 0.0000008, // $0.0000008 per KB (20% discount)
        freeQuotaKB: 52428800 // 50GB free per month
      },
      network: {
        baseCostPerReq: 0.0008, // $0.0008 per request (20% discount)
        freeQuotaReqs: 50000 // 50K requests free per month
      },
      blockchain: {
        baseCostPerLamport: 0.0000008, // $0.0000008 per lamport (20% discount)
        freeQuotaLamports: 50000000 // 0.05 SOL free per month
      }
    },
    limits: {
      compute: {
        maxMSPerPeriod: {
          SECONDLY: 2000,
          MINUTELY: 120000,
          HOURLY: 7200000,
          DAILY: 172800000,
          WEEKLY: 1209600000,
          MONTHLY: 5184000000
        }
      },
      aiTokens: {
        maxTokensPerPeriod: {
          SECONDLY: 2000,
          MINUTELY: 120000,
          HOURLY: 2000000,
          DAILY: 20000000,
          WEEKLY: 100000000,
          MONTHLY: 2000000000
        }
      },
      storage: {
        maxKBPerPeriod: {
          SECONDLY: 20480,
          MINUTELY: 1228800,
          HOURLY: 73728000,
          DAILY: 209715200,
          WEEKLY: 1468006400,
          MONTHLY: 6291456000
        }
      },
      network: {
        maxReqsPerPeriod: {
          SECONDLY: 20,
          MINUTELY: 1200,
          HOURLY: 72000,
          DAILY: 20000,
          WEEKLY: 120000,
          MONTHLY: 500000
        }
      },
      blockchain: {
        maxLamportsPerPeriod: {
          SECONDLY: 2000000,
          MINUTELY: 120000000,
          HOURLY: 7200000000,
          DAILY: 20000000000,
          WEEKLY: 100000000000,
          MONTHLY: 400000000000
        }
      }
    },
    features: ['Enhanced compute', 'Priority AI tokens', 'Fast storage', 'Priority network', 'Priority blockchain', 'Auto-optimization'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    name: 'Enterprise Tier',
    description: 'Unlimited resource allocation for enterprise workloads',
    pricing: {
      compute: {
        baseCostPerMS: 0.000006, // $0.000006 per millisecond (40% discount)
        freeQuotaMS: 14400000 // 4 hours free per day
      },
      aiTokens: {
        baseCostPerToken: 0.0000006, // $0.0000006 per token (40% discount)
        freeQuotaTokens: 10000000 // 10M tokens free per month
      },
      storage: {
        baseCostPerKB: 0.0000006, // $0.0000006 per KB (40% discount)
        freeQuotaKB: 104857600 // 100GB free per month
      },
      network: {
        baseCostPerReq: 0.0006, // $0.0006 per request (40% discount)
        freeQuotaReqs: 100000 // 100K requests free per month
      },
      blockchain: {
        baseCostPerLamport: 0.0000006, // $0.0000006 per lamport (40% discount)
        freeQuotaLamports: 100000000 // 0.1 SOL free per month
      }
    },
    limits: {
      compute: {
        maxMSPerPeriod: {
          SECONDLY: 5000,
          MINUTELY: 300000,
          HOURLY: 18000000,
          DAILY: 432000000,
          WEEKLY: 3024000000,
          MONTHLY: 12960000000
        }
      },
      aiTokens: {
        maxTokensPerPeriod: {
          SECONDLY: 5000,
          MINUTELY: 300000,
          HOURLY: 5000000,
          DAILY: 50000000,
          WEEKLY: 250000000,
          MONTHLY: 5000000000
        }
      },
      storage: {
        maxKBPerPeriod: {
          SECONDLY: 51200,
          MINUTELY: 3072000,
          HOURLY: 184320000,
          DAILY: 419430400,
          WEEKLY: 2936012800,
          MONTHLY: 12582912000
        }
      },
      network: {
        maxReqsPerPeriod: {
          SECONDLY: 50,
          MINUTELY: 3000,
          HOURLY: 180000,
          DAILY: 50000,
          WEEKLY: 300000,
          MONTHLY: 1000000
        }
      },
      blockchain: {
        maxLamportsPerPeriod: {
          SECONDLY: 5000000,
          MINUTELY: 300000000,
          HOURLY: 18000000000,
          DAILY: 50000000000,
          WEEKLY: 250000000000,
          MONTHLY: 1000000000000
        }
      }
    },
    features: ['Unlimited compute', 'Premium AI tokens', 'Enterprise storage', 'Dedicated network', 'Priority blockchain', 'Advanced optimization', '24/7 support'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

/**
 * Default optimization rules
 */
export const DEFAULT_OPTIMIZATION_RULES: OptimizationRule[] = [
  {
    id: 'high_compute_usage',
    agentId: '',
    name: 'High Compute Usage Alert',
    description: 'Alert when compute usage exceeds 80% of quota',
    condition: 'HIGH_USAGE',
    threshold: 80,
    action: 'NOTIFY',
    autoExecute: false,
    priority: 1,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'low_efficiency',
    agentId: '',
    name: 'Low Efficiency Detection',
    description: 'Detect when resource efficiency drops below 60%',
    condition: 'LOW_EFFICIENCY',
    threshold: 60,
    action: 'OPTIMIZE_QUERY',
    autoExecute: true,
    priority: 2,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'budget_risk',
    agentId: '',
    name: 'Budget Risk Alert',
    description: 'Alert when budget utilization exceeds 90%',
    condition: 'BUDGET_RISK',
    threshold: 90,
    action: 'THROTTLE',
    autoExecute: true,
    priority: 1,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default ResourceType;