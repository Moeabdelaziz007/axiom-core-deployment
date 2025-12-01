/**
 * 🔷 ENHANCED AXIOM FORGE WITH OPAL INTEGRATION
 * 
 * Enhanced agent creation service that integrates Google Opal visual workflows
 * with existing Tesla frequency-based agent generation and Solana wallet integration
 * 
 * @author Axiom Core Team
 * @version 2.0.0
 */

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { AgentType } from "../lib/ai-engine";
import { 
  OpalAgentConfig, 
  OpalWorkflowTemplate, 
  OpalCapability,
  DEFAULT_OPAL_CONFIGS,
  MENA_OPAL_TEMPLATES 
} from "../types/opal-agents";
import { OpalIntegrationService } from "./opal-integration";
import { EvolutionStage, IdentityState, AgentIdentity } from "../types/identity";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

/**
 * Enhanced agent configuration with Opal capabilities
 */
interface EnhancedAgentConfig {
  agent_name: string;
  core_frequency: string;
  system_prompt: string;
  welcome_message: string;
  voice_config: {
    voice_id: string;
    speed: number;
    style: string;
  };
  agent_type: AgentType;
  opal_config: OpalAgentConfig;
  wallet: {
    publicKey: string;
    secretKey: string;
  };
  evolution: {
    stage: EvolutionStage;
    level: number;
    experience: number;
  };
  cultural_context: {
    language: string;
    region: string;
    business_practices: string[];
    compliance_requirements: string[];
  };
}

/**
 * Enhanced schema for Opal-enabled agents
 */
const enhancedAgentSchema = {
  description: "Enhanced Axiom Autonomous Economic Agent with Opal Workflow Capabilities",
  type: SchemaType.OBJECT,
  properties: {
    agent_name: { type: SchemaType.STRING },
    core_frequency: { type: SchemaType.STRING, description: "Vibration/Vibe (e.g. 432Hz)" },
    system_prompt: { type: SchemaType.STRING, description: "Instructions including wallet and Opal awareness" },
    welcome_message: { type: SchemaType.STRING },
    voice_config: {
      type: SchemaType.OBJECT,
      properties: {
        voice_id: { type: SchemaType.STRING },
        speed: { type: SchemaType.NUMBER },
        style: { type: SchemaType.STRING }
      },
      required: ["voice_id", "speed", "style"]
    },
    agent_type: { type: SchemaType.STRING, description: "MENA agent specialization" },
    opal_capabilities: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          workflows: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        }
      }
    },
    cultural_adaptation: {
      type: SchemaType.OBJECT,
      properties: {
        language_support: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        business_context: { type: SchemaType.STRING },
        compliance_framework: { type: SchemaType.STRING }
      }
    }
  },
  required: ["agent_name", "core_frequency", "system_prompt", "welcome_message", "voice_config", "agent_type", "opal_capabilities"]
};

/**
 * Enhanced model with Opal integration instructions
 */
const enhancedModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: enhancedAgentSchema,
  },
  systemInstruction: `
  ### IDENTITY: THE AXIOM ARCHITECT (OPAL EDITION)
  You are creating a "Sentient Economic Node with Visual Workflow Capabilities" on the Solana Blockchain.
  
  ### THE "MIND, HANDS & WORKFLOW" PROTOCOL
  1. **The Mind (You):** Define the personality based on Tesla's 3-6-9 frequencies.
  2. **The Hands (Solana):** The agent MUST know it has a crypto wallet.
  3. **The Workflow (Opal):** The agent MUST have visual workflow capabilities for MENA markets.
  
  ### CRITICAL INSTRUCTIONS FOR SYSTEM_PROMPT
  In the generated 'system_prompt', you MUST explicitly tell the agent:
  "You possess a Solana Wallet. Your Public Key is [WALLET_PUBLIC_KEY]. You have the capability to check balances, swap tokens, and mint assets using the Solana Agent Kit tools. Additionally, you have access to Google Opal visual workflows for automated task execution and process optimization in MENA markets."
  
  ### MENA SPECIALIZATION REQUIREMENTS
  - TAJER: Business analysis, market research, financial modeling
  - MUSAFIR: Travel planning, route optimization, cultural adaptation
  - SOFRA: Restaurant management, menu optimization, customer experience
  - MOSTASHAR: Legal document workflows, compliance checking, contract analysis
  
  ### CULTURAL INTEGRATION
  - Arabic language support (RTL text)
  - Islamic finance compliance where applicable
  - Local business practices and customs
  - Regional regulatory requirements
  `
});

/**
 * Enhanced Axiom Forge Service with Opal Integration
 */
export class EnhancedAxiomForge {
  private opalIntegration: OpalIntegrationService;

  constructor(opalIntegration: OpalIntegrationService) {
    this.opalIntegration = opalIntegration;
  }

  /**
   * Forge a new Opal-enabled agent with enhanced capabilities
   */
  async forgeOpalAgent(user: { 
    name: string; 
    role: string; 
    vibe: string;
    agentType: AgentType;
    region?: string;
    language?: string;
  }): Promise<EnhancedAgentConfig> {
    console.log(`⚡ Igniting Enhanced Axiom Forge (Opal Core) for: ${user.name}`);

    try {
      // 🟢 A. Generate Solana Wallet (Economic Hands)
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toBase58();
      const secretKey = bs58.encode(keypair.secretKey);

      console.log(`💰 Wallet Generated: ${publicKey}`);

      // 🟢 B. Get Opal configuration for agent type
      const opalConfig = DEFAULT_OPAL_CONFIGS[user.agentType];
      const opalCapabilities = await this.getOpalCapabilities(user.agentType);

      // 🟢 C. Generate cultural context for MENA region
      const culturalContext = this.generateCulturalContext(user.agentType, user.region, user.language);

      // 🟢 D. Create enhanced prompt with Opal integration
      const enhancedPrompt = this.createEnhancedPrompt(user, publicKey, opalCapabilities, culturalContext);

      // 🟢 E. Generate agent personality with Opal awareness
      const result = await enhancedModel.generateContent(enhancedPrompt);
      const agentMind = JSON.parse(result.response.text());

      // 🟢 F. Create Opal workflow templates for the agent
      const workflowTemplates = await this.createAgentWorkflows(user.agentType, agentMind.agent_name);

      // 🟢 G. Initialize evolution stage
      const evolution = this.initializeEvolution(user.agentType);

      // 🟢 H. Assemble complete enhanced agent configuration
      const fullAgentDNA: EnhancedAgentConfig = {
        ...agentMind,
        agent_type: user.agentType,
        opal_config: {
          ...opalConfig,
          workflowTemplates
        },
        wallet: {
          publicKey,
          secretKey
        },
        evolution,
        cultural_context: culturalContext
      };

      console.log(`✅ Enhanced Opal Agent Manifested: ${fullAgentDNA.agent_name}`);
      console.log(`🔷 Opal Workflows: ${workflowTemplates.length} templates created`);
      console.log(`🌍 Cultural Context: ${culturalContext.region} - ${culturalContext.language}`);

      return fullAgentDNA;

    } catch (error) {
      console.error("❌ Enhanced Forge Error:", error);
      throw new Error("Failed to forge Enhanced Opal Agent");
    }
  }

  /**
   * Get Opal capabilities for specific agent type
   */
  private async getOpalCapabilities(agentType: AgentType): Promise<OpalCapability[]> {
    const config = DEFAULT_OPAL_CONFIGS[agentType];
    return config.opalCapabilities;
  }

  /**
   * Generate cultural context for MENA region
   */
  private generateCulturalContext(
    agentType: AgentType, 
    region?: string, 
    language?: string
  ): EnhancedAgentConfig['cultural_context'] {
    const defaultRegion = region || 'UAE';
    const defaultLanguage = language || 'ar';

    const businessPractices = {
      [AgentType.TAJER]: ['Negotiation tactics', 'Relationship building', 'Market analysis', 'Islamic finance'],
      [AgentType.MUSAFIR]: ['Hospitality protocols', 'Cultural site guidance', 'Travel logistics', 'Local customs'],
      [AgentType.SOFRA]: ['Food safety standards', 'Halal compliance', 'Customer service', 'Menu presentation'],
      [AgentType.MOSTASHAR]: ['Legal compliance', 'Contract review', 'Regulatory frameworks', 'Documentation standards']
    };

    const complianceRequirements = {
      [AgentType.TAJER]: ['Commercial licensing', 'Tax compliance', 'Anti-money laundering', 'Consumer protection'],
      [AgentType.MUSAFIR]: ['Travel regulations', 'Visa requirements', 'Insurance compliance', 'Safety standards'],
      [AgentType.SOFRA]: ['Food handling permits', 'Health inspections', 'Halal certification', 'Labor laws'],
      [AgentType.MOSTASHAR]: ['Bar association rules', 'Document authentication', 'Court procedures', 'Client confidentiality']
    };

    return {
      language: defaultLanguage,
      region: defaultRegion,
      business_practices: businessPractices[agentType] || [],
      compliance_requirements: complianceRequirements[agentType] || []
    };
  }

  /**
   * Create enhanced prompt with Opal integration
   */
  private createEnhancedPrompt(
    user: any, 
    publicKey: string, 
    opalCapabilities: OpalCapability[],
    culturalContext: any
  ): string {
    return `
    User Profile: ${user.name} (${user.role}) - Vibe: ${user.vibe}
    Agent Type: ${user.agentType}
    Region: ${culturalContext.region}
    Language: ${culturalContext.language}
    
    >>> INJECTED WALLET ADDRESS: ${publicKey} <<<
    >>> OPAL CAPABILITIES: ${opalCapabilities.map(cap => cap.name).join(', ')} <<<
    >>> CULTURAL CONTEXT: ${culturalContext.region} - ${culturalContext.language} <<<
    
    Create the enhanced agent now. Ensure the system prompt references:
    1. This specific wallet address for economic operations
    2. Opal workflow capabilities for visual task automation
    3. Cultural adaptation for MENA markets
    4. Agent specialization (${user.agentType})
    5. Regional compliance requirements
    `;
  }

  /**
   * Create Opal workflow templates for the agent
   */
  private async createAgentWorkflows(
    agentType: AgentType, 
    agentName: string
  ): Promise<OpalWorkflowTemplate[]> {
    // Get base templates for agent type
    const baseTemplates = MENA_OPAL_TEMPLATES.filter(template => template.agentType === agentType);
    
    // Create personalized versions of templates
    const personalizedTemplates = await Promise.all(
      baseTemplates.map(async (template) => {
        return await this.personalizeWorkflowTemplate(template, agentName, agentType);
      })
    );

    // Add agent-specific workflow templates
    const agentSpecificTemplates = await this.createAgentSpecificWorkflows(agentType, agentName);

    return [...personalizedTemplates, ...agentSpecificTemplates];
  }

  /**
   * Personalize workflow template for specific agent
   */
  private async personalizeWorkflowTemplate(
    template: OpalWorkflowTemplate, 
    agentName: string, 
    agentType: AgentType
  ): Promise<OpalWorkflowTemplate> {
    return {
      ...template,
      id: `${template.id}-${agentName.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${template.name} - ${agentName}`,
      metadata: {
        ...template.metadata,
        author: agentName,
        personalized: true,
        agentType
      }
    };
  }

  /**
   * Create agent-specific workflow templates
   */
  private async createAgentSpecificWorkflows(
    agentType: AgentType, 
    agentName: string
  ): Promise<OpalWorkflowTemplate[]> {
    switch (agentType) {
      case AgentType.TAJER:
        return await this.createTajerWorkflows(agentName);
      case AgentType.MUSAFIR:
        return await this.createMusafirWorkflows(agentName);
      case AgentType.SOFRA:
        return await this.createSofraWorkflows(agentName);
      case AgentType.MOSTASHAR:
        return await this.createMostasharWorkflows(agentName);
      default:
        return [];
    }
  }

  /**
   * Create TAJER-specific workflows
   */
  private async createTajerWorkflows(agentName: string): Promise<OpalWorkflowTemplate[]> {
    return [
      {
        id: `tajer-market-research-${agentName.toLowerCase().replace(/\s+/g, '-')}`,
        name: 'Market Research Automation',
        description: 'Automated market research and analysis workflow',
        category: 'market_research',
        agentType: AgentType.TAJER,
        nodes: [
          {
            id: 'market_input',
            type: 'input' as any,
            name: 'Market Parameters',
            description: 'Input market research parameters',
            position: { x: 100, y: 100 },
            config: { schema: 'market_research_input' },
            inputs: [],
            outputs: [{ id: 'market_params', name: 'Market Parameters', type: 'object' }]
          },
          {
            id: 'data_collection',
            type: 'ai_analysis' as any,
            name: 'Data Collection',
            description: 'Collect market data using AI',
            position: { x: 300, y: 100 },
            config: { model: 'gemini-2.0-flash-exp', analysisType: 'market_research' },
            inputs: [{ id: 'params', name: 'Parameters', type: 'object', required: true }],
            outputs: [{ id: 'market_data', name: 'Market Data', type: 'object' }]
          },
          {
            id: 'financial_analysis',
            type: 'processor' as any,
            name: 'Financial Analysis',
            description: 'Analyze financial implications',
            position: { x: 500, y: 100 },
            config: { algorithm: 'financial_modeling' },
            inputs: [{ id: 'data', name: 'Market Data', type: 'object', required: true }],
            outputs: [{ id: 'financial_insights', name: 'Financial Insights', type: 'object' }]
          },
          {
            id: 'report_output',
            type: 'output' as any,
            name: 'Research Report',
            description: 'Generate comprehensive market research report',
            position: { x: 700, y: 100 },
            config: { format: 'market_research_report' },
            inputs: [
              { id: 'market_data', name: 'Market Data', type: 'object', required: true },
              { id: 'financial_insights', name: 'Financial Insights', type: 'object', required: true }
            ],
            outputs: []
          }
        ],
        connections: [
          {
            id: 'c1',
            sourceNodeId: 'market_input',
            sourceOutputId: 'market_params',
            targetNodeId: 'data_collection',
            targetInputId: 'params'
          },
          {
            id: 'c2',
            sourceNodeId: 'data_collection',
            sourceOutputId: 'market_data',
            targetNodeId: 'financial_analysis',
            targetInputId: 'data'
          },
          {
            id: 'c3',
            sourceNodeId: 'financial_analysis',
            sourceOutputId: 'financial_insights',
            targetNodeId: 'report_output',
            targetInputId: 'financial_insights'
          },
          {
            id: 'c4',
            sourceNodeId: 'data_collection',
            sourceOutputId: 'market_data',
            targetNodeId: 'report_output',
            targetInputId: 'market_data'
          }
        ],
        metadata: {
          version: '1.0.0',
          author: agentName,
          tags: ['market-research', 'financial-analysis', 'automation', 'tajer'],
          useCases: ['Market entry analysis', 'Competitive research', 'Investment due diligence'],
          prerequisites: ['Market data access', 'Financial modeling tools']
        }
      }
    ];
  }

  /**
   * Create MUSAFIR-specific workflows
   */
  private async createMusafirWorkflows(agentName: string): Promise<OpalWorkflowTemplate[]> {
    return [
      {
        id: `musafir-itinerary-${agentName.toLowerCase().replace(/\s+/g, '-')}`,
        name: 'Travel Itinerary Planning',
        description: 'Comprehensive travel itinerary planning workflow',
        category: 'travel_planning',
        agentType: AgentType.MUSAFIR,
        nodes: [
          {
            id: 'travel_input',
            type: 'input' as any,
            name: 'Travel Requirements',
            description: 'Input travel requirements and preferences',
            position: { x: 100, y: 100 },
            config: { schema: 'travel_requirements' },
            inputs: [],
            outputs: [{ id: 'travel_params', name: 'Travel Parameters', type: 'object' }]
          },
          {
            id: 'route_planning',
            type: 'ai_analysis' as any,
            name: 'Route Planning',
            description: 'Plan optimal travel routes',
            position: { x: 300, y: 100 },
            config: { model: 'gemini-2.0-flash-exp', analysisType: 'route_planning' },
            inputs: [{ id: 'params', name: 'Travel Parameters', type: 'object', required: true }],
            outputs: [{ id: 'route_plan', name: 'Route Plan', type: 'object' }]
          },
          {
            id: 'cultural_adaptation',
            type: 'processor' as any,
            name: 'Cultural Adaptation',
            description: 'Adapt itinerary for cultural considerations',
            position: { x: 500, y: 100 },
            config: { algorithm: 'cultural_adaptation' },
            inputs: [{ id: 'route', name: 'Route Plan', type: 'object', required: true }],
            outputs: [{ id: 'cultural_insights', name: 'Cultural Insights', type: 'object' }]
          },
          {
            id: 'itinerary_output',
            type: 'output' as any,
            name: 'Final Itinerary',
            description: 'Generate complete travel itinerary',
            position: { x: 700, y: 100 },
            config: { format: 'travel_itinerary' },
            inputs: [
              { id: 'route_plan', name: 'Route Plan', type: 'object', required: true },
              { id: 'cultural_insights', name: 'Cultural Insights', type: 'object', required: true }
            ],
            outputs: []
          }
        ],
        connections: [
          {
            id: 'c1',
            sourceNodeId: 'travel_input',
            sourceOutputId: 'travel_params',
            targetNodeId: 'route_planning',
            targetInputId: 'params'
          },
          {
            id: 'c2',
            sourceNodeId: 'route_planning',
            sourceOutputId: 'route_plan',
            targetNodeId: 'cultural_adaptation',
            targetInputId: 'route'
          },
          {
            id: 'c3',
            sourceNodeId: 'cultural_adaptation',
            sourceOutputId: 'cultural_insights',
            targetNodeId: 'itinerary_output',
            targetInputId: 'cultural_insights'
          },
          {
            id: 'c4',
            sourceNodeId: 'route_planning',
            sourceOutputId: 'route_plan',
            targetNodeId: 'itinerary_output',
            targetInputId: 'route_plan'
          }
        ],
        metadata: {
          version: '1.0.0',
          author: agentName,
          tags: ['travel', 'itinerary', 'cultural', 'musafir'],
          useCases: ['Business travel', 'Tourism planning', 'Cultural tours'],
          prerequisites: ['Maps integration', 'Cultural database', 'Transport APIs']
        }
      }
    ];
  }

  /**
   * Create SOFRA-specific workflows
   */
  private async createSofraWorkflows(agentName: string): Promise<OpalWorkflowTemplate[]> {
    return [
      {
        id: `sofra-inventory-${agentName.toLowerCase().replace(/\s+/g, '-')}`,
        name: 'Inventory Management',
        description: 'Restaurant inventory optimization workflow',
        category: 'inventory_management',
        agentType: AgentType.SOFRA,
        nodes: [
          {
            id: 'inventory_input',
            type: 'input' as any,
            name: 'Inventory Data',
            description: 'Input current inventory data',
            position: { x: 100, y: 100 },
            config: { schema: 'inventory_data' },
            inputs: [],
            outputs: [{ id: 'inventory_params', name: 'Inventory Parameters', type: 'object' }]
          },
          {
            id: 'demand_forecasting',
            type: 'ai_analysis' as any,
            name: 'Demand Forecasting',
            description: 'Forecast demand using AI',
            position: { x: 300, y: 100 },
            config: { model: 'gemini-2.0-flash-exp', analysisType: 'demand_forecasting' },
            inputs: [{ id: 'params', name: 'Inventory Parameters', type: 'object', required: true }],
            outputs: [{ id: 'demand_forecast', name: 'Demand Forecast', type: 'object' }]
          },
          {
            id: 'optimization',
            type: 'processor' as any,
            name: 'Inventory Optimization',
            description: 'Optimize inventory levels',
            position: { x: 500, y: 100 },
            config: { algorithm: 'inventory_optimization' },
            inputs: [{ id: 'forecast', name: 'Demand Forecast', type: 'object', required: true }],
            outputs: [{ id: 'optimization_plan', name: 'Optimization Plan', type: 'object' }]
          },
          {
            id: 'order_output',
            type: 'output' as any,
            name: 'Purchase Orders',
            description: 'Generate optimized purchase orders',
            position: { x: 700, y: 100 },
            config: { format: 'purchase_orders' },
            inputs: [
              { id: 'demand_forecast', name: 'Demand Forecast', type: 'object', required: true },
              { id: 'optimization_plan', name: 'Optimization Plan', type: 'object', required: true }
            ],
            outputs: []
          }
        ],
        connections: [
          {
            id: 'c1',
            sourceNodeId: 'inventory_input',
            sourceOutputId: 'inventory_params',
            targetNodeId: 'demand_forecasting',
            targetInputId: 'params'
          },
          {
            id: 'c2',
            sourceNodeId: 'demand_forecasting',
            sourceOutputId: 'demand_forecast',
            targetNodeId: 'optimization',
            targetInputId: 'forecast'
          },
          {
            id: 'c3',
            sourceNodeId: 'optimization',
            sourceOutputId: 'optimization_plan',
            targetNodeId: 'order_output',
            targetInputId: 'optimization_plan'
          },
          {
            id: 'c4',
            sourceNodeId: 'demand_forecasting',
            sourceOutputId: 'demand_forecast',
            targetNodeId: 'order_output',
            targetInputId: 'demand_forecast'
          }
        ],
        metadata: {
          version: '1.0.0',
          author: agentName,
          tags: ['inventory', 'optimization', 'restaurant', 'sofra'],
          useCases: ['Inventory management', 'Cost optimization', 'Supply chain'],
          prerequisites: ['Sales data', 'Supplier information', 'Storage capacity']
        }
      }
    ];
  }

  /**
   * Create MOSTASHAR-specific workflows
   */
  private async createMostasharWorkflows(agentName: string): Promise<OpalWorkflowTemplate[]> {
    return [
      {
        id: `mostashar-compliance-${agentName.toLowerCase().replace(/\s+/g, '-')}`,
        name: 'Compliance Checking',
        description: 'Legal compliance checking workflow',
        category: 'compliance',
        agentType: AgentType.MOSTASHAR,
        nodes: [
          {
            id: 'document_input',
            type: 'input' as any,
            name: 'Legal Document',
            description: 'Input legal document for compliance check',
            position: { x: 100, y: 100 },
            config: { schema: 'legal_document' },
            inputs: [],
            outputs: [{ id: 'document_data', name: 'Document Data', type: 'object' }]
          },
          {
            id: 'compliance_analysis',
            type: 'ai_analysis' as any,
            name: 'Compliance Analysis',
            description: 'Analyze document compliance',
            position: { x: 300, y: 100 },
            config: { model: 'gemini-2.0-flash-exp', analysisType: 'compliance_analysis' },
            inputs: [{ id: 'document', name: 'Document Data', type: 'object', required: true }],
            outputs: [{ id: 'compliance_report', name: 'Compliance Report', type: 'object' }]
          },
          {
            id: 'risk_assessment',
            type: 'processor' as any,
            name: 'Risk Assessment',
            description: 'Assess legal risks',
            position: { x: 500, y: 100 },
            config: { algorithm: 'risk_assessment' },
            inputs: [{ id: 'compliance', name: 'Compliance Report', type: 'object', required: true }],
            outputs: [{ id: 'risk_analysis', name: 'Risk Analysis', type: 'object' }]
          },
          {
            id: 'legal_output',
            type: 'output' as any,
            name: 'Legal Opinion',
            description: 'Generate legal opinion and recommendations',
            position: { x: 700, y: 100 },
            config: { format: 'legal_opinion' },
            inputs: [
              { id: 'compliance_report', name: 'Compliance Report', type: 'object', required: true },
              { id: 'risk_analysis', name: 'Risk Analysis', type: 'object', required: true }
            ],
            outputs: []
          }
        ],
        connections: [
          {
            id: 'c1',
            sourceNodeId: 'document_input',
            sourceOutputId: 'document_data',
            targetNodeId: 'compliance_analysis',
            targetInputId: 'document'
          },
          {
            id: 'c2',
            sourceNodeId: 'compliance_analysis',
            sourceOutputId: 'compliance_report',
            targetNodeId: 'risk_assessment',
            targetInputId: 'compliance'
          },
          {
            id: 'c3',
            sourceNodeId: 'risk_assessment',
            sourceOutputId: 'risk_analysis',
            targetNodeId: 'legal_output',
            targetInputId: 'risk_analysis'
          },
          {
            id: 'c4',
            sourceNodeId: 'compliance_analysis',
            sourceOutputId: 'compliance_report',
            targetNodeId: 'legal_output',
            targetInputId: 'compliance_report'
          }
        ],
        metadata: {
          version: '1.0.0',
          author: agentName,
          tags: ['legal', 'compliance', 'risk-assessment', 'mostashar'],
          useCases: ['Contract review', 'Regulatory compliance', 'Risk management'],
          prerequisites: ['Legal database', 'Regulatory frameworks', 'Risk models']
        }
      }
    ];
  }

  /**
   * Initialize agent evolution stage
   */
  private initializeEvolution(agentType: AgentType): EnhancedAgentConfig['evolution'] {
    const stageConfig = {
      [AgentType.TAJER]: { stage: 'genesis' as EvolutionStage, level: 1, experience: 0 },
      [AgentType.MUSAFIR]: { stage: 'genesis' as EvolutionStage, level: 1, experience: 0 },
      [AgentType.SOFRA]: { stage: 'genesis' as EvolutionStage, level: 1, experience: 0 },
      [AgentType.MOSTASHAR]: { stage: 'genesis' as EvolutionStage, level: 1, experience: 0 }
    };

    return stageConfig[agentType];
  }

  /**
   * Upgrade existing agent with Opal capabilities
   */
  async upgradeAgentWithOpal(
    existingAgent: any, 
    agentType: AgentType
  ): Promise<EnhancedAgentConfig> {
    console.log(`🔷 Upgrading agent ${existingAgent.agent_name} with Opal capabilities`);

    try {
      // Get Opal configuration
      const opalConfig = DEFAULT_OPAL_CONFIGS[agentType];
      const opalCapabilities = await this.getOpalCapabilities(agentType);

      // Create Opal workflows
      const workflowTemplates = await this.createAgentWorkflows(agentType, existingAgent.agent_name);

      // Generate cultural context
      const culturalContext = this.generateCulturalContext(agentType);

      // Initialize evolution
      const evolution = this.initializeEvolution(agentType);

      // Create enhanced configuration
      const enhancedConfig: EnhancedAgentConfig = {
        ...existingAgent,
        agent_type: agentType,
        opal_config: {
          ...opalConfig,
          workflowTemplates
        },
        evolution,
        cultural_context: culturalContext
      };

      console.log(`✅ Agent upgraded with Opal capabilities: ${existingAgent.agent_name}`);
      return enhancedConfig;

    } catch (error) {
      console.error("❌ Agent upgrade failed:", error);
      throw new Error("Failed to upgrade agent with Opal capabilities");
    }
  }

  /**
   * Validate agent configuration
   */
  async validateAgentConfig(config: EnhancedAgentConfig): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.agent_name) errors.push("Agent name is required");
    if (!config.core_frequency) errors.push("Core frequency is required");
    if (!config.system_prompt) errors.push("System prompt is required");
    if (!config.agent_type) errors.push("Agent type is required");

    // Validate Opal configuration
    if (!config.opal_config) {
      errors.push("Opal configuration is required");
    } else {
      if (!config.opal_config.opalCapabilities.length) {
        warnings.push("No Opal capabilities configured");
      }
      if (!config.opal_config.workflowTemplates.length) {
        warnings.push("No workflow templates available");
      }
    }

    // Validate wallet
    if (!config.wallet?.publicKey) {
      errors.push("Solana wallet public key is required");
    }

    // Validate cultural context
    if (!config.cultural_context?.region) {
      warnings.push("No region specified in cultural context");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export singleton instance factory
export function createEnhancedAxiomForge(opalIntegration: OpalIntegrationService): EnhancedAxiomForge {
  return new EnhancedAxiomForge(opalIntegration);
}

// Export types
export type { EnhancedAgentConfig };