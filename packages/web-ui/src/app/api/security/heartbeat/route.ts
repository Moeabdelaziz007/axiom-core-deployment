import { NextResponse } from 'next/server';

export async function POST() {
  const now = Date.now();
  // @ts-ignore
  globalThis._deadHandHeartbeat = now;
  
  return NextResponse.json({
    status: 'SAFE',
    timestamp: now,
    message: 'Heartbeat received. Doomsday clock reset.'
  });
}
