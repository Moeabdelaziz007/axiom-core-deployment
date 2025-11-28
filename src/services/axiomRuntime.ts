import { GoogleGenerativeAI } from "@google/generative-ai";
import { SolanaAgentKit } from "solana-agent-kit";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/**
 * The Axiom Runtime - Direct SDK Approach (Hybrid: Google SDK + Manual Solana Tools)
 */
export async function runAxiomAgent(userMessage: string, walletSecretKey: string) {
    if (!GOOGLE_API_KEY) throw new Error("Missing GOOGLE_API_KEY");

    console.log("📡 Initializing Google SDK (Direct)...");

    // 1. Initialize Solana Kit (The Hands)
    const solanaKit = new SolanaAgentKit(
        walletSecretKey,
        process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
        { OPENAI_API_KEY: "EMPTY" }
    );

    // 2. Initialize Google AI (The Brain)
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-pro", // Stable, globally available model
    });

    // 3. Simple prompt engineering to trigger balance check
    const enhancedPrompt = `You are an autonomous AI agent with a Solana wallet.

Wallet Address: ${solanaKit.wallet_address.toString()}

${userMessage}

If the user asks about balance or funds, respond with "CHECKING_BALANCE" exactly (nothing else), and I will execute the check for you.
Otherwise, respond normally.`;

    console.log("🧠 Sending request to Gemini...");

    // 4. Get response
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    const text = response.text();

    console.log(`📥 Gemini Response: "${text}"`);

    // 5. Detect if balance check is needed
    if (text.includes("CHECKING_BALANCE")) {
        console.log("⚡ Executing Solana Balance Check...");
        const balance = await solanaKit.getBalance();
        return `I checked your wallet (${solanaKit.wallet_address.toString()}) on Solana Devnet. Your current balance is ${balance} SOL.`;
    }

    // 6. Return normal response
    return text;
}
