import React from 'react';
import { Network, Sparkles, Brain, Bot, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12 px-6 overflow-y-auto">
      
      <section className="max-w-4xl mx-auto text-center mb-20 animate-fade-in-up">
         <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">
            The SAAAS Revolution
         </h1>
         <p className="text-xl text-gray-400 leading-relaxed">
            We are redefining the agency model. Axiom ID is the world's first <span className="text-neon font-bold">Super Automated Agency as a Service</span>.
         </p>
      </section>

      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
         <div>
            <div className="flex items-center gap-2 mb-6">
               <Bot className="text-neon" size={24} />
               <h2 className="text-3xl font-display font-bold text-white">Agency, not Platform</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
               PaaS provides tools. SAAAS provides outcomes.
               When you use Axiom, you aren't just getting a chatbot API; you are hiring a digital fleet of specialists. 
               Agent Dalal negotiates deals. Agent Hares protects your community. Agent Sofra welcomes your guests.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
               We've packaged high-level artificial intelligence into $0.99/month "Micro-SaaS" modules that act like employees, not software.
            </p>
         </div>
         <div className="relative">
            <div className="absolute inset-0 bg-neon/20 blur-[100px] rounded-full"></div>
            <div className="relative bg-gray-900/50 border border-gray-700 p-8 rounded-xl backdrop-blur-sm hover:border-neon/50 transition-all shadow-neon">
               <Network size={64} className="text-white mb-4" />
               <div className="text-2xl font-bold font-display mb-2">Axiom Synapse</div>
               <div className="text-sm font-mono text-gray-400">
                  Connecting {`{Business}`} to {`{Digital_Workforce}`} via {`{Synapse_Protocol}`}
               </div>
            </div>
         </div>
      </section>

      <section className="max-w-4xl mx-auto bg-gray-900/20 border border-gray-800 p-12 rounded-2xl text-center relative overflow-hidden group">
         <div className="absolute inset-0 scanlines-bg opacity-10 pointer-events-none"></div>
         <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto flex items-center justify-center mb-6 border border-gray-700 group-hover:border-neon transition-colors">
            <Brain size={32} className="text-gray-400 group-hover:text-neon" />
         </div>
         <h2 className="text-2xl font-display font-bold mb-4">The Architect</h2>
         <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Built by <span className="text-white font-bold">Moe Abdelaziz</span>. A solo founder leveraging the power of Generative AI to punch above the weight class of traditional enterprise teams.
         </p>
         <div className="flex justify-center gap-4 text-sm font-mono text-neon">
            <span>FULL_STACK</span>
            <span>•</span>
            <span>AI_NATIVE</span>
            <span>•</span>
            <span>SOLANA_DEV</span>
         </div>
      </section>

    </div>
  );
};