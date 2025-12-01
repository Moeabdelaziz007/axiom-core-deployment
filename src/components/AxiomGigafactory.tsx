/**
 * 🏭 AXIOM GIGAFACTORY - Agent Creation Pipeline Visualization
 * 
 * Real-time visualization of agent creation pipeline with conveyor belt animation
 * Shows the 4 stages: Dreamer -> Analyst -> Judge -> Builder
 * Connects to /api/dream SSE endpoint for live updates
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Factory,
  Activity,
  Zap,
  Settings,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  Brain,
  Scale,
  Hammer,
  Sparkles,
  Cog,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface AgentCreationEvent {
  type: 'AGENT_CREATING' | 'AGENT_CREATED' | 'AGENT_ERROR' | 'STAGE_COMPLETED' | 'PIPELINE_STARTED' | 'PIPELINE_COMPLETED';
  agentId?: string;
  agentType?: 'dreamer' | 'analyst' | 'judge' | 'builder';
  stage?: number;
  timestamp: number;
  data: {
    message?: string;
    progress?: number;
    error?: string;
    metadata?: Record<string, any>;
    agentConfig?: Record<string, any>;
  };
}

interface ConveyorAgent {
  id: string;
  type: 'dreamer' | 'analyst' | 'judge' | 'builder';
  name: string;
  status: 'idle' | 'creating' | 'processing' | 'completed' | 'error';
  progress: number;
  currentStage: number;
  position: number; // Position on conveyor belt (0-100)
  metadata?: Record<string, any>;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

interface StageConfig {
  id: number;
  name: string;
  type: 'dreamer' | 'analyst' | 'judge' | 'builder';
  color: string;
  icon: React.ReactNode;
  description: string;
  duration: number; // Estimated duration in ms
}

// ============================================================================
// STAGE CONFIGURATION
// ============================================================================

const STAGE_CONFIGS: StageConfig[] = [
  {
    id: 0,
    name: 'Dreamer',
    type: 'dreamer',
    color: '#8B5CF6', // Purple
    icon: <Brain className="w-6 h-6" />,
    description: 'Creative ideation and vision planning',
    duration: 8000
  },
  {
    id: 1,
    name: 'Analyst',
    type: 'analyst',
    color: '#06B6D4', // Cyan
    icon: <Scale className="w-6 h-6" />,
    description: 'Data analysis and pattern recognition',
    duration: 6000
  },
  {
    id: 2,
    name: 'Judge',
    type: 'judge',
    color: '#EF4444', // Red
    icon: <Settings className="w-6 h-6" />,
    description: 'Decision making and conflict resolution',
    duration: 7000
  },
  {
    id: 3,
    name: 'Builder',
    type: 'builder',
    color: '#F97316', // Orange
    icon: <Hammer className="w-6 h-6" />,
    description: 'System architecture and implementation',
    duration: 9000
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AxiomGigafactory: React.FC = () => {
  const [agents, setAgents] = useState<ConveyorAgent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [events, setEvents] = useState<AgentCreationEvent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const conveyorRef = useRef<HTMLDivElement>(null);

  // SSE connection for real-time updates
  useEffect(() => {
    if (isPaused) return;

    const connectSSE = () => {
      try {
        setConnectionError(null);
        const eventSource = new EventSource('/api/dream');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          console.log('🏭 Connected to Axiom Gigafactory SSE');
        };

        eventSource.onmessage = (event) => {
          try {
            const data: AgentCreationEvent = JSON.parse(event.data);
            handleSSEEvent(data);
          } catch (error) {
            console.error('Error parsing SSE event:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          setIsConnected(false);
          setConnectionError('Connection to Gigafactory lost');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectSSE, 3000);
        };

        eventSource.onclose = () => {
          setIsConnected(false);
          console.log('🏭 SSE Connection closed');
        };

      } catch (error) {
        console.error('Failed to connect to SSE:', error);
        setIsConnected(false);
        setConnectionError('Failed to connect to Gigafactory');
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
  const handleSSEEvent = useCallback((event: AgentCreationEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events

    switch (event.type) {
      case 'AGENT_CREATING':
        if (event.agentId && event.agentType) {
          createNewAgent(event.agentId, event.agentType);
        }
        break;
      
      case 'AGENT_CREATED':
        if (event.agentId) {
          updateAgentStatus(event.agentId, 'completed', 100);
        }
        break;
      
      case 'AGENT_ERROR':
        if (event.agentId) {
          updateAgentStatus(event.agentId, 'error', 0, event.data.error);
        }
        break;
      
      case 'STAGE_COMPLETED':
        if (event.agentId && event.stage !== undefined) {
          advanceAgentToStage(event.agentId, event.stage + 1);
        }
        break;
      
      case 'PIPELINE_STARTED':
        console.log('🏭 Agent creation pipeline started');
        break;
      
      case 'PIPELINE_COMPLETED':
        console.log('🏭 Agent creation pipeline completed');
        break;
    }
  }, []);

  // Create new agent
  const createNewAgent = (agentId: string, agentType: 'dreamer' | 'analyst' | 'judge' | 'builder') => {
    const newAgent: ConveyorAgent = {
      id: agentId,
      type: agentType,
      name: `${STAGE_CONFIGS.find(s => s.type === agentType)?.name} Agent`,
      status: 'creating',
      progress: 0,
      currentStage: 0,
      position: 0,
      createdAt: Date.now()
    };

    setAgents(prev => [...prev, newAgent]);
    startConveyorAnimation(agentId);
  };

  // Update agent status
  const updateAgentStatus = (agentId: string, status: ConveyorAgent['status'], progress: number, error?: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            status, 
            progress,
            error,
            completedAt: status === 'completed' ? Date.now() : undefined
          }
        : agent
    ));
  };

  // Advance agent to next stage
  const advanceAgentToStage = (agentId: string, nextStage: number) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            currentStage: nextStage,
            status: 'processing',
            progress: (nextStage / 4) * 100
          }
        : agent
    ));
  };

  // Start conveyor belt animation
  const startConveyorAnimation = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    let currentStage = 0;
    const stageInterval = setInterval(() => {
      if (currentStage >= 4) {
  // Cleanup old completed agents
  useEffect(() => {
    const cleanup = setInterval(() => {
      setAgents(prev => prev.filter(agent => {
        const age = Date.now() - agent.createdAt;
        return age < 60000 || agent.status !== 'completed'; // Keep agents for 1 minute after completion
      }));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(cleanup);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === ' ' && event.target === document.body) {
      event.preventDefault();
      setIsPaused(prev => !prev);
    } else if (event.key === 'r' && event.ctrlKey) {
      event.preventDefault();
      resetFactory();
    } else if (event.key === 'c' && event.ctrlKey) {
      event.preventDefault();
      createAgent();
    }
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
        clearInterval(stageInterval);
        updateAgentStatus(agentId, 'completed', 100);
        return;
      }

      advanceAgentToStage(agentId, currentStage + 1);
      currentStage++;
    }, STAGE_CONFIGS[currentStage]?.duration || 5000);
  };

  // Create new agent manually
  const createAgent = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const agentId = `agent-${Date.now()}`;
      const agentType: 'dreamer' | 'analyst' | 'judge' | 'builder' = 
        ['dreamer', 'analyst', 'judge', 'builder'][Math.floor(Math.random() * 4)] as any;
      
      createNewAgent(agentId, agentType);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
const AxiomGigafactory: React.FC = () => {
  const [agents, setAgents] = useState<ConveyorAgent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [events, setEvents] = useState<AgentCreationEvent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const { isMobile, isTablet } = useResponsive();
  const eventSourceRef = useRef<EventSource | null>(null);
  const conveyorRef = useRef<HTMLDivElement>(null);
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Reset factory
  const resetFactory = () => {
    setAgents([]);
    setEvents([]);
    setSelectedAgent(null);
  };

  // Get agent position on conveyor belt
  const getAgentPosition = (agent: ConveyorAgent) => {
    const stageWidth = 25; // Each stage takes 25% of conveyor width
    return agent.currentStage * stageWidth + (agent.progress / 100) * stageWidth;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Factory className="w-8 h-8" />
          🏭 Axiom Gigafactory
        </h1>
        <p className="text-gray-400">Agent Creation Pipeline with Real-time Conveyor Belt Visualization</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        {/* Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
          isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/20 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{connectionError}</span>
          </div>
        )}

        {/* Control Buttons */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span className="text-sm">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <button
          onClick={createAgent}
          disabled={isCreating}
          className="flex items-center gap-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span className="text-sm">{isCreating ? 'Creating...' : 'Create Agent'}</span>
        </button>

        <button
          onClick={resetFactory}
          className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Conveyor Belt Visualization */}
        <div className="col-span-8 glass-panel-premium rounded-xl overflow-hidden relative">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Cog className="w-6 h-6 text-purple-400" />
              Production Line
            </h2>

            {/* Conveyor Belt */}
            <div 
              ref={conveyorRef}
              className="relative h-32 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg overflow-hidden mb-6"
              style={{
                background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              {/* Conveyor Belt Lines */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full w-0.5 bg-gray-600"
                    style={{ left: `${i * 5}%` }}
                  />
                ))}
              </div>

              {/* Stage Labels */}
              <div className="absolute top-0 left-0 right-0 flex justify-between px-4 py-2">
                {STAGE_CONFIGS.map((stage, index) => (
                  <div key={stage.id} className="text-center">
                    <div 
                      className="text-xs font-semibold mb-1"
                      style={{ color: stage.color }}
                    >
                      {stage.name}
                    </div>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                      style={{ 
                        backgroundColor: stage.color + '20',
                        border: `2px solid ${stage.color}`
                      }}
                    >
                      {stage.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Agents on Conveyor */}
              <div className="absolute inset-0 flex items-center">
                {agents.map((agent, index) => {
                  const position = getAgentPosition(agent);
                  const stageConfig = STAGE_CONFIGS[agent.currentStage] || STAGE_CONFIGS[0];
                  
                  return (
                    <motion.div
                      key={agent.id}
                      className="absolute flex flex-col items-center"
                      style={{ 
                        left: `${position}%`,
                        transform: 'translateX(-50%)'
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Agent Avatar */}
                      <motion.div
                        className="w-10 h-10 rounded-full flex items-center justify-center relative border-2 mb-1"
                        style={{
                          backgroundColor: stageConfig.color + '20',
                          borderColor: stageConfig.color,
                          boxShadow: agent.status === 'processing' ? `0 0 15px ${stageConfig.color}` : 'none'
                        }}
                        animate={{
                          scale: agent.status === 'processing' ? [1, 1.2, 1] : 1,
                          rotate: agent.status === 'processing' ? [0, 5, -5, 0] : 0
                        }}
                        transition={{
                          duration: 2,
                          repeat: agent.status === 'processing' ? Infinity : 0
                        }}
                      >
                        <span className="text-sm">
                          {agent.type === 'dreamer' ? '🌟' :
                           agent.type === 'analyst' ? '📊' :
                           agent.type === 'judge' ? '⚖️' : '🔨'}
                        </span>
                        
                        {/* Status Indicator */}
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-gray-900 ${
                          agent.status === 'creating' ? 'bg-yellow-400' :
                          agent.status === 'processing' ? 'bg-blue-400' :
                          agent.status === 'completed' ? 'bg-green-400' :
                          agent.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                      </motion.div>
                      
                      {/* Agent Name */}
                      <div className="text-xs text-center whitespace-nowrap">
                        {agent.name}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Moving Conveyor Effect */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{ x: [0, -100] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full w-1 bg-white"
                    style={{ left: `${i * 10}%` }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Stage Details */}
            <div className="grid grid-cols-4 gap-4">
              {STAGE_CONFIGS.map((stage) => (
                <motion.div
                  key={stage.id}
                  className="glass-panel p-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: stage.color + '20',
                        border: `2px solid ${stage.color}`
                      }}
                    >
                      {stage.icon}
                    </div>
                    <h3 className="font-semibold" style={{ color: stage.color }}>
                      {stage.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{stage.description}</p>
                  <div className="text-xs text-gray-500">
                    Duration: {(stage.duration / 1000).toFixed(0)}s
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="col-span-4 space-y-4">
          {/* Selected Agent Details */}
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-premium rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-400" />
                Agent Details
              </h3>

              {(() => {
                const agent = agents.find(a => a.id === selectedAgent);
                if (!agent) return null;

                return (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-400">Name</div>
                      <div className="text-sm font-medium">{agent.name}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Type</div>
                      <div className="text-sm capitalize">{agent.type}</div>
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6" role="main" aria-label="Axiom Gigafactory Dashboard">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Factory className="w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
          🏭 Axiom Gigafactory
        </h1>
        <p className="text-gray-400 text-sm md:text-base">Agent Creation Pipeline with Real-time Conveyor Belt Visualization</p>
      </header>

      {/* Controls */}
      <section className="mb-6" aria-label="Factory Controls">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Connection Status */}
          <div 
            className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
            role="status"
            aria-live="polite"
            aria-label={`Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} aria-hidden="true" />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Connection Error */}
          {connectionError && (
            <div 
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/20 text-red-400"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{connectionError}</span>
            </div>
          )}

          {/* Control Buttons */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isPaused ? 'Resume production' : 'Pause production'}
            title={`${isPaused ? 'Resume' : 'Pause'} (Space key)`}
          >
            {isPaused ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
            <span className="text-sm hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={createAgent}
            disabled={isCreating}
            className="flex items-center gap-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Create new agent"
            title="Create Agent (Ctrl+C)"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
            <span className="text-sm hidden sm:inline">{isCreating ? 'Creating...' : 'Create Agent'}</span>
          </button>

          <button
            onClick={resetFactory}
            className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Reset factory"
            title="Reset Factory (Ctrl+R)"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm hidden sm:inline">Reset</span>
          </button>
        </div>
      </section>

      <div className={`grid gap-6 h-[calc(100vh-200px)] ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
        {/* Conveyor Belt Visualization */}
        <section className={`${isMobile ? 'col-span-1' : 'col-span-8'} glass-panel-premium rounded-xl overflow-hidden relative`} aria-label="Conveyor Belt Production Line">
          <div className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <Cog className="w-5 h-5 md:w-6 md:h-6 text-purple-400" aria-hidden="true" />
              Production Line
            </h2>

            {/* Conveyor Belt */}
            <div 
              ref={conveyorRef}
              className="relative h-24 md:h-32 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg overflow-hidden mb-6"
              style={{
                background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
              }}
              role="img"
              aria-label="Conveyor belt showing agent production stages"
            >
              {/* Conveyor Belt Lines */}
              <div className="absolute inset-0 opacity-20" aria-hidden="true">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full w-0.5 bg-gray-600"
                    style={{ left: `${i * 5}%` }}
                  />
                ))}
              </div>

              {/* Stage Labels */}
              <div className="absolute top-0 left-0 right-0 flex justify-between px-2 md:px-4 py-2" aria-hidden="true">
                {STAGE_CONFIGS.map((stage, index) => (
                  <div key={stage.id} className="text-center">
                    <div 
                      className="text-xs font-semibold mb-1"
                      style={{ color: stage.color }}
                    >
                      {stage.name}
                    </div>
                    <div 
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto"
                      style={{ 
                        backgroundColor: stage.color + '20',
                        border: `2px solid ${stage.color}`
                      }}
                    >
                      {stage.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Agents on Conveyor */}
              <div className="absolute inset-0 flex items-center" role="list" aria-label="Agents in production">
                {agents.map((agent, index) => {
                  const position = getAgentPosition(agent);
                  const stageConfig = STAGE_CONFIGS[agent.currentStage] || STAGE_CONFIGS[0];
                  
                  return (
                    <motion.div
                      key={agent.id}
                      className="absolute flex flex-col items-center"
                      style={{ 
                        left: `${position}%`,
                        transform: 'translateX(-50%)'
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
                      style={{ cursor: 'pointer' }}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${agent.name} - ${agent.status} - Stage ${agent.currentStage + 1}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedAgent(agent.id === selectedAgent ? null : agent.id);
                        }
                      }}
                    >
                      {/* Agent Avatar */}
                      <motion.div
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center relative border-2 mb-1"
                        style={{
                          backgroundColor: stageConfig.color + '20',
                          borderColor: stageConfig.color,
                          boxShadow: agent.status === 'processing' ? `0 0 15px ${stageConfig.color}` : 'none'
                        }}
                        animate={{
                          scale: agent.status === 'processing' ? [1, 1.2, 1] : 1,
                          rotate: agent.status === 'processing' ? [0, 5, -5, 0] : 0
                        }}
                        transition={{
                          duration: 2,
                          repeat: agent.status === 'processing' ? Infinity : 0
                        }}
                      >
                        <span className="text-xs md:text-sm">
                          {agent.type === 'dreamer' ? '🌟' :
                           agent.type === 'analyst' ? '📊' :
                           agent.type === 'judge' ? '⚖️' : '🔨'}
                        </span>
                        
                        {/* Status Indicator */}
                        <div className={`absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full border border-gray-900 ${
                          agent.status === 'creating' ? 'bg-yellow-400' :
                          agent.status === 'processing' ? 'bg-blue-400' :
                          agent.status === 'completed' ? 'bg-green-400' :
                          agent.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                        }`} aria-hidden="true" />
                      </motion.div>
                      
                      {/* Agent Name */}
                      <div className="text-xs text-center whitespace-nowrap">
                        {agent.name}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Moving Conveyor Effect */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{ x: [0, -100] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full w-1 bg-white"
                    style={{ left: `${i * 10}%` }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Stage Details */}
            <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {STAGE_CONFIGS.map((stage) => (
                <motion.div
                  key={stage.id}
                  className="glass-panel p-3 md:p-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  role="region"
                  aria-label={`${stage.name} stage details`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: stage.color + '20',
                        border: `2px solid ${stage.color}`
                      }}
                    >
                      {stage.icon}
                    </div>
                    <h3 className="font-semibold text-sm md:text-base" style={{ color: stage.color }}>
                      {stage.name}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 mb-2">{stage.description}</p>
                  <div className="text-xs text-gray-500">
                    Duration: {(stage.duration / 1000).toFixed(0)}s
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Side Panel */}
        <aside className={`${isMobile ? 'col-span-1' : 'col-span-4'} space-y-4`} aria-label="Factory Information Panel">
          {/* Selected Agent Details */}
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-premium rounded-xl p-4"
              role="region"
              aria-label="Selected agent details"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-400" aria-hidden="true" />
                Agent Details
              </h3>

              {(() => {
                const agent = agents.find(a => a.id === selectedAgent);
                if (!agent) return null;

                return (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-400">Name</div>
                      <div className="text-sm font-medium">{agent.name}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Type</div>
                      <div className="text-sm capitalize">{agent.type}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Status</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'creating' ? 'bg-yellow-400' :
                          agent.status === 'processing' ? 'bg-blue-400' :
                          agent.status === 'completed' ? 'bg-green-400' :
                          agent.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                        }`} aria-hidden="true" />
                        <span className="text-sm capitalize">{agent.status}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Current Stage</div>
                      <div className="text-sm">
                        {STAGE_CONFIGS[agent.currentStage]?.name || 'Unknown'}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Progress</div>
                      <div className="w-full bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={agent.progress} aria-valuemin={0} aria-valuemax={100}>
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{agent.progress.toFixed(0)}%</div>
                    </div>

                    {agent.error && (
                      <div>
                        <div className="text-sm text-gray-400">Error</div>
                        <div className="text-sm text-red-400">{agent.error}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-gray-400">Created</div>
                      <div className="text-xs text-gray-500">
                        {new Date(agent.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Factory Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-premium rounded-xl p-4"
            role="region"
            aria-label="Factory statistics"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" aria-hidden="true" />
              Factory Statistics
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total Agents</span>
                <span className="text-sm font-medium">{agents.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Creating</span>
                <span className="text-sm font-medium text-yellow-400">
                  {agents.filter(a => a.status === 'creating').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Processing</span>
                <span className="text-sm font-medium text-blue-400">
                  {agents.filter(a => a.status === 'processing').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Completed</span>
                <span className="text-sm font-medium text-green-400">
                  {agents.filter(a => a.status === 'completed').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Errors</span>
                <span className="text-sm font-medium text-red-400">
                  {agents.filter(a => a.status === 'error').length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-premium rounded-xl p-4"
            role="region"
            aria-label="Recent events"
            aria-live="polite"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" aria-hidden="true" />
              Recent Events
            </h3>

            <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto" role="log">
              <AnimatePresence>
                {events.slice(0, 10).map((event, index) => (
                  <motion.div
                    key={`${event.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                    role="article"
                    aria-label={`${event.type} event at ${new Date(event.timestamp).toLocaleTimeString()}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        event.agentType === 'dreamer' ? 'bg-purple-600' :
                        event.agentType === 'analyst' ? 'bg-cyan-600' :
                        event.agentType === 'judge' ? 'bg-red-600' :
                        event.agentType === 'builder' ? 'bg-orange-600' : 'bg-gray-600'
                      }`} aria-hidden="true">
                        {event.agentType ? event.agentType.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400">
                            {event.agentType || 'System'}
                          </span>
                          <span className={`ml-auto px-2 py-1 rounded text-xs ${
                            event.type === 'AGENT_CREATING' ? 'bg-yellow-500/20 text-yellow-400' :
                            event.type === 'AGENT_CREATED' ? 'bg-green-500/20 text-green-400' :
                            event.type === 'AGENT_ERROR' ? 'bg-red-500/20 text-red-400' :
                            event.type === 'STAGE_COMPLETED' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-200">
                          {event.data.message || 'Event occurred'}
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
        </aside>
      </div>

      {/* Keyboard Shortcuts Help */}
      <footer className="mt-6 text-xs text-gray-500 text-center">
        <p>Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-700 rounded">Space</kbd> Pause/Resume | <kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+C</kbd> Create Agent | <kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+R</kbd> Reset</p>
      </footer>
    </div>
  );
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Status</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'creating' ? 'bg-yellow-400' :
                          agent.status === 'processing' ? 'bg-blue-400' :
                          agent.status === 'completed' ? 'bg-green-400' :
                          agent.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm capitalize">{agent.status}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Current Stage</div>
                      <div className="text-sm">
                        {STAGE_CONFIGS[agent.currentStage]?.name || 'Unknown'}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400">Progress</div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{agent.progress.toFixed(0)}%</div>
                    </div>

                    {agent.error && (
                      <div>
                        <div className="text-sm text-gray-400">Error</div>
                        <div className="text-sm text-red-400">{agent.error}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-gray-400">Created</div>
                      <div className="text-xs text-gray-500">
                        {new Date(agent.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Factory Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-premium rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Factory Statistics
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total Agents</span>
                <span className="text-sm font-medium">{agents.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Creating</span>
                <span className="text-sm font-medium text-yellow-400">
                  {agents.filter(a => a.status === 'creating').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Processing</span>
                <span className="text-sm font-medium text-blue-400">
                  {agents.filter(a => a.status === 'processing').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Completed</span>
                <span className="text-sm font-medium text-green-400">
                  {agents.filter(a => a.status === 'completed').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Errors</span>
                <span className="text-sm font-medium text-red-400">
                  {agents.filter(a => a.status === 'error').length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-premium rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
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
                    className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
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
                            event.type === 'AGENT_CREATING' ? 'bg-yellow-500/20 text-yellow-400' :
                            event.type === 'AGENT_CREATED' ? 'bg-green-500/20 text-green-400' :
                            event.type === 'AGENT_ERROR' ? 'bg-red-500/20 text-red-400' :
                            event.type === 'STAGE_COMPLETED' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-200">
                          {event.data.message || 'Event occurred'}
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
        </div>
      </div>
    </div>
  );
};

export default AxiomGigafactory;
import { cn } from '@/lib/utils';

// Responsive design hook
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile, isTablet };
};