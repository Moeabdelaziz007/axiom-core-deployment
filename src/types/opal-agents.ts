/**
 * 🔷 OPAL AGENT EXTENSIONS
 * 
 * Type definitions for Opal-enabled agents and workflow integration
 * Extends existing Axiom agent types with Opal visual workflow capabilities
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { AgentType } from '../lib/ai-engine';

/**
 * Opal workflow node types
 */
export enum OpalNodeType {
  INPUT = 'input',
  OUTPUT = 'output', 
  PROCESSOR = 'processor',
  DECISION = 'decision',
  LOOP = 'loop',
  PARALLEL = 'parallel',
  AGENT_CALL = 'agent_call',
  AI_ANALYSIS = 'ai_analysis',
  DATA_TRANSFORM = 'data_transform',
  CONDITION = 'condition'
}

/**
 * Opal workflow execution status
 */
export enum OpalWorkflowStatus {
  CREATED = 'created',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Opal-enabled agent configuration
 */
export interface OpalAgentConfig {
  agentType: AgentType;
  opalCapabilities: OpalCapability[];
  workflowTemplates: OpalWorkflowTemplate[];
  executionTimeout: number;
  retryPolicy: RetryPolicy;
  sandboxConfig: SandboxConfig;
  monitoringConfig: MonitoringConfig;
}

/**
 * Opal capability definition
 */
export interface OpalCapability {
  id: string;
  name: string;
  description: string;
  nodeTypes: OpalNodeType[];
  inputTypes: string[];
  outputTypes: string[];
  requiredPermissions: string[];
  estimatedExecutionTime: number;
  costPerExecution: number;
}

/**
 * Opal workflow template
 */
export interface OpalWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  agentType: AgentType;
  nodes: OpalWorkflowNode[];
  connections: OpalWorkflowConnection[];
  metadata: {
    version: string;
    author: string;
    tags: string[];
    useCases: string[];
    prerequisites: string[];
  };
}

/**
 * Opal workflow node definition
 */
export interface OpalWorkflowNode {
  id: string;
  type: OpalNodeType;
  name: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputs: OpalNodeInput[];
  outputs: OpalNodeOutput[];
  agentMapping?: {
    agentId: string;
    agentType: AgentType;
    capabilityId: string;
  };
}

/**
 * Opal workflow connection definition
 */
export interface OpalWorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
  dataMapping?: Record<string, string>;
}

/**
 * Opal node input definition
 */
export interface OpalNodeInput {
  id: string;
  name: string;
  type: string;
  required: boolean;
  validation?: ValidationRule[];
}

/**
 * Opal node output definition
 */
export interface OpalNodeOutput {
  id: string;
  name: string;
  type: string;
  description?: string;
}

/**
 * Validation rule for node inputs
 */
export interface ValidationRule {
  type: 'range' | 'pattern' | 'required' | 'custom';
  value?: any;
  message: string;
  validator?: (input: any) => boolean;
}

/**
 * Opal workflow execution context
 */
export interface OpalExecutionContext {
  workflowId: string;
  executionId: string;
  agentId: string;
  agentType: AgentType;
  startTime: Date;
  timeout: number;
  variables: Record<string, any>;
  state: OpalWorkflowStatus;
  nodeStates: Map<string, NodeExecutionState>;
  errors: ExecutionError[];
  metrics: ExecutionMetrics;
}

/**
 * Node execution state
 */
export interface NodeExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
  retryCount: number;
  outputData: Record<string, any>;
}

/**
 * Execution error definition
 */
export interface ExecutionError {
  nodeId: string;
  errorType: string;
  message: string;
  stackTrace?: string;
  timestamp: Date;
  recoverable: boolean;
  suggestion?: string;
}

/**
 * Execution metrics
 */
export interface ExecutionMetrics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  skippedNodes: number;
  totalExecutionTime: number;
  aiApiCalls: number;
  dataProcessed: number;
  memoryUsage: number;
  cost: number;
}

/**
 * Retry policy configuration
 */
export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
  fallbackStrategy?: 'skip' | 'use_cache' | 'alternate_agent' | 'manual';
}

/**
 * Sandbox configuration for workflow execution
 */
export interface SandboxConfig {
  enabled: boolean;
  memoryLimit: number;
  timeoutLimit: number;
  networkAccess: boolean;
  fileSystemAccess: boolean;
  allowedApis: string[];
  blockedFunctions: string[];
  isolationLevel: 'full' | 'partial' | 'none';
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsCollection: boolean;
  realTimeUpdates: boolean;
  alertThresholds: {
    executionTime?: number;
    memoryUsage?: number;
    errorRate?: number;
  };
}

/**
 * Opal workflow bridge configuration
 */
export interface OpalBridgeConfig {
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
}

/**
 * Opal agent state tracking
 */
export interface OpalAgentState {
  agentId: string;
  agentType: AgentType;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  currentExecutions: string[];
  completedExecutions: string[];
  failedExecutions: string[];
  performanceMetrics: AgentPerformanceMetrics;
  lastHeartbeat: Date;
  capabilities: OpalCapability[];
}

/**
 * Agent performance metrics
 */
export interface AgentPerformanceMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  totalCost: number;
  efficiency: number; // 0-100 score
  reliability: number; // 0-100 score
  availability: number; // 0-100 score
}

/**
 * Opal workflow execution request
 */
export interface OpalExecutionRequest {
  workflowTemplateId: string;
  agentId: string;
  agentType: AgentType;
  inputData: Record<string, any>;
  parameters: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timeout?: number;
  callbacks?: {
    onComplete?: string;
    onError?: string;
    onProgress?: string;
  };
}

/**
 * Opal workflow execution response
 */
export interface OpalExecutionResponse {
  executionId: string;
  status: OpalWorkflowStatus;
  progress: number;
  estimatedCompletion?: Date;
  result?: any;
  error?: ExecutionError[];
  metrics: ExecutionMetrics;
}

/**
 * Opal workflow monitoring event
 */
export interface OpalMonitoringEvent {
  type: 'node_started' | 'node_completed' | 'node_failed' | 'workflow_completed' | 'workflow_failed';
  executionId: string;
  nodeId?: string;
  timestamp: Date;
  data: any;
  agentId: string;
}

/**
 * MENA-specific Opal workflow templates
 */
export const MENA_OPAL_TEMPLATES: OpalWorkflowTemplate[] = [
  {
    id: 'tajer-business-analysis',
    name: 'Business Deal Analysis',
    description: 'Comprehensive business deal analysis workflow for Tajer agents',
    category: 'business_analysis',
    agentType: AgentType.TAJER,
    nodes: [
      {
        id: 'input_deal',
        type: OpalNodeType.INPUT,
        name: 'Deal Input',
        description: 'Input deal information',
        position: { x: 100, y: 100 },
        config: { schema: 'deal_info' },
        inputs: [],
        outputs: [{ id: 'deal_data', name: 'Deal Data', type: 'object' }]
      },
      {
        id: 'ai_analysis',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'AI Market Analysis',
        description: 'Analyze market conditions using Gemini',
        position: { x: 300, y: 100 },
        config: { model: 'gemini-2.0-flash-exp', prompt: 'market_analysis' },
        inputs: [{ id: 'data', name: 'Input Data', type: 'object', required: true }],
        outputs: [{ id: 'analysis', name: 'Analysis Result', type: 'object' }],
        agentMapping: { agentId: 'tajer-ai', agentType: AgentType.TAJER, capabilityId: 'market_analysis' }
      },
      {
        id: 'risk_assessment',
        type: OpalNodeType.PROCESSOR,
        name: 'Risk Assessment',
        description: 'Assess deal risks',
        position: { x: 500, y: 100 },
        config: { algorithm: 'risk_scoring' },
        inputs: [{ id: 'analysis', name: 'Analysis', type: 'object', required: true }],
        outputs: [{ id: 'risk_score', name: 'Risk Score', type: 'number' }]
      },
      {
        id: 'output_recommendation',
        type: OpalNodeType.OUTPUT,
        name: 'Deal Recommendation',
        description: 'Final deal recommendation',
        position: { x: 700, y: 100 },
        config: { format: 'recommendation_report' },
        inputs: [
          { id: 'risk_score', name: 'Risk Score', type: 'number', required: true },
          { id: 'analysis', name: 'Analysis', type: 'object', required: true }
        ],
        outputs: []
      }
    ],
    connections: [
      {
        id: 'c1',
        sourceNodeId: 'input_deal',
        sourceOutputId: 'deal_data',
        targetNodeId: 'ai_analysis',
        targetInputId: 'data'
      },
      {
        id: 'c2',
        sourceNodeId: 'ai_analysis',
        sourceOutputId: 'analysis',
        targetNodeId: 'risk_assessment',
        targetInputId: 'analysis'
      },
      {
        id: 'c3',
        sourceNodeId: 'risk_assessment',
        sourceOutputId: 'risk_score',
        targetNodeId: 'output_recommendation',
        targetInputId: 'risk_score'
      },
      {
        id: 'c4',
        sourceNodeId: 'ai_analysis',
        sourceOutputId: 'analysis',
        targetNodeId: 'output_recommendation',
        targetInputId: 'analysis'
      }
    ],
    metadata: {
      version: '1.0.0',
      author: 'axiom-core',
      tags: ['business', 'analysis', 'mena', 'risk-assessment'],
      useCases: ['Real estate deals', 'Investment opportunities', 'Partnership proposals'],
      prerequisites: ['Market data access', 'Legal framework knowledge']
    }
  },
  {
    id: 'sofra-menu-analysis',
    name: 'Restaurant Menu Analysis',
    description: 'Comprehensive menu analysis workflow for Sofra agents',
    category: 'restaurant_analysis',
    agentType: AgentType.SOFRA,
    nodes: [
      {
        id: 'input_menu_image',
        type: OpalNodeType.INPUT,
        name: 'Menu Image Input',
        description: 'Input restaurant menu image',
        position: { x: 100, y: 200 },
        config: { acceptedFormats: ['jpg', 'png', 'pdf'] },
        inputs: [],
        outputs: [{ id: 'menu_image', name: 'Menu Image', type: 'image' }]
      },
      {
        id: 'vision_analysis',
        type: OpalNodeType.AI_ANALYSIS,
        name: 'Menu Vision Analysis',
        description: 'Analyze menu using Gemini Vision',
        position: { x: 300, y: 200 },
        config: { model: 'gemini-vision', analysisType: 'menu' },
        inputs: [{ id: 'image', name: 'Menu Image', type: 'image', required: true }],
        outputs: [{ id: 'menu_data', name: 'Menu Data', type: 'object' }],
        agentMapping: { agentId: 'sofra-vision', agentType: AgentType.SOFRA, capabilityId: 'menu_analysis' }
      },
      {
        id: 'price_optimization',
        type: OpalNodeType.PROCESSOR,
        name: 'Price Optimization',
        description: 'Optimize menu pricing',
        position: { x: 500, y: 200 },
        config: { algorithm: 'price_optimization', currency: 'USD' },
        inputs: [{ id: 'menu_data', name: 'Menu Data', type: 'object', required: true }],
        outputs: [{ id: 'optimized_pricing', name: 'Optimized Pricing', type: 'object' }]
      },
      {
        id: 'output_report',
        type: OpalNodeType.OUTPUT,
        name: 'Menu Analysis Report',
        description: 'Comprehensive menu analysis report',
        position: { x: 700, y: 200 },
        config: { format: 'analysis_report', includeCharts: true },
        inputs: [
          { id: 'menu_data', name: 'Menu Data', type: 'object', required: true },
          { id: 'optimized_pricing', name: 'Optimized Pricing', type: 'object', required: true }
        ],
        outputs: []
      }
    ],
    connections: [
      {
        id: 'c1',
        sourceNodeId: 'input_menu_image',
        sourceOutputId: 'menu_image',
        targetNodeId: 'vision_analysis',
        targetInputId: 'image'
      },
      {
        id: 'c2',
        sourceNodeId: 'vision_analysis',
        sourceOutputId: 'menu_data',
        targetNodeId: 'price_optimization',
        targetInputId: 'menu_data'
      },
      {
        id: 'c3',
        sourceNodeId: 'vision_analysis',
        sourceOutputId: 'menu_data',
        targetNodeId: 'output_report',
        targetInputId: 'menu_data'
      },
      {
        id: 'c4',
        sourceNodeId: 'price_optimization',
        sourceOutputId: 'optimized_pricing',
        targetNodeId: 'output_report',
        targetInputId: 'optimized_pricing'
      }
    ],
    metadata: {
      version: '1.0.0',
      author: 'axiom-core',
      tags: ['restaurant', 'menu', 'analysis', 'pricing', 'vision'],
      useCases: ['Menu optimization', 'Price analysis', 'Restaurant consulting'],
      prerequisites: ['Image processing capability', 'Pricing algorithms']
    }
  }
];

/**
 * Default Opal configurations for MENA agents
 */
export const DEFAULT_OPAL_CONFIGS: Record<AgentType, OpalAgentConfig> = {
  [AgentType.TAJER]: {
    agentType: AgentType.TAJER,
    opalCapabilities: [
      {
        id: 'business_analysis',
        name: 'Business Analysis',
        description: 'Comprehensive business deal analysis',
        nodeTypes: [OpalNodeType.AI_ANALYSIS, OpalNodeType.PROCESSOR, OpalNodeType.DECISION],
        inputTypes: ['object', 'text', 'number'],
        outputTypes: ['recommendation', 'analysis', 'score'],
        requiredPermissions: ['market_data', 'financial_data'],
        estimatedExecutionTime: 300000, // 5 minutes
        costPerExecution: 0.50
      }
    ],
    workflowTemplates: MENA_OPAL_TEMPLATES.filter(t => t.agentType === AgentType.TAJER),
    executionTimeout: 900000, // 15 minutes
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 5000,
      maxDelay: 60000,
      retryableErrors: ['timeout', 'rate_limit', 'network'],
      fallbackStrategy: 'alternate_agent'
    },
    sandboxConfig: {
      enabled: true,
      memoryLimit: 512 * 1024 * 1024, // 512MB
      timeoutLimit: 900000,
      networkAccess: true,
      fileSystemAccess: false,
      allowedApis: ['google_gemini', 'market_data'],
      blockedFunctions: ['system', 'subprocess', 'file_write'],
      isolationLevel: 'partial'
    },
    monitoringConfig: {
      enabled: true,
      logLevel: 'info',
      metricsCollection: true,
      realTimeUpdates: true,
      alertThresholds: {
        executionTime: 600000,
        memoryUsage: 256 * 1024 * 1024,
        errorRate: 0.1
      }
    }
  },
  [AgentType.MUSAFIR]: {
    agentType: AgentType.MUSAFIR,
    opalCapabilities: [
      {
        id: 'travel_planning',
        name: 'Travel Planning',
        description: 'Comprehensive travel itinerary planning',
        nodeTypes: [OpalNodeType.PROCESSOR, OpalNodeType.AI_ANALYSIS, OpalNodeType.DECISION],
        inputTypes: ['object', 'text', 'number'],
        outputTypes: ['itinerary', 'recommendations', 'cost_estimate'],
        requiredPermissions: ['travel_data', 'location_services'],
        estimatedExecutionTime: 180000, // 3 minutes
        costPerExecution: 0.30
      }
    ],
    workflowTemplates: [],
    executionTimeout: 600000, // 10 minutes
    retryPolicy: {
      maxRetries: 2,
      backoffMultiplier: 1.5,
      initialDelay: 3000,
      maxDelay: 30000,
      retryableErrors: ['timeout', 'rate_limit'],
      fallbackStrategy: 'use_cache'
    },
    sandboxConfig: {
      enabled: true,
      memoryLimit: 256 * 1024 * 1024, // 256MB
      timeoutLimit: 600000,
      networkAccess: true,
      fileSystemAccess: false,
      allowedApis: ['google_gemini', 'maps'],
      blockedFunctions: ['system', 'subprocess'],
      isolationLevel: 'partial'
    },
    monitoringConfig: {
      enabled: true,
      logLevel: 'info',
      metricsCollection: true,
      realTimeUpdates: false,
      alertThresholds: {
        executionTime: 300000,
        errorRate: 0.05
      }
    }
  },
  [AgentType.SOFRA]: {
    agentType: AgentType.SOFRA,
    opalCapabilities: [
      {
        id: 'menu_analysis',
        name: 'Menu Analysis',
        description: 'Comprehensive restaurant menu analysis',
        nodeTypes: [OpalNodeType.AI_ANALYSIS, OpalNodeType.PROCESSOR, OpalNodeType.DECISION],
        inputTypes: ['image', 'object', 'text'],
        outputTypes: ['analysis', 'optimization', 'recommendations'],
        requiredPermissions: ['image_processing', 'pricing_data'],
        estimatedExecutionTime: 240000, // 4 minutes
        costPerExecution: 0.40
      },
      {
        id: 'customer_experience',
        name: 'Customer Experience Analysis',
        description: 'Analyze and improve customer journey',
        nodeTypes: [OpalNodeType.AI_ANALYSIS, OpalNodeType.PROCESSOR],
        inputTypes: ['object', 'text', 'feedback'],
        outputTypes: ['insights', 'recommendations', 'scores'],
        requiredPermissions: ['customer_data', 'feedback_analysis'],
        estimatedExecutionTime: 180000, // 3 minutes
        costPerExecution: 0.35
      }
    ],
    workflowTemplates: MENA_OPAL_TEMPLATES.filter(t => t.agentType === AgentType.SOFRA),
    executionTimeout: 720000, // 12 minutes
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 4000,
      maxDelay: 45000,
      retryableErrors: ['timeout', 'rate_limit', 'api_error'],
      fallbackStrategy: 'skip'
    },
    sandboxConfig: {
      enabled: true,
      memoryLimit: 384 * 1024 * 1024, // 384MB
      timeoutLimit: 720000,
      networkAccess: true,
      fileSystemAccess: false,
      allowedApis: ['google_gemini', 'google_vision'],
      blockedFunctions: ['system', 'subprocess', 'file_write'],
      isolationLevel: 'partial'
    },
    monitoringConfig: {
      enabled: true,
      logLevel: 'info',
      metricsCollection: true,
      realTimeUpdates: true,
      alertThresholds: {
        executionTime: 500000,
        memoryUsage: 192 * 1024 * 1024,
        errorRate: 0.08
      }
    }
  },
  [AgentType.MOSTASHAR]: {
    agentType: AgentType.MOSTASHAR,
    opalCapabilities: [
      {
        id: 'legal_analysis',
        name: 'Legal Document Analysis',
        description: 'Comprehensive legal document review and analysis',
        nodeTypes: [OpalNodeType.AI_ANALYSIS, OpalNodeType.PROCESSOR, OpalNodeType.DECISION],
        inputTypes: ['text', 'document', 'object'],
        outputTypes: ['analysis', 'compliance_check', 'recommendations'],
        requiredPermissions: ['legal_data', 'compliance_rules'],
        estimatedExecutionTime: 360000, // 6 minutes
        costPerExecution: 0.60
      }
    ],
    workflowTemplates: [],
    executionTimeout: 1200000, // 20 minutes
    retryPolicy: {
      maxRetries: 2,
      backoffMultiplier: 2.5,
      initialDelay: 8000,
      maxDelay: 120000,
      retryableErrors: ['timeout', 'api_error'],
      fallbackStrategy: 'manual'
    },
    sandboxConfig: {
      enabled: true,
      memoryLimit: 768 * 1024 * 1024, // 768MB
      timeoutLimit: 1200000,
      networkAccess: true,
      fileSystemAccess: false,
      allowedApis: ['google_gemini', 'legal_databases'],
      blockedFunctions: ['system', 'subprocess', 'file_write', 'network_external'],
      isolationLevel: 'full'
    },
    monitoringConfig: {
      enabled: true,
      logLevel: 'warn',
      metricsCollection: true,
      realTimeUpdates: true,
      alertThresholds: {
        executionTime: 900000,
        memoryUsage: 384 * 1024 * 1024,
        errorRate: 0.03
      }
    }
  }
};

// Export all types and configurations
export type {
  OpalAgentConfig,
  OpalCapability,
  OpalWorkflowTemplate,
  OpalWorkflowNode,
  OpalWorkflowConnection,
  OpalNodeInput,
  OpalNodeOutput,
  ValidationRule,
  OpalExecutionContext,
  NodeExecutionState,
  ExecutionError,
  ExecutionMetrics,
  RetryPolicy,
  SandboxConfig,
  MonitoringConfig,
  OpalBridgeConfig,
  OpalAgentState,
  AgentPerformanceMetrics,
  OpalExecutionRequest,
  OpalExecutionResponse,
  OpalMonitoringEvent
};