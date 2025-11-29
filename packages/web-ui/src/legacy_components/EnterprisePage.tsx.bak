import React from 'react';
import { ShieldCheck, Server, Globe, Lock, Cpu, Activity } from 'lucide-react';

export const EnterprisePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12 px-6 overflow-y-auto">
      
      {/* Hero */}
      <section className="max-w-7xl mx-auto mb-24 flex flex-col items-center text-center">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-900/10 mb-8 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Lock size={14} className="text-purple-400" />
            <span className="text-xs font-mono text-purple-200">ENTERPRISE-GRADE AGENCY INFRASTRUCTURE</span>
         </div>
         <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            Axiom for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Industry</span>
         </h1>
         <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
            Deploy autonomous agent fleets with banking-grade security, millisecond latency, and the fail-safe "Dead Hand Protocol".
         </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
         <div className="bg-gray-900/20 border border-gray-800 p-8 rounded-2xl hover:border-purple-500/30 transition-colors">
            <ShieldCheck size={48} className="text-matrix mb-6" />
            <h3 className="text-2xl font-display font-bold mb-4">Dead Hand Protocol</h3>
            <p className="text-gray-400 leading-relaxed">
               Our proprietary fail-safe mechanism ensures agent autonomy is checked by a heartbeat every 400ms. If the heartbeat fails, all sensitive operations are locked instantly on-chain.
            </p>
         </div>
         <div className="bg-gray-900/20 border border-gray-800 p-8 rounded-2xl hover:border-purple-500/30 transition-colors">
            <Server size={48} className="text-blue-500 mb-6" />
            <h3 className="text-2xl font-display font-bold">Hybrid Nexus Deployment</h3>
            <p className="text-gray-400 leading-relaxed">
               Deploy agents on our high-speed edge network (Cloudflare Workers) or containerize them for on-premise execution within your own VPC.
            </p>
         </div>
         <div className="bg-gray-900/20 border border-gray-800 p-8 rounded-2xl hover:border-purple-500/30 transition-colors">
            <Globe size={48} className="text-neon mb-6" />
            <h3 className="text-2xl font-display font-bold">Regional Compliance</h3>
            <p className="text-gray-400 leading-relaxed">
               Built for MENA. Data residency options in KSA (Riyadh) and UAE (Dubai) to meet NDMO and PDPL regulations.
            </p>
         </div>
         <div className="bg-gray-900/20 border border-gray-800 p-8 rounded-2xl hover:border-purple-500/30 transition-colors">
            <Cpu size={48} className="text-orange-500 mb-6" />
            <h3 className="text-2xl font-display font-bold">Custom Fine-Tuning</h3>
            <p className="text-gray-400 leading-relaxed">
               We fine-tune Gemini 3.0 Pro on your proprietary data sets to create agents that speak your corporate language and know your internal policies.
            </p>
         </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto border-t border-gray-800 pt-16">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
               <div className="text-4xl font-display font-bold text-white mb-2 text-shadow-glow">99.99%</div>
               <div className="text-xs font-mono text-gray-500">SLA UPTIME</div>
            </div>
             <div>
               <div className="text-4xl font-display font-bold text-white mb-2 text-shadow-glow">&lt;10ms</div>
               <div className="text-xs font-mono text-gray-500">INFRA LATENCY</div>
            </div>
             <div>
               <div className="text-4xl font-display font-bold text-white mb-2 text-shadow-glow">ISO</div>
               <div className="text-xs font-mono text-gray-500">27001 CERTIFIED</div>
            </div>
             <div>
               <div className="text-4xl font-display font-bold text-white mb-2 text-shadow-glow">24/7</div>
               <div className="text-xs font-mono text-gray-500">DEDICATED SUPPORT</div>
            </div>
         </div>
      </section>

    </div>
  );
};