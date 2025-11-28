'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid, Terminal as TerminalIcon, Activity, Hammer } from 'lucide-react';
import DeadHandMonitor from '@/components/DeadHandMonitor';
import CryptoCortex from '@/components/CryptoCortex';
import ControlHub from '@/components/ControlHub';
import NeuralTerminal from '@/components/NeuralTerminal';
import PolyphaseMonitor from '@/components/PolyphaseMonitor';
import TheForge from '@/components/TheForge';
import NeuralWorkspace from '@/components/NeuralWorkspace';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<'COMMAND' | 'FORGE' | 'WORKSPACE'>('COMMAND');

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
      
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-800 bg-[#050505] flex items-center justify-between px-4 z-50">
         <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-white transition-colors">
               <ArrowLeft size={18} />
            </Link>
            <div className="h-6 w-px bg-gray-800"></div>
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 bg-neon/10 rounded-sm flex items-center justify-center border border-neon/30">
                  <span className="font-display font-bold text-neon text-xs">A</span>
               </div>
               <span className="font-display font-bold tracking-tight text-sm">AXIOM QCC</span>
            </div>
         </div>

         {/* View Switcher */}
         <div className="flex bg-gray-900/50 p-1 rounded border border-gray-800">
            <button 
               onClick={() => setActiveView('COMMAND')}
               className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-2 transition-all ${activeView === 'COMMAND' ? 'bg-neon text-black shadow-neon' : 'text-gray-500 hover:text-white'}`}
            >
               <LayoutGrid size={12} /> COMMAND
            </button>
            <button 
               onClick={() => setActiveView('FORGE')}
               className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-2 transition-all ${activeView === 'FORGE' ? 'bg-tesla text-black shadow-[0_0_10px_rgba(205,127,50,0.5)]' : 'text-gray-500 hover:text-white'}`}
            >
               <Hammer size={12} /> FORGE
            </button>
            <button 
               onClick={() => setActiveView('WORKSPACE')}
               className={`px-3 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-2 transition-all ${activeView === 'WORKSPACE' ? 'bg-blue-500 text-black shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-gray-500 hover:text-white'}`}
            >
               <Activity size={12} /> WORKSPACE
            </button>
         </div>

         <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] text-green-500 font-mono font-bold">ONLINE</span>
            </div>
         </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 p-4 overflow-hidden relative">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

         {activeView === 'COMMAND' && (
            <div className="grid grid-cols-12 gap-4 h-full">
               {/* LEFT COLUMN: TERMINAL & COMMS (3 cols) */}
               <div className="col-span-3 flex flex-col gap-4 h-full">
                  <div className="flex-1">
                     <NeuralTerminal />
                  </div>
                  <div className="h-1/3">
                     <DeadHandMonitor />
                  </div>
               </div>

               {/* MIDDLE COLUMN: CONTROL HUB (6 cols) */}
               <div className="col-span-6 flex flex-col gap-4 h-full">
                  <div className="flex-none">
                     <CryptoCortex />
                  </div>
                  <div className="flex-1">
                     <ControlHub />
                  </div>
               </div>

               {/* RIGHT COLUMN: MONITORING (3 cols) */}
               <div className="col-span-3 h-full">
                  <PolyphaseMonitor />
               </div>
            </div>
         )}

         {activeView === 'FORGE' && (
            <div className="h-full max-w-5xl mx-auto">
               <TheForge />
            </div>
         )}

         {activeView === 'WORKSPACE' && (
            <div className="h-full max-w-6xl mx-auto">
               <NeuralWorkspace />
            </div>
         )}

      </main>
    </div>
  );
}
