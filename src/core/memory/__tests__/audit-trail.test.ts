/**
 * Memory Audit Trail System - Comprehensive Test Suite
 * 
 * This test suite provides comprehensive coverage for the audit trail system,
 * including immutable storage, cryptographic verification, compliance reporting,
 * security monitoring, forensic analysis, performance monitoring,
 * and multi-tenant isolation.
 */

import { AuditTrailManager, AuditTrailManagerFactory } from '../audit-trail';
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
  AuditEventType,
  AuditSeverity,
  ComplianceStandard,
} from '../audit-types';
import { QdrantVectorStore, VectorStoreFactory } from '../vector-store';
import { SovereignMemoryManager, MemoryManagerFactory } from '../memory-manager';
import { InvalidationManager, InvalidationManagerFactory } from '../invalidation';
import { MemoryRetrievalManager, MemoryRetrievalManagerFactory } from '../retrieval';
import { DataLineageManager } from '../../aix/data-lineage';

describe('AuditTrailManager', () => {
  let auditManager: AuditTrailManager;
  let vectorStore: QdrantVectorStore;
  let memoryManager: SovereignMemoryManager;
  let invalidationManager: InvalidationManager;
  let retrievalManager: MemoryRetrievalManager;
  let lineageManager: DataLineageManager;

  beforeEach(async () => {
    // Setup test dependencies
    vectorStore = VectorStoreFactory.createLocal();
    await vectorStore.initialize();

    memoryManager = MemoryManagerFactory.createDevelopment(
      vectorStore,
      new DataLineageManager()
    );

    invalidationManager = InvalidationManagerFactory.createDevelopment();
    retrievalManager = MemoryRetrievalManagerFactory.createDevelopment(
      vectorStore,
      memoryManager,
      new DataLineageManager()
    );

    // Create audit manager with test configuration
    const config: AuditConfig = {
      storageBackend: 'file',
      storagePath: './test-audit',
      encryptionEnabled: false,
      compressionEnabled: false,
      defaultRetentionDays: 30,
      archiveRetentionDays: 90,
      maxRetentionDays: 365,
      batchSize: 10,
      flushInterval: 1000,
      cacheSize: 100,
      indexRefreshInterval: 5000,
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
    };

    auditManager = new AuditTrailManager(config);
    
    // Set up integrations
    auditManager.setIntegrations({
      vectorStore,
      memoryManager,
      invalidationManager,
      retrievalManager,
      lineageManager,
    });
  });

  afterEach(async () => {
    await auditManager.close();
    await vectorStore.close();
  });

  describe('Basic Event Recording', () => {
    it('should record a basic audit event', async () => {
      const event: Partial<AuditEvent> = {
        eventType: 'memory_created',
        severity: 'info',
        category: 'memory',
        actorId: 'test-agent',
        actorType: 'agent',
        resourceId: 'test-memory-1',
        resourceType: 'memory',
        action: 'store_thought',
        actionResult: 'success',
        tags: ['test', 'memory'],
      };

      await expect(auditManager.recordEvent(event)).resolves.not.toThrow();

      // Verify event was recorded
      const query: AuditQuery = {
        eventTypes: ['memory_created'],
        limit: 10,
      };

      const result = await auditManager.queryEvents(query);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].eventType).toBe('memory_created');
      expect(result.events[0].actorId).toBe('test-agent');
      expect(result.events[0].resourceId).toBe('test-memory-1');
      expect(result.events[0].eventHash).toBeDefined();
    });

    it('should record events with cryptographic verification', async () => {
      const event: Partial<AuditEvent> = {
        eventType: 'memory_updated',
        severity: 'medium',
        category: 'memory',
        actorId: 'test-agent',
        actorType: 'agent',
        resourceId: 'test-memory-2',
        resourceType: 'memory',
        action: 'update_memory',
        actionResult: 'success',
        duration: 150,
      };

      await auditManager.recordEvent(event);

      // Query the event
      const query: AuditQuery = {
        eventTypes: ['memory_updated'],
        limit: 1,
      };

      const result = await auditManager.queryEvents(query);
      expect(result.events).toHaveLength(1);
      
      const recordedEvent = result.events[0];
      
      // Verify cryptographic hash was generated
      expect(recordedEvent.eventHash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hash
      
      // Verify sequence number was assigned
      expect(recordedEvent.sequenceNumber).toBeGreaterThan(0);
      
      // Verify previous event hash linkage
      if (recordedEvent.sequenceNumber > 1) {
        expect(recordedEvent.previousEventHash).toBeDefined();
      }
    });

    it('should handle error events properly', async () => {
      const event: Partial<AuditEvent> = {
        eventType: 'memory_created',
        severity: 'error',
        category: 'memory',
        actorId: 'test-agent',
        actorType: 'agent',
        resourceId: 'test-memory-3',
        resourceType: 'memory',
        action: 'store_thought',
        actionResult: 'failure',
        errorMessage: 'Test error message',
        errorCode: 'TEST_ERROR',
        duration: 50,
      };

      await auditManager.recordEvent(event);

      const query: AuditQuery = {
        eventTypes: ['memory_created'],
        severity: ['error'],
        limit: 1,
      };

      const result = await auditManager.queryEvents(query);
      expect(result.events).toHaveLength(1);
      
      const errorEvent = result.events[0];
      expect(errorEvent.severity).toBe('error');
      expect(errorEvent.actionResult).toBe('failure');
      expect(errorEvent.errorMessage).toBe('Test error message');
      expect(errorEvent.errorCode).toBe('TEST_ERROR');
    });
  });

  describe('Event Querying', () => {
    beforeEach(async () => {
      // Seed some test events
      const events: Partial<AuditEvent>[] = [
        {
          eventType: 'memory_created',
          severity: 'info',
          category: 'memory',
          actorId: 'agent-1',
          actorType: 'agent',
          resourceId: 'memory-1',
          resourceType: 'memory',
          action: 'store_thought',
          actionResult: 'success',
          timestamp: Date.now() - 10000,
        },
        {
          eventType: 'memory_accessed',
          severity: 'low',
          category: 'memory',
          actorId: 'agent-2',
          actorType: 'agent',
          resourceId: 'memory-2',
          resourceType: 'memory',
          action: 'retrieve_memory',
          actionResult: 'success',
          timestamp: Date.now() - 5000,
        },
        {
          eventType: 'security_alert',
          severity: 'high',
          category: 'security',
          actorId: 'system',
          actorType: 'system',
          resourceId: 'system',
          resourceType: 'system',
          action: 'threat_detected',
          actionResult: 'success',
          timestamp: Date.now() - 1000,
        },
      ];

      for (const event of events) {
        await auditManager.recordEvent(event);
      }

      // Wait for events to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should query events by type', async () => {
      const query: AuditQuery = {
        eventTypes: ['memory_created'],
        limit: 10,
      };

      const result = await auditManager.queryEvents(query);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].eventType).toBe('memory_created');
      expect(result.totalCount).toBe(1);
    });

    it('should query events by severity', async () => {
      const query: AuditQuery = {
        severity: ['high'],
        limit: 10,
      };

      const result = await auditManager.queryEvents(query);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].severity).toBe('high');
      expect(result.events[0].eventType).toBe('security_alert');
    });

    it('should query events by time range', async () => {
      const now = Date.now();
      const query: AuditQuery = {
        timeRange: {
          start: now - 6000, // Last 6 seconds
          end: now,
        },
        limit: 10,
      };

      const result = await auditManager.queryEvents(query);
      expect(result.events.length).toBeGreaterThan(0);
      
      // All events should be within time range
      for (const event of result.events) {
        expect(event.timestamp).toBeGreaterThanOrEqual(query.timeRange!.start);
        expect(event.timestamp).toBeLessThanOrEqual(query.timeRange!.end);
      }
    });

    it('should query events with text search', async () => {
      const query: AuditQuery = {
        searchText: 'store_thought',
        searchFields: ['action'],
        limit: 10,
      };

      const result = await auditManager.queryEvents(query);
      expect(result.events.length).toBeGreaterThan(0);
      
      // All events should contain the search text in action field
      for (const event of result.events) {
        expect(event.action).toContain('store_thought');
      }
    });

    it('should query events with pagination', async () => {
      const query: AuditQuery = {
        limit: 2,
        offset: 0,
      };

      const firstPage = await auditManager.queryEvents(query);
      expect(firstPage.events).toHaveLength(2);
      expect(firstPage.hasMore).toBe(true);

      const secondQuery: AuditQuery = {
        limit: 2,
        offset: 2,
      };

      const secondPage = await auditManager.queryEvents(secondQuery);
      expect(secondPage.events).toHaveLength(1);
      expect(secondPage.hasMore).toBe(false);
    });

    it('should include aggregations when requested', async () => {
      const query: AuditQuery = {
        includeAggregations: true,
        aggregateBy: 'eventType',
        limit: 10,
      };

      const result = await auditManager.queryEvents(query);
      expect(result.aggregations).toBeDefined();
      expect(result.aggregations.byEventType).toBeDefined();
      
      const aggregations = result.aggregations.byEventType;
      expect(aggregations.memory_created).toBe(1);
      expect(aggregations.memory_accessed).toBe(1);
      expect(aggregations.security_alert).toBe(1);
    });
  });

  describe('Security Monitoring', () => {
    it('should detect brute force attacks', async () => {
      // Simulate multiple failed access attempts
      const failedEvents: Partial<AuditEvent>[] = [];
      for (let i = 0; i < 6; i++) {
        failedEvents.push({
          eventType: 'access_denied',
          severity: 'medium',
          category: 'security',
          actorId: 'attacker',
          actorType: 'user',
          resourceId: 'secure-resource',
          resourceType: 'memory',
          action: 'access_memory',
          actionResult: 'failure',
          ipAddress: '192.168.1.100',
          timestamp: Date.now() - (5 - i) * 1000,
        });
      }

      for (const event of failedEvents) {
        await auditManager.recordEvent(event);
      }

      // Wait for threat detection
      await new Promise(resolve => setTimeout(resolve, 200));

      const alerts = auditManager.getSecurityAlerts();
      const bruteForceAlerts = alerts.filter(alert => 
        alert.alertType === 'brute_force' || 
        alert.description.includes('Brute Force')
      );

      expect(bruteForceAlerts.length).toBeGreaterThan(0);
    });

    it('should detect privilege escalation attempts', async () => {
      const privilegeEvent: Partial<AuditEvent> = {
        eventType: 'unauthorized_access',
        severity: 'critical',
        category: 'security',
        actorId: 'malicious-user',
        actorType: 'user',
        resourceId: 'admin-system',
        resourceType: 'system',
        action: 'privilege_escalation',
        actionResult: 'failure',
        timestamp: Date.now(),
      };

      await auditManager.recordEvent(privilegeEvent);

      // Wait for threat detection
      await new Promise(resolve => setTimeout(resolve, 200));

      const alerts = auditManager.getSecurityAlerts();
      const privilegeAlerts = alerts.filter(alert => 
        alert.alertType === 'privilege_escalation' ||
        alert.description.includes('Privilege Escalation')
      );

      expect(privilegeAlerts.length).toBeGreaterThan(0);
    });

    it('should resolve security alerts', async () => {
      // First, create a security alert
      const threatEvent: Partial<AuditEvent> = {
        eventType: 'suspicious_activity',
        severity: 'high',
        category: 'security',
        actorId: 'suspicious-actor',
        actorType: 'user',
        resourceId: 'sensitive-data',
        resourceType: 'memory',
        action: 'unusual_access_pattern',
        actionResult: 'success',
        timestamp: Date.now(),
      };

      await auditManager.recordEvent(threatEvent);

      // Wait for alert creation
      await new Promise(resolve => setTimeout(resolve, 200));

      const alerts = auditManager.getSecurityAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      const alertId = alerts[0].alertId;
      
      // Resolve the alert
      await auditManager.resolveSecurityAlert(alertId, 'False positive - legitimate user activity');

      // Verify alert resolution
      const resolvedAlerts = auditManager.getSecurityAlerts();
      const resolvedAlert = resolvedAlerts.find(a => a.alertId === alertId);
      
      expect(resolvedAlert).toBeDefined();
      expect(resolvedAlert!.status).toBe('resolved');
      expect(resolvedAlert!.resolution).toBe('False positive - legitimate user activity');
      expect(resolvedAlert!.resolutionTime).toBeGreaterThan(0);
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate GDPR compliance report', async () => {
      const now = Date.now();
      const period = {
        start: now - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: now,
      };

      const report = await auditManager.generateComplianceReport('GDPR', period);

      expect(report).toBeDefined();
      expect(report.reportType).toBe('GDPR');
      expect(report.reportPeriod).toEqual(period);
      expect(report.overallStatus).toMatch(/^(compliant|non_compliant|partial_compliant)$/);
      expect(report.complianceScore).toBeGreaterThanOrEqual(0);
      expect(report.complianceScore).toBeLessThanOrEqual(100);
      expect(report.findings).toBeInstanceOf(Array);
      expect(report.generatedAt).toBeDefined();
      expect(report.reportHash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hash
    });

    it('should generate SOC2 compliance report', async () => {
      const now = Date.now();
      const period = {
        start: now - (90 * 24 * 60 * 60 * 1000), // 90 days ago
        end: now,
      };

      const report = await auditManager.generateComplianceReport('SOC2', period);

      expect(report).toBeDefined();
      expect(report.reportType).toBe('SOC2');
      expect(report.reportPeriod).toEqual(period);
      expect(report.findings).toBeInstanceOf(Array);
      
      // SOC2 specific checks
      const controlCategories = report.findings.map(f => f.category);
      expect(controlCategories.some(cat => 
        ['security', 'availability', 'processing_integrity', 'confidentiality', 'privacy'].includes(cat)
      )).toBe(true);
    });

    it('should apply retention policies', async () => {
      // Add a custom retention policy
      const customPolicy: RetentionPolicy = {
        policyId: 'test-policy',
        name: 'Test Retention Policy',
        description: 'Policy for testing retention functionality',
        standardRetention: 7, // 7 days
        extendedRetention: 30, // 30 days
        maximumRetention: 365, // 1 year
        archiveAfter: 1, // Archive after 1 day
        deleteAfter: 7, // Delete after 7 days
        complianceStandards: ['GDPR', 'SOC2'],
        legalHold: false,
        dataClassifications: ['test-data'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        enabled: true,
      };

      auditManager.addRetentionPolicy(customPolicy);

      // Apply retention policies
      await auditManager.applyRetentionPolicies();

      // Verify policy was added
      const policies = auditManager.getRetentionPolicies();
      const addedPolicy = policies.find(p => p.policyId === 'test-policy');
      
      expect(addedPolicy).toBeDefined();
      expect(addedPolicy!.name).toBe('Test Retention Policy');
    });
  });

  describe('Performance Monitoring', () => {
    it('should collect performance metrics', async () => {
      // Generate some activity to create metrics
      const events: Partial<AuditEvent>[] = [];
      for (let i = 0; i < 20; i++) {
        events.push({
          eventType: 'memory_created',
          severity: 'info',
          category: 'memory',
          actorId: `agent-${i}`,
          actorType: 'agent',
          resourceId: `memory-${i}`,
          resourceType: 'memory',
          action: 'store_thought',
          actionResult: 'success',
          duration: Math.floor(Math.random() * 1000) + 100,
          timestamp: Date.now() - (20 - i) * 1000,
        });
      }

      for (const event of events) {
        await auditManager.recordEvent(event);
      }

      // Wait for metrics collection
      await new Promise(resolve => setTimeout(resolve, 500));

      const metrics = auditManager.getPerformanceMetrics(1); // Last hour

      expect(metrics).toBeDefined();
      expect(metrics.length).toBeGreaterThan(0);
      
      const latestMetric = metrics[metrics.length - 1];
      expect(latestMetric.totalOperations).toBeGreaterThan(0);
      expect(latestMetric.averageOperationTime).toBeGreaterThan(0);
      expect(latestMetric.period).toBe('minute');
    });

    it('should detect performance bottlenecks', async () => {
      // Simulate high resource usage
      const slowEvents: Partial<AuditEvent>[] = [];
      for (let i = 0; i < 10; i++) {
        slowEvents.push({
          eventType: 'memory_searched',
          severity: 'warning',
          category: 'performance',
          actorId: 'system',
          actorType: 'system',
          resourceId: 'system',
          resourceType: 'system',
          action: 'slow_query',
          actionResult: 'success',
          duration: 5000 + (i * 500), // Increasingly slow operations
          timestamp: Date.now() - (10 - i) * 1000,
        });
      }

      for (const event of slowEvents) {
        await auditManager.recordEvent(event);
      }

      // Wait for bottleneck detection
      await new Promise(resolve => setTimeout(resolve, 1000));

      const metrics = auditManager.getPerformanceMetrics(1);
      const latestMetric = metrics[metrics.length - 1];

      expect(latestMetric.bottlenecks).toBeDefined();
      expect(latestMetric.bottlenecks.length).toBeGreaterThan(0);
      
      const bottlenecks = latestMetric.bottlenecks;
      const databaseBottlenecks = bottlenecks.filter(b => b.type === 'database');
      expect(databaseBottlenecks.length).toBeGreaterThan(0);
    });
  });

  describe('Forensic Analysis', () => {
    it('should create forensic analysis for incident', async () => {
      // Create some incident events
      const incidentEvents: Partial<AuditEvent>[] = [
        {
          eventType: 'data_breach_attempt',
          severity: 'critical',
          category: 'security',
          actorId: 'attacker',
          actorType: 'user',
          resourceId: 'sensitive-data',
          resourceType: 'memory',
          action: 'unauthorized_access',
          actionResult: 'failure',
          errorMessage: 'Access denied',
          timestamp: Date.now() - 5000,
        },
        {
          eventType: 'suspicious_activity',
          severity: 'high',
          category: 'security',
          actorId: 'attacker',
          actorType: 'user',
          resourceId: 'system',
          resourceType: 'system',
          action: 'privilege_escalation',
          actionResult: 'failure',
          timestamp: Date.now() - 3000,
        },
      ];

      for (const event of incidentEvents) {
        await auditManager.recordEvent(event);
      }

      const timeRange = {
        start: Date.now() - 10000, // 10 seconds ago
        end: Date.now(),
      };

      const analysis = await auditManager.createForensicAnalysis(
        'incident-001',
        'analyst-001',
        timeRange,
        ['sensitive-data', 'system'],
        ['attacker']
      );

      expect(analysis).toBeDefined();
      expect(analysis.incidentId).toBe('incident-001');
      expect(analysis.analystId).toBe('analyst-001');
      expect(analysis.timeRange).toEqual(timeRange);
      expect(analysis.resourceScope).toEqual(['sensitive-data', 'system']);
      expect(analysis.actorScope).toEqual(['attacker']);
      expect(analysis.timeline).toBeInstanceOf(Array);
      expect(analysis.patterns).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
      expect(analysis.analysisHash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hash
    });

    it('should analyze patterns in forensic analysis', async () => {
      // Create events with clear patterns
      const patternEvents: Partial<AuditEvent>[] = [];
      
      // Repeated access attempts
      for (let i = 0; i < 10; i++) {
        patternEvents.push({
          eventType: 'access_denied',
          severity: 'medium',
          category: 'security',
          actorId: 'attacker',
          actorType: 'user',
          resourceId: 'protected-resource',
          resourceType: 'memory',
          action: 'unauthorized_access',
          actionResult: 'failure',
          timestamp: Date.now() - (10 - i) * 1000,
        });
      }

      for (const event of patternEvents) {
        await auditManager.recordEvent(event);
      }

      const timeRange = {
        start: Date.now() - 15000,
        end: Date.now(),
      };

      const analysis = await auditManager.createForensicAnalysis(
        'incident-002',
        'analyst-002',
        timeRange,
        ['protected-resource']
      );

      expect(analysis.patterns).toBeInstanceOf(Array);
      
      const accessPatterns = analysis.patterns.filter(p => p.patternType === 'access_anomaly');
      expect(accessPatterns.length).toBeGreaterThan(0);
      
      const failurePatterns = analysis.patterns.filter(p => p.patternType === 'failure_pattern');
      expect(failurePatterns.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-tenant Isolation', () => {
    beforeEach(async () => {
      // Create audit manager with multi-tenant enabled
      const multiTenantConfig: AuditConfig = {
        storageBackend: 'file',
        storagePath: './test-audit-multi-tenant',
        encryptionEnabled: false,
        compressionEnabled: false,
        defaultRetentionDays: 30,
        archiveRetentionDays: 90,
        maxRetentionDays: 365,
        batchSize: 10,
        flushInterval: 1000,
        cacheSize: 100,
        indexRefreshInterval: 5000,
        enableRealTimeMonitoring: true,
        enableThreatDetection: true,
        enableAnomalyDetection: true,
        threatThreshold: 0.7,
        enableComplianceReporting: true,
        autoGenerateReports: false,
        enableMultiTenant: true,
        tenantIsolationLevel: 'strict',
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
      };

      auditManager = new AuditTrailManager(multiTenantConfig);
      
      auditManager.setIntegrations({
        vectorStore,
        memoryManager,
        invalidationManager,
        retrievalManager,
        lineageManager,
      });
    });

    it('should isolate events by tenant', async () => {
      const tenant1Event: Partial<AuditEvent> = {
        eventType: 'memory_created',
        severity: 'info',
        category: 'memory',
        actorId: 'tenant1-user',
        actorType: 'user',
        resourceId: 'tenant1-memory',
        resourceType: 'memory',
        action: 'store_thought',
        actionResult: 'success',
        tenantId: 'tenant1',
      };

      const tenant2Event: Partial<AuditEvent> = {
        eventType: 'memory_created',
        severity: 'info',
        category: 'memory',
        actorId: 'tenant2-user',
        actorType: 'user',
        resourceId: 'tenant2-memory',
        resourceType: 'memory',
        action: 'store_thought',
        actionResult: 'success',
        tenantId: 'tenant2',
      };

      await auditManager.recordEvent(tenant1Event);
      await auditManager.recordEvent(tenant2Event);

      // Query as tenant1 - should only see tenant1 events
      const tenant1Query: AuditQuery = {
        tenantId: 'tenant1',
        limit: 10,
      };

      const tenant1Result = await auditManager.queryEvents(tenant1Query);
      expect(tenant1Result.events).toHaveLength(1);
      expect(tenant1Result.events[0].tenantId).toBe('tenant1');
      expect(tenant1Result.events[0].actorId).toBe('tenant1-user');

      // Query as tenant2 - should only see tenant2 events
      const tenant2Query: AuditQuery = {
        tenantId: 'tenant2',
        limit: 10,
      };

      const tenant2Result = await auditManager.queryEvents(tenant2Query);
      expect(tenant2Result.events).toHaveLength(1);
      expect(tenant2Result.events[0].tenantId).toBe('tenant2');
      expect(tenant2Result.events[0].actorId).toBe('tenant2-user');
    });

    it('should handle cross-tenant queries with admin access', async () => {
      const tenant1Event: Partial<AuditEvent> = {
        eventType: 'memory_created',
        severity: 'info',
        category: 'memory',
        actorId: 'tenant1-user',
        actorType: 'user',
        resourceId: 'tenant1-memory',
        resourceType: 'memory',
        action: 'store_thought',
        actionResult: 'success',
        tenantId: 'tenant1',
      };

      const tenant2Event: Partial<AuditEvent> = {
        eventType: 'memory_created',
        severity: 'info',
        category: 'memory',
        actorId: 'tenant2-user',
        actorType: 'user',
        resourceId: 'tenant2-memory',
        resourceType: 'memory',
        action: 'store_thought',
        actionResult: 'success',
        tenantId: 'tenant2',
      };

      await auditManager.recordEvent(tenant1Event);
      await auditManager.recordEvent(tenant2Event);

      // Query with includeAllTenants - should see all events
      const adminQuery: AuditQuery = {
        includeAllTenants: true,
        limit: 10,
      };

      const adminResult = await auditManager.queryEvents(adminQuery);
      expect(adminResult.events).toHaveLength(2);
      
      const tenantIds = adminResult.events.map(e => e.tenantId);
      expect(tenantIds).toContain('tenant1');
      expect(tenantIds).toContain('tenant2');
    });
  });

  describe('Integration with Memory Components', () => {
    it('should automatically audit memory manager operations', async () => {
      // This test verifies that when we use the memory manager,
      // audit events are automatically recorded
      
      const thought = {
        id: 'test-thought-1',
        timestamp: Date.now(),
        agentId: 'test-agent',
        content: 'Test thought content',
        type: 'observation' as const,
        confidence: 0.8,
        confidenceLevel: 'high' as const,
        sessionId: 'test-session',
        tags: ['test'],
        hash: 'test-hash',
      };

      // Use memory manager to store thought
      const result = await memoryManager.storeThought(thought);

      expect(result).toBeDefined();

      // Verify audit event was recorded
      const query: AuditQuery = {
        eventTypes: ['memory_created'],
        limit: 10,
      };

      const auditResult = await auditManager.queryEvents(query);
      expect(auditResult.events.length).toBeGreaterThan(0);
      
      const memoryEvents = auditResult.events.filter(e => 
        e.resourceType === 'memory' && e.resourceId === result
      );
      expect(memoryEvents.length).toBeGreaterThan(0);
    });

    it('should automatically audit invalidation operations', async () => {
      // This test verifies that when we use the invalidation manager,
      // audit events are automatically recorded
      
      const invalidationRequest = {
        requestId: 'test-invalidation-1',
        sourceId: 'test-memory-1',
        sourceType: 'memory',
        trigger: 'manual',
        strategy: 'immediate',
        agentId: 'test-agent',
        reason: 'Test invalidation',
      };

      // Use invalidation manager to invalidate
      const result = await invalidationManager.invalidate(invalidationRequest);

      expect(result).toBeDefined();

      // Verify audit event was recorded
      const query: AuditQuery = {
        eventTypes: ['invalidation_completed'],
        limit: 10,
      };

      const auditResult = await auditManager.queryEvents(query);
      expect(auditResult.events.length).toBeGreaterThan(0);
      
      const invalidationEvents = auditResult.events.filter(e => 
        e.category === 'invalidation'
      );
      expect(invalidationEvents.length).toBeGreaterThan(0);
    });

    it('should automatically audit retrieval operations', async () => {
      // This test verifies that when we use the retrieval manager,
      // audit events are automatically recorded
      
      const retrievalQuery = {
        queryId: 'test-query-1',
        query: 'test search query',
        agentId: 'test-agent',
        limit: 10,
      };

      // Use retrieval manager to search
      const result = await retrievalManager.search(retrievalQuery);

      expect(result).toBeDefined();

      // Verify audit event was recorded
      const query: AuditQuery = {
        eventTypes: ['memory_searched'],
        limit: 10,
      };

      const auditResult = await auditManager.queryEvents(query);
      expect(auditResult.events.length).toBeGreaterThan(0);
      
      const retrievalEvents = auditResult.events.filter(e => 
        e.category === 'retrieval'
      );
      expect(retrievalEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide comprehensive statistics', async () => {
      // Generate various types of events
      const events: Partial<AuditEvent>[] = [
        {
          eventType: 'memory_created',
          severity: 'info',
          category: 'memory',
          actorId: 'agent-1',
          actorType: 'agent',
          resourceId: 'memory-1',
          resourceType: 'memory',
          action: 'store_thought',
          actionResult: 'success',
          duration: 100,
        },
        {
          eventType: 'memory_accessed',
          severity: 'low',
          category: 'memory',
          actorId: 'agent-2',
          actorType: 'agent',
          resourceId: 'memory-2',
          resourceType: 'memory',
          action: 'retrieve_memory',
          actionResult: 'success',
          duration: 50,
        },
        {
          eventType: 'security_alert',
          severity: 'high',
          category: 'security',
          actorId: 'system',
          actorType: 'system',
          resourceId: 'system',
          resourceType: 'system',
          action: 'threat_detected',
          actionResult: 'success',
        },
        {
          eventType: 'error_occurred',
          severity: 'error',
          category: 'system',
          actorId: 'system',
          actorType: 'system',
          resourceId: 'system',
          resourceType: 'system',
          action: 'system_error',
          actionResult: 'failure',
          errorMessage: 'Test system error',
        },
      ];

      for (const event of events) {
        await auditManager.recordEvent(event);
      }

      // Wait for events to be processed
      await new Promise(resolve => setTimeout(resolve, 200));

      const stats = auditManager.getStats();

      expect(stats.totalEvents).toBeGreaterThanOrEqual(5);
      expect(stats.eventsByType.memory_created).toBeGreaterThanOrEqual(1);
      expect(stats.eventsByType.memory_accessed).toBeGreaterThanOrEqual(1);
      expect(stats.eventsByType.security_alert).toBeGreaterThanOrEqual(1);
      expect(stats.eventsByType.error_occurred).toBeGreaterThanOrEqual(1);
      
      expect(stats.eventsBySeverity.info).toBeGreaterThanOrEqual(1);
      expect(stats.eventsBySeverity.low).toBeGreaterThanOrEqual(1);
      expect(stats.eventsBySeverity.high).toBeGreaterThanOrEqual(1);
      expect(stats.eventsBySeverity.error).toBeGreaterThanOrEqual(1);
      
      expect(stats.eventsByActor['agent-1']).toBeGreaterThanOrEqual(1);
      expect(stats.eventsByActor['agent-2']).toBeGreaterThanOrEqual(1);
      expect(stats.eventsByActor.system).toBeGreaterThanOrEqual(2);
      
      expect(stats.averageWriteTime).toBeGreaterThan(0);
      expect(stats.averageQueryTime).toBeGreaterThan(0);
      expect(stats.errorRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid audit events gracefully', async () => {
      const invalidEvent = {
        // Missing required fields
        eventType: 'invalid_type' as any,
        severity: 'invalid_severity' as any,
        category: 'invalid_category' as any,
      };

      await expect(auditManager.recordEvent(invalidEvent)).rejects.toThrow();
    });

    it('should handle invalid audit queries gracefully', async () => {
      const invalidQuery = {
        eventTypes: ['invalid_type' as any],
        severity: ['invalid_severity' as any],
        limit: -1, // Invalid limit
      };

      await expect(auditManager.queryEvents(invalidQuery)).rejects.toThrow();
    });

    it('should handle storage failures gracefully', async () => {
      // This would require mocking storage failures
      // For now, we'll test with invalid configuration
      const invalidConfig: AuditConfig = {
        storageBackend: 'invalid_backend' as any,
        storagePath: './test-audit',
        encryptionEnabled: false,
        compressionEnabled: false,
        defaultRetentionDays: 30,
        archiveRetentionDays: 90,
        maxRetentionDays: 365,
        batchSize: 10,
        flushInterval: 1000,
        cacheSize: 100,
        indexRefreshInterval: 5000,
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
      };

      expect(() => new AuditTrailManager(invalidConfig)).toThrow();
    });
  });
});

describe('AuditTrailManagerFactory', () => {
  describe('Factory Methods', () => {
    it('should create development audit manager', () => {
      const auditManager = AuditTrailManagerFactory.createDevelopment();

      expect(auditManager).toBeDefined();
      expect(auditManager).toBeInstanceOf(AuditTrailManager);
    });

    it('should create production audit manager', () => {
      const customConfig: Partial<AuditConfig> = {
        batchSize: 500,
        enableEncryption: true,
      };

      const auditManager = AuditTrailManagerFactory.createProduction(customConfig);

      expect(auditManager).toBeDefined();
      expect(auditManager).toBeInstanceOf(AuditTrailManager);
    });

    it('should create audit manager from environment', () => {
      // Mock environment variables
      const originalEnv = process.env;
      
      process.env.AUDIT_STORAGE_BACKEND = 'file';
      process.env.AUDIT_STORAGE_PATH = './test-audit-env';
      process.env.AUDIT_ENABLE_REAL_TIME_MONITORING = 'true';
      process.env.AUDIT_ENABLE_THREAT_DETECTION = 'true';
      process.env.AUDIT_ENVIRONMENT = 'test';

      const auditManager = AuditTrailManagerFactory.fromEnvironment();

      expect(auditManager).toBeDefined();
      expect(auditManager).toBeInstanceOf(AuditTrailManager);

      // Restore original environment
      process.env = originalEnv;
    });
  });
});

describe('Audit Event Validation', () => {
  describe('Event Schema Validation', () => {
    it('should validate complete audit events', () => {
      const validEvent: AuditEvent = {
        eventId: '550e8400-e29b-41d4-a716-44665544000000',
        timestamp: Date.now(),
        sequenceNumber: 1,
        eventType: 'memory_created',
        severity: 'info',
        category: 'memory',
        actorId: 'test-agent',
        actorType: 'agent',
        resourceId: 'test-memory-1',
        resourceType: 'memory',
        action: 'store_thought',
        actionResult: 'success',
        eventHash: 'abc123',
        previousEventHash: null,
        tags: ['test'],
        environment: 'development',
      };

      // This should not throw if the event is valid
      expect(() => {
        // Import and use the schema validation
        const { AuditEventSchema } = require('../audit-types');
        AuditEventSchema.parse(validEvent);
      }).not.toThrow();
    });

    it('should reject invalid audit events', () => {
      const invalidEvent = {
        // Missing required fields
        eventId: 'invalid-uuid',
        timestamp: 'invalid-timestamp',
        eventType: 'invalid_type',
        severity: 'invalid_severity',
        // Invalid enum values
        actorType: 'invalid_actor_type' as any,
        resourceType: 'invalid_resource_type' as any,
        actionResult: 'invalid_result' as any,
      };

      expect(() => {
        const { AuditEventSchema } = require('../audit-types');
        AuditEventSchema.parse(invalidEvent);
      }).toThrow();
    });
  });

  describe('Query Schema Validation', () => {
    it('should validate complete audit queries', () => {
      const validQuery: AuditQuery = {
        eventTypes: ['memory_created', 'memory_accessed'],
        severity: ['info', 'low'],
        timeRange: {
          start: Date.now() - 86400000, // 1 day ago
          end: Date.now(),
        },
        searchText: 'test search',
        searchFields: ['action', 'resourceId'],
        limit: 10,
        offset: 0,
        sortBy: 'timestamp',
        sortOrder: 'desc',
        includeAggregations: true,
        aggregateBy: 'eventType',
      };

      expect(() => {
        const { AuditQuerySchema } = require('../audit-types');
        AuditQuerySchema.parse(validQuery);
      }).not.toThrow();
    });

    it('should reject invalid audit queries', () => {
      const invalidQuery = {
        eventTypes: ['invalid_type' as any],
        severity: ['invalid_severity' as any],
        limit: -1, // Invalid limit
        offset: -1, // Invalid offset
        sortBy: 'invalid_sort' as any,
        sortOrder: 'invalid_order' as any,
        includeAggregations: true,
        aggregateBy: 'invalid_aggregate' as any,
      };

      expect(() => {
        const { AuditQuerySchema } = require('../audit-types');
        AuditQuerySchema.parse(invalidQuery);
      }).toThrow();
    });
  });
});