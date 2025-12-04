/**
 * 🧠 Gemini Client with Function Calling
 * "The Action Engine" - Agents can now DO things, not just TALK
 */

// ============================================================================
// AGENT TOOLS (Functions agents can call)
// ============================================================================

export const AGENT_TOOLS = [
    {
        name: "create_order",
        description: "Create a food order when customer confirms items. Use for Sofra restaurant agent.",
        parameters: {
            type: "object",
            properties: {
                items: { type: "string", description: "Comma-separated list of items (e.g. '2 Pizza, 1 Coke')" },
                total_price: { type: "number", description: "Estimated total price in EGP" },
                customer_phone: { type: "string", description: "Customer phone if provided" },
                notes: { type: "string", description: "Special instructions or notes" }
            },
            required: ["items"]
        }
    },
    {
        name: "book_property_viewing",
        description: "Schedule a property viewing appointment. Use for Tajer real estate agent.",
        parameters: {
            type: "object",
            properties: {
                property_type: { type: "string", description: "Type: apartment, villa, office, land" },
                location: { type: "string", description: "Preferred area or district" },
                budget: { type: "string", description: "Budget range" },
                preferred_date: { type: "string", description: "Preferred viewing date" },
                customer_phone: { type: "string", description: "Contact phone number" }
            },
            required: ["property_type", "location"]
        }
    },
    {
        name: "check_medicine_availability",
        description: "Check if a medicine is available in pharmacy. Use for Dr. Moe pharmacy agent.",
        parameters: {
            type: "object",
            properties: {
                medicine_name: { type: "string", description: "Name of the medicine" },
                quantity: { type: "number", description: "Quantity needed" },
                generic_ok: { type: "boolean", description: "Accept generic alternative" }
            },
            required: ["medicine_name"]
        }
    },
    {
        name: "request_spare_part",
        description: "Request a spare part quote. Use for Tirs industrial agent.",
        parameters: {
            type: "object",
            properties: {
                part_name: { type: "string", description: "Name or description of the part" },
                machine_model: { type: "string", description: "Machine model if known" },
                urgency: { type: "string", description: "normal, urgent, or emergency" },
                quantity: { type: "number", description: "Quantity needed" }
            },
            required: ["part_name"]
        }
    },
    {
        name: "schedule_tutoring_session",
        description: "Book a tutoring session. Use for Ostaz education agent.",
        parameters: {
            type: "object",
            properties: {
                subject: { type: "string", description: "Subject to study" },
                grade_level: { type: "string", description: "Student grade level" },
                preferred_time: { type: "string", description: "Preferred session time" },
                session_type: { type: "string", description: "online or in-person" }
            },
            required: ["subject"]
        }
    }
];

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface GeminiActionResponse {
    type: 'action';
    function: string;
    args: Record<string, any>;
}

export interface GeminiTextResponse {
    type: 'text';
    content: string;
}

export type GeminiResponse = GeminiActionResponse | GeminiTextResponse;

// ============================================================================
// MAIN CHAT FUNCTION
// ============================================================================

export async function chatWithGemini(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    history: Array<{ role: string; content: string }> = []
): Promise<GeminiResponse> {

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Build conversation contents
    const contents = [
        ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
    ];

    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        tools: [{ functionDeclarations: AGENT_TOOLS }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', errorText);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const part = data.candidates?.[0]?.content?.parts?.[0];

    // 1. Function Call detected → Return action
    if (part?.functionCall) {
        return {
            type: 'action',
            function: part.functionCall.name,
            args: part.functionCall.args || {}
        };
    }

    // 2. Text response
    if (part?.text) {
        return { type: 'text', content: part.text };
    }

    // 3. Fallback
    return { type: 'text', content: 'عذراً، لم أفهم. ممكن تكرر؟' };
}
