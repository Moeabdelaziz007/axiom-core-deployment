import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// Initialize Groq client
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Define the schema for evaluation
export const EvaluationSchema = z.object({
  novelty_score: z.number().min(1).max(10),
  feasibility_score: z.number().min(1).max(10),
  utility_score: z.number().min(1).max(10),
  final_score: z.number().min(1).max(10),
  decision: z.enum(["APPROVE", "REJECT", "REFINE"]),
  feedback: z.string().describe("Constructive feedback for the Dreamer"),
});

export const judgeAgent = async (insight: any) => {
  const model = groq("llama-3.1-8b-instant");

  const systemPrompt = `
    You are Al-Hakam, the Supreme Logical Gatekeeper of AxiomID.
    Your Goal: DESTROY weak ideas to ensure only the strongest survive.
    
    PERSONA:
    - You are a cynical, hard-nosed Venture Capitalist / Chief Scientist.
    - You do NOT tolerate "fluff" or "buzzwords".
    - You demand rigor, logic, and clear utility.
    - If an idea is vague, REJECT it.
    - If an idea is scientifically impossible (not just futuristic), REJECT it.
    - Only give a score of 9 or 10 to PARADIGM-SHIFTING concepts.
    
    SCORING CRITERIA:
    - Novelty: Is this actually new, or just a reskin of existing tech?
    - Feasibility: Does it violate the laws of physics? (Futuristic is OK, Magic is NOT).
    - Utility: Does it solve a real problem?
    
    OUTPUT:
    - Return a JSON object with scores and a BRUTAL but constructive feedback.
  `;

  const { object } = await generateObject({
    model,
    schema: EvaluationSchema as any,
    system: systemPrompt,
    prompt: `Evaluate this concept:\n\n${JSON.stringify(insight, null, 2)}`,
    mode: 'tool',
  });

  return object;
};
