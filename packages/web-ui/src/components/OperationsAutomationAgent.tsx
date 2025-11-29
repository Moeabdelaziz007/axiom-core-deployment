'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Server, Layers, CheckCircle, Clock, Pause, Activity } from 'lucide-react';
import { swarmEngine } from '../core/topology/SwarmConsensusEngine';
import { transactionExecutor } from '../services/TransactionExecutor';
import ApprovalModal from './ApprovalModal';
import { messageBus } from '../core/communication/AgentMessageBus';

export default function OperationsAutomationAgent() {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'System Health Check', status: 'COMPLETED', time: '10:00 AM' },
    { id: 2, name: 'Log Rotation', status: 'PENDING', time: '12:00 PM' },
    { id: 3, name: 'Cache Invalidation', status: 'RUNNING', time: 'NOW' },
  ]);
  
  const [showApproval, setShowApproval] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  useEffect(() => {
    // Listen for Consensus
    const unsubscribe = swarmEngine.subscribe((proposalId) => {
      const result = swarmEngine.checkConsensus(proposalId);
      if (result && result.approved) {
        // Fetch proposal details (mocked retrieval - in real app query engine)
        // We assume the last proposal is the one we approved
        const action = { 
          type: 'BUY', 
          payload: { asset: 'SOL', amount: 1000 }, 
          id: proposalId,
          details: 'Market Analyst detected Hyper-Bullish signal. Swarm Consensus reached.'
        };
        
        setPendingAction(action);
        setShowApproval(true);
      }
    });
    return unsubscribe;
  }, []);

  const handleApprove = async () => {
    setShowApproval(false);
    if (pendingAction) {
      messageBus.publish({
        senderId: 'Ops_Agent_01',
        channel: 'OPS',
        content: `⚙️ Executing Approved Action: ${pendingAction.type} ${pendingAction.payload.amount} ${pendingAction.payload.asset}`,
        priority: 'MEDIUM'
      });

      const result = await transactionExecutor.executeMockTransaction(
        pendingAction.type, 
        pendingAction.payload.amount, 
        'Devnet'
      );

      if (result.status === 'SUCCESS') {
        messageBus.publish({
          senderId: 'Ops_Agent_01',
          channel: 'OPS',
          content: `✅ Execution Successful! Sig: ${result.signature}`,
          priority: 'HIGH'
        });
        
        // Add to task list
        setTasks(prev => [{
          id: Date.now(),
          name: `EXECUTE ${pendingAction.type}`,
          status: 'COMPLETED',
          time: 'NOW'
        }, ...prev]);
      } else {
         messageBus.publish({
          senderId: 'Ops_Agent_01',
          channel: 'OPS',
          content: `❌ Execution Failed: ${result.error}`,
          priority: 'CRITICAL'
        });
      }
      setPendingAction(null);
    }
  };

  const handleReject = () => {
    setShowApproval(false);
    messageBus.publish({
      senderId: 'Ops_Agent_01',
      channel: 'OPS',
      content: `🚫 Action Rejected by Human Operator.`,
      priority: 'HIGH'
    });
    setPendingAction(null);
  };

  return (
    <>
      <div className="bg-black/40 backdrop-blur-md border border-blue-900/30 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-blue-900/30 pb-2">
          <Cpu className="w-4 h-4" />
          OPERATIONS AUTOMATION
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
              <div className="flex items-center gap-2">
                {task.status === 'COMPLETED' ? <CheckCircle className="w-3 h-3 text-green-500" /> :
                 task.status === 'RUNNING' ? <Activity className="w-3 h-3 text-blue-500 animate-spin" /> :
                 <Clock className="w-3 h-3 text-gray-500" />}
                <span className="text-sm text-gray-300">{task.name}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{task.time}</span>
            </div>
          ))}
        </div>
      </div>

      <ApprovalModal 
        isOpen={showApproval}
        actionType={pendingAction?.type || 'UNKNOWN'}
        details={pendingAction?.details || 'No details provided.'}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}
