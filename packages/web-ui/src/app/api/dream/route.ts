import { NextResponse } from 'next/server';
import { createDreamGraph } from '@/core/dream-factory/graph';
import { logDreamEvent } from '@/lib/logger';

// Setup for Edge or long-running serverless functions
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { seed, temperature, userId } = await req.json();

    // Setup Encoder for streaming
    const encoder = new TextEncoder();
    
    // Create custom ReadableStream
    const customStream = new ReadableStream({
      async start(controller) {
        
        // 1. Initialize the Graph
        const dreamGraph = createDreamGraph(userId || 'anonymous');

        const inputs = { 
          seed, 
          temperature: temperature || 0.9,
          dreamLog: [],
          iterationCount: 0 
        };

        logDreamEvent('System', 'START', `New Dream: ${seed}`);

        // Use streamEvents to monitor every step
        const eventStream = await dreamGraph.streamEvents(inputs, { version: "v1" });

        for await (const event of eventStream) {
          // Filter important events (Agent outputs)
          if (event.event === "on_chain_end" && event.name !== "LangGraph") {
             // Send data to UI
             // Send JSON as text to be parsed by the frontend
             const chunk = JSON.stringify({
               agent: event.name,
               data: event.data.output
             }) + "\n\n"; // Double newline delimiter
             
             controller.enqueue(encoder.encode(chunk));
          }
        }

        controller.close();
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Dream Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
