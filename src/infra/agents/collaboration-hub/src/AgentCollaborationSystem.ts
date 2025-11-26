/**
 * 🧠 THE HIVE MIND - Integrated Collaboration System
 * 
 * Core collaboration logic integrated with Durable Object for persistence
 * Handles session management, task delegation, and agent coordination
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import {
  CollaborationSession,
  CollaborationTask,
  AgentTeam,
  KnowledgeEntry,
  AgentReputation,
  ConflictResolution,
  AuditTrail,
  IncentiveSystem,
  CollaborationConfig,
  CollaborationMessage,
  AgentResponse,
  AXIOM_AGENT_REGISTRY,
  PRIORITY_ESCALATION_RULES
} from "../../../types/collaboration";

export class AgentCollaborationSystem {
  private sessions: Map<string, CollaborationSession> = new Map();
  private tasks: Map<string, CollaborationTask> = new Map();
  private teams: Map<string, AgentTeam> = new Map();
  private knowledge: Map<string, KnowledgeEntry> = new Map();
  private reputation: Map<string, AgentReputation> = new Map();
  private auditTrail: AuditTrail[] = [];
  private incentives: Map<string, IncentiveSystem> = new Map();
  private messageQueue: Map<string, CollaborationMessage[]> = new Map();
  
  constructor(
    private env: any, // Cloudflare Workers environment
    private config: CollaborationConfig = {}
  ) {
    this.initializeDefaultSettings();
    this.initializeAgentReputations();
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Create a new collaboration session
   */
  async createSession(
    name: string,
    description: string,
    leader: string,
    participants: string[],
    type: 'realtime' | 'asynchronous' | 'hybrid' = 'hybrid'
  ): Promise<CollaborationSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborationSession = {
      id: sessionId,
      missionName: name,
      participants: [leader, ...participants],
      status: 'ACTIVE',
      sharedMemory: {},
      logs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      leader,
      objectives: [],
      resources: {
        allocated: {},
        used: {}
      }
    };

    this.sessions.set(sessionId, session);
    
    // Save to D1 database
    await this.saveSessionToDB(session);
    
    // Log to audit trail
    await this.logAudit({
      agentId: leader,
      action: 'create_session',
      target: sessionId,
      details: { name, participants, type },
      severity: 'info'
    });

    console.log(`🚀 Session created: ${name} by ${leader}`);
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'ACTIVE');
  }

  // ============================================================================
  // TASK MANAGEMENT
  // ============================================================================

  /**
   * Create and delegate a collaboration task
   */
  async createTask(
    sessionId: string,
    title: string,
    description: string,
    assignedTo: string[],
    assignedBy: string,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): Promise<CollaborationTask> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: CollaborationTask = {
      id: taskId,
      sessionId,
      title,
      description,
      assignedTo,
      assignedBy,
      status: 'pending',
      priority: priority.toUpperCase() as any,
      dependencies: [],
      requirements: [],
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.tasks.set(taskId, task);
    
    // Save to D1 database
    await this.saveTaskToDB(task);
    
    // Log to audit trail
    await this.logAudit({
      sessionId,
      agentId: assignedBy,
      action: 'create_task',
      target: taskId,
      details: { title, assignedTo, priority },
      severity: 'info'
    });

    console.log(`📋 Task created: ${title} assigned to ${assignedTo.join(', ')}`);
    return task;
  }

  /**
   * Update task progress
   */
  async updateTaskProgress(
    taskId: string,
    progress: number,
    agentId: string
  ): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || !task.assignedTo.includes(agentId)) {
      return false;
    }

    task.progress = Math.max(0, Math.min(100, progress));
    task.updatedAt = Date.now();
    
    if (task.progress === 100) {
      task.status = 'completed';
    } else if (task.progress > 0) {
      task.status = 'in_progress';
    }

    this.tasks.set(taskId, task);
    
    // Update in D1 database
    await this.updateTaskInDB(task);
    
    // Update agent reputation
    await this.updateReputation(agentId, 'collaboration', 2);

    return true;
  }

  /**
   * Get tasks for session
   */
  getSessionTasks(sessionId: string): CollaborationTask[] {
    return Array.from(this.tasks.values()).filter(t => t.sessionId === sessionId);
  }

  // ============================================================================
  // TEAM MANAGEMENT
  // ============================================================================

  /**
   * Create a new agent team
   */
  async createTeam(
    name: string,
    description: string,
    leader: string,
    type: 'permanent' | 'temporary' | 'project' = 'permanent'
  ): Promise<AgentTeam> {
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const team: AgentTeam = {
      id: teamId,
      name,
      description,
      type,
      status: 'active',
      leader,
      members: [{
        agentId: leader,
        role: 'leader',
        permissions: ['all'],
        status: 'active',
        joinedAt: Date.now(),
        lastActive: Date.now(),
        contributions: 0,
        reputation: 100
      }],
      roles: this.getDefaultRoles(),
      hierarchy: this.getDefaultHierarchy(),
      resources: {
        budget: 10000,
        allocated: {},
        used: {},
        efficiency: 100,
        lastOptimized: Date.now()
      },
      performance: {
        productivity: 100,
        quality: 100,
        collaboration: 100,
        innovation: 100,
        efficiency: 100,
        satisfaction: 100,
        tasksCompleted: 0,
        averageResponseTime: 100,
        successRate: 100,
        lastUpdated: Date.now()
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.teams.set(teamId, team);
    
    // Save to D1 database
    await this.saveTeamToDB(team);
    
    // Log to audit trail
    await this.logAudit({
      teamId: team.id,
      agentId: leader,
      action: 'create_team',
      details: { name, type },
      severity: 'info'
    });

    console.log(`👥 Team created: ${name} led by ${leader}`);
    return team;
  }

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    agentId: string,
    role: string = 'member'
  ): Promise<boolean> {
    const team = this.teams.get(teamId);
    if (!team) {
      return false;
    }

    const member = {
      agentId,
      role,
      permissions: this.getRolePermissions(role),
      status: 'active' as const,
      joinedAt: Date.now(),
      lastActive: Date.now(),
      contributions: 0,
      reputation: 50
    };

    team.members.push(member);
    team.updatedAt = Date.now();
    this.teams.set(teamId, team);
    
    // Update in D1 database
    await this.updateTeamInDB(team);
    
    // Log to audit trail
    await this.logAudit({
      teamId,
      agentId,
      action: 'add_team_member',
      details: { role },
      severity: 'info'
    });

    return true;
  }

  // ============================================================================
  // KNOWLEDGE SHARING
  // ============================================================================

  /**
   * Share knowledge in collaboration session
   */
  async shareKnowledge(
    sessionId: string,
    contributorId: string,
    type: 'skill' | 'experience' | 'data' | 'pattern' | 'solution',
    title: string,
    content: any,
    tags: string[] = []
  ): Promise<KnowledgeEntry> {
    const knowledgeId = `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const knowledge: KnowledgeEntry = {
      id: knowledgeId,
      sessionId,
      contributorId,
      type,
      title,
      content,
      tags,
      quality: 75,
      usefulness: 75,
      verification: 'pending',
      timestamp: Date.now(),
      accessCount: 0,
      sharedWith: []
    };

    this.knowledge.set(knowledgeId, knowledge);
    
    // Save to D1 database
    await this.saveKnowledgeToDB(knowledge);
    
    // Update contributor reputation
    await this.updateReputation(contributorId, 'knowledge', 5);
    
    // Log to audit trail
    await this.logAudit({
      sessionId,
      agentId: contributorId,
      action: 'share_knowledge',
      details: { type, title, tags },
      severity: 'info'
    });

    console.log(`💡 Knowledge shared: ${title} by ${contributorId}`);
    return knowledge;
  }

  /**
   * Get knowledge entries for session
   */
  getSessionKnowledge(sessionId: string): KnowledgeEntry[] {
    return Array.from(this.knowledge.values()).filter(k => k.sessionId === sessionId);
  }

  // ============================================================================
  // REPUTATION SYSTEM
  // ============================================================================

  /**
   * Get agent reputation
   */
  getReputation(agentId: string): AgentReputation | null {
    return this.reputation.get(agentId) || null;
  }

  /**
   * Update agent reputation
   */
  async updateReputation(
    agentId: string,
    category: keyof Omit<AgentReputation, 'agentId' | 'lastUpdated'>,
    change: number
  ): Promise<void> {
    const current = this.reputation.get(agentId) || {
      agentId,
      overall: 50,
      collaboration: 50,
      reliability: 50,
      knowledge: 50,
      leadership: 50,
      innovation: 50,
      contributions: 0,
      disputes: 0,
      resolvedDisputes: 0,
      lastUpdated: Date.now()
    };

    current[category] = Math.max(0, Math.min(100, current[category] + change));
    current.overall = (
      current.collaboration + 
      current.reliability + 
      current.knowledge + 
      current.leadership + 
      current.innovation
    ) / 5;
    current.lastUpdated = Date.now();

    this.reputation.set(agentId, current);
    
    // Update in D1 database
    await this.updateReputationInDB(current);
  }

  // ============================================================================
  // MESSAGE ROUTING
  // ============================================================================

  /**
   * Route collaboration message between agents
   */
  async routeMessage(message: CollaborationMessage): Promise<void> {
    // Add to session logs
    if (message.sessionId) {
      const session = this.sessions.get(message.sessionId);
      if (session) {
        session.logs.push(message);
        session.updatedAt = Date.now();
        this.sessions.set(message.sessionId, session);
      }
    }

    // Check for priority escalation
    if (message.priority === 'CRITICAL') {
      await this.handleEscalation(message);
    }

    // Queue message for delivery
    const queue = this.messageQueue.get(message.targetId === 'BROADCAST' ? 'BROADCAST' : message.targetId) || [];
    queue.push(message);
    this.messageQueue.set(message.targetId === 'BROADCAST' ? 'BROADCAST' : message.targetId, queue);

    console.log(`📨 Message routed: ${message.senderId} → ${message.targetId}`);
  }

  /**
   * Get queued messages for agent
   */
  getQueuedMessages(agentId: string): CollaborationMessage[] {
    const messages = this.messageQueue.get(agentId) || [];
    this.messageQueue.delete(agentId);
    return messages;
  }

  /**
   * Handle critical message escalation
   */
  private async handleEscalation(message: CollaborationMessage): Promise<void> {
    const escalationRule = PRIORITY_ESCALATION_RULES[message.priority];
    if (!escalationRule?.autoEscalate) return;

    // Log escalation
    await this.logAudit({
      sessionId: message.sessionId,
      agentId: message.senderId,
      action: 'message_escalation',
      target: message.targetId,
      details: { priority: message.priority, content: message.content },
      severity: 'high'
    });

    console.log(`🚨 CRITICAL escalation: ${message.senderId} → ${message.targetId}`);
  }

  // ============================================================================
  // DATABASE OPERATIONS
  // ============================================================================

  /**
   * Save session to D1 database
   */
  private async saveSessionToDB(session: CollaborationSession): Promise<void> {
    try {
      const stmt = this.env.DB.prepare(`
        INSERT OR REPLACE INTO collab_sessions 
        (id, name, type, status, leader_id, participants, objectives, settings, resources, shared_memory, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await stmt.bind(
        session.id,
        session.missionName,
        'hybrid',
        session.status,
        session.leader,
        JSON.stringify(session.participants),
        JSON.stringify(session.objectives),
        JSON.stringify({}),
        JSON.stringify(session.resources),
        JSON.stringify(session.sharedMemory),
        new Date(session.createdAt).toISOString(),
        new Date(session.updatedAt).toISOString()
      ).run();
    } catch (error) {
      console.error('Error saving session to DB:', error);
    }
  }

  /**
   * Save task to D1 database
   */
  private async saveTaskToDB(task: CollaborationTask): Promise<void> {
    try {
      const stmt = this.env.DB.prepare(`
        INSERT OR REPLACE INTO collab_tasks 
        (id, session_id, title, description, assigned_to, assigned_by, status, priority, progress, dependencies, requirements, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await stmt.bind(
        task.id,
        task.sessionId,
        task.title,
        task.description,
        JSON.stringify(task.assignedTo),
        task.assignedBy,
        task.status,
        task.priority,
        task.progress,
        JSON.stringify(task.dependencies),
        JSON.stringify(task.requirements),
        new Date(task.createdAt).toISOString(),
        new Date(task.updatedAt).toISOString()
      ).run();
    } catch (error) {
      console.error('Error saving task to DB:', error);
    }
  }

  /**
   * Save team to D1 database
   */
  private async saveTeamToDB(team: AgentTeam): Promise<void> {
    try {
      const stmt = this.env.DB.prepare(`
        INSERT OR REPLACE INTO agent_teams 
        (id, name, description, type, status, leader_id, members, roles, hierarchy, resources, performance, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await stmt.bind(
        team.id,
        team.name,
        team.description,
        team.type,
        team.status,
        team.leader,
        JSON.stringify(team.members),
        JSON.stringify(team.roles),
        JSON.stringify(team.hierarchy),
        JSON.stringify(team.resources),
        JSON.stringify(team.performance),
        new Date(team.createdAt).toISOString(),
        new Date(team.updatedAt).toISOString()
      ).run();
    } catch (error) {
      console.error('Error saving team to DB:', error);
    }
  }

  /**
   * Save knowledge to D1 database
   */
  private async saveKnowledgeToDB(knowledge: KnowledgeEntry): Promise<void> {
    try {
      const stmt = this.env.DB.prepare(`
        INSERT OR REPLACE INTO swarm_knowledge 
        (id, session_id, contributor_id, type, title, content, tags, quality_score, usefulness_score, verification_status, access_count, shared_with, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await stmt.bind(
        knowledge.id,
        knowledge.sessionId,
        knowledge.contributorId,
        knowledge.type,
        knowledge.title,
        JSON.stringify(knowledge.content),
        JSON.stringify(knowledge.tags),
        knowledge.quality,
        knowledge.usefulness,
        knowledge.verification,
        knowledge.accessCount,
        JSON.stringify(knowledge.sharedWith),
        new Date(knowledge.timestamp).toISOString(),
        new Date(knowledge.timestamp).toISOString()
      ).run();
    } catch (error) {
      console.error('Error saving knowledge to DB:', error);
    }
  }

  /**
   * Update task in D1 database
   */
  private async updateTaskInDB(task: CollaborationTask): Promise<void> {
    try {
      const stmt = this.env.DB.prepare(`
        UPDATE collab_tasks 
        SET status = ?, progress = ?, updated_at = ?
        WHERE id = ?
      `);
      
      await stmt.bind(
        task.status,
        task.progress,
        new Date(task.updatedAt).toISOString(),
        task.id
      ).run();
    } catch (error) {
      console.error('Error updating task in DB:', error);
    }
  }

  /**
   * Update team in D1 database
   */
  private async updateTeamInDB(team: AgentTeam): Promise<void> {
    try {
      const stmt = this.env.DB.prepare(`
        UPDATE agent_teams 
        SET members = ?, performance = ?, updated_at = ?
        WHERE id = ?
      `);
      
      await stmt.bind(
        JSON.stringify(team.members),
        JSON.stringify(team.performance),
        new Date(team.updatedAt).toISOString(),
        team.id
      ).run();
    } catch (error) {
      console.error('Error updating team in DB:', error);
    }
  }

  /**
   * Update reputation in D1 database
   */
  private async updateReputationInDB(reputation: AgentReputation): Promise<void> {
    try {
      const stmt = this.env.DB.prepare(`
        INSERT OR REPLACE INTO agent_reputation 
        (agent_id, overall_score, collaboration_score, reliability_score, knowledge_score, leadership_score, innovation_score, contributions, disputes, resolved_disputes, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await stmt.bind(
        reputation.agentId,
        reputation.overall,
        reputation.collaboration,
        reputation.reliability,
        reputation.knowledge,
        reputation.leadership,
        reputation.innovation,
        reputation.contributions,
        reputation.disputes,
        reputation.resolvedDisputes,
        new Date(reputation.lastUpdated).toISOString()
      ).run();
    } catch (error) {
      console.error('Error updating reputation in DB:', error);
    }
  }

  // ============================================================================
  // AUDIT TRAIL
  // ============================================================================

  /**
   * Log activity to audit trail
   */
  private async logAudit(entry: Omit<AuditTrail, 'id' | 'timestamp'>): Promise<void> {
    const audit: AuditTrail = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...entry
    };

    this.auditTrail.push(audit);

    // Save to D1 database
    try {
      const stmt = this.env.DB.prepare(`
        INSERT INTO audit_trail 
        (id, session_id, team_id, agent_id, action, target, details, severity, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await stmt.bind(
        audit.id,
        audit.sessionId,
        audit.teamId,
        audit.agentId,
        audit.action,
        audit.target,
        JSON.stringify(audit.details),
        audit.severity,
        new Date(audit.timestamp).toISOString()
      ).run();
    } catch (error) {
      console.error('Error saving audit trail to DB:', error);
    }

    // Keep audit trail size manageable
    if (this.auditTrail.length > 10000) {
      this.auditTrail = this.auditTrail.slice(-5000);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get default team roles
   */
  private getDefaultRoles(): any[] {
    return [
      {
        id: 'leader',
        name: 'Team Leader',
        description: 'Leads team and makes final decisions',
        permissions: ['all'],
        hierarchy: 1,
        responsibilities: ['coordination', 'decision_making', 'resource_allocation'],
        requiredSkills: ['leadership', 'communication']
      },
      {
        id: 'member',
        name: 'Team Member',
        description: 'Regular team participant',
        permissions: ['participate', 'contribute', 'collaborate'],
        hierarchy: 2,
        responsibilities: ['task_execution', 'knowledge_sharing'],
        requiredSkills: ['collaboration']
      }
    ];
  }

  /**
   * Get default team hierarchy
   */
  private getDefaultHierarchy(): any {
    return {
      levels: 2,
      structure: {
        'leader': ['member'],
        'member': []
      },
      reporting: {}
    };
  }

  /**
   * Get permissions for a specific role
   */
  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      'leader': ['all'],
      'member': ['participate', 'contribute', 'collaborate'],
      'observer': ['view', 'read']
    };
    return permissions[role] || [];
  }

  /**
   * Initialize default system settings
   */
  private initializeDefaultSettings(): void {
    this.config = {
      maxSessions: 100,
      maxParticipantsPerSession: 50,
      defaultEncryptionLevel: 'advanced',
      auditRetentionDays: 90,
      reputationDecayRate: 0.01,
      enableIncentives: true,
      enableSkillSharing: true,
      enableRealTimeCollaboration: true,
      ...this.config
    };
  }

  /**
   * Initialize agent reputations from registry
   */
  private initializeAgentReputations(): void {
    Object.keys(AXIOM_AGENT_REGISTRY).forEach(agentId => {
      this.reputation.set(agentId, {
        agentId,
        overall: 75,
        collaboration: 75,
        reliability: 75,
        knowledge: 75,
        leadership: 50,
        innovation: 75,
        contributions: 0,
        disputes: 0,
        resolvedDisputes: 0,
        lastUpdated: Date.now()
      });
    });
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get system statistics
   */
  getSystemStats(): {
    activeSessions: number;
    totalTeams: number;
    totalTasks: number;
    totalKnowledge: number;
    activeAgents: number;
    averageReputation: number;
  } {
    const activeSessions = this.getActiveSessions().length;
    const totalTeams = this.teams.size;
    const totalTasks = this.tasks.size;
    const totalKnowledge = this.knowledge.size;
    const activeAgents = new Set([
      ...Array.from(this.sessions.values()).flatMap(s => s.participants),
      ...Array.from(this.teams.values()).flatMap(t => t.members.map(m => m.agentId))
    ]).size;
    
    const reputations = Array.from(this.reputation.values());
    const averageReputation = reputations.length > 0 
      ? reputations.reduce((sum, r) => sum + r.overall, 0) / reputations.length 
      : 0;

    return {
      activeSessions,
      totalTeams,
      totalTasks,
      totalKnowledge,
      activeAgents,
      averageReputation
    };
  }

  /**
   * Get all teams
   */
  getTeams(): AgentTeam[] {
    return Array.from(this.teams.values());
  }

  /**
   * Get team by ID
   */
  getTeam(teamId: string): AgentTeam | null {
    return this.teams.get(teamId) || null;
  }
}

export default AgentCollaborationSystem;