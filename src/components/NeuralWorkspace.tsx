/**
 * 🧠 NEURAL WORKSPACE - Dynamic Agent Swarm Visualization
 * 
 * Real-time visualization of agent thinking states with SSE integration
 * Dynamic grid layout representing the "Agent Swarm" with LangGraph events
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Activity,
  Zap,
  Connection,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Grid3X3
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface LangGraphEvent {
  type: 'AGENT_THINKING' | 'AGENT_COMPLETED' | 'AGENT_ERROR' | 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED' | 'CONNECTION_ESTABLISHED';
  agentId?: string;
  agentType?: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  timestamp: number;
  data: {
    thought?: string;
    progress?: number;
    result?: any;
    error?: string;
    metadata?: Record<string, any>;
    message?: string;
    agents?: string[];
    agentConfig?: Record<string, any>;
  };
}

interface NeuralAgent {
  id: string;
  type: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  name: string;
  color: string;
  icon: string;
  description: string;
  status: 'idle' | 'thinking' | 'completed' | 'error';
  progress: number;
  thought?: string;
  gridPosition: { x: number; y: number };
  connections: string[];
  lastActivity: number;
  metadata?: Record<string, any>;
}

interface Connection {
  id: string;
  source: string;
  target: string;
  strength: number;
  active: boolean;
  type: 'collaboration' | 'data_flow' | 'dependency';
}

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

const AGENT_CONFIG = {
  dreamer: {
    name: 'Dreamer',
    color: '#8B5CF6', // Purple
    icon: '🌟',
    description: 'Creative ideation and vision planning'
  },
  analyst: {
    name: 'Analyst',
    color: '#06B6D4', // Cyan
    icon: '📊',
    description: 'Data analysis and pattern recognition'
  },
  judge: {
    name: 'Judge',
    color: '#EF4444', // Red
    icon: '⚖️',
    description: 'Decision making and conflict resolution'
  },
  builder: {
    name: 'Builder',
    color: '#F97316', // Orange
    icon: '🔨',
    description: 'System architecture and implementation'
  },
  tajer: {
    name: 'Tajer',
    color: '#8B5CF6',
    icon: '🤝',
    description: 'Business negotiation and deal analysis'
  },
  aqar: {
    name: 'Aqar',
    color: '#06B6D4',
    icon: '🏢',
    description: 'Property valuation and market analysis'
  },
  mawid: {
    name: 'Mawid',
    color: '#10B981',
    icon: '📅',
    description: 'Appointment scheduling and resource optimization'
  },
  sofra: {
    name: 'Sofra',
    color: '#F59E0B',
    icon: '🍽',
    description: 'Customer experience and quality audit'
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NeuralWorkspace: React.FC = () => {
  const [agents, setAgents] = useState<NeuralAgent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 4, cols: 4 });
  const [events, setEvents] = useState<LangGraphEvent[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize agents in grid layout
  useEffect(() => {
    const initialAgents: NeuralAgent[] = [
      {
        id: 'dreamer-1',
        type: 'dreamer',
        name: AGENT_CONFIG.dreamer.name,
        color: AGENT_CONFIG.dreamer.color,
        icon: AGENT_CONFIG.dreamer.icon,
        description: AGENT_CONFIG.dreamer.description,
        status: 'idle',
        progress: 0,
        gridPosition: { x: 1, y: 1 },
        connections: ['analyst-1', 'judge-1'],
        lastActivity: Date.now()
      },
      {
        id: 'analyst-1',
        type: 'analyst',
        name: AGENT_CONFIG.analyst.name,
        color: AGENT_CONFIG.analyst.color,
        icon: AGENT_CONFIG.analyst.icon,
        description: AGENT_CONFIG.analyst.description,
        status: 'idle',
        progress: 0,
        gridPosition: { x: 2, y: 1 },
        connections: ['dreamer-1', 'builder-1'],
        lastActivity: Date.now()
      },
      {
        id: 'judge-1',
        type: 'judge',
        name: AGENT_CONFIG.judge.name,
        color: AGENT_CONFIG.judge.color,
        icon: AGENT_CONFIG.judge.icon,
        description: AGENT_CONFIG.judge.description,
        status: 'idle',
        progress: 0,
        gridPosition: { x: 3, y: 1 },
        connections: ['dreamer-1', 'builder-1'],
        lastActivity: Date.now()
      },
      {
        id: 'builder-1',
        type: 'builder',
        name: AGENT_CONFIG.builder.name,
        color: AGENT_CONFIG.builder.color,
        icon: AGENT_CONFIG.builder.icon,
        description: AGENT_CONFIG.builder.description,
        status: 'idle',
        progress: 0,
        gridPosition: { x: 2, y: 2 },
        connections: ['analyst-1', 'judge-1'],
        lastActivity: Date.now()
      }
    ];

    setAgents(initialAgents);

    // Create connections
    const initialConnections: Connection[] = [
      { id: 'conn-1', source: 'dreamer-1', target: 'analyst-1', strength: 85, active: false, type: 'collaboration' },
      { id: 'conn-2', source: 'dreamer-1', target: 'judge-1', strength: 75, active: false, type: 'collaboration' },
      { id: 'conn-3', source: 'analyst-1', target: 'builder-1', strength: 90, active: false, type: 'data_flow' },
      { id: 'conn-4', source: 'judge-1', target: 'builder-1', strength: 80, active: false, type: 'dependency' }
    ];

    setConnections(initialConnections);
  }, []);

  // SSE connection for real-time updates
  useEffect(() => {
    if (isPaused) return;

    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/dream');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          console.log('🧠 Connected to Neural Workspace SSE');
        };

        eventSource.onmessage = (event) => {
          try {
            const data: LangGraphEvent = JSON.parse(event.data);
            handleSSEEvent(data);
          } catch (error) {
            console.error('Error parsing SSE event:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectSSE, 3000);
        };

        eventSource.onclose = () => {
          setIsConnected(false);
          console.log('🧠 SSE Connection closed');
        };

      } catch (error) {
        console.error('Failed to connect to SSE:', error);
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isPaused]);

  // Handle SSE events
  const handleSSEEvent = useCallback((event: LangGraphEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events

    switch (event.type) {
      case 'AGENT_THINKING':
        if (event.agentId && event.agentType) {
          updateAgentStatus(event.agentId, 'thinking', event.data.thought, event.data.progress);
        }
        break;
      
      case 'AGENT_COMPLETED':
        if (event.agentId && event.agentType) {
          updateAgentStatus(event.agentId, 'completed', undefined, 100);
        }
        break;
      
      case 'AGENT_ERROR':
        if (event.agentId && event.agentType) {
          updateAgentStatus(event.agentId, 'error', event.data.error, 0);
        }
        break;
      
      case 'WORKFLOW_STARTED':
        // Activate connections for workflow
        activateConnections();
        break;
      
      case 'WORKFLOW_COMPLETED':
        // Deactivate connections
        deactivateConnections();
        break;
      
      case 'CONNECTION_ESTABLISHED':
        console.log('🧠 Neural Workspace connection established');
        break;
    }
  }, []);

  // Update agent status
  const updateAgentStatus = (agentId: string, status: NeuralAgent['status'], thought?: string, progress?: number) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            status, 
            thought, 
            progress: progress || agent.progress,
            lastActivity: Date.now()
          }
        : agent
    ));
  };

  // Activate connections
  const activateConnections = () => {
    setConnections(prev => prev.map(conn => ({ ...conn, active: true })));
  };

  // Deactivate connections
  const deactivateConnections = () => {
    setConnections(prev => prev.map(conn => ({ ...conn, active: false })));
  };

  // Handle agent click
  const handleAgentClick = useCallback((agentId: string) => {
    setSelectedAgent(agentId === selectedAgent ? null : agentId);
  }, [selectedAgent]);

  // Trigger agent action
  const triggerAgentAction = async (agentId: string, action: string) => {
    try {
      const response = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action, parameters: {} })
      });

      if (response.ok) {
        console.log(`✅ Action ${action} triggered for ${agentId}`);
      }
    } catch (error) {
      console.error('Failed to trigger agent action:', error);
    }
  };

  // Get cell size based on grid
  const getCellSize = () => {
    if (!containerRef.current) return { width: 150, height: 150 };
    const { width, height } = containerRef.current.getBoundingClientRect();
    return {
      width: width / gridSize.cols,
      height: height / gridSize.rows
    };
  };

  // Get agent position in pixels
  const getAgentPosition = (agent: NeuralAgent) => {
    const cellSize = getCellSize();
    return {
      x: agent.gridPosition.x * cellSize.width + cellSize.width / 2,
      y: agent.gridPosition.y * cellSize.height + cellSize.height / 2
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent mb-2">
          🧠 Neural Workspace
        </h1>
        <p className="text-gray-400">Dynamic Agent Swarm with Real-time LangGraph Events</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center gap-4">
        {/* Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Control Buttons */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span className="text-sm">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <button
          onClick={() => {
            setEvents([]);
            agents.forEach(agent => updateAgentStatus(agent.id, 'idle', undefined, 0));
            deactivateConnections();
          }}
          className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>

        {/* Grid Size Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridSize({ rows: 3, cols: 3 })}
            className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setGridSize({ rows: 4, cols: 4 })}
            className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Neural Network Grid */}
        <div className="col-span-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden relative">
          <div
            ref={containerRef}
            className="w-full h-full relative"
            style={{ minHeight: '600px' }}
          >
            {/* Grid Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {Array.from({ length: gridSize.rows + 1 }).map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={`${(i * 100) / gridSize.rows}%`}
                  x2="100%"
                  y2={`${(i * 100) / gridSize.rows}%`}
                  stroke="#374151"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: gridSize.cols + 1 }).map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={`${(i * 100) / gridSize.cols}%`}
                  y1="0"
                  x2={`${(i * 100) / gridSize.cols}%`}
                  y2="100%"
                  stroke="#374151"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map(conn => {
                const sourceAgent = agents.find(a => a.id === conn.source);
                const targetAgent = agents.find(a => a.id === conn.target);
                
                if (!sourceAgent || !targetAgent) return null;

                const sourcePos = getAgentPosition(sourceAgent);
                const targetPos = getAgentPosition(targetAgent);

                return (
                  <g key={conn.id}>
                    <motion.line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={conn.active ? '#10B981' : '#4B5563'}
                      strokeWidth={conn.active ? 3 : 2}
                      strokeOpacity={conn.active ? 0.8 : 0.3}
                      strokeDasharray={conn.type === 'data_flow' ? '5,5' : '0'}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    {conn.active && (
                      <motion.circle
                        r="4"
                        fill="#10B981"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <animateMotion
                          dur="2s"
                          repeatCount="indefinite"
                          path={`M${sourcePos.x},${sourcePos.y} L${targetPos.x},${targetPos.y}`}
                        />
                      </motion.circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Agents */}
            {agents.map(agent => {
              const position = getAgentPosition(agent);
              const isSelected = selectedAgent === agent.id;

              return (
                <motion.div
                  key={agent.id}
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    left: position.x - 40,
                    top: position.y - 40,
                    width: 80,
                    height: 80
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAgentClick(agent.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Agent Circle */}
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center relative border-2"
                    style={{
                      backgroundColor: agent.color + '20',
                      borderColor: agent.color,
                      boxShadow: agent.status === 'thinking' ? `0 0 20px ${agent.color}` : 'none'
                    }}
                    animate={{
                      scale: agent.status === 'thinking' ? [1, 1.1, 1] : 1,
                      opacity: agent.status === 'error' ? [1, 0.5, 1] : 1
                    }}
                    transition={{
                      duration: agent.status === 'thinking' ? 2 : 1,
                      repeat: agent.status === 'thinking' ? Infinity : 0
                    }}
                  >
                    {/* Agent Icon */}
                    <span className="text-2xl">{agent.icon}</span>

                    {/* Status Indicator */}
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                        agent.status === 'thinking' ? 'bg-yellow-400' :
                        agent.status === 'completed' ? 'bg-green-400' :
                        agent.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                      }`}
                    />

                    {/* Progress Ring */}
                    {agent.status === 'thinking' && agent.progress > 0 && (
                      <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#374151"
                          strokeWidth="4"
                          fill="none"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={agent.color}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - agent.progress / 100)}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - agent.progress / 100) }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                    )}
                  </motion.div>

                  {/* Agent Name */}
                  <div className="text-xs text-center mt-1 font-medium">
                    {agent.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="col-span-4 space-y-4">
          {/* Selected Agent Details */}
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{agents.find(a => a.id === selectedAgent)?.icon}</span>
                {agents.find(a => a.id === selectedAgent)?.name}
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      agents.find(a => a.id === selectedAgent)?.status === 'thinking' ? 'bg-yellow-400' :
                      agents.find(a => a.id === selectedAgent)?.status === 'completed' ? 'bg-green-400' :
                      agents.find(a => a.id === selectedAgent)?.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm capitalize">
                      {agents.find(a => a.id === selectedAgent)?.status}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Type</div>
                  <div className="text-sm">
                    {agents.find(a => a.id === selectedAgent)?.description}
                  </div>
                </div>

                {agents.find(a => a.id === selectedAgent)?.thought && (
                  <div>
                    <div className="text-sm text-gray-400">Current Thought</div>
                    <div className="text-sm text-gray-200 italic">
                      "{agents.find(a => a.id === selectedAgent)?.thought}"
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-400">Progress</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: agents.find(a => a.id === selectedAgent)?.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${agents.find(a => a.id === selectedAgent)?.progress || 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => triggerAgentAction(selectedAgent, 'start')}
                    className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    Start Task
                  </button>
                  <button
                    onClick={() => triggerAgentAction(selectedAgent, 'analyze')}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    Analyze Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Recent Events
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {events.slice(0, 10).map((event, index) => (
                  <motion.div
                    key={`${event.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-gray-900/50 rounded-lg p-3 border border-gray-700"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        event.agentType === 'dreamer' ? 'bg-purple-600' :
                        event.agentType === 'analyst' ? 'bg-cyan-600' :
                        event.agentType === 'judge' ? 'bg-red-600' :
                        event.agentType === 'builder' ? 'bg-orange-600' : 'bg-gray-600'
                      }`}>
                        {event.agentType ? event.agentType.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400">
                            {event.agentType || 'System'}
                          </span>
                          <span className={`ml-auto px-2 py-1 rounded text-xs ${
                            event.type === 'AGENT_THINKING' ? 'bg-yellow-500/20 text-yellow-400' :
                            event.type === 'AGENT_COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            event.type === 'AGENT_ERROR' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-200">
                          {event.data.thought || event.data.message || event.data.error || 'Event occurred'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Actions
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => triggerAgentAction('dreamer-1', 'brainstorm')}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                🌟 Brainstorm Ideas
              </button>
              <button
                onClick={() => triggerAgentAction('analyst-1', 'analyze')}
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                📊 Analyze Data
              </button>
              <button
                onClick={() => triggerAgentAction('judge-1', 'decide')}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                ⚖️ Make Decision
              </button>
              <button
                onClick={() => triggerAgentAction('builder-1', 'build')}
                className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                🔨 Build System
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NeuralWorkspace;