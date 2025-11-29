import React from 'react';
import { Activity, Cpu, Database, Wifi } from 'lucide-react';

export const PolyphaseMonitor: React.FC = () => {
  return (
    <div className="h-full bg-black/40 border-l border-gray-800 p-4 flex flex-col gap-6 font-display">
      
      {/* Header */}
      <div className="flex items-center justify-between text-gray-400 mb-2">
        <span className="text-xs tracking-widest">POLYPHASE MONITOR</span>
        <div className="w-1.5 h-1.5 bg-matrix rounded-full animate-pulse"></div>
      </div>

      {/* Reasoning Phases */}
      <div className="space-y-4">
        <div className="text-[10px] text-gray-500 uppercase mb-1">CoT Resonance</div>
        {['Planner', 'Aggregator', 'Optimizer', 'Executor'].map((phase, i) => (
          <div key={phase} className="group">
            <div className="flex justify-between text-xs text-neon mb-1">
              <span>{phase}</span>
              <span className="opacity-50">{90 - i * 15}%</span>
            </div>
            <div className="h-1 bg-gray-800 w-full relative overflow-hidden">
               <div 
                 className="absolute top-0 left-0 h-full bg-neon shadow-[0_0_10px_#00f3ff]" 
                 style={{ width: `${90 - i * 15}%` }}
               ></div>
               {/* Spark effect */}
               <div className="absolute top-0 bottom-0 w-1 bg-white blur-[1px] animate-pulse-fast" style={{ left: `${90 - i * 15}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900/50 p-3 border border-gray-800 flex flex-col items-center justify-center gap-2 hover:border-neon/30 transition-colors">
            <Cpu size={18} className="text-matrix" />
            <span className="text-xs text-gray-400">CPU LOAD</span>
            <span className="text-lg font-bold text-white">42%</span>
        </div>
        <div className="bg-gray-900/50 p-3 border border-gray-800 flex flex-col items-center justify-center gap-2 hover:border-neon/30 transition-colors">
            <Database size={18} className="text-matrix" />
            <span className="text-xs text-gray-400">MEM USE</span>
            <span className="text-lg font-bold text-white">128TB</span>
        </div>
         <div className="bg-gray-900/50 p-3 border border-gray-800 flex flex-col items-center justify-center gap-2 hover:border-neon/30 transition-colors">
            <Activity size={18} className="text-alert" />
            <span className="text-xs text-gray-400">LATENCY</span>
            <span className="text-lg font-bold text-white">12ms</span>
        </div>
         <div className="bg-gray-900/50 p-3 border border-gray-800 flex flex-col items-center justify-center gap-2 hover:border-neon/30 transition-colors">
            <Wifi size={18} className="text-neon" />
            <span className="text-xs text-gray-400">NET STAT</span>
            <span className="text-lg font-bold text-white">SECURE</span>
        </div>
      </div>

      {/* System Log */}
      <div className="flex-1 bg-gray-900/30 border border-gray-800 p-2 font-sans text-[10px] text-gray-400 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none"></div>
        <div className="space-y-1">
          <p>> SYSTEM_INIT_COMPLETE</p>
          <p>> CONNECTED_TO_MAINNET</p>
          <p className="text-matrix">> AGENT_SOFRA [ACTIVE]</p>
          <p className="text-matrix">> AGENT_AQAR [ACTIVE]</p>
          <p>> DEAD_HAND_PROTOCOL [STANDBY]</p>
          <p className="text-alert">> WARN: UNUSUAL_TRAFFIC_SECTOR_7</p>
          <p>> RECALIBRATING_NEURAL_WEIGHTS...</p>
        </div>
      </div>
    </div>
  );
};
