/**
 * 🧠 Gemini 1.5 Flash Client
 * Zero-cost AI backend for agent conversations
 */

export async function chatWithGemini(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    history: { role: string; text: string }[] = []
) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Build conversation history
    const contents = [
        ...history.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
    ];

    const payload = {
        contents,
        system_instruction: {
            parts: [{ text: systemPrompt }]
        },
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 400,
            topP: 0.9
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json() as any;

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    } else {
        console.error('Gemini Error:', JSON.stringify(data));
        throw new Error(data.error?.message || 'Failed to generate response');
    }
}

// Export API key (should be in env in production)
export const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCgGlT_QlpUtz6ijcE7gUZAIXNMiYj4LtA';
