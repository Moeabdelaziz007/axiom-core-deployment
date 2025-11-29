'use client';

import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

export default function CryptoCortex() {
  return (
    <div className="bg-[#050505] border border-gray-800 rounded-lg p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white">
          <Wallet size={16} className="text-neonBlue" />
          <span className="text-xs font-bold tracking-widest">CRYPTO CORTEX</span>
        </div>
        <RefreshCw size={12} className="text-gray-600 hover:text-white cursor-pointer transition-colors" />
      </div>

      <div className="mb-4">
         <p className="text-[10px] text-gray-500 font-mono mb-1">TOTAL BALANCE</p>
         <div className="flex items-end gap-2">
            <span className="text-2xl font-display font-bold text-white">420.69</span>
            <span className="text-sm font-bold text-neonBlue mb-1">SOL</span>
         </div>
         <p className="text-[10px] text-green-500 font-mono mt-1 flex items-center gap-1">
            <ArrowUpRight size={10} /> +12.5% (24h)
         </p>
      </div>

      <div className="space-y-2">
         <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-2">Recent Transactions</p>
         
         {[
            { type: 'in', amount: '+2.5 SOL', from: 'Wallet...8x2', time: '2m ago' },
            { type: 'out', amount: '-0.1 SOL', from: 'Gas Fee', time: '15m ago' },
            { type: 'in', amount: '+10.0 SOL', from: 'Agent Rent', time: '1h ago' },
         ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-900/30 rounded border border-gray-800/50 hover:border-gray-700 transition-colors">
               <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${tx.type === 'in' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                     {tx.type === 'in' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                  </div>
                  <span className="text-gray-400">{tx.from}</span>
               </div>
               <div className="text-right">
                  <p className="text-white font-mono">{tx.amount}</p>
                  <p className="text-[9px] text-gray-600">{tx.time}</p>
               </div>
            </div>
         ))}
      </div>
      
      {/* Decorative Graph Line */}
      <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 pointer-events-none">
         <svg viewBox="0 0 100 20" className="w-full h-full fill-none stroke-neonBlue" preserveAspectRatio="none">
            <path d="M0 15 Q 10 5, 20 10 T 40 12 T 60 5 T 80 15 T 100 8" strokeWidth="0.5" />
            <path d="M0 15 L 100 15 L 100 20 L 0 20 Z" className="fill-neonBlue/10 stroke-none" />
         </svg>
      </div>
    </div>
  );
}
