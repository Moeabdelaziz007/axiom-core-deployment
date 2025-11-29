'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart2, Globe, Zap, AlertTriangle } from 'lucide-react';

const MOCK_MARKET_DATA = [
  { symbol: 'SOL', price: 145.23, change: 5.4, sentiment: 'BULLISH' },
  { symbol: 'BTC', price: 64230.00, change: 1.2, sentiment: 'NEUTRAL' },
  { symbol: 'ETH', price: 3450.50, change: -0.8, sentiment: 'BEARISH' },
  { symbol: 'AXIOM', price: 1.05, change: 12.5, sentiment: 'HYPER-BULLISH' },
];

export default function MarketAnalystAgent() {
  const [data, setData] = useState(MOCK_MARKET_DATA);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        price: item.price * (1 + (Math.random() * 0.02 - 0.01)),
        change: item.change + (Math.random() * 0.5 - 0.25)
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-md border border-cyan-900/30 rounded-xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-100">MARKET ANALYST</h2>
            <div className="flex items-center gap-2 text-xs text-cyan-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              LIVE FEED ACTIVE
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-cyan-800 font-mono">AGENT ID</div>
          <div className="text-sm font-bold text-cyan-500">MA-7734</div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((item) => (
          <motion.div
            key={item.symbol}
            layout
            className="bg-black/60 border border-white/5 rounded-lg p-4 hover:border-cyan-500/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-cyan-100">{item.symbol}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                item.sentiment === 'BULLISH' || item.sentiment === 'HYPER-BULLISH' ? 'bg-green-900/20 text-green-400' :
                item.sentiment === 'BEARISH' ? 'bg-red-900/20 text-red-400' : 'bg-yellow-900/20 text-yellow-400'
              }`}>
                {item.sentiment}
              </span>
            </div>
            <div className="text-2xl font-mono text-white mb-1">
              ${item.price.toFixed(2)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(item.change).toFixed(2)}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analysis Feed */}
      <div className="flex-1 bg-black/20 rounded-lg border border-white/5 p-4 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan" />
        <h3 className="text-sm font-bold text-cyan-600 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          REAL-TIME INSIGHTS
        </h3>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex gap-3 text-cyan-300/80">
            <span className="text-cyan-800">[10:42:15]</span>
            <span>Detected accumulation pattern in  liquidity pools.</span>
          </div>
          <div className="flex gap-3 text-cyan-300/80">
            <span className="text-cyan-800">[10:42:02]</span>
            <span>BTC dominance showing weakness. Altcoin season probability: 78%.</span>
          </div>
          <div className="flex gap-3 text-cyan-300/80">
            <span className="text-cyan-800">[10:41:45]</span>
            <span>Sentiment analysis on X (Twitter) indicates surge in #Solana mentions.</span>
          </div>
          <div className="flex gap-3 text-yellow-400/80">
            <span className="text-yellow-900">[10:41:12]</span>
            <span className="flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Volatility Alert: ETH gas fees spiking.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
