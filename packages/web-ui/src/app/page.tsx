'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Shield, Zap, Globe, Terminal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-cyan-950/50 border border-cyan-500/30 rounded-lg flex items-center justify-center backdrop-blur-md">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            AXIOM ID
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="#features" className="hover:text-cyan-400 transition-colors">Capabilities</Link>
          <Link href="#agents" className="hover:text-cyan-400 transition-colors">Agents</Link>
          <Link href="#roadmap" className="hover:text-cyan-400 transition-colors">Roadmap</Link>
        </div>
        <Link 
          href="/dashboard" 
          className="group relative px-6 py-2 bg-cyan-950/30 border border-cyan-500/30 rounded-full overflow-hidden transition-all hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            Launch Console <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-800/30 text-cyan-400 text-xs font-mono mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            SYSTEM ONLINE: PHASE G INITIALIZED
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            The Operating System for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
              Sovereign AI Agents
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Deploy, orchestrate, and govern autonomous agents with topological intelligence. 
            Secured by the Dead Hand Protocol. Powered by Solana.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="w-full md:w-auto px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2"
            >
              <Terminal className="w-5 h-5" />
              INITIALIZE SYSTEM
            </Link>
            <Link 
              href="https://github.com/Moeabdelaziz007/axiom-core-deployment"
              target="_blank"
              className="w-full md:w-auto px-8 py-4 bg-black border border-gray-800 hover:border-gray-600 text-gray-300 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5" />
              View Source
            </Link>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 relative mx-auto max-w-5xl aspect-[16/9] rounded-xl border border-cyan-900/30 bg-black/50 backdrop-blur-sm overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-center">
                <Cpu className="w-24 h-24 text-cyan-900/50 mx-auto mb-4 animate-pulse" />
                <p className="text-cyan-900/50 font-mono text-sm">QUANTUM CORE SIMULATION</p>
             </div>
          </div>
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Topological Intelligence",
              desc: "Agents use advanced TDA to detect logical holes and prevent hallucinations in real-time."
            },
            {
              icon: Shield,
              title: "Dead Hand Protocol",
              desc: "Autonomous fail-safe mechanism that triggers defensive measures if operator heartbeat is lost."
            },
            {
              icon: Cpu,
              title: "Toric Swarm",
              desc: "Fault-tolerant agent lattice ensuring data persistence even if individual nodes fail."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 hover:border-cyan-900/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-950/30 transition-colors">
                <feature.icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 px-6 text-center relative z-10 bg-black">
        <p className="text-gray-600 text-sm">
          © 2025 Axiom ID. All systems nominal. <br />
          <span className="text-cyan-900">Built for the future of Sovereign AI.</span>
        </p>
      </footer>
    </div>
  );
}
