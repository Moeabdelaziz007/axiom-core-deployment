import { NextRequest, NextResponse } from 'next/server';
import { SentinelDebugAgent } from '@/infra/agents/sentinel/SentinelDebugAgent';

// Cache the sentinel instance
let sentinelAgent: SentinelDebugAgent | null = null;

function getSentinelAgent() {
  if (!sentinelAgent) {
    sentinelAgent = new SentinelDebugAgent();
  }
  return sentinelAgent;
}

/**
 * GET /api/diagnostics
 * 
 * Trigger a full system diagnostic report from the Sentinel Agent.
 */
export async function GET(request: NextRequest) {
  try {
    const sentinel = getSentinelAgent();
    const report = await sentinel.generateFullSystemReport();

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('❌ Sentinel Diagnostic Failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Diagnostic scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}