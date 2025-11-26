export interface MarketplaceAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  capabilities: any[];
  imageUrl: string;
  avatar: string;
  category: 'business' | 'creative' | 'technical' | 'analytical' | 'communication' | 'security' | 'education' | 'entertainment' | 'finance' | 'legal' | 'real-estate' | 'commerce' | 'general';
  subcategory: string;
  tags: string[];
  superpowers: string[];
  reviewCount: number;
  reputation: {
    overall: number;
    reliability: number;
    performance: number;
    communication: number;
    innovation: number;
    trustScore: number;
    disputeResolution: {
      resolved: number;
      total: number;
      successRate: number;
    };
  };
  performance: {
    totalDeployments: number;
    activeDeployments: number;
    averageUptime: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    userSatisfaction: number;
    taskCompletionRate: number;
    averageCpuUsage: number;
    averageMemoryUsage: number;
    costEfficiency: number;
    performanceTrend: string;
    popularityTrend: string;
  };
  pricing: {
    model: 'free' | 'subscription' | 'pay-per-use' | 'one-time' | 'hybrid';
    monthlyPrice?: number;
    yearlyPrice?: number;
    purchasePrice?: number;
    currency: 'SOL' | 'USDC' | 'AXIOM';
    trialPeriodDays?: number;
  };
  availability: {
    status: 'available' | 'busy' | 'maintenance' | 'deprecated';
    capacity: {
      maxConcurrentUsers: number;
      currentUsers: number;
      utilizationRate: number;
    };
    sla: {
      uptime: number;
      responseTime: number;
      supportResponseTime: number;
    };
  };
  deploymentOptions: DeploymentOption[];
  developer: {
    id: string;
    name: string;
    bio: string;
    verified: boolean;
    reputation: number;
  };
  version: string;
  featured: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  marketplaceStats: {
    views: number;
    downloads: number;
    deployments: number;
    revenue: {
      total: number;
      monthly: number;
      currency: string;
    };
    favorites: number;
    shares: number;
    comparisonCount: number;
  };
}

export interface DeploymentOption {
  id: string;
  name: string;
  description: string;
  type: 'cloud' | 'edge' | 'on-premise' | 'hybrid';
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  infrastructure: {
    platforms: string[];
    dependencies: string[];
  };
  configuration: {
    environmentVariables: Record<string, string>;
    configFiles: string[];
    secrets: string[];
  };
  deploymentCost: number;
  currency: 'SOL' | 'USDC' | 'AXIOM';
}

/**
 * 6. Team Bundle Definition (The Lake Squad Product)
 */
export interface TeamBundle {
  bundleId: string;
  name: string; // e.g., "Lake Alpha Squad"
  description: string;
  cost: {
    monthlyPrice: number; // 0.99
    currency: 'USDC' | 'AXIOM';
  };

  // Agents included in this bundle
  agentComposition: {
    agentId: string;
    role: string; // e.g., 'Lead Strategist', 'Technical Executor'
    minLevel: number;
  }[];

  // Configuration that is automatically applied to the team
  defaultCollaborationGoal: string; // e.g., "Maximize profit from e-commerce"
  deploymentStatus: 'available' | 'restricted';
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'subscription';
  itemId: string; // agentId or bundleId
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export interface MarketplaceSearchFilters {
  query?: string;
  category?: 'business' | 'creative' | 'technical' | 'analytical' | 'communication' | 'security' | 'education' | 'entertainment';
  subcategories?: string[];
  tags?: string[];
  pricing?: {
    model?: ('free' | 'subscription' | 'pay-per-use' | 'one-time' | 'hybrid')[];
    minPrice?: number;
    maxPrice?: number;
    currency?: 'SOL' | 'USDC' | 'AXIOM';
  };
  rating?: {
    min?: number;
    max?: number;
  };
  features?: string[];
  capabilities?: string[];
  developer?: string;
  verified?: boolean;
  featured?: boolean;
  availability?: ('available' | 'busy' | 'maintenance' | 'deprecated')[];
  performance?: {
    minSuccessRate?: number;
    maxResponseTime?: number;
    minUptime?: number;
  };
  deployment?: {
    type?: ('cloud' | 'edge' | 'on-premise' | 'hybrid')[];
    platforms?: string[];
  };
  sorting?: 'relevance' | 'rating-desc' | 'rating-asc' | 'price-desc' | 'price-asc' | 'popularity-desc' | 'popularity-asc' | 'newest' | 'oldest' | 'name-asc' | 'name-desc';
  pagination?: {
    page: number;
    limit: number;
  };
}

export type SearchSorting = 'relevance' | 'rating-desc' | 'rating-asc' | 'price-desc' | 'price-asc' | 'popularity-desc' | 'popularity-asc' | 'newest' | 'oldest' | 'name-asc' | 'name-desc';
export interface MarketplaceSearchResults {
  agents: MarketplaceAgent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: any;
  suggestions?: string[];
}

export interface MarketplaceTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  buyer: {
    id: string;
    wallet: string;
  };
  seller: {
    id: string;
    wallet: string;
  };
  agentId: string;
  agentVersion: string;
  deploymentType: string;
  amount: number;
  currency: 'SOL' | 'USDC' | 'AXIOM';
  fee: any;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  confirmations?: number;
  escrow?: {
    releaseDate: Date;
    conditions: string[];
    released: boolean;
  };
  metadata: Record<string, any>;
}

export type TransactionType = 'purchase' | 'subscription' | 'deployment' | 'collaboration' | 'customization' | 'dispute' | 'usage' | 'upgrade';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'disputed' | 'refunded';

export interface DeploymentConfig {
  id: string;
  agentId: string;
  agentVersion: string;
  target: {
    platform: string;
    environment: string;
    region?: string;
  };
  resources: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth?: number;
  };
  configuration: {
    environmentVariables: Record<string, string>;
    configFiles: string[];
    secrets: string[];
  };
  status: 'pending' | 'deploying' | 'running' | 'failed' | 'stopped' | 'updating' | 'rolling-back';
  owner: {
    id: string;
    wallet: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deployedAt?: Date;
  version: {
    current: string;
    history: any[];
    rollbackEnabled: boolean;
  };
}

export interface AgentCustomization {
  id: string;
  agentId: string;
  owner: {
    id: string;
    wallet: string;
  };
  personality: {
    name: string;
    description: string;
    traits: string[];
    communicationStyle: {
      formality: 'formal' | 'neutral' | 'casual';
      verbosity: 'concise' | 'balanced' | 'detailed';
      empathy: number;
      humor: number;
      proactivity: number;
    };
    language: string;
    tone: string;
  };
  skills: {
    enabled: string[];
    disabled: string[];
    priorities: string[];
    customizations: Record<string, any>;
  };
  behavior: {
    responsePatterns: string[];
    decisionRules: string[];
    automation: string[];
  };
  integrations: {
    apis: any[];
    webhooks: any[];
    databases: any[];
    services: any[];
  };
  performance: {
    optimization: {
      caching: boolean;
      compression: boolean;
      minification: boolean;
      lazyLoading: boolean;
      connectionPooling: boolean;
      queryOptimization: boolean;
    };
    caching: {
      enabled: boolean;
      type: 'memory' | 'redis' | 'database';
      configuration: Record<string, any>;
      ttl: number;
      maxSize: number;
    };
    monitoring: {
      enabled: boolean;
      metrics: string[];
      intervals: {
        collection: number;
        aggregation: number;
      };
      retention: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  version: {
    current: string;
    history: any[];
  };
}

export interface TokenEconomy {
  totalSupply: number;
  circulatingSupply: number;
  stakingPool: number;
  rewards: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  governance: {
    votingPower: number;
    proposals: number;
    quorum: number;
  };
}

export interface DisputeCase {
  id: string;
  transactionId: string;
  complainant: {
    id: string;
    wallet: string;
  };
  respondent: {
    id: string;
    wallet: string;
  };
  type: string;
  severity: string;
  description: string;
  evidence: any[];
  status: 'filed' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: {
    outcome: string;
    compensation?: number;
    actions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketplaceAnalytics {
  overview: {
    totalAgents: number;
    activeAgents: number;
    totalTransactions: number;
    totalVolume: number;
    activeUsers: number;
    averageRating: number;
  };
  trends: {
    agentGrowth: any[];
    transactionVolume: any[];
    userActivity: any[];
    revenue: any[];
  };
  performance: {
    topPerformingAgents: any[];
    worstPerformingAgents: any[];
    categoryPerformance: any[];
  };
  economic: {
    tokenDistribution: any[];
    stakingMetrics: {
      totalStaked: number;
      stakers: number;
      averageStake: number;
      rewardsDistributed: number;
      apr: number;
    };
    governanceMetrics: {
      activeProposals: number;
      completedProposals: number;
      voterTurnout: number;
      averageVotingTime: number;
    };
  };
  userBehavior: {
    searchPatterns: any[];
    conversionFunnel: any[];
    retentionMetrics: any[];
  };
}