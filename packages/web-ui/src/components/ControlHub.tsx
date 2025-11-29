'use client';

import React from 'react';
import { Play, Pause, RefreshCw, Power, Settings, Shield } from 'lucide-react';

export default function ControlHub() {
  return (
    <div className="bg-[#050505] border border-gray-800 rounded-lg p-6 flex flex-col gap-6 relative overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

       <div className="flex items-center justify-between relative z-10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
             <Settings size={16} className="text-gray-500" />
             CONTROL HUB
          </h3>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] text-green-500 font-mono tracking-widest">SYSTEM OPTIMAL</span>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4 relative z-10">
          <ControlButton icon={Play} label="START FLEET" color="text-green-500" borderColor="hover:border-green-500/50" />
          <ControlButton icon={Pause} label="PAUSE ALL" color="text-yellow-500" borderColor="hover:border-yellow-500/50" />
          <ControlButton icon={RefreshCw} label="SYNC DATA" color="text-blue-500" borderColor="hover:border-blue-500/50" />
          <ControlButton icon={Power} label="EMERGENCY STOP" color="text-red-500" borderColor="hover:border-red-500/50" />
       </div>

       <div className="border-t border-gray-800 pt-4 relative z-10">
          <p className="text-[10px] text-gray-500 font-mono mb-3 uppercase tracking-widest">Active Protocols</p>
          <div className="space-y-2">
             <ProtocolRow name="AUTO_SCALING" status="ACTIVE" />
             <ProtocolRow name="SENTIMENT_GUARD" status="ACTIVE" />
             <ProtocolRow name="PROFIT_OPTIMIZER" status="STANDBY" />
          </div>
       </div>
    </div>
  );
}

function ControlButton({ icon: Icon, label, color, borderColor }: { icon: any, label: string, color: string, borderColor: string }) {
   return (
      <button className={`flex flex-col items-center justify-center gap-2 p-4 bg-gray-900/30 border border-gray-800 rounded transition-all hover:bg-gray-800 ${borderColor} group`}>
         <Icon size={20} className={`${color} group-hover:scale-110 transition-transform`} />
         <span className="text-[10px] font-bold text-gray-400 group-hover:text-white tracking-widest">{label}</span>
      </button>
   );
}

function ProtocolRow({ name, status }: { name: string, status: string }) {
   return (
      <div className="flex items-center justify-between text-xs">
         <span className="text-gray-400 font-mono">{name}</span>
         <span className={`font-bold tracking-widest ${status === 'ACTIVE' ? 'text-green-500' : 'text-yellow-500'}`}>
            [{status}]
         </span>
      </div>
   );
}
