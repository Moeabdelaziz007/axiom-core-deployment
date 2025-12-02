'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GhostCursor, Point, PathData } from '../lib/ghost-cursor';

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
  const [activeTab, setActiveTab] = useState<'LATTICE' | 'TOPOLOGY' | 'HOLOGRAM' | 'GHOST_CURSOR'>('TOPOLOGY');
  const [agents, setAgents] = useState<AgentNode[]>([]);
  const [mapperGraph, setMapperGraph] = useState<MapperNode[]>([]);
  
  // Ghost Cursor state
  const [ghostCursor] = useState(() => new GhostCursor());
  const [currentPath, setCurrentPath] = useState<PathData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Ghost Cursor functions
  const generateRandomPath = useCallback(() => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const start: Point = {
      x: Math.random() * (rect.width - 40) + 20,
      y: Math.random() * (rect.height - 40) + 20
    };
    const end: Point = {
      x: Math.random() * (rect.width - 40) + 20,
      y: Math.random() * (rect.height - 40) + 20
    };
    
    const path = ghostCursor.generatePath(start, end);
    setCurrentPath(path);
    setIsAnimating(true);
  }, [ghostCursor]);
  
  const handleSvgClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || isAnimating) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const clickPoint: Point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    // Generate path from current cursor position or random start to click point
    const start: Point = cursorPosition || {
      x: Math.random() * (rect.width - 40) + 20,
      y: Math.random() * (rect.height - 40) + 20
    };
    
    const path = ghostCursor.generatePath(start, clickPoint);
    setCurrentPath(path);
    setIsAnimating(true);
  }, [ghostCursor, isAnimating, cursorPosition]);
  
  // Auto-generate paths on timer
  useEffect(() => {
    if (!autoGenerate || activeTab !== 'GHOST_CURSOR') return;
    
    const interval = setInterval(() => {
      generateRandomPath();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoGenerate, activeTab, generateRandomPath]);
  
  // Animate cursor along path
  useEffect(() => {
    if (!currentPath || !isAnimating) return;
    
    let currentIndex = 0;
    const animationInterval = setInterval(() => {
      if (currentIndex >= currentPath.points.length) {
        setIsAnimating(false);
        clearInterval(animationInterval);
        return;
      }
      
      setCursorPosition(currentPath.points[currentIndex]);
      currentIndex++;
    }, currentPath.duration / currentPath.points.length);
    
    return () => clearInterval(animationInterval);
  }, [currentPath, isAnimating]);
  
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
          <button
            onClick={() => setActiveTab('GHOST_CURSOR')}
            className={`px-3 py-1 text-xs rounded ${activeTab === 'GHOST_CURSOR' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            GHOST CURSOR
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

        {/* VIEW 3: GHOST CURSOR */}
        {activeTab === 'GHOST_CURSOR' && (
          <div className="relative w-full h-full">
            <div className="absolute top-2 left-2 z-10 flex gap-2">
              <button
                onClick={generateRandomPath}
                disabled={isAnimating}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
              >
                Generate Path
              </button>
              <button
                onClick={() => setAutoGenerate(!autoGenerate)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  autoGenerate
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {autoGenerate ? 'Stop Auto' : 'Start Auto'}
              </button>
            </div>
            
            <div className="absolute bottom-2 left-2 text-xs text-cyan-400 z-10">
              {currentPath && (
                <div>
                  Distance: {Math.round(currentPath.distance)}px |
                  Duration: {Math.round(currentPath.duration)}ms |
                  {currentPath.hasOvershoot && <span className="text-yellow-400"> Overshoot</span>}
                </div>
              )}
            </div>
            
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onClick={handleSvgClick}
            >
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Path visualization */}
              {currentPath && (
                <g>
                  {/* Main path line */}
                  <path
                    d={`M ${currentPath.points[0].x} ${currentPath.points[0].y} ${currentPath.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.6)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Velocity gradient overlay */}
                  <defs>
                    <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(6, 182, 212, 0.2)" />
                      <stop offset="50%" stopColor="rgba(6, 182, 212, 0.8)" />
                      <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${currentPath.points[0].x} ${currentPath.points[0].y} ${currentPath.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                    fill="none"
                    stroke="url(#velocityGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />
                  
                  {/* Start point */}
                  <circle
                    cx={currentPath.points[0].x}
                    cy={currentPath.points[0].y}
                    r="8"
                    fill="rgba(34, 197, 94, 0.8)"
                    stroke="rgba(34, 197, 94, 1)"
                    strokeWidth="2"
                  />
                  <text
                    x={currentPath.points[0].x}
                    y={currentPath.points[0].y - 12}
                    fill="rgba(34, 197, 94, 1)"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    START
                  </text>
                  
                  {/* End point */}
                  {(() => {
                    const lastPoint = currentPath.points[currentPath.points.length - 1];
                    return (
                      <>
                        <circle
                          cx={lastPoint.x}
                          cy={lastPoint.y}
                          r="8"
                          fill="rgba(239, 68, 68, 0.8)"
                          stroke="rgba(239, 68, 68, 1)"
                          strokeWidth="2"
                        />
                        <text
                          x={lastPoint.x}
                          y={lastPoint.y - 12}
                          fill="rgba(239, 68, 68, 1)"
                          fontSize="10"
                          textAnchor="middle"
                          className="font-mono"
                        >
                          END
                        </text>
                      </>
                    );
                  })()}
                  
                  {/* Overshoot indicator */}
                  {currentPath.hasOvershoot && (
                    <g>
                      <circle
                        cx={currentPath.points[Math.floor(currentPath.points.length * 0.8)].x}
                        cy={currentPath.points[Math.floor(currentPath.points.length * 0.8)].y}
                        r="6"
                        fill="rgba(251, 191, 36, 0.6)"
                        stroke="rgba(251, 191, 36, 1)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      <text
                        x={currentPath.points[Math.floor(currentPath.points.length * 0.8)].x}
                        y={currentPath.points[Math.floor(currentPath.points.length * 0.8)].y - 10}
                        fill="rgba(251, 191, 36, 1)"
                        fontSize="8"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        OVERSHOOT
                      </text>
                    </g>
                  )}
                </g>
              )}
              
              {/* Animated cursor */}
              <AnimatePresence>
                {cursorPosition && (
                  <g>
                    <circle
                      cx={cursorPosition.x}
                      cy={cursorPosition.y}
                      r="4"
                      fill="rgba(6, 182, 212, 1)"
                      className="animate-pulse"
                    />
                    <circle
                      cx={cursorPosition.x}
                      cy={cursorPosition.y}
                      r="8"
                      fill="none"
                      stroke="rgba(6, 182, 212, 0.5)"
                      strokeWidth="1"
                    />
                  </g>
                )}
              </AnimatePresence>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
