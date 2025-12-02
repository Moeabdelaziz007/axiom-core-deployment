import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import Groq from 'groq-sdk';

// Environment validation
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const VERCEL_AI_KEY = process.env.VERCEL_AI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY is not defined in environment variables.');
}

if (!VERCEL_AI_KEY) {
  console.warn('⚠️ VERCEL_AI_KEY is not defined in environment variables. Vercel Pro Gateway will be unavailable.');
}

if (!GOOGLE_API_KEY) {
  console.warn('⚠️ GOOGLE_API_KEY is not defined in environment variables. Google Gemini features will be unavailable.');
}

// 1. Direct Groq SDK (for compatibility)
export const groqDirect = new Groq({
  apiKey: GROQ_API_KEY || 'dummy_key',
});

// 2. Groq via Vercel Gateway (BYOK - Bring Your Own Key)
// Benefits: Free Inference (Groq) + Free Observability (Vercel)
const groqViaGateway = createOpenAI({
  name: 'groq',
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: GROQ_API_KEY,
});

// 3. Vercel Pro Gateway (Uses $5 Free Credit)
// Use only for high-intelligence tasks (Judge/Emergency)
const vercelProGateway = createOpenAI({
  name: 'vercel',
  apiKey: VERCEL_AI_KEY,
});

// 4. Google Gemini Provider (Advanced AI Capabilities)
const googleProvider = createGoogleGenerativeAI({ apiKey: GOOGLE_API_KEY || '' });

// DEBUG: Log Google provider info
console.log('🔍 DEBUG: Google provider type:', typeof googleProvider);
console.log('🔍 DEBUG: Available Google models:', Object.getOwnPropertyNames(googleProvider));

// Test different model names to see what works
let testModel;
try {
  testModel = googleProvider('gemini-1.5-flash');
  console.log('🔍 DEBUG: gemini-1.5-flash model created successfully');
  console.log('🔍 DEBUG: gemini-1.5-flash model methods:', Object.getOwnPropertyNames(testModel));
  console.log('🔍 DEBUG: gemini-1.5-flash model specificationVersion:', testModel.specificationVersion);
} catch (error) {
  console.error('🔍 DEBUG: Failed to create gemini-1.5-flash model:', error);
}

// Unified model selection system
export const AI_MODELS = {
  // 👷 Workers: Fast, Free, Infinite (Groq)
  WORKER_FAST: groqViaGateway('llama-3.1-8b-instant'),
  WORKER_SMART: groqViaGateway('llama-3.3-70b-versatile'),
  
  // ⚖️ Judge: Smart, Paid (Uses $5 Credit), Emergency Only
  JUDGE: vercelProGateway('gpt-4o'),
  
  // 🧠 Google Gemini Models (Advanced Capabilities) - Use models that support v2 specification
  GOOGLE_RESEARCH: googleProvider('gemini-1.5-flash'),
  GOOGLE_VISION: googleProvider('gemini-1.5-flash'),
  GOOGLE_STRUCTURED: googleProvider('gemini-1.5-flash'),
  
  // 🔄 Legacy compatibility (maps to old GROQ_MODELS)
  FAST: 'llama3-8b-8192',
  SMART: 'llama3-70b-8192',
  MIXTRAL: 'mixtral-8x7b-32768',
};

// Environment-aware model selection
export function getModel(modelType: 'FAST' | 'SMART' | 'JUDGE' | 'WORKER_FAST' | 'WORKER_SMART') {
  switch (modelType) {
    case 'FAST':
      return AI_MODELS.WORKER_FAST;
    case 'SMART':
      return AI_MODELS.WORKER_SMART;
    case 'JUDGE':
      if (!VERCEL_AI_KEY) {
        console.warn('⚠️ JUDGE model requested but VERCEL_AI_KEY not available. Falling back to SMART model.');
        return AI_MODELS.WORKER_SMART;
      }
      return AI_MODELS.JUDGE;
    case 'WORKER_FAST':
      return AI_MODELS.WORKER_FAST;
    case 'WORKER_SMART':
      return AI_MODELS.WORKER_SMART;
    default:
      console.warn(`⚠️ Unknown model type: ${modelType}. Falling back to FAST model.`);
      return AI_MODELS.WORKER_FAST;
  }
}

// Health check function
export function checkAIEnvironment() {
  const health = {
    groqAvailable: !!GROQ_API_KEY,
    vercelProAvailable: !!VERCEL_AI_KEY,
    googleAvailable: !!GOOGLE_API_KEY,
    recommendedModel: 'WORKER_FAST' as const,
  };
  
  if (!health.groqAvailable) {
    console.error('🚨 CRITICAL: GROQ_API_KEY is required for basic functionality.');
  }
  
  if (!health.vercelProAvailable) {
    console.warn('⚠️ WARNING: VERCEL_AI_KEY not available. JUDGE model will fall back to SMART.');
  }
  
  if (!health.googleAvailable) {
    console.warn('⚠️ WARNING: GOOGLE_API_KEY not available. Google Gemini features will be unavailable.');
  }
  
  return health;
}

// Google Gemini Advanced Functions

/**
 * Research with Google Search Grounding
 * Uses Gemini 1.5 Flash with Google Search for up-to-date information
 */
export async function researchWithGoogle(query: string): Promise<{
  response: string;
  searchQueries?: string[];
  sources?: string[];
  error?: string;
}> {
  try {
    if (!GOOGLE_API_KEY) {
      return {
        response: '',
        error: 'GOOGLE_API_KEY is not configured. Please set the environment variable.'
      };
    }

    const model = AI_MODELS.GOOGLE_RESEARCH;
    
    // DEBUG: Log model type and available methods
    console.log('🔍 DEBUG: Google Research model type:', typeof model);
    console.log('🔍 DEBUG: Google Research model methods:', Object.getOwnPropertyNames(model));
    // console.log('🔍 DEBUG: Google Research model.generateText type:', typeof model.generateText);
    console.log('🔍 DEBUG: Google Research model specificationVersion:', model.specificationVersion);
    console.log('🔍 DEBUG: Google Research model provider:', model.provider);
    
    // Use the correct Vercel AI SDK pattern
    console.log('🔍 DEBUG: Using generateText(model) pattern...');
    const { text } = await generateText({
      model,
      prompt: `Research and provide comprehensive information about: ${query}`,
      tools: [
        {
          name: 'google_search'
        }
      ]
    });
    console.log('🔍 DEBUG: generateText(model) pattern succeeded');

    // Extract search metadata if available
    let searchQueries: string[] = [];
    let sources: string[] = [];

    // Note: The actual search metadata extraction would depend on the Vercel AI SDK implementation
    // This is a placeholder structure - you may need to adjust based on actual response format

    return {
      response: text,
      searchQueries,
      sources
    };
  } catch (error) {
    console.error('Error in researchWithGoogle:', error);
    return {
      response: '',
      error: `Failed to research with Google: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Analyze Image with Google Vision
 * Uses Gemini 1.5 Pro Vision for advanced image analysis
 */
export async function analyzeImage(imageUrl: string, prompt: string): Promise<{
  response: string;
  error?: string;
}> {
  try {
    if (!GOOGLE_API_KEY) {
      return {
        response: '',
        error: 'GOOGLE_API_KEY is not configured. Please set the environment variable.'
      };
    }

    const model = AI_MODELS.GOOGLE_VISION;
    
    // DEBUG: Log model type and available methods
    console.log('🔍 DEBUG: Google Vision model type:', typeof model);
    console.log('🔍 DEBUG: Google Vision model methods:', Object.getOwnPropertyNames(model));
    console.log('🔍 DEBUG: Google Vision model.generateText type:', typeof model.generateText);
    console.log('🔍 DEBUG: Google Vision model specificationVersion:', model.specificationVersion);
    console.log('🔍 DEBUG: Google Vision model provider:', model.provider);
    
    // Fetch image data
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');
    
    // Use Vercel AI SDK's generateText with image
    const { text } = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              image: `data:image/jpeg;base64,${base64Image}`
            }
          ]
        }
      ]
    });

    return {
      response: text
    };
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    return {
      response: '',
      error: `Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate Structured Data with Google Gemini
 * Uses Gemini 1.5 Pro with structured output capabilities
 */
export async function generateStructuredData<T>(
  prompt: string,
  schema: any
): Promise<{
  data: T | null;
  error?: string;
}> {
  try {
    if (!GOOGLE_API_KEY) {
      return {
        data: null,
        error: 'GOOGLE_API_KEY is not configured. Please set the environment variable.'
      };
    }

    const model = AI_MODELS.GOOGLE_STRUCTURED;
    
    // DEBUG: Log model type and available methods
    console.log('🔍 DEBUG: Google Structured model type:', typeof model);
    console.log('🔍 DEBUG: Google Structured model methods:', Object.getOwnPropertyNames(model));
    console.log('🔍 DEBUG: Google Structured model specificationVersion:', model.specificationVersion);
    console.log('🔍 DEBUG: Google Structured model provider:', model.provider);
    
    // Use Vercel AI SDK's generateObject for structured output
    const { object } = await generateObject({
      model,
      prompt: prompt + "\n\nSchema Requirements:\n" + JSON.stringify(schema, null, 2),
      schema: z.any(),
      mode: 'json'
    });

    return {
      data: object
    };
  } catch (error) {
    console.error('Error in generateStructuredData:', error);
    return {
      data: null,
      error: `Failed to generate structured data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Export unified clients for different use cases
export const aiEngine = {
  // Direct Groq SDK (for legacy compatibility)
  groq: groqDirect,
  
  // Gateway clients (recommended)
  groqGateway: groqViaGateway,
  vercelGateway: vercelProGateway,
  googleProvider,
  
  // Model selection
  getModel,
  checkEnvironment: checkAIEnvironment,
  
  // Model constants
  models: AI_MODELS,
  
  // Google Gemini Advanced Functions
  researchWithGoogle,
  analyzeImage,
  generateStructuredData,
};

// Export for easy migration from old files
export { groqDirect as groq };
export { AI_MODELS as GROQ_MODELS };