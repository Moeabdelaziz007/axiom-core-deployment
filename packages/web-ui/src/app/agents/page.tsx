'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, ShieldCheck, Zap, Activity, Mail, MessageCircle, Cpu, Globe, Database, Search, Filter } from 'lucide-react';
import { ViewMode } from '../../types';

const AGENT_ROSTER = [
  // CORE
  { name: 'SOFRA', role: 'Hospitality Host', desc: 'Guest management & dining sentiment.', category: 'CORE', icon: Activity, color: 'text-orange-500' },
  { name: 'AQAR', role: 'Real Estate Oracle', desc: 'Property valuation & govt forms.', category: 'CORE', icon: Bot, color: 'text-blue-500' },
  { name: 'MAWID', role: 'Appointment Manager', desc: 'Booking optimization & reminders.', category: 'CORE', icon: Activity, color: 'text-purple-500' },
  { name: 'TAJER', role: 'E-Commerce Sales', desc: 'Product recommendations & upsells.', category: 'CORE', icon: Zap, color: 'text-green-500' },
  
  // CREATIVE
  { name: 'DALAL', role: 'Negotiation Engine', desc: 'Dynamic pricing & deal closing.', category: 'CREATIVE', icon: Zap, color: 'text-green-400' },
  { name: 'HARES', role: 'Cyber Sentinel', desc: 'Community moderation & security.', category: 'CREATIVE', icon: ShieldCheck, color: 'text-red-500' },
  { name: 'MUALEM', role: 'Knowledge Tutor', desc: 'Personalized learning paths.', category: 'CREATIVE', icon: Bot, color: 'text-yellow-500' },
  { name: 'RAED', role: 'Startup Mentor', desc: 'Pitch deck & business planning.', category: 'CREATIVE', icon: Activity, color: 'text-indigo-500' },

  // MENA SPECIFIC
  { name: 'KHIDMA', role: 'Service Coordinator', desc: 'Home services & maintenance.', category: 'MENA', icon: Bot, color: 'text-teal-500' },
  { name: 'MOHAMI', role: 'Legal Advisor', desc: 'Contract review & compliance.', category: 'MENA', icon: ShieldCheck, color: 'text-slate-400' },
  { name: 'MUHANDIS', role: 'Engineering Lead', desc: 'Technical specs & project mgmt.', category: 'MENA', icon: Cpu, color: 'text-orange-400' },
  { name: 'MUSAWWIM', role: 'Market Analyst', desc: 'Competitor analysis & trends.', category: 'MENA', icon: Activity, color: 'text-pink-500' },
  { name: 'MUHASIB', role: 'Financial Auditor', desc: 'Tax filing & expense tracking.', category: 'MENA', icon: Database, color: 'text-emerald-500' },
  { name: 'TABIB', role: 'Health Consultant', desc: 'Symptom triage & wellness.', category: 'MENA', icon: Activity, color: 'text-red-400' }
];

export default function AgentsPage() {
  const [filter, setFilter] = React.useState('ALL');

  const filteredAgents = filter === 'ALL' 
    ? AGENT_ROSTER 
    : AGENT_ROSTER.filter(a => a.category === filter);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neon/30 p-6">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 flex items-center justify-between">
         <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-mono text-sm uppercase tracking-widest">Back to Base</span>
         </Link>
         <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-neon/10 border border-neon/30 rounded text-neon text-xs font-mono font-bold">
               ROSTER_SIZE: {AGENT_ROSTER.length}
            </div>
         </div>
      </header>

      {/* Title */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
         <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6">
            SELECT YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-white to-neonBlue">OPERATIVE</span>
         </h1>
         <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Deploy specialized autonomous agents instantly. No hiring process. No payroll. Just pure performance.
         </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-12 flex justify-center gap-4">
         {['ALL', 'CORE', 'CREATIVE', 'MENA'].map((cat) => (
            <button
               key={cat}
               onClick={() => setFilter(cat)}
               className=""
            >
               {cat}
            </button>
         ))}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredAgents.map((agent, i) => (
            <div key={i} className="bg-[#050505] border border-gray-800 rounded-xl p-6 hover:border-neon/50 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                  <agent.icon size={40} className={agent.color} />
               </div>
               
               <div className="mb-4">
                  <span className="">
                     {agent.category}
                  </span>
               </div>

               <h3 className="text-2xl font-display font-bold text-white mb-1 group-hover:text-neon transition-colors">
                  {agent.name}
               </h3>
               <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">{agent.role}</p>
               
               <p className="text-sm text-gray-400 mb-6 min-h-[40px]">
                  {agent.desc}
               </p>

               <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                  <span className="text-white font-bold">/bin/zsh.99<span className="text-gray-600 text-xs font-normal">/mo</span></span>
                  <button className="px-4 py-2 bg-white/5 hover:bg-neon hover:text-black border border-white/10 hover:border-neon rounded text-xs font-bold uppercase tracking-widest transition-all">
                     Deploy
                  </button>
               </div>
            </div>
         ))}
      </div>

    </div>
  );
}
