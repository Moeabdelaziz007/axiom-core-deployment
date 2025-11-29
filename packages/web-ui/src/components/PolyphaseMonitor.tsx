'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Shield, Cpu, Server } from 'lucide-react';

export default function PolyphaseMonitor() {
  const [logs, setLogs] = useState<string[]>([
    '> SYSTEM_INIT_COMPLETE',
    '> CONNECTED_TO_MAINNET',
    '> AGENT_SOFRA [ACTIVE]',
    '> AGENT_AQAR [ACTIVE]',
    '> DEAD_HAND_PROTOCOL [STANDBY]',
    '> WARN: UNUSUAL_TRAFFIC_SECTOR_7',
    '> RECALIBRATING_NEURAL_WEIGHTS...'
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLogs = [
        '> PACKET_RECEIVED_SOLANA_RPC',
        '> MEMORY_GC_OPTIMIZED',
        '> NEURAL_SYNC_ACK',
        '> LATENCY_CHECK: 12ms',
        '> AGENT_HEARTBEAT_OK'
      ];
      const randomLog = newLogs[Math.floor(Math.random() * newLogs.length)];
      setLogs(prev => [...prev.slice(1), randomLog]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#050505] border border-gray-800 rounded-lg flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="bg-gray-900/50 p-3 border-b border-gray-800 flex items-center justify-between">
         <div className="flex items-center gap-2 text-white">
            <Activity size={14} className="text-neonBlue" />
            <span className="text-[10px] font-bold font-mono tracking-widest">POLYPHASE_MONITOR</span>
         </div>
         <div className="flex items-center gap-2">
            <Wifi size={14} className="text-neon" />
            <span className="text-[10px] text-gray-400 font-mono">NET_STAT: SECURE</span>
         </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-800 border-b border-gray-800">
         <MetricBox label="CPU_LOAD" value="12%" icon={Cpu} color="text-neon" />
         <MetricBox label="MEM_USAGE" value="4.2GB" icon={Server} color="text-purple-500" />
         <MetricBox label="THREAT_LVL" value="LOW" icon={Shield} color="text-green-500" />
         <MetricBox label="UPTIME" value="99.9%" icon={Activity} color="text-blue-500" />
      </div>

      {/* Scrolling Log Stream */}
      <div className="flex-1 bg-black p-4 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-10"></div>
         <div className="space-y-1 font-mono text-[10px] text-gray-500">
            {logs.map((log, i) => (
               <div key={i} className="animate-fade-in-up">
                  <span className="text-gray-700 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span className={log.includes('WARN') ? 'text-alert' : 'text-neon/70'}>{log}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
   return (
      <div className="bg-[#050505] p-3 flex items-center justify-between">
         <div className="flex flex-col">
            <span className="text-[9px] text-gray-600 font-mono tracking-widest mb-1">{label}</span>
            <span className="text-sm font-bold text-white font-display">{value}</span>
         </div>
         <Icon size={16} className={color} />
      </div>
   );
}
