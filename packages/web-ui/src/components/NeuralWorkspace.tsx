'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- Types (Mocking the Core Logic for UI) ---
interface AgentNode {
  id: string;
  status: 'IDLE' | 'THINKING' | 'ERROR' | 'STABLE';
  vector: number[]; // Simulation of thought vector
}

interface MapperNode {
  id: string;
  x: number;
  y: number;
  connections: string[];
  isHallucination: boolean;
}

export default function NeuralWorkspace() {
  const [activeTab, setActiveTab] = useState<'LATTICE' | 'TOPOLOGY' | 'HOLOGRAM'>('TOPOLOGY');
  const [agents, setAgents] = useState<AgentNode[]>([]);
  const [mapperGraph, setMapperGraph] = useState<MapperNode[]>([]);
  
  // --- Simulation Loop (The "Heartbeat") ---
  useEffect(() => {
    // 1. Initialize Mock Swarm (e.g., 16 Agents in a 4x4 Grid)
    const initialAgents = Array.from({ length: 16 }).map((_, i) => ({
      id: `agent-${i}`,
      status: 'IDLE',
      vector: [Math.random(), Math.random()]
    } as AgentNode));
    setAgents(initialAgents);

    const interval = setInterval(() => {
      // Simulate "Thinking" and State Changes
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'THINKING' : 'STABLE') : (Math.random() > 0.95 ? 'ERROR' : agent.status),
        vector: [Math.random(), Math.random()] // Thoughts changing
      })));

      // Simulate Mapper Graph Updates (Topology of thoughts)
      // Generates 5-10 nodes, some connected, some isolated (hallucinations)
      const nodeCount = 5 + Math.floor(Math.random() * 5);
      const newNodes: MapperNode[] = [];
      for (let i = 0; i < nodeCount; i++) {
        newNodes.push({
          id: `node-${i}`,
          x: Math.random() * 300,
          y: Math.random() * 200,
          connections: i > 0 && Math.random() > 0.3 ? [`node-${i-1}`] : [],
          isHallucination: Math.random() > 0.9 // 10% chance of loose thought
        });
      }
      setMapperGraph(newNodes);

    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black/90 border border-cyan-900/50 rounded-xl p-4 overflow-hidden relative font-mono">
      {/* Header & Tabs */}
      <div className="flex justify-between items-center mb-4 border-b border-cyan-900/30 pb-2">
        <h2 className="text-cyan-400 text-lg flex items-center gap-2">
          <span className="animate-pulse">🧠</span> NEURAL WORKSPACE
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('TOPOLOGY')}
            className={`px-3 py-1 text-xs rounded ${activeTab === 'TOPOLOGY' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            LOGIC TOPOLOGY
            </button>
            <button
              onClick={() => setActiveTab('HOLOGRAM')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'HOLOGRAM' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-cyan-400'}`}
            >
              SWARM HOLOGRAM
          </button>
          <button 
            onClick={() => setActiveTab('LATTICE')}
            className={`px-3 py-1 text-xs rounded ${activeTab === 'LATTICE' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            TORIC LATTICE
          </button>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="relative h-[300px] w-full bg-gray-900/50 rounded-lg flex items-center justify-center p-4">
        
        {/* VIEW 1: MAPPER ALGO GRAPH (Topology) */}
        {activeTab === 'TOPOLOGY' && (
          <div className="relative w-full h-full">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {mapperGraph.map((node) => 
                node.connections.map(targetId => {
                  const target = mapperGraph.find(n => n.id === targetId);
                  if (!target) return null;
                  return (
                    <line 
                      key={`${node.id}-${targetId}`} 
                      x1={node.x + 20} y1={node.y + 20} 
                      x2={target.x + 20} y2={target.y + 20} 
                      stroke="#06b6d4" 
                      strokeWidth="1" 
                      opacity="0.5"
                    />
                  );
                })
              )}
            </svg>
            {mapperGraph.map((node) => (
              <motion.div
                key={node.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1, x: node.x, y: node.y }}
                className={`absolute w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] 
                  ${node.isHallucination ? 'bg-red-500 text-red-500' : 'bg-cyan-400 text-cyan-400'}`}
              >
                {node.isHallucination && (
                   <span className="absolute -top-4 -left-2 text-[8px] bg-red-900/80 px-1 rounded text-white">HALLUCINATION</span>
                )}
              </motion.div>
            ))}
             <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              Algo: Mapper (L2-Norm) | Betti-1: {mapperGraph.filter(n => n.isHallucination).length}
            </div>
          </div>
        )}

        {/* VIEW 2: TORIC LATTICE (Swarm Grid) */}
        {activeTab === 'LATTICE' && (
          <div className="grid grid-cols-4 gap-4 w-full max-w-[400px]">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className={`h-12 w-12 rounded border flex items-center justify-center text-[10px] transition-all duration-500
                  ${agent.status === 'ERROR' ? 'border-red-500 bg-red-900/20 text-red-400' : 
                    agent.status === 'THINKING' ? 'border-yellow-400 bg-yellow-900/20 text-yellow-400 animate-pulse' : 
                    'border-green-500 bg-green-900/20 text-green-400'}
                `}
              >
                {agent.status === 'ERROR' ? '⚠️' : 'AI'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
