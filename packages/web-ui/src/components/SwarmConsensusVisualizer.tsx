'use client';

import React, { useEffect, useState } from 'react';
import { swarmEngine, ConsensusResult } from '../core/topology/SwarmConsensusEngine';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function SwarmConsensusVisualizer() {
  const [latestResult, setLatestResult] = useState<ConsensusResult | null>(null);
  const [proposal, setProposal] = useState<any | null>(null);

  useEffect(() => {
    // Simulate a proposal on mount for demo
    const actionId = swarmEngine.proposeAction({
      id: `prop_${Date.now()}`,
      type: 'DEPLOY',
      payload: { target: 'Mainnet' },
      proposerId: 'Agent_Alpha',
      timestamp: Date.now()
    });

    // Simulate swarm reaction
    setTimeout(() => {
      swarmEngine.simulateSwarmReaction(actionId, 15);
    }, 1000);

    const unsubscribe = swarmEngine.subscribe((proposalId) => {
      const result = swarmEngine.checkConsensus(proposalId);
      if (result) {
        setLatestResult(result);
        // In a real app, we'd fetch the proposal details from the engine
        setProposal({
          id: proposalId,
          type: 'DEPLOY',
          payload: { target: 'Mainnet' },
          proposerId: 'Agent_Alpha',
          timestamp: Date.now()
        });
      }
    });

    return unsubscribe;
  }, []);

  if (!latestResult) return null;

  return (
    <div className="bg-black/40 backdrop-blur-md border border-blue-900/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-blue-900/30 pb-2">
        <Users className="w-4 h-4" />
        SWARM CONSENSUS
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-blue-500 mb-1">PROPOSAL</div>
          <div className="text-sm font-mono text-white">
            {proposal?.type} <span className="text-gray-500">by</span> {proposal?.proposerId}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-blue-500 mb-1">PARTICIPANTS</div>
          <div className="text-lg font-mono text-blue-300">
            {latestResult.participatingAgents}
          </div>
        </div>
      </div>

      <div className="relative pt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-green-400">APPROVAL</span>
          <span className="text-white font-mono">{((latestResult.approvalRate ?? 0) * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            animate={{ width: `${(latestResult.approvalRate ?? 0) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        {latestResult.approved ? (
          <div className="flex items-center gap-2 text-green-400 bg-green-900/20 px-3 py-1 rounded-full border border-green-500/30">
            <CheckCircle className="w-4 h-4" />
            <span>CONSENSUS REACHED</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-500/30">
            <Activity className="w-4 h-4 animate-spin" />
            <span>VOTING IN PROGRESS</span>
          </div>
        )}
      </div>
    </div>
  );
}
