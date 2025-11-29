'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send } from 'lucide-react';

export default function NeuralTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    '> AXIOM_KERNEL_v3.0.1 initialized',
    '> NEURAL_LINK_ESTABLISHED',
    '> WAITING_FOR_COMMAND...'
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, `> ${cmd}`]);
    setInput('');

    // Simulate system response
    setTimeout(() => {
      let response = '> COMMAND_NOT_RECOGNIZED';
      if (cmd.toLowerCase() === 'help') response = '> AVAILABLE_COMMANDS: DEPLOY, STATUS, SCAN, CLEAR';
      if (cmd.toLowerCase() === 'status') response = '> SYSTEM_OPTIMAL | 4 AGENTS ACTIVE';
      if (cmd.toLowerCase() === 'clear') {
         setHistory(['> TERMINAL_CLEARED']);
         return;
      }
      setHistory(prev => [...prev, response]);
    }, 500);
  };

  return (
    <div className="bg-[#050505] border border-gray-800 rounded-lg flex flex-col h-full overflow-hidden relative group hover:border-neon/30 transition-colors">
      {/* Glass Header */}
      <div className="bg-gray-900/50 backdrop-blur border-b border-gray-800 p-3 flex items-center justify-between">
         <div className="flex items-center gap-2 text-neon">
            <Terminal size={14} />
            <span className="text-[10px] font-bold font-mono tracking-widest">NEURAL_TERMINAL</span>
         </div>
         <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
         </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-1 relative z-10">
         {history.map((line, i) => (
            <div key={i} className={`${line.startsWith('>') ? 'text-matrix' : 'text-gray-400'} animate-fade-in`}>
               {line}
            </div>
         ))}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleCommand} className="p-2 border-t border-gray-800 bg-gray-900/30 relative z-10">
         <div className="flex items-center gap-2">
            <span className="text-neon font-mono text-xs">{'>'}</span>
            <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-white placeholder-gray-600"
               placeholder="ENTER_COMMAND..."
               autoFocus
            />
            <button type="submit" className="text-gray-500 hover:text-neon transition-colors">
               <Send size={14} />
            </button>
         </div>
      </form>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] opacity-10"></div>
    </div>
  );
}
