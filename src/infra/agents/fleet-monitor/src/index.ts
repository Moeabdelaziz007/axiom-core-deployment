/**
 * FLEET MONITOR DURABLE OBJECT
 * Real-time agent health monitoring and WebSocket broadcasting.
 * Provides global low-latency agent status updates to connected clients.
 */

import { DurableObject } from 'cloudflare:workers';

export interface AgentStatus {
  id: string;
  name: string;
  type: string;
  health: number;
  cpu: number;
  status: 'active' | 'idle' | 'flagged' | 'offline';
  lastUpdate: number;
  activeConnections: number;
  tasksProcessed: number;
  responseTime: number;
  predictionStatus?: string;
  predictionColor?: string;
}

export class FleetHealthDO extends DurableObject<Env> {
  private agentStates: Map<string, AgentStatus> = new Map();
  private websocketConnections: Set<WebSocket> = new Set();
  private updateInterval: number | null = null;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.initializeDefaultAgents();
    this.startPeriodicUpdates();
  }

  private initializeDefaultAgents() {
    const defaultAgents: AgentStatus[] = [
      {
        id: 'sofra',
        name: 'Sofra',
        type: 'CX-Auditor',
        health: 98,
        cpu: 45,
        status: 'active',
        lastUpdate: Date.now(),
        activeConnections: 0,
        tasksProcessed: 1247,
        responseTime: 89,
        predictionStatus: '🛡️ Protecting 12 Users',
        predictionColor: 'text-axiom-success'
      },
      {
        id: 'aqar',
        name: 'Aqar',
        type: 'UnitManager',
        health: 100,
        cpu: 12,
        status: 'idle',
        lastUpdate: Date.now(),
        activeConnections: 0,
        tasksProcessed: 892,
        responseTime: 156,
        predictionStatus: '🔮 3 Opportunities Found',
        predictionColor: 'text-axiom-purple'
      },
      {
        id: 'mawid',
        name: 'Mawid',
        type: 'FlowOptimizer',
        health: 45,
        cpu: 89,
        status: 'flagged',
        lastUpdate: Date.now(),
        activeConnections: 0,
        tasksProcessed: 567,
        responseTime: 234,
        predictionStatus: '⚠️ High No-Show Risk',
        predictionColor: 'text-red-400'
      },
      {
        id: 'tajer',
        name: 'Tajer',
        type: 'Negotiator',
        health: 96,
        cpu: 60,
        status: 'active',
        lastUpdate: Date.now(),
        activeConnections: 0,
        tasksProcessed: 2156,
        responseTime: 78,
        predictionStatus: '💰 15 Deals Closed',
        predictionColor: 'text-axiom-neon-green'
      }
    ];

    defaultAgents.forEach(agent => this.agentStates.set(agent.id, agent));
  }

  private startPeriodicUpdates() {
    // Update agent states every 2 seconds to simulate real-time changes
    this.updateInterval = setInterval(() => {
      this.simulateAgentUpdates();
      this.broadcastUpdates();
    }, 2000) as any;
  }

  private simulateAgentUpdates() {
    this.agentStates.forEach((agent, id) => {
      // Simulate realistic health fluctuations
      let healthChange = (Math.random() - 0.5) * 4; // -2 to +2
      if (agent.status === 'flagged') {
        healthChange -= 1; // Flagged agents degrade faster
      }

      agent.health = Math.max(0, Math.min(100, agent.health + healthChange));
      agent.cpu = Math.max(0, Math.min(100, agent.cpu + (Math.random() - 0.5) * 6));
      agent.responseTime = Math.max(50, agent.responseTime + (Math.random() - 0.5) * 20);
      agent.lastUpdate = Date.now();

      // Update status based on health
      if (agent.health < 30) {
        agent.status = 'flagged';
        agent.predictionStatus = '⚠️ Critical Health';
        agent.predictionColor = 'text-red-400';
      } else if (agent.health > 90) {
        agent.status = 'active';
      }

      // Simulate occasional status changes
      if (Math.random() > 0.98) {
        const statuses: Array<'active' | 'idle' | 'flagged'> = ['active', 'idle', 'flagged'];
        agent.status = statuses[Math.floor(Math.random() * statuses.length)];
      }

      this.agentStates.set(id, agent);
    });
  }

  private broadcastUpdates() {
    if (this.websocketConnections.size === 0) return;

    const message = {
      type: 'fleet_update',
      timestamp: Date.now(),
      agents: Array.from(this.agentStates.values()),
      totalConnections: this.websocketConnections.size
    };

    const messageStr = JSON.stringify(message);
    this.websocketConnections.forEach(ws => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.websocketConnections.delete(ws);
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      // Handle WebSocket connections
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected websocket', { status: 400 });
      }

      const [client, server] = Object.values(new WebSocketPair());
      this.handleWebSocket(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    if (url.pathname === '/health') {
      // Health check endpoint
      return new Response(JSON.stringify({
        status: 'healthy',
        agents: this.agentStates.size,
        connections: this.websocketConnections.size,
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/update' && request.method === 'POST') {
      // Allow workers to update agent states
      try {
        const update = await request.json();
        this.updateAgentState(update);
        return new Response('OK');
      } catch (error) {
        return new Response('Invalid update', { status: 400 });
      }
    }

    return new Response('Not found', { status: 404 });
  }

  private handleWebSocket(ws: WebSocket) {
    this.websocketConnections.add(ws);

    ws.addEventListener('open', () => {
      console.log('WebSocket connection opened');
    });

    ws.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      this.websocketConnections.delete(ws);
    });

    ws.addEventListener('error', () => {
      console.error('WebSocket error');
      this.websocketConnections.delete(ws);
    });

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
  }

  private updateAgentState(update: any) {
    if (!update.id || !this.agentStates.has(update.id)) return;

    const agent = this.agentStates.get(update.id)!;
    Object.assign(agent, update);
    agent.lastUpdate = Date.now();
    this.agentStates.set(update.id, agent);
  }

  async alarm() {
    // Cleanup inactive connections (optional)
    const now = Date.now();
    this.websocketConnections.forEach(ws => {
      if (ws.readyState !== WebSocket.OPEN) {
        this.websocketConnections.delete(ws);
      }
    });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.FLEET_HEALTH_DO.idFromName('axiom-fleet');

    const stub = env.FLEET_HEALTH_DO.get(id);
    return stub.fetch(request);
  }
} as ExportedHandler<Env>;

export interface Env {
  FLEET_HEALTH_DO: DurableObjectNamespace;
}