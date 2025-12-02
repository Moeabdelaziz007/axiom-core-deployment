/**
 * Zod schemas for Axiom Core Web UI
 * This file contains all Zod schemas to validate data structures throughout the project
 */

import { z } from 'zod';

// ============================================================================
// WEBSOCKET EVENT SCHEMAS
// ============================================================================

/**
 * Schema for WebSocket event types
 */
export const webSocketEventTypeSchema = z.enum(['DIAGNOSTIC', 'MANDALA_UPDATE', 'LLM_TOKEN']);

/**
 * Schema for WebSocket event payloads
 */
export const webSocketEventPayloadSchema = z.object({
  // DIAGNOSTIC event payload
  cpu: z.number().optional(),
  memory: z.number().optional(),
  
  // MANDALA_UPDATE event payload
  state: z.enum(['EVOLVING', 'IDLE']).optional(),
  xp: z.number().optional(),
  
  // LLM_TOKEN event payload
  token: z.string().optional(),
});

/**
 * Schema for WebSocket events
 */
export const webSocketEventSchema = z.object({
  type: webSocketEventTypeSchema,
  payload: webSocketEventPayloadSchema,
});

// ============================================================================
// DREAM FACTORY SCHEMAS
// ============================================================================

/**
 * Schema for dream insights
 */
export const dreamInsightSchema = z.object({
  concept: z.string(),
  description: z.string(),
  feasibility: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  novelty: z.number().min(1).max(10),
  utility: z.number().min(1).max(10),
  tags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

/**
 * Schema for dream artifacts
 */
export const dreamArtifactSchema = z.object({
  id: z.string(),
  type: z.enum(['CODE', 'DATASET', 'DOCUMENT', 'SCHEMA']),
  title: z.string(),
  content: z.string(),
  language: z.string().optional(),
  format: z.string().optional(),
  createdAt: z.number(),
});

/**
 * Schema for dream evaluations
 */
export const dreamEvaluationSchema = z.object({
  novelty_score: z.number().min(1).max(10),
  feasibility_score: z.number().min(1).max(10),
  utility_score: z.number().min(1).max(10),
  final_score: z.number().min(1).max(10),
  decision: z.enum(['APPROVE', 'REJECT', 'REFINE']),
  feedback: z.string(),
});

/**
 * Schema for dream log entries
 */
export const dreamLogEntrySchema = z.object({
  agent: z.string(),
  data: z.union([z.string(), z.record(z.string(), z.unknown())]),
  timestamp: z.number().optional(),
});

/**
 * Schema for dream state
 */
export const dreamStateSchema = z.object({
  seed: z.string(),
  dreamLog: z.array(z.string()),
  structuredData: dreamInsightSchema,
  artifacts: z.array(dreamArtifactSchema),
  feedback: z.array(z.string()),
  iterationCount: z.number(),
  qualityScore: z.number(),
});

// ============================================================================
// SWARM CONSENSUS SCHEMAS
// ============================================================================

/**
 * Schema for proposal payloads
 */
export const proposalPayloadSchema = z.object({
  // TRANSACTION payload
  amount: z.number().optional(),
  currency: z.string().optional(),
  target: z.string().optional(),
  
  // DATA_UPDATE payload
  dataKey: z.string().optional(),
  dataValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  
  // SECURITY_ALERT payload
  threatLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().optional(),
  
  // BUY/SELL payload
  asset: z.string().optional(),
  price: z.number().optional(),
  
  // DEPLOY payload
  environment: z.enum(['DEVNET', 'TESTNET', 'MAINNET']).optional(),
  contract: z.string().optional(),
});

/**
 * Schema for proposals
 */
export const proposalSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  actionType: z.enum(['TRANSACTION', 'DATA_UPDATE', 'SECURITY_ALERT', 'BUY', 'SELL', 'DEPLOY']),
  payload: proposalPayloadSchema,
  timestamp: z.number(),
});

/**
 * Schema for consensus results
 */
export const consensusResultSchema = z.object({
  approved: z.boolean(),
  score: z.number().min(0).max(1),
  approvals: z.number(),
  rejections: z.number(),
  note: z.string(),
  actionId: z.string().optional(),
  approvalRate: z.number().optional(),
  participatingAgents: z.number().optional(),
});

/**
 * Schema for swarm nodes
 */
export const swarmNodeSchema = z.object({
  id: z.string(),
  group: z.number(), // 1: Agent, 2: Hallucination, 3: Core
  val: z.number(),   // Size
  x: z.number().optional(),
  y: z.number().optional(),
  z: z.number().optional(),
});

/**
 * Schema for swarm links
 */
export const swarmLinkSchema = z.object({
  source: z.string(),
  target: z.string(),
  strength: z.number().optional(),
});

/**
 * Schema for swarm graph data
 */
export const swarmGraphDataSchema = z.object({
  nodes: z.array(swarmNodeSchema),
  links: z.array(swarmLinkSchema),
});

// ============================================================================
// AGENT DATA STRUCTURE SCHEMAS
// ============================================================================

/**
 * Schema for agent insights
 */
export const agentInsightSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  type: z.enum(['MARKET', 'SECURITY', 'PERFORMANCE', 'STRATEGIC']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  data: z.record(z.string(), z.unknown()),
  timestamp: z.number(),
});

/**
 * Schema for agent actions
 */
export const agentActionSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  type: z.enum(['BUY', 'SELL', 'DEPLOY', 'ANALYZE', 'ALERT']),
  title: z.string(),
  description: z.string(),
  payload: z.record(z.string(), z.unknown()),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  timestamp: z.number(),
});

/**
 * Schema for operation tasks
 */
export const operationTaskSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']),
  time: z.string(),
  progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
});

/**
 * Schema for pending actions
 */
export const pendingActionSchema = z.object({
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  id: z.string(),
  details: z.string(),
});

// ============================================================================
// API ERROR SCHEMAS
// ============================================================================

/**
 * Schema for API error types
 */
export const apiErrorTypeSchema = z.enum([
  'VALIDATION_ERROR',
  'AUTHENTICATION_ERROR',
  'AUTHORIZATION_ERROR',
  'NOT_FOUND',
  'RATE_LIMIT_EXCEEDED',
  'INTERNAL_SERVER_ERROR',
  'EXTERNAL_SERVICE_ERROR',
  'TIMEOUT_ERROR'
]);

/**
 * Schema for API error details
 */
export const apiErrorDetailsSchema = z.object({
  field: z.string().optional(), // For validation errors
  service: z.string().optional(), // For external service errors
  retryAfter: z.number().optional(), // For rate limit errors
  stack: z.string().optional(), // For internal errors (dev only)
});

/**
 * Schema for API errors
 */
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.number(),
  requestId: z.string().optional(),
});

// ============================================================================
// COMPONENT STATE AND PROPS SCHEMAS
// ============================================================================

/**
 * Schema for control hub props
 */
export const controlHubPropsSchema = z.object({
  onSystemStart: z.function().optional(),
  onSystemPause: z.function().optional(),
  onSystemStop: z.function().optional(),
  onSyncData: z.function().optional(),
  systemStatus: z.enum(['OPTIMAL', 'WARNING', 'CRITICAL']).optional(),
});

/**
 * Schema for polyphase monitor props
 */
export const polyphaseMonitorPropsSchema = z.object({
  initialLogs: z.array(z.string()).optional(),
  refreshInterval: z.number().optional(),
  maxLogEntries: z.number().optional(),
});

/**
 * Schema for swarm hologram props
 */
export const swarmHologramPropsSchema = z.object({
  initialData: swarmGraphDataSchema.optional(),
  onNodeClick: z.function().optional(),
  onLinkClick: z.function().optional(),
  showControls: z.boolean().optional(),
  autoRotate: z.boolean().optional(),
});

/**
 * Schema for swarm consensus visualizer props
 */
export const swarmConsensusVisualizerPropsSchema = z.object({
  autoSimulate: z.boolean().optional(),
  showDetails: z.boolean().optional(),
  refreshInterval: z.number().optional(),
});

/**
 * Schema for operations automation agent props
 */
export const operationsAutomationAgentPropsSchema = z.object({
  initialTasks: z.array(operationTaskSchema).optional(),
  autoApprove: z.boolean().optional(),
  notificationThreshold: z.enum(['MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

/**
 * Schema for icon props
 */
export const iconPropsSchema = z.object({
  size: z.number().optional(),
  className: z.string().optional(),
  color: z.string().optional(),
});

/**
 * Schema for control button props
 */
export const controlButtonPropsSchema = z.object({
  icon: z.custom<React.ComponentType<any>>(), // Can't validate React components with Zod
  label: z.string(),
  color: z.string(),
  borderColor: z.string(),
  onClick: z.function().optional(),
  disabled: z.boolean().optional(),
});

/**
 * Schema for metric box props
 */
export const metricBoxPropsSchema = z.object({
  label: z.string(),
  value: z.string(),
  icon: z.custom<React.ComponentType<any>>(), // Can't validate React components with Zod
  color: z.string(),
  trend: z.enum(['UP', 'DOWN', 'STABLE']).optional(),
});

// ============================================================================
// LOGGING AND AUTH SCHEMAS
// ============================================================================

/**
 * Schema for authentication event metadata
 */
export const authEventMetadataSchema = z.object({
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  location: z.string().optional(),
  deviceId: z.string().optional(),
});

/**
 * Schema for authentication event status
 */
export const authEventStatusSchema = z.enum(['SUCCESS', 'FAILURE']);

// ============================================================================
// LATTICE AND TOPOLOGY SCHEMAS
// ============================================================================

/**
 * Schema for lattice nodes
 */
export const latticeNodeSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  connections: z.array(z.string()),
  data: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for data points
 */
export const dataPointSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  value: z.union([z.number(), z.string()]),
  source: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// UTILITY SCHEMAS
// ============================================================================

/**
 * Schema for generic API response
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: apiErrorSchema.optional(),
  timestamp: z.number(),
});

/**
 * Schema for pagination parameters
 */
export const paginationParamsSchema = z.object({
  page: z.number(),
  limit: z.number(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema for paginated response
 */
export const paginatedResponseSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Helper function to validate data against a schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Helper function to safely validate data against a schema
 * Returns a result object with success status and data or error
 */
export function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

// Export all schemas for easy importing
export {
  // Re-export existing schemas from other files if needed
  // This allows for a single import point for all schemas
};