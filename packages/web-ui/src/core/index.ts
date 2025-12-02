/**
 * Core Modules Barrel File
 * 
 * This file exports all core modules from the packages/web-ui/src/core directory
 * using named exports for the comprehensive Index Strategy implementation.
 * 
 * Core modules include:
 * - Dream Factory: AI-powered concept generation and refinement
 * - Communication: Agent message bus for inter-agent communication
 * - Topology: Swarm intelligence and detection algorithms
 */

// ============================================================================
// DREAM FACTORY MODULES
// ============================================================================

/**
 * Main Dream Factory functionality for AI-powered concept generation
 * Note: Only available in server-side environment due to LangGraph dependencies
 */
// Dream Factory is server-side only and not exported from barrel to prevent client-side bundling
// Import directly in server components: import { createDreamGraph, initialState, ... } from '@/core/dream-factory/graph'

/**
 * Dream Factory Agents - Individual agent implementations
 * Note: Only available in server-side environment due to LangGraph dependencies
 */
// Dream Factory agents are server-side only and not exported from barrel to prevent client-side bundling
// Import directly in server components: import { dreamerAgent, analystAgent, ... } from '@/core/dream-factory/agents/dreamer'

// ============================================================================
// COMMUNICATION MODULES
// ============================================================================

/**
 * Agent communication system for inter-agent messaging
 */
export { AgentMessageBus, messageBus, type AgentMessage } from './communication/AgentMessageBus';

// ============================================================================
// TOPOLOGY MODULES
// ============================================================================

/**
 * Mapper Algorithm for topological data analysis
 */
export { MapperAlgo } from './topology/MapperAlgo';

/**
 * Swarm Consensus Engine for distributed decision making
 */
export { 
  SwarmConsensusEngine, 
  swarmEngine,
  type Proposal,
  type ConsensusResult 
} from './topology/SwarmConsensusEngine';

/**
 * TOHA Detector for topological hallucination detection
 */
export { 
  TOHADetector,
  type Simplex,
  type ReasoningNode 
} from './topology/TOHADetector';

/**
 * Toric Lattice for agent positioning and neighbor relationships
 */
export { 
  ToricLattice,
  type LatticeNode 
} from './topology/ToricLattice';