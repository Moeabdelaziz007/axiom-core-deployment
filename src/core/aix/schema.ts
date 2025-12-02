/**
 * AIX (Agent Interoperability Format) Core Schema
 * 
 * This module defines the fundamental data structures for sovereign agent
 * reasoning traces, memory, and interoperability. AIX serves as the
 * universal language that enables agents to think, remember, and communicate
 * in a standardized format across the entire swarm intelligence system.
 * 
 * Based on ReAct (Reasoning + Acting) and Chain of Thought (CoT) patterns,
 * this schema provides the foundation for collective intelligence and memory lineage.
 */

import { z } from 'zod';

/**
 * Thought Unit Types - Enumerates different cognitive processes
 * 
 * 'observation': Raw data input from external sources
 * 'reasoning': Internal logical processing and inference
 * 'plan': Strategic planning and goal setting
 * 'critique': Self-reflection and error correction
 * 'synthesis': Integration of multiple thoughts into conclusions
 */
export const ThoughtTypeSchema = z.enum([
  'observation',
  'reasoning', 
  'plan',
  'critique',
  'synthesis'
]);

export type ThoughtType = z.infer<typeof ThoughtTypeSchema>;

/**
 * Confidence Level - Standardized confidence scoring
 * 
 * Provides calibrated confidence levels with semantic meaning for
 * swarm decision-making and reputation scoring
 */
export const ConfidenceLevelSchema = z.enum([
  'very_low',    // 0.0-0.2 - Highly uncertain
  'low',         // 0.2-0.4 - Some uncertainty
  'medium',       // 0.4-0.6 - Moderate confidence
  'high',         // 0.6-0.8 - Good confidence
  'very_high',    // 0.8-0.9 - Strong confidence
  'certain'       // 0.9-1.0 - Near certainty
]);

export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

/**
 * Core Thought Unit - The atomic unit of agent cognition
 * 
 * Each thought represents a single cognitive step in the agent's
 * reasoning process. Thoughts are linked together to form chains
 * of reasoning that can be traced, validated, and learned from.
 */
export const ThoughtUnitSchema = z.object({
  // Core identification
  id: z.string().uuid().describe('Unique identifier for this thought'),
  timestamp: z.number().describe('Unix timestamp when thought was created'),
  agentId: z.string().describe('DID of the agent who created this thought'),
  
  // Content and structure
  content: z.string().describe('The actual thought content/expression'),
  type: ThoughtTypeSchema.describe('Type of cognitive process'),
  
  // Confidence and uncertainty
  confidence: z.number().min(0).max(1).describe('Numerical confidence score 0-1'),
  confidenceLevel: ConfidenceLevelSchema.describe('Semantic confidence level'),
  uncertainty: z.number().min(0).max(1).optional().describe('Uncertainty quantification'),
  
  // Relationships and lineage
  parentThoughtIds: z.array(z.string()).optional().describe('IDs of thoughts this builds upon'),
  childThoughtIds: z.array(z.string()).optional().describe('IDs of thoughts that build on this'),
  relatedThoughtIds: z.array(z.string()).optional().describe('Related thoughts for context'),
  
  // Memory and embedding
  vectorId: z.string().optional().describe('ID of vector embedding in semantic store'),
  embedding: z.array(z.number()).optional().describe('Direct embedding vector'),
  
  // Metadata and context
  sessionId: z.string().describe('Session context this thought belongs to'),
  taskId: z.string().optional().describe('Task this thought addresses'),
  tags: z.array(z.string()).default([]).describe('Categorization tags'),
  
  // Security and verification
  signature: z.string().optional().describe('Digital signature for authenticity'),
  hash: z.string().describe('Content hash for integrity verification'),
  
  // Performance metrics
  processingTime: z.number().optional().describe('Time taken to generate this thought (ms)'),
  tokensUsed: z.number().optional().describe('Tokens consumed in generating this thought'),
});

export type ThoughtUnit = z.infer<typeof ThoughtUnitSchema>;

/**
 * Agent Action - Executable actions with security context
 * 
 * Represents the "Act" part of ReAct - actions that agents
 * can perform with proper security policy validation and audit trails.
 */
export const AgentActionSchema = z.object({
  // Core identification
  id: z.string().uuid().describe('Unique action identifier'),
  timestamp: z.number().describe('Unix timestamp when action was initiated'),
  agentId: z.string().describe('DID of the agent performing the action'),
  
  // Action specification
  toolName: z.string().describe('Name of the tool/function to execute'),
  params: z.record(z.any()).describe('Parameters for the tool execution'),
  
  // Security and policy
  securityPolicyId: z.string().describe('Security policy governing this action'),
  requiresApproval: z.boolean().default(false).describe('Whether action requires human approval'),
  approvedBy: z.string().optional().describe('DID of approving agent/human'),
  
  // Execution context
  thoughtId: z.string().optional().describe('Thought that led to this action'),
  sessionId: z.string().describe('Session context for this action'),
  taskId: z.string().optional().describe('Task this action addresses'),
  
  // Risk and safety
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  maxCost: z.number().optional().describe('Maximum allowed cost for this action'),
  
  // Results and feedback
  result: z.any().optional().describe('Result of action execution'),
  error: z.string().optional().describe('Error message if action failed'),
  executionTime: z.number().optional().describe('Time taken for execution (ms)'),
  
  // Verification and audit
  signature: z.string().describe('Digital signature of action'),
  transactionHash: z.string().optional().describe('Blockchain transaction hash if applicable'),
});

export type AgentAction = z.infer<typeof AgentActionSchema>;

/**
 * ReAct Trace - Complete reasoning and action sequence
 * 
 * Represents a full chain of reasoning and actions that lead
 * to a conclusion or solution. Traces are the primary unit for
 * learning, validation, and swarm coordination.
 */
export const ReActTraceSchema = z.object({
  // Core identification
  id: z.string().uuid().describe('Unique trace identifier'),
  sessionId: z.string().describe('Session this trace belongs to'),
  taskId: z.string().optional().describe('Primary task this trace addresses'),
  
  // Metadata
  title: z.string().describe('Descriptive title of this reasoning trace'),
  description: z.string().describe('Brief description of what this trace accomplishes'),
  category: z.string().describe('Category of reasoning (e.g., "analysis", "planning")'),
  
  // Timing and performance
  startTime: z.number().describe('Unix timestamp when trace started'),
  endTime: z.number().optional().describe('Unix timestamp when trace completed'),
  duration: z.number().optional().describe('Total duration in milliseconds'),
  
  // Agent participation
  primaryAgentId: z.string().describe('Main agent driving this trace'),
  contributingAgents: z.array(z.string()).default([]).describe('Other agents who contributed'),
  
  // Core content
  thoughts: z.array(ThoughtUnitSchema).describe('Sequence of thoughts in reasoning'),
  actions: z.array(AgentActionSchema).describe('Actions taken during reasoning'),
  
  // Outcomes and evaluation
  conclusion: z.string().optional().describe('Final conclusion or solution'),
  success: z.boolean().optional().describe('Whether the trace achieved its goal'),
  confidence: z.number().min(0).max(1).optional().describe('Overall confidence in result'),
  
  // Learning and feedback
  lessons: z.array(z.string()).default([]).describe('Key lessons learned'),
  errors: z.array(z.string()).default([]).describe('Errors encountered and their resolutions'),
  
  // Swarm coordination
  votes: z.array(z.any()).optional().describe('Swarm votes on this trace'),
  consensus: z.boolean().optional().describe('Whether swarm consensus was reached'),
  
  // Memory and persistence
  vectorId: z.string().optional().describe('ID of vector embedding for entire trace'),
  archived: z.boolean().default(false).describe('Whether this trace is archived'),
  
  // Verification
  hash: z.string().describe('Hash of entire trace for integrity'),
  signature: z.string().optional().describe('Digital signature for authenticity'),
});

export type ReActTrace = z.infer<typeof ReActTraceSchema>;

/**
 * Session Context - Container for agent interactions
 * 
 * Provides context for multi-turn conversations and
 * maintains state across multiple reasoning traces.
 */
export const SessionContextSchema = z.object({
  id: z.string().uuid().describe('Unique session identifier'),
  
  // Participants
  primaryAgentId: z.string().describe('Primary agent for this session'),
  participantAgents: z.array(z.string()).default([]).describe('All participating agents'),
  userId: z.string().optional().describe('Human user ID if applicable'),
  
  // Timing
  startTime: z.number().describe('Session start timestamp'),
  lastActivity: z.number().describe('Last activity timestamp'),
  timeout: z.number().optional().describe('Session timeout in milliseconds'),
  
  // Context and goals
  goal: z.string().optional().describe('Primary goal of this session'),
  context: z.record(z.any()).optional().describe('Additional context data'),
  
  // Content tracking
  traceIds: z.array(z.string()).default([]).describe('All traces in this session'),
  activeTraceId: z.string().optional().describe('Currently active trace'),
  
  // Memory and learning
  memorySnapshots: z.array(z.string()).default([]).describe('Memory snapshot IDs'),
  learnedFacts: z.array(z.string()).default([]).describe('New facts learned'),
  
  // State
  status: z.enum(['active', 'paused', 'completed', 'expired']).default('active'),
  completedTasks: z.array(z.string()).default([]).describe('Completed task IDs'),
  
  // Security
  securityLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  requiresApproval: z.boolean().default(false),
});

export type SessionContext = z.infer<typeof SessionContextSchema>;

/**
 * AIX Message Types - Standardized communication formats
 * 
 * Defines the types of messages that can be exchanged between
 * agents using the AIX format.
 */
export const AIXMessageTypeSchema = z.enum([
  'thought_unit',      // Single thought unit
  'action_request',     // Request to perform action
  'action_result',      // Result of performed action
  'trace_complete',     // Complete reasoning trace
  'session_update',     // Session context update
  'memory_query',       // Query shared memory
  'coordination',       // Swarm coordination message
  'negotiation',       // Inter-agent negotiation
  'consensus',         // Consensus result
]);

export type AIXMessageType = z.infer<typeof AIXMessageTypeSchema>;

/**
 * AIX Message - Standardized inter-agent communication
 * 
 * Provides a universal format for agents to communicate
 * thoughts, actions, and coordination messages.
 */
export const AIXMessageSchema = z.object({
  // Core identification
  id: z.string().uuid().describe('Unique message identifier'),
  type: AIXMessageTypeSchema.describe('Type of AIX message'),
  timestamp: z.number().describe('Unix timestamp'),
  
  // Routing
  senderId: z.string().describe('DID of sending agent'),
  recipientId: z.string().optional().describe('DID of recipient (null for broadcast)'),
  sessionId: z.string().optional().describe('Session context'),
  
  // Content
  payload: z.any().describe('Message content (varies by type)'),
  metadata: z.record(z.any()).optional().describe('Additional metadata'),
  
  // Security
  signature: z.string().describe('Digital signature'),
  encrypted: z.boolean().default(false).describe('Whether payload is encrypted'),
  
  // Network
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  ttl: z.number().optional().describe('Time-to-live in milliseconds'),
});

export type AIXMessage = z.infer<typeof AIXMessageSchema>;

/**
 * AIX Schema Validation Utilities
 */
export class AIXSchemaValidator {
  /**
   * Validate a complete thought unit
   */
  static validateThoughtUnit(thought: any): { valid: boolean; errors: string[] } {
    const result = ThoughtUnitSchema.safeParse(thought);
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.issues.map(i => i.message),
    };
  }

  /**
   * Validate an agent action
   */
  static validateAgentAction(action: any): { valid: boolean; errors: string[] } {
    const result = AgentActionSchema.safeParse(action);
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.issues.map(i => i.message),
    };
  }

  /**
   * Validate a complete ReAct trace
   */
  static validateReActTrace(trace: any): { valid: boolean; errors: string[] } {
    const result = ReActTraceSchema.safeParse(trace);
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.issues.map(i => i.message),
    };
  }

  /**
   * Validate AIX message format
   */
  static validateAIXMessage(message: any): { valid: boolean; errors: string[] } {
    const result = AIXMessageSchema.safeParse(message);
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.issues.map(i => i.message),
    };
  }

  /**
   * Check thought chain consistency
   */
  static validateThoughtChain(thoughts: ThoughtUnit[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const thoughtMap = new Map(thoughts.map(t => [t.id, t]));

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const checkCircular = (thoughtId: string): boolean => {
      if (recursionStack.has(thoughtId)) {
        errors.push(`Circular dependency detected: ${thoughtId}`);
        return false;
      }
      if (visited.has(thoughtId)) return true;

      visited.add(thoughtId);
      recursionStack.add(thoughtId);

      const thought = thoughtMap.get(thoughtId);
      if (thought?.parentThoughtIds) {
        for (const parentId of thought.parentThoughtIds) {
          if (!checkCircular(parentId)) return false;
        }
      }

      recursionStack.delete(thoughtId);
      return true;
    };

    for (const thought of thoughts) {
      if (thought.parentThoughtIds?.length) {
        for (const parentId of thought.parentThoughtIds) {
          if (!thoughtMap.has(parentId)) {
            errors.push(`Parent thought ${parentId} not found in chain`);
          }
        }
        checkCircular(thought.id);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * AIX Schema Constants
 */
export const AIX_CONSTANTS = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLDS: {
    VERY_LOW: 0.2,
    LOW: 0.4,
    MEDIUM: 0.6,
    HIGH: 0.8,
    VERY_HIGH: 0.9,
  },

  // Default timeouts
  DEFAULT_TIMEOUTS: {
    THOUGHT_GENERATION: 30000,      // 30 seconds
    ACTION_EXECUTION: 60000,          // 1 minute
    TRACE_COMPLETION: 300000,         // 5 minutes
    SESSION_TIMEOUT: 1800000,          // 30 minutes
  },

  // Security levels
  SECURITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high',
  },

  // Message priorities
  MESSAGE_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
} as const;