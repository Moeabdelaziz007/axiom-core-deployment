'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeadHandMonitor from '@/components/DeadHandMonitor';
import CreateAgentWizard from '@/components/CreateAgentWizard';
import NeuralWorkspace from '@/components/NeuralWorkspace';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Cpu, Activity, Terminal, Grid } from 'lucide-react';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<'COMMAND' | 'FORGE' | 'WORKSPACE'>('COMMAND');

  return (
    <div className="min-h-screen bg-black text-cyan-500 font-mono p-4 md:p-8 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-8 border-b border-cyan-900/50 pb-4">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 bg-cyan-950/30 border border-cyan-500/30 rounded-lg flex items-center justify-center">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              AXIOM COMMAND
            </h1>
            <p className="text-xs text-cyan-600 uppercase tracking-widest">Quantum Operations Center</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-2">
          {[
            { id: 'COMMAND', icon: Activity, label: 'OVERWATCH' },
            { id: 'FORGE', icon: Cpu, label: 'THE FORGE' },
            { id: 'WORKSPACE', icon: Grid, label: 'NEURAL NET' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-300 ${
                activeView === item.id
                  ? 'bg-cyan-950/50 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-black/50 border-cyan-900/30 text-cyan-700 hover:border-cyan-700 hover:text-cyan-400'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden md:inline font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav><div className="ml-4"><WalletMultiButton /></div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeView === 'COMMAND' && (
            <motion.div
              key="COMMAND"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Dead Hand & Status */}
              <div className="lg:col-span-1 space-y-6">
                <DeadHandMonitor />
                
                {/* System Status Card */}
                <div className="bg-black/40 backdrop-blur-md border border-cyan-900/30 rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> SYSTEM LOGS
                  </h3>
                  <div className="space-y-2 text-xs font-mono text-cyan-600/80 h-48 overflow-y-auto">
                    <p>> Initializing Quantum Core...</p>
                    <p>> Connected to Solana Devnet</p>
                    <p>> Dead Hand Protocol: ACTIVE</p>
                    <p>> Neural Interface: STANDBY</p>
                    <p className="text-cyan-400 animate-pulse">> Awaiting Operator Input_</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Main Visualizer (Placeholder for now) */}
              <div className="lg:col-span-2">
                 <div className="h-full min-h-[400px] bg-black/40 backdrop-blur-md border border-cyan-900/30 rounded-xl p-1 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)]" />
                    <div className="text-center">
                        <Activity className="w-16 h-16 text-cyan-800 mx-auto mb-4 animate-pulse" />
                        <h2 className="text-2xl font-bold text-cyan-700">GLOBAL NETWORK MAP</h2>
                        <p className="text-cyan-900">Offline</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeView === 'FORGE' && (
            <motion.div
              key="FORGE"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <CreateAgentWizard />
            </motion.div>
          )}

          {activeView === 'WORKSPACE' && (
            <motion.div
              key="WORKSPACE"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-[600px]"
            >
              <NeuralWorkspace />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
