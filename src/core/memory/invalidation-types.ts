/**
 * Derived Data Invalidation System - Type Definitions
 * 
 * This module defines comprehensive TypeScript interfaces and Zod schemas
 * for the invalidation system that ensures data consistency and integrity
 * across the sovereign memory architecture.
 */

import { z } from 'zod';
import { ThoughtUnit, ReActTrace } from '../aix/schema';
import { DataSource, TrustLevel } from '../aix/data-lineage';

/**
 * Invalidation Strategy - Different approaches to data invalidation
 * 
 * Defines how the system should handle invalidation events,
 * balancing performance, consistency, and resource usage.
 */
export const InvalidationStrategySchema = z.enum([
  'immediate',      // Immediately invalidate all dependents
  'delayed',        // Wait for configurable delay before invalidation
  'batched',        // Collect invalidations and process in batches
  'lazy',           // Invalidate on next access
  'conditional',     // Invalidate based on conditions (trust level, age, etc.)
  'cascade_limited', // Cascade with depth limit
  'selective',      // Selectively invalidate based on criteria
]);

export type InvalidationStrategy = z.infer<typeof InvalidationStrategySchema>;

/**
 * Invalidation Trigger - What caused the invalidation
 */
export const InvalidationTriggerSchema = z.enum([
  'data_update',      // Source data was updated
  'data_delete',      // Source data was deleted
  'trust_degradation', // Trust level fell below threshold
  'expiration',       // Data expired
  'manual',          // Manual invalidation request
  'consensus',       // Swarm consensus decision
  'security_breach',  // Security issue detected
  'dependency_cycle', // Circular dependency detected
  'performance_optimization', // Performance-based cleanup
  'schema_change',    // Schema evolution
]);

export type InvalidationTrigger = z.infer<typeof InvalidationTriggerSchema>;

/**
 * Invalidation Event - Complete audit trail for invalidation
 */
export const InvalidationEventSchema = z.object({
  // Core identification
  eventId: z.string().uuid().describe('Unique event identifier'),
  timestamp: z.number().describe('Unix timestamp when invalidation occurred'),
  
  // Source information
  sourceId: z.string().describe('ID of the source data that triggered invalidation'),
  sourceType: z.enum(['thought', 'trace', 'observation', 'action']).describe('Type of source data'),
  
  // Invalidation details
  trigger: InvalidationTriggerSchema.describe('What triggered this invalidation'),
  strategy: InvalidationStrategySchema.describe('Strategy used for invalidation'),
  reason: z.string().describe('Human-readable reason for invalidation'),
  
  // Impact analysis
  affectedItems: z.array(z.string()).describe('IDs of all affected memory items'),
  cascadeDepth: z.number().describe('Depth of cascade invalidation'),
  totalInvalidated: z.number().describe('Total number of items invalidated'),
  
  // Performance metrics
  processingTime: z.number().describe('Time taken to process invalidation (ms)'),
  memoryFreed: z.number().optional().describe('Memory freed in bytes'),
  
  // Context
  agentId: z.string().describe('Agent that initiated the invalidation'),
  sessionId: z.string().optional().describe('Session context'),
  
  // Recovery information
  recoveryAttempted: z.boolean().default(false).describe('Whether recovery was attempted'),
  recoverySuccessful: z.boolean().optional().describe('Whether recovery was successful'),
  recoveryAction: z.string().optional().describe('Recovery action taken'),
  
  // Metadata
  metadata: z.record(z.any()).optional().describe('Additional event metadata'),
  tags: z.array(z.string()).default([]).describe('Event tags'),
});

export type InvalidationEvent = z.infer<typeof InvalidationEventSchema>;

/**
 * Dependency Node - Represents a dependency relationship
 */
export const DependencyNodeSchema = z.object({
  // Core identification
  nodeId: z.string().uuid().describe('Unique node identifier'),
  dataId: z.string().describe('ID of the memory item'),
  dataType: z.enum(['thought', 'trace', 'observation', 'action']).describe('Type of data'),
  
  // Dependency relationships
  dependsOn: z.array(z.string()).default([]).describe('IDs of data this node depends on'),
  dependents: z.array(z.string()).default([]).describe('IDs of data that depends on this'),
  
  // Dependency metadata
  dependencyType: z.enum(['direct', 'indirect', 'weak', 'strong']).describe('Type of dependency'),
  dependencyStrength: z.number().min(0).max(1).describe('Strength of dependency relationship'),
  lastValidated: z.number().describe('Last time dependency was validated'),
  
  // Invalidation rules
  invalidationRules: z.array(z.object({
    condition: z.string().describe('Condition for invalidation'),
    action: z.enum(['invalidate', 'revalidate', 'notify', 'ignore']).describe('Action to take'),
    priority: z.number().default(1).describe('Priority of this rule'),
  })).default([]).describe('Custom invalidation rules'),
  
  // Performance optimization
  accessFrequency: z.number().default(0).describe('How often this is accessed'),
  lastAccessed: z.number().describe('Last access timestamp'),
  accessCost: z.number().default(1).describe('Cost to recompute this data'),
  
  // State
  isValid: z.boolean().default(true).describe('Whether this data is currently valid'),
  invalidationCount: z.number().default(0).describe('Number of times invalidated'),
  lastInvalidated: z.number().optional().describe('Last invalidation timestamp'),
  
  // Metadata
  metadata: z.record(z.any()).optional().describe('Additional node metadata'),
  tags: z.array(z.string()).default([]).describe('Node tags'),
});

export type DependencyNode = z.infer<typeof DependencyNodeSchema>;

/**
 * Invalidation Rule - Custom rules for when to invalidate
 */
export const InvalidationRuleSchema = z.object({
  ruleId: z.string().uuid().describe('Unique rule identifier'),
  name: z.string().describe('Human-readable rule name'),
  description: z.string().describe('Rule description'),
  
  // Conditions
  conditions: z.array(z.object({
    field: z.string().describe('Field to check (e.g., "trustLevel", "age")'),
    operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in']).describe('Comparison operator'),
    value: z.any().describe('Value to compare against'),
  })).describe('Conditions that trigger this rule'),
  
  // Actions
  actions: z.array(z.object({
    type: z.enum(['invalidate', 'revalidate', 'notify', 'delay', 'cascade_limit']).describe('Action type'),
    parameters: z.record(z.any()).optional().describe('Action parameters'),
  })).describe('Actions to take when conditions are met'),
  
  // Metadata
  priority: z.number().default(1).describe('Rule priority (higher = more important)'),
  enabled: z.boolean().default(true).describe('Whether this rule is enabled'),
  createdAt: z.number().describe('Rule creation timestamp'),
  createdBy: z.string().describe('Agent that created this rule'),
  
  // Performance
  executionCount: z.number().default(0).describe('How many times this rule executed'),
  averageExecutionTime: z.number().default(0).describe('Average execution time (ms)'),
});

export type InvalidationRule = z.infer<typeof InvalidationRuleSchema>;

/**
 * Invalidation Configuration - System configuration
 */
export const InvalidationConfigSchema = z.object({
  // Strategy settings
  defaultStrategy: InvalidationStrategySchema.default('immediate').describe('Default invalidation strategy'),
  cascadeDepthLimit: z.number().default(10).describe('Maximum cascade depth'),
  cascadeTimeLimit: z.number().default(30000).describe('Maximum cascade time (ms)'),
  
  // Performance settings
  batchSize: z.number().default(100).describe('Batch processing size'),
  delayThreshold: z.number().default(5000).describe('Delay threshold for delayed strategy (ms)'),
  cleanupInterval: z.number().default(300000).describe('Cleanup interval (ms)'),
  
  // Trust and validation
  trustThreshold: z.number().default(0.5).describe('Minimum trust level for validity'),
  autoRevalidate: z.boolean().default(true).describe('Automatically revalidate when possible'),
  
  // Monitoring and logging
  enableMetrics: z.boolean().default(true).describe('Enable performance metrics'),
  enableAuditTrail: z.boolean().default(true).describe('Enable audit trail'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info').describe('Log level'),
  
  // Recovery settings
  enableRecovery: z.boolean().default(true).describe('Enable automatic recovery'),
  maxRecoveryAttempts: z.number().default(3).describe('Maximum recovery attempts'),
  recoveryDelay: z.number().default(1000).describe('Delay between recovery attempts (ms)'),
  
  // Optimization settings
  enableSelectiveInvalidation: z.boolean().default(true).describe('Enable selective invalidation'),
  enableLazyInvalidation: z.boolean().default(false).describe('Enable lazy invalidation'),
  enableCompression: z.boolean().default(false).describe('Enable compression for audit trail'),
  
  // Integration settings
  integrateWithDataLineage: z.boolean().default(true).describe('Integrate with data lineage system'),
  integrateWithCache: z.boolean().default(true).describe('Integrate with memory cache'),
  integrateWithVectorStore: z.boolean().default(true).describe('Integrate with vector store'),
});

export type InvalidationConfig = z.infer<typeof InvalidationConfigSchema>;

/**
 * Invalidation Statistics - Performance and usage metrics
 */
export const InvalidationStatsSchema = z.object({
  // Event counts
  totalEvents: z.number().describe('Total invalidation events'),
  eventsByTrigger: z.record(z.number()).describe('Events grouped by trigger type'),
  eventsByStrategy: z.record(z.number()).describe('Events grouped by strategy'),
  
  // Performance metrics
  averageProcessingTime: z.number().describe('Average processing time (ms)'),
  p95ProcessingTime: z.number().describe('95th percentile processing time'),
  p99ProcessingTime: z.number().describe('99th percentile processing time'),
  
  // Impact metrics
  averageCascadeDepth: z.number().describe('Average cascade depth'),
  maxCascadeDepth: z.number().describe('Maximum cascade depth observed'),
  averageItemsInvalidated: z.number().describe('Average items invalidated per event'),
  
  // Memory metrics
  memoryFreed: z.number().describe('Total memory freed (bytes)'),
  cacheHitRate: z.number().describe('Cache hit rate for invalidation checks'),
  
  // Recovery metrics
  recoveryAttempts: z.number().describe('Total recovery attempts'),
  recoverySuccessRate: z.number().describe('Recovery success rate'),
  
  // Dependency graph metrics
  totalNodes: z.number().describe('Total dependency nodes'),
  averageDependencies: z.number().describe('Average dependencies per node'),
  graphDepth: z.number().describe('Maximum graph depth'),
  
  // Error metrics
  errorRate: z.number().describe('Error rate'),
  lastError: z.string().optional().describe('Last error message'),
  lastErrorTime: z.number().optional().describe('Last error timestamp'),
  
  // Time-based metrics
  eventsLastHour: z.number().describe('Events in last hour'),
  eventsLastDay: z.number().describe('Events in last day'),
  eventsLastWeek: z.number().describe('Events in last week'),
});

export type InvalidationStats = z.infer<typeof InvalidationStatsSchema>;

/**
 * Invalidation Request - Request to invalidate data
 */
export const InvalidationRequestSchema = z.object({
  // Core information
  requestId: z.string().uuid().describe('Unique request identifier'),
  sourceId: z.string().describe('ID of source data to invalidate'),
  sourceType: z.enum(['thought', 'trace', 'observation', 'action']).describe('Type of source data'),
  
  // Request details
  trigger: InvalidationTriggerSchema.describe('What triggered this request'),
  strategy: InvalidationStrategySchema.optional().describe('Strategy to use (overrides default)'),
  reason: z.string().describe('Reason for invalidation'),
  
  // Options
  cascade: z.boolean().default(true).describe('Whether to cascade invalidation'),
  cascadeDepth: z.number().optional().describe('Maximum cascade depth'),
  dryRun: z.boolean().default(false).describe('Dry run - don\'t actually invalidate'),
  
  // Context
  agentId: z.string().describe('Agent making this request'),
  sessionId: z.string().optional().describe('Session context'),
  
  // Filters and conditions
  filters: z.array(z.object({
    field: z.string().describe('Field to filter on'),
    operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in']).describe('Operator'),
    value: z.any().describe('Filter value'),
  })).optional().describe('Filters to apply to invalidation'),
  
  // Priority and timing
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium').describe('Request priority'),
  delayUntil: z.number().optional().describe('Delay invalidation until timestamp'),
  
  // Metadata
  metadata: z.record(z.any()).optional().describe('Additional request metadata'),
  tags: z.array(z.string()).default([]).describe('Request tags'),
});

export type InvalidationRequest = z.infer<typeof InvalidationRequestSchema>;

/**
 * Invalidation Result - Result of invalidation processing
 */
export const InvalidationResultSchema = z.object({
  // Core information
  requestId: z.string().describe('Request ID this result corresponds to'),
  eventId: z.string().describe('Generated event ID'),
  success: z.boolean().describe('Whether invalidation was successful'),
  
  // Impact summary
  itemsInvalidated: z.array(z.string()).describe('IDs of items that were invalidated'),
  itemsSkipped: z.array(z.string()).describe('IDs of items that were skipped'),
  cascadeDepth: z.number().describe('Actual cascade depth achieved'),
  
  // Performance metrics
  processingTime: z.number().describe('Total processing time (ms)'),
  memoryFreed: z.number().optional().describe('Memory freed (bytes)'),
  
  // Error information
  errors: z.array(z.object({
    itemId: z.string().describe('ID of item that failed'),
    error: z.string().describe('Error message'),
    recoverable: z.boolean().describe('Whether error is recoverable'),
  })).default([]).describe('Errors encountered during processing'),
  
  // Recovery information
  recoveryAttempted: z.boolean().describe('Whether recovery was attempted'),
  recoverySuccessful: z.boolean().optional().describe('Whether recovery was successful'),
  
  // Metadata
  warnings: z.array(z.string()).default([]).describe('Warnings generated'),
  metadata: z.record(z.any()).optional().describe('Additional result metadata'),
});

export type InvalidationResult = z.infer<typeof InvalidationResultSchema>;

/**
 * Validation Result - Result of dependency validation
 */
export const ValidationResultSchema = z.object({
  nodeId: z.string().describe('ID of the validated node'),
  isValid: z.boolean().describe('Whether the node is valid'),
  validationTime: z.number().describe('Time taken to validate (ms)'),
  
  // Validation details
  checkedDependencies: z.array(z.string()).describe('Dependencies that were checked'),
  invalidDependencies: z.array(z.string()).describe('Dependencies that were invalid'),
  
  // Trust information
  trustLevel: TrustLevel.optional().describe('Current trust level'),
  trustScore: z.number().optional().describe('Current trust score'),
  
  // Recommendations
  recommendedAction: z.enum(['none', 'invalidate', 'revalidate', 'refresh']).optional().describe('Recommended action'),
  reason: z.string().optional().describe('Reason for recommendation'),
  
  // Metadata
  metadata: z.record(z.any()).optional().describe('Additional validation metadata'),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * Export all types for easy importing
 */
export type {
  InvalidationStrategy,
  InvalidationTrigger,
  InvalidationEvent,
  DependencyNode,
  InvalidationRule,
  InvalidationConfig,
  InvalidationStats,
  InvalidationRequest,
  InvalidationResult,
  ValidationResult,
};

/**
 * Export all schemas for validation
 */
export {
  InvalidationStrategySchema,
  InvalidationTriggerSchema,
  InvalidationEventSchema,
  DependencyNodeSchema,
  InvalidationRuleSchema,
  InvalidationConfigSchema,
  InvalidationStatsSchema,
  InvalidationRequestSchema,
  InvalidationResultSchema,
  ValidationResultSchema,
};