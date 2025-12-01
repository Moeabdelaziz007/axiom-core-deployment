/**
 * 🔌 OPAL API CLIENT
 * 
 * Google Opal API integration client for workflow execution and monitoring
 * Provides comprehensive workflow creation, execution, and monitoring capabilities
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { 
  OpalWorkflowTemplate, 
  OpalExecutionRequest, 
  OpalExecutionResponse,
  OpalMonitoringEvent,
  OpalBridgeConfig,
  OpalWorkflowStatus
} from '../types/opal-agents';

/**
 * HTTP client for API requests
 */
class HttpClient {
  private baseURL: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor(config: {
    baseURL: string;
    headers?: Record<string, string>;
    timeout?: number;
  }) {
    this.baseURL = config.baseURL;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.timeout = config.timeout || 30000;
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new OpalAPIError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          errorText
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as unknown as T;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new OpalAPIError('Request timeout', 408, 'TIMEOUT');
      }
      
      if (error instanceof OpalAPIError) {
        throw error;
      }

      // Retry logic for network errors
      if (retryCount < 3 && this.isRetryableError(error)) {
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.request<T>(method, endpoint, data, retryCount + 1);
      }

      throw new OpalAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        'NETWORK_ERROR'
      );
    }
  }

  private isRetryableError(error: any): boolean {
    if (error instanceof TypeError) return true; // Network errors
    if (error instanceof OpalAPIError) {
      return [408, 429, 500, 502, 503, 504].includes(error.statusCode);
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Opal API Error class
 */
export class OpalAPIError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = 'OpalAPIError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Opal Workflow definition for API
 */
interface OpalWorkflow {
  id?: string;
  name: string;
  description: string;
  version: string;
  nodes: OpalAPINode[];
  connections: OpalAPIConnection[];
  metadata?: Record<string, any>;
}

/**
 * Opal API Node definition
 */
interface OpalAPINode {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

/**
 * Opal API Connection definition
 */
interface OpalAPIConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutput?: string;
  targetInput?: string;
}

/**
 * Opal Execution status from API
 */
interface OpalExecutionStatus {
  id: string;
  status: string;
  progress: number;
  startTime: string;
  endTime?: string;
  currentNode?: string;
  error?: string;
  result?: any;
  metrics?: Record<string, any>;
}

/**
 * Rate limiter for API requests
 */
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);
      if (waitTime > 0) {
        await this.delay(waitTime);
      }
    }

    this.requests.push(now);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Event emitter for real-time updates
 */
class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string, data: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }
}

/**
 * Main Opal API Client
 */
export class OpalAPIClient {
  private httpClient: HttpClient;
  private config: OpalBridgeConfig;
  private rateLimiter: RateLimiter;
  private eventEmitter: EventEmitter;
  private activeExecutions: Map<string, NodeJS.Timeout> = new Map();
  private webhookSecret?: string;

  constructor(config: OpalBridgeConfig) {
    this.config = config;
    this.webhookSecret = config.webhooks.secret;
    
    // Initialize HTTP client
    this.httpClient = new HttpClient({
      baseURL: config.apiEndpoint,
      headers: this.buildAuthHeaders(),
      timeout: config.timeout
    });

    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(
      config.rateLimiting.requestsPerMinute,
      60000 // 1 minute
    );

    // Initialize event emitter
    this.eventEmitter = new EventEmitter();

    console.log('🔌 Opal API Client initialized');
  }

  /**
   * Build authentication headers
   */
  private buildAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (this.config.authentication.type) {
      case 'api_key':
        headers['X-API-Key'] = this.config.authentication.credentials.apiKey;
        break;
      case 'oauth':
        headers['Authorization'] = `Bearer ${this.config.authentication.credentials.accessToken}`;
        break;
      case 'service_account':
        headers['Authorization'] = `Bearer ${this.config.authentication.credentials.serviceToken}`;
        break;
    }

    return headers;
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(template: OpalWorkflowTemplate): Promise<string> {
    await this.rateLimiter.waitForSlot();

    const opalWorkflow: OpalWorkflow = {
      name: template.name,
      description: template.description,
      version: template.metadata.version,
      nodes: template.nodes.map(node => ({
        id: node.id,
        type: node.type,
        name: node.name,
        config: node.config,
        position: node.position
      })),
      connections: template.connections.map(conn => ({
        id: conn.id,
        sourceNodeId: conn.sourceNodeId,
        targetNodeId: conn.targetNodeId,
        sourceOutput: conn.sourceOutputId,
        targetInput: conn.targetInputId
      })),
      metadata: {
        ...template.metadata,
        agentType: template.agentType,
        category: template.category
      }
    };

    try {
      const response = await this.httpClient.post<{ id: string }>('/workflows', opalWorkflow);
      
      console.log(`✅ Created workflow: ${response.id}`);
      return response.id;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<OpalWorkflowTemplate> {
    await this.rateLimiter.waitForSlot();

    try {
      const workflow = await this.httpClient.get<OpalWorkflow>(`/workflows/${workflowId}`);
      
      // Convert back to template format
      return {
        id: workflow.id!,
        name: workflow.name,
        description: workflow.description,
        category: workflow.metadata?.category || 'general',
        agentType: workflow.metadata?.agentType || 'TAJER',
        nodes: workflow.nodes.map(node => ({
          id: node.id,
          type: node.type as any,
          name: node.name,
          description: '',
          position: node.position,
          config: node.config,
          inputs: [],
          outputs: []
        })),
        connections: workflow.connections.map(conn => ({
          id: conn.id,
          sourceNodeId: conn.sourceNodeId,
          targetNodeId: conn.targetNodeId,
          sourceOutputId: conn.sourceOutput || '',
          targetInputId: conn.targetInput || ''
        })),
        metadata: workflow.metadata || {}
      };
    } catch (error) {
      console.error(`Failed to get workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * List all workflows
   */
  async listWorkflows(filters?: {
    category?: string;
    agentType?: string;
    tags?: string[];
  }): Promise<OpalWorkflowTemplate[]> {
    await this.rateLimiter.waitForSlot();

    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.agentType) params.append('agentType', filters.agentType);
      if (filters?.tags) params.append('tags', filters.tags.join(','));

      const response = await this.httpClient.get<OpalWorkflow[]>(`/workflows?${params.toString()}`);
      
      return response.map(workflow => ({
        id: workflow.id!,
        name: workflow.name,
        description: workflow.description,
        category: workflow.metadata?.category || 'general',
        agentType: workflow.metadata?.agentType || 'TAJER',
        nodes: workflow.nodes.map(node => ({
          id: node.id,
          type: node.type as any,
          name: node.name,
          description: '',
          position: node.position,
          config: node.config,
          inputs: [],
          outputs: []
        })),
        connections: workflow.connections.map(conn => ({
          id: conn.id,
          sourceNodeId: conn.sourceNodeId,
          targetNodeId: conn.targetNodeId,
          sourceOutputId: conn.sourceOutput || '',
          targetInputId: conn.targetInput || ''
        })),
        metadata: workflow.metadata || {}
      }));
    } catch (error) {
      console.error('Failed to list workflows:', error);
      throw error;
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(request: OpalExecutionRequest): Promise<OpalExecutionResponse> {
    await this.rateLimiter.waitForSlot();

    const executionData = {
      workflowId: request.workflowTemplateId,
      agentId: request.agentId,
      agentType: request.agentType,
      inputData: request.inputData,
      parameters: request.parameters,
      priority: request.priority,
      timeout: request.timeout,
      callbacks: request.callbacks
    };

    try {
      const response = await this.httpClient.post<{ executionId: string }>('/executions', executionData);
      
      console.log(`🚀 Started execution: ${response.executionId}`);
      
      // Start monitoring if enabled
      if (this.config.webhooks.enabled) {
        await this.startExecutionMonitoring(response.executionId);
      }

      return {
        executionId: response.executionId,
        status: OpalWorkflowStatus.RUNNING,
        progress: 0,
        metrics: {
          totalNodes: 0,
          completedNodes: 0,
          failedNodes: 0,
          skippedNodes: 0,
          totalExecutionTime: 0,
          aiApiCalls: 0,
          dataProcessed: 0,
          memoryUsage: 0,
          cost: 0
        }
      };
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<OpalExecutionStatus> {
    await this.rateLimiter.waitForSlot();

    try {
      return await this.httpClient.get<OpalExecutionStatus>(`/executions/${executionId}`);
    } catch (error) {
      console.error(`Failed to get execution status ${executionId}:`, error);
      throw error;
    }
  }

  /**
   * Get execution result
   */
  async getExecutionResult(executionId: string): Promise<any> {
    await this.rateLimiter.waitForSlot();

    try {
      const result = await this.httpClient.get<any>(`/executions/${executionId}/result`);
      return result;
    } catch (error) {
      console.error(`Failed to get execution result ${executionId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    await this.rateLimiter.waitForSlot();

    try {
      await this.httpClient.post<void>(`/executions/${executionId}/cancel`, {});
      
      // Stop monitoring
      this.stopExecutionMonitoring(executionId);
      
      console.log(`⏹️ Cancelled execution: ${executionId}`);
    } catch (error) {
      console.error(`Failed to cancel execution ${executionId}:`, error);
      throw error;
    }
  }

  /**
   * Start execution monitoring with polling
   */
  private async startExecutionMonitoring(executionId: string): Promise<void> {
    const pollInterval = setInterval(async () => {
      try {
        const status = await this.getExecutionStatus(executionId);
        
        // Emit monitoring events
        this.eventEmitter.emit('execution_update', {
          executionId,
          status: status.status,
          progress: status.progress,
          currentNode: status.currentNode,
          timestamp: new Date()
        });

        // Stop monitoring if completed
        if (['completed', 'failed', 'cancelled'].includes(status.status)) {
          this.stopExecutionMonitoring(executionId);
          
          this.eventEmitter.emit('execution_completed', {
            executionId,
            status: status.status,
            result: status.result,
            error: status.error,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error(`Error monitoring execution ${executionId}:`, error);
        this.stopExecutionMonitoring(executionId);
      }
    }, 5000); // Poll every 5 seconds

    this.activeExecutions.set(executionId, pollInterval);
  }

  /**
   * Stop execution monitoring
   */
  private stopExecutionMonitoring(executionId: string): void {
    const interval = this.activeExecutions.get(executionId);
    if (interval) {
      clearInterval(interval);
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Set up webhook handler
   */
  onWebhook(data: any, signature?: string): void {
    // Verify webhook signature if secret is configured
    if (this.webhookSecret && signature) {
      if (!this.verifyWebhookSignature(data, signature)) {
        console.warn('Invalid webhook signature');
        return;
      }
    }

    // Process webhook data
    const event: OpalMonitoringEvent = {
      type: data.eventType,
      executionId: data.executionId,
      nodeId: data.nodeId,
      timestamp: new Date(data.timestamp),
      data: data.payload,
      agentId: data.agentId
    };

    // Emit event
    this.eventEmitter.emit('webhook', event);
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(data: any, signature: string): boolean {
    // Implementation would depend on the specific webhook security scheme
    // This is a placeholder implementation
    return true; // For now, accept all webhooks
  }

  /**
   * Event listener registration
   */
  on(event: string, callback: (data: any) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Event listener removal
   */
  off(event: string, callback: (data: any) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.httpClient.get<{ status: string }>('/health');
      return true;
    } catch (error) {
      console.error('Opal API health check failed:', error);
      return false;
    }
  }

  /**
   * Get API rate limit status
   */
  getRateLimitStatus(): { requests: number; resetTime: number } {
    return {
      requests: this.rateLimiter['requests'].length,
      resetTime: Date.now() + 60000
    };
  }

  /**
   * Close client and cleanup resources
   */
  async close(): Promise<void> {
    // Stop all monitoring
    this.activeExecutions.forEach((interval) => clearInterval(interval));
    this.activeExecutions.clear();

    console.log('🔌 Opal API Client closed');
  }
}

// Export the client and types
export { OpalAPIClient, OpalAPIError };
export type { OpalWorkflow, OpalAPINode, OpalAPIConnection, OpalExecutionStatus };