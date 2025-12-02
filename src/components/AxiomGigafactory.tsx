/**
 * 🏭 AXIOM GIGAFACTORY - Enhanced Agent Creation Pipeline
 * 
 * Real-time visualization of agent creation with 4-stage pipeline:
 * 1. Soul Injection (Matrix-style text rain)
 * 2. Identity Minting (Solana logo stamping)
 * 3. Tool Equipping (Cinematic tool loading)
 * 4. Agent Delivery (Completion)
 * 
 * Integrates with SmartFactoryService for high-fidelity simulation
 * Mobile-first responsive design
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactQueryPerformanceMonitor } from '@/hooks/useReactQueryPerformanceMonitor';
import ReactQueryPerformanceDashboard from '@/components/ReactQueryPerformanceDashboard';

// Import effects
import { MatrixRain } from '@/components/effects/MatrixRain';
import { SolanaStamp } from '@/components/effects/SolanaStamp';
import { ToolLoading } from '@/components/effects/ToolLoading';

// Import SmartFactoryService
import {
  fetchFactoryMetrics,
  createAgent,
  getAgentStatus,
  getAssemblyLineStatus,
  type Agent,
  type FactoryMetrics,
  type AssemblyLineStatus,
  type AgentType,
  type AgentStatus
} from '@/services/factoryService';

// ============================================================================
// TYPES
// ============================================================================

interface AgentCreationEvent {
  type: 'SOUL_INJECTION' | 'IDENTITY_MINTED' | 'TOOL_LOADING' | 'AGENT_READY' | 'CREATION_ERROR';
  agentId: string;
  agentType: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  timestamp: number;
  data: {
    message?: string;
    progress?: number;
    walletAddress?: string;
    tools?: string[];
    error?: string;
    metadata?: Record<string, any>;
  };
}

interface ConveyorAgent {
  id: string;
  type: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  name: string;
  status: 'idle' | 'creating' | 'processing' | 'completed' | 'error';
  progress: number;
  currentStage: number; // 0-3 for 4 stages
  position: number; // Position on conveyor (0-100)
  metadata?: Record<string, any>;
  error?: string;
  createdAt: number;
  completedAt?: number;
  walletAddress?: string;
  tools?: string[];
}

interface StageConfig {
  id: number;
  name: string;
  type: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  color: string;
  icon: React.ReactNode;
  description: string;
  duration: number; // Estimated duration in ms
}

// ============================================================================
// STAGE CONFIGURATION (Updated for 4-stage pipeline)
// ============================================================================

const STAGE_CONFIGS: StageConfig[] = [
  {
    id: 0,
    name: 'Soul',
    type: 'dreamer',
    color: '#8B5CF6', // Purple
    icon: <Brain className="w-6 h-6" />,
    description: 'Creative ideation and vision planning',
    duration: 8000
  },
  {
    id: 1,
    name: 'Identity',
    type: 'analyst',
    color: '#06B6D4', // Cyan
    icon: <Scale className="w-6 h-6" />,
    description: 'HD wallet derivation and minting',
    duration: 6000
  },
  {
    id: 2,
    name: 'Equipping',
    type: 'judge',
    color: '#F59E0B', // Orange
    icon: <Hammer className="w-6 h-6" />,
    description: 'Tool loading and capability assignment',
    duration: 4000
  },
  {
    id: 3,
    name: 'Delivery',
    type: 'builder',
    color: '#10B981', // Green
    icon: <CheckCircle className="w-6 h-6" />,
    description: 'Agent completion and deployment',
    duration: 2000
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AxiomGigafactory: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [events, setEvents] = useState<AgentCreationEvent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isMatrixRain, setIsMatrixRain] = useState(false);
  const [isSolanaStamping, setIsSolanaStamping] = useState(false);
  const [isToolLoading, setIsToolLoading] = useState(false);
  const [currentEffect, setCurrentEffect] = useState<'matrix' | 'solana' | 'tools' | null>(null);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  const conveyorRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Performance monitoring setup
  const { trackRender } = useReactQueryPerformanceMonitor({
    componentName: 'AxiomGigafactory',
    enableRenderTracking: true,
    enableMemoryTracking: true,
    enablePollingTracking: true,
    pollingQueries: [
      { queryKey: ['factoryMetrics'], interval: 3000 },
      { queryKey: ['assemblyLineStatus'], interval: 3000 },
      { queryKey: ['allAgents'], interval: 3000 }
    ]
  });

  // Map SmartFactoryService AgentStatus to component's ConveyorAgent status
  const mapAgentStatus = (status: AgentStatus): ConveyorAgent['status'] => {
    switch (status) {
      case 'idle': return 'idle';
      case 'soul_forge': return 'creating';
      case 'identity_mint':
      case 'equipping':
      case 'delivery_dock': return 'processing';
      case 'completed': return 'completed';
      case 'error': return 'error';
      default: return 'idle';
    }
  };

  // Map SmartFactoryService AgentStatus to stage number
  const mapStatusToStage = (status: AgentStatus): number => {
    switch (status) {
      case 'idle': return 0;
      case 'soul_forge': return 0;
      case 'identity_mint': return 1;
      case 'equipping': return 2;
      case 'delivery_dock': return 3;
      case 'completed': return 3;
      case 'error': return 0;
      default: return 0;
    }
  };

  // Convert SmartFactoryService Agent to ConveyorAgent format
  const convertToConveyorAgent = (agent: Agent): ConveyorAgent => {
    return {
      id: agent.id,
      type: agent.type,
      name: agent.name,
      status: mapAgentStatus(agent.status),
      progress: agent.progress,
      currentStage: mapStatusToStage(agent.status),
      position: 0, // Will be calculated based on stage and progress
      metadata: agent.metadata,
      error: agent.error,
      createdAt: agent.createdAt,
      completedAt: agent.completedAt,
      walletAddress: agent.walletAddress,
      tools: agent.tools
    };
  };

  // React Query for factory metrics with polling and performance optimizations
  const { data: metrics, error: metricsError, isLoading: metricsLoading } = useQuery({
    queryKey: ['factoryMetrics'],
    queryFn: fetchFactoryMetrics,
    refetchInterval: isPaused ? false : 3000, // Poll every 3 seconds when not paused
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2000, // Consider data stale after 2 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches on window focus
    refetchOnReconnect: true, // Refetch on reconnection
  });

  // React Query for assembly line status with performance optimizations
  const { data: assemblyLineStatus, error: assemblyError } = useQuery({
    queryKey: ['assemblyLineStatus'],
    queryFn: getAssemblyLineStatus,
    refetchInterval: isPaused ? false : 3000, // Poll every 3 seconds when not paused
    retry: 2,
    staleTime: 1500, // Consider data stale after 1.5 seconds
    gcTime: 180000, // Keep in cache for 3 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // React Query for all agents with performance optimizations
  const { data: allAgents, error: agentsError } = useQuery({
    queryKey: ['allAgents'],
    queryFn: async () => {
      // Get all agents from service
      const agents: Agent[] = [];
      // Since service doesn't have a getAllAgents method, we'll track agents individually
      // For now, we'll use assembly line status to get agent information
      return agents;
    },
    refetchInterval: isPaused ? false : 3000,
    retry: 2,
    staleTime: 1000, // Consider data stale after 1 second
    gcTime: 120000, // Keep in cache for 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Mutation for creating agents
  const createAgentMutation = useMutation({
    mutationFn: (agentType: AgentType) => createAgent(agentType),
    onSuccess: (newAgent) => {
      // Add event for new agent creation
      const event: AgentCreationEvent = {
        type: 'SOUL_INJECTION',
        agentId: newAgent.id,
        agentType: newAgent.type,
        timestamp: Date.now(),
        data: {
          message: `Started creating ${newAgent.name}`,
          progress: 0
        }
      };
      setEvents(prev => [event, ...prev.slice(0, 99)]);
      
      // Trigger matrix rain effect
      setCurrentEffect('matrix');
      setIsMatrixRain(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['factoryMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['assemblyLineStatus'] });
    },
    onError: (error) => {
      console.error('Failed to create agent:', error);
      const event: AgentCreationEvent = {
        type: 'CREATION_ERROR',
        agentId: '',
        agentType: 'dreamer',
        timestamp: Date.now(),
        data: {
          message: 'Failed to create agent',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      setEvents(prev => [event, ...prev.slice(0, 99)]);
    }
  });

  // Get agents from assembly line status and convert to ConveyorAgent format
  const agents = useMemo(() => {
    if (!assemblyLineStatus) return [];
    
    const conveyorAgents: ConveyorAgent[] = [];
    
    // Extract agents from assembly line stages
    assemblyLineStatus.forEach((stageStatus) => {
      if (stageStatus.stage.currentAgentId) {
        // We need to get the actual agent details
        // For now, we'll create a placeholder that will be updated
        const existingAgent = conveyorAgents.find(a => a.id === stageStatus.stage.currentAgentId);
        if (!existingAgent) {
          // This is a simplified approach - in a real implementation,
          // we'd need a way to get all agents from the service
          conveyorAgents.push({
            id: stageStatus.stage.currentAgentId,
            type: 'dreamer', // Default type
            name: 'Agent', // Default name
            status: stageStatus.stage.status === 'active' ? 'processing' : 'idle',
            progress: stageStatus.stage.progress,
            currentStage: 0, // Would need to map from stage ID
            position: 0,
            createdAt: Date.now()
          });
        }
      }
    });
    
    return conveyorAgents;
  }, [assemblyLineStatus]);

  // Connection status based on query errors
  const isConnected = !metricsError && !assemblyError && !agentsError;
  const connectionError = (metricsError || assemblyError || agentsError) as string | null;

  // Responsive design hook
  const { isMobile, isTablet } = useMemo(() => {
    if (typeof window === 'undefined') return { isMobile: false, isTablet: false };
    
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    
    return { isMobile, isTablet };
  }, []);

  // Monitor agent status changes and trigger visual effects
  useEffect(() => {
    if (!agents.length) return;

    agents.forEach(agent => {
      if (agent.status === 'creating' && !isMatrixRain) {
        setCurrentEffect('matrix');
        setIsMatrixRain(true);
      } else if (agent.status === 'processing') {
        if (agent.currentStage === 1 && !isSolanaStamping) {
          setCurrentEffect('solana');
          setIsSolanaStamping(true);
        } else if (agent.currentStage === 2 && !isToolLoading) {
          setCurrentEffect('tools');
          setIsToolLoading(true);
        }
      } else if (agent.status === 'completed') {
        setCurrentEffect(null);
        setIsMatrixRain(false);
        setIsSolanaStamping(false);
        setIsToolLoading(false);
      } else if (agent.status === 'error') {
        setCurrentEffect(null);
        setIsMatrixRain(false);
        setIsSolanaStamping(false);
        setIsToolLoading(false);
      }
    });
  }, [agents, isMatrixRain, isSolanaStamping, isToolLoading]);

  // Create new agent using SmartFactoryService
  const createAgent = useCallback(() => {
    const agentTypes: AgentType[] = ['dreamer', 'analyst', 'judge', 'builder', 'tajer', 'aqar', 'mawid', 'sofra'];
    const randomAgentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
    
    createAgentMutation.mutate(randomAgentType);
  }, [createAgentMutation]);

  // Get agent position on conveyor belt
  const getAgentPosition = useCallback((agent: ConveyorAgent) => {
    const stageWidth = 25; // Each stage takes 25% of conveyor width
    return agent.currentStage * stageWidth + (agent.progress / 100) * stageWidth;
  }, []);

  // Reset factory
  const resetFactory = useCallback(() => {
    setEvents([]);
    setSelectedAgent(null);
    setCurrentEffect(null);
    setIsMatrixRain(false);
    setIsSolanaStamping(false);
    setIsToolLoading(false);
    
    // Clear React Query cache
    queryClient.clear();
  }, [queryClient]);

  // Enhanced keyboard shortcuts and accessibility
  useEffect(() => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if ([' ', 'c', 'r', '1', '2', '3', '4', 'Escape', 'Enter'].includes(event.key)) {
        if (event.key === ' ' || event.ctrlKey || event.metaKey || event.key === 'Escape') {
          event.preventDefault();
        }
      }

      // Space: Pause/Resume (when not focused on input)
      if (event.key === ' ' && (event.target as HTMLElement)?.tagName !== 'INPUT') {
        setIsPaused(prev => !prev);
      }
      
      // Ctrl/Cmd + R: Reset factory
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        resetFactory();
      }
      
      // Ctrl/Cmd + C: Create agent
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        createAgent();
      }
      
      // Number keys 1-4: Quick stage selection
      if (event.key >= '1' && event.key <= '4') {
        const stageIndex = parseInt(event.key) - 1;
        if (stageIndex < STAGE_CONFIGS.length) {
          // Focus on stage for screen readers
          const stageElement = document.querySelector(`[data-stage="${stageIndex}"]`);
          if (stageElement) {
            (stageElement as HTMLElement).focus();
          }
        }
      }
      
      // Escape: Clear selection and reset focus
      if (event.key === 'Escape') {
        setSelectedAgent(null);
        document.body.focus();
      }
      
      // Enter: Create agent when focused on create button
      if (event.key === 'Enter' && (event.target as HTMLElement)?.getAttribute('aria-label')?.includes('Create')) {
        createAgent();
      }
      
      // Tab navigation enhancement
      if (event.key === 'Tab') {
        // Add visual feedback for better keyboard navigation
        document.body.classList.add('keyboard-navigation');
        setTimeout(() => {
          document.body.classList.remove('keyboard-navigation');
        }, 200);
      }
    }, []);

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Announce changes for screen readers
  useEffect(() => {
    if (agents.length > 0) {
      const announcement = `Factory status: ${agents.filter(a => a.status === 'creating').length} creating, ${agents.filter(a => a.status === 'processing').length} processing, ${agents.filter(a => a.status === 'completed').length} completed`;
      
      // Create live region for announcements
      let liveRegion = document.getElementById('factory-announcements');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'factory-announcements';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
      }
      
      liveRegion.textContent = announcement;
    }
  }, [agents.length, agents.filter(a => a.status === 'completed').length]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6" role="main" aria-label="Axiom Gigafactory Dashboard">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Factory className="w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
          🏭 Axiom Gigafactory
        </h1>
        <p className="text-gray-400 text-sm md:text-base">Real-time Agent Creation with Cinematic Effects</p>
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
            disabled={createAgentMutation.isPending}
            className="flex items-center gap-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Create new agent"
            title="Create Agent (Ctrl+C)"
          >
            {createAgentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4" aria-hidden="true" />}
            <span className="text-sm hidden sm:inline">{createAgentMutation.isPending ? 'Creating...' : 'Create Agent'}</span>
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

      {/* Main Content - Mobile First */}
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
                          backgroundColor: stageConfig.color + '20%',
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
              {STAGE_CONFIGS.map((stage, index) => (
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
                        backgroundColor: stage.color + '20%',
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
                    Duration: {(stage.duration / 1000).toFixed(1)}s
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

                    <div>
                      <div className="text-sm text-gray-400">Wallet Address</div>
                      <div className="text-sm font-mono break-all">
                        {agent.walletAddress || 'Not available'}
                      </div>
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

                    {agent.tools && agent.tools.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-400">Tools</div>
                        <div className="flex flex-wrap gap-1">
                          {agent.tools.map((tool, index) => (
                            <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                <span className="text-sm font-medium">{metrics?.totalAgentsCreated || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Active</span>
                <span className="text-sm font-medium text-yellow-400">
                  {metrics?.activeAgents || 0}
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
                  {metrics?.completedAgents || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Failed</span>
                <span className="text-sm font-medium text-red-400">
                  {metrics?.failedAgents || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Efficiency</span>
                <span className="text-sm font-medium text-purple-400">
                  {metrics?.efficiency?.toFixed(1) || 0}%
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
                            event.type === 'SOUL_INJECTION' ? 'bg-yellow-500/20 text-yellow-400' :
                            event.type === 'IDENTITY_MINTED' ? 'bg-green-500/20 text-green-400' :
                            event.type === 'TOOL_LOADING' ? 'bg-blue-500/20 text-blue-400' :
                            event.type === 'AGENT_READY' ? 'bg-green-500/20 text-green-400' :
                            event.type === 'CREATION_ERROR' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
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

        {/* Keyboard Shortcuts Help */}
        <footer className="mt-6 text-xs text-gray-500 text-center" role="contentinfo" aria-label="Keyboard shortcuts">
          <div className="space-y-1">
            <p>Keyboard shortcuts:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">Space</kbd> Pause/Resume</span>
              <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl/Cmd+C</kbd> Create Agent</span>
              <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl/Cmd+R</kbd> Reset</span>
              <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">1-4</kbd> Focus Stages</span>
              <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">Esc</kbd> Clear Selection</span>
            </div>
          </div>
        </footer>

        {/* Screen reader only announcements */}
        <div
          id="factory-announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </div>

      {/* Visual Effects Overlay */}
      <AnimatePresence>
        <MatrixRain isActive={isMatrixRain} />
        <SolanaStamp isActive={isSolanaStamping} />
        <ToolLoading isActive={isToolLoading} tools={selectedAgent ? agents.find(a => a.id === selectedAgent)?.tools || [] : []} />
      </AnimatePresence>

      {/* Performance Dashboard */}
      <ReactQueryPerformanceDashboard
        isVisible={showPerformanceDashboard}
        onClose={() => setShowPerformanceDashboard(false)}
        pollingQueries={[
          { queryKey: ['factoryMetrics'], interval: 3000 },
          { queryKey: ['assemblyLineStatus'], interval: 3000 },
          { queryKey: ['allAgents'], interval: 3000 }
        ]}
      />
    </div>
  );
};

export default AxiomGigafactory;