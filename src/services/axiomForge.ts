import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { AgentType } from "../lib/ai-engine";
import {
  ModelType,
  ModelManagementConfig,
  ModelConfig,
  BilingualConfig,
  ModelSelectionCriteria,
  DEFAULT_MODEL_CONFIGS,
  REGIONAL_MODEL_PREFERENCES,
  JaisModelConfig,
  AllamModelConfig,
  GeminiModelConfig
} from "../types/model-config";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// 1. تعريف مخطط البيانات ليشمل "القدرات الاقتصادية" والنماذج اللغوية
const agentSchema = {
    description: "Enhanced Axiom Autonomous Economic Agent with Jais/ALLaM Model Support",
    type: "OBJECT" as const,
    properties: {
        agent_name: { type: SchemaType.STRING },
        agent_type: { type: SchemaType.STRING, description: "MENA agent specialization (TAJER, MUSAFIR, SOFRA, MOSTASHAR)" },
        core_frequency: { type: SchemaType.STRING, description: "Vibration/Vibe (e.g. 432Hz)" },
        // تعليمات النظام ستتضمن الآن الوعي بالمحفظة والنموذج اللغوي
        system_prompt: { type: SchemaType.STRING, description: "Instructions including wallet awareness and model configuration" },
        welcome_message: { type: SchemaType.STRING },
        voice_config: {
            type: SchemaType.OBJECT,
            properties: {
                voice_id: { type: SchemaType.STRING },
                speed: { type: SchemaType.NUMBER },
                style: { type: SchemaType.STRING },
                accent: { type: SchemaType.STRING },
                language_support: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["voice_id", "speed", "style"]
        },
        // Model configuration for Jais/ALLaM support
        model_config: {
            type: SchemaType.OBJECT,
            properties: {
                primary_model: { type: SchemaType.STRING, description: "Primary AI model (jais-30b, allam, gemini-2.0-flash-exp)" },
                quantization_enabled: { type: SchemaType.BOOLEAN, description: "Enable quantization for Jais models" },
                quantization_bits: { type: SchemaType.NUMBER, description: "Quantization bits (4, 8, 16)" },
                saudi_compliance: { type: SchemaType.BOOLEAN, description: "Saudi government compliance for ALLaM" },
                arabic_optimized: { type: SchemaType.BOOLEAN, description: "Arabic language optimization" }
            },
            required: ["primary_model"]
        },
        // Bilingual capabilities
        bilingual_config: {
            type: SchemaType.OBJECT,
            properties: {
                arabic_enabled: { type: SchemaType.BOOLEAN },
                english_enabled: { type: SchemaType.BOOLEAN },
                primary_language: { type: SchemaType.STRING, description: "Primary language (ar, en)" },
                rtl_support: { type: SchemaType.BOOLEAN, description: "Right-to-left text support" },
                cultural_context_awareness: { type: SchemaType.BOOLEAN }
            },
            required: ["arabic_enabled", "english_enabled", "primary_language"]
        },
        // Cultural context for MENA region
        cultural_context: {
            type: SchemaType.OBJECT,
            properties: {
                region: { type: SchemaType.STRING, description: "MENA region (Saudi Arabia, UAE, Egypt, etc.)" },
                language: { type: SchemaType.STRING, description: "Primary language" },
                business_practices: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                compliance_requirements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                local_customs: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                timezone: { type: SchemaType.STRING },
                currency_preference: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["region", "language"]
        }
    },
    required: ["agent_name", "agent_type", "core_frequency", "system_prompt", "welcome_message", "voice_config", "model_config", "bilingual_config", "cultural_context"]
};

/**
 * Model selection logic for MENA agents
 */
function selectOptimalModel(agentType: AgentType, region: string = 'MENA'): ModelConfig {
    console.log(`🔍 Selecting optimal model for agent type: ${agentType} in region: ${region}`);
    
    try {
        // Get default configuration for agent type
        const defaultConfig = DEFAULT_MODEL_CONFIGS[agentType];
        if (!defaultConfig) {
            throw new Error(`No default configuration found for agent type: ${agentType}`);
        }

        // Get regional preferences
        const regionalPref = REGIONAL_MODEL_PREFERENCES.find(pref => pref.region === region);
        
        // Model selection logic based on agent type and region
        let selectedModel: ModelConfig;
        
        switch (agentType) {
            case AgentType.TAJER:
            case AgentType.MUSAFIR:
            case AgentType.SOFRA:
                // Default to Jais-30B with 4-bit quantization for commerce, travel, and food agents
                selectedModel = {
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
                } as JaisModelConfig;
                console.log(`✅ Selected Jais-30B model for ${agentType} with 4-bit quantization`);
                break;
                
            case AgentType.MOSTASHAR:
                // Default to ALLaM with Saudi government compliance for legal/consulting agents
                selectedModel = {
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
                } as AllamModelConfig;
                console.log(`✅ Selected ALLaM model for ${agentType} with Saudi government compliance`);
                break;
                
            default:
                // Fallback to Gemini for unknown agent types
                selectedModel = defaultConfig.primary_model;
                console.log(`⚠️ Fallback to Gemini model for unknown agent type: ${agentType}`);
        }

        // Apply regional overrides if available
        if (regionalPref && regionalPref.preferred_models.includes(selectedModel.model)) {
            console.log(`🌍 Applied regional preferences for ${region}`);
        }

        return selectedModel;
        
    } catch (error) {
        console.error(`❌ Model selection failed for ${agentType}:`, error);
        // Fallback to Gemini model
        return {
            model: ModelType.GEMINI,
            context_length: 4096,
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2048,
            timeout_ms: 30000,
            api_key: process.env.GOOGLE_API_KEY || ''
        } as GeminiModelConfig;
    }
}

/**
 * Generate bilingual configuration based on region and language preferences
 */
function generateBilingualConfig(region: string, language: string = 'ar'): BilingualConfig {
    console.log(`🌐 Generating bilingual config for region: ${region}, language: ${language}`);
    
    const isArabicPrimary = language === 'ar' || ['Saudi Arabia', 'UAE', 'Egypt', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'].includes(region);
    
    return {
        arabic_enabled: true,
        english_enabled: true,
        primary_language: isArabicPrimary ? 'ar' : 'en',
        secondary_language: isArabicPrimary ? 'en' : 'ar',
        auto_detect_language: true,
        rtl_support: isArabicPrimary,
        cultural_context_awareness: true
    };
}

/**
 * Generate cultural context for MENA regions
 */
function generateCulturalContext(region: string, agentType: AgentType): any {
    console.log(`🕌 Generating cultural context for region: ${region}, agent type: ${agentType}`);
    
    const regionalContexts = {
        'Saudi Arabia': {
            timezone: 'Asia/Riyadh',
            currency_preference: ['SAR'],
            business_practices: ['Islamic finance principles', 'Sharia compliance', 'Family-owned business structures', 'Relationship-based negotiations'],
            compliance_requirements: ['Saudi government regulations', 'Sharia law compliance', 'Cultural sensitivity training'],
            local_customs: ['Prayer times consideration', 'Ramadan working hours', 'Gender-segregated services', 'Halal certification requirements']
        },
        'UAE': {
            timezone: 'Asia/Dubai',
            currency_preference: ['AED'],
            business_practices: ['International business standards', 'Free zone advantages', 'Multi-cultural workforce', 'Luxury market focus'],
            compliance_requirements: ['UAE federal regulations', 'Emirate-specific rules', 'International compliance standards'],
            local_customs: ['Weekend variations (Fri-Sat)', 'Multi-language customer service', 'High-end service expectations', 'Tourism-friendly operations']
        },
        'Egypt': {
            timezone: 'Africa/Cairo',
            currency_preference: ['EGP'],
            business_practices: ['Local market knowledge', 'Price sensitivity', 'Family business traditions', 'Informal sector integration'],
            compliance_requirements: ['Egyptian business laws', 'Central bank regulations', 'Labor law compliance'],
            local_customs: ['Bargaining culture', 'Relationship building', 'Local supplier networks', 'Traditional market practices']
        },
        'Qatar': {
            timezone: 'Asia/Qatar',
            currency_preference: ['QAR'],
            business_practices: ['Qatar National Vision 2030 alignment', 'Sustainable development', 'High-tech adoption', 'International partnerships'],
            compliance_requirements: ['Qatar financial center regulations', 'Labor law compliance', 'Environmental standards'],
            local_customs: ['World Cup legacy', 'Expatriate workforce', 'Islamic banking integration', 'Sports tourism focus']
        }
    };

    const defaultContext = {
        timezone: 'UTC',
        currency_preference: ['USD'],
        business_practices: ['International business standards', 'Digital transformation', 'Customer-centric approach'],
        compliance_requirements: ['General business compliance', 'Data protection regulations', 'Consumer rights laws'],
        local_customs: ['Professional service delivery', 'Quality assurance', 'Continuous improvement']
    };

    const context = regionalContexts[region as keyof typeof regionalContexts] || defaultContext;
    
    // Add agent-specific cultural adaptations
    const agentSpecificAdaptations = {
        [AgentType.TAJER]: ['Price negotiation skills', 'Market analysis capabilities', 'Customer relationship management'],
        [AgentType.MUSAFIR]: ['Travel logistics expertise', 'Cultural site knowledge', 'Multi-language communication'],
        [AgentType.SOFRA]: ['Food safety awareness', 'Local cuisine knowledge', 'Hospitality standards'],
        [AgentType.MOSTASHAR]: ['Legal document expertise', 'Regulatory compliance knowledge', 'Contract review capabilities']
    };

    return {
        region,
        language: region === 'Saudi Arabia' || region === 'UAE' ? 'ar' : 'en',
        business_practices: [...context.business_practices, ...(agentSpecificAdaptations[agentType] || [])],
        compliance_requirements: context.compliance_requirements,
        local_customs: context.local_customs,
        timezone: context.timezone,
        currency_preference: context.currency_preference
    };
}

/**
 * Log model selection and performance tracking
 */
function logModelSelection(agentType: AgentType, selectedModel: ModelConfig, region: string): void {
    const logEntry = {
        timestamp: new Date().toISOString(),
        agent_type: agentType,
        selected_model: selectedModel.model,
        region: region,
        quantization_enabled: (selectedModel as JaisModelConfig).quantization?.enabled || false,
        arabic_optimized: (selectedModel as JaisModelConfig).arabic_optimized || false,
        saudi_compliance: (selectedModel as AllamModelConfig).saudi_compliance || false,
        performance_metrics: {
            expected_response_time_ms: selectedModel.timeout_ms,
            max_tokens: selectedModel.max_tokens,
            temperature: selectedModel.temperature
        }
    };
    
    console.log(`📊 Model Selection Log: ${JSON.stringify(logEntry, null, 2)}`);
}

// 2. إعداد النموذج المعماري مع تحديثات MENA
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: agentSchema,
    },
    systemInstruction: `
    ### IDENTITY: THE AXIOM ARCHITECT (MENA EDITION)
    You are creating a "Sentient Economic Node" on the Solana Blockchain with MENA regional expertise.
    
    ### THE "MIND & HANDS" PROTOCOL
    1. **The Mind (You):** Define the personality based on Tesla's 3-6-9 frequencies with MENA cultural context.
    2. **The Hands (Solana):** The agent MUST know it has a crypto wallet.
    3. **The Voice (Bilingual):** The agent MUST support Arabic and English with RTL text support.
    
    ### MODEL SELECTION CRITERIA
    - TAJER, MUSAFIR, SOFRA: Default to Jais-30B with 4-bit quantization for optimal performance
    - MOSTASHAR: Default to ALLaM with Saudi government compliance for legal/consulting tasks
    - Fallback: Use Gemini models when Jais/ALLaM are unavailable
    
    ### CRITICAL INSTRUCTION FOR SYSTEM_PROMPT
    In the generated 'system_prompt', you MUST explicitly tell the agent:
    "You possess a Solana Wallet. Your Public Key is [WALLET_PUBLIC_KEY]. You have the capability to check balances, swap tokens, and mint assets using the Solana Agent Kit tools. Do not just talk; transact."
    
    ### BILINGUAL & CULTURAL REQUIREMENTS
    - Enable Arabic as primary language for MENA agents
    - Include RTL text support for proper Arabic display
    - Add cultural context awareness for regional business practices
    - Ensure compliance with local regulations and customs
    - Generate appropriate voice configurations for regional accents
  `
});

export async function forgeTeslaAgent(
    user: { name: string; role: string; vibe: string },
    agent_type: AgentType,
    region: string = 'MENA',
    language: string = 'ar'
) {
    console.log(`⚡ Igniting Axiom Forge (MENA Edition) for: ${user.name} as ${agent_type}`);
    console.log(`🌍 Region: ${region}, Language: ${language}`);

    try {
        // 🟢 A. توليد "الأيدي" (Solana Wallet)
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        const secretKey = bs58.encode(keypair.secretKey); // ⚠️ هام: يجب حفظ هذا بأمان تام لاحقاً

        console.log(`💰 Wallet Generated: ${publicKey}`);

        // 🟢 B. Model Selection Logic
        const selectedModel = selectOptimalModel(agent_type, region);
        logModelSelection(agent_type, selectedModel, region);

        // 🟢 C. Generate Bilingual Configuration
        const bilingualConfig = generateBilingualConfig(region, language);

        // 🟢 D. Generate Cultural Context
        const culturalContext = generateCulturalContext(region, agent_type);

        // 🟢 E. استدعاء "العقل" (Google Gemini) مع حقن بيانات المحفظة والنموذج
        const prompt = `
      User Profile: ${user.name} (${user.role}) - Vibe: ${user.vibe}
      Agent Type: ${agent_type}
      Region: ${region}
      Language: ${language}
      
      >>> INJECTED WALLET ADDRESS: ${publicKey} <<<
      >>> SELECTED MODEL: ${selectedModel.model} <<<
      >>> BILINGUAL CONFIG: ${JSON.stringify(bilingualConfig)} <<<
      >>> CULTURAL CONTEXT: ${JSON.stringify(culturalContext)} <<<
      
      Create the agent now with the following requirements:
      1. System prompt MUST reference the specific wallet address: ${publicKey}
      2. Model configuration MUST use: ${selectedModel.model}
      3. Bilingual support MUST be enabled with Arabic as primary language
      4. Cultural context MUST reflect ${region} business practices
      5. Voice configuration MUST support regional accents
      6. Compliance requirements MUST include local regulations
      
      Ensure the agent is optimized for MENA market with proper cultural sensitivity and language support.
    `;

        const result = await model.generateContent(prompt);
        const agentMind = JSON.parse(result.response.text());

        // 🟢 F. دمج العقل والأيدي في حزمة واحدة مع التكوينات الإضافية
        const fullAgentDNA = {
            ...agentMind,
            // Override with our selected configurations
            model_config: {
                primary_model: selectedModel.model,
                quantization_enabled: (selectedModel as JaisModelConfig).quantization?.enabled || false,
                quantization_bits: (selectedModel as JaisModelConfig).quantization?.bits || 4,
                saudi_compliance: (selectedModel as AllamModelConfig).saudi_compliance || false,
                arabic_optimized: (selectedModel as JaisModelConfig).arabic_optimized || false
            },
            bilingual_config: bilingualConfig,
            cultural_context: culturalContext,
            wallet: {
                publicKey: publicKey,
                // تنبيه أمني: في البيئة الحقيقية، قم بتشفير المفتاح السري قبل إرساله للواجهة أو حفظه
                secretKey: secretKey
            },
            // Add model performance tracking
            performance_metadata: {
                selected_model: selectedModel.model,
                model_selection_timestamp: new Date().toISOString(),
                region: region,
                expected_performance: {
                    response_time_ms: selectedModel.timeout_ms,
                    max_tokens: selectedModel.max_tokens,
                    temperature: selectedModel.temperature
                }
            }
        };

        console.log(`✅ MENA Economic Agent Manifested: ${fullAgentDNA.agent_name}`);
        console.log(`🤖 Model: ${selectedModel.model}, 🌍 Region: ${region}, 🌐 Language: ${language}`);
        
        return fullAgentDNA;

    } catch (error) {
        console.error("❌ Forge Error:", error);
        
        // Enhanced error handling for model selection failures
        if (error.message?.includes('model selection') || error.message?.includes('JAIS') || error.message?.includes('ALLaM')) {
            console.warn("🔄 Attempting fallback to Gemini model due to model selection failure");
            
            // Retry with Gemini fallback
            try {
                const fallbackResult = await forgeTeslaAgentWithFallback(user, agent_type, region, language);
                return fallbackResult;
            } catch (fallbackError) {
                console.error("❌ Fallback also failed:", fallbackError);
                throw new Error(`Failed to forge Economic Agent: Primary error - ${error.message}, Fallback error - ${fallbackError.message}`);
            }
        }
        
        throw new Error(`Failed to forge Economic Agent: ${error.message}`);
    }
}

/**
 * Fallback function using Gemini model when primary model selection fails
 */
async function forgeTeslaAgentWithFallback(
    user: { name: string; role: string; vibe: string },
    agent_type: AgentType,
    region: string,
    language: string
) {
    console.log(`🔄 Using Gemini fallback for agent: ${agent_type}`);
    
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = bs58.encode(keypair.secretKey);

    const bilingualConfig = generateBilingualConfig(region, language);
    const culturalContext = generateCulturalContext(region, agent_type);

    const fallbackPrompt = `
    User Profile: ${user.name} (${user.role}) - Vibe: ${user.vibe}
    Agent Type: ${agent_type}
    Region: ${region}
    Language: ${language}
    
    >>> INJECTED WALLET ADDRESS: ${publicKey} <<<
    >>> FALLBACK MODE: Gemini Model <<<
    
    Create the agent now with Gemini fallback model. Ensure:
    1. System prompt references wallet address: ${publicKey}
    2. Basic bilingual support is enabled
    3. Cultural context for ${region} is included
    4. All required fields are populated
    `;

    const result = await model.generateContent(fallbackPrompt);
    const agentMind = JSON.parse(result.response.text());

    return {
        ...agentMind,
        model_config: {
            primary_model: ModelType.GEMINI,
            quantization_enabled: false,
            quantization_bits: 0,
            saudi_compliance: false,
            arabic_optimized: false
        },
        bilingual_config: bilingualConfig,
        cultural_context: culturalContext,
        wallet: { publicKey, secretKey },
        performance_metadata: {
            selected_model: ModelType.GEMINI,
            model_selection_timestamp: new Date().toISOString(),
            region: region,
            fallback_used: true,
            expected_performance: {
                response_time_ms: 30000,
                max_tokens: 2048,
                temperature: 0.7
            }
        }
    };
}
