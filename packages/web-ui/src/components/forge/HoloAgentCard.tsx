'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Definition of data coming from Gemini
interface AgentDNA {
  name: string;
  role: string;
  mission: string;
  capabilities: string[];
  color: string;
  icon: string;
}

interface HoloAgentCardProps {
  agent: AgentDNA;
  onDeploy: () => void;
  onDiscard: () => void;
}

export default function HoloAgentCard({ agent, onDeploy, onDiscard }: HoloAgentCardProps) {
  // Convert text icon name to actual component
  // @ts-ignore - Lucide icons map dynamically
  const IconComponent: LucideIcon = Icons[agent.icon] || Icons.Bot;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="relative w-full max-w-md mx-auto mt-8 group"
    >
      {/* Back Glow Effect (Tesla Coil Glow) */}
      <div 
        className="absolute -inset-1 rounded-lg opacity-40 blur-xl group-hover:opacity-60 transition duration-500"
        style={{ backgroundColor: agent.color || '#cd7f32' }}
      ></div>

      {/* Card Body */}
      <div className="relative bg-[#0a0500] border-2 border-[#cd7f32] p-6 rounded-lg shadow-2xl overflow-hidden">
        
        {/* Mechanical Decoration (Steampunk Rivets) */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#cd7f32] shadow-[0_0_5px_#cd7f32]" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#cd7f32] shadow-[0_0_5px_#cd7f32]" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#cd7f32] shadow-[0_0_5px_#cd7f32]" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#cd7f32] shadow-[0_0_5px_#cd7f32]" />

        {/* Card Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-[#cd7f32]/30 pb-4">
          <div 
            className="p-3 rounded-md bg-black border border-[#cd7f32] shadow-[0_0_15px_rgba(205,127,50,0.3)]"
          >
            <IconComponent size={32} style={{ color: agent.color }} />
          </div>
          <div>
            <h2 className="text-2xl font-display text-white tracking-wider">{agent.name}</h2>
            <p className="text-sm font-mono text-[#cd7f32]">{agent.role}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 font-mono text-sm">
          <div>
            <span className="text-gray-500 uppercase text-xs tracking-widest">Mission Protocol</span>
            <p className="text-gray-300 mt-1 leading-relaxed border-l-2 border-[#cd7f32] pl-3">
              "{agent.mission}"
            </p>
          </div>

          <div>
            <span className="text-gray-500 uppercase text-xs tracking-widest">Modules Installed</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {agent.capabilities.map((cap, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 bg-[#cd7f32]/10 border border-[#cd7f32]/50 text-[#cd7f32] text-xs rounded"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-8 flex gap-3">
          <button 
            onClick={onDiscard}
            className="flex-1 py-3 border border-red-900/50 text-red-500 font-display hover:bg-red-900/20 transition uppercase tracking-widest text-xs"
          >
            Discard
          </button>
          <button 
            onClick={onDeploy}
            className="flex-1 py-3 bg-[#cd7f32] text-black font-bold font-display hover:bg-[#b06d2b] transition shadow-[0_0_20px_rgba(205,127,50,0.4)] uppercase tracking-widest text-xs flex justify-center items-center gap-2"
          >
            <Icons.Rocket size={16} /> Deploy Agent
          </button>
        </div>

        {/* Scanning Line Animation */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#cd7f32]/5 to-transparent h-[10px] w-full animate-scan" />
      </div>
    </motion.div>
  );
}
