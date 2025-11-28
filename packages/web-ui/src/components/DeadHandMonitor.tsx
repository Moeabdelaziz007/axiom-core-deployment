'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Skull, ShieldCheck, RefreshCw } from 'lucide-react';

export default function DeadHandMonitor() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [status, setStatus] = useState<'SAFE' | 'DANGER'>('SAFE');
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/security/status');
      const data = await res.json();
      setTimeLeft(data.timeLeft);
      setStatus(data.status);
    } catch (e) {
      console.error("Failed to fetch Dead Hand status");
    }
  };

  const sendHeartbeat = async () => {
    setLoading(true);
    try {
      await fetch('/api/security/heartbeat', { method: 'POST' });
      await fetchStatus(); // Refresh immediately
    } catch (e) {
      console.error("Heartbeat failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format milliseconds to HH:MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`border rounded-lg p-4 flex flex-col gap-4 transition-colors duration-500 ${status === 'DANGER' ? 'bg-red-950/30 border-red-500 animate-pulse' : 'bg-[#050505] border-red-900/30'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/30 pb-2">
        <div className="flex items-center gap-2 text-red-500">
          <Skull size={18} />
          <span className="font-display font-bold tracking-widest text-xs">DEAD HAND PROTOCOL</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${status === 'DANGER' ? 'bg-red-500 text-black' : 'bg-green-900/30 text-green-500 border border-green-500/30'}`}>
          {status === 'DANGER' ? 'IMMINENT' : 'ARMED'}
        </div>
      </div>

      {/* Countdown Display */}
      <div className="flex flex-col items-center justify-center py-2">
        <span className="text-[10px] text-red-500/50 font-mono mb-1">AUTO-EXECUTE IN</span>
        <div className="font-mono text-3xl font-bold text-red-500 tracking-widest tabular-nums drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
          {timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={sendHeartbeat}
        disabled={loading}
        className="w-full py-3 bg-red-900/20 hover:bg-red-500 hover:text-black border border-red-500/50 rounded text-red-500 font-bold text-xs tracking-widest transition-all flex items-center justify-center gap-2 group"
      >
        <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" />
        {loading ? 'VERIFYING...' : 'CONFIRM OPERATOR PRESENCE'}
      </button>

      {/* Status Footer */}
      <div className="flex items-center justify-between text-[9px] text-gray-600 font-mono">
        <span>FAIL-DEADLY: ACTIVE</span>
        <span>TARGET: COLD_STORAGE_A1</span>
      </div>
    </div>
  );
}
