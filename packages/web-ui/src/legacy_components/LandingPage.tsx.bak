
import React from 'react';
import { ArrowRight, Bot, ShieldCheck, Zap, Activity, Mail, MessageCircle, Cpu, Globe, Database } from 'lucide-react';
import { ViewMode, AgentRole } from '../types';

interface LandingPageProps {
  onNavigate: (mode: ViewMode) => void;
}

const FEATURED_AGENTS = [
  {
    name: 'SOFRA',
    role: 'Hospitality Host',
    desc: 'Greets guests, manages reservations, and analyzes dining sentiment.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop&grayscale',
    color: 'text-orange-500',
    borderColor: 'hover:border-orange-500/50',
    shadow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    icon: Activity
  },
  {
    name: 'AQAR',
    role: 'Real Estate Oracle',
    desc: 'Predicts property trends, valuations, and automates government forms.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop&grayscale',
    color: 'text-blue-500',
    borderColor: 'hover:border-blue-500/50',
    shadow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    icon: Bot
  },
  {
    name: 'DALAL',
    role: 'Negotiation Engine',
    desc: 'Closes deals by negotiating discounts within your set margins.',
    image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=1000&auto=format&fit=crop&grayscale',
    color: 'text-green-500',
    borderColor: 'hover:border-green-500/50',
    shadow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]',
    icon: Zap
  },
  {
    name: 'HARES',
    role: 'Cyber Sentinel',
    desc: 'Auto-moderates communities and detects phishing attempts instantly.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&grayscale',
    color: 'text-red-500',
    borderColor: 'hover:border-red-500/50',
    shadow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    icon: ShieldCheck
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-neon/30">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(ViewMode.DASHBOARD)}>
            <div className="w-8 h-8 bg-neon/10 rounded-sm flex items-center justify-center border border-neon/30 shadow-neon">
              <span className="font-display font-bold text-neon">A</span>
            </div>
            <span className="font-display font-bold tracking-tight text-xl">AXIOM ID</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
             <button onClick={() => onNavigate(ViewMode.AGENTS)} className="hover:text-white transition-colors">Agents</button>
             <button onClick={() => onNavigate(ViewMode.PRICING)} className="hover:text-white transition-colors">Pricing</button>
             <button onClick={() => onNavigate(ViewMode.ENTERPRISE)} className="hover:text-white transition-colors">Enterprise</button>
             <button onClick={() => onNavigate(ViewMode.ABOUT)} className="hover:text-white transition-colors">About</button>
             <button 
               onClick={() => onNavigate(ViewMode.DASHBOARD)}
               className="bg-neon text-black px-5 py-2 rounded-sm font-bold font-display hover:bg-white transition-all shadow-neon hover:shadow-neon-strong"
             >
               LAUNCH APP
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-neonBlue/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>

        <div className="relative z-10 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon/30 bg-neon/5 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:scale-105 transition-transform cursor-default">
              <div className="w-2 h-2 rounded-full bg-neon animate-pulse-fast"></div>
              <span className="text-xs font-mono text-neon font-bold tracking-wide uppercase">System Online • SAAAS v3.0</span>
           </div>

           <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter mb-8 leading-[0.9]">
             HIRE YOUR <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-white to-neonBlue neon-text-glow">DIGITAL STAFF</span>
           </h1>

           <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
             Stop buying software. Start hiring <span className="text-white font-semibold">Autonomous Agents</span>.
             <br/>
             <span className="text-sm font-mono text-gray-500 mt-4 block">
                Negotiators • Hosts • Researchers • Guardians
             </span>
           </p>

           <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={() => onNavigate(ViewMode.DASHBOARD)}
                className="group relative px-8 py-4 bg-neon text-black rounded font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-[0_0_20px_theme('colors.neon')]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">Initialize Fleet <ArrowRight size={20} /></span>
              </button>
              
              <button 
                onClick={() => onNavigate(ViewMode.AGENTS)}
                className="px-8 py-4 bg-transparent border border-gray-700 hover:border-white text-white rounded font-bold text-lg transition-all hover:bg-white/5"
              >
                View Roster
              </button>
           </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
           <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-neon rounded-full"></div>
           </div>
        </div>
      </section>

      {/* Agents Team Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
           <h2 className="text-4xl font-display font-bold mb-4">Meet Your New <span className="text-neon">Team</span></h2>
           <p className="text-gray-400 max-w-2xl mx-auto">
             Each agent is a specialized "Micro-Employee" trained on specific datasets to handle complex tasks autonomously.
           </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {FEATURED_AGENTS.map((agent, i) => (
             <div key={i} className={`bg-[#050505] border border-gray-800 rounded-xl overflow-hidden group transition-all duration-500 ${agent.borderColor} ${agent.shadow} relative`}>
                {/* Image Hologram Effect */}
                <div className="h-64 relative overflow-hidden">
                   <img 
                     src={agent.image} 
                     alt={agent.name} 
                     className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 filter grayscale group-hover:grayscale-0"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                   <div className="absolute top-4 right-4 bg-black/60 backdrop-blur p-2 rounded-lg border border-gray-700">
                      <agent.icon size={20} className={agent.color} />
                   </div>
                </div>

                {/* Content */}
                <div className="p-6 relative -mt-12 z-10">
                   <div className="bg-gray-900/90 backdrop-blur border border-gray-700 p-4 rounded-lg shadow-lg">
                      <h3 className="text-2xl font-display font-bold text-white mb-1">{agent.name}</h3>
                      <p className={`text-xs font-mono font-bold uppercase mb-3 ${agent.color}`}>{agent.role}</p>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4 min-h-[60px]">{agent.desc}</p>
                      
                      <button onClick={() => onNavigate(ViewMode.AGENTS)} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                         View Profile <ArrowRight size={12} />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-900/30 border-y border-gray-800 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
             <div className="p-4 border-r border-gray-800/50 last:border-0 group">
               <Cpu size={32} className="mx-auto text-gray-600 group-hover:text-neon mb-4 transition-colors" />
               <div className="text-white text-3xl font-black font-display mb-1">3.0</div>
               <div className="text-gray-500 text-xs font-mono tracking-widest">GEMINI PRO REASONING</div>
             </div>
             <div className="p-4 border-r border-gray-800/50 last:border-0 group">
               <Zap size={32} className="mx-auto text-gray-600 group-hover:text-neon mb-4 transition-colors" />
               <div className="text-white text-3xl font-black font-display mb-1">&lt;24ms</div>
               <div className="text-gray-500 text-xs font-mono tracking-widest">EDGE LATENCY</div>
             </div>
             <div className="p-4 border-r border-gray-800/50 last:border-0 group">
               <Database size={32} className="mx-auto text-gray-600 group-hover:text-neon mb-4 transition-colors" />
               <div className="text-white text-3xl font-black font-display mb-1">SOL</div>
               <div className="text-gray-500 text-xs font-mono tracking-widest">BLOCKCHAIN NATIVE</div>
             </div>
             <div className="p-4 group">
               <Globe size={32} className="mx-auto text-gray-600 group-hover:text-neon mb-4 transition-colors" />
               <div className="text-white text-3xl font-black font-display mb-1">99.9%</div>
               <div className="text-gray-500 text-xs font-mono tracking-widest">UPTIME GUARANTEED</div>
             </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020202] border-t border-gray-800 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              
              {/* Brand Column */}
              <div>
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-neon/10 rounded-sm flex items-center justify-center border border-neon/30">
                       <span className="font-display font-bold text-neon">A</span>
                    </div>
                    <span className="font-display font-bold text-white text-xl">AXIOM ID</span>
                 </div>
                 <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Pioneering the SAAAS revolution. We replace static software with dynamic, autonomous digital employees.
                 </p>
                 <div className="flex gap-4">
                    {/* Social Placeholders */}
                    <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors"><Globe size={16} /></div>
                    <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors"><Zap size={16} /></div>
                 </div>
              </div>

              {/* Contact Column */}
              <div className="col-span-1 lg:col-span-2">
                 <h4 className="text-white font-bold font-display mb-6">Founder Contact</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-900/30 border border-gray-800 p-4 rounded hover:border-neon/30 transition-colors">
                       <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Full Stack Founder</p>
                       <p className="text-white font-bold">Mohamed Hossameldin Abdelaziz</p>
                    </div>
                    <div className="bg-gray-900/30 border border-gray-800 p-4 rounded hover:border-neon/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                           <MessageCircle size={14} className="text-green-500" />
                           <span className="text-xs text-gray-500 uppercase tracking-widest">WhatsApp</span>
                        </div>
                       <p className="text-white font-mono">+1 (770) 616-0211</p>
                    </div>
                    <div className="bg-gray-900/30 border border-gray-800 p-4 rounded hover:border-neon/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                           <Mail size={14} className="text-blue-500" />
                           <span className="text-xs text-gray-500 uppercase tracking-widest">University</span>
                        </div>
                       <p className="text-white font-mono text-sm">Mabdela1@students.kennesaw.edu</p>
                    </div>
                     <div className="bg-gray-900/30 border border-gray-800 p-4 rounded hover:border-neon/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                           <Mail size={14} className="text-orange-500" />
                           <span className="text-xs text-gray-500 uppercase tracking-widest">Direct</span>
                        </div>
                       <p className="text-white font-mono text-sm">Amrikyy@gmail.com</p>
                    </div>
                 </div>
              </div>

              {/* Powered By Column */}
              <div>
                 <h4 className="text-white font-bold font-display mb-6">Intelligence Engine</h4>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                       Powered by <span className="text-white font-bold">Google Gemini</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                       Automated Workflows
                    </div>
                     <div className="flex items-center gap-3 text-gray-400 text-sm">
                       <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                       Solana Blockchain
                    </div>
                 </div>
              </div>

           </div>

           <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
              <p>© 2025 Axiom ID. All rights reserved.</p>
              <div className="flex gap-6">
                 <span className="hover:text-gray-400 cursor-pointer">PRIVACY_PROTOCOL</span>
                 <span className="hover:text-gray-400 cursor-pointer">TERMS_OF_SERVICE</span>
                 <span className="hover:text-gray-400 cursor-pointer">SYSTEM_STATUS</span>
              </div>
           </div>
        </div>
      </footer>

    </div>
  );
};
