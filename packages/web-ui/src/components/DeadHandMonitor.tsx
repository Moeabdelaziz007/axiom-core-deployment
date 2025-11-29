'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Activity } from 'lucide-react';

export default function DeadHandMonitor() {
  const [status, setStatus] = useState<'ACTIVE' | 'WARNING' | 'CRITICAL'>('ACTIVE');
  const [heartbeat, setHeartbeat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeat(prev => (prev + 1) % 100);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-red-900/30 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-100 flex items-center gap-2">
            DEAD HAND PROTOCOL
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-500/20">
              ARMED
            </span>
          </h3>
          <div className="flex items-center gap-4 text-xs text-red-400/80 font-mono">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              HEARTBEAT: {heartbeat}ms
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              FAILSAFE: ENGAGED
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="text-xs text-red-500 font-bold tracking-wider">SYSTEM STATUS</div>
        <div className="text-2xl font-black text-red-500 tracking-widest animate-pulse">
          SECURE
        </div>
      </div>
    </div>
  );
}
