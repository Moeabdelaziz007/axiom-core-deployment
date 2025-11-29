import React from 'react';
import { Agent } from '../types';
import { Cpu, Zap, Activity, HardDrive } from 'lucide-react';

interface AgentHologramProps {
  agent: Agent;
}

export const AgentHologram: React.FC<AgentHologramProps> = ({ agent }) => {
  return (
    <div className="relative w-full h-[400px] bg-gray-900/40 border border-gray-800 rounded-lg overflow-hidden group hover:border-neon/50 transition-all duration-500">
      
      {/* Background Grid */}
      <div className="absolute inset-0 scanlines-bg opacity-30 pointer-events-none"></div>
      
      {/* Hologram Container */}
      <div className="absolute top-4 left-0 right-0 flex justify-center perspective-1000">
        <div className="relative w-48 h-48 animate-float">
            {/* Hologram Base Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-neon/20 blur-xl rounded-[100%]"></div>
            
            {/* The Agent Image (Holographed) */}
            <img 
              src={agent.image} 
              alt={agent.name} 
              className="w-full h-full object-cover rounded-full border-2 border-neon/30 hologram-image opacity-90 animate-hologram filter brightness-125 contrast-125 saturate-50"
            />
            
            {/* Floating Rings */}
            <div className="absolute -inset-4 border border-neon/20 rounded-full animate-spin [animation-duration:10s]"></div>
            <div className="absolute -inset-8 border border-neon/10 rounded-full animate-spin [animation-duration:15s] border-dashed"></div>
        </div>
      </div>

      {/* AXIOM ID Meta Data Card */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-neon/30 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex justify-between items-end mb-3">
          <div>
            <div className="flex items-center gap-2">
               <h3 className="text-xl font-display font-bold text-white tracking-widest">{agent.name}</h3>
               <span className="text-[10px] bg-neon/10 text-neon px-1 border border-neon/20">{agent.axiomId.generation}</span>
            </div>
            <div className="text-xs text-neon/70 font-mono mt-0.5">{agent.axiomId.serialNumber}</div>
          </div>
          <div className="text-right">
             <div className={`text-[10px] font-bold uppercase tracking-widest ${agent.status === 'active' ? 'text-matrix animate-pulse' : 'text-gray-500'}`}>
                {agent.status}
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
           <div className="bg-gray-900/50 p-2 rounded border border-gray-800 flex items-center gap-2">
              <Activity size={14} className="text-neon" />
              <div className="flex flex-col">
                 <span className="text-[8px] text-gray-400 uppercase">Directive</span>
                 <span className="text-[10px] text-gray-200 leading-tight">{agent.axiomId.directive}</span>
              </div>
           </div>
           <div className="bg-gray-900/50 p-2 rounded border border-gray-800 flex items-center gap-2">
              <Cpu size={14} className="text-tesla" />
               <div className="flex flex-col">
                 <span className="text-[8px] text-gray-400 uppercase">Core Skill</span>
                 <span className="text-[10px] text-gray-200 leading-tight">{agent.axiomId.skills[0]}</span>
              </div>
           </div>
        </div>

        {/* Tools Ticker */}
        <div className="flex gap-1 overflow-hidden">
           {agent.axiomId.tools.map((tool, i) => (
             <span key={i} className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700 whitespace-nowrap">
               {tool}
             </span>
           ))}
        </div>
        
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon"></div>
      </div>
    </div>
  );
};
