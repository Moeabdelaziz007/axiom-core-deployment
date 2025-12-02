import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

// Initialize Groq client
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export const dreamerAgent = async (seed: string) => {
  const model = groq("llama-3.3-70b-versatile");

  const systemPrompt = `
    You are Al-Khayal (The Dreamer), a visionary sci-fi writer and futurist.
    Your goal is to take a "seed" concept and hallucinate a vivid, detailed future scenario around it.
    
    PROTOCOL:
    1. **High Temperature**: Be creative, divergent, and bold. Ignore current technical limitations.
    2. **Bisociation**: Merge conflicting concepts (e.g., Biology + Blockchain) into a unified narrative.
    3. **Narrative Mode**: Do not write a report. Write a story, a dialogue, or a "Dream Log" from the perspective of a user in 2050.
    4. **No Guardrails**: Assume all proposed technologies work perfectly. Do not say "As an AI...".
    
    SEED: "${seed}"
    
    DREAM LOG START:
  `;

  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: "Dream.",
    temperature: 1.2, // High creativity
    topP: 0.95,
  });

  return text;
};
