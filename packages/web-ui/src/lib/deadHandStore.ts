// Shared in-memory store for Dead Hand Protocol
// Uses globalThis to persist across hot-reloads in dev and warm starts in serverless

const THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getDeadHandStatus() {
  // @ts-ignore
  const lastHeartbeat = globalThis._deadHandHeartbeat || Date.now();
  
  // Initialize if not set (first run)
  // @ts-ignore
  if (!globalThis._deadHandHeartbeat) {
     // @ts-ignore
     globalThis._deadHandHeartbeat = lastHeartbeat;
  }

  const now = Date.now();
  const timeSinceLastBeat = now - lastHeartbeat;
  const timeLeft = Math.max(0, THRESHOLD_MS - timeSinceLastBeat);
  const status = timeLeft === 0 ? 'CRITICAL' : 'SAFE';

  return {
    status,
    lastHeartbeat,
    timeLeft,
    threshold: THRESHOLD_MS
  };
}

export function updateHeartbeat() {
  const now = Date.now();
  // @ts-ignore
  globalThis._deadHandHeartbeat = now;
  return now;
}
