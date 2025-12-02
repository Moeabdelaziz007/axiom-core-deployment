'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Terminal, Shield, Zap, Database } from 'lucide-react';

export default function DreamFactoryPage() {
  const [seed, setSeed] = useState('');
  const [temperature, setTemperature] = useState(0.9);
  const [isDreaming, setIsDreaming] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const startDreaming = async () => {
    if (!seed) return;
    setIsDreaming(true);
    setLogs([]); // Clear old logs

    try {
      const response = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, temperature }),
      });

      if (!response.body) throw new Error("No stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // Process streaming data (chunks might contain multiple lines)
        const lines = chunk.split("\n\n").filter(Boolean);
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            setLogs(prev => [...prev, data]);
          } catch (e) {
            console.log("Stream Parse Error (Ignored):", e);
          }
        }
      }

    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, { agent: 'ERROR', data: 'Connection Lost.' }]);
    } finally {
      setIsDreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-6 flex flex-col gap-6">
      
      {/* Header */}
      <header className="flex justify-between items-center border-b border-green-900 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="animate-pulse" /> THE DREAM FACTORY <span className="text-xs bg-green-900 px-2 rounded">GEN-1</span>
        </h1>
        <div className="flex gap-4 text-xs text-green-700">
          <span className="flex items-center gap-1"><Shield size={12}/> ARCJET: ACTIVE</span>
          <span className="flex items-center gap-1"><Database size={12}/> TURSO: LINKED</span>
        </div>
      </header>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-900/50 p-6 rounded border border-green-800/50">
          <label className="block text-sm mb-2 text-green-400">INCEPTION SEED</label>
          <textarea 
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="e.g. A protocol for decentralized longevity research funding..."
            className="w-full h-32 bg-black border border-green-700 rounded p-3 text-green-300 focus:outline-none focus:border-green-400 mb-4 text-sm"
          />
          
          <label className="block text-sm mb-2 text-green-400">ENTROPY (TEMPERATURE): {temperature}</label>
          <input 
            type="range" 
            min="0.1" max="1.5" step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full mb-6 accent-green-500"
          />

          <button 
            onClick={startDreaming}
            disabled={isDreaming || !seed}
            className={`w-full py-4 rounded font-bold text-black transition-all flex items-center justify-center gap-2
              ${isDreaming ? 'bg-green-800 cursor-not-allowed' : 'bg-green-500 hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]'}
            `}
          >
            {isDreaming ? <Zap className="animate-spin"/> : <Terminal />}
            {isDreaming ? 'DREAMING...' : 'INITIATE SEQUENCE'}
          </button>
        </div>

        {/* The Matrix Stream (Live Logs) */}
        <div className="lg:col-span-2 bg-black border border-green-500/30 rounded p-4 h-[500px] overflow-y-auto relative shadow-inner">
          <div className="absolute top-2 right-2 text-xs text-green-800">LIVE FEED // {isDreaming ? 'ONLINE' : 'STANDBY'}</div>
          
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 border-l-2 border-green-800 pl-3 py-1"
              >
                <div className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">
                  {log.agent || 'SYSTEM'}
                </div>
                <div className="text-sm text-green-300 whitespace-pre-wrap">
                  {/* Display output. If object, stringify it. */}
                  {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
