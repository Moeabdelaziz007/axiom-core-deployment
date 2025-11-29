'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'; // Commented out to avoid build errors if types are missing, can be re-enabled later

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

  // --- 1. Simulate Swarm Topology Data (Mocking Toric Lattice) ---
  useEffect(() => {
    // Generates a mock topological structure
    const N = 20;
    const nodes: SwarmNode[] = [...Array(N).keys()].map(i => ({
      id: `Agent-${i}`,
      group: Math.random() > 0.9 ? 2 : 1, // 10% chance of being a "Hallucination" (Red)
      val: Math.random() * 5 + 1
    }));
    
    // Connect nodes to form a lattice-like structure
    const links: SwarmLink[] = [];
    nodes.forEach((node, idx) => {
      if (idx > 0) links.push({ source: node.id, target: nodes[idx - 1].id });
      if (Math.random() > 0.5) links.push({ source: node.id, target: nodes[Math.floor(Math.random() * N)].id });
    });

    setGraphData({ nodes, links });
  }, []);

  return (
    <div className="relative w-full h-[400px] border border-cyan-900/50 rounded-xl overflow-hidden bg-black">
      
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-cyan-400 font-mono text-sm tracking-widest bg-black/50 px-2 py-1 rounded border border-cyan-900">
          🔮 SWARM TOPOLOGY // LIVE
        </h3>
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
        linkColor={() => "#083344"} // Dark Cyan
        linkWidth={1}
        linkDirectionalParticles={2} // Particles moving along lines = Data Flow
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => "#22d3ee"}

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
