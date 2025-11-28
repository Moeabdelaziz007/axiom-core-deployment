/**
 * 📊 AgentPerformanceMetrics
 * Defines the standardized structure for tracking an agent's operational metrics, 
 * performance, and resource consumption across the Quantum Command Center.
 */
export interface AgentPerformanceMetrics {
    /** The unique ID of the agent instance (e.g., 'OAA-101', 'MAA-205') */
    instanceId: string;
    /** The agent's functional name (e.g., 'ATA-Optimizer', 'Narrative-Generator') */
    agentName: string;
    /** The unique identifier of the task or mission being executed */
    missionId: string;

    // --- Timing and Latency ---
    /** Timestamp when the task started (ISO 8601 string) */
    startTime: string;
    /** Timestamp when the task ended (ISO 8601 string) */
    endTime: string;
    /** Total execution time in milliseconds */
    latencyMs: number;

    // --- Resource Consumption ---
    /** Cost incurred from external LLM API calls (e.g., Gemini, OpenAI) in USD */
    llmCostUsd: number;
    /** Number of tokens used for processing (input + output) */
    tokensConsumed: number;
    /** CPU cycles or compute units used (relevant for Edge Workers) */
    computeUnitsUsed?: number;

    // --- Operational Status ---
    /** Final status of the operation */
    status: 'SUCCESS' | 'FAILURE' | 'ROLLBACK' | 'BLOCKED';
    /** Confidence score of the final decision (e.g., SaRO gate confidence) */
    confidenceScore?: number;
    /** Unique Tenant ID for isolation and billing purposes */
    tenantId: string;
}

/**
 * Helper to ensure consistent naming across systems.
 */
export type MetricKey = keyof AgentPerformanceMetrics;
