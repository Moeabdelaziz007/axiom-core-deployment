/**
 * 🔷 ENHANCED AGENT TYPES WITH OPAL CAPABILITIES
 * 
 * Extended type definitions for Opal-enabled agents
 * Integrates with existing identity, evolution, and performance systems
 * Supports Tesla frequency-based personality generation and Solana wallet integration
 * 
 * @author Axiom Core Team
 * @version 2.0.0
 */

import { AgentType } from '../lib/ai-engine';
import {
  OpalAgentConfig,
  OpalWorkflowTemplate,
  OpalCapability,
  OpalAgentState,
  AgentPerformanceMetrics,
  OpalExecutionRequest,
  OpalExecutionResponse
} from './opal-agents';
import { EvolutionStage, IdentityState, AgentIdentity, Evolution, Microcosm } from './identity';
import {
  ModelManagementConfig,
  ModelConfig,
  BilingualConfig,
  ModelSelectionCriteria,
  RegionalModelPreferences,
  ModelPerformanceMetrics,
  DEFAULT_MODEL_CONFIGS,
  ModelType
} from './model-config';

/**
 * Enhanced agent configuration with full Opal integration
 */
export interface EnhancedAgentConfig {
  // Core agent information
  agent_name: string;
  agent_type: AgentType;
  core_frequency: string; // Tesla frequency (e.g., 432Hz, 528Hz, 639Hz)
  
  // Personality and communication
  system_prompt: string;
  welcome_message: string;
  voice_config: {
    voice_id: string;
    speed: number;
    style: string;
    accent?: string;
    language_support: string[];
  };
  
  // Economic capabilities (Solana integration)
  wallet: {
    publicKey: string;
    secretKey: string;
    balance?: number;
    lastTransaction?: Date;
  };
  
  // Opal workflow capabilities
  opal_config: OpalAgentConfig;
  workflow_templates: OpalWorkflowTemplate[];
  
  // Evolution and development
  evolution: Evolution;
  identity_state: IdentityState;
  
  // Cultural and regional adaptation
  cultural_context: {
    language: string;
    region: string;
    business_practices: string[];
    compliance_requirements: string[];
    religious_considerations?: string[];
    local_customs?: string[];
    timezone: string;
    currency_preference: string[];
  };
  
  // Model configuration and management
  model_config: ModelManagementConfig;
  primary_model: ModelConfig;
  bilingual_config: BilingualConfig;
  model_selection_criteria: ModelSelectionCriteria;
  regional_preferences: RegionalModelPreferences[];
  
  // Performance and monitoring
  performance_metrics: AgentPerformanceMetrics;
  opal_state: OpalAgentState;
  
  // Tesla frequency personality traits
  personality_profile: {
    frequency_band: '3Hz' | '6Hz' | '9Hz' | 'custom';
    traits: string[];
    communication_style: 'analytical' | 'creative' | 'empathetic' | 'strategic';
    decision_making: 'logical' | 'intuitive' | 'balanced';
    learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'multimodal';
  };
  
  // Agent capabilities and permissions
  capabilities: {
    economic_operations: boolean;
    workflow_execution: boolean;
    ai_analysis: boolean;
    data_processing: boolean;
    communication: boolean;
    learning: boolean;
    collaboration: boolean;
  };
  
  // Security and privacy
  security_config: {
    encryption_level: 'standard' | 'enhanced' | 'military';
    data_retention_days: number;
    audit_logging: boolean;
    access_controls: string[];
    privacy_mode: boolean;
  };
  
  // Metadata and versioning
  metadata: {
    version: string;
    created_at: Date;
    updated_at: Date;
    creator_id?: string;
    deployment_environment: 'development' | 'staging' | 'production';
    tags: string[];
    category: string;
  };
}

/**
 * Agent creation request with Opal integration
 */
export interface EnhancedAgentCreationRequest {
  // Basic agent information
  name: string;
  role: string;
  vibe: string;
  agent_type: AgentType;
  
  // Tesla frequency configuration
  frequency_band?: '3Hz' | '6Hz' | '9Hz' | 'custom';
  custom_frequency?: number;
  
  // Cultural and regional settings
  region?: string;
  language?: string;
  timezone?: string;
  currency_preference?: string[];
  
  // Model preferences
  model_preferences: {
    preferred_model?: ModelType;
    quantization_preference?: 4 | 8 | 16;
    bilingual_required?: boolean;
    arabic_optimization?: boolean;
    saudi_compliance_required?: boolean;
  };
  
  // Regional settings
  regional_settings: {
    region?: string;
    language_preference?: 'ar' | 'en' | 'bilingual';
    cultural_adaptation?: boolean;
  };
  
  // Opal configuration
  enable_opal_workflows: boolean;
  workflow_categories?: string[];
  custom_workflows?: OpalWorkflowTemplate[];
  
  // Economic configuration
  enable_wallet: boolean;
  initial_balance?: number;
  
  // Security settings
  security_level?: 'standard' | 'enhanced' | 'military';
  privacy_mode?: boolean;
  
  // Advanced options
  personality_customization?: {
    traits?: string[];
    communication_style?: 'analytical' | 'creative' | 'empathetic' | 'strategic';
    decision_making?: 'logical' | 'intuitive' | 'balanced';
    learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'multimodal';
  };
  
  // Integration settings
  integrations?: {
    external_apis?: string[];
    databases?: string[];
    monitoring_tools?: string[];
    collaboration_platforms?: string[];
  };
}

/**
 * Enhanced agent response with full configuration
 */
export interface EnhancedAgentResponse {
  success: boolean;
  agent?: EnhancedAgentConfig;
  creation_metadata: {
    execution_time: number;
    wallet_generation_time: number;
    opal_setup_time: number;
    personality_generation_time: number;
    total_time: number;
  };
  validation_results: {
    config_valid: boolean;
    opal_integration_valid: boolean;
    wallet_integration_valid: boolean;
    cultural_context_valid: boolean;
    model_config_valid: boolean;
    bilingual_config_valid: boolean;
    errors: string[];
    warnings: string[];
  };
  deployment_info: {
    agent_id: string;
    deployment_url?: string;
    api_endpoints: string[];
    webhook_urls: string[];
  };
  model_deployment_info: {
    primary_model: ModelType;
    fallback_models: ModelType[];
    model_switching_enabled: boolean;
    bilingual_capabilities: boolean;
    quantization_settings: any;
  };
  performance_metrics: ModelPerformanceMetrics[];
}

/**
 * Agent upgrade configuration
 */
export interface AgentUpgradeConfig {
  agent_id: string;
  upgrade_type: 'opal_integration' | 'personality_enhancement' | 'capability_expansion' | 'cultural_adaptation';
  
  // Opal integration upgrade
  opal_config?: {
    enable_workflows: boolean;
    workflow_categories: string[];
    custom_templates?: OpalWorkflowTemplate[];
  };
  
  // Personality enhancement
  personality_changes?: {
    new_frequency_band?: '3Hz' | '6Hz' | '9Hz' | 'custom';
    trait_modifications?: string[];
    communication_style_change?: 'analytical' | 'creative' | 'empathetic' | 'strategic';
  };
  
  // Capability expansion
  new_capabilities?: {
    economic_operations?: boolean;
    workflow_execution?: boolean;
    ai_analysis?: boolean;
    data_processing?: boolean;
    communication?: boolean;
    learning?: boolean;
    collaboration?: boolean;
  };
  
  // Cultural adaptation
  cultural_updates?: {
    new_region?: string;
    additional_languages?: string[];
    new_business_practices?: string[];
    updated_compliance?: string[];
  };
}

/**
 * Agent performance analytics with Opal metrics
 */
export interface EnhancedAgentPerformance {
  agent_id: string;
  agent_type: AgentType;
  reporting_period: {
    start_date: Date;
    end_date: Date;
  };
  
  // Basic performance metrics
  basic_metrics: AgentPerformanceMetrics;
  
  // Opal-specific metrics
  opal_metrics: {
    total_workflows_executed: number;
    successful_workflow_executions: number;
    average_workflow_execution_time: number;
    most_used_workflows: string[];
    workflow_success_rate: number;
    total_workflow_cost: number;
    average_workflow_cost: number;
  };
  
  // Economic metrics
  economic_metrics: {
    total_transactions: number;
    successful_transactions: number;
    total_volume_transacted: number;
    average_transaction_value: number;
    transaction_success_rate: number;
    wallet_balance_history: Array<{
      date: Date;
      balance: number;
      change_amount: number;
    }>;
  };
  
  // Cultural adaptation metrics
  cultural_metrics: {
    language_usage_distribution: Record<string, number>;
    regional_effectiveness_score: number;
    cultural_compliance_rate: number;
    user_satisfaction_by_region: Record<string, number>;
  };
  
  // Learning and evolution metrics
  evolution_metrics: {
    experience_gained: number;
    level_progress: number;
    new_skills_acquired: string[];
    personality_evolution_score: number;
    adaptation_rate: number;
  };
  
  // Collaboration metrics
  collaboration_metrics: {
    total_collaborations: number;
    successful_collaborations: number;
    collaboration_partners: string[];
    average_collaboration_duration: number;
    collaboration_success_rate: number;
  };
}

/**
 * Agent collaboration configuration
 */
export interface AgentCollaborationConfig {
  primary_agent_id: string;
  collaboration_type: 'workflow_execution' | 'data_sharing' | 'joint_analysis' | 'mentorship';
  
  // Collaboration partners
  partners: Array<{
    agent_id: string;
    agent_type: AgentType;
    role_in_collaboration: string;
    permissions: string[];
  }>;
  
  // Collaboration workflow
  workflow_config: {
    shared_workflows: string[];
    execution_order: string[];
    data_flow: Array<{
      from_agent: string;
      to_agent: string;
      data_type: string;
      frequency: 'real_time' | 'batch' | 'on_demand';
    }>;
  };
  
  // Security and access control
  security_config: {
    data_encryption: boolean;
    access_logging: boolean;
    permission_levels: string[];
    audit_frequency: 'real_time' | 'daily' | 'weekly';
  };
  
  // Collaboration goals
  objectives: Array<{
    description: string;
    success_metrics: string[];
    deadline?: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

/**
 * Agent learning and adaptation configuration
 */
export interface AgentLearningConfig {
  agent_id: string;
  learning_mode: 'supervised' | 'unsupervised' | 'reinforcement' | 'hybrid';
  
  // Learning objectives
  objectives: Array<{
    skill: string;
    current_level: number;
    target_level: number;
    learning_method: string;
    practice_scenarios: string[];
  }>;
  
  // Data sources for learning
  data_sources: {
    user_interactions: boolean;
    workflow_executions: boolean;
    collaboration_sessions: boolean;
    external_datasets: string[];
    feedback_loops: string[];
  };
  
  // Adaptation parameters
  adaptation_config: {
    adaptation_rate: number;
    max_personality_change: number;
    cultural_adaptation_threshold: number;
    performance_improvement_target: number;
  };
  
  // Safety and constraints
  safety_constraints: {
    max_learning_hours_per_day: number;
    prohibited_learning_areas: string[];
    human_override_required: boolean;
    ethical_guidelines: string[];
  };
}

/**
 * Agent deployment configuration
 */
export interface AgentDeploymentConfig {
  agent_config: EnhancedAgentConfig;
  deployment_environment: 'development' | 'staging' | 'production';
  
  // Infrastructure configuration
  infrastructure: {
    compute_resources: {
      cpu_cores: number;
      memory_gb: number;
      storage_gb: number;
      gpu_required: boolean;
    };
    network_config: {
      bandwidth_mbps: number;
      latency_requirement_ms: number;
      ssl_enabled: boolean;
      custom_domains?: string[];
    };
    monitoring: {
      metrics_collection: boolean;
      log_level: 'debug' | 'info' | 'warn' | 'error';
      alert_channels: string[];
      health_check_interval_seconds: number;
    };
  };
  
  // Integration endpoints
  endpoints: {
    api_base_url: string;
    webhook_endpoint: string;
    websocket_endpoint: string;
    file_storage_endpoint: string;
    database_connection_string: string;
  };
  
  // Security configuration
  security: {
    authentication_method: 'api_key' | 'oauth' | 'jwt' | 'certificate';
    encryption_keys: string[];
    firewall_rules: string[];
    access_control_lists: string[];
    audit_log_retention_days: number;
  };
  
  // Scaling configuration
  scaling: {
    auto_scaling_enabled: boolean;
    min_instances: number;
    max_instances: number;
    scaling_triggers: string[];
    load_balancer_config: any;
  };
}

/**
 * Agent backup and restore configuration
 */
export interface AgentBackupConfig {
  agent_id: string;
  backup_type: 'full' | 'incremental' | 'differential';
  
  // Backup content
  include_config: boolean;
  include_wallet_data: boolean;
  include_workflow_templates: boolean;
  include_performance_data: boolean;
  include_learning_data: boolean;
  
  // Backup schedule
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    retention_days: number;
    backup_location: string;
    encryption_enabled: boolean;
  };
  
  // Restore configuration
  restore_config: {
    allow_partial_restore: boolean;
    validate_before_restore: boolean;
    rollback_on_failure: boolean;
    notification_channels: string[];
  };
}

/**
 * Type guards and utilities
 */
export function isEnhancedAgentConfig(obj: any): obj is EnhancedAgentConfig {
  return obj &&
    typeof obj.agent_name === 'string' &&
    typeof obj.agent_type === 'string' &&
    typeof obj.core_frequency === 'string' &&
    obj.opal_config &&
    obj.wallet &&
    obj.cultural_context &&
    obj.model_config &&
    obj.primary_model &&
    obj.bilingual_config &&
    obj.model_selection_criteria &&
    obj.regional_preferences &&
    Array.isArray(obj.regional_preferences);
}

export function isValidAgentType(type: string): type is AgentType {
  return Object.values(AgentType).includes(type as AgentType);
}

export function createDefaultEnhancedAgent(
  name: string,
  agentType: AgentType,
  frequency: string = '432Hz'
): Partial<EnhancedAgentConfig> {
  // Get default model configuration based on agent type
  const defaultModelConfig = DEFAULT_MODEL_CONFIGS[agentType];
  
  return {
    agent_name: name,
    agent_type: agentType,
    core_frequency: frequency,
    system_prompt: `You are ${name}, an AI agent specializing in ${agentType} operations.`,
    welcome_message: `Hello! I'm ${name}, your ${agentType} assistant.`,
    voice_config: {
      voice_id: 'default',
      speed: 1.0,
      style: 'professional',
      language_support: ['en', 'ar'] // Support bilingual by default
    },
    evolution: {
      stage: 'genesis',
      level: 1,
      experience: 0,
      traits: [],
      skills: []
    },
    identity_state: 'active',
    cultural_context: {
      language: 'en',
      region: 'Global',
      business_practices: [],
      compliance_requirements: [],
      timezone: 'UTC',
      currency_preference: ['USD']
    },
    // Model configuration integration
    model_config: defaultModelConfig,
    primary_model: defaultModelConfig.primary_model,
    bilingual_config: defaultModelConfig.bilingual_config,
    model_selection_criteria: {
      agent_type: agentType,
      language: 'bilingual',
      region: 'Global',
      task_complexity: 'medium',
      performance_priority: 'quality',
      compliance_requirements: [],
      cultural_sensitivity: true
    },
    regional_preferences: defaultModelConfig.regional_preferences,
    performance_metrics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      totalCost: 0,
      efficiency: 0,
      reliability: 0,
      availability: 100
    },
    personality_profile: {
      frequency_band: '3Hz',
      traits: [],
      communication_style: 'analytical',
      decision_making: 'logical',
      learning_style: 'multimodal'
    },
    capabilities: {
      economic_operations: true,
      workflow_execution: true,
      ai_analysis: true,
      data_processing: true,
      communication: true,
      learning: true,
      collaboration: true
    },
    security_config: {
      encryption_level: 'standard',
      data_retention_days: 30,
      audit_logging: true,
      access_controls: [],
      privacy_mode: false
    },
    metadata: {
      version: '2.0.0',
      created_at: new Date(),
      updated_at: new Date(),
      deployment_environment: 'development',
      tags: [],
      category: 'general'
    }
  };
}

// Export all types and utilities
// Note: Types are already exported via interface declarations above