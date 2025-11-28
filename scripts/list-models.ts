import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyATde6PLy8kIj_v6zcVIbOQNqcEKM59XWk";

async function testGeneration() {
    console.log("🧪 Testing Generation with gemini-1.5-flash...");
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent("Hello, are you alive?");
        console.log("✅ Generation Successful!");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("❌ Generation Failed:", error);
    }
}

testGeneration();
