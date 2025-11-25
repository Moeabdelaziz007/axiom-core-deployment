import { assessComplexity } from '../../../core/ToolLibrary';
import { AgentHissabSoul } from './AgentHissabSoul';
import { HumanMessage, BaseMessage } from "@langchain/core/messages";

/**
 * AXIOM-BRAIN: The Central Intelligence Router (D-RAG Enabled)
 * 
 * This worker acts as the "Cerebral Cortex" of the Axiom System.
 * It implements the Zero-Cost Engineering protocol by routing 
 * traffic between the free Oracle VM (D-RAG) and paid Gemini API.
 */

export interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
}

export interface Env {
    ORACLE_VM_ENDPOINT: string;
    GEMINI_API_KEY: string;
    AXIOM_SECRET_KEY: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_API_TOKEN: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // 1. Security Check
        if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

        const url = new URL(request.url);
        const authHeader = request.headers.get("Authorization");

        // Basic protection (should be enhanced with JWT in production)
        if (!authHeader || !authHeader.includes(env.AXIOM_SECRET_KEY)) {
            // Allow if it's a public health check
            if (url.pathname !== "/health") {
                return new Response("Unauthorized Access to Axiom Brain", { status: 401 });
            }
        }

        try {
            const body = await request.json() as any;
            const { query, agentId, context } = body;

            // 2. Complexity Assessment (The "Cost-Saving" Logic)
            const complexity = assessComplexity(query);

            console.log(`[Axiom Brain] Query: "${query.substring(0, 50)}..." | Complexity: ${complexity}`);

            // 3. Agent Routing
            if (url.pathname === "/v1/agent/hissab") {
                console.log(">> Routing to Agent Hissab (Soul)");
                const soul = new AgentHissabSoul(env);
                const graph = soul.buildGraph();

                // Convert simple query to LangChain message format
                const result = await graph.invoke({
                    messages: [new HumanMessage({ content: query })]
                });

                const lastMessage = (result.messages as BaseMessage[])[(result.messages as BaseMessage[]).length - 1];
                return new Response(JSON.stringify({
                    agent: "Hissab",
                    response: lastMessage.content,
                    trace: result
                }), { headers: { "Content-Type": "application/json" } });
            }

            // 4. D-RAG Routing (Legacy/General)
            if (complexity === 'HIGH') {
                // Route to Gemini (Paid, High Intelligence)
                console.log(">> Routing to GEMINI (Paid Tier)");
                return await callGemini(env, query, context);
            } else {
                // Route to Oracle VM (Free, Open Source Llama-2)
                console.log(">> Routing to ORACLE VM (Free Tier)");
                return await callOracleD_RAG(env, query, context);
            }

        } catch (error) {
            return new Response(JSON.stringify({ error: "Brain Malfunction", details: String(error) }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }
};

/**
 * Calls the Free Oracle VM Endpoint (D-RAG)
 */
async function callOracleD_RAG(env: Env, query: string, context: any): Promise<Response> {
    if (!env.ORACLE_VM_ENDPOINT) {
        // Fallback if Oracle is offline/not configured
        console.warn("Oracle Endpoint missing! Falling back to Gemini.");
        return callGemini(env, query, context);
    }

    try {
        const response = await fetch(env.ORACLE_VM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: query,
                system_prompt: "You are an Axiom Agent. Be concise and helpful.",
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`Oracle VM Error: ${response.statusText}`);

        const data = await response.json();
        return new Response(JSON.stringify({
            source: "ORACLE_VM_Llama2",
            response: data.generation
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e) {
        console.error("Oracle Call Failed:", e);
        // Failover logic could go here
        return new Response(JSON.stringify({ error: "Oracle Node Unreachable" }), { status: 503 });
    }
}

/**
 * Calls Google Gemini API (Paid)
 */
async function callGemini(env: Env, query: string, context: any): Promise<Response> {
    // Mock implementation for the router logic
    // In production, this would call the actual Gemini API
    return new Response(JSON.stringify({
        source: "GEMINI_PRO",
        response: `[Gemini Analysis]: ${query} processed with high-fidelity reasoning.`
    }), { headers: { "Content-Type": "application/json" } });
}

/**
 * Legacy Durable Object Stub (Required for Deployment Migration)
 */
export class ChatRoom {
    constructor(state: any, env: any) { }
    async fetch(request: Request) {
        return new Response("This Durable Object has been deprecated.", { status: 410 });
    }
}