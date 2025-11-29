'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ToricLattice } from '../core/topology/ToricLattice';
import { MapperAlgo } from '../core/topology/MapperAlgo';
import { Agent } from '@/types';
import { Activity, Shield, Zap, Grid, Network } from 'lucide-react';

export default function NeuralWorkspace() {
  const [lattice, setLattice] = useState<any[][]>([]);
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ stability: 100, coherence: 100 });
  
  const latticeRef = useRef(new ToricLattice(8, 8));
  const mapperRef = useRef(new MapperAlgo(10, 0.3, 0.5));

  useEffect(() => {
    // Initialize Lattice with dummy agents
    const initLattice = () => {
      const l = latticeRef.current;
      for (let i = 0; i < 5; i++) {
        l.addAgent({ id: `a_${i}`, name: `Agent ${i}`, role: 'worker', status: 'active', capabilities: [] }, i, i);
      }
      setLattice(l.getLatticeState());
    };
    initLattice();

    // Simulation Loop
    const interval = setInterval(() => {
      // 1. Simulate Thought Vectors (Random Walk)
      const thoughtData = Array.from({ length: 20 }, (_, i) => ({
        id: `t_${i}`,
        vector: [Math.random(), Math.random(), Math.random()], // 3D thought vector
        metadata: { timestamp: Date.now() }
      }));

      // 2. Run Mapper Algorithm
      const { nodes, edges } = mapperRef.current.run(thoughtData);
      setGraphNodes(nodes);
      setGraphEdges(edges);

      // 3. Update Metrics (Mock)
      setMetrics(prev => ({
        stability: Math.max(0, Math.min(100, prev.stability + (Math.random() - 0.5) * 5)),
        coherence: nodes.length > 0 ? 100 - (nodes.length * 2) : 100 // More clusters = less coherence (fragmented logic)
      }));

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black/90 backdrop-blur-xl border border-cyan-900/30 rounded-xl p-6 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/50 rounded-lg border border-cyan-500/30">
            <Network className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-100">Neural Workspace</h2>
            <p className="text-xs text-cyan-600 font-mono">Topological Analysis Active</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-green-400">
            <Shield className="w-4 h-4" />
            <span>STABILITY: {metrics.stability.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <Zap className="w-4 h-4" />
            <span>COHERENCE: {metrics.coherence.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left: Toric Lattice Visualization */}
        <div className="bg-black/50 border border-cyan-900/30 rounded-lg p-4 flex flex-col">
          <h3 className="text-sm font-bold text-cyan-500 mb-4 flex items-center gap-2">
            <Grid className="w-4 h-4" /> SWARM LATTICE (Toric Topology)
          </h3>
          <div className="flex-1 grid grid-cols-8 gap-1 auto-rows-fr">
            {lattice.map((row, y) => (
              row.map((cell, x) => (
                <motion.div
                  key={`${x}-${y}`}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1, 
                    backgroundColor: cell.agentId ? 'rgba(6,182,212,0.6)' : 'rgba(6,182,212,0.05)',
                    scale: cell.agentId ? 1 : 0.9
                  }}
                  className="rounded-sm border border-cyan-900/20 relative group"
                >
                  {cell.agentId && (
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-black">
                      AG
                    </div>
                  )}
                </motion.div>
              ))
            ))}
          </div>
        </div>

        {/* Right: Mapper Graph Visualization */}
        <div className="bg-black/50 border border-cyan-900/30 rounded-lg p-4 flex flex-col relative overflow-hidden">
          <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> LOGIC TOPOLOGY (Mapper Algo)
          </h3>
          
          <div className="flex-1 relative">
            {/* Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
               {graphEdges.map((edge, i) => {
                 // Mock positions for visualization simplicity
                 // In a real app, use D3 or Vis.js for layout
                 const x1 = Math.random() * 100 + '%'; 
                 const y1 = Math.random() * 100 + '%';
                 const x2 = Math.random() * 100 + '%';
                 const y2 = Math.random() * 100 + '%';
                 return (
                   <line 
                    key={i} 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke="rgba(168, 85, 247, 0.4)" 
                    strokeWidth={edge.weight} 
                   />
                 );
               })}
            </svg>

            {/* Nodes */}
            <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-4 p-4">
              {graphNodes.map((node) => (
                <motion.div
                  key={node.id}
                  layoutId={node.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 rounded-full bg-purple-600/50 border border-purple-400 flex items-center justify-center text-[10px] text-white font-mono shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                >
                  {node.size}
                </motion.div>
              ))}
              {graphNodes.length === 0 && (
                <div className="text-gray-600 text-xs animate-pulse">
                  Analyzing thought vectors...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
