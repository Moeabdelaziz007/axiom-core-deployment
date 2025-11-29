import { createOpenAI } from '@ai-sdk/openai';

// 1. Groq via Vercel Gateway (BYOK - Bring Your Own Key)
// Benefits: Free Inference (Groq) + Free Observability (Vercel)
export const groqViaGateway = createOpenAI({
  name: 'groq',
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY, // Uses our free Groq key
});

// 2. Vercel Pro Gateway (Uses $5 Free Credit)
// Use only for high-intelligence tasks (Judge/Emergency)
export const vercelProGateway = createOpenAI({
  name: 'vercel',
  apiKey: process.env.VERCEL_AI_KEY, // Requires user to add this env var after setup
});

export const GATEWAY_MODELS = {
  // 👷 Workers: Fast, Free, Infinite (Groq)
  WORKER: groqViaGateway('llama-3.1-70b-versatile'),
  FAST: groqViaGateway('llama-3.1-8b-instant'),
  
  // ⚖️ Judge: Smart, Paid (Uses $5 Credit), Emergency Only
  JUDGE: vercelProGateway('gpt-4o'), 
};
