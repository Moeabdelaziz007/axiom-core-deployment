/**
 * 🏪 AXIOM AGENT MARKETPLACE TYPES
 * 
 * Comprehensive type definitions for the agent marketplace system including:
 * - Agent discovery and browsing
 * - Marketplace transactions and smart contracts
 * - Agent deployment and customization
 * - Economic system and incentives
 * - Reputation and reviews
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { AgentSuperpower, AgentMetrics } from '../infra/core/AgentSuperpowersFramework';
import { AgentCapability } from './collaboration';

// ============================================================================
// CORE MARKETPLACE TYPES
// ============================================================================

/**
 * Marketplace agent listing with comprehensive metadata
 */
export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: AgentCategory;
  subcategory: string;
  tags: string[];
  capabilities: AgentCapability[];
  superpowers: string[]; // AgentSuperpower IDs
  
  // Performance and reputation
  rating: number; // 0-5 stars
  reviewCount: number;
  reputation: AgentReputation;
  performance: AgentPerformanceMetrics;
  
  // Pricing and availability
  pricing: AgentPricing;
  availability: AgentAvailability;
  deploymentOptions: DeploymentOption[];
  
  // Metadata
  developer: DeveloperInfo;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  verified: boolean;
  
  // Marketplace integration
  marketplaceStats: MarketplaceStats;
  collaborationHistory: CollaborationHistory;
}

/**
 * Agent categories for marketplace organization
 */
export type AgentCategory = 
  | 'business'
  | 'creative'
  | 'technical'
  | 'analytical'
  | 'communication'
  | 'security'
  | 'education'
  | 'entertainment';

/**
 * Agent reputation metrics
 */
export interface AgentReputation {
  overall: number; // 0-100
  reliability: number; // 0-100
  performance: number; // 0-100
  communication: number; // 0-100
  innovation: number; // 0-100
  trustScore: number; // 0-100
  disputeResolution: {
    resolved: number;
    total: number;
    successRate: number;
  };
}

/**
 * Performance metrics specific to marketplace
 */
export interface AgentPerformanceMetrics {
  totalDeployments: number;
  activeDeployments: number;
  averageUptime: number; // percentage
  averageResponseTime: number; // milliseconds
  successRate: number; // percentage
  errorRate: number; // percentage
  userSatisfaction: number; // 0-100
  taskCompletionRate: number; // percentage
  
  // Resource usage
  averageCpuUsage: number; // percentage
  averageMemoryUsage: number; // percentage
  costEfficiency: number; // score 0-100
  
  // Trends
  performanceTrend: 'improving' | 'stable' | 'declining';
  popularityTrend: 'rising' | 'stable' | 'falling';
}

/**
 * Agent pricing structure
 */
export interface AgentPricing {
  model: 'free' | 'subscription' | 'pay-per-use' | 'one-time' | 'hybrid';
  
  // Subscription pricing
  monthlyPrice?: number;
  yearlyPrice?: number;
  
  // Pay-per-use pricing
  costPerTask?: number;
  costPerMinute?: number;
  costPerApiCall?: number;
  
  // One-time pricing
  purchasePrice?: number;
  
  // Currency
  currency: 'SOL' | 'USDC' | 'AXIOM';
  
  // Discounts
  trialPeriodDays?: number;
  bulkDiscounts?: BulkDiscount[];
  
  // Dynamic pricing
  surgeMultiplier?: number;
  demandBasedPricing?: boolean;
}

/**
 * Bulk discount tiers
 */
export interface BulkDiscount {
  minQuantity: number;
  maxQuantity?: number;
  discountPercentage: number;
}

/**
 * Agent availability status
 */
export interface AgentAvailability {
  status: 'available' | 'busy' | 'maintenance' | 'deprecated';
  capacity: {
    maxConcurrentUsers: number;
    currentUsers: number;
    utilizationRate: number;
  };
  schedule?: {
    timezone: string;
    workingHours: {
      start: string; // HH:MM
      end: string; // HH:MM
    };
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  sla: {
    uptime: number; // percentage
    responseTime: number; // milliseconds
    supportResponseTime: number; // hours
  };
}

/**
 * Deployment options for agents
 */
export interface DeploymentOption {
  id: string;
  name: string;
  description: string;
  type: 'cloud' | 'edge' | 'on-premise' | 'hybrid';
  
  // Resource requirements
  resources: {
    cpu: string;
    memory: string;
    storage: string;
    bandwidth?: string;
  };
  
  // Infrastructure requirements
  infrastructure: {
    platforms: string[];
    dependencies: string[];
    dockerImage?: string;
    kubernetesManifest?: string;
  };
  
  // Configuration
  configuration: {
    environmentVariables: Record<string, string>;
    configFiles: string[];
    secrets: string[];
  };
  
  // Pricing
  deploymentCost: number;
  currency: 'SOL' | 'USDC' | 'AXIOM';
}

/**
 * Developer information
 */
export interface DeveloperInfo {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  website?: string;
  verified: boolean;
  reputation: number; // 0-100
  
  // Social links
  github?: string;
  twitter?: string;
  linkedin?: string;
  
  // Company info
  company?: string;
  companySize?: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
}

/**
 * Marketplace statistics for agent
 */
export interface MarketplaceStats {
  views: number;
  downloads: number;
  deployments: number;
  revenue: {
    total: number;
    monthly: number;
    currency: 'SOL' | 'USDC' | 'AXIOM';
  };
  favorites: number;
  shares: number;
  comparisonCount: number;
}

/**
 * Collaboration history
 */
export interface CollaborationHistory {
  totalCollaborations: number;
  successfulCollaborations: number;
  averageCollaborationRating: number;
  recentPartners: string[];
  collaborationTypes: string[];
}

// ============================================================================
// SEARCH AND DISCOVERY TYPES
// ============================================================================

/**
 * Search filters for marketplace
 */
export interface MarketplaceSearchFilters {
  query?: string;
  category?: AgentCategory;
  subcategories?: string[];
  tags?: string[];
  pricing?: {
    model: AgentPricing['model'][];
    minPrice?: number;
    maxPrice?: number;
    currency?: 'SOL' | 'USDC' | 'AXIOM';
  };
  rating?: {
    min: number;
    max: number;
  };
  features?: string[];
  capabilities?: string[];
  developer?: string;
  verified?: boolean;
  featured?: boolean;
  availability?: AgentAvailability['status'][];
  
  // Advanced filters
  performance?: {
    minSuccessRate?: number;
    maxResponseTime?: number;
    minUptime?: number;
  };
  
  deployment?: {
    type: DeploymentOption['type'][];
    platforms?: string[];
  };
  
  sorting?: SearchSorting;
  pagination?: {
    page: number;
    limit: number;
  };
}

/**
 * Search sorting options
 */
export type SearchSorting = 
  | 'relevance'
  | 'rating-desc'
  | 'rating-asc'
  | 'price-desc'
  | 'price-asc'
  | 'popularity-desc'
  | 'popularity-asc'
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc';

/**
 * Search results
 */
export interface MarketplaceSearchResults {
  agents: MarketplaceAgent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: SearchFacets;
  suggestions?: string[];
}

/**
 * Search facets for filtering
 */
export interface SearchFacets {
  categories: { [key: string]: number };
  subcategories: { [key: string]: number };
  tags: { [key: string]: number };
  pricingModels: { [key: string]: number };
  ratings: { [key: string]: number };
  developers: { [key: string]: number };
  features: { [key: string]: number };
  deploymentTypes: { [key: string]: number };
}

// ============================================================================
// TRANSACTION AND ECONOMIC TYPES
// ============================================================================

/**
 * Marketplace transaction
 */
export interface MarketplaceTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  
  // Parties
  buyer: {
    id: string;
    wallet: string;
  };
  seller: {
    id: string;
    wallet: string;
  };
  
  // Agent details
  agentId: string;
  agentVersion: string;
  deploymentType: DeploymentOption['type'];
  
  // Financial details
  amount: number;
  currency: 'SOL' | 'USDC' | 'AXIOM';
  fee: {
    marketplace: number;
    platform: number;
    total: number;
  };
  
  // Smart contract details
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  confirmations?: number;
  
  // Escrow details
  escrow?: {
    releaseDate: Date;
    conditions: string[];
    released: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Metadata
  metadata: Record<string, any>;
  reviews?: TransactionReview[];
}

/**
 * Transaction types
 */
export type TransactionType = 
  | 'purchase'
  | 'subscription'
  | 'usage'
  | 'deployment'
  | 'collaboration'
  | 'customization'
  | 'upgrade';

/**
 * Transaction status
 */
export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

/**
 * Transaction review
 */
export interface TransactionReview {
  id: string;
  transactionId: string;
  reviewerId: string;
  agentId: string;
  rating: number; // 1-5
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Smart contract for marketplace transactions
 */
export interface MarketplaceSmartContract {
  address: string;
  abi: any[];
  bytecode: string;
  
  // Contract functions
  functions: {
    purchaseAgent: (agentId: string, buyer: string, amount: number) => Promise<string>;
    deployAgent: (agentId: string, config: DeploymentConfig) => Promise<string>;
    releaseEscrow: (transactionId: string) => Promise<boolean>;
    disputeTransaction: (transactionId: string, reason: string) => Promise<boolean>;
    refundTransaction: (transactionId: string) => Promise<boolean>;
  };
  
  // Events
  events: {
    AgentPurchased: (transactionId: string, agentId: string, buyer: string) => void;
    AgentDeployed: (deploymentId: string, agentId: string, owner: string) => void;
    EscrowReleased: (transactionId: string, amount: number) => void;
    TransactionDisputed: (transactionId: string, reason: string) => void;
  };
}

// ============================================================================
// DEPLOYMENT TYPES
// ============================================================================

/**
 * Agent deployment configuration
 */
export interface DeploymentConfig {
  id: string;
  agentId: string;
  agentVersion: string;
  
  // Deployment target
  target: {
    type: DeploymentOption['type'];
    platform: string;
    region?: string;
    environment: 'development' | 'staging' | 'production';
  };
  
  // Resource allocation
  resources: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth?: number;
  };
  
  // Configuration
  configuration: {
    environmentVariables: Record<string, string>;
    secrets: Record<string, string>;
    configFiles: Record<string, string>;
  };
  
  // Scaling
  scaling: {
    minInstances: number;
    maxInstances: number;
    autoScaling: boolean;
    metrics: string[];
  };
  
  // Monitoring
  monitoring: {
    enabled: boolean;
    metrics: string[];
    alerts: AlertConfig[];
    logs: LogConfig;
  };
  
  // Security
  security: {
    encryption: boolean;
    accessControl: AccessControlConfig;
    compliance: string[];
  };
  
  // Owner
  owner: {
    id: string;
    wallet: string;
  };
  
  // Status
  status: DeploymentStatus;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deployedAt?: Date;
  
  // Version control
  version: {
    current: string;
    history: DeploymentVersion[];
    rollbackEnabled: boolean;
  };
}

/**
 * Deployment status
 */
export type DeploymentStatus = 
  | 'pending'
  | 'deploying'
  | 'running'
  | 'stopped'
  | 'failed'
  | 'updating'
  | 'rolling-back'
  | 'deleted';

/**
 * Deployment version history
 */
export interface DeploymentVersion {
  version: string;
  deployedAt: Date;
  deployedBy: string;
  changes: string[];
  rollbackAvailable: boolean;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[]; // email, slack, discord, etc.
  enabled: boolean;
}

/**
 * Log configuration
 */
export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  retention: number; // days
  destinations: string[];
  structured: boolean;
}

/**
 * Access control configuration
 */
export interface AccessControlConfig {
  authentication: boolean;
  authorization: boolean;
  roles: string[];
  permissions: Record<string, string[]>;
  rateLimiting?: {
    requests: number;
    window: number; // seconds
  };
}

// ============================================================================
// CUSTOMIZATION TYPES
// ============================================================================

/**
 * Agent customization configuration
 */
export interface AgentCustomization {
  id: string;
  agentId: string;
  
  // Visual customization
  appearance: {
    avatar?: string;
    theme: AgentTheme;
    branding: {
      logo?: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
      fonts: {
        primary: string;
        secondary: string;
      };
    };
  };
  
  // Personality customization
  personality: {
    name?: string;
    description?: string;
    traits: PersonalityTrait[];
    communicationStyle: CommunicationStyle;
    language: string;
    tone: AgentTone;
  };
  
  // Skills and capabilities
  skills: {
    enabled: string[];
    disabled: string[];
    priorities: SkillPriority[];
    customizations: Record<string, any>;
  };
  
  // Behavior customization
  behavior: {
    responsePatterns: ResponsePattern[];
    decisionRules: DecisionRule[];
    automation: AutomationRule[];
  };
  
  // Integration customization
  integrations: {
    apis: ApiIntegration[];
    webhooks: WebhookConfig[];
    databases: DatabaseConfig[];
    services: ServiceConfig[];
  };
  
  // Performance tuning
  performance: {
    optimization: PerformanceOptimization;
    caching: CachingConfig;
    monitoring: CustomMonitoringConfig;
  };
  
  // Owner
  owner: {
    id: string;
    wallet: string;
  };
  
  // Status
  status: 'draft' | 'active' | 'archived';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Version control
  version: {
    current: string;
    history: CustomizationVersion[];
  };
}

/**
 * Agent theme
 */
export interface AgentTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    warning: string;
    success: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: string;
  shadows: string[];
}

/**
 * Personality trait
 */
export interface PersonalityTrait {
  name: string;
  value: number; // 0-100
  description: string;
}

/**
 * Communication style
 */
export interface CommunicationStyle {
  formality: 'very-formal' | 'formal' | 'neutral' | 'casual' | 'very-casual';
  verbosity: 'concise' | 'balanced' | 'detailed' | 'comprehensive';
  empathy: number; // 0-100
  humor: number; // 0-100
  proactivity: number; // 0-100
}

/**
 * Agent tone
 */
export type AgentTone = 
  | 'professional'
  | 'friendly'
  | 'enthusiastic'
  | 'calm'
  | 'authoritative'
  | 'supportive'
  | 'technical'
  | 'creative';

/**
 * Skill priority
 */
export interface SkillPriority {
  skillId: string;
  priority: number; // 1-10
  enabled: boolean;
}

/**
 * Response pattern
 */
export interface ResponsePattern {
  id: string;
  trigger: string;
  pattern: string;
  response: string;
  priority: number;
  enabled: boolean;
}

/**
 * Decision rule
 */
export interface DecisionRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

/**
 * Automation rule
 */
export interface AutomationRule {
  id: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  enabled: boolean;
  schedule?: string; // cron expression
}

/**
 * API integration
 */
export interface ApiIntegration {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'websocket' | 'grpc';
  endpoint: string;
  authentication: {
    type: 'none' | 'api-key' | 'oauth2' | 'bearer' | 'basic';
    credentials: Record<string, string>;
  };
  configuration: Record<string, any>;
  enabled: boolean;
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  authentication: {
    type: 'none' | 'api-key' | 'signature';
    credentials: Record<string, string>;
  };
  retryPolicy: {
    maxAttempts: number;
    backoff: number;
  };
  enabled: boolean;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch';
  connection: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  configuration: Record<string, any>;
  enabled: boolean;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  id: string;
  name: string;
  type: string;
  configuration: Record<string, any>;
  enabled: boolean;
}

/**
 * Performance optimization
 */
export interface PerformanceOptimization {
  caching: boolean;
  compression: boolean;
  minification: boolean;
  lazyLoading: boolean;
  connectionPooling: boolean;
  queryOptimization: boolean;
}

/**
 * Caching configuration
 */
export interface CachingConfig {
  enabled: boolean;
  type: 'memory' | 'redis' | 'memcached';
  configuration: Record<string, any>;
  ttl: number; // seconds
  maxSize: number; // MB
}

/**
 * Custom monitoring configuration
 */
export interface CustomMonitoringConfig {
  enabled: boolean;
  metrics: string[];
  intervals: {
    collection: number; // seconds
    aggregation: number; // seconds
  };
  retention: number; // days
}

/**
 * Customization version
 */
export interface CustomizationVersion {
  version: string;
  createdAt: Date;
  createdBy: string;
  changes: string[];
  rollbackAvailable: boolean;
}

// ============================================================================
// ECONOMIC SYSTEM TYPES
// ============================================================================

/**
 * Token economy configuration
 */
export interface TokenEconomy {
  tokens: {
    SOL: TokenConfig;
    USDC: TokenConfig;
    AXIOM: TokenConfig;
  };
  
  // Staking
  staking: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    rewards: {
      annualRate: number;
      distribution: 'daily' | 'weekly' | 'monthly';
    };
    lockupPeriods: LockupPeriod[];
  };
  
  // Governance
  governance: {
    enabled: boolean;
    votingPower: VotingPowerConfig;
    proposals: ProposalConfig;
    quorum: number; // percentage
  };
  
  // Incentives
  incentives: {
    rewards: RewardConfig[];
    achievements: AchievementConfig[];
    leaderboards: LeaderboardConfig[];
  };
  
  // Revenue sharing
  revenueSharing: {
    enabled: boolean;
    distribution: RevenueDistribution[];
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}

/**
 * Token configuration
 */
export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  totalSupply: number;
  circulatingSupply: number;
  price: {
    usd: number;
    change24h: number;
  };
}

/**
 * Lockup period for staking
 */
export interface LockupPeriod {
  duration: number; // days
  multiplier: number; // reward multiplier
  earlyWithdrawalPenalty: number; // percentage
}

/**
 * Voting power configuration
 */
export interface VotingPowerConfig {
  basePower: number;
  stakingMultiplier: number;
  reputationMultiplier: number;
  contributionMultiplier: number;
}

/**
 * Proposal configuration
 */
export interface ProposalConfig {
  minVotingPeriod: number; // hours
  maxVotingPeriod: number; // hours
  executionDelay: number; // hours
  minQuorum: number; // percentage
}

/**
 * Reward configuration
 */
export interface RewardConfig {
  id: string;
  name: string;
  description: string;
  type: 'one-time' | 'recurring' | 'milestone';
  trigger: string;
  amount: number;
  token: 'SOL' | 'USDC' | 'AXIOM';
  conditions: string[];
  enabled: boolean;
}

/**
 * Achievement configuration
 */
export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: string[];
  rewards: {
    tokens: number;
    tokenType: 'SOL' | 'USDC' | 'AXIOM';
    reputation: number;
  };
}

/**
 * Leaderboard configuration
 */
export interface LeaderboardConfig {
  id: string;
  name: string;
  description: string;
  type: 'reputation' | 'earnings' | 'contributions' | 'deployments';
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  maxEntries: number;
  rewards: {
    top1: number;
    top2: number;
    top3: number;
    top10: number;
  };
}

/**
 * Revenue distribution
 */
export interface RevenueDistribution {
  recipient: string;
  percentage: number;
  type: 'developer' | 'platform' | 'treasury' | 'rewards';
}

// ============================================================================
// DISPUTE RESOLUTION TYPES
// ============================================================================

/**
 * Dispute case
 */
export interface DisputeCase {
  id: string;
  transactionId: string;
  
  // Parties
  complainant: {
    id: string;
    wallet: string;
  };
  respondent: {
    id: string;
    wallet: string;
  };
  
  // Case details
  type: DisputeType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: Evidence[];
  
  // Resolution
  status: DisputeStatus;
  resolution?: DisputeResolution;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Moderation
  moderator?: {
    id: string;
    assignedAt: Date;
  };
  
  // Smart contract
  contractAddress?: string;
  arbitrationFee?: number;
}

/**
 * Dispute type
 */
export type DisputeType = 
  | 'payment'
  | 'performance'
  | 'delivery'
  | 'quality'
  | 'fraud'
  | 'misrepresentation'
  | 'other';

/**
 * Dispute status
 */
export type DisputeStatus = 
  | 'filed'
  | 'under-review'
  | 'investigating'
  | 'mediating'
  | 'arbitrating'
  | 'resolved'
  | 'dismissed'
  | 'escalated';

/**
 * Evidence
 */
export interface Evidence {
  id: string;
  type: 'screenshot' | 'log' | 'document' | 'recording' | 'testimony';
  description: string;
  url?: string;
  data?: any;
  submittedBy: string;
  submittedAt: Date;
  verified: boolean;
}

/**
 * Dispute resolution
 */
export interface DisputeResolution {
  outcome: DisputeOutcome;
  reasoning: string;
  actions: ResolutionAction[];
  compensation?: Compensation;
  penalties?: Penalty[];
}

/**
 * Dispute outcome
 */
export type DisputeOutcome = 
  | 'favor-complainant'
  | 'favor-respondent'
  | 'partial-complainant'
  | 'partial-respondent'
  | 'mutual-agreement'
  | 'no-fault';

/**
 * Resolution action
 */
export interface ResolutionAction {
  type: 'refund' | 'penalty' | 'warning' | 'suspension' | 'ban' | 'other';
  description: string;
  target: string;
  amount?: number;
  currency?: 'SOL' | 'USDC' | 'AXIOM';
  duration?: number; // days
}

/**
 * Compensation
 */
export interface Compensation {
  amount: number;
  currency: 'SOL' | 'USDC' | 'AXIOM';
  recipient: string;
  reason: string;
}

/**
 * Penalty
 */
export interface Penalty {
  type: 'fine' | 'suspension' | 'reputation-deduction' | 'other';
  amount?: number;
  currency?: 'SOL' | 'USDC' | 'AXIOM';
  duration?: number; // days
  description: string;
}

// ============================================================================
// ANALYTICS AND MONITORING TYPES
// ============================================================================

/**
 * Marketplace analytics
 */
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
    agentGrowth: TrendData[];
    transactionVolume: TrendData[];
    userActivity: TrendData[];
    revenue: TrendData[];
  };
  
  performance: {
    topPerformingAgents: AgentPerformance[];
    worstPerformingAgents: AgentPerformance[];
    categoryPerformance: CategoryPerformance[];
  };
  
  economic: {
    tokenDistribution: TokenDistribution[];
    stakingMetrics: StakingMetrics;
    governanceMetrics: GovernanceMetrics;
  };
  
  userBehavior: {
    searchPatterns: SearchPattern[];
    conversionFunnel: ConversionFunnel[];
    retentionMetrics: RetentionMetrics;
  };
}

/**
 * Trend data
 */
export interface TrendData {
  date: Date;
  value: number;
  change?: number;
  changePercent?: number;
}

/**
 * Agent performance
 */
export interface AgentPerformance {
  agentId: string;
  agentName: string;
  rating: number;
  deployments: number;
  revenue: number;
  uptime: number;
  responseTime: number;
}

/**
 * Category performance
 */
export interface CategoryPerformance {
  category: AgentCategory;
  agentCount: number;
  totalDeployments: number;
  totalRevenue: number;
  averageRating: number;
  growth: number;
}

/**
 * Token distribution
 */
export interface TokenDistribution {
  holder: string;
  balance: number;
  percentage: number;
  type: 'user' | 'developer' | 'treasury' | 'staking' | 'rewards';
}

/**
 * Staking metrics
 */
export interface StakingMetrics {
  totalStaked: number;
  stakers: number;
  averageStake: number;
  rewardsDistributed: number;
  apr: number;
}

/**
 * Governance metrics
 */
export interface GovernanceMetrics {
  activeProposals: number;
  completedProposals: number;
  voterTurnout: number;
  averageVotingTime: number;
}

/**
 * Search pattern
 */
export interface SearchPattern {
  query: string;
  frequency: number;
  conversionRate: number;
  averageResults: number;
}

/**
 * Conversion funnel
 */
export interface ConversionFunnel {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

/**
 * Retention metrics
 */
export interface RetentionMetrics {
  period: string;
  newUsers: number;
  returningUsers: number;
  retentionRate: number;
  churnRate: number;
}

export default MarketplaceAgent;