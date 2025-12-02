/**
 * Memory Audit Trail System - Type Definitions
 * 
 * This module defines comprehensive TypeScript interfaces and Zod schemas
 * for the memory audit trail system, providing complete auditing,
 * compliance, and forensic capabilities for sovereign agents.
 */

import { z } from 'zod';

/**
 * Audit Event Types - All possible audit events
 */
export const AuditEventTypeSchema = z.enum([
  // Memory operations
  'memory_created',
  'memory_updated',
  'memory_deleted',
  'memory_accessed',
  'memory_searched',
  'memory_exported',
  
  // Data lineage operations
  'lineage_traced',
  'data_source_registered',
  'dependency_created',
  'dependency_invalidated',
  
  // Invalidation operations
  'invalidation_triggered',
  'invalidation_completed',
  'invalidation_failed',
  'cascade_executed',
  
  // Security events
  'access_denied',
  'unauthorized_access',
  'data_breach_attempt',
  'suspicious_activity',
  'privilege_escalation',
  
  // Performance events
  'performance_alert',
  'bottleneck_detected',
  'resource_exhausted',
  'slow_query',
  
  // Compliance events
  'retention_policy_applied',
  'data_archived',
  'data_purged',
  'compliance_violation',
  'regulatory_report_generated',
  
  // System events
  'system_started',
  'system_shutdown',
  'configuration_changed',
  'backup_created',
  'backup_restored',
  'error_occurred',
]);

export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

/**
 * Audit Severity Levels - Standardized severity classification
 */
export const AuditSeveritySchema = z.enum([
  'critical',    // Immediate attention required
  'high',       // Important, investigate soon
  'medium',      // Should be investigated
  'low',         // Informational
  'info',        // General information
]);

export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

/**
 * Compliance Standards - Supported regulatory frameworks
 */
export const ComplianceStandardSchema = z.enum([
  'GDPR',        // General Data Protection Regulation
  'SOC2',         // Service Organization Control 2
  'HIPAA',        // Health Insurance Portability and Accountability Act
  'PCI_DSS',      // Payment Card Industry Data Security Standard
  'ISO27001',      // Information Security Management
  'CCPA',         // California Consumer Privacy Act
  'SOX',          // Sarbanes-Oxley Act
  'FISMA',        // Federal Information Security Management Act
  'NIST',         // National Institute of Standards and Technology
  'CUSTOM',        // Custom compliance framework
]);

export type ComplianceStandard = z.infer<typeof ComplianceStandardSchema>;

/**
 * Data Retention Policies - How long to keep audit data
 */
export const RetentionPolicySchema = z.object({
  policyId: z.string().describe('Unique policy identifier'),
  name: z.string().describe('Policy name'),
  description: z.string().describe('Policy description'),
  
  // Retention periods
  standardRetention: z.number().describe('Standard retention period in days'),
  extendedRetention: z.number().optional().describe('Extended retention for compliance'),
  maximumRetention: z.number().describe('Maximum retention period in days'),
  
  // Archival settings
  archiveAfter: z.number().describe('Archive after this many days'),
  deleteAfter: z.number().describe('Delete after this many days'),
  
  // Compliance requirements
  complianceStandards: z.array(ComplianceStandardSchema).describe('Applicable standards'),
  legalHold: z.boolean().default(false).describe('Whether legal hold can prevent deletion'),
  
  // Data classification
  dataClassifications: z.array(z.string()).describe('Data classifications this applies to'),
  
  // Metadata
  createdAt: z.number().describe('Creation timestamp'),
  updatedAt: z.number().describe('Last update timestamp'),
  enabled: z.boolean().default(true).describe('Whether policy is active'),
});

export type RetentionPolicy = z.infer<typeof RetentionPolicySchema>;

/**
 * Audit Event - Core audit record
 */
export const AuditEventSchema = z.object({
  // Core identification
  eventId: z.string().uuid().describe('Unique event identifier'),
  timestamp: z.number().describe('Event timestamp (Unix)'),
  sequenceNumber: z.number().describe('Sequential event number'),
  
  // Event classification
  eventType: AuditEventTypeSchema.describe('Type of audit event'),
  severity: AuditSeveritySchema.describe('Event severity'),
  category: z.string().describe('Event category for grouping'),
  
  // Actor information
  actorId: z.string().describe('ID of the actor (user, agent, system)'),
  actorType: z.enum(['user', 'agent', 'system', 'service']).describe('Type of actor'),
  actorSessionId: z.string().optional().describe('Session ID of the actor'),
  
  // Resource information
  resourceId: z.string().describe('ID of the affected resource'),
  resourceType: z.enum(['memory', 'thought', 'trace', 'agent', 'user', 'system']).describe('Type of resource'),
  resourcePath: z.string().optional().describe('Path or location of resource'),
  
  // Action details
  action: z.string().describe('Action performed'),
  actionResult: z.enum(['success', 'failure', 'partial', 'timeout']).describe('Result of action'),
  actionDetails: z.record(z.any()).optional().describe('Additional action details'),
  
  // Security context
  ipAddress: z.string().optional().describe('IP address of actor'),
  userAgent: z.string().optional().describe('User agent or client'),
  authenticationMethod: z.string().optional().describe('How actor was authenticated'),
  authorizationContext: z.record(z.any()).optional().describe('Authorization context'),
  
  // Data context
  dataClassification: z.string().optional().describe('Classification of affected data'),
  dataSensitivity: z.enum(['public', 'internal', 'confidential', 'restricted']).optional().describe('Data sensitivity level'),
  dataVolume: z.number().optional().describe('Volume of data affected (bytes)'),
  
  // Performance context
  duration: z.number().optional().describe('Duration of operation (ms)'),
  resourceUsage: z.object({
    cpu: z.number().optional(),
    memory: z.number().optional(),
    disk: z.number().optional(),
    network: z.number().optional(),
  }).optional().describe('Resource usage during operation'),
  
  // Error context
  errorCode: z.string().optional().describe('Error code if action failed'),
  errorMessage: z.string().optional().describe('Error message if action failed'),
  stackTrace: z.string().optional().describe('Stack trace for debugging'),
  
  // Compliance context
  complianceStandards: z.array(ComplianceStandardSchema).optional().describe('Relevant compliance standards'),
  retentionPolicy: z.string().optional().describe('Applied retention policy'),
  legalHold: z.boolean().default(false).describe('Whether legal hold is applied'),
  
  // Chain of custody
  parentEventId: z.string().optional().describe('Parent event ID for chaining'),
  childEventIds: z.array(z.string()).optional().describe('Child event IDs'),
  correlationId: z.string().optional().describe('Correlation ID for related events'),
  
  // Cryptographic verification
  eventHash: z.string().describe('Hash of event data for integrity'),
  previousEventHash: z.string().optional().describe('Hash of previous event for chain'),
  signature: z.string().optional().describe('Digital signature for authenticity'),
  
  // Metadata
  tags: z.array(z.string()).default([]).describe('Event tags for categorization'),
  metadata: z.record(z.any()).optional().describe('Additional metadata'),
  environment: z.enum(['development', 'staging', 'production']).describe('Environment'),
  
  // Multi-tenant context
  tenantId: z.string().optional().describe('Tenant ID for multi-tenant isolation'),
  isolationLevel: z.enum(['none', 'tenant', 'user', 'session']).optional().describe('Isolation level'),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

/**
 * Audit Query - Complex audit search interface
 */
export const AuditQuerySchema = z.object({
  // Search criteria
  eventTypes: z.array(AuditEventTypeSchema).optional().describe('Event types to search'),
  severity: z.array(AuditSeveritySchema).optional().describe('Severity levels to include'),
  actors: z.array(z.string()).optional().describe('Actor IDs to filter by'),
  resources: z.array(z.string()).optional().describe('Resource IDs to filter by'),
  
  // Temporal filters
  timeRange: z.object({
    start: z.number().optional().describe('Start timestamp'),
    end: z.number().optional().describe('End timestamp'),
  }).optional().describe('Time range filter'),
  
  // Text search
  searchText: z.string().optional().describe('Text search in action, details, errors'),
  searchFields: z.array(z.string()).optional().describe('Fields to search in'),
  
  // Compliance filters
  complianceStandards: z.array(ComplianceStandardSchema).optional().describe('Compliance standards'),
  dataClassifications: z.array(z.string()).optional().describe('Data classifications'),
  legalHoldOnly: z.boolean().optional().describe('Only events under legal hold'),
  
  // Performance filters
  minDuration: z.number().optional().describe('Minimum duration threshold'),
  maxDuration: z.number().optional().describe('Maximum duration threshold'),
  resourceUsageThreshold: z.object({
    cpu: z.number().optional(),
    memory: z.number().optional(),
    disk: z.number().optional(),
    network: z.number().optional(),
  }).optional().describe('Resource usage thresholds'),
  
  // Result controls
  limit: z.number().default(100).describe('Maximum results'),
  offset: z.number().default(0).describe('Result offset'),
  sortBy: z.enum(['timestamp', 'severity', 'duration', 'eventType']).default('timestamp').describe('Sort field'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort order'),
  
  // Aggregation
  aggregateBy: z.enum(['eventType', 'severity', 'actor', 'resource', 'hour', 'day']).optional().describe('Field to aggregate by'),
  includeAggregations: z.boolean().default(false).describe('Include aggregated statistics'),
  
  // Multi-tenant
  tenantId: z.string().optional().describe('Tenant ID filter'),
  includeAllTenants: z.boolean().default(false).describe('Include all tenants (admin only)'),
});

export type AuditQuery = z.infer<typeof AuditQuerySchema>;

/**
 * Audit Result - Query response with pagination
 */
export const AuditResultSchema = z.object({
  // Results
  events: z.array(AuditEventSchema).describe('Matching audit events'),
  totalCount: z.number().describe('Total matching events'),
  
  // Pagination
  hasMore: z.boolean().describe('Whether more results are available'),
  nextOffset: z.number().optional().describe('Next offset for pagination'),
  
  // Query metadata
  query: z.string().describe('Original query'),
  queryTime: z.number().describe('Query execution time (ms)'),
  cacheHit: z.boolean().describe('Whether result came from cache'),
  
  // Aggregations (if requested)
  aggregations: z.record(z.any()).optional().describe('Aggregated statistics'),
  
  // Security context
  accessLevel: z.enum(['full', 'partial', 'restricted']).describe('Access level of results'),
  redactedFields: z.array(z.string()).optional().describe('Fields that were redacted'),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

/**
 * Compliance Report - Regulatory compliance reporting
 */
export const ComplianceReportSchema = z.object({
  // Report identification
  reportId: z.string().uuid().describe('Unique report identifier'),
  reportType: ComplianceStandardSchema.describe('Compliance standard'),
  reportPeriod: z.object({
    start: z.number().describe('Period start'),
    end: z.number().describe('Period end'),
  }).describe('Reporting period'),
  
  // Compliance status
  overallStatus: z.enum(['compliant', 'non_compliant', 'partial_compliant', 'unknown']).describe('Overall compliance status'),
  complianceScore: z.number().min(0).max(100).describe('Compliance score (0-100)'),
  
  // Detailed findings
  findings: z.array(z.object({
    category: z.string().describe('Finding category'),
    severity: AuditSeveritySchema.describe('Finding severity'),
    description: z.string().describe('Finding description'),
    evidence: z.array(z.string()).describe('Supporting evidence'),
    recommendation: z.string().describe('Recommendation for remediation'),
    status: z.enum(['open', 'in_progress', 'resolved', 'accepted_risk']).describe('Finding status'),
    dueDate: z.number().optional().describe('Resolution due date'),
  })).describe('Compliance findings'),
  
  // Metrics
  totalEvents: z.number().describe('Total audit events in period'),
  criticalEvents: z.number().describe('Critical events count'),
  highEvents: z.number().describe('High severity events count'),
  mediumEvents: z.number().describe('Medium severity events count'),
  lowEvents: z.number().describe('Low severity events count'),
  
  // Data retention
  retentionCompliance: z.object({
    compliant: z.boolean().describe('Whether retention is compliant'),
  violations: z.array(z.string()).describe('Retention violations'),
  recommendations: z.array(z.string()).describe('Retention recommendations'),
  }).describe('Retention compliance status'),
  
  // Security
  securityIncidents: z.number().describe('Security incidents count'),
  dataBreaches: z.number().describe('Data breaches count'),
  unauthorizedAccess: z.number().describe('Unauthorized access attempts'),
  
  // Report metadata
  generatedAt: z.number().describe('Report generation timestamp'),
  generatedBy: z.string().describe('Who generated the report'),
  version: z.string().describe('Report version'),
  nextReviewDate: z.number().describe('Next review date'),
  
  // Verification
  reportHash: z.string().describe('Hash of report for integrity'),
  signature: z.string().optional().describe('Digital signature for authenticity'),
});

export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;

/**
 * Security Alert - Real-time security monitoring
 */
export const SecurityAlertSchema = z.object({
  // Alert identification
  alertId: z.string().uuid().describe('Unique alert identifier'),
  timestamp: z.number().describe('Alert timestamp'),
  severity: AuditSeveritySchema.describe('Alert severity'),
  
  // Alert classification
  alertType: z.enum([
    'anomalous_access',
    'privilege_escalation',
    'data_exfiltration',
    'brute_force',
    'malicious_activity',
    'policy_violation',
    'compliance_breach',
    'system_compromise',
    'insider_threat',
  ]).describe('Type of security alert'),
  
  // Detection details
  detectionMethod: z.string().describe('How the alert was detected'),
  confidence: z.number().min(0).max(1).describe('Confidence in detection'),
  riskScore: z.number().min(0).max(100).describe('Risk score'),
  
  // Context
  description: z.string().describe('Alert description'),
  affectedResources: z.array(z.string()).describe('Affected resources'),
  actors: z.array(z.string()).describe('Suspicious actors'),
  indicators: z.array(z.string()).describe('Security indicators'),
  
  // Response
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']).describe('Alert status'),
  assignedTo: z.string().optional().describe('Who is investigating'),
  resolution: z.string().optional().describe('Resolution description'),
  resolutionTime: z.number().optional().describe('Time to resolve (ms)'),
  
  // Mitigation
  autoMitigated: z.boolean().describe('Whether automatic mitigation was applied'),
  mitigationActions: z.array(z.string()).describe('Mitigation actions taken'),
  
  // Correlation
  relatedEvents: z.array(z.string()).describe('Related audit events'),
  relatedAlerts: z.array(z.string()).describe('Related security alerts'),
  
  // Metadata
  metadata: z.record(z.any()).optional().describe('Additional alert metadata'),
  tags: z.array(z.string()).default([]).describe('Alert tags'),
});

export type SecurityAlert = z.infer<typeof SecurityAlertSchema>;

/**
 * Forensic Analysis - Incident investigation tools
 */
export const ForensicAnalysisSchema = z.object({
  // Analysis identification
  analysisId: z.string().uuid().describe('Unique analysis identifier'),
  incidentId: z.string().describe('Incident being investigated'),
  timestamp: z.number().describe('Analysis timestamp'),
  analystId: z.string().describe('Analyst performing investigation'),
  
  // Scope
  timeRange: z.object({
    start: z.number().describe('Investigation start'),
    end: z.number().describe('Investigation end'),
  }).describe('Time scope of investigation'),
  
  resourceScope: z.array(z.string()).describe('Resources under investigation'),
  actorScope: z.array(z.string()).describe('Actors under investigation'),
  
  // Findings
  timeline: z.array(z.object({
    timestamp: z.number().describe('Event timestamp'),
    eventId: z.string().describe('Related audit event'),
    description: z.string().describe('Timeline event description'),
    significance: z.enum(['low', 'medium', 'high', 'critical']).describe('Event significance'),
    evidence: z.array(z.string()).describe('Supporting evidence'),
  })).describe('Investigation timeline'),
  
  patterns: z.array(z.object({
    patternType: z.string().describe('Type of pattern detected'),
    description: z.string().describe('Pattern description'),
    frequency: z.number().describe('How often pattern occurs'),
    confidence: z.number().min(0).max(1).describe('Confidence in pattern'),
    indicators: z.array(z.string()).describe('Pattern indicators'),
  })).describe('Detected patterns'),
  
  // Root cause analysis
  rootCause: z.object({
    category: z.string().describe('Root cause category'),
    description: z.string().describe('Root cause description'),
    contributingFactors: z.array(z.string()).describe('Contributing factors'),
    evidence: z.array(z.string()).describe('Supporting evidence'),
    confidence: z.number().min(0).max(1).describe('Confidence in root cause'),
  }).optional().describe('Root cause analysis'),
  
  // Impact assessment
  impact: z.object({
    dataAffected: z.array(z.string()).describe('Affected data'),
    systemsAffected: z.array(z.string()).describe('Affected systems'),
    usersAffected: z.number().describe('Number of affected users'),
    businessImpact: z.string().describe('Business impact description'),
    financialImpact: z.number().optional().describe('Estimated financial impact'),
    reputationalImpact: z.string().optional().describe('Reputational impact'),
  }).optional().describe('Impact assessment'),
  
  // Recommendations
  recommendations: z.array(z.object({
    priority: z.enum(['low', 'medium', 'high', 'critical']).describe('Recommendation priority'),
    category: z.string().describe('Recommendation category'),
    description: z.string().describe('Recommendation description'),
    implementation: z.string().describe('Implementation guidance'),
    timeframe: z.string().describe('Implementation timeframe'),
  })).describe('Remediation recommendations'),
  
  // Metadata
  tools: z.array(z.string()).describe('Tools used in analysis'),
  methodology: z.string().describe('Analysis methodology'),
  confidence: z.number().min(0).max(1).describe('Overall confidence in analysis'),
  
  // Verification
  analysisHash: z.string().describe('Hash of analysis for integrity'),
  signature: z.string().optional().describe('Digital signature for authenticity'),
});

export type ForensicAnalysis = z.infer<typeof ForensicAnalysisSchema>;

/**
 * Performance Metrics - System performance monitoring
 */
export const PerformanceMetricsSchema = z.object({
  // Time period
  timestamp: z.number().describe('Metrics timestamp'),
  period: z.enum(['minute', 'hour', 'day', 'week', 'month']).describe('Aggregation period'),
  
  // Operation metrics
  totalOperations: z.number().describe('Total operations'),
  operationsByType: z.record(z.number()).describe('Operations broken down by type'),
  averageOperationTime: z.number().describe('Average operation time (ms)'),
  p95OperationTime: z.number().describe('95th percentile operation time'),
  p99OperationTime: z.number().describe('99th percentile operation time'),
  
  // Resource usage
  cpuUsage: z.number().describe('CPU usage percentage'),
  memoryUsage: z.number().describe('Memory usage percentage'),
  diskUsage: z.number().describe('Disk usage percentage'),
  networkIO: z.object({
    bytesIn: z.number().describe('Bytes received'),
    bytesOut: z.number().describe('Bytes sent'),
  }).describe('Network I/O'),
  
  // Queue metrics
  queueDepth: z.number().describe('Current queue depth'),
  averageWaitTime: z.number().describe('Average wait time in queue'),
  maxWaitTime: z.number().describe('Maximum wait time in queue'),
  
  // Error metrics
  errorRate: z.number().describe('Error rate percentage'),
  errorsByType: z.record(z.number()).describe('Errors broken down by type'),
  criticalErrors: z.number().describe('Critical error count'),
  
  // Cache metrics
  cacheHitRate: z.number().describe('Cache hit rate percentage'),
  cacheSize: z.number().describe('Current cache size'),
  cacheEvictions: z.number().describe('Cache evictions'),
  
  // Bottleneck detection
  bottlenecks: z.array(z.object({
    type: z.enum(['cpu', 'memory', 'disk', 'network', 'queue', 'database']).describe('Bottleneck type'),
    severity: AuditSeveritySchema.describe('Bottleneck severity'),
    description: z.string().describe('Bottleneck description'),
    impact: z.string().describe('Impact on system'),
    recommendation: z.string().describe('Resolution recommendation'),
  })).describe('Detected bottlenecks'),
  
  // Alerts
  activeAlerts: z.number().describe('Active performance alerts'),
  alertThresholds: z.record(z.number()).describe('Alert thresholds'),
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

/**
 * Audit Configuration - System configuration
 */
export const AuditConfigSchema = z.object({
  // Storage settings
  storageBackend: z.enum(['file', 'database', 'blockchain', 'hybrid']).describe('Storage backend'),
  storagePath: z.string().describe('Storage path or connection string'),
  encryptionEnabled: z.boolean().default(true).describe('Enable encryption'),
  compressionEnabled: z.boolean().default(false).describe('Enable compression'),
  
  // Retention settings
  defaultRetentionDays: z.number().default(2555).describe('Default retention (7 years)'),
  archiveRetentionDays: z.number().default(3650).describe('Archive retention (10 years)'),
  maxRetentionDays: z.number().default(36500).describe('Maximum retention (100 years)'),
  
  // Performance settings
  batchSize: z.number().default(1000).describe('Batch write size'),
  flushInterval: z.number().default(5000).describe('Flush interval (ms)'),
  cacheSize: z.number().default(10000).describe('Event cache size'),
  indexRefreshInterval: z.number().default(60000).describe('Index refresh interval (ms)'),
  
  // Security settings
  enableRealTimeMonitoring: z.boolean().default(true).describe('Enable real-time monitoring'),
  enableThreatDetection: z.boolean().default(true).describe('Enable threat detection'),
  enableAnomalyDetection: z.boolean().default(true).describe('Enable anomaly detection'),
  threatThreshold: z.number().default(0.7).describe('Threat detection threshold'),
  
  // Compliance settings
  enableComplianceReporting: z.boolean().default(true).describe('Enable compliance reporting'),
  autoGenerateReports: z.boolean().default(false).describe('Auto-generate compliance reports'),
  reportSchedule: z.string().optional().describe('Report generation schedule (cron)'),
  
  // Multi-tenant settings
  enableMultiTenant: z.boolean().default(false).describe('Enable multi-tenant isolation'),
  tenantIsolationLevel: z.enum(['none', 'strict', 'logical']).default('none').describe('Tenant isolation level'),
  
  // Logging settings
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info').describe('Log level'),
  enableMetrics: z.boolean().default(true).describe('Enable performance metrics'),
  enableAuditTrail: z.boolean().default(true).describe('Enable audit trail'),
  
  // Verification settings
  enableHashing: z.boolean().default(true).describe('Enable cryptographic hashing'),
  enableSigning: z.boolean().default(false).describe('Enable digital signatures'),
  hashAlgorithm: z.enum(['sha256', 'sha512', 'blake2b']).default('sha256').describe('Hash algorithm'),
  
  // Integration settings
  integrateWithMemoryManager: z.boolean().default(true).describe('Integrate with memory manager'),
  integrateWithInvalidation: z.boolean().default(true).describe('Integrate with invalidation system'),
  integrateWithRetrieval: z.boolean().default(true).describe('Integrate with retrieval system'),
  
  // Environment
  environment: z.enum(['development', 'staging', 'production']).default('development').describe('Environment'),
});

export type AuditConfig = z.infer<typeof AuditConfigSchema>;

/**
 * Audit Statistics - System statistics
 */
export const AuditStatsSchema = z.object({
  // Event statistics
  totalEvents: z.number().describe('Total audit events'),
  eventsByType: z.record(z.number()).describe('Events by type'),
  eventsBySeverity: z.record(z.number()).describe('Events by severity'),
  eventsByActor: z.record(z.number()).describe('Events by actor'),
  eventsByResource: z.record(z.number()).describe('Events by resource'),
  
  // Time-based statistics
  eventsLastHour: z.number().describe('Events in last hour'),
  eventsLastDay: z.number().describe('Events in last day'),
  eventsLastWeek: z.number().describe('Events in last week'),
  eventsLastMonth: z.number().describe('Events in last month'),
  
  // Performance statistics
  averageWriteTime: z.number().describe('Average write time (ms)'),
  averageQueryTime: z.number().describe('Average query time (ms)'),
  cacheHitRate: z.number().describe('Cache hit rate'),
  storageSize: z.number().describe('Storage size (bytes)'),
  
  // Security statistics
  securityAlerts: z.number().describe('Security alerts count'),
  threatsDetected: z.number().describe('Threats detected count'),
  falsePositives: z.number().describe('False positive count'),
  
  // Compliance statistics
  complianceScore: z.number().describe('Overall compliance score'),
  retentionViolations: z.number().describe('Retention violations count'),
  reportsGenerated: z.number().describe('Reports generated count'),
  
  // Multi-tenant statistics
  activeTenants: z.number().describe('Active tenants count'),
  tenantEventCounts: z.record(z.number()).describe('Events by tenant'),
  
  // System health
  systemUptime: z.number().describe('System uptime percentage'),
  errorRate: z.number().describe('Error rate percentage'),
  lastEventTimestamp: z.number().describe('Last event timestamp'),
  
  // Timestamp
  generatedAt: z.number().describe('Statistics generation timestamp'),
});

export type AuditStats = z.infer<typeof AuditStatsSchema>;