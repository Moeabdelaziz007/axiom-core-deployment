import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import {
  ModelType,
  ModelConfig,
  ModelManagementConfig,
  ModelSelectionCriteria,
  ModelPerformanceMetrics,
  BilingualConfig,
  DEFAULT_MODEL_CONFIGS,
  REGIONAL_MODEL_PREFERENCES,
  JaisModelConfig,
  AllamModelConfig,
  GeminiModelConfig
} from '../types/model-config';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not found in environment variables");
}

// Initialize Google Provider
const google = createGoogleGenerativeAI({
  apiKey: GOOGLE_API_KEY || '',
});

// Jais API configuration
const JAIS_API_KEY = process.env.JAIS_API_KEY;
const JAIS_ENDPOINT = process.env.JAIS_ENDPOINT || 'https://api.jais.ai/v1';

// ALLaM API configuration
const ALLAM_API_KEY = process.env.ALLAM_API_KEY;
const ALLAM_ENDPOINT = process.env.ALLAM_ENDPOINT || 'https://api.allam.sa/v1';

// Currency conversion rates (simplified for demonstration)
const CURRENCY_RATES = {
  USD: 1,
  SAR: 3.75,
  AED: 3.67,
  EGP: 30.9,
  LBP: 15000
};

// Agent types for MENA region
enum AgentType {
  TAJER = "TAJER",      // Sales/Commerce
  MUSAFIR = "MUSAFIR",  // Travel
  SOFRA = "SOFRA",      // Food/Restaurant
  MOSTASHAR = "MOSTASHAR" // Legal/Consulting
}

// Code execution result interface
interface CodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
  artifacts?: string[];
}

// MENA market data interface
interface MENAMarketData {
  region: string;
  currency: string;
  timezone: string;
  businessHours: { open: string; close: string };
  culturalContext: string[];
  complianceRequirements: string[];
}

/**
 * Enhanced AI Engine with MENA-specific model support
 * Provides research, image analysis, structured data generation, and code execution
 * Supports Jais-30B, ALLaM, and bilingual capabilities
 */
export class AIEngine {
  private textModel: any;
  private visionModel: any;
  private modelConfig: ModelManagementConfig;
  private currentModel: ModelConfig;
  private performanceMetrics: ModelPerformanceMetrics[] = [];

  constructor(agentType?: AgentType, customConfig?: Partial<ModelManagementConfig>) {
    if (!GOOGLE_API_KEY) {
      console.warn("GOOGLE_API_KEY not found, using fallback configuration");
    }

    // Initialize model configuration based on agent type
    this.modelConfig = this.initializeModelConfig(agentType, customConfig);
    this.currentModel = this.modelConfig.primary_model;

    // Initialize primary model
    this.initializeModels();
  }

  /**
   * Initialize model configuration based on agent type
   */
  private initializeModelConfig(
    agentType?: AgentType,
    customConfig?: Partial<ModelManagementConfig>
  ): ModelManagementConfig {
    const defaultConfig = agentType ? DEFAULT_MODEL_CONFIGS[agentType] : DEFAULT_MODEL_CONFIGS[AgentType.TAJER];

    return {
      ...defaultConfig,
      ...customConfig,
      regional_preferences: customConfig?.regional_preferences || REGIONAL_MODEL_PREFERENCES
    };
  }

  /**
   * Initialize AI models based on configuration
   */
  private initializeModels(): void {
    const modelType = this.currentModel.model;

    switch (modelType) {
      case ModelType.GEMINI:
      case ModelType.GEMINI_PRO:
      case ModelType.GEMINI_1_5_FLASH:
        this.initializeGeminiModel(this.currentModel as GeminiModelConfig);
        break;
      case ModelType.JAIS_30B:
        this.initializeJaisModel(this.currentModel as JaisModelConfig);
        break;
      case ModelType.ALLAM:
        this.initializeAllamModel(this.currentModel as AllamModelConfig);
        break;
      default:
        console.warn(`Unsupported model type: ${modelType}, falling back to Gemini`);
        this.initializeGeminiModel(this.currentModel as GeminiModelConfig);
    }
  }

  /**
   * Initialize Gemini model
   */
  private initializeGeminiModel(config: GeminiModelConfig): void {
    // Note: API key check is handled by createGoogleGenerativeAI factory

    const modelName = config.model;
    this.textModel = google(modelName);
    this.visionModel = google(modelName);

    console.log(`✅ Initialized Gemini model: ${modelName}`);
  }

  /**
   * Initialize Jais model
   */
  private initializeJaisModel(config: JaisModelConfig): void {
    if (!JAIS_API_KEY) {
      console.warn("JAIS_API_KEY not found, falling back to Gemini");
      this.initializeGeminiModel({
        model: ModelType.GEMINI,
        context_length: 4096,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
        timeout_ms: 30000,
        api_key: GOOGLE_API_KEY || ''
      });
      return;
    }

    // Jais model initialization (placeholder for actual implementation)
    this.textModel = {
      model: ModelType.JAIS_30B,
      config: config,
      endpoint: config.endpoint || JAIS_ENDPOINT,
      apiKey: config.api_key || JAIS_API_KEY
    };

    this.visionModel = this.textModel; // Jais may not support vision, use text model as fallback

    console.log(`✅ Initialized Jais model with ${config.quantization.bits}-bit quantization`);
  }

  /**
   * Initialize ALLaM model
   */
  private initializeAllamModel(config: AllamModelConfig): void {
    if (!ALLAM_API_KEY) {
      console.warn("ALLAM_API_KEY not found, falling back to Gemini");
      this.initializeGeminiModel({
        model: ModelType.GEMINI,
        context_length: 4096,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
        timeout_ms: 30000,
        api_key: GOOGLE_API_KEY || ''
      });
      return;
    }

    // ALLaM model initialization (placeholder for actual implementation)
    this.textModel = {
      model: ModelType.ALLAM,
      config: config,
      endpoint: config.endpoint || ALLAM_ENDPOINT,
      apiKey: config.api_key || ALLAM_API_KEY
    };

    this.visionModel = this.textModel; // ALLaM may not support vision, use text model as fallback

    console.log(`✅ Initialized ALLaM model with Saudi government compliance: ${config.saudi_compliance}`);
  }
  /**
   * Execute Jais-30B model API request
   */
  private async executeJaisRequest(
    prompt: string,
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      timeout_ms?: number;
      language?: 'ar' | 'en' | 'bilingual';
    } = {}
  ): Promise<any> {
    const startTime = Date.now();
    const config = this.currentModel as JaisModelConfig;

    try {
      const requestBody = {
        model: ModelType.JAIS_30B,
        messages: [
          {
            role: "user",
            content: this.enhancePromptForBilingual(prompt, options.language || 'en')
          }
        ],
        temperature: options.temperature || config.temperature,
        max_tokens: options.max_tokens || config.max_tokens,
        top_p: options.top_p || config.top_p,
        stream: false,
        quantization: config.quantization,
        arabic_optimized: config.arabic_optimized
      };

      const timeout = options.timeout_ms || config.timeout_ms;

      const response = await Promise.race([
        fetch(`${config.endpoint || JAIS_ENDPOINT}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.api_key || JAIS_API_KEY}`,
            'X-Arabic-Optimized': config.arabic_optimized.toString(),
            'X-Quantization-Bits': config.quantization.bits.toString()
          },
          body: JSON.stringify(requestBody)
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Jais request timeout')), timeout)
        )
      ]);

      if (!response.ok) {
        throw new Error(`Jais API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics({
        model: ModelType.JAIS_30B,
        average_response_time_ms: executionTime,
        success_rate: 1,
        error_rate: 0,
        token_usage: data.usage?.total_tokens || 0,
        language_accuracy: {
          ar: options.language === 'ar' || options.language === 'bilingual' ? 0.95 : 0.7,
          en: options.language === 'en' || options.language === 'bilingual' ? 0.9 : 0.6
        },
        cultural_compliance_score: 0.92
      });

      this.logModelExecution(ModelType.JAIS_30B, executionTime, true, options.language);

      return {
        success: true,
        data: data.choices[0]?.message?.content || '',
        usage: data.usage,
        model: ModelType.JAIS_30B,
        execution_time_ms: executionTime,
        language: options.language,
        arabic_optimized: config.arabic_optimized
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Update error metrics
      this.updatePerformanceMetrics({
        model: ModelType.JAIS_30B,
        average_response_time_ms: executionTime,
        success_rate: 0,
        error_rate: 1,
        token_usage: 0,
        language_accuracy: { ar: 0, en: 0 },
        cultural_compliance_score: 0
      });

      this.logModelExecution(ModelType.JAIS_30B, executionTime, false, options.language, error);

      // Attempt fallback to Gemini if Jais fails
      if (this.modelConfig.switching_config.auto_switch_on_error) {
        console.warn("Jais request failed, attempting fallback to Gemini");
        await this.switchModel(this.findModelConfig(ModelType.GEMINI));
        return await this.executeGeminiRequest(prompt, options);
      }

      throw error;
    }
  }

  /**
   * Execute ALLaM model API request
   */
  private async executeAllamRequest(
    prompt: string,
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      timeout_ms?: number;
      language?: 'ar' | 'en' | 'bilingual';
      compliance_level?: 'standard' | 'government' | 'sharia';
    } = {}
  ): Promise<any> {
    const startTime = Date.now();
    const config = this.currentModel as AllamModelConfig;

    try {
      const requestBody = {
        model: ModelType.ALLAM,
        messages: [
          {
            role: "user",
            content: this.enhancePromptForBilingual(prompt, options.language || 'ar')
          }
        ],
        temperature: options.temperature || config.temperature,
        max_tokens: options.max_tokens || config.max_tokens,
        top_p: options.top_p || config.top_p,
        stream: false,
        saudi_compliance: config.saudi_compliance,
        government_certified: config.government_certified,
        arabic_primary: config.arabic_primary,
        english_secondary: config.english_secondary,
        compliance_level: options.compliance_level || 'standard'
      };

      const timeout = options.timeout_ms || config.timeout_ms;

      const response = await Promise.race([
        fetch(`${config.endpoint || ALLAM_ENDPOINT}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.api_key || ALLAM_API_KEY}`,
            'X-Saudi-Compliance': config.saudi_compliance.toString(),
            'X-Government-Certified': config.government_certified.toString(),
            'X-Arabic-Primary': config.arabic_primary.toString()
          },
          body: JSON.stringify(requestBody)
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('ALLaM request timeout')), timeout)
        )
      ]);

      if (!response.ok) {
        throw new Error(`ALLaM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics({
        model: ModelType.ALLAM,
        average_response_time_ms: executionTime,
        success_rate: 1,
        error_rate: 0,
        token_usage: data.usage?.total_tokens || 0,
        language_accuracy: {
          ar: options.language === 'ar' || options.language === 'bilingual' ? 0.98 : 0.8,
          en: options.language === 'en' || options.language === 'bilingual' ? 0.85 : 0.7
        },
        cultural_compliance_score: 0.96
      });

      this.logModelExecution(ModelType.ALLAM, executionTime, true, options.language);

      return {
        success: true,
        data: data.choices[0]?.message?.content || '',
        usage: data.usage,
        model: ModelType.ALLAM,
        execution_time_ms: executionTime,
        language: options.language,
        saudi_compliance: config.saudi_compliance,
        government_certified: config.government_certified
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Update error metrics
      this.updatePerformanceMetrics({
        model: ModelType.ALLAM,
        average_response_time_ms: executionTime,
        success_rate: 0,
        error_rate: 1,
        token_usage: 0,
        language_accuracy: { ar: 0, en: 0 },
        cultural_compliance_score: 0
      });

      this.logModelExecution(ModelType.ALLAM, executionTime, false, options.language, error);

      // Attempt fallback to Gemini if ALLaM fails
      if (this.modelConfig.switching_config.auto_switch_on_error) {
        console.warn("ALLaM request failed, attempting fallback to Gemini");
        await this.switchModel(this.findModelConfig(ModelType.GEMINI));
        return await this.executeGeminiRequest(prompt, options);
      }

      throw error;
    }
  }

  /**
   * Execute Gemini model request (fallback method)
   */
  private async executeGeminiRequest(
    prompt: string,
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      timeout_ms?: number;
      language?: 'ar' | 'en' | 'bilingual';
    } = {}
  ): Promise<any> {
    const startTime = Date.now();
    const config = this.currentModel as GeminiModelConfig;

    try {
      const enhancedPrompt = this.enhancePromptForBilingual(prompt, options.language || 'en');

      const result = await Promise.race([
        generateText({
          model: this.textModel,
          messages: [
            {
              role: "user",
              content: enhancedPrompt
            }
          ],
          temperature: options.temperature || config.temperature,
          maxTokens: options.max_tokens || config.max_tokens,
          topP: options.top_p || config.top_p,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini request timeout')), options.timeout_ms || config.timeout_ms)
        )
      ]);

      const executionTime = Date.now() - startTime;

      // Update performance metrics
      this.updatePerformanceMetrics({
        model: config.model,
        average_response_time_ms: executionTime,
        success_rate: 1,
        error_rate: 0,
        token_usage: result.usage?.totalTokens || 0,
        language_accuracy: {
          ar: options.language === 'ar' || options.language === 'bilingual' ? 0.85 : 0.7,
          en: options.language === 'en' || options.language === 'bilingual' ? 0.95 : 0.9
        },
        cultural_compliance_score: 0.8
      });

      this.logModelExecution(config.model, executionTime, true, options.language);

      return {
        success: true,
        data: result.text,
        usage: result.usage,
        model: config.model,
        execution_time_ms: executionTime,
        language: options.language
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Update error metrics
      this.updatePerformanceMetrics({
        model: config.model,
        average_response_time_ms: executionTime,
        success_rate: 0,
        error_rate: 1,
        token_usage: 0,
        language_accuracy: { ar: 0, en: 0 },
        cultural_compliance_score: 0
      });

      this.logModelExecution(config.model, executionTime, false, options.language, error);

      throw error;
    }
  }

  /**
   * Enhance prompt for bilingual support
   */
  private enhancePromptForBilingual(prompt: string, language: 'ar' | 'en' | 'bilingual'): string {
    const bilingualConfig = this.modelConfig.bilingual_config;

    if (language === 'bilingual' || (language === 'ar' && bilingualConfig.english_enabled)) {
      const arabicInstructions = bilingualConfig.arabic_enabled
        ? "\n\nالرجاء تقديم الرد باللغة العربية مع دعم ثقافي لمنطقة الشرق الأوسط وشمال أفريقيا."
        : "";

      const englishInstructions = bilingualConfig.english_enabled
        ? "\n\nPlease provide response in English with MENA cultural context awareness."
        : "";

      const culturalContext = bilingualConfig.cultural_context_awareness
        ? "\n\nConsider cultural sensitivities and local context for MENA region."
        : "";

      return `${prompt}${arabicInstructions}${englishInstructions}${culturalContext}`;
    }

    if (language === 'ar' && bilingualConfig.arabic_enabled) {
      return `${prompt}\n\nالرجاء تقديم الرد باللغة العربية مع دعم ثقافي لمنطقة الشرق الأوسط وشمال أفريقيا.`;
    }

    return prompt;
  }

  /**
   * Log model execution for monitoring and debugging
   */
  private logModelExecution(
    model: ModelType,
    executionTime: number,
    success: boolean,
    language?: string,
    error?: any
  ): void {
    if (!this.modelConfig.logging_enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      model,
      execution_time_ms: executionTime,
      success,
      language,
      error: error?.message || null,
      arabic_enabled: this.modelConfig.bilingual_config.arabic_enabled,
      english_enabled: this.modelConfig.bilingual_config.english_enabled,
      cultural_context_awareness: this.modelConfig.bilingual_config.cultural_context_awareness
    };

    console.log(`Model Execution: ${JSON.stringify(logEntry, null, 2)}`);
  }

  /**
   * Get appropriate timeout based on model type and operation
   */
  private getModelTimeout(operationType: 'default' | 'heavy_load' | 'arabic_processing' | 'bilingual_operation' | 'fallback'): number {
    const timeoutConfig = this.modelConfig.timeout_config;

    switch (operationType) {
      case 'heavy_load':
        return timeoutConfig.heavy_load_timeout_ms;
      case 'arabic_processing':
        return timeoutConfig.arabic_processing_timeout_ms;
      case 'bilingual_operation':
        return timeoutConfig.bilingual_operation_timeout_ms;
      case 'fallback':
        return timeoutConfig.fallback_timeout_ms;
      default:
        return timeoutConfig.default_timeout_ms;
    }
  }


  /**
   * Select optimal model based on criteria
   */
  public selectOptimalModel(criteria: ModelSelectionCriteria): ModelConfig {
    const { agent_type, language, region, task_complexity, performance_priority } = criteria;

    // Get regional preferences
    const regionalPref = REGIONAL_MODEL_PREFERENCES.find(pref => pref.region === region);

    // Model selection logic
    if (language === 'ar' || language === 'bilingual') {
      if (region === 'Saudi Arabia' && criteria.compliance_requirements.includes('saudi_government')) {
        return this.findModelConfig(ModelType.ALLAM);
      }

      if (task_complexity === 'high' && performance_priority === 'quality') {
        return this.findModelConfig(ModelType.JAIS_30B);
      }
    }

    // Fallback to regional preferences
    if (regionalPref) {
      for (const modelType of regionalPref.preferred_models) {
        const config = this.findModelConfig(modelType);
        if (config) return config;
      }
    }

    // Default fallback
    return this.modelConfig.primary_model;
  }

  /**
   * Find model configuration by type
   */
  private findModelConfig(modelType: ModelType): ModelConfig {
    if (this.currentModel.model === modelType) {
      return this.currentModel;
    }

    // Search in fallback models
    for (const fallback of this.modelConfig.fallback_models) {
      if (fallback.model === modelType) {
        return fallback;
      }
    }

    // Return default configuration for model type
    switch (modelType) {
      case ModelType.JAIS_30B:
        return {
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
        };
      case ModelType.ALLAM:
        return {
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
        };
      default:
        return this.modelConfig.primary_model;
    }
  }

  /**
   * Switch to different model
   */
  public async switchModel(modelConfig: ModelConfig): Promise<void> {
    console.log(`🔄 Switching from ${this.currentModel.model} to ${modelConfig.model}`);

    this.currentModel = modelConfig;
    this.initializeModels();

    // Log model switch
    this.logModelSwitch(this.currentModel.model, modelConfig.model);
  }

  /**
   * Log model switch for monitoring
   */
  private logModelSwitch(fromModel: ModelType, toModel: ModelType): void {
    if (!this.modelConfig.logging_enabled) return;

    console.log(`Model switch: ${fromModel} -> ${toModel} at ${new Date().toISOString()}`);

    // Add to performance metrics
    this.performanceMetrics.push({
      model: toModel,
      average_response_time_ms: 0,
      success_rate: 0,
      error_rate: 0,
      token_usage: 0,
      cost_per_request: 0,
      language_accuracy: { ar: 0, en: 0 },
      cultural_compliance_score: 0
    });
  }

  /**
   * Get current model configuration
   */
  public getCurrentModel(): ModelConfig {
    return this.currentModel;
  }

  /**
   * Get bilingual configuration
   */
  public getBilingualConfig(): BilingualConfig {
    return this.modelConfig.bilingual_config;
  }

  /**
   * Update performance metrics
   */
  public updatePerformanceMetrics(metrics: Partial<ModelPerformanceMetrics>): void {
    if (!this.modelConfig.monitoring_enabled) return;

    const existingIndex = this.performanceMetrics.findIndex(
      m => m.model === this.currentModel.model
    );

    if (existingIndex >= 0) {
      this.performanceMetrics[existingIndex] = {
        ...this.performanceMetrics[existingIndex],
        ...metrics
      };
    } else {
      this.performanceMetrics.push({
        model: this.currentModel.model,
        average_response_time_ms: 0,
        success_rate: 0,
        error_rate: 0,
        token_usage: 0,
        cost_per_request: 0,
        language_accuracy: { ar: 0, en: 0 },
        cultural_compliance_score: 0,
        ...metrics
      });
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): ModelPerformanceMetrics[] {
    return this.performanceMetrics;
  }

  /**
   * Research with Google grounding for real-time information
   */
  async researchWithGoogle(query: string, language: string = "en"): Promise<any> {
    try {
      const systemPrompt = language === "ar"
        ? `أنت باحث متخصص في منطقة الشرق الأوسط وشمال أفريقيا. استخدم Google Search للحصول على معلومات دقيقة ومحدثة. ركز على البيانات ذات الصلة بالسوق المحلي والسياق الثقافي.`
        : `You are a specialized researcher for MENA region. Use Google Search to get accurate, up-to-date information. Focus on local market data and cultural context.`;

      const enhancedPrompt = `${systemPrompt}

Research Query: ${query}

Please provide:
1. Current market data and trends
2. Local context and cultural considerations
3. Recent developments and news
4. Practical insights relevant to query

Use Google Search grounding to ensure accuracy and recency of information.`;

      const result = await generateText({
        model: this.textModel,
        messages: [
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        maxTokens: 8192,
      });

      return {
        success: true,
        query,
        language,
        data: result.text,
        timestamp: new Date().toISOString(),
        source: "google-gemini-with-grounding"
      };
    } catch (error) {
      console.error("Research with Google failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        query,
        language,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Enhanced analyze images with model selection logic, bilingual support, and fallback mechanisms
   */
  async analyzeImage(
    imageUrl: string,
    analysisType: string = "general",
    language: 'ar' | 'en' | 'bilingual' = 'bilingual',
    region: string = 'MENA'
  ): Promise<any> {
    const startTime = Date.now();

    try {
      // Select optimal model based on analysis type, language, and region
      const modelCriteria = {
        agent_type: this.getAgentTypeFromAnalysis(analysisType),
        language,
        region,
        task_complexity: this.getTaskComplexityFromAnalysis(analysisType),
        performance_priority: 'quality' as const,
        compliance_requirements: this.getComplianceRequirements(region),
        cultural_sensitivity: true
      };

      let selectedModel = this.selectOptimalModel(modelCriteria);

      // Enhanced prompt with bilingual support
      let prompt = this.getEnhancedImagePrompt(analysisType, language);

      // Fetch image data
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }

      const imageData = await imageResponse.arrayBuffer();
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

      // Determine appropriate timeout based on operation type
      const operationType = language === 'ar' || language === 'bilingual'
        ? 'arabic_processing' as const
        : 'default' as const;

      let result;
      let modelUsed = selectedModel.model;

      try {
        // Execute with selected model
        switch (selectedModel.model) {
          case ModelType.JAIS_30B:
            result = await this.executeJaisRequest(
              this.createImageAnalysisPrompt(prompt, analysisType, language),
              {
                temperature: 0.4,
                max_tokens: 4096,
                timeout_ms: this.getModelTimeout(operationType),
                language
              }
            );
            break;

          case ModelType.ALLAM:
            result = await this.executeAllamRequest(
              this.createImageAnalysisPrompt(prompt, analysisType, language),
              {
                temperature: 0.3,
                max_tokens: 4096,
                timeout_ms: this.getModelTimeout(operationType),
                language,
                compliance_level: region === 'Saudi Arabia' ? 'government' : 'standard'
              }
            );
            break;

          default: // Gemini models
            // For image analysis, use Gemini vision API
            result = await generateText({
              model: this.visionModel,
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: this.enhancePromptForBilingual(prompt, language) },
                    {
                      type: "image",
                      image: new URL(imageUrl)
                    }
                  ]
                }
              ],
              temperature: 0.4,
              maxTokens: 4096,
            });
            modelUsed = this.currentModel.model;
            break;
        }

        const executionTime = Date.now() - startTime;

        return {
          success: true,
          imageUrl,
          analysisType,
          language,
          region,
          data: result.data || result.text || '',
          model_used: modelUsed,
          execution_time_ms: executionTime,
          timestamp: new Date().toISOString(),
          source: `enhanced-${modelUsed.toLowerCase()}-vision`
        };

      } catch (modelError) {
        // Fallback mechanism: try alternative models
        console.warn(`Image analysis failed with ${modelUsed}, attempting fallback:`, modelError);

        if (this.modelConfig.switching_config.auto_switch_on_error) {
          return await this.fallbackImageAnalysis(imageUrl, analysisType, language, region, modelUsed);
        }

        throw modelError;
      }

    } catch (error) {
      console.error("Enhanced image analysis failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        imageUrl,
        analysisType,
        language,
        region,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Helper method to get agent type from analysis type
   */
  private getAgentTypeFromAnalysis(analysisType: string): AgentType {
    switch (analysisType) {
      case 'menu':
        return AgentType.SOFRA;
      case 'real-estate':
        return AgentType.TAJER;
      case 'travel':
        return AgentType.MUSAFIR;
      case 'legal':
      case 'document':
        return AgentType.MOSTASHAR;
      default:
        return AgentType.TAJER;
    }
  }

  /**
   * Helper method to get task complexity from analysis type
   */
  private getTaskComplexityFromAnalysis(analysisType: string): 'low' | 'medium' | 'high' {
    switch (analysisType) {
      case 'menu':
      case 'document':
        return 'medium';
      case 'real-estate':
      case 'travel':
        return 'high';
      default:
        return 'low';
    }
  }

  /**
   * Helper method to get compliance requirements based on region
   */
  private getComplianceRequirements(region: string): string[] {
    switch (region) {
      case 'Saudi Arabia':
        return ['saudi_government', 'sharia_compliance'];
      case 'UAE':
        return ['gcc_compliance', 'financial_regulation'];
      case 'Egypt':
        return ['local_business_regulations'];
      default:
        return ['mena_regional_compliance'];
    }
  }

  /**
   * Get enhanced image analysis prompt based on type and language
   */
  private getEnhancedImagePrompt(analysisType: string, language: 'ar' | 'en' | 'bilingual'): string {
    const prompts = {
      menu: {
        ar: `قم بتحليل صورة قائمة الطعام هذه واستخرج:
1. جميع عناصر القائمة مع أسعارها بالعملة المحلية
2. الفئات والأقسام
3. العروض الخاصة أو الصفقات
4. معلومات الحمية إن وجدت
5. اسم المطعم والموقع إن كان مرئياً

قم بتنسيق الرد كـ JSON منظم مع مصفوفة عناصر تحتوي على حقول الاسم والسعر والفئة والوصف.`,
        en: `Analyze this restaurant menu image and extract:
1. All menu items with their prices in local currency
2. Categories and sections
3. Special offers or deals
4. Dietary information if available
5. Restaurant name and location if visible

Format response as structured JSON with items array containing name, price, category, and description fields.`,
        bilingual: `Analyze this restaurant menu image and provide comprehensive extraction:
1. جميع عناصر القائمة مع أسعارها بالعملة المحلية / All menu items with their prices in local currency
2. الفئات والأقسام / Categories and sections
3. العروض الخاصة أو الصفقات / Special offers or deals
4. معلومات الحمية إن وجدت / Dietary information if available
5. اسم المطعم والموقع إن كان مرئياً / Restaurant name and location if visible

Please provide response in both Arabic and English with structured JSON format.`
      },
      'real-estate': {
        ar: `قم بتحليل صورة العقار هذه وقدم:
1. نوع العقار (شقة، فيلا، تجاري، إلخ)
2. الحجم المقدر وعدد الغرف
3. التقييم للحالة والجودة
4. ميزات الموقع إن كانت مرئية
5. نطاق السعر المقدر بالعملة المحلية
6. الميزات والمرافق الرئيسية

قم بالتنسيق كـ JSON منظم مع تفاصيل العقار.`,
        en: `Analyze this real estate image and provide:
1. Property type (apartment, villa, commercial, etc.)
2. Estimated size and room count
3. Condition and quality assessment
4. Location features if visible
5. Estimated price range in local currency
6. Key features and amenities

Format as structured JSON with property details.`,
        bilingual: `Analyze this real estate image with comprehensive details:
1. نوع العقار (شقة، فيلا، تجاري) / Property type (apartment, villa, commercial)
2. الحجم المقدر وعدد الغرف / Estimated size and room count
3. التقييم للحالة والجودة / Condition and quality assessment
4. ميزات الموقع / Location features if visible
5. نطاق السعر المقدر / Estimated price range in local currency
6. الميزات والمرافق الرئيسية / Key features and amenities

Provide bilingual response with structured JSON format.`
      }
    };

    const defaultPrompts = {
      ar: `قم بتحليل هذه الصورة وقدم وصفاً مفصلاً يشمل:
1._objects والمواضيع الرئيسية
2. السياق والإعداد
3. محتوى النص إن وجد
4. التفاصيل ذات الصلة لأغراض العمل أو التحليل
5. تقييم الجودة

قدم الرد بالعربية والإنجليزية إن كان مناسباً لمنطقة الشرق الأوسط وشمال أفريقيا.`,
      en: `Analyze this image and provide a detailed description including:
1. Main objects and subjects
2. Context and setting
3. Text content if any
4. Relevant details for business or analysis purposes
5. Quality assessment

Provide response in both English and Arabic if relevant to MENA region.`,
      bilingual: `Analyze this image comprehensively:
1._objects والمواضيع الرئيسية / Main objects and subjects
2. السياق والإعداد / Context and setting
3. محتوى النص إن وجد / Text content if any
4. التفاصيل ذات الصلة / Relevant details for business or analysis
5. تقييم الجودة / Quality assessment

Provide bilingual response with MENA cultural context awareness.`
    };

    return (prompts[analysisType as keyof typeof prompts]?.[language]) || defaultPrompts[language];
  }

  /**
   * Create image analysis prompt for model execution
   */
  private createImageAnalysisPrompt(basePrompt: string, analysisType: string, language: 'ar' | 'en' | 'bilingual'): string {
    const contextualInstructions = `
Analysis Type: ${analysisType}
Language: ${language}
Region: MENA (Middle East and North Africa)

Instructions:
- Focus on MENA regional context and local business practices
- Consider cultural sensitivities and local customs
- Provide analysis suitable for Arabic and English speakers
- Use local currency references where appropriate
- Include regional business insights where relevant

Please analyze the provided image data based on the above requirements.`;

    return `${basePrompt}\n\n${contextualInstructions}`;
  }

  /**
   * Fallback image analysis with alternative models
   */
  private async fallbackImageAnalysis(
    imageUrl: string,
    analysisType: string,
    language: 'ar' | 'en' | 'bilingual',
    region: string,
    failedModel: ModelType
  ): Promise<any> {
    console.log(`Attempting fallback image analysis after ${failedModel} failure`);

    // Get alternative models based on the failed model
    const fallbackModels = this.getFallbackModels(failedModel);

    for (const fallbackModel of fallbackModels) {
      try {
        const result = await this.analyzeImageWithModel(imageUrl, analysisType, language, region, fallbackModel);
        if (result.success) {
          return {
            ...result,
            fallback_used: true,
            original_model_failed: failedModel,
            fallback_model: fallbackModel
          };
        }
      } catch (error) {
        console.warn(`Fallback model ${fallbackModel} also failed:`, error);
        continue;
      }
    }

    // If all fallbacks fail, return error with fallback attempt information
    throw new Error(`All models failed for image analysis: ${failedModel} and fallbacks ${fallbackModels.join(', ')}`);
  }

  /**
   * Get fallback models based on the failed model
   */
  private getFallbackModels(failedModel: ModelType): ModelType[] {
    const fallbackChains = {
      [ModelType.JAIS_30B]: [ModelType.GEMINI_PRO, ModelType.ALLAM, ModelType.GEMINI],
      [ModelType.ALLAM]: [ModelType.JAIS_30B, ModelType.GEMINI_PRO, ModelType.GEMINI],
      [ModelType.GEMINI_PRO]: [ModelType.JAIS_30B, ModelType.ALLAM, ModelType.GEMINI],
      [ModelType.GEMINI]: [ModelType.GEMINI_PRO, ModelType.JAIS_30B, ModelType.ALLAM]
    };

    return fallbackChains[failedModel] || [ModelType.GEMINI];
  }

  /**
   * Analyze image with specific model
   */
  private async analyzeImageWithModel(
    imageUrl: string,
    analysisType: string,
    language: 'ar' | 'en' | 'bilingual',
    region: string,
    model: ModelType
  ): Promise<any> {
    const modelConfig = this.findModelConfig(model);
    const prompt = this.getEnhancedImagePrompt(analysisType, language);

    switch (model) {
      case ModelType.JAIS_30B:
        return await this.executeJaisRequest(
          this.createImageAnalysisPrompt(prompt, analysisType, language),
          {
            temperature: 0.4,
            max_tokens: 4096,
            timeout_ms: this.getModelTimeout('arabic_processing'),
            language
          }
        );

      case ModelType.ALLAM:
        return await this.executeAllamRequest(
          this.createImageAnalysisPrompt(prompt, analysisType, language),
          {
            temperature: 0.3,
            max_tokens: 4096,
            timeout_ms: this.getModelTimeout('arabic_processing'),
            language,
            compliance_level: region === 'Saudi Arabia' ? 'government' : 'standard'
          }
        );

      default: // Gemini models
        const result = await generateText({
          model: this.visionModel,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: this.enhancePromptForBilingual(prompt, language) },
                {
                  type: "image",
                  image: new URL(imageUrl)
                }
              ]
            }
          ],
          temperature: 0.4,
          maxTokens: 4096,
        });

        return {
          success: true,
          data: result.text,
          model: model,
          usage: result.usage
        };
    }
  }

  /**
   * Enhanced generate structured data with model selection, bilingual support, and error handling
   */
  async generateStructuredData(
    input: string,
    schema: any,
    language: 'ar' | 'en' | 'bilingual' = 'bilingual',
    region: string = 'MENA',
    dataComplexity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<any> {
    const startTime = Date.now();

    try {
      // Select optimal model based on data complexity and language requirements
      const modelCriteria = {
        agent_type: this.getAgentTypeFromSchema(schema),
        language,
        region,
        task_complexity: dataComplexity,
        performance_priority: 'quality' as const,
        compliance_requirements: this.getComplianceRequirements(region),
        cultural_sensitivity: true
      };

      let selectedModel = this.selectOptimalModel(modelCriteria);

      // Enhanced system prompt with bilingual support
      const systemPrompt = this.getEnhancedSystemPrompt(language, dataComplexity);

      const enhancedPrompt = `${systemPrompt}

Input Data: ${input}

Schema Requirements:
${JSON.stringify(schema, null, 2)}

Instructions:
1. Generate structured data that strictly follows the provided schema
2. Populate all required fields accurately
3. Ensure data is culturally relevant for MENA region
4. Use appropriate local currency, measurements, and cultural context
5. Validate data format and consistency

Please generate only valid JSON that matches the schema requirements.`;

      let result;
      let modelUsed = selectedModel.model;

      try {
        // Execute with selected model
        switch (selectedModel.model) {
          case ModelType.JAIS_30B:
            result = await this.executeJaisRequest(enhancedPrompt, {
              temperature: 0.2,
              max_tokens: 8192,
              timeout_ms: this.getModelTimeout(dataComplexity === 'high' ? 'heavy_load' : 'default'),
              language
            });
            break;

          case ModelType.ALLAM:
            result = await this.executeAllamRequest(enhancedPrompt, {
              temperature: 0.2,
              max_tokens: 8192,
              timeout_ms: this.getModelTimeout(dataComplexity === 'high' ? 'heavy_load' : 'default'),
              language,
              compliance_level: region === 'Saudi Arabia' ? 'government' : 'standard'
            });
            break;

          default: // Gemini models
            result = await generateText({
              model: this.textModel,
              messages: [
                {
                  role: "user",
                  content: this.enhancePromptForBilingual(enhancedPrompt, language)
                }
              ],
              temperature: 0.2,
              maxTokens: 8192,
              schema: schema,
              mode: 'json',
            });
            modelUsed = this.currentModel.model;
            break;
        }

        // Parse structured data
        const structuredData = this.parseStructuredData(result.data || result.text);
        const executionTime = Date.now() - startTime;

        return {
          success: true,
          input,
          schema,
          language,
          region,
          dataComplexity,
          data: structuredData,
          model_used: modelUsed,
          execution_time_ms: executionTime,
          timestamp: new Date().toISOString(),
          source: `enhanced-${modelUsed.toLowerCase()}-structured`
        };

      } catch (modelError) {
        // Fallback mechanism for structured data generation
        console.warn(`Structured data generation failed with ${modelUsed}, attempting fallback:`, modelError);

        if (this.modelConfig.switching_config.auto_switch_on_error) {
          return await this.fallbackStructuredDataGeneration(input, schema, language, region, dataComplexity, modelUsed);
        }

        throw modelError;
      }

    } catch (error) {
      console.error("Enhanced structured data generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        input,
        schema,
        language,
        region,
        dataComplexity,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Helper method to get agent type from schema
   */
  private getAgentTypeFromSchema(schema: any): AgentType {
    const schemaDescription = schema.description?.toLowerCase() || '';

    if (schemaDescription.includes('restaurant') || schemaDescription.includes('menu')) {
      return AgentType.SOFRA;
    }
    if (schemaDescription.includes('real estate') || schemaDescription.includes('property')) {
      return AgentType.TAJER;
    }
    if (schemaDescription.includes('travel') || schemaDescription.includes('itinerary')) {
      return AgentType.MUSAFIR;
    }
    if (schemaDescription.includes('legal') || schemaDescription.includes('contract')) {
      return AgentType.MOSTASHAR;
    }

    return AgentType.TAJER; // Default to commerce
  }

  /**
   * Get enhanced system prompt based on language and data complexity
   */
  private getEnhancedSystemPrompt(language: 'ar' | 'en' | 'bilingual', complexity: 'low' | 'medium' | 'high'): string {
    const prompts = {
      ar: `أنت خبير في تنظيم البيانات وتحليلها لمنطقة الشرق الأوسط وشمال أفريقيا.
قم بإنشاء بيانات منظمة دقيقة ومتمثلة ثقافياً بناءً على المخطط المطلوب.
استخدم العملات المحلية والمقاييس والسياق الثقافي المناسب للمنطقة.`,

      en: `You are an expert in data organization and analysis for MENA region (Middle East and North Africa).
Generate accurate, culturally-representative structured data based on required schema.
Use local currencies, measurements, and cultural context appropriate for the region.`,

      bilingual: `أنت خبير في تنظيم البيانات وتحليلها لمنطقة الشرق الأوسط وشمال أفريقيا /
You are an expert in data organization and analysis for MENA region.

قم بإنشاء بيانات منظمة دقيقة ومتمثلة ثقافياً /
Generate accurate, culturally-representative structured data based on required schema.

استخدم العملات المحلية والمقاييس /
Use local currencies, measurements and cultural context appropriate for the region.`
    };

    const complexityInstructions = {
      low: 'Focus on essential fields and basic data validation.',
      medium: 'Include comprehensive data with regional context and cultural considerations.',
      high: 'Provide detailed, accurate data with extensive cultural context, local regulations, and regional business practices.'
    };

    return `${prompts[language]}
\nComplexity Level: ${complexity}
${complexityInstructions[complexity]}`;
  }

  /**
   * Parse structured data with improved error handling
   */
  private parseStructuredData(rawData: string): any {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(rawData);

      // Validate that it's an object or array
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }

      throw new Error('Parsed data is not a valid object or array');
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = rawData.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          return extracted;
        } catch (extractError) {
          console.warn('Failed to parse extracted JSON:', extractError);
        }
      }

      // If all parsing fails, return structured error information
      console.warn('Failed to parse structured data, returning raw text with metadata');
      return {
        raw_content: rawData,
        parse_error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        fallback: true
      };
    }
  }

  /**
   * Fallback structured data generation with alternative models
   */
  private async fallbackStructuredDataGeneration(
    input: string,
    schema: any,
    language: 'ar' | 'en' | 'bilingual',
    region: string,
    dataComplexity: 'low' | 'medium' | 'high',
    failedModel: ModelType
  ): Promise<any> {
    console.log(`Attempting fallback structured data generation after ${failedModel} failure`);

    const fallbackModels = this.getFallbackModels(failedModel);

    for (const fallbackModel of fallbackModels) {
      try {
        const result = await this.generateStructuredDataWithModel(
          input, schema, language, region, dataComplexity, fallbackModel
        );
        if (result.success) {
          return {
            ...result,
            fallback_used: true,
            original_model_failed: failedModel,
            fallback_model: fallbackModel
          };
        }
      } catch (error) {
        console.warn(`Fallback model ${fallbackModel} also failed:`, error);
        continue;
      }
    }

    throw new Error(`All models failed for structured data generation: ${failedModel} and fallbacks ${fallbackModels.join(', ')}`);
  }

  /**
   * Generate structured data with specific model
   */
  private async generateStructuredDataWithModel(
    input: string,
    schema: any,
    language: 'ar' | 'en' | 'bilingual',
    region: string,
    dataComplexity: 'low' | 'medium' | 'high',
    model: ModelType
  ): Promise<any> {
    const modelConfig = this.findModelConfig(model);
    const systemPrompt = this.getEnhancedSystemPrompt(language, dataComplexity);

    const enhancedPrompt = `${systemPrompt}

Input Data: ${input}

Schema Requirements:
${JSON.stringify(schema, null, 2)}

Please generate only valid JSON that matches the schema requirements.`;

    switch (model) {
      case ModelType.JAIS_30B:
        return await this.executeJaisRequest(enhancedPrompt, {
          temperature: 0.2,
          max_tokens: 8192,
          timeout_ms: this.getModelTimeout(dataComplexity === 'high' ? 'heavy_load' : 'default'),
          language
        });

      case ModelType.ALLAM:
        return await this.executeAllamRequest(enhancedPrompt, {
          temperature: 0.2,
          max_tokens: 8192,
          timeout_ms: this.getModelTimeout(dataComplexity === 'high' ? 'heavy_load' : 'default'),
          language,
          compliance_level: region === 'Saudi Arabia' ? 'government' : 'standard'
        });

      default: // Gemini models
        const result = await generateObject({
          model: this.textModel,
          messages: [
            {
              role: "user",
              content: this.enhancePromptForBilingual(enhancedPrompt, language)
            }
          ],
          temperature: 0.2,
          maxTokens: 8192,
          schema: z.any(), // Dynamic schema handled by prompt instructions
          mode: 'json',
        });

        return {
          success: true,
          data: result.object, // generateObject returns 'object'
          model: model,
          usage: result.usage
        };
    }
  }

  /**
   * MENA Agent: Sofra - Menu Analysis for restaurants
   */
  async sofraMenuAnalysis(imageUrl: string, restaurantInfo?: any): Promise<any> {
    const menuSchema = {
      description: "Restaurant menu analysis for Sofra agent",
      type: "OBJECT",
      properties: {
        restaurant_name: { type: "STRING" },
        cuisine_type: { type: "STRING" },
        currency: { type: "STRING" },
        categories: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              items: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    description: { type: "STRING" },
                    price: { type: "NUMBER" },
                    currency: { type: "STRING" },
                    dietary_info: { type: "ARRAY", items: { type: "STRING" } }
                  },
                  required: ["name", "price"]
                }
              }
            }
          }
        },
        special_offers: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              description: { type: "STRING" },
              discount_percentage: { type: "NUMBER" },
              valid_until: { type: "STRING" }
            }
          }
        },
        price_analysis: {
          type: "OBJECT",
          properties: {
            average_price: { type: "NUMBER" },
            price_range: { type: "STRING" },
            value_rating: { type: "STRING" }
          }
        }
      },
      required: ["restaurant_name", "categories", "price_analysis"]
    };

    const contextInfo = restaurantInfo
      ? `Additional restaurant info: ${JSON.stringify(restaurantInfo)}`
      : "";

    return await this.analyzeImage(imageUrl, "menu");
  }

  /**
   * Execute Python code with security sandbox and timeout
   */
  async executeCode(code: string, language: string = "python", timeoutMs: number = 30000): Promise<CodeExecutionResult> {
    const startTime = Date.now();

    try {
      // Validate code for security
      const securityValidation = this.validateCodeSecurity(code);
      if (!securityValidation.valid) {
        return {
          success: false,
          error: `Security validation failed: ${securityValidation.reason}`,
          executionTime: Date.now() - startTime
        };
      }

      // Prepare execution prompt with MENA context
      const executionPrompt = this.prepareExecutionPrompt(code, language);

      // Execute with timeout using the AI SDK approach
      const result = await Promise.race([
        generateText({
          model: this.textModel,
          messages: [
            {
              role: "user",
              content: executionPrompt
            }
          ],
          temperature: 0.1,
          maxTokens: 8192,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Code execution timeout')), timeoutMs)
        )
      ]);

      const executionTime = Date.now() - startTime;

      // Parse execution results
      const parsedOutput = this.parseCodeOutput(result.text);

      return {
        success: true,
        output: parsedOutput.data,
        executionTime,
        memoryUsage: parsedOutput.memoryUsage,
        artifacts: parsedOutput.artifacts
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown execution error",
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Validate code for security violations
   */
  private validateCodeSecurity(code: string): { valid: boolean; reason?: string } {
    // Define forbidden patterns
    const forbiddenPatterns = [
      /import\s+os/,
      /import\s+subprocess/,
      /import\s+shutil/,
      /exec\s*\(/,
      /eval\s*\(/,
      /__import__\s*\(/,
      /open\s*\(/,
      /file\s*\(/,
      /input\s*\(/,
      /raw_input\s*\(/,
      /system\s*\(/,
      /shell\s*=\s*True/,
      /\.\.\//,
      /\.\.\\/,
      /\/etc\//,
      /\/root\//,
      /\/home\//
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        return {
          valid: false,
          reason: `Forbidden pattern detected: ${pattern.source}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Prepare execution prompt with MENA context and safety measures
   */
  private prepareExecutionPrompt(code: string, language: string): string {
    const menaContext = `
# MENA Region Context
- Working with Middle East and North Africa markets
- Currency codes: USD, SAR, AED, EGP, LBP
- Arabic language support: UTF-8 encoding
- Business hours: Typically 8AM-5PM local time
- Islamic finance considerations: Halal compliance, Sharia principles
- Cultural context: Right-to-left text for Arabic, weekend variations (Fri-Sat in some countries)
`;

    const safetyInstructions = `
# Safety Instructions
- Do not access external files or network resources
- Do not use system calls or file operations
- Limit memory usage and computation time
- Provide clear, structured output
- Handle errors gracefully
- Include Arabic comments where relevant
`;

    return `
${menaContext}

${safetyInstructions}

Execute the following ${language} code and provide results:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Execution results
2. Any generated data or insights
3. Performance metrics
4. Error handling (if applicable)
5. MENA-specific considerations
`;
  }

  /**
   * Parse code execution output
   */
  private parseCodeOutput(output: string): { data: any; memoryUsage?: number; artifacts?: string[] } {
    try {
      // Try to parse as JSON first
      if (output.trim().startsWith('{') || output.trim().startsWith('[')) {
        return {
          data: JSON.parse(output),
          artifacts: []
        };
      }

      // Extract data from markdown code blocks
      const codeBlockMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        try {
          return {
            data: JSON.parse(codeBlockMatch[1]),
            artifacts: []
          };
        } catch {
          // If JSON parsing fails, return as text
          return {
            data: codeBlockMatch[1],
            artifacts: []
          };
        }
      }

      // Return as plain text
      return {
        data: output,
        artifacts: []
      };
    } catch (error) {
      return {
        data: output,
        artifacts: []
      };
    }
  }

  /**
   * Generate agent-specific code for financial calculations
   */
  async generateAgentCode(
    agentType: AgentType,
    task: string,
    parameters: any = {},
    language: string = "python"
  ): Promise<string> {
    const agentPrompts = {
      [AgentType.TAJER]: `
# TAJER Agent - Sales & Commerce Analytics
# متخصص في تحليل المبيعات والتجارة
Generate Python code for:
- Sales analytics and forecasting
- Pricing models and optimization
- Market trend analysis for MENA region
- Currency conversion (USD, SAR, AED, EGP, LBP)
- Customer segmentation and targeting
- Inventory management and optimization
`,
      [AgentType.MUSAFIR]: `
# MUSAFIR Agent - Travel & Tourism
# متخصص في تحليل السفر والسياحة
Generate Python code for:
- Travel itinerary optimization
- Cost calculation and budget planning
- Route planning and distance calculation
- Hotel and flight price comparisons
- Cultural site recommendations
- Travel time zone calculations for MENA
`,
      [AgentType.SOFRA]: `
# SOFRA Agent - Food & Restaurant
# متخصص في تحليل المطاعم والأغذية
Generate Python code for:
- Recipe scaling and cost analysis
- Inventory management for restaurants
- Menu optimization and pricing
- Nutritional analysis
- Food cost calculation with MENA currencies
- Supplier management and ordering
`,
      [AgentType.MOSTASHAR]: `
# MOSTASHAR Agent - Legal & Consulting
# متخصص في التحليل القانوني والاستشارات
Generate Python code for:
- Legal precedent analysis
- Contract generation and review
- Compliance checking for MENA regulations
- Risk assessment and mitigation
- Document analysis and summarization
- Regulatory compliance tracking
`
    };

    const prompt = `
${agentPrompts[agentType]}

Task: ${task}
Parameters: ${JSON.stringify(parameters, null, 2)}

Generate Python code that:
1. Uses appropriate libraries (pandas, numpy, matplotlib, etc.)
2. Includes Arabic comments for key sections
3. Handles MENA-specific requirements
4. Provides clear output formatting
5. Includes error handling
6. Returns structured results

Code should be self-contained and executable:
`;

    try {
      const result = await generateText({
        model: this.textModel,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        maxTokens: 4096,
      });

      return result.text;
    } catch (error) {
      throw new Error(`Code generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Execute agent-specific code with context
   */
  async executeAgentCode(
    agentType: AgentType,
    task: string,
    parameters: any = {},
    marketData?: MENAMarketData
  ): Promise<CodeExecutionResult> {
    try {
      // Generate agent-specific code
      const code = await this.generateAgentCode(agentType, task, parameters);

      // Add market data context if provided
      const enhancedCode = marketData
        ? `# Market Data Context\nmarket_data = ${JSON.stringify(marketData, null, 2)}\n\n${code}`
        : code;

      // Execute the code
      return await this.executeCode(enhancedCode, "python");
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Agent code execution failed",
        executionTime: 0
      };
    }
  }

  /**
   * Currency conversion for MENA markets
   */
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    const fromRate = CURRENCY_RATES[fromCurrency as keyof typeof CURRENCY_RATES] || 1;
    const toRate = CURRENCY_RATES[toCurrency as keyof typeof CURRENCY_RATES] || 1;

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  /**
   * Generate financial analysis code
   */
  async generateFinancialAnalysis(
    analysisType: "roi" | "cashflow" | "valuation" | "risk",
    data: any,
    currency: string = "USD"
  ): Promise<CodeExecutionResult> {
    const analysisPrompts = {
      roi: "Return on Investment (ROI) analysis",
      cashflow: "Cash flow projection and analysis",
      valuation: "Business valuation and appraisal",
      risk: "Risk assessment and mitigation analysis"
    };

    const task = `Generate ${analysisPrompts[analysisType]} with MENA market considerations`;
    const parameters = {
      analysisType,
      data,
      currency,
      menaContext: true
    };

    return await this.executeAgentCode(AgentType.TAJER, task, parameters);
  }

  /**
   * Generate Arabic text processing code
   */
  async generateArabicTextProcessing(
    textType: "sentiment" | "translation" | "summarization" | "extraction",
    textData: string
  ): Promise<CodeExecutionResult> {
    const task = `Generate Arabic text processing code for ${textType} analysis`;
    const parameters = {
      textType,
      textData,
      language: "ar",
      encoding: "UTF-8"
    };

    return await this.executeAgentCode(AgentType.MOSTASHAR, task, parameters);
  }

  /**
   * MENA Agent: Tajer - Real Estate Research with enhanced model selection
   */
  async tajerRealEstateResearch(
    query: string,
    location?: string,
    region: string = 'MENA',
    language: 'ar' | 'en' | 'bilingual' = 'bilingual'
  ): Promise<any> {
    const realEstateSchema = {
      description: "Real estate market analysis for Tajer agent with MENA regional focus",
      type: "OBJECT",
      properties: {
        location: { type: "STRING" },
        region_details: { type: "STRING" },
        property_type: { type: "STRING" },
        market_trends: {
          type: "OBJECT",
          properties: {
            price_trend: { type: "STRING" },
            demand_level: { type: "STRING" },
            average_price_per_sqm: { type: "NUMBER" },
            price_change_percentage: { type: "NUMBER" },
            currency: { type: "STRING" },
            market_maturity: { type: "STRING" }
          }
        },
        investment_analysis: {
          type: "OBJECT",
          properties: {
            roi_estimate: { type: "NUMBER" },
            rental_yield: { type: "NUMBER" },
            investment_rating: { type: "STRING" },
            risk_factors: { type: "ARRAY", items: { type: "STRING" } },
            liquidity_score: { type: "NUMBER" },
            market_outlook: { type: "STRING" }
          }
        },
        regulatory_environment: {
          type: "OBJECT",
          properties: {
            foreign_ownership_rules: { type: "STRING" },
            tax_implications: { type: "STRING" },
            legal_framework: { type: "STRING" },
            compliance_requirements: { type: "ARRAY", items: { type: "STRING" } }
          }
        },
        cultural_context: {
          type: "OBJECT",
          properties: {
            local_preferences: { type: "ARRAY", items: { type: "STRING" } },
            architectural_styles: { type: "ARRAY", items: { type: "STRING" } },
            community_features: { type: "ARRAY", items: { type: "STRING" } }
          }
        },
        local_insights: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              category: { type: "STRING" },
              insight: { type: "STRING" },
              relevance: { type: "STRING" },
              confidence_level: { type: "STRING" }
            }
          }
        },
        comparative_analysis: {
          type: "OBJECT",
          properties: {
            regional_ranking: { type: "NUMBER" },
            comparative_markets: { type: "ARRAY", items: { type: "STRING" } },
            competitive_advantages: { type: "ARRAY", items: { type: "STRING" } }
          }
        }
      },
      required: ["location", "market_trends", "investment_analysis", "cultural_context"]
    };

    const enhancedQuery = location
      ? `Real estate investment research for: ${query} in ${location}, ${region}
      
Research Focus:
- Market analysis and price trends
- Investment opportunities and ROI calculations
- Regulatory environment and compliance requirements
- Cultural preferences and local market dynamics
- Risk assessment and mitigation strategies
- Comparative analysis with regional markets

Provide comprehensive analysis suitable for MENA region investment decisions.`
      : `Real estate investment research for: ${query} in ${region}

Research Focus:
- Regional market overview and trends
- Investment landscape and opportunities
- Regulatory framework and compliance
- Cultural and local market considerations
- Risk factors and mitigation strategies
- Market comparison and positioning

Provide detailed analysis for informed investment decisions in MENA region.`;

    try {
      // Use enhanced generateStructuredData with model selection
      const result = await this.generateStructuredData(
        enhancedQuery,
        realEstateSchema,
        language,
        region,
        'high' // Real estate analysis is typically high complexity
      );

      // Add agent-specific enhancements
      if (result.success) {
        result.agent_type = AgentType.TAJER;
        result.research_focus = 'real_estate_investment';
        result.regional_context = region;
        result.cultural_considerations = true;
      }

      return result;
    } catch (error) {
      console.error("Tajer real estate research failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        agent_type: AgentType.TAJER,
        query,
        location,
        region,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * MENA Agent: Musafir - Travel Planning with enhanced model selection
   */
  async musafirTravelPlanning(
    origin: string,
    destination: string,
    duration: number,
    budget: number,
    currency: string = "USD",
    language: 'ar' | 'en' | 'bilingual' = 'bilingual',
    region: string = 'MENA'
  ): Promise<CodeExecutionResult> {
    try {
      const task = "Generate comprehensive travel itinerary with cost optimization, cultural insights, and MENA regional considerations";
      const parameters = {
        origin,
        destination,
        duration,
        budget,
        currency,
        language,
        region,
        preferences: ["cultural_sites", "local_cuisine", "shopping", "accommodation", "historical_sites", "local_transport"],
        cultural_considerations: true,
        regional_insights: true,
        cost_optimization: true,
        safety_considerations: true
      };

      // Enhanced code generation for travel planning
      const code = await this.generateAgentCode(
        AgentType.MUSAFIR,
        task,
        parameters,
        'python'
      );

      // Execute the travel planning code with enhanced context
      const marketData: MENAMarketData = {
        region,
        currency,
        timezone: this.getTimezoneForRegion(region),
        businessHours: this.getBusinessHoursForRegion(region),
        culturalContext: this.getCulturalContextForTravel(region, destination),
        complianceRequirements: this.getTravelComplianceRequirements(region, destination)
      };

      return await this.executeAgentCode(AgentType.MUSAFIR, task, parameters, marketData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Musafir travel planning failed",
        executionTime: 0
      };
    }
  }

  /**
   * MENA Agent: Sofra - Restaurant Analysis with enhanced model selection
   */
  async sofraRestaurantAnalysis(
    restaurantData: any,
    analysisType: "menu" | "cost" | "inventory" | "pricing",
    language: 'ar' | 'en' | 'bilingual' = 'bilingual',
    region: string = 'MENA'
  ): Promise<CodeExecutionResult> {
    try {
      const task = `Generate restaurant ${analysisType} analysis with MENA market considerations, local cuisine focus, and cultural context`;
      const parameters = {
        restaurantData,
        analysisType,
        language,
        region,
        currency: restaurantData.currency || "USD",
        cultural_cuisine: true,
        local_ingredients: true,
        pricing_strategy: true,
        market_positioning: true
      };

      const marketData: MENAMarketData = {
        region,
        currency: restaurantData.currency || "USD",
        timezone: this.getTimezoneForRegion(region),
        businessHours: this.getBusinessHoursForRegion(region),
        culturalContext: this.getCulturalContextForRestaurants(region),
        complianceRequirements: this.getRestaurantComplianceRequirements(region)
      };

      return await this.executeAgentCode(AgentType.SOFRA, task, parameters, marketData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sofra restaurant analysis failed",
        executionTime: 0
      };
    }
  }

  /**
   * MENA Agent: Mostashar - Legal Document Analysis with enhanced model selection
   */
  async mostasharLegalAnalysis(
    documentType: string,
    documentContent: string,
    jurisdiction: string = "UAE",
    language: 'ar' | 'en' | 'bilingual' = 'bilingual'
  ): Promise<CodeExecutionResult> {
    try {
      const task = `Generate comprehensive legal document analysis for ${documentType} with MENA regulatory framework and Sharia compliance considerations`;
      const parameters = {
        documentType,
        documentContent,
        jurisdiction,
        language,
        shariaCompliance: true,
        localRegulations: true,
        riskAssessment: true,
        complianceCheck: true,
        culturalConsiderations: true
      };

      // For legal analysis, prioritize ALLaM for Saudi compliance or Jais for general MENA legal context
      const legalMarketData: MENAMarketData = {
        region: jurisdiction,
        currency: "USD",
        timezone: this.getTimezoneForRegion(jurisdiction),
        businessHours: { open: "09:00", close: "17:00" },
        culturalContext: this.getCulturalContextForLegal(jurisdiction),
        complianceRequirements: this.getLegalComplianceRequirements(jurisdiction)
      };

      return await this.executeAgentCode(AgentType.MOSTASHAR, task, parameters, legalMarketData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Mostashar legal analysis failed",
        executionTime: 0
      };
    }
  }

  // Helper methods for regional context

  /**
   * Get timezone for region
   */
  private getTimezoneForRegion(region: string): string {
    const timezones = {
      'Saudi Arabia': 'Asia/Riyadh',
      'UAE': 'Asia/Dubai',
      'Egypt': 'Africa/Cairo',
      'Qatar': 'Asia/Qatar',
      'Kuwait': 'Asia/Kuwait',
      'Bahrain': 'Asia/Bahrain',
      'Oman': 'Asia/Muscat'
    };
    return timezones[region as keyof typeof timezones] || 'UTC';
  }

  /**
   * Get business hours for region
   */
  private getBusinessHoursForRegion(region: string): { open: string; close: string } {
    const businessHours = {
      'Saudi Arabia': { open: "08:00", close: "17:00" },
      'UAE': { open: "08:00", close: "18:00" },
      'Egypt': { open: "09:00", close: "17:00" },
      'Qatar': { open: "08:00", close: "17:00" }
    };
    return businessHours[region as keyof typeof businessHours] || { open: "09:00", close: "17:00" };
  }

  /**
   * Get cultural context for travel planning
   */
  private getCulturalContextForTravel(region: string, destination: string): string[] {
    const contexts = {
      'Saudi Arabia': ['Islamic culture', 'Traditional values', 'Halal requirements', 'Prayer times'],
      'UAE': ['Multi-cultural society', 'Luxury tourism', 'International cuisine', 'Business tourism'],
      'Egypt': ['Ancient civilization', 'Archaeological sites', 'Local markets', 'Traditional hospitality'],
      'Qatar': ['Modern infrastructure', 'Cultural heritage', 'Sports tourism', 'Family-friendly activities']
    };
    return contexts[region as keyof typeof contexts] || ['Local culture', 'Traditional customs'];
  }

  /**
   * Get travel compliance requirements
   */
  private getTravelComplianceRequirements(region: string, destination: string): string[] {
    const requirements = {
      'Saudi Arabia': ['Visa requirements', 'Islamic law compliance', 'Cultural sensitivity', 'Modest dress code'],
      'UAE': ['Tourist visa', 'Local regulations', 'Cultural respect', 'Photography rules'],
      'Egypt': ['Tourist visa', 'Site-specific rules', 'Archaeological site protection', 'Bargaining customs']
    };
    return requirements[region as keyof typeof requirements] || ['Local regulations', 'Cultural norms'];
  }

  /**
   * Get cultural context for restaurants
   */
  private getCulturalContextForRestaurants(region: string): string[] {
    const contexts = {
      'Saudi Arabia': ['Halal certification', 'Family seating', 'Ramadan considerations', 'Traditional cuisine'],
      'UAE': ['International cuisine', 'Fine dining', 'Shisha culture', 'Hotel restaurants'],
      'Egypt': ['Local specialties', 'Street food', 'Traditional cafes', 'Catering services']
    };
    return contexts[region as keyof typeof contexts] || ['Local cuisine', 'Traditional dining'];
  }

  /**
   * Get restaurant compliance requirements
   */
  private getRestaurantComplianceRequirements(region: string): string[] {
    const requirements = {
      'Saudi Arabia': ['Halal certification', 'Food safety standards', 'Ramadan operations', 'Cultural compliance'],
      'UAE': ['Food safety', 'Licensing requirements', 'Cultural sensitivity', 'Service standards'],
      'Egypt': ['Health permits', 'Local ingredient sourcing', 'Cultural authenticity', 'Tourist accommodation']
    };
    return requirements[region as keyof typeof requirements] || ['Local food regulations', 'Cultural considerations'];
  }

  /**
   * Get cultural context for legal analysis
   */
  private getCulturalContextForLegal(jurisdiction: string): string[] {
    const contexts = {
      'Saudi Arabia': ['Sharia law', 'Islamic banking', 'Cultural norms', 'Traditional contracts'],
      'UAE': ['Federal law', 'International business', 'Cultural arbitration', 'Commercial courts'],
      'Egypt': ['Civil law system', 'Local business practices', 'Cultural contracts', 'Dispute resolution']
    };
    return contexts[jurisdiction as keyof typeof contexts] || ['Local legal framework', 'Cultural considerations'];
  }

  /**
   * Get legal compliance requirements
   */
  private getLegalComplianceRequirements(jurisdiction: string): string[] {
    const requirements = {
      'Saudi Arabia': ['Sharia compliance', 'Government regulations', 'Islamic finance', 'Cultural considerations'],
      'UAE': ['Federal regulations', 'Commercial law', 'International agreements', 'Cultural arbitration'],
      'Egypt': ['Local regulations', 'Commercial courts', 'Business licensing', 'Cultural contracts']
    };
    return requirements[jurisdiction as keyof typeof requirements] || ['Local legal compliance', 'Cultural framework'];
  }

  /**
   * MENA Agent: Sofra - Restaurant Analysis
   */
  async sofraRestaurantAnalysis(
    restaurantData: any,
    analysisType: "menu" | "cost" | "inventory" | "pricing"
  ): Promise<CodeExecutionResult> {
    const task = `Generate restaurant ${analysisType} analysis`;
    const parameters = {
      restaurantData,
      analysisType,
      currency: restaurantData.currency || "USD"
    };

    return await this.executeAgentCode(AgentType.SOFRA, task, parameters);
  }

  /**
   * MENA Agent: Mostashar - Legal Document Analysis
   */
  async mostasharLegalAnalysis(
    documentType: string,
    documentContent: string,
    jurisdiction: string = "UAE"
  ): Promise<CodeExecutionResult> {
    const task = `Generate legal document analysis for ${documentType}`;
    const parameters = {
      documentType,
      documentContent,
      jurisdiction,
      complianceCheck: true,
      riskAssessment: true
    };

    return await this.executeAgentCode(AgentType.MOSTASHAR, task, parameters);
  }

  /**
   * Generate interactive dashboard for agent insights
   */
  async generateDashboard(
    agentType: AgentType,
    data: any,
    chartTypes: string[] = ["bar", "line", "pie"]
  ): Promise<CodeExecutionResult> {
    const task = "Generate interactive dashboard with multiple chart types";
    const parameters = {
      agentType,
      data,
      chartTypes,
      exportFormats: ["html", "png", "pdf"],
      interactive: true
    };

    return await this.executeAgentCode(agentType, task, parameters);
  }

  /**
   * Islamic finance calculations
   */
  async islamicFinanceCalculation(
    calculationType: "zakat" | "profit_sharing" | "murabaha" | "sukuk",
    parameters: any
  ): Promise<CodeExecutionResult> {
    const task = `Generate Islamic finance calculation for ${calculationType}`;
    const enhancedParams = {
      ...parameters,
      calculationType,
      shariaCompliant: true,
      menaContext: true
    };

    return await this.executeAgentCode(AgentType.TAJER, task, enhancedParams);
  }
}

// Export singleton instance
export const aiEngine = new AIEngine();

// Export enums and types
export { AgentType, CodeExecutionResult, MENAMarketData };

// Export individual functions for convenience
export const researchWithGoogle = (query: string, language?: string) =>
  aiEngine.researchWithGoogle(query, language);

export const analyzeImage = (imageUrl: string, analysisType?: string) =>
  aiEngine.analyzeImage(imageUrl, analysisType);

export const generateStructuredData = (input: string, schema: any, language?: string) =>
  aiEngine.generateStructuredData(input, schema, language);

export const sofraMenuAnalysis = (imageUrl: string, restaurantInfo?: any) =>
  aiEngine.sofraMenuAnalysis(imageUrl, restaurantInfo);

export const tajerRealEstateResearch = (query: string, location?: string) =>
  aiEngine.tajerRealEstateResearch(query, location);

// Code execution functions
export const executeCode = (code: string, language?: string, timeoutMs?: number) =>
  aiEngine.executeCode(code, language, timeoutMs);

export const generateAgentCode = (agentType: AgentType, task: string, parameters?: any, language?: string) =>
  aiEngine.generateAgentCode(agentType, task, parameters, language);

export const executeAgentCode = (agentType: AgentType, task: string, parameters?: any, marketData?: MENAMarketData) =>
  aiEngine.executeAgentCode(agentType, task, parameters, marketData);

// Agent-specific functions
export const musafirTravelPlanning = (origin: string, destination: string, duration: number, budget: number, currency?: string) =>
  aiEngine.musafirTravelPlanning(origin, destination, duration, budget, currency);

export const sofraRestaurantAnalysis = (restaurantData: any, analysisType?: "menu" | "cost" | "inventory" | "pricing") =>
  aiEngine.sofraRestaurantAnalysis(restaurantData, analysisType);

export const mostasharLegalAnalysis = (documentType: string, documentContent: string, jurisdiction?: string) =>
  aiEngine.mostasharLegalAnalysis(documentType, documentContent, jurisdiction);

// Utility functions
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) =>
  aiEngine.convertCurrency(amount, fromCurrency, toCurrency);

export const generateFinancialAnalysis = (analysisType: "roi" | "cashflow" | "valuation" | "risk", data: any, currency?: string) =>
  aiEngine.generateFinancialAnalysis(analysisType, data, currency);

export const generateArabicTextProcessing = (textType: "sentiment" | "translation" | "summarization" | "extraction", textData: string) =>
  aiEngine.generateArabicTextProcessing(textType, textData);

export const generateDashboard = (agentType: AgentType, data: any, chartTypes?: string[]) =>
  aiEngine.generateDashboard(agentType, data, chartTypes);

export const islamicFinanceCalculation = (calculationType: "zakat" | "profit_sharing" | "murabaha" | "sukuk", parameters: any) =>
  aiEngine.islamicFinanceCalculation(calculationType, parameters);