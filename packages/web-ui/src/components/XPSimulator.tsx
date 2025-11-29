'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Trophy } from 'lucide-react';
import AxiomHolographicMandala from './AxiomHolographicMandala';

export default function XPSimulator() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [agentState, setAgentState] = useState<'IDLE' | 'THINKING' | 'EVOLVING'>('IDLE');

  const addXp = () => {
    const newXp = xp + 20;
    setXp(newXp);
    if (newXp >= 100) {
      setXp(0);
      setLevel(l => l + 1);
      setAgentState('EVOLVING');
      setTimeout(() => setAgentState('IDLE'), 3000);
    } else {
      setAgentState('THINKING');
      setTimeout(() => setAgentState('IDLE'), 1000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      
      {/* Controls */}
      <div className="bg-black/40 backdrop-blur-md border border-cyan-900/30 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-cyan-400">Evolution Simulator</h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-cyan-600">
            <span>Level {level}</span>
            <span>{xp} / 100 XP</span>
          </div>
          <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-cyan-900/30">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${xp}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={addXp}
            className="py-3 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-700/50 text-cyan-300 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4" />
            ADD XP
          </button>
          <button
            onClick={() => { setLevel(1); setXp(0); }}
            className="py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 rounded-lg font-bold transition-all"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="flex justify-center">
        <div className="relative w-64 h-64">
           {/* Passing props to Mandala - assuming these are the correct ones based on context */}
           <AxiomHolographicMandala 
             agentState={agentState}
             level={level}
             xp={xp}
           />
        </div>
      </div>
    </div>
  );
}
