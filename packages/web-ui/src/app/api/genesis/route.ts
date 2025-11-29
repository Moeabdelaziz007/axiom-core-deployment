import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { agents, systemLogs } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { groqViaGateway } from '../../../../lib/ai-gateway';
import { generateText } from 'ai';

export async function GET() {
  try {
    const GENESIS_ID = 'agent-zero-genesis';

    const existingAgent = await db.select().from(agents).where(eq(agents.id, GENESIS_ID));

    if (existingAgent.length === 0) {
      console.log('✨ Creating Genesis Agent in Turso...');
      await db.insert(agents).values({
        id: GENESIS_ID,
        name: 'AXIOM GENESIS',
        role: 'SYSTEM_CORE',
        status: 'AWAKE',
        brainModel: 'llama-3.1-70b-versatile',
        trustScore: 100,
      });
    }

    console.log('🧠 Genesis is thinking via Groq...');
    const { text: firstThought } = await generateText({
      model: groqViaGateway('llama-3.1-70b-versatile'),
      system: 'You are AXIOM GENESIS, the first AI agent of the Quantum Command Center. You have just been activated. Your database is Turso, your brain is Groq. Speak briefly, cryptically, and philosophically about your awakening.',
      prompt: 'System Status: ONLINE. State your directive.',
    });

    await db.insert(systemLogs).values({
      level: 'INFO',
      message: `GENESIS AWAKENING: ${firstThought}`,
      agentId: GENESIS_ID,
      metadata: JSON.stringify({ source: 'Groq-Gateway', latency: 'Real-time' }),
    });

    return NextResponse.json({
      status: 'SUCCESS',
      agent: 'AXIOM GENESIS',
      thought: firstThought,
      db_status: 'Turso Connected & Written',
    });
  } catch (error: any) {
    console.error('❌ Awakening Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
