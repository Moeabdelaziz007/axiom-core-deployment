import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

async function test() {
    console.log("Initializing ChatGoogleGenerativeAI...");
    try {
        const llm = new ChatGoogleGenerativeAI({
            modelName: "gemini-1.5-flash",
            googleApiKey: "AIzaSyATde6PLy8kIj_v6zcVIbOQNqcEKM59XWk",
        });
        console.log("Initialization successful!");
        const res = await llm.invoke("Hello");
        console.log("Response:", res);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
