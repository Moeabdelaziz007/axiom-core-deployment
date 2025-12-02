/**
 * Memory Retrieval with Context - Type Definitions
 * 
 * This module defines comprehensive TypeScript interfaces and Zod schemas
 * for the memory retrieval system that provides intelligent, context-aware
 * memory access for sovereign agents.
 */

import { z } from 'zod';
import { TrustLevel } from '../aix/data-lineage';
import { ThoughtUnit, ReActTrace } from '../aix/schema';

/**
 * Retrieval Strategy - Different approaches to memory retrieval
 * 
 * Defines how the system should search and rank memory items
 * based on different algorithms and heuristics.
 */
export const RetrievalStrategySchema = z.enum([
  'semantic',      // Vector-based similarity search
  'keyword',       // Traditional text search with indexing
  'hybrid',        // Combined semantic and keyword search
  'temporal',      // Time-based search with recency weighting
  'contextual',    // Context-aware search with relevance scoring
  'trust_based',   // Trust-score weighted search
  'adaptive',      // Adaptive strategy based on query characteristics
]);

export type RetrievalStrategy = z.infer<typeof RetrievalStrategySchema>;

/**
 * Retrieval Query - Complex query definition for memory search
 * 
 * Supports advanced filtering, ranking, and search strategies
 * for sophisticated memory retrieval operations.
 */
export const RetrievalQuerySchema = z.object({
  // Core query
  query: z.string().describe('Search query text'),
  context: z.string().optional().describe('Additional context for query'),
  
  // Search strategy
  strategy: RetrievalStrategySchema.default('semantic').describe('Retrieval strategy to use'),
  
  // Content filters
  contentTypes: z.array(z.enum(['thought', 'trace', 'observation', 'action'])).optional().describe('Content types to search'),
  tags: z.array(z.string()).optional().describe('Tags to filter by'),
  categories: z.array(z.string()).optional().describe('Categories to filter by'),
  
  // Agent and session filters
  agentId: z.string().optional().describe('Filter by agent ID'),
  agentIds: z.array(z.string()).optional().describe('Filter by multiple agent IDs'),
  sessionId: z.string().optional().describe('Filter by session ID'),
  
  // Temporal filters
  timeRange: z.object({
    start: z.number().optional().describe('Start timestamp'),
    end: z.number().optional().describe('End timestamp'),
    relative: z.enum(['last_hour', 'last_day', 'last_week', 'last_month']).optional().describe('Relative time range'),
  }).optional().describe('Time range filter'),
  
  // Quality and trust filters
  minConfidence: z.number().min(0).max(1).optional().describe('Minimum confidence level'),
  minTrustLevel: z.enum(['unverified', 'low', 'medium', 'high', 'verified', 'authoritative']).optional().describe('Minimum trust level'),
  minTrustScore: z.number().min(0).max(1).optional().describe('Minimum trust score'),
  
  // Search parameters
  limit: z.number().default(10).describe('Maximum results to return'),
  offset: z.number().default(0).describe('Offset for pagination'),
  threshold: z.number().min(0).max(1).default(0.7).describe('Similarity threshold'),
  
  // Ranking and scoring
  ranking: z.object({
    semantic: z.number().default(0.4).describe('Weight for semantic similarity'),
    temporal: z.number().default(0.2).describe('Weight for temporal relevance'),
    trust: z.number().default(0.2).describe('Weight for trust score'),
    frequency: z.number().default(0.1).describe('Weight for access frequency'),
    relevance: z.number().default(0.1).describe('Weight for context relevance'),
  }).optional().describe('Custom ranking weights'),
  
  // Advanced options
  includeContent: z.boolean().default(true).describe('Include full content in results'),
  includeMetadata: z.boolean().default(true).describe('Include metadata in results'),
  includeRelated: z.boolean().default(false).describe('Include related memories'),
  maxRelated: z.number().default(5).describe('Maximum related memories to include'),
  
  // Performance options
  useCache: z.boolean().default(true).describe('Use cache for this query'),
  cacheTTL: z.number().optional().describe('Cache time-to-live in ms'),
  
  // Query metadata
  queryId: z.string().optional().describe('Unique query identifier'),
  userId: z.string().optional().describe('User ID making the query'),
  purpose: z.enum(['general', 'decision', 'learning', 'planning', 'analysis']).optional().describe('Query purpose'),
  
  // Experimental features
  enableReranking: z.boolean().default(false).describe('Enable result reranking'),
  enableDiversity: z.boolean().default(false).describe('Enable result diversity'),
  enableExplanation: z.boolean().default(false).describe('Include result explanations'),
});

export type RetrievalQuery = z.infer<typeof RetrievalQuerySchema>;

/**
 * Retrieval Result - Individual memory search result
 * 
 * Contains comprehensive information about a retrieved memory item
 * including scoring, relevance, and contextual information.
 */
export const RetrievalResultSchema = z.object({
  // Core identification
  id: z.string().describe('Memory entry ID'),
  type: z.enum(['thought', 'trace', 'observation', 'action']).describe('Memory type'),
  content: z.string().describe('Memory content'),
  
  // Scoring and relevance
  relevanceScore: z.number().describe('Overall relevance score'),
  semanticScore: z.number().optional().describe('Semantic similarity score'),
  keywordScore: z.number().optional().describe('Keyword match score'),
  temporalScore: z.number().optional().describe('Temporal relevance score'),
  trustScore: z.number().optional().describe('Trust-based score'),
  frequencyScore: z.number().optional().describe('Access frequency score'),
  
  // Quality metrics
  confidence: z.number().optional().describe('Confidence score'),
  trustLevel: TrustLevel.optional().describe('Trust level'),
  
  // Metadata
  agentId: z.string().describe('Agent ID'),
  sessionId: z.string().optional().describe('Session ID'),
  timestamp: z.number().describe('Creation timestamp'),
  tags: z.array(z.string()).default([]).describe('Tags'),
  category: z.string().optional().describe('Content category'),
  
  // AIX Integration
  thoughtId: z.string().optional().describe('Associated thought ID'),
  traceId: z.string().optional().describe('Associated trace ID'),
  
  // Context and relationships
  context: z.string().optional().describe('Additional context'),
  highlights: z.array(z.string()).optional().describe('Search highlights'),
  relatedMemories: z.array(z.string()).optional().describe('Related memory IDs'),
  parentMemories: z.array(z.string()).optional().describe('Parent memory IDs'),
  childMemories: z.array(z.string()).optional().describe('Child memory IDs'),
  
  // Performance metrics
  accessCount: z.number().optional().describe('Access frequency'),
  lastAccessed: z.number().optional().describe('Last access timestamp'),
  
  // Explanation (if enabled)
  explanation: z.string().optional().describe('Explanation of relevance'),
  
  // Raw data (if requested)
  rawData: z.any().optional().describe('Raw memory data'),
});

export type RetrievalResult = z.infer<typeof RetrievalResultSchema>;

/**
 * Retrieval Response - Complete response for memory search
 * 
 * Contains search results, metadata, and performance information
 * for a memory retrieval operation.
 */
export const RetrievalResponseSchema = z.object({
  // Results
  results: z.array(RetrievalResultSchema).describe('Search results'),
  totalCount: z.number().describe('Total number of matching results'),
  hasMore: z.boolean().describe('Whether more results are available'),
  
  // Query information
  query: z.string().describe('Original query'),
  strategy: RetrievalStrategySchema.describe('Strategy used'),
  queryId: z.string().optional().describe('Query identifier'),
  
  // Performance metrics
  queryTime: z.number().describe('Total query time in ms'),
  cacheHit: z.boolean().describe('Whether result came from cache'),
  resultsProcessed: z.number().describe('Number of results processed'),
  
  // Quality metrics
  averageRelevance: z.number().describe('Average relevance score'),
  relevanceDistribution: z.object({
    high: z.number().describe('High relevance count'),
    medium: z.number().describe('Medium relevance count'),
    low: z.number().describe('Low relevance count'),
  }).optional().describe('Distribution of relevance scores'),
  
  // Metadata
  filters: z.object({
    applied: z.array(z.string()).describe('Filters that were applied'),
    effective: z.array(z.string()).describe('Filters that were effective'),
  }).optional().describe('Applied filters'),
  
  // Debug information
  debug: z.object({
    searchPath: z.array(z.string()).optional().describe('Search path taken'),
    optimizations: z.array(z.string()).optional().describe('Optimizations applied'),
    warnings: z.array(z.string()).optional().describe('Warnings generated'),
  }).optional().describe('Debug information'),
  
  // Pagination
  pagination: z.object({
    limit: z.number().describe('Results limit'),
    offset: z.number().describe('Results offset'),
    nextPage: z.number().optional().describe('Next page offset'),
    prevPage: z.number().optional().describe('Previous page offset'),
  }).optional().describe('Pagination information'),
});

export type RetrievalResponse = z.infer<typeof RetrievalResponseSchema>;

/**
 * Retrieval Configuration - System configuration
 * 
 * Defines how the retrieval system should behave and
 * what features should be enabled.
 */
export const RetrievalConfigSchema = z.object({
  // Vector store integration
  vectorStore: z.any().describe('QdrantVectorStore instance'),
  memoryManager: z.any().describe('SovereignMemoryManager instance'),
  lineageManager: z.any().optional().describe('DataLineageManager instance'),
  
  // Default strategy and parameters
  defaultStrategy: RetrievalStrategySchema.default('semantic').describe('Default retrieval strategy'),
  defaultLimit: z.number().default(10).describe('Default result limit'),
  defaultThreshold: z.number().default(0.7).describe('Default similarity threshold'),
  
  // Ranking configuration
  ranking: z.object({
    semantic: z.number().default(0.4).describe('Default semantic weight'),
    temporal: z.number().default(0.2).describe('Default temporal weight'),
    trust: z.number().default(0.2).describe('Default trust weight'),
    frequency: z.number().default(0.1).describe('Default frequency weight'),
    relevance: z.number().default(0.1).describe('Default relevance weight'),
  }).describe('Default ranking weights'),
  
  // Cache configuration
  enableCache: z.boolean().default(true).describe('Enable result caching'),
  cacheSize: z.number().default(1000).describe('Maximum cache entries'),
  cacheTTL: z.number().default(3600000).describe('Default cache TTL (1 hour)'),
  enableQueryCache: z.boolean().default(true).describe('Enable query result caching'),
  
  // Performance optimization
  enableReranking: z.boolean().default(false).describe('Enable result reranking'),
  enableDiversity: z.boolean().default(false).describe('Enable result diversity'),
  enableParallelSearch: z.boolean().default(true).describe('Enable parallel search strategies'),
  maxParallelQueries: z.number().default(5).describe('Maximum parallel queries'),
  
  // Temporal awareness
  enableTemporalWeighting: z.boolean().default(true).describe('Enable temporal weighting'),
  recencyDecay: z.number().default(0.1).describe('Recency decay factor'),
  timeWindows: z.array(z.object({
    name: z.string().describe('Window name'),
    hours: z.number().describe('Window duration in hours'),
    weight: z.number().describe('Window weight'),
  })).default([
    { name: 'recent', hours: 1, weight: 1.0 },
    { name: 'today', hours: 24, weight: 0.8 },
    { name: 'week', hours: 168, weight: 0.5 },
    { name: 'month', hours: 720, weight: 0.3 },
  ]).describe('Time windows for temporal weighting'),
  
  // Trust-based filtering
  enableTrustFiltering: z.boolean().default(true).describe('Enable trust-based filtering'),
  trustThreshold: z.number().default(0.5).describe('Minimum trust score'),
  trustBoost: z.number().default(0.2).describe('Trust score boost factor'),
  
  // Context awareness
  enableContextAwareness: z.boolean().default(true).describe('Enable context-aware ranking'),
  contextWindowSize: z.number().default(5).describe('Context window size'),
  contextBoost: z.number().default(0.15).describe('Context boost factor'),
  
  // Monitoring and logging
  enableMetrics: z.boolean().default(true).describe('Enable performance metrics'),
  enableAuditTrail: z.boolean().default(true).describe('Enable audit trail'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info').describe('Log level'),
  
  // Advanced features
  enableExplanation: z.boolean().default(false).describe('Enable result explanations'),
  enableFeedback: z.boolean().default(false).describe('Enable result feedback'),
  enableLearning: z.boolean().default(false).describe('Enable query learning'),
  
  // Environment configuration
  environment: z.enum(['development', 'staging', 'production']).default('development').describe('Environment'),
});

export type RetrievalConfig = z.infer<typeof RetrievalConfigSchema>;

/**
 * Retrieval Statistics - Performance and usage metrics
 * 
 * Tracks retrieval system performance, usage patterns,
 * and quality metrics.
 */
export const RetrievalStatsSchema = z.object({
  // Query counts
  totalQueries: z.number().describe('Total queries processed'),
  queriesByStrategy: z.record(z.number()).describe('Queries grouped by strategy'),
  queriesByPurpose: z.record(z.number()).describe('Queries grouped by purpose'),
  
  // Performance metrics
  averageQueryTime: z.number().describe('Average query time (ms)'),
  p95QueryTime: z.number().describe('95th percentile query time'),
  p99QueryTime: z.number().describe('99th percentile query time'),
  
  // Cache metrics
  cacheHitRate: z.number().describe('Cache hit rate'),
  cacheSize: z.number().describe('Current cache size'),
  cacheEvictions: z.number().describe('Cache evictions'),
  
  // Result metrics
  averageResults: z.number().describe('Average results per query'),
  averageRelevance: z.number().describe('Average relevance score'),
  zeroResultQueries: z.number().describe('Queries with zero results'),
  
  // Quality metrics
  userSatisfaction: z.number().optional().describe('User satisfaction score'),
  feedbackRate: z.number().optional().describe('Feedback rate'),
  
  // Error metrics
  errorRate: z.number().describe('Error rate'),
  lastError: z.string().optional().describe('Last error message'),
  lastErrorTime: z.number().optional().describe('Last error timestamp'),
  
  // Time-based metrics
  queriesLastHour: z.number().describe('Queries in last hour'),
  queriesLastDay: z.number().describe('Queries in last day'),
  queriesLastWeek: z.number().describe('Queries in last week'),
  
  // Resource usage
  memoryUsage: z.number().describe('Memory usage in bytes'),
  cpuUsage: z.number().optional().describe('CPU usage percentage'),
  
  // Feature usage
  rerankingUsage: z.number().describe('Reranking usage count'),
  diversityUsage: z.number().describe('Diversity usage count'),
  explanationUsage: z.number().describe('Explanation usage count'),
});

export type RetrievalStats = z.infer<typeof RetrievalStatsSchema>;

/**
 * Retrieval Event - Audit trail event
 * 
 * Records retrieval operations for auditing and analysis.
 */
export const RetrievalEventSchema = z.object({
  // Core identification
  eventId: z.string().uuid().describe('Unique event identifier'),
  timestamp: z.number().describe('Unix timestamp'),
  
  // Query information
  queryId: z.string().optional().describe('Query identifier'),
  query: z.string().describe('Search query'),
  strategy: RetrievalStrategySchema.describe('Retrieval strategy'),
  
  // User context
  userId: z.string().optional().describe('User ID'),
  agentId: z.string().optional().describe('Agent ID'),
  sessionId: z.string().optional().describe('Session ID'),
  purpose: z.string().optional().describe('Query purpose'),
  
  // Results
  resultCount: z.number().describe('Number of results'),
  averageRelevance: z.number().describe('Average relevance score'),
  topResultId: z.string().optional().describe('Top result ID'),
  topResultScore: z.number().optional().describe('Top result score'),
  
  // Performance
  queryTime: z.number().describe('Query time in ms'),
  cacheHit: z.boolean().describe('Cache hit'),
  
  // Filters and options
  filters: z.array(z.string()).optional().describe('Applied filters'),
  options: z.record(z.any()).optional().describe('Query options'),
  
  // Feedback (if available)
  userFeedback: z.object({
    rating: z.number().min(1).max(5).optional().describe('User rating'),
    helpful: z.boolean().optional().describe('Whether result was helpful'),
    comments: z.string().optional().describe('User comments'),
  }).optional().describe('User feedback'),
  
  // Metadata
  metadata: z.record(z.any()).optional().describe('Additional metadata'),
  tags: z.array(z.string()).default([]).describe('Event tags'),
});

export type RetrievalEvent = z.infer<typeof RetrievalEventSchema>;

/**
 * Retrieval Feedback - User feedback on results
 * 
 * Collects user feedback to improve retrieval quality.
 */
export const RetrievalFeedbackSchema = z.object({
  // Core identification
  feedbackId: z.string().uuid().describe('Unique feedback identifier'),
  queryId: z.string().describe('Query identifier'),
  timestamp: z.number().describe('Feedback timestamp'),
  
  // User information
  userId: z.string().describe('User ID'),
  agentId: z.string().optional().describe('Agent ID'),
  
  // Feedback content
  rating: z.number().min(1).max(5).describe('Rating (1-5)'),
  helpful: z.boolean().describe('Whether results were helpful'),
  
  // Result-specific feedback
  resultFeedback: z.array(z.object({
    resultId: z.string().describe('Result ID'),
    relevant: z.boolean().describe('Whether result was relevant'),
    rating: z.number().min(1).max(5).optional().describe('Result rating'),
    comments: z.string().optional().describe('Result-specific comments'),
  })).optional().describe('Feedback on specific results'),
  
  // General feedback
  comments: z.string().optional().describe('General comments'),
  suggestions: z.string().optional().describe('Suggestions for improvement'),
  
  // Context
  context: z.object({
    task: z.string().optional().describe('Task being performed'),
    expertise: z.enum(['beginner', 'intermediate', 'expert']).optional().describe('User expertise'),
    urgency: z.enum(['low', 'medium', 'high']).optional().describe('Query urgency'),
  }).optional().describe('Feedback context'),
});

export type RetrievalFeedback = z.infer<typeof RetrievalFeedbackSchema>;

/**
 * Export all types for easy importing
 */
export type {
  RetrievalStrategy,
  RetrievalQuery,
  RetrievalResult,
  RetrievalResponse,
  RetrievalConfig,
  RetrievalStats,
  RetrievalEvent,
  RetrievalFeedback,
};

/**
 * Export all schemas for validation
 */
export {
  RetrievalStrategySchema,
  RetrievalQuerySchema,
  RetrievalResultSchema,
  RetrievalResponseSchema,
  RetrievalConfigSchema,
  RetrievalStatsSchema,
  RetrievalEventSchema,
  RetrievalFeedbackSchema,
};