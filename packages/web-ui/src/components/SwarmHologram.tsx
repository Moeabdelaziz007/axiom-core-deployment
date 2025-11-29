'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import ForceGraph3D dynamically (SSR safe)
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

interface SwarmNode {
  id: string;
  group: number; // 1: Agent, 2: Hallucination, 3: Core
  val: number;   // Size
}

interface SwarmLink {
  source: string;
  target: string;
}

export default function SwarmHologram() {
  const fgRef = useRef<any>();
  const [graphData, setGraphData] = useState<{ nodes: SwarmNode[], links: SwarmLink[] }>({ nodes: [], links: [] });
  const [systemHealth, setSystemHealth] = useState<number>(100); // 0-100, where 100 is healthy
  const [swarmSize, setSwarmSize] = useState<number>(20); // Number of agents (Stress Test)

  // --- 1. Simulate Swarm Topology Data (Mocking Toric Lattice) ---
  useEffect(() => {
    // Generates a mock topological structure
    const N = swarmSize;
    const nodes: SwarmNode[] = [...Array(N).keys()].map(i => ({
      id: `Agent-${i}`,
      group: Math.random() > 0.9 ? 2 : 1, // 10% chance of being a "Hallucination" (Red)
      val: Math.random() * 5 + 1
    }));
    
    // Connect nodes to form a lattice-like structure
    const links: SwarmLink[] = [];
    nodes.forEach((node, idx) => {
      if (idx > 0) links.push({ source: node.id, target: nodes[idx - 1].id });
      if (Math.random() > 0.5 && N > 10) {
        const target = Math.floor(Math.random() * N);
        if (target !== idx) links.push({ source: node.id, target: nodes[target].id });
      }
    });

    setGraphData({ nodes, links });
  }, [swarmSize]);

  // --- 2. Inject Volumetric Fog (System Health Visualizer) ---
  useEffect(() => {
    if (fgRef.current) {
      // Dynamic Background Color to simulate atmosphere: Cyan (Healthy) -> Red (Critical)
      const bgColor = systemHealth > 80 ? "#000000" : (systemHealth > 40 ? "#1a1000" : "#1a0000");
      fgRef.current.backgroundColor(bgColor);
    }
  }, [systemHealth]);

  return (
    <div className="relative w-full h-[400px] border border-cyan-900/50 rounded-xl overflow-hidden bg-black">
      
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
        <h3 className="text-cyan-400 font-mono text-sm tracking-widest bg-black/50 px-2 py-1 rounded border border-cyan-900 w-fit">
          🔮 SWARM TOPOLOGY // LIVE
        </h3>
        
        {/* System Health Control */}
        <div className="flex items-center gap-2 pointer-events-auto bg-black/50 px-2 py-1 rounded border border-cyan-900/50">
           <span className={`text-xs font-bold ${systemHealth > 80 ? 'text-cyan-400' : (systemHealth > 40 ? 'text-yellow-400' : 'text-red-500')}`}>
             HEALTH: {systemHealth}%
           </span>
           <input 
             type="range" 
             min="0" 
             max="100" 
             value={systemHealth} 
             onChange={(e) => setSystemHealth(parseInt(e.target.value))}
             className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
           />
        </div>

        {/* Swarm Size Control (Stress Test) */}
        <div className="flex items-center gap-2 pointer-events-auto bg-black/50 px-2 py-1 rounded border border-purple-900/50">
           <span className="text-xs font-bold text-purple-400">
             AGENTS: {swarmSize}
           </span>
           <input 
             type="range" 
             min="20" 
             max="500" 
             step="20"
             value={swarmSize} 
             onChange={(e) => setSwarmSize(parseInt(e.target.value))}
             className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
           />
        </div>
      </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#000000"
        
        // --- Nodes (Agents) ---
        nodeLabel="id"
        nodeColor={(node: any) => node.group === 2 ? "#ff0000" : "#06b6d4"} // Red for errors, Cyan for agents
        nodeRelSize={6}
        nodeResolution={16}
        nodeOpacity={0.9}
        
        // --- Links (Consensus Lines) ---
        linkColor={() => systemHealth > 80 ? "#083344" : (systemHealth > 40 ? "#451a03" : "#450a0a")} // Adapts to health
        linkWidth={1}
        linkDirectionalParticles={swarmSize < 100 ? 2 : 0} // Disable particles for large swarms (performance)
        linkDirectionalParticleSpeed={0.005 * (systemHealth / 100)} // Slows down when system is critical
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => systemHealth > 80 ? "#22d3ee" : "#fca5a5"}

        // --- Camera & Effects ---
        showNavInfo={false}
        enableNodeDrag={false}
        onEngineStop={() => fgRef.current && fgRef.current.zoomToFit(400)}
      />
      
      {/* Decorative Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] bg-[length:100%_2px,3px_100%] opacity-20"></div>
    </div>
  );
}
