/**
 * 🧠 THE HIVE MIND - Integrated Collaboration Hub
 * 
 * Durable Object that integrates AgentCollaborationSystem for real-time collaboration
 * Handles WebSocket connections, message routing, and persistence
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { DurableObject } from "cloudflare:workers";
import {
  CollaborationMessage,
  CollaborationSession,
  CollaborationTask,
  AgentTeam,
  KnowledgeEntry,
  AgentResponse,
  CollaborationEvent,
  AXIOM_AGENT_REGISTRY,
  COLLABORATION_ROUTING_RULES,
  PRIORITY_ESCALATION_RULES
} from "../../../types/collaboration";
import { AgentCollaborationSystem } from "./AgentCollaborationSystem";

export class CollaborationHub extends DurableObject<Env> {
  private system: AgentCollaborationSystem;
  private connectedAgents: Map<string, WebSocket> = new Map();
  private messageQueue: Map<string, CollaborationMessage[]> = new Map();
  
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    
    // Initialize the collaboration system
    this.system = new AgentCollaborationSystem(env, {
      maxSessions: 100,
      maxParticipantsPerSession: 50,
      defaultEncryptionLevel: 'advanced',
      auditRetentionDays: 90,
      enableIncentives: true,
      enableSkillSharing: true,
      enableRealTimeCollaboration: true
    });
    
    // Load persisted state
    this.ctx.blockConcurrencyWhile(async () => {
      await this.loadPersistedState();
    });

    console.log(`🐝 Collaboration Hub initialized with integrated system`);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. WebSocket connection for real-time agent communication
      if (path === "/connect") {
        const upgradeHeader = request.headers.get("Upgrade");
        if (upgradeHeader !== "websocket") {
          return new Response("Expected websocket", { status: 400 });
        }

        const [client, server] = Object.values(new WebSocketPair());
        this.handleAgentConnection(server, url.searchParams.get("agentId") || "anonymous");
        
        return new Response(null, {
          status: 101,
          webSocket: client,
        });
      }

      // 2. Create collaboration session
      if (path === "/session/create" && request.method === "POST") {
        const body = await request.json();
        const session = await this.system.createSession(
          body.name, 
          body.description, 
          body.leader, 
          body.participants,
          body.type
        );
        
        // Notify participants
        this.broadcastToAgents(body.participants, {
          type: 'SESSION_CREATED',
          session,
          timestamp: Date.now()
        });
        
        return Response.json({
          sessionId: session.id,
          status: 'CREATED',
          participants: session.participants.length
        });
      }

      // 3. Delegate task to agents
      if (path === "/task/delegate" && request.method === "POST") {
        const body = await request.json();
        const task = await this.system.createTask(
          body.sessionId,
          body.title,
          body.description,
          body.assignedTo,
          body.assignedBy,
          body.priority
        );
        
        // Send real-time notification to assigned agents
        this.broadcastToAgents(body.assignedTo, {
          type: 'NEW_TASK',
          task,
          timestamp: Date.now()
        });
        
        return Response.json({
          taskId: task.id,
          status: 'DELEGATED',
          assignedTo: body.assignedTo.length
        });
      }

      // 4. Send collaboration message
      if (path === "/message/send" && request.method === "POST") {
        const message: CollaborationMessage = await request.json();
        
        // Route message through the system
        await this.system.routeMessage(message);
        
        // Real-time delivery to connected agents
        if (message.targetId === 'BROADCAST') {
          this.broadcastToAgents(Array.from(this.connectedAgents.keys()), {
            type: 'INCOMING_MESSAGE',
            message,
            timestamp: Date.now()
          });
        } else {
          const targetWs = this.connectedAgents.get(message.targetId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: 'INCOMING_MESSAGE',
              message,
              timestamp: Date.now()
            }));
          } else {
            // Queue for offline agent
            this.queueMessage(message);
          }
        }
        
        return Response.json({ 
          messageId: message.id,
          status: 'SENT',
          routedTo: message.targetId === 'BROADCAST' ? 'ALL' : message.targetId
        });
      }

      // 5. Update task progress
      if (path === "/task/progress" && request.method === "POST") {
        const body = await request.json();
        const success = await this.system.updateTaskProgress(
          body.taskId,
          body.progress,
          body.agentId
        );
        
        if (success) {
          // Notify session participants
          const task = this.system.getSessionTasks(body.sessionId || '')?.find(t => t.id === body.taskId);
          if (task) {
            this.broadcastToAgents(task.assignedTo, {
              type: 'TASK_PROGRESS_UPDATED',
              taskId: body.taskId,
              progress: body.progress,
              timestamp: Date.now()
            });
          }
        }
        
        return Response.json({ 
          success,
          taskId: body.taskId,
          progress: body.progress
        });
      }

      // 6. Create team
      if (path === "/team/create" && request.method === "POST") {
        const body = await request.json();
        const team = await this.system.createTeam(
          body.name,
          body.description,
          body.leader,
          body.type
        );
        
        return Response.json({
          teamId: team.id,
          status: 'CREATED',
          leader: body.leader
        });
      }

      // 7. Add team member
      if (path === "/team/member/add" && request.method === "POST") {
        const body = await request.json();
        const success = await this.system.addTeamMember(
          body.teamId,
          body.agentId,
          body.role
        );
        
        if (success) {
          // Notify team members
          const team = this.system.getTeam(body.teamId);
          if (team) {
            this.broadcastToAgents(team.members.map(m => m.agentId), {
              type: 'TEAM_MEMBER_ADDED',
              teamId: body.teamId,
              agentId: body.agentId,
              role: body.role,
              timestamp: Date.now()
            });
          }
        }
        
        return Response.json({ 
          success,
          teamId: body.teamId,
          agentId: body.agentId
        });
      }

      // 8. Share knowledge
      if (path === "/knowledge/share" && request.method === "POST") {
        const body = await request.json();
        const knowledge = await this.system.shareKnowledge(
          body.sessionId,
          body.contributorId,
          body.type,
          body.title,
          body.content,
          body.tags
        );
        
        // Notify session participants
        const session = this.system.getSession(body.sessionId);
        if (session) {
          this.broadcastToAgents(session.participants, {
            type: 'KNOWLEDGE_SHARED',
            knowledge,
            timestamp: Date.now()
          });
        }
        
        return Response.json({
          knowledgeId: knowledge.id,
          status: 'SHARED',
          sessionId: body.sessionId
        });
      }

      // 9. Get session status
      if (path === "/session/status" && request.method === "GET") {
        const sessionId = url.searchParams.get("sessionId");
        if (!sessionId) {
          return new Response("Session ID required", { status: 400 });
        }

        const session = this.system.getSession(sessionId);
        if (!session) {
          return new Response("Session not found", { status: 404 });
        }

        const tasks = this.system.getSessionTasks(sessionId);
        const knowledge = this.system.getSessionKnowledge(sessionId);

        return Response.json({
          session,
          tasks,
          knowledge,
          connectedAgents: Array.from(this.connectedAgents.keys()),
          messageQueue: this.messageQueue.get(sessionId)?.length || 0
        });
      }

      // 10. Get agent capabilities
      if (path === "/agent/capabilities" && request.method === "GET") {
        const agentId = url.searchParams.get("agentId");
        if (!agentId) {
          return new Response("Agent ID required", { status: 400 });
        }

        const capabilities = AXIOM_AGENT_REGISTRY[agentId];
        const reputation = this.system.getReputation(agentId);

        return Response.json({ 
          agentId, 
          capabilities: capabilities || [],
          reputation: reputation || {
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
          }
        });
      }

      // 11. Get system statistics
      if (path === "/stats" && request.method === "GET") {
        const stats = this.system.getSystemStats();
        const activeConnections = this.connectedAgents.size;
        const queuedMessages = Array.from(this.messageQueue.values())
          .reduce((sum, queue) => sum + queue.length, 0);

        return Response.json({
          ...stats,
          activeConnections,
          queuedMessages,
          uptime: Date.now()
        });
      }

      // 12. Get team information
      if (path === "/team/info" && request.method === "GET") {
        const teamId = url.searchParams.get("teamId");
        if (!teamId) {
          return new Response("Team ID required", { status: 400 });
        }

        const team = this.system.getTeam(teamId);
        if (!team) {
          return new Response("Team not found", { status: 404 });
        }

        return Response.json({ team });
      }

      // 13. Health check
      if (path === "/health") {
        const stats = this.system.getSystemStats();
        return Response.json({
          status: 'healthy',
          uptime: Date.now(),
          ...stats,
          connectedAgents: this.connectedAgents.size,
          messageQueueSize: Array.from(this.messageQueue.values())
            .reduce((sum, queue) => sum + queue.length, 0)
        });
      }

      return new Response("Collaboration Hub Active", { status: 200 });

    } catch (error) {
      console.error("Error in Collaboration Hub fetch:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  /**
   * Handle WebSocket connection from agents
   */
  private handleAgentConnection(ws: WebSocket, agentId: string): void {
    this.connectedAgents.set(agentId, ws);
    
    ws.accept();
    
    console.log(`🔌 Agent connected: ${agentId}`);
    
    // Send welcome message with capabilities
    ws.send(JSON.stringify({
      type: 'CONNECTION_ESTABLISHED',
      agentId,
      timestamp: Date.now(),
      capabilities: AXIOM_AGENT_REGISTRY[agentId] || [],
      reputation: this.system.getReputation(agentId),
      systemStats: this.system.getSystemStats()
    }));

    // Send queued messages
    const queuedMessages = this.messageQueue.get(agentId) || [];
    if (queuedMessages.length > 0) {
      ws.send(JSON.stringify({
        type: 'QUEUED_MESSAGES',
        messages: queuedMessages,
        timestamp: Date.now()
      }));
      this.messageQueue.delete(agentId);
    }

    ws.addEventListener("message", async (event) => {
      try {
        const data = JSON.parse(event.data as string);
        
        if (data.type === 'AGENT_MESSAGE') {
          await this.system.routeMessage(data.payload);
        } else if (data.type === 'HEARTBEAT') {
          ws.send(JSON.stringify({ 
            type: 'PONG', 
            timestamp: Date.now(),
            agentId 
          }));
        } else if (data.type === 'CAPABILITY_UPDATE') {
          // Handle capability updates
          console.log(`Capability update from ${agentId}:`, data.capabilities);
        } else if (data.type === 'STATUS_UPDATE') {
          // Handle agent status updates
          console.log(`Status update from ${agentId}:`, data.status);
        }
      } catch (error) {
        console.error(`Error processing message from ${agentId}:`, error);
      }
    });

    ws.addEventListener("close", () => {
      this.connectedAgents.delete(agentId);
      console.log(`🔌 Agent disconnected: ${agentId}`);
      
      // Notify other agents
      this.broadcastToAgents(Array.from(this.connectedAgents.keys()), {
        type: 'AGENT_DISCONNECTED',
        agentId,
        timestamp: Date.now()
      });
    });

    ws.addEventListener("error", (error) => {
      console.error(`WebSocket error for ${agentId}:`, error);
      this.connectedAgents.delete(agentId);
    });
  }

  /**
   * Broadcast message to specific agents
   */
  private broadcastToAgents(agentIds: string[], data: any): void {
    const message = JSON.stringify(data);
    
    agentIds.forEach(agentId => {
      const ws = this.connectedAgents.get(agentId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Queue message for offline agents
   */
  private queueMessage(message: CollaborationMessage): void {
    if (message.targetId === 'BROADCAST') return;

    const queue = this.messageQueue.get(message.targetId) || [];
    queue.push(message);
    this.messageQueue.set(message.targetId, queue);
  }

  /**
   * Load persisted state from storage
   */
  private async loadPersistedState(): Promise<void> {
    try {
      // Load sessions
      const sessions = await this.ctx.storage.get<CollaborationSession[]>("sessions");
      if (sessions) {
        sessions.forEach(session => {
          this.system.sessions.set(session.id, session);
        });
      }

      // Load teams
      const teams = await this.ctx.storage.get<AgentTeam[]>("teams");
      if (teams) {
        teams.forEach(team => {
          this.system.teams.set(team.id, team);
        });
      }

      // Load tasks
      const tasks = await this.ctx.storage.get<CollaborationTask[]>("tasks");
      if (tasks) {
        tasks.forEach(task => {
          this.system.tasks.set(task.id, task);
        });
      }

      // Load knowledge
      const knowledge = await this.ctx.storage.get<KnowledgeEntry[]>("knowledge");
      if (knowledge) {
        knowledge.forEach(entry => {
          this.system.knowledge.set(entry.id, entry);
        });
      }

      console.log(`📂 Loaded persisted state: ${sessions?.length || 0} sessions, ${teams?.length || 0} teams, ${tasks?.length || 0} tasks`);
    } catch (error) {
      console.error("Error loading persisted state:", error);
    }
  }

  /**
   * Save state to durable storage
   */
  private async saveState(): Promise<void> {
    try {
      await this.ctx.storage.put("sessions", Array.from(this.system.sessions.values()));
      await this.ctx.storage.put("teams", Array.from(this.system.teams.values()));
      await this.ctx.storage.put("tasks", Array.from(this.system.tasks.values()));
      await this.ctx.storage.put("knowledge", Array.from(this.system.knowledge.values()));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  }

  /**
   * Handle periodic cleanup and maintenance
   */
  async alarm(): Promise<void> {
    console.log("🧹 Collaboration Hub maintenance alarm triggered");
    
    // Save current state
    await this.saveState();
    
    // Clean up old message queues (older than 1 hour)
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    for (const [agentId, queue] of this.messageQueue.entries()) {
      const filteredQueue = queue.filter(msg => 
        now - msg.timestamp < maxAge
      );
      
      if (filteredQueue.length !== queue.length) {
        this.messageQueue.set(agentId, filteredQueue);
      }
    }

    // Clean up inactive WebSocket connections
    for (const [agentId, ws] of this.connectedAgents.entries()) {
      if (ws.readyState !== WebSocket.OPEN) {
        this.connectedAgents.delete(agentId);
      }
    }

    console.log(`Maintenance completed. Active agents: ${this.connectedAgents.size}`);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const id = env.COLLABORATION_HUB_DO.idFromName('axiom-collaboration');
    const stub = env.COLLABORATION_HUB_DO.get(id);
    return stub.fetch(request);
  }
} as ExportedHandler<Env>;

export interface Env {
  COLLABORATION_HUB_DO: DurableObjectNamespace;
  DB: D1Database;
  // Add other environment variables as needed
}