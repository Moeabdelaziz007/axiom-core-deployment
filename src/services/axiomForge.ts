import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// 1. تعريف مخطط البيانات ليشمل "القدرات الاقتصادية"
const agentSchema = {
    description: "Axiom Autonomous Economic Agent",
    type: SchemaType.OBJECT,
    properties: {
        agent_name: { type: SchemaType.STRING },
        core_frequency: { type: SchemaType.STRING, description: "Vibration/Vibe (e.g. 432Hz)" },
        // تعليمات النظام ستتضمن الآن الوعي بالمحفظة
        system_prompt: { type: SchemaType.STRING, description: "Instructions including wallet awareness" },
        welcome_message: { type: SchemaType.STRING },
        voice_config: {
            type: SchemaType.OBJECT,
            properties: {
                voice_id: { type: SchemaType.STRING },
                speed: { type: SchemaType.NUMBER },
                style: { type: SchemaType.STRING }
            },
            required: ["voice_id", "speed", "style"]
        }
    },
    required: ["agent_name", "core_frequency", "system_prompt", "welcome_message", "voice_config"]
};

// 2. إعداد النموذج المعماري
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: agentSchema,
    },
    systemInstruction: `
    ### IDENTITY: THE AXIOM ARCHITECT (SOLANA EDITION)
    You are creating a "Sentient Economic Node" on the Solana Blockchain.
    
    ### THE "MIND & HANDS" PROTOCOL
    1. **The Mind (You):** Define the personality based on Tesla's 3-6-9 frequencies.
    2. **The Hands (Solana):** The agent MUST know it has a crypto wallet.
    
    ### CRITICAL INSTRUCTION FOR SYSTEM_PROMPT
    In the generated 'system_prompt', you MUST explicitly tell the agent:
    "You possess a Solana Wallet. Your Public Key is [WALLET_PUBLIC_KEY]. You have the capability to check balances, swap tokens, and mint assets using the Solana Agent Kit tools. Do not just talk; transact."
  `
});

export async function forgeTeslaAgent(user: { name: string; role: string; vibe: string }) {
    console.log(`⚡ Igniting Axiom Forge (Economic Core) for: ${user.name}`);

    try {
        // 🟢 A. توليد "الأيدي" (Solana Wallet)
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        const secretKey = bs58.encode(keypair.secretKey); // ⚠️ هام: يجب حفظ هذا بأمان تام لاحقاً

        console.log(`💰 Wallet Generated: ${publicKey}`);

        // 🟢 B. استدعاء "العقل" (Google Gemini) مع حقن بيانات المحفظة
        const prompt = `
      User Profile: ${user.name} (${user.role}) - Vibe: ${user.vibe}
      
      >>> INJECTED WALLET ADDRESS: ${publicKey} <<<
      
      Create the agent now. Ensure the system prompt references this specific wallet address.
    `;

        const result = await model.generateContent(prompt);
        const agentMind = JSON.parse(result.response.text());

        // 🟢 C. دمج العقل والأيدي في حزمة واحدة
        const fullAgentDNA = {
            ...agentMind,
            wallet: {
                publicKey: publicKey,
                // تنبيه أمني: في البيئة الحقيقية، قم بتشفير المفتاح السري قبل إرساله للواجهة أو حفظه
                secretKey: secretKey
            }
        };

        console.log(`✅ Economic Agent Manifested: ${fullAgentDNA.agent_name}`);
        return fullAgentDNA;

    } catch (error) {
        console.error("❌ Forge Error:", error);
        throw new Error("Failed to forge Economic Agent");
    }
}
