'use client';

import React, { useEffect, useState } from 'react';
import { wsClient } from '../services/WebSocketClient';
import { Activity, Server, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveDiagnostics() {
  const [stats, setStats] = useState({ cpu: 0, memory: 0 });

  useEffect(() => {
    wsClient.connect();
    const unsubscribe = wsClient.subscribe((event) => {
      if (event.type === 'DIAGNOSTIC') {
        setStats(event.payload);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-cyan-900/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-cyan-900/30 pb-2">
        <Activity className="w-4 h-4 animate-pulse" />
        LIVE DIAGNOSTICS
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/50 p-3 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 text-xs text-cyan-600 mb-1">
            <Server className="w-3 h-3" /> CPU LOAD
          </div>
          <div className="text-xl font-mono text-cyan-300">
            {stats.cpu.toFixed(1)}%
          </div>
          <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-cyan-500" 
              animate={{ width: `${stats.cpu}%` }}
            />
          </div>
        </div>

        <div className="bg-black/50 p-3 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 text-xs text-purple-600 mb-1">
            <Database className="w-3 h-3" /> MEMORY
          </div>
          <div className="text-xl font-mono text-purple-300">
            {(stats.memory / 1024).toFixed(1)} GB
          </div>
          <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-500" 
              animate={{ width: `${(stats.memory / 16000) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
