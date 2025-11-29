import React, { useState } from 'react';
import { Agent, AgentRole } from '../types';
import { AgentHologram } from './AgentHologram';
import { NeuralWorkspace } from './NeuralWorkspace';

const MOCK_AGENTS: Agent[] = [
  { 
    id: '1', 
    name: 'SOFRA', 
    role: AgentRole.HOST, 
    description: 'Hospitality & CX', 
    status: 'active', 
    cpuUsage: 34, 
    memoryUsage: 45, 
    price: 0.99, 
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: {
        serialNumber: 'AX-001-SFR',
        generation: 'GEN-3',
        directive: 'OPTIMIZE_GUEST_EXPERIENCE',
        dnaSequence: 'CX-HOST-V9',
        skills: ['Sentiment Analysis', 'Menu Engineering', 'Reservation Logic'],
        tools: ['OpenTable API', 'Square POS', 'Gemini Pro']
    }
  },
  { 
    id: '2', 
    name: 'AQAR', 
    role: AgentRole.BROKER, 
    description: 'Real Estate Oracle', 
    status: 'active', 
    cpuUsage: 12, 
    memoryUsage: 30, 
    price: 0.99, 
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: {
        serialNumber: 'AX-002-AQR',
        generation: 'GEN-3',
        directive: 'MAXIMIZE_ASSET_YIELD',
        dnaSequence: 'RE-BROKER-V4',
        skills: ['Market Valuation', 'Contract Negotiation', 'Trend Forecasting'],
        tools: ['Zillow Data', 'Gov Land Registry', 'Solana Smart Contracts']
    }
  },
  { 
    id: '3', 
    name: 'HARES', 
    role: AgentRole.GUARDIAN, 
    description: 'Cybersecurity Sentinel', 
    status: 'idle', 
    cpuUsage: 5, 
    memoryUsage: 10, 
    price: 1.99, 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: {
        serialNumber: 'AX-003-HRS',
        generation: 'GEN-4',
        directive: 'PROTOCOL_DEFENSE',
        dnaSequence: 'SEC-GUARD-V2',
        skills: ['Threat Detection', 'Code Auditing', 'Anomaly Scans'],
        tools: ['Wireshark Module', 'Solana RPC', 'Quantum Encryption']
    }
  },
];

export const ControlHub: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="p-8 h-full overflow-y-auto scrollbar-hide bg-gradient-to-br from-black to-[#050505] relative">
      
      {/* Workspace Overlay */}
      {selectedAgent && (
        <NeuralWorkspace agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
        <div>
           <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
             AXIOM <span className="text-neon">CONTROL</span> HUB
           </h2>
           <p className="text-gray-400 font-mono text-sm mt-1">
             Select an agent to enter their Neural Workspace. Status: <span className="text-matrix">ONLINE</span>
           </p>
        </div>
        <div className="flex gap-4 text-xs font-mono text-gray-500">
           <div>TOTAL_CPU: <span className="text-white">41%</span></div>
           <div>TOTAL_RAM: <span className="text-white">64GB</span></div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {MOCK_AGENTS.map((agent) => (
          <div key={agent.id} onClick={() => setSelectedAgent(agent)} className="cursor-pointer">
              <AgentHologram agent={agent} />
          </div>
        ))}
        
        {/* 'Add Agent' Holo-Placeholder */}
        <div className="relative w-full h-[400px] bg-gray-900/20 border border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center group hover:border-neon hover:bg-neon/5 transition-all cursor-pointer">
            <div className="w-20 h-20 rounded-full border border-gray-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:border-neon text-gray-500 group-hover:text-neon">
                <span className="text-4xl font-thin">+</span>
            </div>
            <span className="font-display text-sm tracking-widest text-gray-500 group-hover:text-neon">INITIALIZE NEW AGENT</span>
            <div className="absolute inset-0 bg-scanline opacity-0 group-hover:opacity-10 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};