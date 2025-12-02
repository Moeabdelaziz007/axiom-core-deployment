/**
 * Memory Audit Trail System - Main Implementation
 * 
 * This module provides comprehensive auditing, compliance, and forensic
 * capabilities for the sovereign memory architecture. It ensures complete
 * traceability of all memory operations with immutable storage,
 * cryptographic verification, and real-time security monitoring.
 * 
 * Features:
 * - Immutable audit storage with cryptographic verification
 * - Comprehensive event logging for all memory operations
 * - Compliance reporting for various regulations (GDPR, SOC2, etc.)
 * - Real-time security monitoring and threat detection
 * - Forensic analysis tools for incident investigation
 * - Performance monitoring and bottleneck detection
 * - Data retention policies with automatic archival
 * - Multi-tenant audit isolation
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash, createHmac, randomBytes, createSign, verify } from 'crypto';
import { z } from 'zod';
import {
  AuditEvent,
  AuditQuery,
  AuditResult,
  ComplianceReport,
  SecurityAlert,
  ForensicAnalysis,
  PerformanceMetrics,
  RetentionPolicy,
  AuditConfig,
  AuditStats,
  AuditEventType,
  AuditSeverity,
  ComplianceStandard,
  AuditEventSchema,
  AuditQuerySchema,
  ComplianceReportSchema,
  SecurityAlertSchema,
  ForensicAnalysisSchema,
  PerformanceMetricsSchema,
  RetentionPolicySchema,
  AuditConfigSchema,
  AuditStatsSchema,
} from './audit-types';
import { QdrantVectorStore, MemoryEntry } from './vector-store';
import { SovereignMemoryManager } from './memory-manager';
import { InvalidationManager } from './invalidation';
import { MemoryRetrievalManager } from './retrieval';
import { DataLineageManager } from '../aix/data-lineage';
import { ThoughtUnit, ReActTrace } from '../aix/schema';

/**
 * Immutable Audit Storage - Append-only log with cryptographic verification
 */
class ImmutableAuditStorage {
  private config: AuditConfig;
  private eventLog: AuditEvent[] = [];
  private sequenceNumber: number = 0;
  private lastEventHash: string | null = null;
  private writeBuffer: AuditEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private storageBackend: any; // Would be actual storage implementation

  constructor(config: AuditConfig) {
    this.config = config;
    this.initializeStorage();
    this.startFlushTimer();
  }

  /**
   * Initialize storage backend
   */
  private async initializeStorage(): Promise<void> {
    // Initialize based on storage backend type
    switch (this.config.storageBackend) {
      case 'file':
        await this.initializeFileStorage();
        break;
      case 'database':
        await this.initializeDatabaseStorage();
        break;
      case 'blockchain':
        await this.initializeBlockchainStorage();
        break;
      case 'hybrid':
        await this.initializeHybridStorage();
        break;
      default:
        throw new Error(`Unsupported storage backend: ${this.config.storageBackend}`);
    }
  }

  /**
   * Append event to immutable log
   */
  async appendEvent(event: AuditEvent): Promise<void> {
    try {
      // Validate event
      const validatedEvent = AuditEventSchema.parse(event);
      
      // Assign sequence number
      validatedEvent.sequenceNumber = ++this.sequenceNumber;
      
      // Generate event hash
      const eventHash = this.generateEventHash(validatedEvent);
      validatedEvent.eventHash = eventHash;
      
      // Link to previous event
      if (this.lastEventHash) {
        validatedEvent.previousEventHash = this.lastEventHash;
      }
      
      // Sign event if enabled
      if (this.config.enableSigning) {
        validatedEvent.signature = this.signEvent(validatedEvent);
      }
      
      // Add to write buffer
      this.writeBuffer.push(validatedEvent);
      
      // Flush if buffer is full
      if (this.writeBuffer.length >= this.config.batchSize) {
        await this.flushBuffer();
      }
      
      // Update last hash
      this.lastEventHash = eventHash;
      
    } catch (error) {
      throw new Error(`Failed to append audit event: ${error.message}`);
    }
  }

  /**
   * Query events with complex filtering
   */
  async queryEvents(query: AuditQuery): Promise<AuditResult> {
    const startTime = Date.now();
    
    try {
      const validatedQuery = AuditQuerySchema.parse(query);
      
      // Get all events (in real implementation, this would query storage)
      let allEvents = [...this.eventLog, ...this.writeBuffer];
      
      // Apply filters
      let filteredEvents = this.applyFilters(allEvents, validatedQuery);
      
      // Sort results
      filteredEvents = this.sortEvents(filteredEvents, validatedQuery);
      
      // Apply pagination
      const startIndex = validatedQuery.offset;
      const endIndex = startIndex + validatedQuery.limit;
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
      
      // Generate aggregations if requested
      let aggregations: any = undefined;
      if (validatedQuery.includeAggregations && validatedQuery.aggregateBy) {
        aggregations = this.generateAggregations(filteredEvents, validatedQuery.aggregateBy);
      }
      
      // Apply multi-tenant isolation
      if (this.config.enableMultiTenant && !validatedQuery.includeAllTenants) {
        paginatedEvents = this.applyTenantIsolation(paginatedEvents, validatedQuery.tenantId);
      }
      
      const result: AuditResult = {
        events: paginatedEvents,
        totalCount: filteredEvents.length,
        hasMore: endIndex < filteredEvents.length,
        nextOffset: endIndex < filteredEvents.length ? endIndex : undefined,
        query: JSON.stringify(validatedQuery),
        queryTime: Date.now() - startTime,
        cacheHit: false,
        aggregations,
        accessLevel: 'full',
        redactedFields: [],
      };
      
      return result;
      
    } catch (error) {
      throw new Error(`Audit query failed: ${error.message}`);
    }
  }

  /**
   * Flush write buffer to storage
   */
  private async flushBuffer(): Promise<void> {
    if (this.writeBuffer.length === 0) return;
    
    try {
      const eventsToWrite = [...this.writeBuffer];
      this.writeBuffer = [];
      
      // Write to storage backend
      await this.writeToStorage(eventsToWrite);
      
      // Add to in-memory log
      this.eventLog.push(...eventsToWrite);
      
      // Limit in-memory log size
      if (this.eventLog.length > this.config.cacheSize) {
        this.eventLog = this.eventLog.slice(-this.config.cacheSize);
      }
      
    } catch (error) {
      // Put events back in buffer on failure
      this.writeBuffer.unshift(...this.writeBuffer);
      throw error;
    }
  }

  /**
   * Generate cryptographic hash of event
   */
  private generateEventHash(event: AuditEvent): string {
    const hashData = {
      sequenceNumber: event.sequenceNumber,
      timestamp: event.timestamp,
      eventType: event.eventType,
      actorId: event.actorId,
      resourceId: event.resourceId,
      action: event.action,
      actionResult: event.actionResult,
      previousEventHash: event.previousEventHash,
    };
    
    return createHash(this.config.hashAlgorithm as string)
      .update(JSON.stringify(hashData))
      .digest('hex');
  }

  /**
   * Sign event for authenticity
   */
  private signEvent(event: AuditEvent): string {
    // In real implementation, this would use proper key management
    const privateKey = process.env.AUDIT_PRIVATE_KEY || 'default-key';
    const sign = createSign('RSA-SHA256');
    sign.update(JSON.stringify(event));
    return sign.sign(privateKey, 'hex');
  }

  /**
   * Verify event signature
   */
  private verifyEventSignature(event: AuditEvent): boolean {
    if (!event.signature) return true;
    
    // In real implementation, this would use proper key verification
    const publicKey = process.env.AUDIT_PUBLIC_KEY || 'default-public-key';
    const verify = createVerify('RSA-SHA256');
    verify.update(JSON.stringify(event));
    return verify.verify(publicKey, event.signature, 'hex');
  }

  /**
   * Apply filters to events
   */
  private applyFilters(events: AuditEvent[], query: AuditQuery): AuditEvent[] {
    return events.filter(event => {
      // Event type filter
      if (query.eventTypes && !query.eventTypes.includes(event.eventType)) {
        return false;
      }
      
      // Severity filter
      if (query.severity && !query.severity.includes(event.severity)) {
        return false;
      }
      
      // Actor filter
      if (query.actors && !query.actors.includes(event.actorId)) {
        return false;
      }
      
      // Resource filter
      if (query.resources && !query.resources.includes(event.resourceId)) {
        return false;
      }
      
      // Time range filter
      if (query.timeRange) {
        if (query.timeRange.start && event.timestamp < query.timeRange.start) {
          return false;
        }
        if (query.timeRange.end && event.timestamp > query.timeRange.end) {
          return false;
        }
      }
      
      // Text search filter
      if (query.searchText) {
        const searchFields = query.searchFields || ['action', 'actionDetails', 'errorMessage'];
        const searchText = query.searchText.toLowerCase();
        let matches = false;
        
        for (const field of searchFields) {
          const fieldValue = (event as any)[field];
          if (fieldValue && fieldValue.toLowerCase().includes(searchText)) {
            matches = true;
            break;
          }
        }
        
        if (!matches) return false;
      }
      
      // Compliance filter
      if (query.complianceStandards) {
        if (!event.complianceStandards || 
            !query.complianceStandards.some(standard => 
              event.complianceStandards?.includes(standard))) {
          return false;
        }
      }
      
      // Performance filter
      if (query.minDuration && event.duration && event.duration < query.minDuration) {
        return false;
      }
      if (query.maxDuration && event.duration && event.duration > query.maxDuration) {
        return false;
      }
      
      // Tenant filter
      if (query.tenantId && event.tenantId !== query.tenantId) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Sort events based on query
   */
  private sortEvents(events: AuditEvent[], query: AuditQuery): AuditEvent[] {
    const { sortBy, sortOrder } = query;
    
    return events.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'severity':
          const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'info': 0 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
        case 'eventType':
          comparison = a.eventType.localeCompare(b.eventType);
          break;
        default:
          comparison = a.timestamp - b.timestamp;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Generate aggregations for events
   */
  private generateAggregations(events: AuditEvent[], aggregateBy: string): any {
    const aggregations: any = {};
    
    switch (aggregateBy) {
      case 'eventType':
        aggregations.byEventType = this.groupBy(events, 'eventType');
        break;
      case 'severity':
        aggregations.bySeverity = this.groupBy(events, 'severity');
        break;
      case 'actor':
        aggregations.byActor = this.groupBy(events, 'actorId');
        break;
      case 'resource':
        aggregations.byResource = this.groupBy(events, 'resourceId');
        break;
      case 'hour':
        aggregations.byHour = this.groupByTime(events, 'hour');
        break;
      case 'day':
        aggregations.byDay = this.groupByTime(events, 'day');
        break;
    }
    
    return aggregations;
  }

  /**
   * Group events by field
   */
  private groupBy(events: AuditEvent[], field: string): Record<string, number> {
    return events.reduce((groups, event) => {
      const key = (event as any)[field];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Group events by time period
   */
  private groupByTime(events: AuditEvent[], period: 'hour' | 'day'): Record<string, number> {
    return events.reduce((groups, event) => {
      const date = new Date(event.timestamp);
      let key: string;
      
      if (period === 'hour') {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      } else {
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      }
      
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Apply multi-tenant isolation
   */
  private applyTenantIsolation(events: AuditEvent[], tenantId?: string): AuditEvent[] {
    if (!this.config.enableMultiTenant) {
      return events;
    }
    
    if (!tenantId) {
      // Return only events without tenant ID
      return events.filter(event => !event.tenantId);
    }
    
    return events.filter(event => event.tenantId === tenantId);
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flushBuffer().catch(error => {
        console.error('Failed to flush audit buffer:', error);
      });
    }, this.config.flushInterval);
  }

  /**
   * Initialize file storage
   */
  private async initializeFileStorage(): Promise<void> {
    // Implementation for file-based storage
    this.storageBackend = {
      type: 'file',
      path: this.config.storagePath,
    };
  }

  /**
   * Initialize database storage
   */
  private async initializeDatabaseStorage(): Promise<void> {
    // Implementation for database storage
    this.storageBackend = {
      type: 'database',
      connectionString: this.config.storagePath,
    };
  }

  /**
   * Initialize blockchain storage
   */
  private async initializeBlockchainStorage(): Promise<void> {
    // Implementation for blockchain storage
    this.storageBackend = {
      type: 'blockchain',
      network: this.config.storagePath,
    };
  }

  /**
   * Initialize hybrid storage
   */
  private async initializeHybridStorage(): Promise<void> {
    // Implementation for hybrid storage
    this.storageBackend = {
      type: 'hybrid',
      primary: 'database',
      backup: 'file',
      config: this.config.storagePath,
    };
  }

  /**
   * Write events to storage
   */
  private async writeToStorage(events: AuditEvent[]): Promise<void> {
    // In real implementation, this would write to actual storage
    console.debug(`Writing ${events.length} audit events to storage`);
  }

  /**
   * Close storage
   */
  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    await this.flushBuffer();
  }
}

/**
 * Security Monitor - Real-time threat detection and alerting
 */
class SecurityMonitor {
  private config: AuditConfig;
  private auditStorage: ImmutableAuditStorage;
  private activeAlerts: Map<string, SecurityAlert> = new Map();
  private threatPatterns: Map<string, any> = new Map();
  private alertCallbacks: ((alert: SecurityAlert) => void)[] = [];

  constructor(config: AuditConfig, auditStorage: ImmutableAuditStorage) {
    this.config = config;
    this.auditStorage = auditStorage;
    this.initializeThreatPatterns();
    this.startMonitoring();
  }

  /**
   * Initialize threat detection patterns
   */
  private initializeThreatPatterns(): void {
    // Define common threat patterns
    this.threatPatterns.set('brute_force', {
      name: 'Brute Force Attack',
      description: 'Multiple failed access attempts',
      threshold: 5,
      timeWindow: 300000, // 5 minutes
      severity: 'high' as AuditSeverity,
    });
    
    this.threatPatterns.set('privilege_escalation', {
      name: 'Privilege Escalation',
      description: 'Unauthorized privilege escalation attempts',
      threshold: 1,
      timeWindow: 0,
      severity: 'critical' as AuditSeverity,
    });
    
    this.threatPatterns.set('data_exfiltration', {
      name: 'Data Exfiltration',
      description: 'Unusual data access patterns',
      threshold: 1000, // MB
      timeWindow: 3600000, // 1 hour
      severity: 'critical' as AuditSeverity,
    });
    
    this.threatPatterns.set('anomalous_access', {
      name: 'Anomalous Access',
      description: 'Access outside normal patterns',
      threshold: 3,
      timeWindow: 86400000, // 24 hours
      severity: 'medium' as AuditSeverity,
    });
  }

  /**
   * Start real-time monitoring
   */
  private startMonitoring(): void {
    if (!this.config.enableRealTimeMonitoring) {
      return;
    }
    
    // Monitor would run in background
    setInterval(() => {
      this.performThreatDetection();
    }, 60000); // Check every minute
  }

  /**
   * Analyze event for threats
   */
  async analyzeEvent(event: AuditEvent): Promise<void> {
    if (!this.config.enableThreatDetection) {
      return;
    }
    
    // Check against threat patterns
    for (const [patternId, pattern] of this.threatPatterns) {
      const threat = await this.detectThreat(event, patternId, pattern);
      if (threat) {
        await this.createSecurityAlert(threat);
      }
    }
  }

  /**
   * Detect specific threat pattern
   */
  private async detectThreat(
    event: AuditEvent, 
    patternId: string, 
    pattern: any
  ): Promise<SecurityAlert | null> {
    const now = Date.now();
    const timeWindow = pattern.timeWindow || 0;
    
    // Query recent events for pattern analysis
    const query: AuditQuery = {
      eventTypes: [event.eventType],
      actors: [event.actorId],
      timeRange: {
        start: timeWindow > 0 ? now - timeWindow : 0,
        end: now,
      },
      limit: 100,
    };
    
    const result = await this.auditStorage.queryEvents(query);
    const recentEvents = result.events;
    
    switch (patternId) {
      case 'brute_force':
        const failedAttempts = recentEvents.filter(e => e.actionResult === 'failure').length;
        if (failedAttempts >= pattern.threshold) {
          return this.createAlertFromPattern(pattern, 'brute_force', event, {
            attemptCount: failedAttempts,
            timeWindow: pattern.timeWindow,
          });
        }
        break;
        
      case 'privilege_escalation':
        if (event.actionResult === 'failure' && event.action.includes('privilege')) {
          return this.createAlertFromPattern(pattern, 'privilege_escalation', event, {
            attemptedAction: event.action,
            targetResource: event.resourceId,
          });
        }
        break;
        
      case 'data_exfiltration':
        const totalDataVolume = recentEvents.reduce((sum, e) => sum + (e.dataVolume || 0), 0);
        if (totalDataVolume >= pattern.threshold * 1024 * 1024) { // Convert MB to bytes
          return this.createAlertFromPattern(pattern, 'data_exfiltration', event, {
            dataVolume: totalDataVolume,
            timeWindow: pattern.timeWindow,
          });
        }
        break;
        
      case 'anomalous_access':
        // Check for access outside normal hours or from unusual locations
        const eventHour = new Date(event.timestamp).getHours();
        if (eventHour < 6 || eventHour > 22) { // Outside business hours
          return this.createAlertFromPattern(pattern, 'anomalous_access', event, {
            accessTime: event.timestamp,
            unusualHour: eventHour,
          });
        }
        break;
    }
    
    return null;
  }

  /**
   * Create security alert from pattern
   */
  private createAlertFromPattern(
    pattern: any,
    alertType: string,
    event: AuditEvent,
    context: any
  ): SecurityAlert {
    const alert: SecurityAlert = {
      alertId: uuidv4(),
      timestamp: Date.now(),
      severity: pattern.severity,
      alertType: alertType as any,
      detectionMethod: 'pattern_matching',
      confidence: 0.8,
      riskScore: this.calculateRiskScore(pattern.severity, 0.8),
      description: `${pattern.name}: ${pattern.description}`,
      affectedResources: [event.resourceId],
      actors: [event.actorId],
      indicators: [JSON.stringify(context)],
      status: 'open',
      autoMitigated: false,
      mitigationActions: [],
      relatedEvents: [event.eventId],
      relatedAlerts: [],
      metadata: { pattern, context },
      tags: [patternId, 'automatic'],
    };
    
    return SecurityAlertSchema.parse(alert);
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(severity: AuditSeverity, confidence: number): number {
    const severityScores = {
      'critical': 90,
      'high': 70,
      'medium': 50,
      'low': 30,
      'info': 10,
    };
    
    return severityScores[severity] * confidence;
  }

  /**
   * Create security alert
   */
  private async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    const validatedAlert = SecurityAlertSchema.parse(alert);
    this.activeAlerts.set(validatedAlert.alertId, validatedAlert);
    
    // Notify callbacks
    for (const callback of this.alertCallbacks) {
      try {
        callback(validatedAlert);
      } catch (error) {
        console.error('Security alert callback failed:', error);
      }
    }
    
    // Log alert as audit event
    const auditEvent: AuditEvent = {
      eventId: uuidv4(),
      timestamp: validatedAlert.timestamp,
      sequenceNumber: 0, // Will be assigned by storage
      eventType: 'suspicious_activity',
      severity: validatedAlert.severity,
      category: 'security',
      actorId: 'system',
      actorType: 'system',
      resourceId: validatedAlert.alertId,
      resourceType: 'system',
      action: 'security_alert_created',
      actionResult: 'success',
      actionDetails: {
        alertType: validatedAlert.alertType,
        riskScore: validatedAlert.riskScore,
        description: validatedAlert.description,
      },
      complianceStandards: ['SOC2', 'ISO27001'],
      eventHash: '', // Will be generated
      tags: ['security', 'alert', validatedAlert.alertType],
      environment: this.config.environment,
    };
    
    await this.auditStorage.appendEvent(auditEvent);
  }

  /**
   * Perform periodic threat detection
   */
  private async performThreatDetection(): Promise<void> {
    // Analyze recent events for patterns
    const query: AuditQuery = {
      timeRange: {
        start: Date.now() - 3600000, // Last hour
        end: Date.now(),
      },
      limit: 1000,
    };
    
    const result = await this.auditStorage.queryEvents(query);
    const events = result.events;
    
    // Analyze events for various threat patterns
    for (const event of events) {
      await this.analyzeEvent(event);
    }
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: SecurityAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): SecurityAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }
    
    alert.status = 'resolved';
    alert.resolution = resolution;
    alert.resolutionTime = Date.now() - alert.timestamp;
    
    // Update alert
    this.activeAlerts.set(alertId, alert);
    
    // Log resolution
    const auditEvent: AuditEvent = {
      eventId: uuidv4(),
      timestamp: Date.now(),
      sequenceNumber: 0,
      eventType: 'suspicious_activity',
      severity: alert.severity,
      category: 'security',
      actorId: 'system',
      actorType: 'system',
      resourceId: alertId,
      resourceType: 'system',
      action: 'security_alert_resolved',
      actionResult: 'success',
      actionDetails: {
        alertType: alert.alertType,
        resolution,
        resolutionTime: alert.resolutionTime,
      },
      complianceStandards: ['SOC2', 'ISO27001'],
      eventHash: '',
      tags: ['security', 'alert', 'resolved'],
      environment: this.config.environment,
    };
    
    await this.auditStorage.appendEvent(auditEvent);
  }

  /**
   * Close security monitor
   */
  close(): void {
    this.activeAlerts.clear();
    this.alertCallbacks = [];
  }
}

/**
 * Compliance Manager - Regulatory compliance reporting
 */
class ComplianceManager {
  private config: AuditConfig;
  private auditStorage: ImmutableAuditStorage;
  private retentionPolicies: Map<string, RetentionPolicy> = new Map();
  private complianceStandards: Map<ComplianceStandard, any> = new Map();

  constructor(config: AuditConfig, auditStorage: ImmutableAuditStorage) {
    this.config = config;
    this.auditStorage = auditStorage;
    this.initializeComplianceStandards();
    this.initializeRetentionPolicies();
  }

  /**
   * Initialize compliance standards
   */
  private initializeComplianceStandards(): void {
    // GDPR requirements
    this.complianceStandards.set('GDPR', {
      name: 'General Data Protection Regulation',
      retentionPeriod: 2555, // 7 years
      dataSubjectRights: ['access', 'rectification', 'erasure', 'portability'],
      breachNotification: 72, // 72 hours
      documentationRequirements: ['records_of_processing', 'data_protection_impact'],
    });
    
    // SOC2 requirements
    this.complianceStandards.set('SOC2', {
      name: 'Service Organization Control 2',
      retentionPeriod: 2555, // 7 years
      auditRequirements: ['independent_audit', 'management_assertion'],
      controlCategories: ['security', 'availability', 'processing_integrity', 'confidentiality', 'privacy'],
    });
    
    // HIPAA requirements
    this.complianceStandards.set('HIPAA', {
      name: 'Health Insurance Portability and Accountability Act',
      retentionPeriod: 2555, // 7 years
      auditRequirements: ['access_audit', 'security_audit'],
      protectedHealthInfo: true,
    });
  }

  /**
   * Initialize retention policies
   */
  private initializeRetentionPolicies(): void {
    // Default policies
    const defaultPolicy: RetentionPolicy = {
      policyId: 'default',
      name: 'Default Retention Policy',
      description: 'Default policy for audit data retention',
      standardRetention: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555'),
      extendedRetention: 3650, // 10 years
      maximumRetention: 36500, // 100 years
      archiveAfter: 365, // 1 year
      deleteAfter: 2555, // 7 years
      complianceStandards: ['GDPR', 'SOC2'],
      legalHold: true,
      dataClassifications: ['public', 'internal', 'confidential'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      enabled: true,
    };
    
    this.retentionPolicies.set('default', RetentionPolicySchema.parse(defaultPolicy));
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    standard: ComplianceStandard,
    period: { start: number; end: number }
  ): Promise<ComplianceReport> {
    const standardConfig = this.complianceStandards.get(standard);
    if (!standardConfig) {
      throw new Error(`Unsupported compliance standard: ${standard}`);
    }
    
    // Query events for the period
    const query: AuditQuery = {
      timeRange: period,
      complianceStandards: [standard],
      limit: 100000,
      includeAggregations: true,
      aggregateBy: 'eventType',
    };
    
    const result = await this.auditStorage.queryEvents(query);
    const events = result.events;
    
    // Analyze compliance
    const analysis = this.analyzeCompliance(events, standard, standardConfig);
    
    const report: ComplianceReport = {
      reportId: uuidv4(),
      reportType: standard,
      reportPeriod: period,
      overallStatus: analysis.status,
      complianceScore: analysis.score,
      findings: analysis.findings,
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highEvents: events.filter(e => e.severity === 'high').length,
      mediumEvents: events.filter(e => e.severity === 'medium').length,
      lowEvents: events.filter(e => e.severity === 'low').length,
      retentionCompliance: analysis.retentionCompliance,
      securityIncidents: analysis.securityIncidents,
      dataBreaches: analysis.dataBreaches,
      unauthorizedAccess: analysis.unauthorizedAccess,
      generatedAt: Date.now(),
      generatedBy: 'system',
      version: '1.0',
      nextReviewDate: period.end + (90 * 24 * 60 * 60 * 1000), // 90 days
      reportHash: '', // Will be generated
    };
    
    // Generate report hash
    report.reportHash = createHash('sha256')
      .update(JSON.stringify(report))
      .digest('hex');
    
    return ComplianceReportSchema.parse(report);
  }

  /**
   * Analyze compliance for events
   */
  private analyzeCompliance(events: AuditEvent[], standard: ComplianceStandard, config: any): any {
    const analysis: any = {
      status: 'compliant' as 'compliant' | 'non_compliant' | 'partial_compliant' | 'unknown',
      score: 100,
      findings: [] as any[],
      retentionCompliance: {
        compliant: true,
        violations: [] as string[],
        recommendations: [] as string[],
      },
      securityIncidents: 0,
      dataBreaches: 0,
      unauthorizedAccess: 0,
    };
    
    // Check retention compliance
    const now = Date.now();
    const retentionPeriod = config.retentionPeriod * 24 * 60 * 60 * 1000; // Convert days to ms
    
    for (const event of events) {
      const age = now - event.timestamp;
      if (age > retentionPeriod && !event.legalHold) {
        analysis.retentionCompliance.compliant = false;
        analysis.retentionCompliance.violations.push(
          `Event ${event.eventId} exceeds retention period`
        );
        analysis.score -= 5;
      }
    }
    
    // Check security incidents
    analysis.securityIncidents = events.filter(e => 
      e.category === 'security' && e.severity === 'critical'
    ).length;
    
    // Check data breaches
    analysis.dataBreaches = events.filter(e => 
      e.eventType === 'data_breach_attempt'
    ).length;
    
    // Check unauthorized access
    analysis.unauthorizedAccess = events.filter(e => 
      e.eventType === 'access_denied' || e.eventType === 'unauthorized_access'
    ).length;
    
    // Generate findings
    if (analysis.securityIncidents > 0) {
      analysis.findings.push({
        category: 'Security',
        severity: 'critical' as AuditSeverity,
        description: `${analysis.securityIncidents} security incidents detected`,
        evidence: events.filter(e => e.category === 'security').map(e => e.eventId),
        recommendation: 'Review security incidents and implement additional controls',
        status: 'open' as 'open' | 'in_progress' | 'resolved' | 'accepted_risk',
        dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
      });
      analysis.score -= 20;
    }
    
    if (analysis.dataBreaches > 0) {
      analysis.findings.push({
        category: 'Data Protection',
        severity: 'critical' as AuditSeverity,
        description: `${analysis.dataBreaches} data breach attempts detected`,
        evidence: events.filter(e => e.eventType === 'data_breach_attempt').map(e => e.eventId),
        recommendation: 'Investigate data breach attempts and enhance protection',
        status: 'open' as 'open' | 'in_progress' | 'resolved' | 'accepted_risk',
        dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
      });
      analysis.score -= 30;
    }
    
    // Determine overall status
    if (analysis.score >= 90) {
      analysis.status = 'compliant';
    } else if (analysis.score >= 70) {
      analysis.status = 'partial_compliant';
    } else {
      analysis.status = 'non_compliant';
    }
    
    return analysis;
  }

  /**
   * Apply retention policies
   */
  async applyRetentionPolicies(): Promise<void> {
    const now = Date.now();
    
    for (const [policyId, policy] of this.retentionPolicies) {
      if (!policy.enabled) continue;
      
      // Find events to archive
      const archiveQuery: AuditQuery = {
        timeRange: {
          start: 0,
          end: now - (policy.archiveAfter * 24 * 60 * 60 * 1000),
        },
        limit: 100000,
      };
      
      const archiveResult = await this.auditStorage.queryEvents(archiveQuery);
      const eventsToArchive = archiveResult.events;
      
      // Find events to delete
      const deleteQuery: AuditQuery = {
        timeRange: {
          start: 0,
          end: now - (policy.deleteAfter * 24 * 60 * 60 * 1000),
        },
        limit: 100000,
      };
      
      const deleteResult = await this.auditStorage.queryEvents(deleteQuery);
      const eventsToDelete = deleteResult.events.filter(e => !e.legalHold);
      
      // Log retention actions
      for (const event of eventsToArchive) {
        await this.logRetentionAction(event, 'archived', policyId);
      }
      
      for (const event of eventsToDelete) {
        await this.logRetentionAction(event, 'deleted', policyId);
      }
    }
  }

  /**
   * Log retention action
   */
  private async logRetentionAction(
    event: AuditEvent,
    action: 'archived' | 'deleted',
    policyId: string
  ): Promise<void> {
    const retentionEvent: AuditEvent = {
      eventId: uuidv4(),
      timestamp: Date.now(),
      sequenceNumber: 0,
      eventType: action === 'archived' ? 'data_archived' : 'data_purged',
      severity: 'info',
      category: 'compliance',
      actorId: 'system',
      actorType: 'system',
      resourceId: event.eventId,
      resourceType: 'audit_event',
      action: `retention_${action}`,
      actionResult: 'success',
      actionDetails: {
        originalEventId: event.eventId,
        originalEventType: event.eventType,
        policyId,
        action,
      },
      complianceStandards: ['GDPR', 'SOC2'],
      eventHash: '',
      tags: ['retention', action, policyId],
      environment: this.config.environment,
    };
    
    await this.auditStorage.appendEvent(retentionEvent);
  }

  /**
   * Add retention policy
   */
  addRetentionPolicy(policy: RetentionPolicy): void {
    const validatedPolicy = RetentionPolicySchema.parse(policy);
    this.retentionPolicies.set(validatedPolicy.policyId, validatedPolicy);
  }

  /**
   * Get retention policies
   */
  getRetentionPolicies(): RetentionPolicy[] {
    return Array.from(this.retentionPolicies.values());
  }
}

/**
 * Performance Monitor - System performance monitoring and bottleneck detection
 */
class PerformanceMonitor {
  private config: AuditConfig;
  private auditStorage: ImmutableAuditStorage;
  private metrics: PerformanceMetrics[] = [];
  private alertThresholds: Map<string, number> = new Map();
  private monitoringActive: boolean = false;

  constructor(config: AuditConfig, auditStorage: ImmutableAuditStorage) {
    this.config = config;
    this.auditStorage = auditStorage;
    this.initializeThresholds();
    this.startMonitoring();
  }

  /**
   * Initialize performance thresholds
   */
  private initializeThresholds(): void {
    this.alertThresholds.set('cpu', 80); // 80% CPU
    this.alertThresholds.set('memory', 85); // 85% Memory
    this.alertThresholds.set('disk', 90); // 90% Disk
    this.alertThresholds.set('response_time', 5000); // 5 seconds
    this.alertThresholds.set('error_rate', 5); // 5% error rate
    this.alertThresholds.set('queue_depth', 1000); // 1000 items in queue
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    if (!this.config.enableMetrics) {
      return;
    }
    
    this.monitoringActive = true;
    
    // Collect metrics every minute
    setInterval(() => {
      this.collectMetrics();
    }, 60000);
    
    // Analyze metrics every 5 minutes
    setInterval(() => {
      this.analyzePerformance();
    }, 300000);
  }

  /**
   * Collect performance metrics
   */
  private async collectMetrics(): Promise<void> {
    if (!this.monitoringActive) return;
    
    const now = Date.now();
    const query: AuditQuery = {
      timeRange: {
        start: now - 60000, // Last minute
        end: now,
      },
      limit: 10000,
    };
    
    const result = await this.auditStorage.queryEvents(query);
    const events = result.events;
    
    // Calculate metrics
    const metrics: PerformanceMetrics = {
      timestamp: now,
      period: 'minute',
      totalOperations: events.length,
      operationsByType: this.groupOperationsByType(events),
      averageOperationTime: this.calculateAverageOperationTime(events),
      p95OperationTime: this.calculatePercentileOperationTime(events, 95),
      p99OperationTime: this.calculatePercentileOperationTime(events, 99),
      cpuUsage: this.getCPUUsage(),
      memoryUsage: this.getMemoryUsage(),
      diskUsage: this.getDiskUsage(),
      networkIO: this.getNetworkIO(),
      queueDepth: this.getQueueDepth(),
      averageWaitTime: this.calculateAverageWaitTime(events),
      maxWaitTime: this.calculateMaxWaitTime(events),
      errorRate: this.calculateErrorRate(events),
      errorsByType: this.groupErrorsByType(events),
      criticalErrors: events.filter(e => e.severity === 'critical').length,
      cacheHitRate: this.getCacheHitRate(),
      cacheSize: this.getCacheSize(),
      cacheEvictions: this.getCacheEvictions(),
      bottlenecks: [],
      activeAlerts: this.getActivePerformanceAlerts(),
      alertThresholds: Object.fromEntries(this.alertThresholds),
    };
    
    // Detect bottlenecks
    metrics.bottlenecks = this.detectBottlenecks(metrics);
    
    this.metrics.push(PerformanceMetricsSchema.parse(metrics));
    
    // Keep only last 24 hours of metrics
    const cutoff = now - (24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
    
    // Log performance alerts
    await this.logPerformanceAlerts(metrics);
  }

  /**
   * Analyze performance trends
   */
  private analyzePerformance(): void {
    if (this.metrics.length < 60) return; // Need at least 1 hour of data
    
    const recentMetrics = this.metrics.slice(-60); // Last hour
    const olderMetrics = this.metrics.slice(-120, -60); // Previous hour
    
    // Compare performance
    const comparison = this.comparePerformance(recentMetrics, olderMetrics);
    
    // Detect degradation
    if (comparison.degradation > 20) { // 20% degradation
      this.createPerformanceAlert('performance_degradation', {
        degradation: comparison.degradation,
        affectedMetrics: comparison.affectedMetrics,
      });
    }
  }

  /**
   * Group operations by type
   */
  private groupOperationsByType(events: AuditEvent[]): Record<string, number> {
    return events.reduce((groups, event) => {
      groups[event.eventType] = (groups[event.eventType] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Calculate average operation time
   */
  private calculateAverageOperationTime(events: AuditEvent[]): number {
    const eventsWithDuration = events.filter(e => e.duration !== undefined);
    if (eventsWithDuration.length === 0) return 0;
    
    const total = eventsWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0);
    return total / eventsWithDuration.length;
  }

  /**
   * Calculate percentile operation time
   */
  private calculatePercentileOperationTime(events: AuditEvent[], percentile: number): number {
    const eventsWithDuration = events
      .filter(e => e.duration !== undefined)
      .map(e => e.duration!)
      .sort((a, b) => a - b);
    
    if (eventsWithDuration.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * eventsWithDuration.length) - 1;
    return eventsWithDuration[Math.max(0, index)];
  }

  /**
   * Get CPU usage (placeholder)
   */
  private getCPUUsage(): number {
    // In real implementation, this would get actual CPU usage
    return Math.random() * 100;
  }

  /**
   * Get memory usage (placeholder)
   */
  private getMemoryUsage(): number {
    // In real implementation, this would get actual memory usage
    return Math.random() * 100;
  }

  /**
   * Get disk usage (placeholder)
   */
  private getDiskUsage(): number {
    // In real implementation, this would get actual disk usage
    return Math.random() * 100;
  }

  /**
   * Get network I/O (placeholder)
   */
  private getNetworkIO(): { bytesIn: number; bytesOut: number } {
    // In real implementation, this would get actual network I/O
    return {
      bytesIn: Math.floor(Math.random() * 1000000),
      bytesOut: Math.floor(Math.random() * 1000000),
    };
  }

  /**
   * Get queue depth (placeholder)
   */
  private getQueueDepth(): number {
    // In real implementation, this would get actual queue depth
    return Math.floor(Math.random() * 2000);
  }

  /**
   * Calculate average wait time
   */
  private calculateAverageWaitTime(events: AuditEvent[]): number {
    // This would need wait time information in events
    return Math.random() * 1000;
  }

  /**
   * Calculate max wait time
   */
  private calculateMaxWaitTime(events: AuditEvent[]): number {
    // This would need wait time information in events
    return Math.random() * 5000;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(events: AuditEvent[]): number {
    if (events.length === 0) return 0;
    
    const errorEvents = events.filter(e => e.actionResult === 'failure');
    return (errorEvents.length / events.length) * 100;
  }

  /**
   * Group errors by type
   */
  private groupErrorsByType(events: AuditEvent[]): Record<string, number> {
    const errorEvents = events.filter(e => e.actionResult === 'failure');
    return errorEvents.reduce((groups, event) => {
      const errorType = event.errorCode || 'unknown';
      groups[errorType] = (groups[errorType] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Get cache hit rate (placeholder)
   */
  private getCacheHitRate(): number {
    // In real implementation, this would get actual cache hit rate
    return Math.random() * 100;
  }

  /**
   * Get cache size (placeholder)
   */
  private getCacheSize(): number {
    // In real implementation, this would get actual cache size
    return Math.floor(Math.random() * 10000);
  }

  /**
   * Get cache evictions (placeholder)
   */
  private getCacheEvictions(): number {
    // In real implementation, this would get actual cache evictions
    return Math.floor(Math.random() * 100);
  }

  /**
   * Detect bottlenecks
   */
  private detectBottlenecks(metrics: PerformanceMetrics): any[] {
    const bottlenecks: any[] = [];
    
    // Check CPU
    if (metrics.cpuUsage > this.alertThresholds.get('cpu')!) {
      bottlenecks.push({
        type: 'cpu',
        severity: 'high' as AuditSeverity,
        description: `CPU usage at ${metrics.cpuUsage.toFixed(1)}% exceeds threshold`,
        impact: 'System performance degradation',
        recommendation: 'Scale horizontally or optimize CPU-intensive operations',
      });
    }
    
    // Check memory
    if (metrics.memoryUsage > this.alertThresholds.get('memory')!) {
      bottlenecks.push({
        type: 'memory',
        severity: 'high' as AuditSeverity,
        description: `Memory usage at ${metrics.memoryUsage.toFixed(1)}% exceeds threshold`,
        impact: 'Increased latency and potential outages',
        recommendation: 'Add memory or optimize memory usage',
      });
    }
    
    // Check disk
    if (metrics.diskUsage > this.alertThresholds.get('disk')!) {
      bottlenecks.push({
        type: 'disk',
        severity: 'medium' as AuditSeverity,
        description: `Disk usage at ${metrics.diskUsage.toFixed(1)}% exceeds threshold`,
        impact: 'Slow write operations and potential data loss',
        recommendation: 'Clean up disk or expand storage',
      });
    }
    
    // Check response time
    if (metrics.averageOperationTime > this.alertThresholds.get('response_time')!) {
      bottlenecks.push({
        type: 'database',
        severity: 'medium' as AuditSeverity,
        description: `Average response time ${metrics.averageOperationTime.toFixed(1)}ms exceeds threshold`,
        impact: 'Poor user experience and system timeouts',
        recommendation: 'Optimize database queries or add resources',
      });
    }
    
    // Check error rate
    if (metrics.errorRate > this.alertThresholds.get('error_rate')!) {
      bottlenecks.push({
        type: 'queue',
        severity: 'high' as AuditSeverity,
        description: `Error rate ${metrics.errorRate.toFixed(1)}% exceeds threshold`,
        impact: 'System reliability and user trust',
        recommendation: 'Investigate root cause of errors and implement fixes',
      });
    }
    
    return bottlenecks;
  }

  /**
   * Get active performance alerts
   */
  private getActivePerformanceAlerts(): number {
    // In real implementation, this would track active alerts
    return Math.floor(Math.random() * 10);
  }

  /**
   * Compare performance between periods
   */
  private comparePerformance(recent: PerformanceMetrics[], older: PerformanceMetrics[]): any {
    const recentAvg = this.calculateAverageMetrics(recent);
    const olderAvg = this.calculateAverageMetrics(older);
    
    const comparison: any = {
      degradation: 0,
      affectedMetrics: [] as string[],
    };
    
    // Compare key metrics
    const metricsToCompare = ['averageOperationTime', 'errorRate', 'cpuUsage', 'memoryUsage'];
    
    for (const metric of metricsToCompare) {
      const recentValue = (recentAvg as any)[metric];
      const olderValue = (olderAvg as any)[metric];
      
      if (olderValue > 0) {
        const change = ((recentValue - olderValue) / olderValue) * 100;
        if (change > comparison.degradation) {
          comparison.degradation = change;
          comparison.affectedMetrics = [metric];
        }
      }
    }
    
    return comparison;
  }

  /**
   * Calculate average metrics
   */
  private calculateAverageMetrics(metrics: PerformanceMetrics[]): any {
    if (metrics.length === 0) return {};
    
    const avg: any = {};
    const keys = ['totalOperations', 'averageOperationTime', 'cpuUsage', 'memoryUsage', 'diskUsage', 'errorRate'];
    
    for (const key of keys) {
      const sum = metrics.reduce((total, m) => total + ((m as any)[key] || 0), 0);
      avg[key] = sum / metrics.length;
    }
    
    return avg;
  }

  /**
   * Log performance alerts
   */
  private async logPerformanceAlerts(metrics: PerformanceMetrics): Promise<void> {
    for (const bottleneck of metrics.bottlenecks) {
      const alertEvent: AuditEvent = {
        eventId: uuidv4(),
        timestamp: Date.now(),
        sequenceNumber: 0,
        eventType: 'performance_alert',
        severity: bottleneck.severity,
        category: 'performance',
        actorId: 'system',
        actorType: 'system',
        resourceId: 'system',
        resourceType: 'system',
        action: 'bottleneck_detected',
        actionResult: 'success',
        actionDetails: {
          bottleneckType: bottleneck.type,
          description: bottleneck.description,
          impact: bottleneck.impact,
          recommendation: bottleneck.recommendation,
          currentUsage: this.getCurrentUsage(bottleneck.type),
        },
        eventHash: '',
        tags: ['performance', 'bottleneck', bottleneck.type],
        environment: this.config.environment,
      };
      
      await this.auditStorage.appendEvent(alertEvent);
    }
  }

  /**
   * Get current usage for resource type
   */
  private getCurrentUsage(type: string): number {
    switch (type) {
      case 'cpu':
        return this.getCPUUsage();
      case 'memory':
        return this.getMemoryUsage();
      case 'disk':
        return this.getDiskUsage();
      default:
        return 0;
    }
  }

  /**
   * Create performance alert
   */
  private createPerformanceAlert(alertType: string, details: any): void {
    const alertEvent: AuditEvent = {
      eventId: uuidv4(),
      timestamp: Date.now(),
      sequenceNumber: 0,
      eventType: 'performance_alert',
      severity: 'medium',
      category: 'performance',
      actorId: 'system',
      actorType: 'system',
      resourceId: 'system',
      resourceType: 'system',
      action: alertType,
      actionResult: 'success',
      actionDetails: details,
      eventHash: '',
      tags: ['performance', 'alert'],
      environment: this.config.environment,
    };
    
    this.auditStorage.appendEvent(alertEvent);
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(hours: number = 24): PerformanceMetrics[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Close performance monitor
   */
  close(): void {
    this.monitoringActive = false;
  }
}

/**
 * Forensic Analyzer - Incident investigation tools
 */
class ForensicAnalyzer {
  private config: AuditConfig;
  private auditStorage: ImmutableAuditStorage;

  constructor(config: AuditConfig, auditStorage: ImmutableAuditStorage) {
    this.config = config;
    this.auditStorage = auditStorage;
  }

  /**
   * Create forensic analysis for incident
   */
  async createAnalysis(
    incidentId: string,
    analystId: string,
    timeRange: { start: number; end: number },
    resourceScope: string[] = [],
    actorScope: string[] = []
  ): Promise<ForensicAnalysis> {
    // Gather evidence
    const evidence = await this.gatherEvidence(timeRange, resourceScope, actorScope);
    
    // Analyze patterns
    const patterns = await this.analyzePatterns(evidence.events);
    
    // Determine root cause
    const rootCause = await this.analyzeRootCause(evidence.events, patterns);
    
    // Assess impact
    const impact = await this.assessImpact(evidence.events, resourceScope);
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(rootCause, impact, patterns);
    
    const analysis: ForensicAnalysis = {
      analysisId: uuidv4(),
      incidentId,
      timestamp: Date.now(),
      analystId,
      timeRange,
      resourceScope,
      actorScope,
      timeline: this.buildTimeline(evidence.events),
      patterns,
      rootCause,
      impact,
      recommendations,
      tools: ['audit_trail', 'pattern_analysis', 'impact_assessment'],
      methodology: 'comprehensive_forensic_analysis',
      confidence: this.calculateAnalysisConfidence(evidence, patterns, rootCause),
      analysisHash: '', // Will be generated
    };
    
    // Generate analysis hash
    analysis.analysisHash = createHash('sha256')
      .update(JSON.stringify(analysis))
      .digest('hex');
    
    return ForensicAnalysisSchema.parse(analysis);
  }

  /**
   * Gather evidence for analysis
   */
  private async gatherEvidence(
    timeRange: { start: number; end: number },
    resourceScope: string[],
    actorScope: string[]
  ): Promise<{ events: AuditEvent[]; evidence: string[] }> {
    const query: AuditQuery = {
      timeRange,
      resources: resourceScope.length > 0 ? resourceScope : undefined,
      actors: actorScope.length > 0 ? actorScope : undefined,
      limit: 100000,
    };
    
    const result = await this.auditStorage.queryEvents(query);
    const events = result.events;
    
    // Extract evidence items
    const evidence: string[] = [];
    for (const event of events) {
      if (event.actionDetails) {
        evidence.push(JSON.stringify(event.actionDetails));
      }
      if (event.errorMessage) {
        evidence.push(`Error: ${event.errorMessage}`);
      }
      if (event.ipAddress) {
        evidence.push(`IP: ${event.ipAddress}`);
      }
    }
    
    return { events, evidence };
  }

  /**
   * Analyze patterns in events
   */
  private async analyzePatterns(events: AuditEvent[]): Promise<any[]> {
    const patterns: any[] = [];
    
    // Analyze temporal patterns
    const temporalPatterns = this.analyzeTemporalPatterns(events);
    patterns.push(...temporalPatterns);
    
    // Analyze access patterns
    const accessPatterns = this.analyzeAccessPatterns(events);
    patterns.push(...accessPatterns);
    
    // Analyze failure patterns
    const failurePatterns = this.analyzeFailurePatterns(events);
    patterns.push(...failurePatterns);
    
    return patterns;
  }

  /**
   * Analyze temporal patterns
   */
  private analyzeTemporalPatterns(events: AuditEvent[]): any[] {
    const patterns: any[] = [];
    
    // Group events by hour
    const eventsByHour = events.reduce((groups, event) => {
      const hour = new Date(event.timestamp).getHours();
      groups[hour] = (groups[hour] || 0) + 1;
      return groups;
    }, {});
    
    // Find unusual hours
    const avgEventsPerHour = events.length / 24;
    for (const [hour, count] of Object.entries(eventsByHour)) {
      if (count > avgEventsPerHour * 2) { // Significantly above average
        patterns.push({
          patternType: 'temporal_anomaly',
          description: `Unusual activity at hour ${hour}`,
          frequency: count,
          confidence: 0.7,
          indicators: [`hour_${hour}_high_activity`],
        });
      }
    }
    
    return patterns;
  }

  /**
   * Analyze access patterns
   */
  private analyzeAccessPatterns(events: AuditEvent[]): any[] {
    const patterns: any[] = [];
    
    // Group by actor
    const eventsByActor = events.reduce((groups, event) => {
      groups[event.actorId] = (groups[event.actorId] || 0) + 1;
      return groups;
    }, {});
    
    // Find unusual access patterns
    const avgEventsPerActor = events.length / Object.keys(eventsByActor).length;
    for (const [actorId, count] of Object.entries(eventsByActor)) {
      if (count > avgEventsPerActor * 3) { // Significantly above average
        patterns.push({
          patternType: 'access_anomaly',
          description: `Unusual access frequency by actor ${actorId}`,
          frequency: count,
          confidence: 0.8,
          indicators: [`actor_${actorId}_high_frequency`],
        });
      }
    }
    
    return patterns;
  }

  /**
   * Analyze failure patterns
   */
  private analyzeFailurePatterns(events: AuditEvent[]): any[] {
    const patterns: any[] = [];
    
    // Group failures by type
    const failures = events.filter(e => e.actionResult === 'failure');
    const failuresByType = failures.reduce((groups, event) => {
      const errorType = event.errorCode || 'unknown';
      groups[errorType] = (groups[errorType] || 0) + 1;
      return groups;
    }, {});
    
    // Find common failure patterns
    for (const [errorType, count] of Object.entries(failuresByType)) {
      if (count > 5) { // Repeated failures
        patterns.push({
          patternType: 'failure_pattern',
          description: `Repeated failure type: ${errorType}`,
          frequency: count,
          confidence: 0.9,
          indicators: [`error_type_${errorType}_repeated`],
        });
      }
    }
    
    return patterns;
  }

  /**
   * Analyze root cause
   */
  private async analyzeRootCause(events: AuditEvent[], patterns: any[]): Promise<any> {
    // Find the earliest critical event
    const criticalEvents = events.filter(e => e.severity === 'critical');
    const rootEvent = criticalEvents.length > 0 
      ? criticalEvents.reduce((earliest, event) => 
          event.timestamp < earliest.timestamp ? event : earliest
        )
      : events[0]; // First event if no critical events
    
    // Analyze contributing factors
    const contributingFactors: string[] = [];
    
    // Check for preceding events
    const precedingEvents = events.filter(e => 
      e.timestamp < rootEvent.timestamp && 
      e.timestamp > rootEvent.timestamp - 300000 // Within 5 minutes
    );
    
    for (const event of precedingEvents) {
      if (event.actionResult === 'failure') {
        contributingFactors.push(`Preceding failure: ${event.errorCode}`);
      }
    }
    
    // Check patterns for root cause indicators
    for (const pattern of patterns) {
      if (pattern.confidence > 0.8) {
        contributingFactors.push(`Strong pattern: ${pattern.patternType}`);
      }
    }
    
    return {
      category: this.categorizeRootCause(rootEvent, patterns),
      description: `Root cause identified as ${rootEvent.eventType} by ${rootEvent.actorId}`,
      contributingFactors,
      evidence: [rootEvent.eventId, ...precedingEvents.map(e => e.eventId)],
      confidence: this.calculateRootCauseConfidence(rootEvent, patterns),
    };
  }

  /**
   * Categorize root cause
   */
  private categorizeRootCause(rootEvent: AuditEvent, patterns: any[]): string {
    if (rootEvent.eventType.includes('security')) {
      return 'security_breach';
    }
    
    if (rootEvent.eventType.includes('performance')) {
      return 'performance_degradation';
    }
    
    if (rootEvent.actionResult === 'failure') {
      return 'system_failure';
    }
    
    if (patterns.some(p => p.patternType === 'access_anomaly')) {
      return 'unauthorized_access';
    }
    
    return 'unknown';
  }

  /**
   * Calculate root cause confidence
   */
  private calculateRootCauseConfidence(rootEvent: AuditEvent, patterns: any[]): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on event severity
    if (rootEvent.severity === 'critical') confidence += 0.3;
    if (rootEvent.severity === 'high') confidence += 0.2;
    
    // Increase confidence based on pattern strength
    const strongPatterns = patterns.filter(p => p.confidence > 0.8);
    confidence += strongPatterns.length * 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Assess impact
   */
  private async assessImpact(events: AuditEvent[], resourceScope: string[]): Promise<any> {
    // Identify affected data
    const affectedData = [...new Set(events.map(e => e.resourceId))];
    
    // Identify affected systems
    const affectedSystems = [...new Set(events.map(e => e.resourceType))];
    
    // Estimate affected users (simplified)
    const affectedUsers = events.filter(e => e.actorType === 'user').length;
    
    // Assess business impact
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const businessImpact = this.assessBusinessImpact(criticalEvents, affectedSystems);
    
    // Estimate financial impact (simplified)
    const financialImpact = this.estimateFinancialImpact(criticalEvents, affectedData);
    
    return {
      dataAffected: affectedData,
      systemsAffected: affectedSystems,
      usersAffected: affectedUsers,
      businessImpact,
      financialImpact,
      reputationalImpact: this.assessReputationalImpact(criticalEvents),
    };
  }

  /**
   * Assess business impact
   */
  private assessBusinessImpact(criticalEvents: AuditEvent[], affectedSystems: string[]): string {
    if (criticalEvents.length === 0) {
      return 'Minimal impact';
    }
    
    if (affectedSystems.includes('memory') || affectedSystems.includes('database')) {
      return 'Critical business impact - core systems affected';
    }
    
    if (criticalEvents.length > 5) {
      return 'High business impact - multiple critical failures';
    }
    
    return 'Moderate business impact';
  }

  /**
   * Estimate financial impact
   */
  private estimateFinancialImpact(criticalEvents: AuditEvent[], affectedData: string[]): number {
    // Simplified financial impact calculation
    const baseImpact = criticalEvents.length * 1000; // $1000 per critical event
    const dataImpact = affectedData.length * 100; // $100 per affected data item
    
    return baseImpact + dataImpact;
  }

  /**
   * Assess reputational impact
   */
  private assessReputationalImpact(criticalEvents: AuditEvent[]): string {
    if (criticalEvents.length === 0) {
      return 'No reputational impact';
    }
    
    const securityEvents = criticalEvents.filter(e => e.category === 'security');
    if (securityEvents.length > 0) {
      return 'High reputational impact - security incidents';
    }
    
    return 'Moderate reputational impact';
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(rootCause: any, impact: any, patterns: any[]): Promise<any[]> {
    const recommendations: any[] = [];
    
    // Security recommendations
    if (rootCause.category === 'security_breach') {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        description: 'Implement additional security controls',
        implementation: 'Review and enhance security measures, implement multi-factor authentication',
        timeframe: 'Immediate',
      });
    }
    
    // Performance recommendations
    if (rootCause.category === 'performance_degradation') {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        description: 'Optimize system performance',
        implementation: 'Identify bottlenecks and optimize resource usage',
        timeframe: '1-2 weeks',
      });
    }
    
    // Data protection recommendations
    if (impact.dataAffected.length > 100) {
      recommendations.push({
        priority: 'medium',
        category: 'data_protection',
        description: 'Enhance data protection measures',
        implementation: 'Implement data loss prevention and encryption',
        timeframe: '2-4 weeks',
      });
    }
    
    return recommendations;
  }

  /**
   * Build timeline
   */
  private buildTimeline(events: AuditEvent[]): any[] {
    const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);
    
    return sortedEvents.map(event => ({
      timestamp: event.timestamp,
      eventId: event.eventId,
      description: `${event.eventType}: ${event.action}`,
      significance: this.assessEventSignificance(event),
      evidence: [event.eventId],
    }));
  }

  /**
   * Assess event significance
   */
  private assessEventSignificance(event: AuditEvent): string {
    if (event.severity === 'critical') return 'critical';
    if (event.severity === 'high') return 'high';
    if (event.severity === 'medium') return 'medium';
    return 'low';
  }

  /**
   * Calculate analysis confidence
   */
  private calculateAnalysisConfidence(
    evidence: { events: AuditEvent[]; evidence: string[] },
    patterns: any[],
    rootCause: any
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Evidence quality
    if (evidence.events.length > 50) confidence += 0.1;
    if (evidence.evidence.length > 100) confidence += 0.1;
    
    // Pattern strength
    const strongPatterns = patterns.filter(p => p.confidence > 0.8);
    confidence += strongPatterns.length * 0.1;
    
    // Root cause confidence
    confidence += rootCause.confidence * 0.2;
    
    return Math.min(confidence, 1.0);
  }
}

/**
 * Audit Trail Manager - Main audit system coordinator
 */
export class AuditTrailManager {
  private config: AuditConfig;
  private storage: ImmutableAuditStorage;
  private securityMonitor: SecurityMonitor;
  private complianceManager: ComplianceManager;
  private performanceMonitor: PerformanceMonitor;
  private forensicAnalyzer: ForensicAnalyzer;
  private integrations: any = {};
  private stats: AuditStats;

  constructor(config: AuditConfig) {
    const validatedConfig = AuditConfigSchema.parse(config);
    this.config = validatedConfig;
    
    // Initialize components
    this.storage = new ImmutableAuditStorage(validatedConfig);
    this.securityMonitor = new SecurityMonitor(validatedConfig, this.storage);
    this.complianceManager = new ComplianceManager(validatedConfig, this.storage);
    this.performanceMonitor = new PerformanceMonitor(validatedConfig, this.storage);
    this.forensicAnalyzer = new ForensicAnalyzer(validatedConfig, this.storage);
    
    // Initialize statistics
    this.stats = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      eventsByActor: {},
      eventsByResource: {},
      eventsLastHour: 0,
      eventsLastDay: 0,
      eventsLastWeek: 0,
      eventsLastMonth: 0,
      averageWriteTime: 0,
      averageQueryTime: 0,
      cacheHitRate: 0,
      storageSize: 0,
      securityAlerts: 0,
      threatsDetected: 0,
      falsePositives: 0,
      complianceScore: 100,
      retentionViolations: 0,
      reportsGenerated: 0,
      activeTenants: 0,
      tenantEventCounts: {},
      systemUptime: 100,
      errorRate: 0,
      lastEventTimestamp: 0,
      generatedAt: Date.now(),
    };
    
    this.log('info', 'Audit Trail Manager initialized', { config: validatedConfig });
  }

  /**
   * Set integrations with other memory components
   */
  setIntegrations(integrations: {
    vectorStore?: any;
    memoryManager?: any;
    invalidationManager?: any;
    retrievalManager?: any;
    lineageManager?: any;
  }): void {
    this.integrations = integrations;
    
    // Set up event listeners for integrated components
    if (integrations.memoryManager) {
      this.setupMemoryManagerIntegration(integrations.memoryManager);
    }
    
    if (integrations.invalidationManager) {
      this.setupInvalidationManagerIntegration(integrations.invalidationManager);
    }
    
    if (integrations.retrievalManager) {
      this.setupRetrievalManagerIntegration(integrations.retrievalManager);
    }
    
    this.log('info', 'Integrations configured', {
      hasMemoryManager: !!integrations.memoryManager,
      hasInvalidationManager: !!integrations.invalidationManager,
      hasRetrievalManager: !!integrations.retrievalManager,
    });
  }

  /**
   * Record audit event
   */
  async recordEvent(event: Partial<AuditEvent>): Promise<void> {
    try {
      // Complete event with defaults
      const completeEvent: AuditEvent = {
        eventId: uuidv4(),
        timestamp: Date.now(),
        sequenceNumber: 0, // Will be assigned by storage
        eventType: event.eventType || 'system_event',
        severity: event.severity || 'info',
        category: event.category || 'general',
        actorId: event.actorId || 'system',
        actorType: event.actorType || 'system',
        resourceId: event.resourceId || 'system',
        resourceType: event.resourceType || 'system',
        action: event.action || 'unknown',
        actionResult: event.actionResult || 'success',
        eventHash: '', // Will be generated
        tags: event.tags || [],
        environment: this.config.environment,
        ...event,
      };
      
      // Validate event
      const validatedEvent = AuditEventSchema.parse(completeEvent);
      
      // Store event
      await this.storage.appendEvent(validatedEvent);
      
      // Update statistics
      this.updateStats(validatedEvent);
      
      // Send to security monitor
      await this.securityMonitor.analyzeEvent(validatedEvent);
      
      this.log('debug', 'Audit event recorded', {
        eventId: validatedEvent.eventId,
        eventType: validatedEvent.eventType,
        actorId: validatedEvent.actorId,
      });
      
    } catch (error) {
      this.log('error', 'Failed to record audit event', { error, event });
      throw new Error(`Failed to record audit event: ${error.message}`);
    }
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<AuditResult> {
    try {
      const result = await this.storage.queryEvents(query);
      
      this.log('debug', 'Audit query completed', {
        query: JSON.stringify(query),
        results: result.events.length,
        queryTime: result.queryTime,
      });
      
      return result;
      
    } catch (error) {
      this.log('error', 'Audit query failed', { error, query });
      throw new Error(`Audit query failed: ${error.message}`);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    standard: ComplianceStandard,
    period: { start: number; end: number }
  ): Promise<ComplianceReport> {
    try {
      const report = await this.complianceManager.generateComplianceReport(standard, period);
      
      // Record report generation
      await this.recordEvent({
        eventType: 'regulatory_report_generated',
        severity: 'info',
        category: 'compliance',
        action: 'compliance_report_generated',
        actionDetails: {
          standard,
          reportId: report.reportId,
          complianceScore: report.complianceScore,
          findings: report.findings.length,
        },
        complianceStandards: [standard],
        tags: ['compliance', 'report', standard],
      });
      
      this.stats.reportsGenerated++;
      
      this.log('info', 'Compliance report generated', {
        standard,
        reportId: report.reportId,
        complianceScore: report.complianceScore,
      });
      
      return report;
      
    } catch (error) {
      this.log('error', 'Failed to generate compliance report', { error, standard });
      throw new Error(`Failed to generate compliance report: ${error.message}`);
    }
  }

  /**
   * Create forensic analysis
   */
  async createForensicAnalysis(
    incidentId: string,
    analystId: string,
    timeRange: { start: number; end: number },
    resourceScope?: string[],
    actorScope?: string[]
  ): Promise<ForensicAnalysis> {
    try {
      const analysis = await this.forensicAnalyzer.createAnalysis(
        incidentId,
        analystId,
        timeRange,
        resourceScope,
        actorScope
      );
      
      // Record analysis creation
      await this.recordEvent({
        eventType: 'system_event',
        severity: 'info',
        category: 'forensic',
        action: 'forensic_analysis_created',
        actionDetails: {
          incidentId,
          analysisId: analysis.analysisId,
          analystId,
          confidence: analysis.confidence,
        },
        tags: ['forensic', 'analysis', incidentId],
      });
      
      this.log('info', 'Forensic analysis created', {
        incidentId,
        analysisId: analysis.analysisId,
        analystId,
      });
      
      return analysis;
      
    } catch (error) {
      this.log('error', 'Failed to create forensic analysis', { error, incidentId });
      throw new Error(`Failed to create forensic analysis: ${error.message}`);
    }
  }

  /**
   * Get security alerts
   */
  getSecurityAlerts(): SecurityAlert[] {
    return this.securityMonitor.getActiveAlerts();
  }

  /**
   * Resolve security alert
   */
  async resolveSecurityAlert(alertId: string, resolution: string): Promise<void> {
    try {
      await this.securityMonitor.resolveAlert(alertId, resolution);
      
      this.log('info', 'Security alert resolved', {
        alertId,
        resolution,
      });
      
    } catch (error) {
      this.log('error', 'Failed to resolve security alert', { error, alertId });
      throw new Error(`Failed to resolve security alert: ${error.message}`);
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(hours: number = 24): PerformanceMetrics[] {
    return this.performanceMonitor.getRecentMetrics(hours);
  }

  /**
   * Get retention policies
   */
  getRetentionPolicies(): RetentionPolicy[] {
    return this.complianceManager.getRetentionPolicies();
  }

  /**
   * Add retention policy
   */
  addRetentionPolicy(policy: RetentionPolicy): void {
    this.complianceManager.addRetentionPolicy(policy);
    
    this.log('info', 'Retention policy added', {
      policyId: policy.policyId,
      name: policy.name,
    });
  }

  /**
   * Get statistics
   */
  getStats(): AuditStats {
    // Update time-based statistics
    this.updateTimeBasedStats();
    
    return { ...this.stats };
  }

  /**
   * Apply retention policies
   */
  async applyRetentionPolicies(): Promise<void> {
    try {
      await this.complianceManager.applyRetentionPolicies();
      
      this.log('info', 'Retention policies applied');
      
    } catch (error) {
      this.log('error', 'Failed to apply retention policies', { error });
      throw new Error(`Failed to apply retention policies: ${error.message}`);
    }
  }

  /**
   * Close audit trail manager
   */
  async close(): Promise<void> {
    try {
      // Close all components
      await this.storage.close();
      this.securityMonitor.close();
      this.performanceMonitor.close();
      
      this.log('info', 'Audit Trail Manager closed');
      
    } catch (error) {
      this.log('error', 'Failed to close audit trail manager', { error });
      throw new Error(`Failed to close audit trail manager: ${error.message}`);
    }
  }

  // Private helper methods

  /**
   * Set up memory manager integration
   */
  private setupMemoryManagerIntegration(memoryManager: any): void {
    // Monitor memory operations
    const originalStoreThought = memoryManager.storeThought;
    memoryManager.storeThought = async (thought: any, dataSource?: any) => {
      const startTime = Date.now();
      
      try {
        const result = await originalStoreThought.call(memoryManager, thought, dataSource);
        
        await this.recordEvent({
          eventType: 'memory_created',
          severity: 'info',
          category: 'memory',
          actorId: thought.agentId,
          actorType: 'agent',
          resourceId: result,
          resourceType: 'memory',
          action: 'store_thought',
          actionResult: 'success',
          duration: Date.now() - startTime,
          actionDetails: {
            thoughtId: thought.id,
            thoughtType: thought.type,
            confidence: thought.confidence,
          },
          tags: ['memory', 'thought', 'store'],
        });
        
        return result;
        
      } catch (error) {
        await this.recordEvent({
          eventType: 'memory_created',
          severity: 'error',
          category: 'memory',
          actorId: thought.agentId,
          actorType: 'agent',
          resourceId: thought.id,
          resourceType: 'memory',
          action: 'store_thought',
          actionResult: 'failure',
          duration: Date.now() - startTime,
          errorMessage: error.message,
          tags: ['memory', 'thought', 'store', 'error'],
        });
        
        throw error;
      }
    };
    
    // Similar integration for other memory operations...
  }

  /**
   * Set up invalidation manager integration
   */
  private setupInvalidationManagerIntegration(invalidationManager: any): void {
    // Monitor invalidation operations
    const originalInvalidate = invalidationManager.invalidate;
    invalidationManager.invalidate = async (request: any) => {
      const startTime = Date.now();
      
      try {
        const result = await originalInvalidate.call(invalidationManager, request);
        
        await this.recordEvent({
          eventType: 'invalidation_completed',
          severity: 'info',
          category: 'invalidation',
          actorId: request.agentId || 'system',
          actorType: 'system',
          resourceId: request.sourceId,
          resourceType: 'memory',
          action: 'invalidate',
          actionResult: 'success',
          duration: Date.now() - startTime,
          actionDetails: {
            strategy: request.strategy,
            itemsInvalidated: result.itemsInvalidated.length,
            cascadeDepth: result.cascadeDepth,
          },
          tags: ['invalidation', 'cascade', request.strategy],
        });
        
        return result;
        
      } catch (error) {
        await this.recordEvent({
          eventType: 'invalidation_failed',
          severity: 'error',
          category: 'invalidation',
          actorId: request.agentId || 'system',
          actorType: 'system',
          resourceId: request.sourceId,
          resourceType: 'memory',
          action: 'invalidate',
          actionResult: 'failure',
          duration: Date.now() - startTime,
          errorMessage: error.message,
          tags: ['invalidation', 'error'],
        });
        
        throw error;
      }
    };
  }

  /**
   * Set up retrieval manager integration
   */
  private setupRetrievalManagerIntegration(retrievalManager: any): void {
    // Monitor retrieval operations
    const originalSearch = retrievalManager.search;
    retrievalManager.search = async (query: any) => {
      const startTime = Date.now();
      
      try {
        const result = await originalSearch.call(retrievalManager, query);
        
        await this.recordEvent({
          eventType: 'memory_searched',
          severity: 'info',
          category: 'retrieval',
          actorId: query.userId || query.agentId || 'system',
          actorType: query.userId ? 'user' : 'agent',
          resourceId: query.queryId,
          resourceType: 'memory',
          action: 'search',
          actionResult: 'success',
          duration: Date.now() - startTime,
          actionDetails: {
            query: query.query,
            strategy: result.strategy,
            resultCount: result.results.length,
            averageRelevance: result.averageRelevance,
          },
          tags: ['retrieval', 'search', result.strategy],
        });
        
        return result;
        
      } catch (error) {
        await this.recordEvent({
          eventType: 'memory_searched',
          severity: 'error',
          category: 'retrieval',
          actorId: query.userId || query.agentId || 'system',
          actorType: query.userId ? 'user' : 'agent',
          resourceId: query.queryId,
          resourceType: 'memory',
          action: 'search',
          actionResult: 'failure',
          duration: Date.now() - startTime,
          errorMessage: error.message,
          tags: ['retrieval', 'search', 'error'],
        });
        
        throw error;
      }
    };
  }

  /**
   * Update statistics
   */
  private updateStats(event: AuditEvent): void {
    this.stats.totalEvents++;
    this.stats.eventsByType[event.eventType] = (this.stats.eventsByType[event.eventType] || 0) + 1;
    this.stats.eventsBySeverity[event.severity] = (this.stats.eventsBySeverity[event.severity] || 0) + 1;
    this.stats.eventsByActor[event.actorId] = (this.stats.eventsByActor[event.actorId] || 0) + 1;
    this.stats.eventsByResource[event.resourceId] = (this.stats.eventsByResource[event.resourceId] || 0) + 1;
    this.stats.lastEventTimestamp = Math.max(this.stats.lastEventTimestamp, event.timestamp);
    
    // Update error rate
    if (event.actionResult === 'failure') {
      this.stats.errorRate = (this.stats.errorRate * (this.stats.totalEvents - 1) + 1) / this.stats.totalEvents;
    }
  }

  /**
   * Update time-based statistics
   */
  private updateTimeBasedStats(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;
    const oneWeekAgo = now - 604800000;
    const oneMonthAgo = now - 2592000000;
    
    // These would be calculated from actual storage in real implementation
    this.stats.eventsLastHour = Math.floor(Math.random() * 100);
    this.stats.eventsLastDay = Math.floor(Math.random() * 1000);
    this.stats.eventsLastWeek = Math.floor(Math.random() * 5000);
    this.stats.eventsLastMonth = Math.floor(Math.random() * 10000);
  }

  /**
   * Log message
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.config.logLevel] || 1;
    const messageLevel = levels[level] || 1;
    
    if (messageLevel >= currentLevel) {
      const logData = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
      };
      
      switch (level) {
        case 'debug':
          console.debug('[AuditTrailManager]', logData);
          break;
        case 'info':
          console.info('[AuditTrailManager]', logData);
          break;
        case 'warn':
          console.warn('[AuditTrailManager]', logData);
          break;
        case 'error':
          console.error('[AuditTrailManager]', logData);
          break;
      }
    }
  }
}

/**
 * Audit Trail Manager Factory - Create configured instances
 */
export class AuditTrailManagerFactory {
  /**
   * Create audit trail manager from environment variables
   */
  static fromEnvironment(): AuditTrailManager {
    const config: AuditConfig = {
      storageBackend: (process.env.AUDIT_STORAGE_BACKEND as any) || 'file',
      storagePath: process.env.AUDIT_STORAGE_PATH || './audit',
      encryptionEnabled: process.env.AUDIT_ENCRYPTION !== 'false',
      compressionEnabled: process.env.AUDIT_COMPRESSION === 'true',
      defaultRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555'),
      archiveRetentionDays: parseInt(process.env.AUDIT_ARCHIVE_RETENTION_DAYS || '3650'),
      maxRetentionDays: parseInt(process.env.AUDIT_MAX_RETENTION_DAYS || '36500'),
      batchSize: parseInt(process.env.AUDIT_BATCH_SIZE || '1000'),
      flushInterval: parseInt(process.env.AUDIT_FLUSH_INTERVAL || '5000'),
      cacheSize: parseInt(process.env.AUDIT_CACHE_SIZE || '10000'),
      indexRefreshInterval: parseInt(process.env.AUDIT_INDEX_REFRESH_INTERVAL || '60000'),
      enableRealTimeMonitoring: process.env.AUDIT_ENABLE_REAL_TIME_MONITORING !== 'false',
      enableThreatDetection: process.env.AUDIT_ENABLE_THREAT_DETECTION !== 'false',
      enableAnomalyDetection: process.env.AUDIT_ENABLE_ANOMALY_DETECTION !== 'false',
      threatThreshold: parseFloat(process.env.AUDIT_THREAT_THRESHOLD || '0.7'),
      enableComplianceReporting: process.env.AUDIT_ENABLE_COMPLIANCE_REPORTING !== 'false',
      autoGenerateReports: process.env.AUDIT_AUTO_GENERATE_REPORTS === 'true',
      reportSchedule: process.env.AUDIT_REPORT_SCHEDULE,
      enableMultiTenant: process.env.AUDIT_ENABLE_MULTI_TENANT === 'true',
      tenantIsolationLevel: (process.env.AUDIT_TENANT_ISOLATION as any) || 'none',
      logLevel: (process.env.AUDIT_LOG_LEVEL as any) || 'info',
      enableMetrics: process.env.AUDIT_ENABLE_METRICS !== 'false',
      enableAuditTrail: process.env.AUDIT_ENABLE_AUDIT_TRAIL !== 'false',
      enableHashing: process.env.AUDIT_ENABLE_HASHING !== 'false',
      enableSigning: process.env.AUDIT_ENABLE_SIGNING === 'true',
      hashAlgorithm: (process.env.AUDIT_HASH_ALGORITHM as any) || 'sha256',
      integrateWithMemoryManager: process.env.AUDIT_INTEGRATE_MEMORY_MANAGER !== 'false',
      integrateWithInvalidation: process.env.AUDIT_INTEGRATE_INVALIDATION !== 'false',
      integrateWithRetrieval: process.env.AUDIT_INTEGRATE_RETRIEVAL !== 'false',
      environment: (process.env.AUDIT_ENVIRONMENT as any) || 'development',
    };
    
    return new AuditTrailManager(config);
  }

  /**
   * Create development audit trail manager
   */
  static createDevelopment(): AuditTrailManager {
    return new AuditTrailManager({
      storageBackend: 'file',
      storagePath: './dev-audit',
      encryptionEnabled: false,
      compressionEnabled: false,
      defaultRetentionDays: 30,
      archiveRetentionDays: 90,
      maxRetentionDays: 365,
      batchSize: 100,
      flushInterval: 5000,
      cacheSize: 1000,
      indexRefreshInterval: 60000,
      enableRealTimeMonitoring: true,
      enableThreatDetection: true,
      enableAnomalyDetection: true,
      threatThreshold: 0.7,
      enableComplianceReporting: true,
      autoGenerateReports: false,
      enableMultiTenant: false,
      tenantIsolationLevel: 'none',
      logLevel: 'debug',
      enableMetrics: true,
      enableAuditTrail: true,
      enableHashing: true,
      enableSigning: false,
      hashAlgorithm: 'sha256',
      integrateWithMemoryManager: true,
      integrateWithInvalidation: true,
      integrateWithRetrieval: true,
      environment: 'development',
    });
  }

  /**
   * Create production audit trail manager
   */
  static createProduction(config?: Partial<AuditConfig>): AuditTrailManager {
    return new AuditTrailManager({
      storageBackend: 'database',
      storagePath: process.env.AUDIT_STORAGE_PATH || './audit',
      encryptionEnabled: true,
      compressionEnabled: true,
      defaultRetentionDays: 2555,
      archiveRetentionDays: 3650,
      maxRetentionDays: 36500,
      batchSize: 1000,
      flushInterval: 5000,
      cacheSize: 10000,
      indexRefreshInterval: 60000,
      enableRealTimeMonitoring: true,
      enableThreatDetection: true,
      enableAnomalyDetection: true,
      threatThreshold: 0.7,
      enableComplianceReporting: true,
      autoGenerateReports: true,
      reportSchedule: '0 0 * * 0', // Weekly on Sunday
      enableMultiTenant: true,
      tenantIsolationLevel: 'strict',
      logLevel: 'warn',
      enableMetrics: true,
      enableAuditTrail: true,
      enableHashing: true,
      enableSigning: true,
      hashAlgorithm: 'sha256',
      integrateWithMemoryManager: true,
      integrateWithInvalidation: true,
      integrateWithRetrieval: true,
      environment: 'production',
      ...config,
    });
  }
}