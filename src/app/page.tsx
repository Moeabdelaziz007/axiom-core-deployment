'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Sparkles, Zap, ShieldCheck,
  ChefHat, Building, Activity, Settings, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Agent Data (Minimal for Bento) ---
const agents = [
  { id: 'sofra', name: 'Sofra', nameAr: 'سفرة', role: 'Restaurant OS', icon: <ChefHat />, color: '#FF6B5B', size: 'col-span-2' },
  { id: 'tajer', name: 'Tajer', nameAr: 'تاجر', role: 'Real Estate', icon: <Building />, color: '#FFB347', size: 'col-span-1' },
  { id: 'drmoe', name: 'Dr. Moe', nameAr: 'د. مو', role: 'Pharmacy AI', icon: <Activity />, color: '#00C4B4', size: 'col-span-1' },
  { id: 'tirs', name: 'Tirs', nameAr: 'تِرس', role: 'Industrial B2B', icon: <Settings />, color: '#8B9EB7', size: 'col-span-2' },
  { id: 'ostaz', name: 'Ostaz', nameAr: 'أستاذ', role: 'Education', icon: <BookOpen />, color: '#7C5CFF', size: 'col-span-3' },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Waitlist Logic
  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error('Waitlist error:', err);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-carbon text-white font-sans selection:bg-[#0A84FF]/30 pb-32">

      {/* 1. Navbar (Floating Glass) */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 bg-[#0B0E14]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A84FF] to-[#7C5CFF] flex items-center justify-center font-bold font-mono">A</div>
          <span className="font-semibold tracking-tight">Axiom Reset</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-slate-400 font-medium">
          <a href="#agents" className="hover:text-white transition-colors">Agents</a>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <a href="#" className="hover:text-white transition-colors">Login</a>
        </div>
        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-medium border border-white/10 transition-all">
          v1.0 Beta
        </button>
      </nav>

      {/* 2. Hero Section (The Cockpit) */}
      <section className="pt-48 pb-24 px-6 text-center max-w-4xl mx-auto relative">
        {/* Glow behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0A84FF]/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0A84FF]/20 bg-[#0A84FF]/5 text-[#0A84FF] text-xs font-mono mb-8"
        >
          <Sparkles className="w-3 h-3" /> THE BUSINESS OS
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40"
        >
          Automate. <br /> Scale. Dominate.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto"
        >
          Deploy 5 specialized AI agents to run your business operations.
          <span className="text-white"> 0% Commission.</span> Full Sovereignty.
        </motion.p>

        {/* Waitlist (Command Line Style) */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
          onSubmit={joinWaitlist}
          className="max-w-md mx-auto relative group"
          id="waitlist"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0A84FF] to-[#10B981] rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex bg-[#0B0E14] border border-white/10 rounded-xl p-1.5 items-center shadow-2xl">
            <div className="pl-4 pr-2 text-slate-500 font-mono text-sm">{'>'}</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to deploy..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 text-sm font-mono"
              disabled={loading || success}
            />
            <button
              disabled={loading || success}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${success
                  ? 'bg-[#10B981] text-black'
                  : 'bg-white text-black hover:bg-slate-200'
                }`}
            >
              {loading ? <Zap className="w-4 h-4 animate-spin" /> : success ? <ShieldCheck className="w-4 h-4" /> : 'Join List'}
              {!loading && !success && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.form>
      </section>

      {/* 3. The Agent Bento Grid (Linear Style) */}
      <section id="agents" className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-mono text-slate-500 uppercase tracking-widest">Neural Workforce</h2>
          <div className="h-[1px] flex-1 bg-white/10 ml-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`group group-spotlight p-8 rounded-2xl relative flex flex-col justify-between min-h-[240px] cursor-pointer ${agent.size}`}
            >
              {/* Top: Icon & Role */}
              <div className="flex justify-between items-start">
                <div
                  className="p-3 rounded-xl bg-white/5 border border-white/5 text-white transition-colors group-hover:bg-opacity-20"
                  style={{ color: agent.color }}
                >
                  {agent.icon}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              {/* Bottom: Name & Glow */}
              <div>
                <h3 className="text-2xl font-bold mb-1 group-hover:text-glow transition-all">
                  {agent.name}
                </h3>
                <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">{agent.role}</p>
              </div>

              {/* Hover Gradient Background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(circle at bottom right, ${agent.color}, transparent 60%)` }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. AI Value Proposition */}
      <section className="max-w-4xl mx-auto px-6 mt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#10B981]/10 to-[#0A84FF]/5 border border-[#10B981]/20"
        >
          <span className="text-4xl mb-4 block">🤖</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            AI Won't Take Your Job
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            <span className="text-[#10B981] font-semibold">AI will help you work smarter,</span> earn more,
            and achieve success you never imagined possible.
          </p>
          <p className="text-slate-500 mt-4 text-sm">
            من غير ما ياخد مكانك... هيشتغل <span className="text-white">جنبك</span>.
          </p>
        </motion.div>
      </section>

      {/* Footer Minimal */}
      <footer className="mt-32 border-t border-white/5 pt-12 text-center text-slate-600 text-xs font-mono uppercase">
        <p>System Status: Operational • Cairo Region</p>
        <div className="mt-4 flex justify-center gap-4">
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
        </div>
      </footer>

    </main>
  );
}
