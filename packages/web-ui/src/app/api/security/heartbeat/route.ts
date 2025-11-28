import { NextResponse } from 'next/server';
import { updateHeartbeat } from '../../../../lib/deadHandStore';

export async function POST() {
  // 1. (Security Check) - In future, verify operator signature
  
  // 2. Update Heartbeat
  const timestamp = updateHeartbeat();

  return NextResponse.json({
    message: "OPERATOR PRESENCE CONFIRMED. TIMER RESET.",
    timestamp: new Date(timestamp).toISOString(),
    status: "ARMED"
  });
}
