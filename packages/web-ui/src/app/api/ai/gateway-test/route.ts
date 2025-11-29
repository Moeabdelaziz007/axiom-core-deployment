import { NextResponse } from 'next/server';
import { GATEWAY_MODELS } from '../../../../lib/ai-gateway';
import { generateText } from 'ai';

export async function GET() {
  try {
    const { text } = await generateText({
      model: GATEWAY_MODELS.FAST,
      prompt: 'System check via Vercel Gateway (BYOK). Status?',
    });

    return NextResponse.json({
      status: 'success',
      response: text,
      provider: 'groq-via-gateway'
    });
  } catch (error: any) {
    console.error('Gateway Error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
