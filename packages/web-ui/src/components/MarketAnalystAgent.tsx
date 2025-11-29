'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { swarmEngine } from '../core/topology/SwarmConsensusEngine';
import { messageBus } from '../core/communication/AgentMessageBus';

export default function MarketAnalystAgent() {
  const [sentiment, setSentiment] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'HYPER-BULLISH'>('NEUTRAL');
  const [price, setPrice] = useState(145.20);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate price movement
      setPrice(prev => prev + (Math.random() - 0.5) * 2);
      
      // Simulate sentiment analysis
      const rand = Math.random();
      let newSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'HYPER-BULLISH' = 'NEUTRAL';
      
      if (rand > 0.9) newSentiment = 'HYPER-BULLISH';
      else if (rand > 0.7) newSentiment = 'BULLISH';
      else if (rand < 0.2) newSentiment = 'BEARISH';

      setSentiment(newSentiment);

      // Trigger Swarm Proposal on strong signal
      if (newSentiment === 'HYPER-BULLISH') {
        const actionId = `signal_${Date.now()}`;
        
        // 1. Announce to Chat
        messageBus.publish({
          senderId: 'Market_Analyst_01',
          channel: 'MARKET',
          content: `🚀 HYPER-BULLISH Signal Detected! SOL/USD at ${price.toFixed(2)}. Initiating Buy Proposal.`,
          priority: 'HIGH'
        });

        // 2. Propose Action
        swarmEngine.proposeAction({
          id: actionId,
          type: 'BUY',
          payload: { asset: 'SOL', amount: 1000, reason: 'Hyper-Bullish Momentum' },
          proposerId: 'Market_Analyst_01',
          timestamp: Date.now()
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [price]);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-green-900/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-green-400 font-bold border-b border-green-900/30 pb-2">
        <BarChart2 className="w-4 h-4" />
        MARKET ANALYST
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-green-600 mb-1">SOL/USD</div>
          <div className="text-2xl font-mono text-white">${price.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-green-600 mb-1">SENTIMENT</div>
          <div className={`text-sm font-bold ${
            sentiment === 'HYPER-BULLISH' ? 'text-green-400 animate-pulse' :
            sentiment === 'BULLISH' ? 'text-green-500' :
            sentiment === 'BEARISH' ? 'text-red-500' : 'text-gray-400'
          }`}>
            {sentiment}
          </div>
        </div>
      </div>

      <div className="h-24 bg-black/50 rounded-lg border border-white/5 relative overflow-hidden flex items-end gap-1 p-1">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-green-500/20 hover:bg-green-500/40 transition-colors"
            initial={{ height: '20%' }}
            animate={{ height: `${20 + Math.random() * 60}%` }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
          />
        ))}
      </div>
    </div>
  );
}
