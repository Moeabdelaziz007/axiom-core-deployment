/**
 * Memory Module Index - Sovereign Agent Memory System
 *
 * Exports all memory-related functionality for sovereign agents.
 * Provides the foundation for semantic search, context-aware retrieval,
 * and scalable memory storage with complete provenance tracking.
 */

export {
  QdrantVectorStore,
  VectorStoreFactory,
  type VectorStoreConfig,
  type MemoryEntry,
  type SearchRequest,
  type SearchResult,
  type VectorStoreMetrics,
} from './vector-store';

export {
  SovereignMemoryManager,
  type MemoryConfig,
  type MemoryStats,
  type MemoryQuery,
  type MemoryResult,
} from './memory-manager';

export {
  MemoryCache,
  type CacheConfig,
  type CacheEntry,
} from './memory-cache';

export {
  MemoryOptimizer,
  type OptimizationConfig,
  type OptimizationResult,
} from './memory-optimizer';

// Memory Retrieval with Context System
export {
  MemoryRetrievalManager,
  MemoryRetrievalManagerFactory,
  type RetrievalStrategy,
  type RetrievalQuery,
  type RetrievalResult,
  type RetrievalResponse,
  type RetrievalConfig,
  type RetrievalStats,
  type RetrievalEvent,
  type RetrievalFeedback,
} from './retrieval';

export {
  type RetrievalStrategy as RetrievalStrategyType,
  type RetrievalQuery as RetrievalQueryType,
  type RetrievalResult as RetrievalResultType,
  type RetrievalResponse as RetrievalResponseType,
  type RetrievalConfig as RetrievalConfigType,
  type RetrievalStats as RetrievalStatsType,
  type RetrievalEvent as RetrievalEventType,
  type RetrievalFeedback as RetrievalFeedbackType,
} from './retrieval-types';

// Derived Data Invalidation System
export {
  InvalidationManager,
  InvalidationManagerFactory,
  type InvalidationStrategy,
  type InvalidationTrigger,
  type InvalidationEvent,
  type DependencyNode,
  type InvalidationRule,
  type InvalidationConfig,
  type InvalidationStats,
  type InvalidationRequest,
  type InvalidationResult,
  type ValidationResult,
} from './invalidation';

export {
  type InvalidationStrategy as InvalidationStrategyType,
  type InvalidationTrigger as InvalidationTriggerType,
  type InvalidationEvent as InvalidationEventType,
  type DependencyNode as DependencyNodeType,
  type InvalidationRule as InvalidationRuleType,
  type InvalidationConfig as InvalidationConfigType,
  type InvalidationStats as InvalidationStatsType,
  type InvalidationRequest as InvalidationRequestType,
  type InvalidationResult as InvalidationResultType,
  type ValidationResult as ValidationResultType,
}

// Memory Audit Trail System
export {
  AuditTrailManager,
  AuditTrailManagerFactory,
  type AuditEvent,
  type AuditQuery,
  type AuditResult,
  type ComplianceReport,
  type SecurityAlert,
  type ForensicAnalysis,
  type PerformanceMetrics,
  type RetentionPolicy,
  type AuditConfig,
  type AuditStats,
  type AuditEventType,
  type AuditSeverity,
  type ComplianceStandard,
} from './audit-trail';

export {
  type AuditEvent as AuditEventTypeEnum,
  type AuditQuery as AuditQueryType,
  type AuditResult as AuditResultType,
  type ComplianceReport as ComplianceReportType,
  type SecurityAlert as SecurityAlertType,
  type ForensicAnalysis as ForensicAnalysisType,
  type PerformanceMetrics as PerformanceMetricsType,
  type RetentionPolicy as RetentionPolicyType,
  type AuditConfig as AuditConfigType,
  type AuditStats as AuditStatsType,
  type AuditEventType as AuditEventTypeEnum,
  type AuditSeverity as AuditSeverityEnum,
  type ComplianceStandard as ComplianceStandardEnum,
} from './audit-types';