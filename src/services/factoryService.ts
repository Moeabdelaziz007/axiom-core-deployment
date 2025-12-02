/**
 * 🏭 SmartFactoryService - Stateful Simulation Logic
 * 
 * A high-fidelity mock service for the Axiom Gigafactory that simulates
 * a live backend without requiring actual infrastructure. This service
 * provides realistic agent creation simulation with state machine logic,
 * progress tracking, and data persistence.
 * 
 * Features:
 * - State machine with 5 stages: Idle -> Soul Forge -> Identity Mint -> Equipping -> Delivery Dock -> Idle
 * - Realistic progress simulation with random increments (10-20%)
 * - localStorage persistence for metrics
 * - Simulated Solana wallet address generation
 * - Occasional errors and recovery scenarios
 * - Realistic production timing and throughput
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Agent types supported by the factory
 */
export type AgentType = 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';

/**
 * Agent status throughout the creation process
 */
export type AgentStatus = 'idle' | 'soul_forge' | 'identity_mint' | 'equipping' | 'delivery_dock' | 'completed' | 'error';

/**
 * Assembly line stage configuration
 */
export interface AssemblyLineStage {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'completed' | 'error';
  progress: number;
  estimatedDuration: number; // in milliseconds
  currentAgentId?: string;
  throughput: number; // agents per hour
}

/**
 * Assembly line status for all stages
 */
export interface AssemblyLineStatus {
  stage: AssemblyLineStage;
  agentsInQueue: number;
  averageWaitTime: number; // in milliseconds
  efficiency: number; // percentage
}

/**
 * Agent entity with complete creation state
 */
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  progress: number;
  stageProgress: number;
  walletAddress?: string;
  tools?: string[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Factory metrics for dashboard and monitoring
 */
export interface FactoryMetrics {
  totalAgentsCreated: number;
  activeAgents: number;
  completedAgents: number;
  failedAgents: number;
  averageProductionTime: number;
  currentProductionRate: number;
  uptime: number;
  efficiency: number;
  lastProductionTime: number;
  activeWallets: number;
  totalToolsLoaded: number;
}

/**
 * Storage keys for localStorage persistence
 */
interface StorageKeys {
  totalAgentsCreated: string;
  activeWallets: string;
  factoryMetrics: string;
  lastUpdated: string;
}

// ============================================================================
// SMART FACTORY SERVICE
// ============================================================================

/**
 * SmartFactoryService - Stateful simulation of agent creation pipeline
 * 
 * This service manages the complete lifecycle of agent creation with realistic
 * timing, progress simulation, and error scenarios. It maintains state in memory
 * and persists key metrics to localStorage for continuity across sessions.
 */
export class SmartFactoryService {
  private agents: Map<string, Agent> = new Map();
  private assemblyLineStages: Map<string, AssemblyLineStage> = new Map();
  private isRunning: boolean = false;
  private simulationInterval?: NodeJS.Timeout;
  private lastMetricsUpdate: number = 0;
  
  // Storage keys for persistence
  private readonly storageKeys: StorageKeys = {
    totalAgentsCreated: 'axiom_factory_total_agents',
    activeWallets: 'axiom_factory_active_wallets',
    factoryMetrics: 'axiom_factory_metrics',
    lastUpdated: 'axiom_factory_last_updated'
  };

  // Stage configurations with realistic durations
  private readonly stageConfigs = {
    idle: { name: 'Idle', duration: 0, color: '#6B7280' },
    soul_forge: { name: 'Soul Forge', duration: 8000, color: '#8B5CF6' },
    identity_mint: { name: 'Identity Mint', duration: 6000, color: '#06B6D4' },
    equipping: { name: 'Equipping', duration: 4000, color: '#F59E0B' },
    delivery_dock: { name: 'Delivery Dock', duration: 2000, color: '#10B981' },
    completed: { name: 'Completed', duration: 0, color: '#10B981' }
  };

  // Tool assignments by agent type
  private readonly toolAssignments: Record<AgentType, string[]> = {
    dreamer: ['vision-generator', 'idea-compiler', 'creativity-engine'],
    analyst: ['data-processor', 'pattern-detector', 'insight-generator'],
    judge: ['logic-engine', 'decision-tree', 'ethics-validator'],
    builder: ['code-generator', 'architecture-planner', 'deployment-engine'],
    tajer: ['market-analyzer', 'pricing-engine', 'negotiation-bot'],
    aqar: ['property-scanner', 'valuation-model', 'location-analyzer'],
    mawid: ['scheduler', 'calendar-integrator', 'reminder-system'],
    sofra: ['recipe-generator', 'nutrition-analyzer', 'meal-planner']
  };

  constructor() {
    this.initializeAssemblyLine();
    this.loadPersistedMetrics();
    this.startSimulation();
  }

  /**
   * Initialize the assembly line stages
   */
  private initializeAssemblyLine(): void {
    Object.entries(this.stageConfigs).forEach(([stageId, config]) => {
      if (stageId !== 'idle' && stageId !== 'completed') {
        this.assemblyLineStages.set(stageId, {
          id: stageId,
          name: config.name,
          status: 'idle',
          progress: 0,
          estimatedDuration: config.duration,
          throughput: Math.floor(3600000 / config.duration), // agents per hour
        });
      }
    });
  }

  /**
   * Load persisted metrics from localStorage
   */
  private loadPersistedMetrics(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const totalAgents = localStorage.getItem(this.storageKeys.totalAgentsCreated);
        const activeWallets = localStorage.getItem(this.storageKeys.activeWallets);
        const lastUpdated = localStorage.getItem(this.storageKeys.lastUpdated);

        if (totalAgents) {
          // Initialize with persisted count
          this.lastMetricsUpdate = lastUpdated ? parseInt(lastUpdated) : Date.now();
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted metrics:', error);
    }
  }

  /**
   * Persist metrics to localStorage
   */
  private persistMetrics(metrics: FactoryMetrics): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKeys.totalAgentsCreated, metrics.totalAgentsCreated.toString());
        localStorage.setItem(this.storageKeys.activeWallets, metrics.activeWallets.toString());
        localStorage.setItem(this.storageKeys.factoryMetrics, JSON.stringify(metrics));
        localStorage.setItem(this.storageKeys.lastUpdated, Date.now().toString());
      }
    } catch (error) {
      console.warn('Failed to persist metrics:', error);
    }
  }

  /**
   * Generate a realistic Solana wallet address
   */
  private generateSolanaAddress(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  /**
   * Generate a random agent name based on type
   */
  private generateAgentName(type: AgentType): string {
    const prefixes = {
      dreamer: ['Cosmic', 'Stellar', 'Nebula', 'Quantum'],
      analyst: ['Data', 'Logic', 'Insight', 'Pattern'],
      judge: ['Justice', 'Balance', 'Wisdom', 'Verdict'],
      builder: ['Creator', 'Architect', 'Constructor', 'Forge'],
      tajer: ['Market', 'Trade', 'Commerce', 'Deal'],
      aqar: ['Property', 'Estate', 'Housing', 'Realty'],
      mawid: ['Schedule', 'Timeline', 'Calendar', 'Planner'],
      sofra: ['Cuisine', 'Flavor', 'Recipe', 'Meal']
    };

    const suffixes = ['Agent', 'Bot', 'Unit', 'System', 'Engine'];
    const typePrefixes = prefixes[type] || ['Generic'];
    const prefix = typePrefixes[Math.floor(Math.random() * typePrefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const number = Math.floor(Math.random() * 9999) + 1;

    return `${prefix}${suffix}-${number.toString().padStart(4, '0')}`;
  }

  /**
   * Start the simulation loop
   */
  private startSimulation(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.simulationInterval = setInterval(() => {
      this.updateSimulation();
    }, 1000); // Update every second
  }

  /**
   * Update simulation state for all active agents
   */
  private updateSimulation(): void {
    const now = Date.now();
    let hasUpdates = false;

    // Update each active agent
    this.agents.forEach((agent, agentId) => {
      if (agent.status === 'error' || agent.status === 'completed') {
        return;
      }

      hasUpdates = true;
      const stageConfig = this.stageConfigs[agent.status];
      
      // Calculate progress increment (10-20% random)
      const progressIncrement = Math.random() * 10 + 10;
      agent.stageProgress = Math.min(100, agent.stageProgress + progressIncrement);
      
      // Update overall progress based on stage
      const stageOrder = ['soul_forge', 'identity_mint', 'equipping', 'delivery_dock'];
      const currentStageIndex = stageOrder.indexOf(agent.status);
      const stageProgress = agent.stageProgress / 100;
      agent.progress = ((currentStageIndex + stageProgress) / stageOrder.length) * 100;

      // Check if stage is complete
      if (agent.stageProgress >= 100) {
        this.advanceAgentToNextStage(agent);
      }

      // Simulate occasional errors (5% chance)
      if (Math.random() < 0.05 && agent.status !== 'idle') {
        agent.error = `Random simulation error in ${agent.status}`;
        agent.status = 'error';
        agent.completedAt = now;
      }
    });

    // Clean up completed agents older than 5 minutes
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    this.agents.forEach((agent, agentId) => {
      if (agent.completedAt && agent.completedAt < fiveMinutesAgo) {
        this.agents.delete(agentId);
      }
    });

    if (hasUpdates) {
      this.lastMetricsUpdate = now;
    }
  }

  /**
   * Advance agent to the next stage in the pipeline
   */
  private advanceAgentToNextStage(agent: Agent): void {
    const stageOrder: AgentStatus[] = ['soul_forge', 'identity_mint', 'equipping', 'delivery_dock'];
    const currentIndex = stageOrder.indexOf(agent.status);
    
    if (currentIndex < stageOrder.length - 1) {
      // Move to next stage
      agent.status = stageOrder[currentIndex + 1];
      agent.stageProgress = 0;
      
      // Special handling for specific stages
      if (agent.status === 'identity_mint' && !agent.walletAddress) {
        agent.walletAddress = this.generateSolanaAddress();
      }
      
      if (agent.status === 'equipping' && !agent.tools) {
        agent.tools = this.toolAssignments[agent.type] || [];
      }
    } else {
      // Agent completed
      agent.status = 'completed';
      agent.progress = 100;
      agent.stageProgress = 100;
      agent.completedAt = Date.now();
    }
  }

  /**
   * Get the total number of agents created from localStorage
   */
  private getTotalAgentsCreated(): number {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = localStorage.getItem(this.storageKeys.totalAgentsCreated);
        return value ? parseInt(value, 10) : 0;
      }
    } catch (error) {
      console.warn('Failed to get total agents created:', error);
    }
    return 0;
  }

  /**
   * Get the number of active wallets from localStorage
   */
  private getActiveWallets(): number {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = localStorage.getItem(this.storageKeys.activeWallets);
        return value ? parseInt(value, 10) : 0;
      }
    } catch (error) {
      console.warn('Failed to get active wallets:', error);
    }
    return 0;
  }

  /**
   * Increment the total agents created counter
   */
  private incrementTotalAgentsCreated(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const current = this.getTotalAgentsCreated();
        localStorage.setItem(this.storageKeys.totalAgentsCreated, (current + 1).toString());
      }
    } catch (error) {
      console.warn('Failed to increment total agents created:', error);
    }
  }

  /**
   * Increment the active wallets counter
   */
  private incrementActiveWallets(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const current = this.getActiveWallets();
        localStorage.setItem(this.storageKeys.activeWallets, (current + 1).toString());
      }
    } catch (error) {
      console.warn('Failed to increment active wallets:', error);
    }
  }
  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Fetch current factory metrics with real-time calculations
   * 
   * @returns Promise<FactoryMetrics> Current factory state and performance metrics
   */
  async fetchFactoryMetrics(): Promise<FactoryMetrics> {
    const now = Date.now();
    const agents = Array.from(this.agents.values());
    
    const activeAgents = agents.filter(a => 
      a.status !== 'idle' && a.status !== 'completed' && a.status !== 'error'
    ).length;
    
    const completedAgents = agents.filter(a => a.status === 'completed').length;
    const failedAgents = agents.filter(a => a.status === 'error').length;
    
    // Calculate average production time
    const completedAgentsWithTime = agents.filter(a => 
      a.status === 'completed' && a.startedAt && a.completedAt
    );
    
    const averageProductionTime = completedAgentsWithTime.length > 0
      ? completedAgentsWithTime.reduce((sum, agent) => 
          sum + (agent.completedAt! - agent.startedAt!), 0
        ) / completedAgentsWithTime.length
      : 0;
    
    // Calculate current production rate (agents per hour)
    const recentAgents = agents.filter(a => 
      a.completedAt && (now - a.completedAt) < 3600000 // Last hour
    );
    const currentProductionRate = recentAgents.length;
    
    // Calculate factory uptime (simplified as time since last metrics update)
    const uptime = this.lastMetricsUpdate > 0 ? now - this.lastMetricsUpdate : 0;
    
    // Calculate efficiency based on success rate
    const totalProcessed = completedAgents + failedAgents;
    const efficiency = totalProcessed > 0 ? (completedAgents / totalProcessed) * 100 : 100;
    
    // Get last production time
    const lastProductionTime = completedAgentsWithTime.length > 0
      ? Math.max(...completedAgentsWithTime.map(a => a.completedAt!))
      : 0;
    
    // Calculate total tools loaded
    const totalToolsLoaded = agents.reduce((sum, agent) => 
      sum + (agent.tools?.length || 0), 0
    );
    
    const metrics: FactoryMetrics = {
      totalAgentsCreated: this.getTotalAgentsCreated() + completedAgents,
      activeAgents,
      completedAgents,
      failedAgents,
      averageProductionTime,
      currentProductionRate,
      uptime,
      efficiency,
      lastProductionTime,
      activeWallets: this.getActiveWallets(),
      totalToolsLoaded
    };
    
    this.persistMetrics(metrics);
    return metrics;
  }

  /**
   * Create a new agent and start the creation process
   * 
   * @param type - The type of agent to create
   * @returns Promise<Agent> The created agent with initial state
   */
  async createAgent(type: AgentType): Promise<Agent> {
    const now = Date.now();
    const agentId = `agent_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agent: Agent = {
      id: agentId,
      name: this.generateAgentName(type),
      type,
      status: 'soul_forge',
      progress: 0,
      stageProgress: 0,
      createdAt: now,
      startedAt: now,
      metadata: {
        version: '1.0.0',
        priority: 'normal'
      }
    };
    
    this.agents.set(agentId, agent);
    this.incrementTotalAgentsCreated();
    
    // Simulate wallet creation for some agents
    if (Math.random() < 0.8) {
      this.incrementActiveWallets();
    }
    
    return agent;
  }

  /**
   * Get the current status of a specific agent
   * 
   * @param agentId - The ID of the agent to retrieve
   * @returns Promise<Agent | null> The agent status or null if not found
   */
  async getAgentStatus(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get the current status of all assembly line stages
   * 
   * @returns Promise<AssemblyLineStatus[]> Array of stage statuses with metrics
   */
  async getAssemblyLineStatus(): Promise<AssemblyLineStatus[]> {
    const statuses: AssemblyLineStatus[] = [];
    const agents = Array.from(this.agents.values());
    
    this.assemblyLineStages.forEach((stage, stageId) => {
      // Count agents in this stage
      const agentsInStage = agents.filter(a => a.status === stageId as AgentStatus);
      const agentsInQueue = agentsInStage.length;
      
      // Calculate average wait time
      const averageWaitTime = agentsInStage.length > 0
        ? agentsInStage.reduce((sum, agent) => {
            const waitTime = Date.now() - (agent.startedAt || agent.createdAt);
            return sum + waitTime;
          }, 0) / agentsInStage.length
        : 0;
      
      // Calculate efficiency based on current load vs capacity
      const maxConcurrent = 3; // Max agents per stage
      const efficiency = agentsInQueue >= maxConcurrent 
        ? 50 // Overloaded
        : agentsInQueue === 0 
          ? 100 // Idle but efficient
          : 85; // Working efficiently
      
      statuses.push({
        stage: {
          ...stage,
          status: agentsInQueue > 0 ? 'active' : 'idle',
          currentAgentId: agentsInQueue > 0 ? agentsInStage[0].id : undefined
        },
        agentsInQueue,
        averageWaitTime,
        efficiency
      });
    });
    
    return statuses;
  }

  /**
   * Stop the simulation and clean up resources
   */
  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
    this.isRunning = false;
  }

  /**
   * Reset all factory state (for testing/debugging)
   */
  resetFactory(): void {
    this.stopSimulation();
    this.agents.clear();
    this.initializeAssemblyLine();
    
    // Clear persisted data
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.values(this.storageKeys).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.warn('Failed to clear persisted metrics:', error);
    }
    
    this.startSimulation();
  }

  /**
   * Get all current agents (for debugging)
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Simulate an error for a specific agent (for testing error scenarios)
   * 
   * @param agentId - The ID of the agent to simulate error for
   * @param errorMessage - Optional custom error message
   */
  simulateAgentError(agentId: string, errorMessage?: string): boolean {
    const agent = this.agents.get(agentId);
    if (agent && agent.status !== 'completed' && agent.status !== 'error') {
      agent.error = errorMessage || `Simulated error in ${agent.status}`;
      agent.status = 'error';
      agent.completedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Recover an agent from error state (for testing recovery scenarios)
   * 
   * @param agentId - The ID of the agent to recover
   */
  recoverAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (agent && agent.status === 'error') {
      agent.status = 'soul_forge'; // Restart from beginning
      agent.progress = 0;
      agent.stageProgress = 0;
      agent.error = undefined;
      agent.completedAt = undefined;
      return true;
    }
    return false;
  }
}

// ============================================================================
// SINGLETON INSTANCE AND EXPORTS
// ============================================================================

/**
 * Global singleton instance of the SmartFactoryService
 */
export const smartFactoryService = new SmartFactoryService();

/**
 * Convenience function to fetch factory metrics
 */
export async function fetchFactoryMetrics(): Promise<FactoryMetrics> {
  return await smartFactoryService.fetchFactoryMetrics();
}

/**
 * Convenience function to create a new agent
 */
export async function createAgent(type: AgentType): Promise<Agent> {
  return await smartFactoryService.createAgent(type);
}

/**
 * Convenience function to get agent status
 */
export async function getAgentStatus(agentId: string): Promise<Agent | null> {
  return await smartFactoryService.getAgentStatus(agentId);
}

/**
 * Convenience function to get assembly line status
 */
export async function getAssemblyLineStatus(): Promise<AssemblyLineStatus[]> {
  return await smartFactoryService.getAssemblyLineStatus();
}

/**
 * Convenience function to stop the factory simulation
 */
export function stopFactorySimulation(): void {
  smartFactoryService.stopSimulation();
}

/**
 * Convenience function to reset the factory
 */
export function resetFactory(): void {
  smartFactoryService.resetFactory();
}