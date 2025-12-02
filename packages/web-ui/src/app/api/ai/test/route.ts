import { NextResponse } from 'next/server';
import { aiEngine } from '../../../../lib/ai-engine';

export async function GET() {
  try {
    const chatCompletion = await aiEngine.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a high-performance AI agent. Reply with "System Online: [Latency]ms".',
        },
        {
          role: 'user',
          content: 'Status check.',
        },
      ],
      model: aiEngine.models.FAST,
      temperature: 0.5,
      max_tokens: 50,
    });

    return NextResponse.json({
      status: 'success',
      response: chatCompletion.choices[0]?.message?.content || 'No response',
      model: chatCompletion.model,
    });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
