'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, Shield, Globe, Cpu, ArrowRight, Loader2 } from 'lucide-react';
import { forgeAgentDNA } from '../services/axiomForge';

interface AgentDNA {
  name: string;
  role: string;
  ticker: string;
  description: string;
  traits: string[];
  color: string;
  icon: string;
}

export default function TheForge() {
  const [step, setStep] = useState<'INPUT' | 'FORGING' | 'RESULT'>('INPUT');
  const [prompt, setPrompt] = useState('');
  const [agentDNA, setAgentDNA] = useState<AgentDNA | null>(null);

  const handleForge = async () => {
    if (!prompt.trim()) return;
    setStep('FORGING');
    try {
      const dna = await forgeAgentDNA(prompt);
      setAgentDNA(dna);
      setStep('RESULT');
    } catch (error) {
      console.error(error);
      setStep('INPUT'); // Reset on error
      // Ideally show an error toast here
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.1)] overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 'INPUT' && (
            <motion.div
              key="INPUT"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-block p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-2">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Genesis Protocol</h2>
                <p className="text-cyan-200/60">Describe your ideal AI agent, and the Forge will construct its DNA.</p>
              </div>

              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A ruthless market analyst who specializes in high-frequency trading and loves volatility..."
                  className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                />
                <div className="absolute bottom-4 right-4 text-xs text-cyan-900/60">
                  {prompt.length} chars
                </div>
              </div>

              <button
                onClick={handleForge}
                disabled={!prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white tracking-widest hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                <Zap className="w-4 h-4 group-hover:text-yellow-300 transition-colors" />
                INITIALIZE FORGE
              </button>
            </motion.div>
          )}

          {step === 'FORGING' && (
            <motion.div
              key="FORGING"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center py-12 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-cyan-400 animate-pulse">Constructing Neural Pathways...</h3>
                <p className="text-sm text-cyan-800">Synthesizing personality matrix</p>
              </div>
            </motion.div>
          )}

          {step === 'RESULT' && agentDNA && (
            <motion.div
              key="RESULT"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-900/50 to-black border border-cyan-500/30 flex items-center justify-center text-3xl">
                    {/* Dynamic Icon Rendering could go here, for now just emoji or generic */}
                    🤖
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{agentDNA.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-900/30 text-cyan-400 border border-cyan-800/50">
                        {agentDNA.ticker}
                      </span>
                      <span className="text-sm text-cyan-600">{agentDNA.role}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep('INPUT')}
                  className="text-xs text-cyan-800 hover:text-cyan-500 transition-colors"
                >
                  RESET
                </button>
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-cyan-100/80 text-sm leading-relaxed">
                  {agentDNA.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {agentDNA.traits.map((trait, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-cyan-300">
                    {trait}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button className="py-3 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30 transition-all text-sm font-bold">
                  EDIT DNA
                </button>
                <button className="py-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-all text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  DEPLOY AGENT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
