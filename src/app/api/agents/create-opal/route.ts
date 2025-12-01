/**
 * 🔷 OPAL-ENABLED AGENT CREATION API
 * 
 * API endpoint for creating agents with integrated Opal workflow capabilities
 * Supports Tesla frequency-based personality generation and Solana wallet integration
 * Provides comprehensive validation and deployment capabilities
 * 
 * @author Axiom Core Team
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createEnhancedAxiomForge } from '@/services/enhanced-axiom-forge';
import { OpalIntegrationService } from '@/services/opal-integration';
import { 
  EnhancedAgentCreationRequest, 
  EnhancedAgentResponse,
  AgentDeploymentConfig,
  isEnhancedAgentConfig,
  isValidAgentType
} from '@/types/enhanced-agents';
import { AgentType } from '@/lib/ai-engine';
import { COMPREHENSIVE_MENA_TEMPLATES } from '@/templates/opal-agent-templates';

// Initialize Opal integration service
const opalIntegration = new OpalIntegrationService({
  opalBridgeConfig: {
    apiEndpoint: process.env.OPAL_API_ENDPOINT || 'https://api.opal.workflows',
    authentication: {
      type: 'api_key',
      credentials: {
        apiKey: process.env.OPAL_API_KEY || ''
      }
    },
    timeout: 30000,
    retryAttempts: 3,
    rateLimiting: {
      requestsPerMinute: 100,
      burstLimit: 20
    },
    webhooks: {
      enabled: true,
      endpoint: process.env.OPAL_WEBHOOK_ENDPOINT,
      secret: process.env.OPAL_WEBHOOK_SECRET
    }
  },
  workflowBridgeConfig: {
    defaultTimeout: 600000,
    maxRetries: 3,
    enableCaching: true,
    cacheTimeout: 3600000,
    enableMetrics: true
  },
  agentConfigs: {}, // Will be populated based on agent type
  monitoring: {
    enabled: true,
    logLevel: 'info',
    metricsCollection: true,
    alertThresholds: {
      executionTime: 300000,
      errorRate: 0.1,
      costLimit: 10.0
    }
  }
});

// Initialize enhanced forge service
const enhancedForge = createEnhancedAxiomForge(opalIntegration);

/**
 * POST /api/agents/create-opal
 * Create a new Opal-enabled agent
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const creationRequest: EnhancedAgentCreationRequest = body;

    // Validate request
    const validation = validateCreationRequest(creationRequest);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    console.log(`🚀 Creating Opal-enabled agent: ${creationRequest.name}`);
    console.log(`📊 Agent Type: ${creationRequest.agent_type}`);
    console.log(`🔷 Opal Workflows: ${creationRequest.enable_opal_workflows ? 'Enabled' : 'Disabled'}`);
    console.log(`💰 Wallet: ${creationRequest.enable_wallet ? 'Enabled' : 'Disabled'}`);

    // Create enhanced agent
    const agentConfig = await enhancedForge.forgeOpalAgent({
      name: creationRequest.name,
      role: creationRequest.role,
      vibe: creationRequest.vibe,
      agentType: creationRequest.agent_type,
      region: creationRequest.region,
      language: creationRequest.language
    });

    // Apply custom configurations
    const customizedAgent = await applyCustomConfigurations(agentConfig, creationRequest);

    // Validate final configuration
    const validationResults = await enhancedForge.validateAgentConfig(customizedAgent);
    if (!validationResults.valid) {
      return NextResponse.json({
        success: false,
        error: 'Agent configuration validation failed',
        details: validationResults.errors,
        warnings: validationResults.warnings
      }, { status: 400 });
    }

    // Deploy agent
    const deploymentInfo = await deployAgent(customizedAgent);

    const executionTime = Date.now() - startTime;

    // Return success response
    const response: EnhancedAgentResponse = {
      success: true,
      agent: customizedAgent,
      creation_metadata: {
        execution_time: executionTime,
        wallet_generation_time: Math.floor(executionTime * 0.2), // Estimated
        opal_setup_time: Math.floor(executionTime * 0.4), // Estimated
        personality_generation_time: Math.floor(executionTime * 0.3), // Estimated
        total_time: executionTime
      },
      validation_results: validationResults,
      deployment_info: deploymentInfo
    };

    console.log(`✅ Opal-enabled agent created successfully: ${customizedAgent.agent_name}`);
    console.log(`⏱️ Total creation time: ${executionTime}ms`);

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('❌ Opal agent creation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Agent creation failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      execution_time: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * GET /api/agents/create-opal
 * Get available agent types and configurations
 */
export async function GET() {
  try {
    // Get available agent types
    const agentTypes = Object.values(AgentType).map(type => ({
      type,
      name: type.charAt(0) + type.slice(1).toLowerCase(),
      description: getAgentTypeDescription(type),
      opal_templates: COMPREHENSIVE_MENA_TEMPLATES.filter(t => t.agentType === type).length,
      cultural_regions: getSupportedRegions(type),
      special_features: getSpecialFeatures(type)
    }));

    // Get available workflow templates
    const workflowTemplates = COMPREHENSIVE_MENA_TEMPLATES.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      agent_type: template.agentType,
      tags: template.metadata.tags,
      use_cases: template.metadata.useCases
    }));

    // Get Tesla frequency bands
    const frequencyBands = [
      { band: '3Hz', description: 'Foundation frequency - Stability and grounding' },
      { band: '6Hz', description: 'Harmony frequency - Balance and creativity' },
      { band: '9Hz', description: 'Ascension frequency - Higher consciousness' },
      { band: 'custom', description: 'Custom frequency - Personalized resonance' }
    ];

    // Get supported regions
    const supportedRegions = [
      { code: 'UAE', name: 'United Arab Emirates', currency: 'AED', timezone: 'GMT+4' },
      { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', timezone: 'GMT+3' },
      { code: 'EG', name: 'Egypt', currency: 'EGP', timezone: 'GMT+2' },
      { code: 'JO', name: 'Jordan', currency: 'JOD', timezone: 'GMT+3' },
      { code: 'LB', name: 'Lebanon', currency: 'LBP', timezone: 'GMT+2' },
      { code: 'QA', name: 'Qatar', currency: 'QAR', timezone: 'GMT+3' },
      { code: 'KW', name: 'Kuwait', currency: 'KWD', timezone: 'GMT+3' },
      { code: 'BH', name: 'Bahrain', currency: 'BHD', timezone: 'GMT+3' },
      { code: 'OM', name: 'Oman', currency: 'OMR', timezone: 'GMT+4' }
    ];

    return NextResponse.json({
      success: true,
      data: {
        agent_types: agentTypes,
        workflow_templates: workflowTemplates,
        frequency_bands: frequencyBands,
        supported_regions: supportedRegions,
        api_version: '2.0.0',
        features: {
          opal_workflows: true,
          solana_wallets: true,
          tesla_frequencies: true,
          cultural_adaptation: true,
          islamic_finance: true,
          multilingual_support: true
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to get agent creation info:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve agent creation information',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

/**
 * Validate agent creation request
 */
function validateCreationRequest(request: EnhancedAgentCreationRequest): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!request.name || request.name.trim().length === 0) {
    errors.push('Agent name is required');
  }

  if (!request.role || request.role.trim().length === 0) {
    errors.push('Agent role is required');
  }

  if (!request.vibe || request.vibe.trim().length === 0) {
    errors.push('Agent vibe is required');
  }

  if (!request.agent_type) {
    errors.push('Agent type is required');
  } else if (!isValidAgentType(request.agent_type)) {
    errors.push('Invalid agent type');
  }

  // Tesla frequency validation
  if (request.frequency_band === 'custom' && !request.custom_frequency) {
    errors.push('Custom frequency is required when frequency band is set to custom');
  }

  if (request.custom_frequency && (request.custom_frequency < 1 || request.custom_frequency > 1000)) {
    errors.push('Custom frequency must be between 1Hz and 1000Hz');
  }

  // Regional validation
  if (request.region && !getSupportedRegions(request.agent_type).includes(request.region)) {
    warnings.push(`Region ${request.region} may not be fully supported for ${request.agent_type} agents`);
  }

  // Opal configuration validation
  if (request.enable_opal_workflows && request.workflow_categories) {
    const validCategories = ['islamic_finance', 'market_research', 'religious_travel', 'cultural_tourism', 'halal_compliance', 'islamic_law'];
    const invalidCategories = request.workflow_categories.filter(cat => !validCategories.includes(cat));
    if (invalidCategories.length > 0) {
      warnings.push(`Unknown workflow categories: ${invalidCategories.join(', ')}`);
    }
  }

  // Security validation
  if (request.security_level && !['standard', 'enhanced', 'military'].includes(request.security_level)) {
    errors.push('Invalid security level');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Apply custom configurations to agent
 */
async function applyCustomConfigurations(
  agentConfig: any, 
  request: EnhancedAgentCreationRequest
): Promise<any> {
  let customizedAgent = { ...agentConfig };

  // Apply Tesla frequency customization
  if (request.frequency_band && request.frequency_band !== '3Hz') {
    customizedAgent.personality_profile.frequency_band = request.frequency_band;
    
    if (request.frequency_band === 'custom' && request.custom_frequency) {
      customizedAgent.core_frequency = `${request.custom_frequency}Hz`;
    }
  }

  // Apply personality customization
  if (request.personality_customization) {
    customizedAgent.personality_profile = {
      ...customizedAgent.personality_profile,
      ...request.personality_customization
    };
  }

  // Apply cultural context
  if (request.region) {
    customizedAgent.cultural_context.region = request.region;
    customizedAgent.cultural_context.timezone = getRegionTimezone(request.region);
    customizedAgent.cultural_context.currency_preference = getRegionCurrencies(request.region);
  }

  if (request.language) {
    customizedAgent.cultural_context.language = request.language;
    customizedAgent.voice_config.language_support = [request.language];
  }

  // Apply security configuration
  if (request.security_level) {
    customizedAgent.security_config.encryption_level = request.security_level;
  }

  if (request.privacy_mode !== undefined) {
    customizedAgent.security_config.privacy_mode = request.privacy_mode;
  }

  // Apply integrations
  if (request.integrations) {
    customizedAgent.metadata.tags = [
      ...customizedAgent.metadata.tags,
      ...request.integrations.external_apis || [],
      ...request.integrations.databases || []
    ];
  }

  // Apply custom workflows
  if (request.custom_workflows && request.custom_workflows.length > 0) {
    customizedAgent.opal_config.workflowTemplates = [
      ...customizedAgent.opal_config.workflowTemplates,
      ...request.custom_workflows
    ];
  }

  // Filter workflow templates by requested categories
  if (request.workflow_categories && request.workflow_categories.length > 0) {
    customizedAgent.opal_config.workflowTemplates = customizedAgent.opal_config.workflowTemplates.filter(template =>
      request.workflow_categories!.includes(template.category)
    );
  }

  return customizedAgent;
}

/**
 * Deploy agent to infrastructure
 */
async function deployAgent(agentConfig: any): Promise<any> {
  // Generate unique agent ID
  const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // In a real implementation, this would:
  // 1. Save agent configuration to database
  // 2. Initialize Opal workflows
  // 3. Set up Solana wallet
  // 4. Configure monitoring and logging
  // 5. Create API endpoints
  // 6. Set up webhooks

  console.log(`🚀 Deploying agent: ${agentId}`);
  
  // Simulate deployment process
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    agent_id: agentId,
    deployment_url: `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}`,
    api_endpoints: [
      `${process.env.NEXT_PUBLIC_API_URL}/api/agents/${agentId}/chat`,
      `${process.env.NEXT_PUBLIC_API_URL}/api/agents/${agentId}/workflows`,
      `${process.env.NEXT_PUBLIC_API_URL}/api/agents/${agentId}/execute`
    ],
    webhook_urls: [
      `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/agents/${agentId}`,
      `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/opal/${agentId}`
    ],
    status: 'deployed',
    deployed_at: new Date().toISOString()
  };
}

/**
 * Get agent type description
 */
function getAgentTypeDescription(type: AgentType): string {
  const descriptions = {
    [AgentType.TAJER]: 'Business and commerce specialist for MENA markets',
    [AgentType.MUSAFIR]: 'Travel and tourism expert with cultural knowledge',
    [AgentType.SOFRA]: 'Restaurant and food service management specialist',
    [AgentType.MOSTASHAR]: 'Legal and consulting expert for MENA regulations'
  };
  return descriptions[type] || 'Specialized AI agent for MENA region';
}

/**
 * Get supported regions for agent type
 */
function getSupportedRegions(agentType: AgentType): string[] {
  const regionSupport = {
    [AgentType.TAJER]: ['UAE', 'SA', 'EG', 'JO', 'QA', 'KW', 'BH'],
    [AgentType.MUSAFIR]: ['UAE', 'SA', 'EG', 'JO', 'LB', 'QA', 'KW', 'OM', 'BH'],
    [AgentType.SOFRA]: ['UAE', 'SA', 'EG', 'JO', 'LB', 'QA', 'KW'],
    [AgentType.MOSTASHAR]: ['UAE', 'SA', 'EG', 'JO', 'LB', 'QA', 'KW', 'BH']
  };
  return regionSupport[agentType] || ['UAE', 'SA', 'EG'];
}

/**
 * Get special features for agent type
 */
function getSpecialFeatures(type: AgentType): string[] {
  const features = {
    [AgentType.TAJER]: ['Islamic finance calculations', 'Market analysis', 'Risk assessment', 'Currency conversion'],
    [AgentType.MUSAFIR]: ['Hajj/Umrah planning', 'Cultural site guidance', 'Route optimization', 'Multi-language support'],
    [AgentType.SOFRA]: ['Halal certification', 'Menu analysis', 'Inventory optimization', 'Customer experience'],
    [AgentType.MOSTASHAR]: ['Sharia compliance', 'Contract analysis', 'Legal research', 'Regulatory tracking']
  };
  return features[type] || [];
}

/**
 * Get region timezone
 */
function getRegionTimezone(region: string): string {
  const timezones = {
    'UAE': 'GMT+4',
    'SA': 'GMT+3',
    'EG': 'GMT+2',
    'JO': 'GMT+3',
    'LB': 'GMT+2',
    'QA': 'GMT+3',
    'KW': 'GMT+3',
    'BH': 'GMT+3',
    'OM': 'GMT+4'
  };
  return timezones[region] || 'GMT+0';
}

/**
 * Get region currencies
 */
function getRegionCurrencies(region: string): string[] {
  const currencies = {
    'UAE': ['AED', 'USD'],
    'SA': ['SAR', 'USD'],
    'EG': ['EGP', 'USD'],
    'JO': ['JOD', 'USD'],
    'LB': ['LBP', 'USD'],
    'QA': ['QAR', 'USD'],
    'KW': ['KWD', 'USD'],
    'BH': ['BHD', 'USD'],
    'OM': ['OMR', 'USD']
  };
  return currencies[region] || ['USD'];
}