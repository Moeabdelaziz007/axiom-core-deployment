/**
 * 🔷 OPAL INTEGRATION SERVICE
 * 
 * Central orchestration service for Opal visual workflows with Axiom agents
 * Integrates Opal API Client, Workflow Bridge, and AI Engine for seamless execution
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { 
  OpalAgentConfig, 
  OpalExecutionRequest, 
  OpalExecutionResponse,
  OpalMonitoringEvent,
  OpalAgentState,
  AgentPerformanceMetrics,
  DEFAULT_OPAL_CONFIGS,
  MENA_OPAL_TEMPLATES
} from '../types/opal-agents';
import { OpalAPIClient, OpalAPIError } from '../lib/opal-client';
import { WorkflowBridgeService } from './workflow-bridge';
import { AgentType } from '../lib/ai-engine';
import { EventEmitter } from 'events';

/**
 * Integration service configuration
 */
interface OpalIntegrationConfig {
  opalBridgeConfig: {
    apiEndpoint: string;
    authentication: {
      type: 'oauth' | 'api_key' | 'service_account';
      credentials: Record<string, string>;
    };
    timeout: number;
    retryAttempts: number;
    rateLimiting: {
      requestsPerMinute: number;
      burstLimit: number;
    };
    webhooks: {
      enabled: boolean;
      endpoint?: string;
      secret?: string;
    };
  };
  workflowBridgeConfig: {
    defaultTimeout: number;
    maxRetries: number;
    enableCaching: boolean;
    cacheTimeout: number;
    enableMetrics: boolean;
  };
  agentConfigs: Record<AgentType, OpalAgentConfig>;
  monitoring: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    metricsCollection: boolean;
    alertThresholds: {
      executionTime?: number;
      errorRate?: number;
      costLimit?: number;
    };
  };
}

/**
 * Execution session for tracking active workflows
 */
interface ExecutionSession {
  executionId: string;
  request: OpalExecutionRequest;
  startTime: Date;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: any;
  error?: any;
  metrics: {
    nodeExecutions: number;
    totalExecutionTime: number;
    aiApiCalls: number;
    cost: number;
  };
}

/**
 * Performance analytics for Opal integration
 */
interface IntegrationAnalytics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  totalCost: number;
  agentUtilization: Map<AgentType, number>;
  workflowPopularity: Map<string, number>;
  errorPatterns: Map<string, number>;
}

/**
 * Main Opal Integration Service
 */
export class OpalIntegrationService {
  private config: OpalIntegrationConfig;
  private apiClient: OpalAPIClient;
  private workflowBridge: WorkflowBridgeService;
  private eventEmitter: EventEmitter;
  private agentStates: Map<string, OpalAgentState>;
  private executionSessions: Map<string, ExecutionSession>;
  private analytics: IntegrationAnalytics;
  private monitoringTimer?: NodeJS.Timeout;

  constructor(config: OpalIntegrationConfig) {
    this.config = config;
    this.agentStates = new Map();
    this.executionSessions = new Map();
    this.analytics = this.initializeAnalytics();

    // Initialize components
    this.apiClient = new OpalAPIClient(config.opalBridgeConfig);
    this.workflowBridge = new WorkflowBridgeService(config.workflowBridgeConfig);
    this.eventEmitter = new EventEmitter();

    // Set up event handlers
    this.setupEventHandlers();

    // Initialize agent states
    this.initializeAgentStates();

    // Start monitoring if enabled
    if (config.monitoring.enabled) {
      this.startMonitoring();
    }

    console.log('🔷 Opal Integration Service initialized');
  }

  /**
   * Initialize analytics tracking
   */
  private initializeAnalytics(): IntegrationAnalytics {
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      totalCost: 0,
      agentUtilization: new Map(),
      workflowPopularity: new Map(),
      errorPatterns: new Map()
    };
  }

  /**
   * Initialize agent states for all MENA agents
   */
  private initializeAgentStates(): void {
    const agentConfigs = this.config.agentConfigs || DEFAULT_OPAL_CONFIGS;

    for (const [agentType, agentConfig] of Object.entries(agentConfigs)) {
      const agentId = `${agentType.toLowerCase()}-opal-agent`;
      
      this.agentStates.set(agentId, {
        agentId,
        agentType: agentType as AgentType,
        status: 'active',
        currentExecutions: [],
        completedExecutions: [],
        failedExecutions: [],
        performanceMetrics: this.initializePerformanceMetrics(),
        lastHeartbeat: new Date(),
        capabilities: agentConfig.opalCapabilities
      });

      this.analytics.agentUtilization.set(agentType as AgentType, 0);
    }

    console.log(`✅ Initialized ${this.agentStates.size} agent states`);
  }

  /**
   * Initialize performance metrics
   */
  private initializePerformanceMetrics(): AgentPerformanceMetrics {
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      totalCost: 0,
      efficiency: 0,
      reliability: 0,
      availability: 100
    };
  }

  /**
   * Set up event handlers for API client and workflow bridge
   */
  private setupEventHandlers(): void {
    // API client event handlers
    this.apiClient.on('execution_update', (event) => {
      this.handleExecutionUpdate(event);
    });

    this.apiClient.on('execution_completed', (event) => {
      this.handleExecutionCompleted(event);
    });

    this.apiClient.on('webhook', (event) => {
      this.handleWebhookEvent(event);
    });

    // Workflow bridge event handlers would be added here if needed
  }

  /**
   * Execute Opal workflow with agent integration
   */
  async executeWorkflow(request: OpalExecutionRequest): Promise<OpalExecutionResponse> {
    const executionId = this.generateExecutionId();
    
    console.log(`🚀 Starting Opal workflow execution: ${executionId}`);

    try {
      // Validate request
      this.validateExecutionRequest(request);

      // Create execution session
      const session: ExecutionSession = {
        executionId,
        request,
        startTime: new Date(),
        status: 'starting',
        progress: 0,
        metrics: {
          nodeExecutions: 0,
          totalExecutionTime: 0,
          aiApiCalls: 0,
          cost: 0
        }
      };

      this.executionSessions.set(executionId, session);

      // Update agent state
      this.updateAgentState(request.agentId, 'executing', executionId);

      // Step 1: Try Opal API execution
      let opalResponse: OpalExecutionResponse;
      try {
        opalResponse = await this.executeViaOpalAPI(request);
        console.log(`✅ Opal API execution successful for: ${executionId}`);
      } catch (opalError) {
        console.warn(`⚠️ Opal API failed for ${executionId}, falling back to bridge:`, opalError);
        
        // Step 2: Fallback to workflow bridge
        opalResponse = await this.executeViaWorkflowBridge(request);
        console.log(`✅ Bridge execution successful for: ${executionId}`);
      }

      // Update session
      session.status = opalResponse.status as any;
      session.progress = opalResponse.progress;
      session.result = opalResponse.result;
      session.metrics.nodeExecutions = opalResponse.metrics.totalNodes;
      session.metrics.totalExecutionTime = opalResponse.metrics.totalExecutionTime;
      session.metrics.aiApiCalls = opalResponse.metrics.aiApiCalls;
      session.metrics.cost = opalResponse.metrics.cost;

      // Update analytics
      this.updateAnalytics(executionId, session);

      // Update agent state
      this.updateAgentState(request.agentId, 'completed', executionId);

      // Emit completion event
      this.eventEmitter.emit('workflow_completed', {
        executionId,
        request,
        response: opalResponse,
        session
      });

      console.log(`🎉 Workflow execution completed: ${executionId}`);
      return opalResponse;

    } catch (error) {
      console.error(`❌ Workflow execution failed: ${executionId}`, error);
      
      // Update session and agent state
      const session = this.executionSessions.get(executionId);
      if (session) {
        session.status = 'failed';
        session.error = error;
        session.result = null;
      }

      this.updateAgentState(request.agentId, 'failed', executionId);
      
      // Update analytics
      this.updateAnalytics(executionId, session!, true);

      // Emit failure event
      this.eventEmitter.emit('workflow_failed', {
        executionId,
        request,
        error,
        session
      });

      throw error;
    }
  }

  /**
   * Execute workflow via Opal API
   */
  private async executeViaOpalAPI(request: OpalExecutionRequest): Promise<OpalExecutionResponse> {
    // This would require the workflow template to be published to Opal
    const response = await this.apiClient.executeWorkflow(request);
    
    // Monitor execution until completion
    return this.monitorOpalExecution(response.executionId);
  }

  /**
   * Execute workflow via internal workflow bridge
   */
  private async executeViaWorkflowBridge(request: OpalExecutionRequest): Promise<OpalExecutionResponse> {
    // Find appropriate workflow template
    const template = this.findWorkflowTemplate(request.workflowTemplateId);
    if (!template) {
      throw new Error(`Workflow template not found: ${request.workflowTemplateId}`);
    }

    // Execute via workflow bridge
    const bridgeResult = await this.workflowBridge.executeWorkflow(
      template,
      request.agentId,
      request.inputData
    );

    return {
      executionId: bridgeResult.executionId,
      status: 'completed',
      progress: 100,
      result: bridgeResult.result,
      metrics: bridgeResult.metrics
    };
  }

  /**
   * Monitor Opal execution until completion
   */
  private async monitorOpalExecution(executionId: string): Promise<OpalExecutionResponse> {
    const maxWaitTime = 600000; // 10 minutes
    const checkInterval = 5000; // 5 seconds
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkExecution = async () => {
        try {
          const status = await this.apiClient.getExecutionStatus(executionId);
          
          if (['completed', 'failed', 'cancelled'].includes(status.status)) {
            const result = status.status === 'completed' 
              ? await this.apiClient.getExecutionResult(executionId)
              : null;

            resolve({
              executionId,
              status: status.status as any,
              progress: status.progress,
              result,
              error: status.error,
              metrics: this.convertOpalMetrics(status.metrics)
            });
          } else if (Date.now() - startTime > maxWaitTime) {
            reject(new Error('Execution timeout'));
          } else {
            setTimeout(checkExecution, checkInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkExecution();
    });
  }

  /**
   * Convert Opal metrics to our format
   */
  private convertOpalMetrics(opalMetrics: any): any {
    return {
      totalNodes: opalMetrics.totalNodes || 0,
      completedNodes: opalMetrics.completedNodes || 0,
      failedNodes: opalMetrics.failedNodes || 0,
      skippedNodes: opalMetrics.skippedNodes || 0,
      totalExecutionTime: opalMetrics.executionTime || 0,
      aiApiCalls: opalMetrics.aiCalls || 0,
      dataProcessed: opalMetrics.dataProcessed || 0,
      memoryUsage: opalMetrics.memoryUsage || 0,
      cost: opalMetrics.cost || 0
    };
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<{
    executionId: string;
    status: string;
    progress: number;
    result?: any;
    error?: any;
    metrics: any;
  }> {
    // Check local sessions first
    const session = this.executionSessions.get(executionId);
    if (session) {
      return {
        executionId: session.executionId,
        status: session.status,
        progress: session.progress,
        result: session.result,
        error: session.error,
        metrics: session.metrics
      };
    }

    // Check with Opal API
    try {
      const opalStatus = await this.apiClient.getExecutionStatus(executionId);
      const result = opalStatus.status === 'completed' 
        ? await this.apiClient.getExecutionResult(executionId)
        : null;

      return {
        executionId: opalStatus.id,
        status: opalStatus.status,
        progress: opalStatus.progress,
        result,
        error: opalStatus.error,
        metrics: this.convertOpalMetrics(opalStatus.metrics)
      };
    } catch (error) {
      throw new Error(`Execution not found: ${executionId}`);
    }
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const session = this.executionSessions.get(executionId);
    
    if (session) {
      session.status = 'cancelled';
      this.updateAgentState(session.request.agentId, 'cancelled', executionId);
    }

    try {
      await this.apiClient.cancelExecution(executionId);
    } catch (error) {
      console.warn(`Failed to cancel via Opal API for ${executionId}:`, error);
    }

    console.log(`⏹️ Execution cancelled: ${executionId}`);
  }

  /**
   * Create new workflow template
   */
  async createWorkflowTemplate(template: any): Promise<string> {
    try {
      const workflowId = await this.apiClient.createWorkflow(template);
      
      // Store locally for bridge execution
      this.storeWorkflowTemplate({ ...template, id: workflowId });
      
      console.log(`📋 Created workflow template: ${workflowId}`);
      return workflowId;
    } catch (error) {
      console.error('Failed to create workflow template:', error);
      throw error;
    }
  }

  /**
   * Get available workflow templates
   */
  async getWorkflowTemplates(filters?: {
    category?: string;
    agentType?: AgentType;
    tags?: string[];
  }): Promise<any[]> {
    try {
      // Get from Opal API first
      const opalTemplates = await this.apiClient.listWorkflows(filters);
      
      // Merge with local MENA templates
      const menaTemplates = MENA_OPAL_TEMPLATES.filter(template => {
        if (filters?.category && template.category !== filters.category) return false;
        if (filters?.agentType && template.agentType !== filters.agentType) return false;
        if (filters?.tags && !filters.tags.every(tag => template.metadata.tags.includes(tag))) return false;
        return true;
      });

      return [...menaTemplates, ...opalTemplates];
    } catch (error) {
      console.warn('Failed to get Opal templates, returning local ones:', error);
      
      // Fallback to local MENA templates
      return MENA_OPAL_TEMPLATES.filter(template => {
        if (filters?.category && template.category !== filters.category) return false;
        if (filters?.agentType && template.agentType !== filters.agentType) return false;
        if (filters?.tags && !filters.tags.every(tag => template.metadata.tags.includes(tag))) return false;
        return true;
      });
    }
  }

  /**
   * Get agent state
   */
  getAgentState(agentId: string): OpalAgentState | null {
    return this.agentStates.get(agentId) || null;
  }

  /**
   * Get all agent states
   */
  getAllAgentStates(): OpalAgentState[] {
    return Array.from(this.agentStates.values());
  }

  /**
   * Get integration analytics
   */
  getAnalytics(): IntegrationAnalytics {
    return this.analytics;
  }

  /**
   * Health check for all components
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      apiClient: boolean;
      workflowBridge: boolean;
      agents: number;
      activeExecutions: number;
    };
    issues: string[];
  }> {
    const issues: string[] = [];
    const components = {
      apiClient: false,
      workflowBridge: false,
      agents: 0,
      activeExecutions: this.executionSessions.size
    };

    // Check API client
    try {
      components.apiClient = await this.apiClient.healthCheck();
      if (!components.apiClient) {
        issues.push('Opal API client health check failed');
      }
    } catch (error) {
      issues.push(`Opal API client error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check workflow bridge
    try {
      const bridgeHealth = await this.workflowBridge.getHealth();
      components.workflowBridge = bridgeHealth.status === 'healthy';
      if (!components.workflowBridge) {
        issues.push('Workflow bridge health check failed');
      }
    } catch (error) {
      issues.push(`Workflow bridge error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check agents
    components.agents = Array.from(this.agentStates.values())
      .filter(agent => agent.status === 'active').length;

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (issues.length === 0) {
      status = 'healthy';
    } else if (issues.length <= 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      components,
      issues
    };
  }

  // === PRIVATE METHODS ===

  /**
   * Validate execution request
   */
  private validateExecutionRequest(request: OpalExecutionRequest): void {
    if (!request.workflowTemplateId) {
      throw new Error('Workflow template ID is required');
    }

    if (!request.agentId) {
      throw new Error('Agent ID is required');
    }

    if (!request.agentType) {
      throw new Error('Agent type is required');
    }

    // Check agent state
    const agentState = this.agentStates.get(request.agentId);
    if (!agentState || agentState.status !== 'active') {
      throw new Error(`Agent ${request.agentId} is not active`);
    }

    // Check for duplicate execution
    if (agentState.currentExecutions.includes(request.workflowTemplateId)) {
      throw new Error(`Agent ${request.agentId} is already executing workflow ${request.workflowTemplateId}`);
    }
  }

  /**
   * Find workflow template
   */
  private findWorkflowTemplate(templateId: string): any {
    // Check MENA templates first
    const menaTemplate = MENA_OPAL_TEMPLATES.find(t => t.id === templateId);
    if (menaTemplate) return menaTemplate;

    // In a real implementation, this would check a local store of templates
    // For now, return a dynamic template based on the ID
    return {
      id: templateId,
      name: `Dynamic Template ${templateId}`,
      description: 'Dynamically generated template',
      category: 'dynamic',
      agentType: AgentType.TAJER,
      nodes: [],
      connections: [],
      metadata: { version: '1.0.0', author: 'dynamic' }
    };
  }

  /**
   * Store workflow template locally
   */
  private storeWorkflowTemplate(template: any): void {
    // In a real implementation, this would store in a database
    // For now, just log the storage
    console.log(`💾 Stored workflow template: ${template.id}`);
  }

  /**
   * Update agent state
   */
  private updateAgentState(agentId: string, status: 'executing' | 'completed' | 'failed' | 'cancelled', executionId: string): void {
    const agentState = this.agentStates.get(agentId);
    if (!agentState) return;

    switch (status) {
      case 'executing':
        agentState.status = 'active';
        agentState.currentExecutions.push(executionId);
        break;
      case 'completed':
        agentState.status = 'active';
        agentState.currentExecutions = agentState.currentExecutions.filter(id => id !== executionId);
        agentState.completedExecutions.push(executionId);
        agentState.performanceMetrics.successfulExecutions++;
        break;
      case 'failed':
      case 'cancelled':
        agentState.status = 'active';
        agentState.currentExecutions = agentState.currentExecutions.filter(id => id !== executionId);
        agentState.failedExecutions.push(executionId);
        agentState.performanceMetrics.failedExecutions++;
        break;
    }

    agentState.lastHeartbeat = new Date();
    this.agentStates.set(agentId, agentState);
  }

  /**
   * Update analytics
   */
  private updateAnalytics(executionId: string, session: ExecutionSession, failed: boolean = false): void {
    this.analytics.totalExecutions++;
    
    if (failed) {
      this.analytics.failedExecutions++;
    } else {
      this.analytics.successfulExecutions++;
    }

    // Update average execution time
    const totalTime = this.analytics.averageExecutionTime * (this.analytics.totalExecutions - 1) + session.metrics.totalExecutionTime;
    this.analytics.averageExecutionTime = totalTime / this.analytics.totalExecutions;

    // Update total cost
    this.analytics.totalCost += session.metrics.cost;

    // Update agent utilization
    const agentType = session.request.agentType;
    this.analytics.agentUtilization.set(
      agentType,
      (this.analytics.agentUtilization.get(agentType) || 0) + 1
    );

    // Update workflow popularity
    const templateId = session.request.workflowTemplateId;
    this.analytics.workflowPopularity.set(
      templateId,
      (this.analytics.workflowPopularity.get(templateId) || 0) + 1
    );
  }

  /**
   * Generate execution ID
   */
  private generateExecutionId(): string {
    return `opal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Event handlers
   */
  private handleExecutionUpdate(event: any): void {
    const session = this.executionSessions.get(event.executionId);
    if (session) {
      session.progress = event.progress;
    }

    this.eventEmitter.emit('execution_update', event);
  }

  private handleExecutionCompleted(event: any): void {
    const session = this.executionSessions.get(event.executionId);
    if (session) {
      session.status = event.status;
      session.result = event.result;
    }

    this.eventEmitter.emit('execution_completed', event);
  }

  private handleWebhookEvent(event: OpalMonitoringEvent): void {
    this.eventEmitter.emit('opal_webhook', event);
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.monitoringTimer = setInterval(async () => {
      try {
        // Clean up expired sessions
        this.cleanupExpiredSessions();
        
        // Update agent heartbeats
        this.updateAgentHeartbeats();
        
        // Update analytics
        this.updatePerformanceMetrics();
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Cleanup expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [executionId, session] of this.executionSessions) {
      if (now - session.startTime.getTime() > 3600000) { // 1 hour
        expiredSessions.push(executionId);
      }
    }

    for (const executionId of expiredSessions) {
      this.executionSessions.delete(executionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  /**
   * Update agent heartbeats
   */
  private updateAgentHeartbeats(): void {
    for (const agentState of this.agentStates.values()) {
      if (agentState.status === 'active') {
        agentState.lastHeartbeat = new Date();
      }
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    for (const agentState of this.agentStates.values()) {
      const metrics = agentState.performanceMetrics;
      const total = metrics.successfulExecutions + metrics.failedExecutions;
      
      if (total > 0) {
        metrics.efficiency = (metrics.successfulExecutions / total) * 100;
        metrics.reliability = 100 - (metrics.failedExecutions / total) * 100;
        metrics.availability = agentState.status === 'active' ? 100 : 0;
      }
    }
  }

  /**
   * Event listener registration
   */
  on(event: string, callback: (data: any) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: (data: any) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * Shutdown service
   */
  async shutdown(): Promise<void> {
    console.log('🔷 Shutting down Opal Integration Service...');

    // Stop monitoring
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    // Cancel all active executions
    for (const session of this.executionSessions.values()) {
      if (session.status === 'running' || session.status === 'starting') {
        try {
          await this.cancelExecution(session.executionId);
        } catch (error) {
          console.warn(`Failed to cancel execution ${session.executionId}:`, error);
        }
      }
    }

    // Close API client
    await this.apiClient.close();

    console.log('✅ Opal Integration Service shutdown complete');
  }
}