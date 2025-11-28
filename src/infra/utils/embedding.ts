/**
 * Narrative Embedding Utility
 * Part of QCC Phase 4: Cognitive Core
 * 
 * Generates vector embeddings for narrative text using OpenAI API.
 * Designed for Cloudflare Workers environment.
 */

export interface Env {
    OPENAI_API_KEY: string;
}

/**
 * Generates a vector embedding for the provided text.
 * 
 * @param text The narrative text to embed.
 * @param env The worker environment containing API keys.
 * @returns A promise resolving to the embedding vector (array of numbers).
 */
export async function generateNarrativeEmbedding(text: string, env: Env): Promise<number[]> {
    const apiKey = env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not defined in the environment.");
    }

    const url = "https://api.openai.com/v1/embeddings";
    const model = "text-embedding-3-small";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                input: text.replace(/\n/g, " "), // Clean newlines
                model: model
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI API Error (${response.status}): ${errorText}`);
            throw new Error(`Failed to generate embedding: ${response.statusText}`);
        }

        const data = await response.json() as any;

        if (!data.data || !data.data[0] || !data.data[0].embedding) {
            console.error("Invalid API response structure:", JSON.stringify(data));
            throw new Error("Invalid response structure from OpenAI Embeddings API");
        }

        return data.data[0].embedding;

    } catch (error) {
        console.error("Error in generateNarrativeEmbedding:", error);
        throw error;
    }
}
