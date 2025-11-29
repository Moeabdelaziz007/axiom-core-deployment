'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Cpu, Layers, CheckCircle, Clock, AlertCircle, Play, Pause } from 'lucide-react';

const MOCK_TASKS = [
  { id: 'TASK-101', name: 'Rebalance Liquidity Pools', status: 'RUNNING', progress: 45, priority: 'HIGH' },
  { id: 'TASK-102', name: 'Update Oracle Feeds', status: 'PENDING', progress: 0, priority: 'CRITICAL' },
  { id: 'TASK-103', name: 'Generate Daily Reports', status: 'COMPLETED', progress: 100, priority: 'LOW' },
  { id: 'TASK-104', name: 'Optimize Yield Strategy', status: 'RUNNING', progress: 78, priority: 'MEDIUM' },
];

export default function OperationsAutomationAgent() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [systemLoad, setSystemLoad] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.min(100, Math.max(20, prev + (Math.random() * 10 - 5))));
      setTasks(prev => prev.map(task => {
        if (task.status === 'RUNNING') {
          const newProgress = Math.min(100, task.progress + Math.random() * 5);
          return { ...task, progress: newProgress, status: newProgress >= 100 ? 'COMPLETED' : 'RUNNING' };
        }
        return task;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black/40 backdrop-blur-md border border-cyan-900/30 rounded-xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-900/20 border border-purple-500/30 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-100">OPERATIONS AGENT</h2>
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <Server className="w-3 h-3" />
              SYSTEM OPTIMAL
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-purple-800 font-mono">AGENT ID</div>
          <div className="text-sm font-bold text-purple-500">OPS-9000</div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/60 border border-white/5 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">CPU LOAD</div>
          <div className="text-xl font-mono text-purple-400">{systemLoad.toFixed(1)}%</div>
          <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-500" 
              animate={{ width: `${systemLoad}%` }}
            />
          </div>
        </div>
        <div className="bg-black/60 border border-white/5 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">ACTIVE TASKS</div>
          <div className="text-xl font-mono text-cyan-400">
            {tasks.filter(t => t.status === 'RUNNING').length}
          </div>
        </div>
        <div className="bg-black/60 border border-white/5 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">UPTIME</div>
          <div className="text-xl font-mono text-green-400">99.99%</div>
        </div>
      </div>

      {/* Task Queue */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          TASK QUEUE
        </h3>
        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                className="bg-black/40 border border-white/5 rounded-lg p-3 flex items-center justify-between group hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'RUNNING' ? 'bg-yellow-400 animate-pulse' :
                    task.status === 'COMPLETED' ? 'bg-green-400' : 'bg-gray-600'
                  }`} />
                  <div>
                    <div className="text-sm font-bold text-gray-200">{task.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{task.id} • {task.priority}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {task.status === 'RUNNING' && (
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-purple-500" 
                        animate={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : task.status === 'RUNNING' ? (
                    <Clock className="w-4 h-4 text-yellow-500 animate-spin-slow" />
                  ) : (
                    <Pause className="w-4 h-4 text-gray-600" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
