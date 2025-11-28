import { NextResponse } from 'next/server';
import { getLastHeartbeat } from '../heartbeat/route';

// 24 Hours in milliseconds
const DOOMSDAY_THRESHOLD_MS = 24 * 60 * 60 * 1000; 

export async function GET() {
  // Note: This import might not work as expected in Next.js app router due to isolation.
  // For this simulation, we'll use a global variable pattern or just duplicate the logic/storage 
  // if sharing state between routes is tricky without a DB.
  // To keep it simple and working for the demo, we will use a global variable attached to globalThis
  // to persist across route invocations in the same process (development/serverless warm start).
  
  const now = Date.now();
  // @ts-ignore
  const lastHeartbeat = globalThis._deadHandHeartbeat || now; 
  
  const timeElapsed = now - lastHeartbeat;
  const timeLeft = Math.max(0, DOOMSDAY_THRESHOLD_MS - timeElapsed);
  
  const status = timeLeft === 0 ? 'DANGER' : 'SAFE';

  return NextResponse.json({
    status,
    timeLeft,
    lastHeartbeat,
    threshold: DOOMSDAY_THRESHOLD_MS
  });
}
