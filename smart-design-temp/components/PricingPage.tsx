import React from 'react';
import { Zap, Check, ShieldCheck, Building, Bot } from 'lucide-react';

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12 px-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto text-center">
        
        <h1 className="text-5xl font-display font-bold mb-6">Scale at the Speed of Light</h1>
        <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">
          Start with a single "Spark" or power your entire enterprise with "Singularity".
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Spark Tier */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 relative overflow-hidden group hover:border-neon/50 transition-all">
             <div className="absolute top-0 inset-x-0 h-1 bg-neon"></div>
             <div className="flex items-center gap-2 mb-4">
                <Zap className="text-neon" size={24} />
                <h3 className="text-2xl font-display font-bold">Spark</h3>
             </div>
             <p className="text-gray-400 text-sm mb-6 h-10">For startups and individual creators needing specific modules.</p>
             <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold font-display">$0.99</span>
                <span className="text-gray-500">/mo per Kit</span>
             </div>
             
             <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2"><Check size={16} className="text-neon" /> 1 Agent / Kit (e.g., Vox)</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-neon" /> 1,000 Interactions/mo</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-neon" /> Synapse SDK Access</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-neon" /> Community Support</li>
             </ul>
             <button className="w-full py-3 bg-neon text-black font-bold rounded hover:bg-white transition-colors">Start Building</button>
          </div>

          {/* Fusion Tier */}
          <div className="bg-gray-900/60 border border-neon/30 rounded-2xl p-8 relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
             <div className="absolute top-4 right-4 bg-neon/20 text-neon text-xs font-bold px-2 py-1 rounded">MOST POPULAR</div>
             <div className="flex items-center gap-2 mb-4">
                <Bot className="text-white" size={24} />
                <h3 className="text-2xl font-display font-bold">Fusion</h3>
             </div>
             <p className="text-gray-400 text-sm mb-6 h-10">Full fleet access for growing businesses.</p>
             <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold font-display">$49</span>
                <span className="text-gray-500">/mo</span>
             </div>
             
             <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2"><Check size={16} className="text-white" /> Access to All 15 Agents</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-white" /> 50,000 Interactions/mo</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-white" /> Neural Workspace Pro</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-white" /> Priority Support</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-white" /> Remove Axiom Branding</li>
             </ul>
             <button className="w-full py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors">Get Fusion</button>
          </div>

          {/* Singularity Tier */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 relative overflow-hidden group hover:border-purple-500/50 transition-all">
             <div className="absolute top-0 inset-x-0 h-1 bg-purple-500"></div>
             <div className="flex items-center gap-2 mb-4">
                <Building className="text-purple-500" size={24} />
                <h3 className="text-2xl font-display font-bold">Singularity</h3>
             </div>
             <p className="text-gray-400 text-sm mb-6 h-10">Custom neural architecture for global enterprises.</p>
             <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold font-display">Custom</span>
             </div>
             
             <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2"><Check size={16} className="text-purple-500" /> Unlimited Interactions</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-purple-500" /> Custom Model Fine-tuning</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-purple-500" /> Dead Hand Protocol SLA</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-purple-500" /> Dedicated Architect</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-purple-500" /> On-Premise Deployment</li>
             </ul>
             <button className="w-full py-3 bg-purple-900/50 border border-purple-500/50 text-white font-bold rounded hover:bg-purple-800 transition-colors">Contact Sales</button>
          </div>

        </div>
      </div>
    </div>
  );
};