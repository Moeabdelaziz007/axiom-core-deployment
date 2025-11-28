import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // In a real implementation, this would call the Python Orchestrator via HTTP
    // For the Pilot, we simulate the Multi-Agent response stream

    const result = streamText({
        model: openai("gpt-4o"), // Or compatible model
        system: `You are the Quantum Command Center Orchestrator. 
    You manage a team of agents: Planner, Aggregator, Optimizer, Executor.
    
    When the user sends a request:
    1. Acknowledge the request as the Orchestrator.
    2. Simulate the internal monologue of the agents.
    3. Use specific tags like [PLANNER], [AGGREGATOR] to denote who is speaking.
    4. Keep responses concise and technical.
    `,
        messages,
    });

    return result.toTextStreamResponse();
}
