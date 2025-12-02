/**
 * AIX Session Manager - Manages agent reasoning contexts
 * 
 * This module provides session lifecycle management for sovereign agents,
 * maintaining context across multiple reasoning traces and interactions.
 * Sessions enable agents to maintain state, track progress,
 * and coordinate with other agents in swarm scenarios.
 * 
 * Critical for: Multi-turn conversations, long-running tasks,
 * and swarm coordination where context persistence is essential.
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { z } from 'zod';
import { SessionContext, ReActTrace, ThoughtUnit, AgentAction, AIXMessage } from './schema';

/**
 * Session State - Lifecycle states for agent sessions
 */
export const SessionStateSchema = z.enum([
  'initializing',    // Session being set up
  'active',          // Session is active and processing
  'paused',          // Session temporarily suspended
  'awaiting_input',  // Waiting for user/agent input
  'processing',       // Currently processing a request
  'completed',       // Session successfully completed
  'failed',          // Session failed with error
  'expired',         // Session timed out
  'terminated',      // Session manually terminated
]);

export type SessionState = z.infer<typeof SessionStateSchema>;

/**
 * Session Metadata - Additional session information
 */
export const SessionMetadataSchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  securityLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  maxDuration: z.number().optional().describe('Maximum session duration in ms'),
  timeoutAction: z.enum(['extend', 'complete', 'fail']).default('extend'),
  retryCount: z.number().default(0).describe('Number of retry attempts'),
  tags: z.array(z.string()).default([]).describe('Session categorization tags'),
});

export type SessionMetadata = z.infer<typeof SessionMetadataSchema>;

/**
 * Session Configuration - Session behavior settings
 */
export const SessionConfigSchema = z.object({
  autoSave: z.boolean().default(true).describe('Automatically save session state'),
  autoCleanup: z.boolean().default(true).describe('Automatically cleanup expired sessions'),
  maxThoughts: z.number().default(1000).describe('Maximum thoughts per session'),
  maxActions: z.number().default(500).describe('Maximum actions per session'),
  compressionThreshold: z.number().default(100).describe('Thought count to trigger compression'),
  backupInterval: z.number().default(300000).describe('Backup interval in ms'),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;

/**
 * Session Manager - Core session lifecycle management
 */
export class SessionManager {
  private sessions: Map<string, SessionContext> = new Map();
  private config: SessionConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      autoSave: true,
      autoCleanup: true,
      maxThoughts: 1000,
      maxActions: 500,
      compressionThreshold: 100,
      backupInterval: 300000, // 5 minutes
      ...config,
    };

    // Start cleanup interval
    if (this.config.autoCleanup) {
      this.startCleanupInterval();
    }
  }

  /**
   * Create new session for agent
   */
  createSession(
    primaryAgentId: string,
    goal?: string,
    userId?: string,
    metadata?: Partial<SessionMetadata>
  ): SessionContext {
    const sessionId = uuidv4();
    const now = Date.now();

    const session: SessionContext = {
      id: sessionId,
      primaryAgentId,
      participantAgents: [primaryAgentId],
      userId,
      startTime: now,
      lastActivity: now,
      timeout: this.calculateTimeout(metadata?.priority || 'medium'),
      goal: goal || '',
      context: {},
      traceIds: [],
      activeTraceId: undefined,
      memorySnapshots: [],
      learnedFacts: [],
      status: 'active',
      completedTasks: [],
      securityLevel: metadata?.securityLevel || 'medium',
      requiresApproval: false,
    };

    this.sessions.set(sessionId, session);

    // Auto-save if enabled
    if (this.config.autoSave) {
      this.saveSession(sessionId);
    }

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionContext | undefined {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Update last activity
      session.lastActivity = Date.now();
      
      // Check for timeout
      if (this.isSessionExpired(session)) {
        session.status = 'expired';
        this.terminateSession(sessionId, 'Session expired');
      }
    }

    return session;
  }

  /**
   * Update session context
   */
  updateSession(
    sessionId: string,
    updates: Partial<SessionContext>
  ): SessionContext | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Apply updates
    Object.assign(session, updates);
    session.lastActivity = Date.now();

    // Auto-save if enabled
    if (this.config.autoSave) {
      this.saveSession(sessionId);
    }

    // Check for thought/action limits
    this.enforceSessionLimits(session);

    return session;
  }

  /**
   * Add reasoning trace to session
   */
  addTrace(sessionId: string, trace: ReActTrace): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Validate trace doesn't exceed limits
    if (session.traceIds.length >= this.config.maxThoughts / 10) {
      console.warn(`Session ${sessionId} has too many traces`);
      return null;
    }

    // Set as active trace
    session.activeTraceId = trace.id;
    session.traceIds.push(trace.id);

    // Update session state
    session.status = 'processing';

    // Auto-save
    if (this.config.autoSave) {
      this.saveSession(sessionId);
    }

    return trace.id;
  }

  /**
   * Add participant agent to session
   */
  addParticipant(sessionId: string, agentId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (!session.participantAgents.includes(agentId)) {
      session.participantAgents.push(agentId);
      session.lastActivity = Date.now();

      if (this.config.autoSave) {
        this.saveSession(sessionId);
      }

      return true;
    }

    return false;
  }

  /**
   * Add learned fact to session
   */
  addLearnedFact(sessionId: string, fact: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (!session.learnedFacts.includes(fact)) {
      session.learnedFacts.push(fact);
      session.lastActivity = Date.now();

      if (this.config.autoSave) {
        this.saveSession(sessionId);
      }
    }
  }

  /**
   * Complete session successfully
   */
  completeSession(sessionId: string, conclusion?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'completed';
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    if (conclusion) {
      session.conclusion = conclusion;
    }

    // Final save
    this.saveSession(sessionId);

    return true;
  }

  /**
   * Pause session
   */
  pauseSession(sessionId: string, reason?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = 'paused';
    session.lastActivity = Date.now();

    if (this.config.autoSave) {
      this.saveSession(sessionId);
    }

    return true;
  }

  /**
   * Resume paused session
   */
  resumeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'paused') return false;

    session.status = 'active';
    session.lastActivity = Date.now();

    if (this.config.autoSave) {
      this.saveSession(sessionId);
    }

    return true;
  }

  /**
   * Terminate session with error
   */
  terminateSession(sessionId: string, reason?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = reason ? 'failed' : 'terminated';
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    // Add error to trace if available
    if (reason && session.activeTraceId) {
      // This would typically be handled by the trace management system
      console.warn(`Session ${sessionId} terminated: ${reason}`);
    }

    // Final save
    this.saveSession(sessionId);

    return true;
  }

  /**
   * Get active sessions for agent
   */
  getActiveSessions(agentId: string): SessionContext[] {
    return Array.from(this.sessions.values()).filter(
      session => session.participantAgents.includes(agentId) && 
               ['active', 'processing', 'awaiting_input'].includes(session.status)
    );
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    failedSessions: number;
    averageDuration: number;
    sessionsByAgent: Record<string, number>;
  } {
    const sessions = Array.from(this.sessions.values());
    
    const activeSessions = sessions.filter(s => 
      ['active', 'processing', 'awaiting_input', 'paused'].includes(s.status)
    ).length;

    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const failedSessions = sessions.filter(s => s.status === 'failed').length;

    const durations = sessions
      .filter(s => s.duration !== undefined)
      .map(s => s.duration!);

    const averageDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;

    const sessionsByAgent: Record<string, number> = {};
    for (const session of sessions) {
      for (const agentId of session.participantAgents) {
        sessionsByAgent[agentId] = (sessionsByAgent[agentId] || 0) + 1;
      }
    }

    return {
      totalSessions: sessions.length,
      activeSessions,
      completedSessions,
      failedSessions,
      averageDuration,
      sessionsByAgent,
    };
  }

  /**
   * Save session to persistent storage
   */
  private saveSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // In a real implementation, this would save to database
    // For now, we'll use localStorage for demo purposes
    try {
      const sessionData = {
        ...session,
        savedAt: Date.now(),
        version: '1.0',
      };

      localStorage.setItem(`aix_session_${sessionId}`, JSON.stringify(sessionData));
    } catch (error) {
      console.error(`Failed to save session ${sessionId}:`, error);
    }
  }

  /**
   * Load session from persistent storage
   */
  loadSession(sessionId: string): SessionContext | null {
    try {
      const sessionData = localStorage.getItem(`aix_session_${sessionId}`);
      if (!sessionData) return null;

      const parsed = JSON.parse(sessionData);
      const session = SessionContextSchema.safeParse(parsed);
      
      if (session.success) {
        this.sessions.set(sessionId, session.data);
        return session.data;
      } else {
        console.warn(`Invalid session data for ${sessionId}:`, session.error);
        return null;
      }
    } catch (error) {
      console.error(`Failed to load session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: SessionContext): boolean {
    if (!session.timeout) return false;

    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    
    return timeSinceActivity > session.timeout;
  }

  /**
   * Calculate session timeout based on priority
   */
  private calculateTimeout(priority: string): number {
    const timeouts: Record<string, number> = {
      low: 3600000,      // 1 hour
      medium: 1800000,   // 30 minutes
      high: 900000,      // 15 minutes
      critical: 300000,   // 5 minutes
    };

    return timeouts[priority] || timeouts.medium;
  }

  /**
   * Enforce session limits
   */
  private enforceSessionLimits(session: SessionContext): void {
    // Check thought limit
    const totalThoughts = session.traceIds.reduce((count, traceId) => {
      // This would typically query the trace for thought count
      return count + 50; // Estimate
    }, 0);

    if (totalThoughts > this.config.maxThoughts) {
      console.warn(`Session ${session.id} exceeds thought limit`);
    }

    // Check action limit
    const totalActions = session.traceIds.length * 10; // Estimate
    if (totalActions > this.config.maxActions) {
      console.warn(`Session ${session.id} exceeds action limit`);
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.config.backupInterval);
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      if (this.isSessionExpired(session)) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.terminateSession(sessionId, 'Session expired due to inactivity');
      this.sessions.delete(sessionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  /**
   * Destroy session manager and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Save all active sessions
    for (const sessionId of this.sessions.keys()) {
      this.saveSession(sessionId);
    }

    this.sessions.clear();
  }
}

/**
 * Session Utils - Utility functions for session management
 */
export class SessionUtils {
  /**
   * Create session from AIX message
   */
  static createSessionFromMessage(
    message: AIXMessage,
    primaryAgentId: string
  ): SessionContext | null {
    if (message.type !== 'session_init') return null;

    try {
      const sessionData = {
        id: uuidv4(),
        primaryAgentId,
        participantAgents: [primaryAgentId],
        userId: message.payload.userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        goal: message.payload.goal,
        context: message.payload.context || {},
        traceIds: [],
        memorySnapshots: [],
        learnedFacts: [],
        status: 'active' as const,
        completedTasks: [],
        securityLevel: message.payload.securityLevel || 'medium',
        requiresApproval: message.payload.requiresApproval || false,
      };

      return SessionContextSchema.parse(sessionData);
    } catch (error) {
      console.error('Failed to create session from message:', error);
      return null;
    }
  }

  /**
   * Generate session summary
   */
  static generateSessionSummary(session: SessionContext): string {
    const duration = session.endTime 
      ? `${Math.round((session.endTime - session.startTime) / 1000)}s`
      : 'active';

    const participantCount = session.participantAgents.length;
    const traceCount = session.traceIds.length;
    const factCount = session.learnedFacts.length;

    return `Session ${session.id.substring(0, 8)}: ${session.status} ` +
           `(${duration}, ${participantCount} agents, ${traceCount} traces, ${factCount} facts)`;
  }

  /**
   * Check session health
   */
  static checkSessionHealth(session: SessionContext): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for timeout
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    if (session.timeout && timeSinceActivity > session.timeout * 0.8) {
      issues.push('Session approaching timeout');
      recommendations.push('Extend session timeout or add user interaction');
    }

    // Check for excessive duration
    if (session.duration && session.duration > 3600000) { // 1 hour
      issues.push('Session running too long');
      recommendations.push('Consider breaking into smaller sessions');
    }

    // Check for too many participants
    if (session.participantAgents.length > 10) {
      issues.push('Too many participants');
      recommendations.push('Consider splitting into multiple sessions');
    }

    // Check for memory usage
    if (session.traceIds.length > 100) {
      issues.push('High memory usage');
      recommendations.push('Enable session compression');
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
    };
  }
}