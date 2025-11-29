import React from 'react';
import { Agent, AgentRole, KitType } from '../types';
import { Bot, Mic, Shield, ShoppingBag, Globe, FileText, Zap, Gift, Check, MessageSquare, Cpu, Database } from 'lucide-react';

const AGENT_ROSTER: Agent[] = [
  {
    id: 'sofra', name: 'SOFRA', role: AgentRole.HOST, description: 'Hospitality & CX Manager', status: 'active', cpuUsage: 0, memoryUsage: 0, price: 0.99, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: { serialNumber: 'AX-SFR', generation: 'G3', directive: 'HOSPITALITY', dnaSequence: 'CX-99', skills: ['Voice Greeting', 'Menu Analysis'], tools: [] },
    associatedKit: KitType.VOX
  },
  {
    id: 'aqar', name: 'AQAR', role: AgentRole.BROKER, description: 'Real Estate Oracle', status: 'active', cpuUsage: 0, memoryUsage: 0, price: 0.99, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: { serialNumber: 'AX-AQR', generation: 'G3', directive: 'ASSET_MGMT', dnaSequence: 'RE-88', skills: ['Valuation', 'Form Filling'], tools: [] },
    associatedKit: KitType.FORM
  },
  {
    id: 'dalal', name: 'DALAL', role: AgentRole.CLOSER, description: 'Negotiation Engine', status: 'active', cpuUsage: 0, memoryUsage: 0, price: 0.99, image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: { serialNumber: 'AX-DLL', generation: 'G4', directive: 'CLOSE_DEAL', dnaSequence: 'SLS-77', skills: ['Haggling', 'Psychology'], tools: [] },
    associatedKit: KitType.HAGGLE
  },
  {
    id: 'hares', name: 'HARES', role: AgentRole.GUARDIAN, description: 'Cyber Sentinel', status: 'active', cpuUsage: 0, memoryUsage: 0, price: 0.99, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: { serialNumber: 'AX-HRS', generation: 'G5', directive: 'DEFENSE', dnaSequence: 'SEC-00', skills: ['Mod Filtering', 'Scam Detect'], tools: [] },
    associatedKit: KitType.GUARD
  },
  {
    id: 'mualem', name: 'MUALEM', role: AgentRole.MENTOR, description: 'Cultural Localization', status: 'active', cpuUsage: 0, memoryUsage: 0, price: 0.99, image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0f19?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: { serialNumber: 'AX-MLM', generation: 'G3', directive: 'EDUCATE', dnaSequence: 'EDU-55', skills: ['Dialect Swap', 'Translation'], tools: [] },
    associatedKit: KitType.LOCAL
  },
  {
    id: 'khidma', name: 'KHIDMA', role: AgentRole.SUPPORT, description: 'COD Verification', status: 'active', cpuUsage: 0, memoryUsage: 0, price: 0.99, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: { serialNumber: 'AX-KHD', generation: 'G2', directive: 'ASSIST', dnaSequence: 'SUP-44', skills: ['WhatsApp Verify', 'Support'], tools: [] },
    associatedKit: KitType.COD
  },
  {
    id: 'tajer', name: 'TAJER', role: AgentRole.MERCHANT, description: 'Smart Commerce', status: 'active', cpuUsage: 0, memoryUsage: 0, price: 0.99, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: { serialNumber: 'AX-TJR', generation: 'G3', directive: 'TRADE', dnaSequence: 'COM-33', skills: ['Recommendation', 'Upsell'], tools: [] },
    associatedKit: KitType.TAJER
  },
  {
    id: 'raed', name: 'RAED', role: AgentRole.VISIONARY, description: 'Executive Briefs', status: 'active', cpuUsage: 0, memoryUsage: 0, price: 0.99, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop&grayscale',
    axiomId: { serialNumber: 'AX-RAD', generation: 'G4', directive: 'STRATEGY', dnaSequence: 'VIS-11', skills: ['Summarization', 'Planning'], tools: [] },
    associatedKit: KitType.BRIEF
  }
];

const KIT_ICONS: Record<string, any> = {
  VOX: Mic, FORM: FileText, HAGGLE: Globe, GUARD: Shield, 
  LOCAL: Globe, COD: Check, TAJER: ShoppingBag, BRIEF: Zap
};

export const AgentsPage: React.FC<{ onDeploy: (agent: Agent) => void }> = ({ onDeploy }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12 px-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon/30 bg-neon/5 mb-6 backdrop-blur-sm">
             <div className="w-2 h-2 rounded-full bg-neon animate-pulse-fast"></div>
             <span className="text-xs font-mono text-neon tracking-widest uppercase">Axiom 15 Roster • SAAAS</span>
           </div>
          <h1 className="text-5xl md:text-7xl font-display font-black mb-4 text-white neon-text-glow">
            Hire Your Digital Staff
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Don't just add a chatbot. Hire a specialist. <br/>
            Digital employees powered by <span className="text-neon font-bold">Gemini 3.0 Pro</span> and the <span className="text-neonBlue font-bold">Synapse SDK</span>.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {AGENT_ROSTER.map((agent, idx) => {
            const Icon = agent.associatedKit ? KIT_ICONS[agent.associatedKit] || Bot : Bot;
            return (
              <div key={agent.id} className="relative group perspective-1000">
                 {/* Card Container */}
                 <div className="bg-[#050505] border border-gray-800 rounded-2xl overflow-hidden transition-all duration-500 hover:border-neon/60 hover:shadow-neon transform hover:-translate-y-2 relative z-10">
                    
                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black/80 z-0"></div>
                    <div className="absolute inset-0 scanlines-bg opacity-20 pointer-events-none z-10"></div>
                    
                    {/* Hologram Image Area */}
                    <div className="relative h-64 overflow-hidden z-0">
                       <img 
                          src={agent.image} 
                          alt={agent.name} 
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 filter grayscale group-hover:grayscale-0" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                       
                       {/* Floating Kit Badge */}
                       <div className="absolute top-4 right-4 bg-black/60 backdrop-blur border border-neon/30 rounded-lg p-2 flex items-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                          <Icon size={14} className="text-neon" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{agent.associatedKit} KIT</span>
                       </div>
                    </div>

                    {/* Agent Details */}
                    <div className="relative p-6 -mt-12 z-20">
                       <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl p-4 shadow-xl">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="text-2xl font-display font-bold text-white tracking-wide group-hover:text-neon transition-colors">{agent.name}</h3>
                             <span className="text-[10px] text-gray-500 font-mono border border-gray-700 px-1.5 rounded">{agent.axiomId.generation}</span>
                          </div>
                          
                          <p className="text-xs text-neon font-mono uppercase tracking-widest mb-3">{agent.role}</p>
                          <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">{agent.description}</p>
                          
                          {/* DNA Specs */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                             <div className="bg-black/40 p-2 rounded border border-gray-800 flex flex-col">
                                <div className="flex items-center gap-1 text-[8px] text-gray-500 uppercase mb-1">
                                   <Cpu size={8} /> DNA
                                </div>
                                <span className="text-[10px] font-mono text-neonBlue truncate">{agent.axiomId.dnaSequence}</span>
                             </div>
                             <div className="bg-black/40 p-2 rounded border border-gray-800 flex flex-col">
                                <div className="flex items-center gap-1 text-[8px] text-gray-500 uppercase mb-1">
                                   <Database size={8} /> Skill
                                </div>
                                <span className="text-[10px] font-mono text-white truncate">{agent.axiomId.skills[0]}</span>
                             </div>
                          </div>

                          <button 
                            onClick={() => onDeploy(agent)}
                            className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded transition-all hover:bg-neon hover:shadow-[0_0_15px_theme('colors.neon')]"
                          >
                            Hire • $0.99/mo
                          </button>
                       </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-neon to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};