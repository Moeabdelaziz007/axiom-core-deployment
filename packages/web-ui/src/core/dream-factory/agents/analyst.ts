import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// Initialize Groq client
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Define the schema for the output
export const InsightSchema = z.object({
  concept_title: z.string().describe("A catchy title for the invented concept"),
  core_mechanism: z.string().describe("The primary technical mechanism (e.g., 'Bio-Sharding')"),
  security_layer: z.string().describe("How security is handled"),
  feasibility_assessment: z.string().describe("Assessment of theoretical viability"),
  target_problem: z.string().describe("The problem being solved"),
  entities: z.array(z.string()).describe("Key entities involved (e.g., 'BioChain Node')"),
});

export const analystAgent = async (dreamLog: string) => {
  const model = groq("llama-3.1-8b-instant");

  const systemPrompt = `
    You are Al-Muhaqqiq (The Analyst), a hyper-logical systems architect.
    Your goal is to extract structured technical specifications from the chaotic "Dream Logs" of Al-Khayal.
    
    PROTOCOL:
    1. **Pattern Recognition**: Identify the core technical innovation hidden in the narrative.
    2. **Structure**: Map the dream concepts to concrete technical terms (e.g., "Fireflies" -> "Li-Fi Nodes").
    3. **Feasibility Check**: Assess if this is theoretically possible (even if futuristic).
    4. **Output**: Return ONLY a valid JSON object matching the schema.
  `;

  const { object } = await generateObject({
    model,
    schema: InsightSchema as any,
    system: systemPrompt,
    prompt: `Analyze this Dream Log:\n\n${dreamLog}`,
    mode: 'tool',
  });

  return object;
};
