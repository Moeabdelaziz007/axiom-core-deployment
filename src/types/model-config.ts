/**
 * 🔷 MODEL CONFIGURATION INTERFACES
 * 
 * Configuration interfaces for MENA-specific AI models
 * Supports Jais-30B, ALLaM, and bilingual capabilities
 * 
 * @author Axiom Core Team
 * @version 2.0.0
 */

import { AgentType } from '../lib/ai-engine';

/**
 * Supported AI model types
 */
export enum ModelType {
  GEMINI = 'gemini-2.0-flash-exp',
  GEMINI_PRO = 'gemini-1.5-pro',
  JAIS_30B = 'jais-30b',
  ALLAM = 'allam',
  GEMINI_1_5_FLASH = 'gemini-1.5-flash'
}

/**
 * Quantization configuration for Jais model
 */
export interface QuantizationConfig {
  enabled: boolean;
  bits: 4 | 8 | 16; // 4-bit, 8-bit, or 16-bit quantization
  method: 'gptq' | 'awq' | 'bitsandbytes'; // Quantization method
  device: 'cpu' | 'cuda' | 'mps'; // Device for quantized inference
  memory_optimization: boolean;
}

/**
 * Jais model specific configuration
 */
export interface JaisModelConfig {
  model: ModelType.JAIS_30B;
  quantization: QuantizationConfig;
  arabic_optimized: boolean;
  context_length: number;
  temperature: number;
  top_p: number;
  max_tokens: number;
  timeout_ms: number;
  endpoint?: string; // Custom endpoint for Jais deployment
  api_key?: string; // API key for Jais service
}

/**
 * ALLaM model specific configuration
 */
export interface AllamModelConfig {
  model: ModelType.ALLAM;
  saudi_compliance: boolean;
  government_certified: boolean;
  arabic_primary: boolean;
  english_secondary: boolean;
  context_length: number;
  temperature: number;
  top_p: number;
  max_tokens: number;
  timeout_ms: number;
  endpoint?: string; // Custom endpoint for ALLaM service
  api_key?: string; // API key for ALLaM service
}

/**
 * Gemini model configuration
 */
export interface GeminiModelConfig {
  model: ModelType.GEMINI | ModelType.GEMINI_PRO | ModelType.GEMINI_1_5_FLASH;
  context_length: number;
  temperature: number;
  top_p: number;
  max_tokens: number;
  timeout_ms: number;
  api_key: string;
  vision_enabled?: boolean;
  grounding_enabled?: boolean;
}

/**
 * Bilingual capability configuration
 */
export interface BilingualConfig {
  arabic_enabled: boolean;
  english_enabled: boolean;
  primary_language: 'ar' | 'en';
  secondary_language?: 'ar' | 'en';
  auto_detect_language: boolean;
  rtl_support: boolean;
  cultural_context_awareness: boolean;
}

/**
 * Model selection criteria
 */
export interface ModelSelectionCriteria {
  agent_type: AgentType;
  language: 'ar' | 'en' | 'bilingual';
  region: string;
  task_complexity: 'low' | 'medium' | 'high';
  performance_priority: 'speed' | 'quality' | 'cost';
  compliance_requirements: string[];
  cultural_sensitivity: boolean;
}

/**
 * Unified model configuration
 */
export type ModelConfig = JaisModelConfig | AllamModelConfig | GeminiModelConfig;

/**
 * Model performance metrics
 */
export interface ModelPerformanceMetrics {
  model: ModelType;
  average_response_time_ms: number;
  success_rate: number;
  error_rate: number;
  token_usage: number;
  cost_per_request: number;
  language_accuracy: {
    ar: number;
    en: number;
  };
  cultural_compliance_score: number;
}

/**
 * Model timeout configuration
 */
export interface ModelTimeoutConfig {
  default_timeout_ms: number;
  heavy_load_timeout_ms: number;
  arabic_processing_timeout_ms: number;
  bilingual_operation_timeout_ms: number;
  fallback_timeout_ms: number;
}

/**
 * Regional model preferences
 */
export interface RegionalModelPreferences {
  region: string;
  preferred_models: ModelType[];
  fallback_models: ModelType[];
  compliance_models: ModelType[];
  cultural_adaptation_models: ModelType[];
}

/**
 * Model switching logic configuration
 */
export interface ModelSwitchingConfig {
  enabled: boolean;
  auto_switch_on_error: boolean;
  auto_switch_on_timeout: boolean;
  language_based_switching: boolean;
  region_based_switching: boolean;
  performance_based_switching: boolean;
  switch_threshold: {
    error_rate: number;
    timeout_rate: number;
    response_time_ms: number;
  };
}

/**
 * Complete model management configuration
 */
export interface ModelManagementConfig {
  primary_model: ModelConfig;
  fallback_models: ModelConfig[];
  bilingual_config: BilingualConfig;
  timeout_config: ModelTimeoutConfig;
  switching_config: ModelSwitchingConfig;
  regional_preferences: RegionalModelPreferences[];
  performance_metrics: ModelPerformanceMetrics[];
  logging_enabled: boolean;
  monitoring_enabled: boolean;
}

/**
 * Default configurations for different agent types
 */
export const DEFAULT_MODEL_CONFIGS: Record<AgentType, ModelManagementConfig> = {
  [AgentType.TAJER]: {
    primary_model: {
      model: ModelType.JAIS_30B,
      quantization: {
        enabled: true,
        bits: 4,
        method: 'gptq',
        device: 'cuda',
        memory_optimization: true
      },
      arabic_optimized: true,
      context_length: 8192,
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 4096,
      timeout_ms: 30000
    },
    fallback_models: [],
    bilingual_config: {
      arabic_enabled: true,
      english_enabled: true,
      primary_language: 'ar',
      secondary_language: 'en',
      auto_detect_language: true,
      rtl_support: true,
      cultural_context_awareness: true
    },
    timeout_config: {
      default_timeout_ms: 30000,
      heavy_load_timeout_ms: 60000,
      arabic_processing_timeout_ms: 45000,
      bilingual_operation_timeout_ms: 60000,
      fallback_timeout_ms: 15000
    },
    switching_config: {
      enabled: true,
      auto_switch_on_error: true,
      auto_switch_on_timeout: true,
      language_based_switching: true,
      region_based_switching: true,
      performance_based_switching: true,
      switch_threshold: {
        error_rate: 0.1,
        timeout_rate: 0.05,
        response_time_ms: 5000
      }
    },
    regional_preferences: [],
    performance_metrics: [],
    logging_enabled: true,
    monitoring_enabled: true
  },
  [AgentType.MUSAFIR]: {
    primary_model: {
      model: ModelType.JAIS_30B,
      quantization: {
        enabled: true,
        bits: 4,
        method: 'gptq',
        device: 'cuda',
        memory_optimization: true
      },
      arabic_optimized: true,
      context_length: 8192,
      temperature: 0.4,
      top_p: 0.9,
      max_tokens: 4096,
      timeout_ms: 30000
    },
    fallback_models: [],
    bilingual_config: {
      arabic_enabled: true,
      english_enabled: true,
      primary_language: 'ar',
      secondary_language: 'en',
      auto_detect_language: true,
      rtl_support: true,
      cultural_context_awareness: true
    },
    timeout_config: {
      default_timeout_ms: 30000,
      heavy_load_timeout_ms: 60000,
      arabic_processing_timeout_ms: 45000,
      bilingual_operation_timeout_ms: 60000,
      fallback_timeout_ms: 15000
    },
    switching_config: {
      enabled: true,
      auto_switch_on_error: true,
      auto_switch_on_timeout: true,
      language_based_switching: true,
      region_based_switching: true,
      performance_based_switching: true,
      switch_threshold: {
        error_rate: 0.1,
        timeout_rate: 0.05,
        response_time_ms: 5000
      }
    },
    regional_preferences: [],
    performance_metrics: [],
    logging_enabled: true,
    monitoring_enabled: true
  },
  [AgentType.SOFRA]: {
    primary_model: {
      model: ModelType.JAIS_30B,
      quantization: {
        enabled: true,
        bits: 4,
        method: 'gptq',
        device: 'cuda',
        memory_optimization: true
      },
      arabic_optimized: true,
      context_length: 8192,
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 4096,
      timeout_ms: 30000
    },
    fallback_models: [],
    bilingual_config: {
      arabic_enabled: true,
      english_enabled: true,
      primary_language: 'ar',
      secondary_language: 'en',
      auto_detect_language: true,
      rtl_support: true,
      cultural_context_awareness: true
    },
    timeout_config: {
      default_timeout_ms: 30000,
      heavy_load_timeout_ms: 60000,
      arabic_processing_timeout_ms: 45000,
      bilingual_operation_timeout_ms: 60000,
      fallback_timeout_ms: 15000
    },
    switching_config: {
      enabled: true,
      auto_switch_on_error: true,
      auto_switch_on_timeout: true,
      language_based_switching: true,
      region_based_switching: true,
      performance_based_switching: true,
      switch_threshold: {
        error_rate: 0.1,
        timeout_rate: 0.05,
        response_time_ms: 5000
      }
    },
    regional_preferences: [],
    performance_metrics: [],
    logging_enabled: true,
    monitoring_enabled: true
  },
  [AgentType.MOSTASHAR]: {
    primary_model: {
      model: ModelType.ALLAM,
      saudi_compliance: true,
      government_certified: true,
      arabic_primary: true,
      english_secondary: true,
      context_length: 8192,
      temperature: 0.2,
      top_p: 0.8,
      max_tokens: 4096,
      timeout_ms: 45000
    },
    fallback_models: [],
    bilingual_config: {
      arabic_enabled: true,
      english_enabled: true,
      primary_language: 'ar',
      secondary_language: 'en',
      auto_detect_language: true,
      rtl_support: true,
      cultural_context_awareness: true
    },
    timeout_config: {
      default_timeout_ms: 45000,
      heavy_load_timeout_ms: 90000,
      arabic_processing_timeout_ms: 60000,
      bilingual_operation_timeout_ms: 90000,
      fallback_timeout_ms: 20000
    },
    switching_config: {
      enabled: true,
      auto_switch_on_error: true,
      auto_switch_on_timeout: true,
      language_based_switching: true,
      region_based_switching: true,
      performance_based_switching: true,
      switch_threshold: {
        error_rate: 0.05,
        timeout_rate: 0.03,
        response_time_ms: 7000
      }
    },
    regional_preferences: [],
    performance_metrics: [],
    logging_enabled: true,
    monitoring_enabled: true
  }
};

/**
 * Regional model preferences for MENA
 */
export const REGIONAL_MODEL_PREFERENCES: RegionalModelPreferences[] = [
  {
    region: 'Saudi Arabia',
    preferred_models: [ModelType.ALLAM, ModelType.JAIS_30B],
    fallback_models: [ModelType.GEMINI_PRO, ModelType.GEMINI],
    compliance_models: [ModelType.ALLAM],
    cultural_adaptation_models: [ModelType.JAIS_30B, ModelType.ALLAM]
  },
  {
    region: 'UAE',
    preferred_models: [ModelType.JAIS_30B, ModelType.GEMINI_PRO],
    fallback_models: [ModelType.GEMINI, ModelType.ALLAM],
    compliance_models: [ModelType.JAIS_30B],
    cultural_adaptation_models: [ModelType.JAIS_30B, ModelType.ALLAM]
  },
  {
    region: 'Egypt',
    preferred_models: [ModelType.JAIS_30B, ModelType.GEMINI_PRO],
    fallback_models: [ModelType.GEMINI, ModelType.ALLAM],
    compliance_models: [ModelType.JAIS_30B],
    cultural_adaptation_models: [ModelType.JAIS_30B]
  },
  {
    region: 'Qatar',
    preferred_models: [ModelType.JAIS_30B, ModelType.ALLAM],
    fallback_models: [ModelType.GEMINI_PRO, ModelType.GEMINI],
    compliance_models: [ModelType.JAIS_30B, ModelType.ALLAM],
    cultural_adaptation_models: [ModelType.JAIS_30B, ModelType.ALLAM]
  }
];

// Export all types and configurations
export type {
  ModelConfig,
  ModelSelectionCriteria,
  ModelPerformanceMetrics,
  ModelTimeoutConfig,
  RegionalModelPreferences,
  ModelSwitchingConfig,
  ModelManagementConfig,
  BilingualConfig,
  JaisModelConfig,
  AllamModelConfig,
  GeminiModelConfig,
  QuantizationConfig
};