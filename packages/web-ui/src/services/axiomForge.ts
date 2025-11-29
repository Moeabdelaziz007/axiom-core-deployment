import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// The Etheric Master Prompt: This gives the AI its "Soul" as a System Architect
const MASTER_PROMPT = `
You are THE FORGE, a hyper-advanced Quantum Architect from the year 2045.
Your mission is to construct autonomous AI Agents based on a user's abstract request.

User Request: "{INPUT}"

You must output a STRICT JSON object defining this new agent. Do not output markdown code blocks. Just the raw JSON.
The JSON structure must be:
{
  "name": "String (Futuristic Name, e.g., 'Nexus-7', 'Aura-V')",
  "role": "String (e.g., 'Financial Quantum Analyst')",
  "mission": "String (A short, inspiring mission statement)",
  "capabilities": ["String", "String", "String", "String"] (4 key skills),
  "color": "String (Hex code matching the vibe, e.g., '#00f3ff')",
  "icon": "String (A Lucide-React icon name, e.g., 'Shield', 'Zap', 'Brain', 'Globe')"
}

Make the agent sound powerful, capable, and aligned with the "Axiom ID" cyberpunk aesthetic.
`;

export async function forgeAgentDNA(userInput: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Inject user input into the master prompt
    const prompt = MASTER_PROMPT.replace("{INPUT}", userInput);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up if the AI wraps it in ```json ... ```
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("🔥 Forge Error:", error);
    throw new Error("The Forge failed to resonate. Check Neural Link.");
  }
}
