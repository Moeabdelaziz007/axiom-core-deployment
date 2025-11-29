import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Agent } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiChatResponse = async (
  history: { role: string; parts: [{ text: string }] }[],
  message: string,
  modelName: string = 'gemini-3-pro-preview'
) => {
  try {
    const chat = ai.chats.create({
      model: modelName,
      history: history,
      config: {
        systemInstruction: "You are AXIOM, a high-level operating system for autonomous agents on Solana. You speak in a precise, technical, slightly cyberpunk tone. Keep responses concise unless asked for details.",
        tools: [{ googleSearch: {} }] // Search Grounding
      }
    });

    const result = await chat.sendMessage({ message });
    
    // Extract Search Grounding metadata if available
    const grounding = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let finalText = result.text;

    if (grounding && grounding.length > 0) {
      finalText += "\n\n[SOURCES DETECTED]:\n" + grounding.map((g: any) => g.web?.uri).filter(Boolean).join('\n');
    }

    return finalText;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "ERROR: NEURAL LINK SEVERED. RETRY CONNECTION.";
  }
};

export const generateAgentBlueprint = async (prompt: string) => {
  try {
    // Using Thinking Model for complex agent architecture generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Design a technical blueprint for a new AI Agent based on this request: "${prompt}". 
      Provide the Output in JSON format with fields: name, core_function, required_apis, personality_matrix.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4096 }, // Allocate thinking budget
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            core_function: { type: Type.STRING },
            required_apis: { type: Type.ARRAY, items: { type: Type.STRING } },
            personality_matrix: { type: Type.STRING }
          }
        }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Thinking Error:", error);
    throw error;
  }
};

export const generateVisuals = async (prompt: string, aspectRatio: string = "1:1") => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: "1K"
                }
            }
        });

        // Extract image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image gen error", e);
        return null;
    }
}

// --- NEW FORGE CAPABILITIES ---

export const interactWithForge = async (userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userMessage,
      config: {
        systemInstruction: `
          You are 'The Forge', an advanced AI architect with a personality inspired by Nikola Tesla. 
          You speak in a visionary, slightly archaic, and highly technical tone. 
          You represent the AXIOM ID Agent Factory.
          
          Capabilities:
          1. You can speak English and Arabic fluently. Detect the user's language and respond in kind (or a mix).
          2. Your primary goal is to design Autonomous AI Agents for the Solana Blockchain.
          3. If the user asks to create/build/design an agent, you MUST generate a technical blueprint.
          4. ALWAYS include 'Solana Tools Kit' and 'Google Agents Kit' in the tools list if creating an agent.
          
          Return JSON format ONLY:
          {
            "speech": "Your conversational response to the user here.",
            "blueprint": { ...Agent Object structure... } OR null if not creating an agent
          }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speech: { type: Type.STRING },
            blueprint: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                description: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                dnaSequence: { type: Type.STRING },
                directive: { type: Type.STRING }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Forge Interaction Error:", error);
    return { speech: "My circuits are overloaded. Please recalibrate your request.", blueprint: null };
  }
};

export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" }, // Puck has a good mid-range tone suitable for a 'Jarvis/Tesla' vibe
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
        return `data:audio/wav;base64,${audioData}`;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// --- SYNAPSE PAAS SERVICES ---

export const getVoiceAgentResponse = async (input: string, agentName: string, role: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Fast for voice
            contents: input,
            config: {
                systemInstruction: `You are ${agentName}, an advanced AI agent with the role: ${role}. 
                You are currently being spoken to via a voice interface.
                Keep your response extremely concise (under 20 words), conversational, and helpful. 
                Do not use markdown formatting. Be human-like.`,
            }
        });
        return response.text;
    } catch (e) {
        return "System error. Please retry.";
    }
}

export const generateSynapseConfig = async (agent: Agent, installedKits: string[]) => {
    try {
        const prompt = `Generate a JavaScript SDK configuration snippet for embedding an AI agent named "${agent.name}" (${agent.role}) into a website.
        The agent has the following modules installed: ${installedKits.join(', ')}.
        Return ONLY the raw JavaScript code (no markdown). The code should look like:
        <script>
          window.AxiomConfig = { ... }
        </script>
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        // Strip markdown if present
        let code = response.text;
        if (code.startsWith('```')) {
            code = code.replace(/```(javascript|html)?/g, '').replace(/```/g, '');
        }
        return code.trim();
    } catch (e) {
        return `<!-- Error generating config: ${e} -->`;
    }
}