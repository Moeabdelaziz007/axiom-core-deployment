/**
 * 🔧 WORKER SECURITY MANAGER
 * 
 * Comprehensive worker security implementation with:
 * - Sandboxing and isolation for research workers
 * - Resource usage monitoring and limits
 * - Secure inter-worker communication channels
 * - Worker authentication and authorization
 * - Malicious behavior detection in workers
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { ResearchWorker, ResearchTask } from './ResearchNafsWorkers';

// ============================================================================
// WORKER SECURITY TYPES
// ============================================================================

/**
 * Worker Security Configuration
 */
export interface WorkerSecurityConfig {
  sandboxing: boolean;
  resourceMonitoring: boolean;
  communicationEncryption: boolean;
  behaviorAnalysis: boolean;
  maxWorkers: number;
  resourceLimits: {
    maxCpu: number; // percentage
    maxMemory: number; // MB
    maxDisk: number; // MB
    maxNetwork: number; // MB/s
    maxExecutionTime: number; // seconds
  };
  isolationLevel: 'basic' | 'standard' | 'enhanced' | 'maximum';
}

/**
 * Worker Security Context
 */
export interface WorkerSecurityContext {
  workerId: string;
  userId?: string;
  sessionId?: string;
  operation: 'execute' | 'communicate' | 'terminate' | 'monitor';
  timestamp: Date;
  source: {
    ip?: string;
    userAgent?: string;
    location?: string;
  };
}

/**
 * Resource Usage Metrics
 */
export interface ResourceUsageMetrics {
  cpu: {
    current: number; // percentage
    average: number; // percentage
    peak: number; // percentage
  };
  memory: {
    current: number; // MB
    average: number; // MB
    peak: number; // MB
  };
  disk: {
    current: number; // MB
    average: number; // MB
    peak: number; // MB
  };
  network: {
    current: number; // MB/s
    average: number; // MB/s
    peak: number; // MB/s
  };
  executionTime: {
    current: number; // seconds
    average: number; // seconds
    peak: number; // seconds
  };
}

/**
 * Worker Security Result
 */
export interface WorkerSecurityResult {
  success: boolean;
  allowed: boolean;
  riskScore: number; // 0-100
  riskFactors: string[];
  blockedActions: string[];
  allowedActions: string[];
  modifiedActions: string[];
  loggedActions: string[];
  recommendations: string[];
  resourceLimits?: ResourceUsageMetrics;
  metadata: {
    processingTime: number; // milliseconds
    protocol: 'worker-security',
    version: '1.0.0',
    timestamp: Date;
  };
}

/**
 * Behavior Analysis Result
 */
export interface BehaviorAnalysisResult {
  anomalous: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  anomalies: BehaviorAnomaly[];
  confidence: number; // 0-100
  recommendations: string[];
  score: number; // 0-100
}

/**
 * Behavior Anomaly
 */
export interface BehaviorAnomaly {
  type: 'resource-abuse' | 'unusual-communication' | 'execution-anomaly' | 'memory-leak' | 'network-abuse' | 'privilege-escalation';
  description: string;
  severity: number; // 1-10
  confidence: number; // 0-100
  timestamp: Date;
  metrics?: Record<string, any>;
}

/**
 * Communication Security
 */
export interface CommunicationSecurity {
  encrypted: boolean;
  authenticated: boolean;
  integrity: boolean;
  timestamp: Date;
  channels: string[];
}

/**
 * Worker Isolation Policy
 */
export interface WorkerIsolationPolicy {
  workerId: string;
  isolationLevel: WorkerSecurityConfig['isolationLevel'];
  resourceLimits: WorkerSecurityConfig['resourceLimits'];
  networkIsolation: boolean;
  fileSystemIsolation: boolean;
  processIsolation: boolean;
  communicationIsolation: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// ============================================================================
// MAIN WORKER SECURITY MANAGER
// ============================================================================

/**
 * Worker Security Manager
 * 
 * Provides comprehensive security for research workers
 * Implements zero-trust principles with sandboxing and monitoring
 */
export class WorkerSecurityManager extends EventEmitter {
  private config: WorkerSecurityConfig;
  private workers: Map<string, ResearchWorker> = new Map();
  private resourceUsage: Map<string, ResourceUsageMetrics> = new Map();
  private behaviorProfiles: Map<string, any[]> = new Map();
  private isolationPolicies: Map<string, WorkerIsolationPolicy> = new Map();
  private communicationChannels: Map<string, CommunicationSecurity> = new Map();
  private auditLog: any[] = [];
  private threatPatterns: BehaviorAnomaly[] = [];

  constructor(config: WorkerSecurityConfig) {
    super();
    this.config = this.validateConfig(config);
    this.initializeThreatPatterns();
    this.setupPeriodicMonitoring();
  }

  /**
   * Validate and normalize configuration
   */
  private validateConfig(config: WorkerSecurityConfig): WorkerSecurityConfig {
    const defaultConfig: WorkerSecurityConfig = {
      sandboxing: true,
      resourceMonitoring: true,
      communicationEncryption: true,
      behaviorAnalysis: true,
      maxWorkers: 50,
      resourceLimits: {
        maxCpu: 80,
        maxMemory: 1024, // 1GB
        maxDisk: 5120, // 5GB
        maxNetwork: 100, // 100MB/s
        maxExecutionTime: 300 // 5 minutes
      },
      isolationLevel: 'enhanced'
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Initialize threat patterns
   */
  private initializeThreatPatterns(): void {
    console.log('🔧 Initializing worker security threat patterns...');

    this.threatPatterns = [
      {
        type: 'resource-abuse',
        description: 'Excessive resource consumption',
        severity: 7,
        confidence: 80
      },
      {
        type: 'unusual-communication',
        description: 'Communication with unauthorized endpoints',
        severity: 8,
        confidence: 85
      },
      {
        type: 'execution-anomaly',
        description: 'Unusual execution patterns or crashes',
        severity: 9,
        confidence: 90
      },
      {
        type: 'memory-leak',
        description: 'Memory usage growing abnormally',
        severity: 6,
        confidence: 75
      },
      {
        type: 'network-abuse',
        description: 'Suspicious network activity',
        severity: 8,
        confidence: 80
      },
      {
        type: 'privilege-escalation',
        description: 'Attempts to gain higher privileges',
        severity: 10,
        confidence: 95
      }
    ];

    console.log(`✅ Initialized ${this.threatPatterns.length} threat patterns`);
  }

  /**
   * Setup periodic monitoring
   */
  private setupPeriodicMonitoring(): void {
    // Monitor resource usage every 30 seconds
    setInterval(() => {
      this.monitorAllWorkers();
    }, 30000);

    // Analyze behavior patterns every 5 minutes
    setInterval(() => {
      this.analyzeWorkerBehavior();
    }, 300000);

    // Clean up old audit logs every hour
    setInterval(() => {
      this.cleanupAuditLogs();
    }, 3600000);
  }

  /**
   * Register worker for security monitoring
   */
  registerWorker(worker: ResearchWorker): void {
    console.log(`🔧 Registering worker for security monitoring: ${worker.id}`);

    this.workers.set(worker.id, worker);

    // Initialize resource monitoring
    this.resourceUsage.set(worker.id, {
      cpu: { current: 0, average: 0, peak: 0 },
      memory: { current: 0, average: 0, peak: 0 },
      disk: { current: 0, average: 0, peak: 0 },
      network: { current: 0, average: 0, peak: 0 },
      executionTime: { current: 0, average: 0, peak: 0 }
    });

    // Initialize behavior profile
    this.behaviorProfiles.set(worker.id, []);

    // Create isolation policy
    if (this.config.sandboxing) {
      this.createIsolationPolicy(worker);
    }

    // Initialize communication security
    this.communicationChannels.set(worker.id, {
      encrypted: this.config.communicationEncryption,
      authenticated: false,
      integrity: true,
      timestamp: new Date(),
      channels: []
    });

    this.emit('worker-registered', { workerId: worker.id, timestamp: new Date() });
  }

  /**
   * Validate worker operation
   */
  async validateOperation(
    operation: any,
    context: WorkerSecurityContext
  ): Promise<WorkerSecurityResult> {
    const startTime = Date.now();

    try {
      const result: WorkerSecurityResult = {
        success: true,
        allowed: true,
        riskScore: 0,
        riskFactors: [],
        blockedActions: [],
        allowedActions: ['worker-operation'],
        modifiedActions: [],
        loggedActions: ['operation-received'],
        recommendations: [],
        metadata: {
          processingTime: 0,
          protocol: 'worker-security',
          version: '1.0.0',
          timestamp: new Date()
        }
      };

      // 1. Worker authentication
      const authResult = this.validateWorkerAuthentication(context);
      this.mergeValidationResults(result, authResult);

      // 2. Resource usage validation
      if (this.config.resourceMonitoring) {
        const resourceResult = this.validateResourceUsage(context);
        this.mergeValidationResults(result, resourceResult);
      }

      // 3. Communication security
      if (this.config.communicationEncryption) {
        const commResult = this.validateCommunicationSecurity(context);
        this.mergeValidationResults(result, commResult);
      }

      // 4. Behavior analysis
      if (this.config.behaviorAnalysis) {
        const behaviorResult = await this.analyzeWorkerBehavior(context);
        this.mergeValidationResults(result, behaviorResult);
      }

      // 5. Sandbox validation
      if (this.config.sandboxing) {
        const sandboxResult = this.validateSandboxCompliance(context);
        this.mergeValidationResults(result, sandboxResult);
      }

      // 6. Calculate final risk score
      result.riskScore = this.calculateRiskScore(result);

      // 7. Determine if operation should be blocked
      result.allowed = result.riskScore < 70 && result.blockedActions.length === 0;
      result.success = result.allowed;

      // 8. Apply security transformations if needed
      if (result.allowed) {
        if (result.resourceLimits) {
          result.resourceLimits = await this.enforceResourceLimits(context);
          result.modifiedActions.push('resource-limits-enforced');
        }
      }

      result.metadata.processingTime = Date.now() - startTime;

      // Log validation
      this.logWorkerSecurityEvent(context, result);

      return result;

    } catch (error) {
      const errorResult: WorkerSecurityResult = {
        success: false,
        allowed: false,
        riskScore: 100,
        riskFactors: ['validation-error'],
        blockedActions: ['worker-operation'],
        allowedActions: [],
        modifiedActions: [],
        loggedActions: ['validation-error'],
        recommendations: ['Investigate worker security system error'],
        metadata: {
          processingTime: Date.now() - startTime,
          protocol: 'worker-security',
          version: '1.0.0',
          timestamp: new Date()
        }
      };

      this.logWorkerSecurityEvent(context, errorResult);
      return errorResult;
    }
  }

  /**
   * Validate worker authentication
   */
  private validateWorkerAuthentication(context: WorkerSecurityContext): Partial<WorkerSecurityResult> {
    const result: Partial<WorkerSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['authentication-validation']
    };

    // Check if worker exists
    const worker = this.workers.get(context.workerId);
    if (!worker) {
      result.riskFactors!.push('unknown-worker');
      result.blockedActions!.push('worker-not-found');
      result.loggedActions!.push('unknown-worker-detected');
      return result;
    }

    // Check session validity
    if (context.sessionId && !this.isValidSession(context.sessionId)) {
      result.riskFactors!.push('invalid-session');
      result.blockedActions!.push('invalid-session');
      result.loggedActions!.push('invalid-session-detected');
      return result;
    }

    result.allowedActions!.push('authentication-valid');
    return result;
  }

  /**
   * Validate resource usage
   */
  private validateResourceUsage(context: WorkerSecurityContext): Partial<WorkerSecurityResult> {
    const result: Partial<WorkerSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['resource-validation']
    };

    const currentUsage = this.resourceUsage.get(context.workerId);
    if (!currentUsage) {
      result.riskFactors!.push('no-usage-data');
      return result;
    }

    // Check CPU usage
    if (currentUsage.cpu.current > this.config.resourceLimits.maxCpu) {
      result.riskFactors!.push('cpu-overage');
      result.blockedActions!.push('cpu-limit-exceeded');
      result.loggedActions!.push('cpu-abuse-detected');
      return result;
    }

    // Check memory usage
    if (currentUsage.memory.current > this.config.resourceLimits.maxMemory) {
      result.riskFactors!.push('memory-overage');
      result.blockedActions!.push('memory-limit-exceeded');
      result.loggedActions!.push('memory-abuse-detected');
      return result;
    }

    // Check disk usage
    if (currentUsage.disk.current > this.config.resourceLimits.maxDisk) {
      result.riskFactors!.push('disk-overage');
      result.blockedActions!.push('disk-limit-exceeded');
      result.loggedActions!.push('disk-abuse-detected');
      return result;
    }

    // Check network usage
    if (currentUsage.network.current > this.config.resourceLimits.maxNetwork) {
      result.riskFactors!.push('network-overage');
      result.blockedActions!.push('network-limit-exceeded');
      result.loggedActions!.push('network-abuse-detected');
      return result;
    }

    // Check execution time
    if (currentUsage.executionTime.current > this.config.resourceLimits.maxExecutionTime) {
      result.riskFactors!.push('execution-timeout');
      result.blockedActions!.push('execution-time-exceeded');
      result.loggedActions!.push('execution-timeout-detected');
      return result;
    }

    result.allowedActions!.push('resource-usage-valid');
    return result;
  }

  /**
   * Validate communication security
   */
  private validateCommunicationSecurity(context: WorkerSecurityContext): Partial<WorkerSecurityResult> {
    const result: Partial<WorkerSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['communication-validation']
    };

    const commSecurity = this.communicationChannels.get(context.workerId);
    if (!commSecurity) {
      result.riskFactors!.push('no-communication-security');
      return result;
    }

    // Check encryption status
    if (!commSecurity.encrypted && this.config.communicationEncryption) {
      result.riskFactors!.push('unencrypted-communication');
      result.blockedActions!.push('unencrypted-communication');
      result.loggedActions!.push('unencrypted-communication-detected');
      return result;
    }

    // Check authentication status
    if (!commSecurity.authenticated) {
      result.riskFactors!.push('unauthenticated-communication');
      result.blockedActions!.push('unauthenticated-communication');
      result.loggedActions!.push('unauthenticated-communication-detected');
      return result;
    }

    result.allowedActions!.push('communication-security-valid');
    return result;
  }

  /**
   * Analyze worker behavior
   */
  private async analyzeWorkerBehavior(context: WorkerSecurityContext): Promise<Partial<WorkerSecurityResult>> {
    const result: Partial<WorkerSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['behavior-analysis']
    };

    const behaviorProfile = this.behaviorProfiles.get(context.workerId) || [];
    const currentBehavior = this.captureCurrentBehavior(context);

    // Detect anomalies
    const anomalies = this.detectBehaviorAnomalies(behaviorProfile, currentBehavior);

    if (anomalies.length > 0) {
      const analysisResult: BehaviorAnalysisResult = {
        anomalous: true,
        riskLevel: this.calculateBehaviorRiskLevel(anomalies),
        anomalies,
        confidence: this.calculateBehaviorConfidence(anomalies),
        recommendations: this.generateBehaviorRecommendations(anomalies),
        score: this.calculateBehaviorScore(anomalies)
      };

      result.riskFactors!.push('anomalous-behavior-detected');
      result.blockedActions!.push('behavior-anomaly-block');
      result.loggedActions!.push('anomalous-behavior-detected');

      if (analysisResult.riskLevel === 'critical') {
        result.blockedActions!.push('critical-behavior-block');
      }
    } else {
      result.allowedActions!.push('behavior-analysis-passed');
    }

    return result;
  }

  /**
   * Capture current behavior
   */
  private captureCurrentBehavior(context: WorkerSecurityContext): any {
    // This would capture current worker state and actions
    // In production, this would use more sophisticated monitoring
    return {
      timestamp: new Date(),
      operation: context.operation,
      resourceUsage: this.resourceUsage.get(context.workerId),
      communication: this.communicationChannels.get(context.workerId)
    };
  }

  /**
   * Detect behavior anomalies
   */
  private detectBehaviorAnomalies(behaviorProfile: any[], currentBehavior: any): BehaviorAnomaly[] {
    const anomalies: BehaviorAnomaly[] = [];

    // Resource abuse detection
    if (this.isResourceAbuse(currentBehavior)) {
      anomalies.push({
        type: 'resource-abuse',
        description: 'Resource usage indicates potential abuse',
        severity: 7,
        confidence: 80,
        timestamp: new Date(),
        metrics: {
          cpuUsage: currentBehavior.resourceUsage?.cpu?.current || 0,
          memoryUsage: currentBehavior.resourceUsage?.memory?.current || 0
        }
      });
    }

    // Unusual communication detection
    if (this.isUnusualCommunication(currentBehavior)) {
      anomalies.push({
        type: 'unusual-communication',
        description: 'Unusual communication patterns detected',
        severity: 6,
        confidence: 75,
        timestamp: new Date(),
        metrics: {
          communicationFrequency: currentBehavior.communication?.length || 0,
          unusualEndpoints: this.detectUnusualEndpoints(currentBehavior.communication)
        }
      });
    }

    // Execution anomaly detection
    if (this.isExecutionAnomaly(currentBehavior)) {
      anomalies.push({
        type: 'execution-anomaly',
        description: 'Unusual execution patterns detected',
        severity: 8,
        confidence: 85,
        timestamp: new Date(),
        metrics: {
          executionTime: currentBehavior.executionTime || 0,
          crashFrequency: this.detectCrashFrequency(behaviorProfile)
        }
      });
    }

    return anomalies;
  }

  /**
   * Check for resource abuse
   */
  private isResourceAbuse(currentBehavior: any): boolean {
    const resourceUsage = currentBehavior.resourceUsage;
    if (!resourceUsage) return false;

    return (
      resourceUsage.cpu.current > 90 ||
      resourceUsage.memory.current > this.config.resourceLimits.maxMemory * 0.9 ||
      resourceUsage.disk.current > this.config.resourceLimits.maxDisk * 0.9 ||
      resourceUsage.network.current > this.config.resourceLimits.maxNetwork * 0.9
    );
  }

  /**
   * Check for unusual communication
   */
  private isUnusualCommunication(currentBehavior: any): boolean {
    const communication = currentBehavior.communication;
    if (!communication || !Array.isArray(communication)) return false;

    // Check for communication with unknown endpoints
    const unknownEndpoints = communication.filter(msg =>
      !msg.endpoint || !this.isValidEndpoint(msg.endpoint)
    );

    return unknownEndpoints.length > communication.length * 0.3;
  }

  /**
   * Check for execution anomalies
   */
  private isExecutionAnomaly(currentBehavior: any): boolean {
    const executionTime = currentBehavior.executionTime;
    if (!executionTime) return false;

    return executionTime.current > this.config.resourceLimits.maxExecutionTime * 0.8;
  }

  /**
   * Detect unusual endpoints
   */
  private detectUnusualEndpoints(communication: any[]): string[] {
    const endpointCounts: Record<string, number> = {};

    communication.forEach(msg => {
      const endpoint = msg.endpoint || 'unknown';
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });

    // Find endpoints used unusually frequently
    const totalMessages = communication.length;
    const unusualThreshold = Math.max(5, totalMessages * 0.1);

    return Object.entries(endpointCounts)
      .filter(([endpoint, count]) => count > unusualThreshold)
      .map(([endpoint]) => endpoint);
  }

  /**
   * Detect crash frequency
   */
  private detectCrashFrequency(behaviorProfile: any[]): number {
    const crashes = behaviorProfile.filter(b => b.type === 'crash');
    const recentCrashes = crashes.filter(c =>
      Date.now() - c.timestamp.getTime() < 300000 // Last 5 minutes
    );

    return recentCrashes.length;
  }

  /**
   * Calculate behavior risk level
   */
  private calculateBehaviorRiskLevel(anomalies: BehaviorAnomaly[]): BehaviorAnalysisResult['riskLevel'] {
    if (anomalies.length === 0) return 'low';

    const maxSeverity = Math.max(...anomalies.map(a => a.severity));
    const avgSeverity = anomalies.reduce((sum, a) => sum + a.severity, 0) / anomalies.length;

    if (maxSeverity >= 9 || avgSeverity >= 7) return 'critical';
    if (maxSeverity >= 7 || avgSeverity >= 5) return 'high';
    return 'medium';
  }

  /**
   * Calculate behavior confidence
   */
  private calculateBehaviorConfidence(anomalies: BehaviorAnomaly[]): number {
    if (anomalies.length === 0) return 100;

    const avgConfidence = anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length;
    const maxConfidence = Math.max(...anomalies.map(a => a.confidence));

    return Math.min(100, (avgConfidence + maxConfidence) / 2);
  }

  /**
   * Calculate behavior score
   */
  private calculateBehaviorScore(anomalies: BehaviorAnomaly[]): number {
    if (anomalies.length === 0) return 100;

    const severityScore = anomalies.reduce((sum, a) => sum + a.severity * 5, 0);
    const confidenceScore = anomalies.reduce((sum, a) => sum + (100 - a.confidence), 0);

    return Math.max(0, 100 - ((severityScore + confidenceScore) / anomalies.length));
  }

  /**
   * Generate behavior recommendations
   */
  private generateBehaviorRecommendations(anomalies: BehaviorAnomaly[]): string[] {
    const recommendations: string[] = [];

    const anomalyTypes = new Set(anomalies.map(a => a.type));

    if (anomalyTypes.has('resource-abuse')) {
      recommendations.push('Investigate resource usage patterns');
      recommendations.push('Consider reducing resource limits');
    }

    if (anomalyTypes.has('unusual-communication')) {
      recommendations.push('Review communication endpoints');
      recommendations.push('Implement endpoint validation');
    }

    if (anomalyTypes.has('execution-anomaly')) {
      recommendations.push('Investigate execution environment');
      recommendations.push('Check for memory leaks or infinite loops');
    }

    if (anomalyTypes.has('privilege-escalation')) {
      recommendations.push('Immediate security review required');
      recommendations.push('Isolate worker and investigate privileges');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring worker behavior');
    }

    return recommendations;
  }

  /**
   * Validate sandbox compliance
   */
  private validateSandboxCompliance(context: WorkerSecurityContext): Partial<WorkerSecurityResult> {
    const result: Partial<WorkerSecurityResult> = {
      riskFactors: [],
      blockedActions: [],
      allowedActions: [],
      modifiedActions: [],
      loggedActions: ['sandbox-validation']
    };

    const policy = this.isolationPolicies.get(context.workerId);
    if (!policy) {
      result.riskFactors!.push('no-sandbox-policy');
      result.blockedActions!.push('no-sandbox-policy');
      result.loggedActions!.push('no-sandbox-policy-detected');
      return result;
    }

    // Check isolation level compliance
    const isolationLevels = ['basic', 'standard', 'enhanced', 'maximum'];
    if (!isolationLevels.includes(policy.isolationLevel)) {
      result.riskFactors!.push('invalid-isolation-level');
      result.blockedActions!.push('invalid-isolation-level');
      result.loggedActions!.push('invalid-isolation-level-detected');
      return result;
    }

    result.allowedActions!.push('sandbox-compliant');
    return result;
  }

  /**
   * Enforce resource limits
   */
  private async enforceResourceLimits(context: WorkerSecurityContext): Promise<ResourceUsageMetrics> {
    const worker = this.workers.get(context.workerId);
    if (!worker) {
      throw new Error(`Worker ${context.workerId} not found`);
    }

    const currentUsage = this.resourceUsage.get(context.workerId);
    const limits = this.config.resourceLimits;

    // Apply resource throttling if needed
    if (currentUsage.cpu.current > limits.maxCpu) {
      await this.throttleWorkerCPU(worker, limits.maxCpu);
    }

    if (currentUsage.memory.current > limits.maxMemory) {
      await this.throttleWorkerMemory(worker, limits.maxMemory);
    }

    if (currentUsage.disk.current > limits.maxDisk) {
      await this.throttleWorkerDisk(worker, limits.maxDisk);
    }

    if (currentUsage.network.current > limits.maxNetwork) {
      await this.throttleWorkerNetwork(worker, limits.maxNetwork);
    }

    if (currentUsage.executionTime.current > limits.maxExecutionTime) {
      await this.terminateWorkerExecution(worker);
    }

    // Return updated limits
    return this.resourceUsage.get(context.workerId) || currentUsage;
  }

  /**
   * Throttle worker CPU usage
   */
  private async throttleWorkerCPU(worker: ResearchWorker, maxCpu: number): Promise<void> {
    // Implementation would reduce CPU allocation
    console.log(`🔧 Throttling worker ${worker.id} CPU usage to ${maxCpu}%`);
    // In production, this would use container cgroups or similar mechanisms
  }

  /**
   * Throttle worker memory usage
   */
  private async throttleWorkerMemory(worker: ResearchWorker, maxMemory: number): Promise<void> {
    // Implementation would reduce memory allocation
    console.log(`🔧 Throttling worker ${worker.id} memory usage to ${maxMemory}MB`);
    // In production, this would use memory limits or garbage collection
  }

  /**
   * Throttle worker disk usage
   */
  private async throttleWorkerDisk(worker: ResearchWorker, maxDisk: number): Promise<void> {
    // Implementation would reduce disk I/O
    console.log(`🔧 Throttling worker ${worker.id} disk usage to ${maxDisk}MB`);
    // In production, this would use disk quotas or I/O throttling
  }

  /**
   * Throttle worker network usage
   */
  private async throttleWorkerNetwork(worker: ResearchWorker, maxNetwork: number): Promise<void> {
    // Implementation would reduce network bandwidth
    console.log(`🔧 Throttling worker ${worker.id} network usage to ${maxNetwork}MB/s`);
    // In production, this would use traffic shaping or bandwidth limits
  }

  /**
   * Terminate worker execution
   */
  private async terminateWorkerExecution(worker: ResearchWorker): Promise<void> {
    // Implementation would terminate the worker process
    console.log(`🔧 Terminating worker ${worker.id} execution due to time limit`);
    // In production, this would use process signals or container limits
  }

  /**
   * Create isolation policy
   */
  private createIsolationPolicy(worker: ResearchWorker): void {
    const policy: WorkerIsolationPolicy = {
      workerId: worker.id,
      isolationLevel: this.config.isolationLevel,
      resourceLimits: this.config.resourceLimits,
      networkIsolation: this.config.isolationLevel !== 'basic',
      fileSystemIsolation: this.config.isolationLevel === 'enhanced' || this.config.isolationLevel === 'maximum',
      processIsolation: this.config.isolationLevel === 'standard' || this.config.isolationLevel === 'maximum',
      communicationIsolation: this.config.isolationLevel !== 'basic',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    this.isolationPolicies.set(worker.id, policy);

    this.emit('isolation-policy-created', { workerId: worker.id, policy });
  }

  /**
   * Check if session is valid
   */
  private isValidSession(sessionId: string): boolean {
    // Simple validation - in production, use proper session management
    return sessionId && sessionId.length > 10 && /^[a-zA-Z0-9_-]+$/.test(sessionId);
  }

  /**
   * Check if endpoint is valid
   */
  private isValidEndpoint(endpoint: string): boolean {
    // Simple validation - in production, use endpoint allowlist
    return endpoint && endpoint.length > 3 && /^[a-zA-Z0-9_-]+$/.test(endpoint);
  }

  /**
   * Merge validation results
   */
  private mergeValidationResults(
    target: Partial<WorkerSecurityResult>,
    source: Partial<WorkerSecurityResult>
  ): void {
    target.riskFactors = [...(target.riskFactors || []), ...(source.riskFactors || [])];
    target.blockedActions = [...(target.blockedActions || []), ...(source.blockedActions || [])];
    target.allowedActions = [...(target.allowedActions || []), ...(source.allowedActions || [])];
    target.modifiedActions = [...(target.modifiedActions || []), ...(source.modifiedActions || [])];
    target.loggedActions = [...(target.loggedActions || []), ...(source.loggedActions || [])];
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(result: WorkerSecurityResult): number {
    let riskScore = 0;

    // Authentication issues
    if (result.riskFactors.includes('invalid-session')) riskScore += 30;
    if (result.riskFactors.includes('unknown-worker')) riskScore += 25;
    if (result.riskFactors.includes('invalid-session')) riskScore += 20;

    // Resource abuse issues
    if (result.riskFactors.includes('cpu-overage')) riskScore += 35;
    if (result.riskFactors.includes('memory-overage')) riskScore += 30;
    if (result.riskFactors.includes('disk-overage')) riskScore += 25;
    if (result.riskFactors.includes('network-overage')) riskScore += 25;
    if (result.riskFactors.includes('execution-timeout')) riskScore += 40;

    // Communication issues
    if (result.riskFactors.includes('unencrypted-communication')) riskScore += 25;
    if (result.riskFactors.includes('unauthenticated-communication')) riskScore += 30;

    // Sandbox issues
    if (result.riskFactors.includes('no-sandbox-policy')) riskScore += 20;
    if (result.riskFactors.includes('invalid-isolation-level')) riskScore += 15;

    // Behavior issues
    if (result.riskFactors.includes('anomalous-behavior-detected')) {
      const behaviorScore = result.metadata?.behaviorScore || 0;
      riskScore += Math.min(50, behaviorScore);
    }

    if (result.riskFactors.includes('critical-behavior-block')) {
      riskScore += 60;
    }

    return Math.min(100, riskScore);
  }

  /**
   * Log worker security event
   */
  private logWorkerSecurityEvent(
    context: WorkerSecurityContext,
    result: WorkerSecurityResult
  ): void {
    const logEntry = {
      timestamp: new Date(),
      context,
      result: {
        success: result.success,
        allowed: result.allowed,
        riskScore: result.riskScore,
        riskFactors: result.riskFactors,
        actions: {
          blocked: result.blockedActions,
          allowed: result.allowedActions,
          modified: result.modifiedActions
        }
      }
    };

    this.auditLog.push(logEntry);

    // Emit for external logging
    this.emit('worker-security-event', logEntry);
  }

  /**
   * Monitor all workers
   */
  private monitorAllWorkers(): void {
    for (const [workerId, worker] of this.workers.entries()) {
      // Update resource usage metrics
      this.updateResourceMetrics(workerId, worker);

      // Check isolation policy expiration
      const policy = this.isolationPolicies.get(workerId);
      if (policy && policy.expiresAt && policy.expiresAt < new Date()) {
        console.log(`🔧 Renewing isolation policy for worker ${workerId}`);
        this.createIsolationPolicy(worker);
      }
    }
  }

  /**
   * Update resource usage metrics
   */
  private updateResourceMetrics(workerId: string, worker: ResearchWorker): void {
    // This would collect actual resource usage
    // For now, simulate with random variations around baseline
    const currentUsage = this.resourceUsage.get(workerId) || {
      cpu: { current: 0, average: 0, peak: 0 },
      memory: { current: 0, average: 0, peak: 0 },
      disk: { current: 0, average: 0, peak: 0 },
      network: { current: 0, average: 0, peak: 0 },
      executionTime: { current: 0, average: 0, peak: 0 }
    };

    // Simulate realistic variations
    if (Math.random() > 0.7) {
      // Add some resource usage
      currentUsage.cpu.current = Math.random() * 20;
      currentUsage.memory.current = Math.random() * 512;
      currentUsage.network.current = Math.random() * 50;
    }

    this.resourceUsage.set(workerId, currentUsage);
  }

  /**
   * Clean up old audit logs
   */
  private cleanupAuditLogs(): void {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago

    const originalSize = this.auditLog.length;
    this.auditLog = this.auditLog.filter(entry =>
      entry.timestamp.getTime() > cutoffTime
    );

    const cleanedCount = originalSize - this.auditLog.length;
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old audit log entries`);
    }
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get security status
   */
  async getStatus(): Promise<any> {
    const activeWorkers = Array.from(this.workers.values()).filter(w =>
      w.status === 'active' || w.status === 'busy'
    );

    return {
      config: this.config,
      workers: {
        total: this.workers.size,
        active: activeWorkers.length,
        monitored: this.resourceUsage.size
      },
      isolationPolicies: this.isolationPolicies.size,
      communicationChannels: this.communicationChannels.size,
      auditLogSize: this.auditLog.length,
      threatPatterns: this.threatPatterns.length,
      timestamp: new Date()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<WorkerSecurityConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  /**
   * Perform security audit
   */
  async performAudit(): Promise<any> {
    const auditResults = {
      workerRegistration: this.auditWorkerRegistration(),
      resourceMonitoring: this.auditResourceMonitoring(),
      sandboxCompliance: this.auditSandboxCompliance(),
      communicationSecurity: this.auditCommunicationSecurity(),
      behaviorAnalysis: this.auditBehaviorAnalysis(),
      configuration: this.auditConfiguration()
    };

    return {
      timestamp: new Date(),
      overall: this.calculateOverallAuditScore(auditResults),
      components: auditResults
    };
  }

  /**
   * Audit worker registration
   */
  private auditWorkerRegistration(): any {
    const totalWorkers = this.workers.size;
    const maxWorkers = this.config.maxWorkers;

    return {
      score: totalWorkers <= maxWorkers ? 90 : 50,
      issues: totalWorkers > maxWorkers ? ['Worker count exceeds maximum'] : [],
      recommendations: totalWorkers > maxWorkers ? ['Reduce worker count or increase maximum'] : []
    };
  }

  /**
   * Audit resource monitoring
   */
  private auditResourceMonitoring(): any {
    const monitoredWorkers = this.resourceUsage.size;
    const totalWorkers = this.workers.size;

    return {
      score: this.config.resourceMonitoring ? 85 : 50,
      issues: this.config.resourceMonitoring ? [] : ['Resource monitoring is disabled'],
      recommendations: this.config.resourceMonitoring ? [] : ['Enable resource monitoring for better security']
    };
  }

  /**
   * Audit sandbox compliance
   */
  private auditSandboxCompliance(): any {
    const isolatedWorkers = this.isolationPolicies.size;
    const totalWorkers = this.workers.size;

    return {
      score: this.config.sandboxing ? 90 : 50,
      issues: this.config.sandboxing ? [] : ['Sandboxing is disabled'],
      recommendations: this.config.sandboxing ? [] : ['Enable sandboxing for better security']
    };
  }

  /**
   * Audit communication security
   */
  private auditCommunicationSecurity(): any {
    const encryptedChannels = Array.from(this.communicationChannels.values())
      .filter(ch => ch.encrypted)
      .length;

    const totalChannels = this.communicationChannels.size;

    return {
      score: this.config.communicationEncryption ? 90 : 50,
      issues: this.config.communicationEncryption ? [] : [`${totalChannels - encryptedChannels.length} channels lack encryption`],
      recommendations: this.config.communicationEncryption ? [] : ['Enable communication encryption']
    };
  }

  /**
   * Audit behavior analysis
   */
  private auditBehaviorAnalysis(): any {
    return {
      score: this.config.behaviorAnalysis ? 85 : 50,
      issues: this.config.behaviorAnalysis ? [] : ['Behavior analysis is disabled'],
      recommendations: this.config.behaviorAnalysis ? [] : ['Enable behavior analysis for better security']
    };
  }

  /**
   * Audit configuration
   */
  private auditConfiguration(): any {
    const issues: string[] = [];

    if (this.config.resourceLimits.maxCpu > 90) {
      issues.push('CPU limit is too high (> 90%)');
    }

    if (this.config.resourceLimits.maxMemory > 2048) {
      issues.push('Memory limit is too high (> 2GB)');
    }

    if (this.config.isolationLevel === 'basic') {
      issues.push('Isolation level should be at least standard');
    }

    return {
      score: Math.max(0, 100 - (issues.length * 15)),
      issues,
      recommendations: issues.map(issue => `Address: ${issue}`)
    };
  }

  /**
   * Calculate overall audit score
   */
  private calculateOverallAuditScore(results: any): any {
    const scores = Object.values(results).map((r: any) => r.score || 0);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      score: Math.round(average),
      grade: average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'F',
      passed: average >= 70
    };
  }
}

export default WorkerSecurityManager;