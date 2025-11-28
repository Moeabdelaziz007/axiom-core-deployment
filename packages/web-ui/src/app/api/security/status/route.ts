import { NextResponse } from 'next/server';
import { getDeadHandStatus } from '../../../../lib/deadHandStore';

export async function GET() {
  const data = getDeadHandStatus();
  
  return NextResponse.json({
    status: data.status,
    lastHeartbeat: new Date(data.lastHeartbeat).toISOString(),
    timeLeftMs: data.timeLeft,
    // Format time left as HH:MM:SS
    formattedTimeLeft: new Date(data.timeLeft).toISOString().substr(11, 8)
  });
}
