/**
 * 🌐 REAL-TIME COMMUNICATION SYSTEM
 * 
 * WebSocket-based real-time communication with:
 * - Server-sent events (SSE) for real-time updates
 * - Message persistence and offline queuing
 * - Typing indicators and read receipts
 * - File and data sharing capabilities
 * - Voice and video communication support
 * - Cross-platform support (web, mobile, desktop)
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import {
  RealtimeSession,
  SessionType,
  SessionState,
  Participant,
  ParticipantRole,
  ParticipantPermissions,
  ParticipantStatus,
  DeviceInfo,
  NetworkInfo,
  MediaState,
  AudioState,
  VideoState,
  ScreenState,
  QualityMetrics,
  AudioQualityMetrics,
  VideoQualityMetrics,
  NetworkQualityMetrics,
  ExperienceMetrics,
  SessionConfig,
  MediaConfig,
  SessionSecurity,
  RecordingConfig,
  ModerationConfig,
  QualityConfig,
  SessionFeatures,
  AccessibilityFeatures,
  SchedulingConfig
} from '../../types/communication';

export type MessagePriority = 'low' | 'normal' | 'high' | 'critical';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system' | 'action' | 'event';

export interface AgentMessage {
  id: string;
  senderId: string;
  recipientId?: string;
  roomId?: string;
  content: any;
  type: MessageType;
  priority: MessagePriority;
  timestamp: Date;
  metadata?: Record<string, any>;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface QueuedMessage {
  id: string;
  message: any;
  timestamp: Date;
  retryCount: number;
}

const DEFAULT_QUALITY_CONFIG: QualityConfig = {
  video: { resolution: '1080p', frameRate: 30, bitrate: 2000, codec: 'H.264', profile: 'main', hardwareAcceleration: true },
  audio: { bitrate: 128, sampleRate: 48000, channels: 2, codec: 'Opus', noiseCancellation: true, echoCancellation: true },
  screen: { resolution: '1080p', frameRate: 30, bitrate: 2000, codec: 'H.264', compression: 80 },
  adaptive: true,
  optimization: { bandwidthAdaptation: true, qualityAdaptation: true, loadBalancing: true, congestionControl: true, errorRecovery: true }
};

const DEFAULT_MEDIA_CONFIG: MediaConfig = {
  audio: { enabled: true, required: false, devices: [], processing: { noiseReduction: true, echoCancellation: true, autoGainControl: true, equalization: false, compression: true, enhancement: false } },
  video: { enabled: true, required: false, devices: [], processing: { stabilization: true, backgroundBlur: false, backgroundReplacement: false, faceDetection: false, objectDetection: false, colorCorrection: true, enhancement: true } },
  screen: { enabled: false, sources: [], processing: { optimization: true, compression: true, annotation: false, cursor: true, multiMonitor: false, regionSelection: false } },
  recording: { enabled: false, autoStart: false, format: 'mp4', quality: 'high', storage: { location: 'cloud', encryption: true, compression: true, backup: true }, retention: { duration: 30, autoDelete: true, archival: false, legalHold: false } } as any,
  streaming: { enabled: true, protocol: 'WebRTC', quality: 'auto', latency: { target: 100, max: 200, adaptive: true }, adaptive: true }
};

// ============================================================================
// WEBSOCKET CONNECTION MANAGER
// ============================================================================

/**
 * WebSocket connection manager for real-time communication
 */
export class WebSocketConnectionManager {
  private connections: Map<string, WebSocketConnection> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private messageQueue: Map<string, QueuedMessage[]> = new Map();
  private heartbeatInterval: Map<string, NodeJS.Timeout> = new Map();

  constructor(private config: WebSocketConfig) {
    this.initializeWebSocketServer();
  }

  /**
   * Initialize WebSocket server
   */
  private initializeWebSocketServer(): void {
    // In production, initialize actual WebSocket server
    // For now, simulate WebSocket server
    console.log('🌐 WebSocket server initialized on port:', this.config.port);
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(
    connectionId: string,
    agentId: string,
    deviceInfo: DeviceInfo,
    networkInfo: NetworkInfo
  ): Promise<ConnectionResult> {
    try {
      // Validate connection
      if (!await this.validateConnection(agentId, deviceInfo)) {
        throw new Error('Connection validation failed');
      }

      // Create connection object
      const connection: WebSocketConnection = {
        id: connectionId,
        agentId,
        deviceInfo,
        networkInfo,
        state: 'connecting',
        connectedAt: new Date(),
        lastActivity: new Date(),
        messages: {
          sent: 0,
          received: 0,
          bytes: 0
        },
        quality: {
          latency: 0,
          jitter: 0,
          packetLoss: 0,
          bandwidth: { upload: 0, download: 0 }
        },
        security: await this.establishConnectionSecurity(agentId)
      };

      // Store connection
      this.connections.set(connectionId, connection);

      // Start heartbeat
      this.startHeartbeat(connectionId);

      // Send welcome message
      await this.sendWelcomeMessage(connectionId);

      // Update connection state
      connection.state = 'connected';

      return {
        success: true,
        connectionId,
        agentId,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionId,
        agentId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  async handleDisconnection(
    connectionId: string,
    reason?: string,
    code?: number
  ): Promise<DisconnectionResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: 'Connection not found',
        connectionId,
        agentId: 'unknown',
        timestamp: new Date()
      };
    }

    try {
      // Stop heartbeat
      this.stopHeartbeat(connectionId);

      // Leave all rooms
      await this.leaveAllRooms(connectionId);

      // Update connection state
      connection.state = 'disconnected';
      connection.disconnectedAt = new Date();
      connection.disconnectionReason = reason;
      connection.disconnectionCode = code;

      // Remove from active connections
      this.connections.delete(connectionId);

      // Notify other agents
      await this.notifyDisconnection(connectionId, reason);

      return {
        success: true,
        connectionId,
        agentId: connection.agentId,
        reason,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionId,
        agentId: 'unknown',
        timestamp: new Date()
      };
    }
  }

  /**
   * Send message through WebSocket
   */
  async sendMessage(
    connectionId: string,
    message: any,
    options: MessageOptions = {}
  ): Promise<MessageResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: 'Connection not found',
        connectionId,
        messageId: 'unknown',
        timestamp: new Date()
      };
    }

    try {
      // Update activity
      connection.lastActivity = new Date();
      connection.messages.sent++;

      // Prepare WebSocket message
      const wsMessage: WebSocketMessage = {
        id: this.generateMessageId(),
        type: options.type || 'data',
        data: message,
        timestamp: new Date(),
        priority: options.priority || 'normal',
        compressed: options.compressed || false,
        encrypted: options.encrypted || true
      };

      // Send message
      await this.sendWebSocketMessage(connectionId, wsMessage);

      return {
        success: true,
        messageId: wsMessage.id,
        connectionId,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionId,
        messageId: 'unknown',
        timestamp: new Date()
      };
    }
  }

  /**
   * Broadcast message to room
   */
  async broadcastToRoom(
    roomId: string,
    message: any,
    excludeConnection?: string,
    options: MessageOptions = {}
  ): Promise<BroadcastResult> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return {
        success: false,
        error: 'Room not found',
        roomId,
        totalRecipients: 0,
        successCount: 0,
        failureCount: 0,
        results: [],
        timestamp: new Date()
      };
    }

    const results: MessageResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const connectionId of room) {
      if (connectionId !== excludeConnection) {
        const result = await this.sendMessage(connectionId, message, options);
        results.push(result);

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      }
    }

    return {
      success: true,
      roomId,
      totalRecipients: room.size - (excludeConnection ? 1 : 0),
      successCount,
      failureCount,
      results,
      timestamp: new Date()
    };
  }

  /**
   * Join room
   */
  async joinRoom(
    connectionId: string,
    roomId: string,
    role: ParticipantRole = 'participant'
  ): Promise<RoomResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: 'Connection not found',
        connectionId,
        roomId,
        timestamp: new Date()
      };
    }

    try {
      // Add to room
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set());
      }

      this.rooms.get(roomId)!.add(connectionId);

      // Notify room members
      await this.notifyRoomMembers(roomId, {
        type: 'user_joined',
        data: {
          connectionId,
          agentId: connection.agentId,
          role,
          timestamp: new Date()
        }
      }, connectionId);

      return {
        success: true,
        connectionId,
        roomId,
        role,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionId,
        roomId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Leave room
   */
  async leaveRoom(
    connectionId: string,
    roomId: string
  ): Promise<RoomResult> {
    const room = this.rooms.get(roomId);
    if (!room || !room.has(connectionId)) {
      return {
        success: false,
        error: 'Not in room',
        connectionId,
        roomId,
        timestamp: new Date()
      };
    }

    try {
      // Remove from room
      room.delete(connectionId);

      // Clean up empty rooms
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }

      // Notify remaining room members
      await this.notifyRoomMembers(roomId, {
        type: 'user_left',
        data: {
          connectionId,
          timestamp: new Date()
        }
      });

      return {
        success: true,
        connectionId,
        roomId,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionId,
        roomId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Leave all rooms
   */
  private async leaveAllRooms(connectionId: string): Promise<void> {
    const roomsToLeave: string[] = [];

    for (const [roomId, members] of this.rooms.entries()) {
      if (members.has(connectionId)) {
        roomsToLeave.push(roomId);
      }
    }

    for (const roomId of roomsToLeave) {
      await this.leaveRoom(connectionId, roomId);
    }
  }

  /**
   * Start heartbeat for connection
   */
  private startHeartbeat(connectionId: string): void {
    const interval = setInterval(() => {
      this.sendHeartbeat(connectionId);
    }, this.config.heartbeatInterval);

    this.heartbeatInterval.set(connectionId, interval);
  }

  /**
   * Stop heartbeat for connection
   */
  private stopHeartbeat(connectionId: string): void {
    const interval = this.heartbeatInterval.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatInterval.delete(connectionId);
    }
  }

  /**
   * Send heartbeat message
   */
  private async sendHeartbeat(connectionId: string): Promise<void> {
    await this.sendMessage(connectionId, {
      type: 'heartbeat',
      timestamp: new Date()
    }, { type: 'system', priority: 'low' });
  }

  /**
   * Send welcome message
   */
  private async sendWelcomeMessage(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    await this.sendMessage(connectionId, {
      type: 'welcome',
      connectionId,
      serverTime: new Date(),
      config: this.config
    }, { type: 'system', priority: 'high' });
  }

  /**
   * Notify room members
   */
  private async notifyRoomMembers(
    roomId: string,
    message: any,
    excludeConnection?: string
  ): Promise<void> {
    await this.broadcastToRoom(roomId, message, excludeConnection, {
      type: 'room_notification',
      priority: 'normal'
    });
  }

  /**
   * Notify disconnection
   */
  private async notifyDisconnection(
    connectionId: string,
    reason?: string
  ): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Notify all rooms the connection was in
    for (const [roomId, members] of this.rooms.entries()) {
      if (members.has(connectionId)) {
        await this.notifyRoomMembers(roomId, {
          type: 'user_disconnected',
          data: {
            connectionId,
            agentId: connection.agentId,
            reason,
            timestamp: new Date()
          }
        });
      }
    }
  }

  /**
   * Validate connection
   */
  private async validateConnection(
    agentId: string,
    deviceInfo: DeviceInfo
  ): Promise<boolean> {
    // In production, implement actual validation
    return true;
  }

  /**
   * Establish connection security
   */
  private async establishConnectionSecurity(agentId: string): Promise<any> {
    return {
      encrypted: true,
      authenticated: true,
      certificate: 'mock-certificate',
      handshake: 'completed'
    };
  }

  /**
   * Send WebSocket message
   */
  private async sendWebSocketMessage(
    connectionId: string,
    message: WebSocketMessage
  ): Promise<void> {
    // In production, send actual WebSocket message
    console.log(`📤 Sending WebSocket message to ${connectionId}:`, message);
  }

  /**
   * Generate message ID
   */
  private generateMessageId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(connectionId: string): ConnectionStats | null {
    const connection = this.connections.get(connectionId);
    if (!connection) return null;

    return {
      connectionId,
      agentId: connection.agentId,
      state: connection.state,
      connectedAt: connection.connectedAt,
      lastActivity: connection.lastActivity,
      duration: Date.now() - connection.connectedAt.getTime(),
      messages: connection.messages,
      quality: connection.quality,
      deviceInfo: connection.deviceInfo,
      networkInfo: connection.networkInfo
    };
  }

  /**
   * Get room statistics
   */
  getRoomStats(roomId: string): RoomStats | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const members: ConnectionStats[] = [];
    for (const connectionId of room) {
      const stats = this.getConnectionStats(connectionId);
      if (stats) members.push(stats);
    }

    return {
      roomId,
      memberCount: room.size,
      members,
      totalMessages: members.reduce((sum, m) => sum + m.messages.sent + m.messages.received, 0),
      averageLatency: members.reduce((sum, m) => sum + m.quality.latency, 0) / members.length,
      totalBandwidth: members.reduce((sum, m) => sum + m.quality.bandwidth.upload + m.quality.bandwidth.download, 0)
    };
  }

  /**
   * Get all statistics
   */
  getAllStats(): AllStats {
    const connections = Array.from(this.connections.values());
    const rooms = Array.from(this.rooms.keys());

    return {
      totalConnections: connections.length,
      activeConnections: connections.filter(c => c.state === 'connected').length,
      totalRooms: rooms.length,
      totalMessages: connections.reduce((sum, c) => sum + c.messages.sent + c.messages.received, 0),
      averageLatency: connections.reduce((sum, c) => sum + c.quality.latency, 0) / connections.length,
      totalBandwidth: connections.reduce((sum, c) => sum + c.quality.bandwidth.upload + c.quality.bandwidth.download, 0),
      uptime: this.calculateUptime(),
      timestamp: new Date()
    };
  }

  /**
   * Calculate uptime
   */
  private calculateUptime(): number {
    // In production, calculate actual uptime
    return 99.9;
  }
}

// ============================================================================
// SERVER-SENT EVENTS (SSE) MANAGER
// ============================================================================

/**
 * Server-Sent Events manager for real-time updates
 */
export class SSEManager {
  private connections: Map<string, SSEConnection> = new Map();
  private eventQueues: Map<string, SSEEvent[]> = new Map();

  constructor(private config: SSEConfig) {
    this.initializeSSEServer();
  }

  /**
   * Initialize SSE server
   */
  private initializeSSEServer(): void {
    // In production, initialize actual SSE server
    console.log('📡 SSE server initialized on path:', this.config.path);
  }

  /**
   * Handle new SSE connection
   */
  async handleConnection(
    connectionId: string,
    agentId: string,
    lastEventId?: string,
    channels: string[] = ['default']
  ): Promise<SSEConnectionResult> {
    try {
      // Create SSE connection
      const connection: SSEConnection = {
        id: connectionId,
        agentId,
        state: 'connecting',
        connectedAt: new Date(),
        lastActivity: new Date(),
        lastEventId,
        channels: new Set(channels),
        events: {
          sent: 0,
          delivered: 0,
          failed: 0
        },
        retryCount: 0,
        quality: {
          deliveryRate: 100,
          averageLatency: 0,
          connectionStability: 100
        }
      };

      // Store connection
      this.connections.set(connectionId, connection);

      // Send initial connection event
      await this.sendEvent(connectionId, {
        id: this.generateEventId(),
        type: 'connection',
        data: {
          connectionId,
          agentId,
          channels: Array.from(channels),
          timestamp: new Date()
        },
        timestamp: new Date()
      });

      // Update connection state
      connection.state = 'connected';

      return {
        success: true,
        connectionId,
        agentId,
        channels,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionId,
        agentId,
        channels,
        timestamp: new Date()
      };
    }
  }

  /**
   * Send event to specific connection
   */
  async sendEvent(
    connectionId: string,
    event: SSEEvent
  ): Promise<EventResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: 'Connection not found',
        eventId: event.id,
        connectionId,
        timestamp: new Date()
      };
    }

    try {
      // Update activity
      connection.lastActivity = new Date();
      connection.events.sent++;

      // Format SSE event
      const sseEvent = this.formatSSEEvent(event);

      // Send event
      await this.sendSSEEvent(connectionId, sseEvent);

      // Update metrics
      connection.events.delivered++;
      connection.quality.deliveryRate = (connection.events.delivered / connection.events.sent) * 100;

      return {
        success: true,
        eventId: event.id,
        connectionId,
        timestamp: new Date()
      };

    } catch (error) {
      connection.events.failed++;
      connection.retryCount++;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        eventId: event.id,
        connectionId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Broadcast event to channel
   */
  async broadcastToChannel(
    channel: string,
    event: SSEEvent,
    excludeConnection?: string
  ): Promise<SSEBroadcastResult> {
    const results: EventResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.channels.has(channel) && connectionId !== excludeConnection) {
        const result = await this.sendEvent(connectionId, event);
        results.push(result);

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      }
    }

    return {
      success: true,
      channel,
      eventId: event.id,
      totalRecipients: successCount + failureCount,
      successCount,
      failureCount,
      results,
      timestamp: new Date()
    };
  }

  /**
   * Subscribe to channel
   */
  async subscribeToChannel(
    connectionId: string,
    channel: string
  ): Promise<SubscriptionResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: 'Connection not found',
        connectionId,
        channel,
        timestamp: new Date()
      };
    }

    try {
      connection.channels.add(channel);

      // Send subscription confirmation
      await this.sendEvent(connectionId, {
        id: this.generateEventId(),
        type: 'subscription',
        data: {
          channel,
          subscribed: true,
          timestamp: new Date()
        },
        timestamp: new Date()
      });

      return {
        success: true,
        connectionId,
        channel,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionId,
        channel,
        timestamp: new Date()
      };
    }
  }

  /**
   * Unsubscribe from channel
   */
  async unsubscribeFromChannel(
    connectionId: string,
    channel: string
  ): Promise<SubscriptionResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: 'Connection not found',
        connectionId,
        channel,
        timestamp: new Date()
      };
    }

    try {
      connection.channels.delete(channel);

      // Send unsubscription confirmation
      await this.sendEvent(connectionId, {
        id: this.generateEventId(),
        type: 'subscription',
        data: {
          channel,
          subscribed: false,
          timestamp: new Date()
        },
        timestamp: new Date()
      });

      return {
        success: true,
        connectionId,
        channel,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionId,
        channel,
        timestamp: new Date()
      };
    }
  }

  /**
   * Format SSE event
   */
  private formatSSEEvent(event: SSEEvent): string {
    const lines = [
      `id: ${event.id}`,
      `event: ${event.type}`,
      `data: ${JSON.stringify(event.data)}`,
      `retry: ${event.retry || this.config.defaultRetry}`,
      '',
      '' // Double newline to signal end of event
    ];

    return lines.join('\n');
  }

  /**
   * Send SSE event
   */
  private async sendSSEEvent(
    connectionId: string,
    sseEvent: string
  ): Promise<void> {
    // In production, send actual SSE event
    console.log(`📡 Sending SSE event to ${connectionId}:`, sseEvent);
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(connectionId: string): SSEConnectionStats | null {
    const connection = this.connections.get(connectionId);
    if (!connection) return null;

    return {
      connectionId,
      agentId: connection.agentId,
      state: connection.state,
      connectedAt: connection.connectedAt,
      lastActivity: connection.lastActivity,
      duration: Date.now() - connection.connectedAt.getTime(),
      channels: Array.from(connection.channels),
      events: connection.events,
      quality: connection.quality,
      retryCount: connection.retryCount
    };
  }

  /**
   * Get channel statistics
   */
  getChannelStats(channel: string): ChannelStats | null {
    const connections = Array.from(this.connections.values())
      .filter(c => c.channels.has(channel));

    if (connections.length === 0) return null;

    return {
      channel,
      subscriberCount: connections.length,
      totalEvents: connections.reduce((sum, c) => sum + c.events.sent, 0),
      deliveredEvents: connections.reduce((sum, c) => sum + c.events.delivered, 0),
      failedEvents: connections.reduce((sum, c) => sum + c.events.failed, 0),
      averageDeliveryRate: connections.reduce((sum, c) => sum + c.quality.deliveryRate, 0) / connections.length,
      timestamp: new Date()
    };
  }
}

// ============================================================================
// MAIN REAL-TIME COMMUNICATION SYSTEM
// ============================================================================

/**
 * Main real-time communication system
 */
export class RealtimeCommunicationSystem {
  private wsManager: WebSocketConnectionManager;
  private sseManager: SSEManager;
  private sessions: Map<string, RealtimeSession> = new Map();
  private messagePersistence: MessagePersistence;
  private typingIndicators: Map<string, TypingIndicator[]> = new Map();
  private readReceipts: Map<string, ReadReceipt[]> = new Map();
  private fileTransfers: Map<string, FileTransfer> = new Map();
  private mediaStreams: Map<string, MediaStream> = new Map();

  constructor(
    private config: RealtimeConfig = {}
  ) {
    this.wsManager = new WebSocketConnectionManager(config.websocket || {});
    this.sseManager = new SSEManager(config.sse || {});
    this.messagePersistence = new MessagePersistence(config.persistence || {});
    this.initializeEventHandlers();
  }

  /**
   * Create real-time session
   */
  async createSession(
    initiatorId: string,
    participants: string[],
    sessionType: SessionType,
    sessionConfig?: Partial<SessionConfig>
  ): Promise<SessionCreationResult> {
    const sessionId = this.generateSessionId();

    try {
      const session: RealtimeSession = {
        id: sessionId,
        type: sessionType,
        participants: participants.map(id => ({
          id,
          role: id === initiatorId ? 'host' : 'participant',
          permissions: this.getDefaultPermissions(id === initiatorId ? 'host' : 'participant'),
          status: 'connecting',
          joinedAt: new Date(),
          device: {
            type: 'desktop',
            platform: 'unknown',
            version: '1.0.0',
            capabilities: {
              video: { enabled: true, maxResolution: '1080p', maxFrameRate: 30, codecs: ['H.264', 'VP8'], hardwareAcceleration: true, simulcast: false },
              audio: { enabled: true, inputDevices: 1, outputDevices: 1, codecs: ['Opus', 'AAC'], noiseCancellation: true, echoCancellation: true, autoGainControl: true },
              screen: { sharing: true, maxResolution: '1080p', frameRate: 30, annotation: true, remoteControl: false, multipleMonitors: true },
              network: { bandwidth: { upload: 10, download: 50, available: 40 }, latency: 50, jitter: 5, packetLoss: 0.1, connectionType: 'wifi', stable: true },
              storage: { available: 100, total: 500, type: 'local', speed: 100 },
              processing: { cpu: 'Intel i7', cores: 8, memory: 16, threads: 16, architecture: 'x64' }
            },
          },
          network: {
            connectionType: 'wifi',
            quality: 'good',
            bandwidth: { upload: 10, download: 50, available: 40 },
            latency: 50,
            jitter: 5,
            packetLoss: 0.1,
            stable: true,
            publicIP: '192.168.1.1',
            localIP: '192.168.1.100',
            ipv4: '192.168.1.100',
            ipv6: '::1'
          },
          media: {
            audio: { enabled: sessionType === 'voice-call' || sessionType === 'conference', muted: false, inputDevice: 'default', outputDevice: 'default', volume: 80, quality: 'high', latency: 50, jitter: 5, packetLoss: 0.1, mos: 4.5 },
            video: { enabled: sessionType === 'video-call' || sessionType === 'conference', muted: false, device: 'default', resolution: '1080p', frameRate: 30, quality: '1080p', bandwidth: 2000, latency: 100, jitter: 10, packetLoss: 0.2, freezeRate: 0.1 },
            screen: { sharing: false, source: 'entire-screen', resolution: '1080p', frameRate: 30, quality: '1080p', annotation: false }
          }
        })),
        state: 'initiating',
        configuration: {
          maxParticipants: (sessionConfig || {}).maxParticipants || 10,
          recording: ((sessionConfig || {}).recording || { enabled: false, autoStart: false, format: 'mp4', quality: 'high', storage: { location: 'cloud', encryption: true, compression: true, backup: true }, retention: { duration: 30, autoDelete: true, archival: false, legalHold: false } }) as any,
          moderation: (sessionConfig || {}).moderation || { enabled: false, autoModeration: false, rules: [], moderators: [], waitingRoom: false, raiseHand: true },
          quality: (sessionConfig || {}).quality || DEFAULT_QUALITY_CONFIG,
          features: (sessionConfig || {}).features || { chat: true, reactions: true, polls: true, breakout: true, whiteboard: true, fileShare: true, recording: true, transcription: false, translation: false, accessibility: { captions: true, signLanguage: false, screenReader: true, highContrast: true, largeText: true, keyboardNavigation: true, voiceControl: false } },
          scheduling: (sessionConfig || {}).scheduling || { startAt: undefined, duration: undefined, recurring: { enabled: false, pattern: 'weekly', interval: 1, endDate: undefined, maxOccurrences: undefined }, reminders: [], timezone: 'UTC', autoStart: false }
        },
        media: DEFAULT_MEDIA_CONFIG,
        security: {
          encryption: { enabled: true, algorithm: 'AES-256-GCM', keyRotation: true, keyRotationInterval: 300000, endToEnd: true, transport: true },
          authentication: { required: true, methods: ['token', 'certificate'], mfa: false, deviceVerification: true, biometric: false },
          authorization: { roles: [], permissions: [], policies: [], accessControl: { model: 'RBAC', enforcement: 'strict', caching: true, audit: true } },
          audit: { enabled: true, level: 'standard', events: ['join', 'leave', 'message', 'security-violation'], retention: { duration: 30, autoDelete: true, archival: false, legalHold: false }, realTime: true }
        },
        quality: {
          overall: { value: 100, category: 'excellent', trend: 'stable', factors: [] },
          audio: { clarity: 100, volume: 80, noise: 10, latency: 50, jitter: 5, packetLoss: 0.1, mos: 4.5, echo: 5 },
          video: { resolution: '1080p', frameRate: 30, bitrate: 2000, clarity: 95, smoothness: 90, colorAccuracy: 95, latency: 100, jitter: 10, packetLoss: 0.2, freezeRate: 0.1 },
          network: { bandwidth: { upload: 10, download: 50, available: 40 }, latency: 50, jitter: 5, packetLoss: 0.1, connectionStability: 95, routeEfficiency: 90, congestion: 10 },
          experience: { satisfaction: 95, engagement: 90, responsiveness: 85, reliability: 95, usability: 90, accessibility: 85 },
          timestamp: new Date()
        },
        startedAt: new Date()
      };

      // Store session
      this.sessions.set(sessionId, session);

      // Send invitations to participants
      for (const participantId of participants) {
        await this.sendSessionInvitation(sessionId, initiatorId, participantId);
      }

      return {
        success: true,
        sessionId,
        sessionType,
        participants,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Join existing session
   */
  async joinSession(
    sessionId: string,
    participantId: string,
    capabilities: any
  ): Promise<JoinSessionResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found',
        sessionId,
        timestamp: new Date()
      };
    }

    try {
      // Add participant to session
      const participant: Participant = {
        id: participantId,
        role: 'participant',
        permissions: this.getDefaultPermissions('participant'),
        status: 'connecting',
        joinedAt: new Date(),
        device: {
          type: 'desktop',
          platform: 'unknown',
          version: '1.0.0',
          capabilities
        },
        network: {
          connectionType: 'wifi',
          quality: 'good',
          bandwidth: { upload: 10, download: 50, available: 40 },
          latency: 50,
          jitter: 5,
          packetLoss: 0.1,
          stable: true,
          publicIP: '192.168.1.1',
          localIP: '192.168.1.100',
          ipv4: '192.168.1.100',
          ipv6: '::1'
        },
        media: {
          audio: { enabled: session.type === 'voice' || session.type === 'conference', muted: false, inputDevice: 'default', outputDevice: 'default', volume: 80, quality: 'high', latency: 50, jitter: 5, packetLoss: 0.1, mos: 4.5 },
          video: { enabled: session.type === 'video' || session.type === 'conference', muted: false, device: 'default', resolution: '1080p', frameRate: 30, quality: 'high', bandwidth: 2000, latency: 100, jitter: 10, packetLoss: 0.2, freezeRate: 0.1 },
          screen: { sharing: false, source: 'entire-screen', resolution: '1080p', frameRate: 30, quality: 'high', annotation: false }
        }
      };

      session.participants.push(participant);

      // Update session state
      if (session.participants.length >= 2) {
        session.state = 'active';
      }

      // Notify other participants
      await this.notifySessionParticipants(sessionId, 'participant_joined', { participantId });

      return {
        success: true,
        sessionId,
        participantId,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    sessionId: string,
    participantId: string,
    isTyping: boolean
  ): Promise<TypingResult> {
    const indicators = this.typingIndicators.get(sessionId) || [];

    try {
      // Remove existing indicator for participant
      const existingIndex = indicators.findIndex(ind => ind.participantId === participantId);
      if (existingIndex !== -1) {
        indicators.splice(existingIndex, 1);
      }

      // Add new indicator
      if (isTyping) {
        indicators.push({
          participantId,
          startedAt: new Date(),
          lastUpdate: new Date()
        });
      }

      this.typingIndicators.set(sessionId, indicators);

      // Notify other participants
      await this.notifySessionParticipants(sessionId, 'typing_indicator', {
        participantId,
        isTyping
      });

      return {
        success: true,
        sessionId,
        participantId,
        isTyping,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        participantId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Send read receipt
   */
  async sendReadReceipt(
    sessionId: string,
    participantId: string,
    messageId: string
  ): Promise<ReadReceiptResult> {
    const receipts = this.readReceipts.get(sessionId) || [];

    try {
      // Add read receipt
      receipts.push({
        messageId,
        participantId,
        readAt: new Date(),
        confirmed: false
      });

      this.readReceipts.set(sessionId, receipts);

      // Notify message sender
      await this.notifySessionParticipants(sessionId, 'read_receipt', {
        messageId,
        participantId,
        readAt: new Date()
      });

      return {
        success: true,
        sessionId,
        messageId,
        participantId,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        messageId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Share file
   */
  async shareFile(
    sessionId: string,
    participantId: string,
    file: FileShare
  ): Promise<FileShareResult> {
    const transferId = this.generateTransferId();

    try {
      const transfer: FileTransfer = {
        id: transferId,
        sessionId,
        senderId: participantId,
        file,
        status: 'uploading',
        progress: 0,
        startedAt: new Date(),
        participants: []
      };

      this.fileTransfers.set(transferId, transfer);

      // Start file transfer
      await this.startFileTransfer(transfer);

      // Notify session participants
      await this.notifySessionParticipants(sessionId, 'file_share', {
        transferId,
        participantId,
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      });

      return {
        success: true,
        transferId,
        sessionId,
        participantId,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        transferId,
        sessionId,
        participantId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Start media stream
   */
  async startMediaStream(
    sessionId: string,
    participantId: string,
    streamType: 'audio' | 'video' | 'screen',
    config: MediaStreamConfig
  ): Promise<MediaStreamResult> {
    const streamId = this.generateStreamId();

    try {
      const stream: MediaStream = {
        id: streamId,
        sessionId,
        participantId,
        type: streamType,
        config,
        state: 'starting',
        quality: {
          bitrate: 0,
          resolution: '',
          frameRate: 0,
          latency: 0,
          packetLoss: 0
        },
        startedAt: new Date()
      };

      this.mediaStreams.set(streamId, stream);

      // Start media stream
      await this.initializeMediaStream(stream);

      // Update stream state
      stream.state = 'active';

      return {
        success: true,
        streamId,
        sessionId,
        participantId,
        streamType,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        streamId,
        sessionId,
        participantId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): RealtimeSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): RealtimeSession[] {
    return Array.from(this.sessions.values()).filter(s => s.state === 'active');
  }

  /**
   * Get typing indicators for session
   */
  getTypingIndicators(sessionId: string): TypingIndicator[] {
    return this.typingIndicators.get(sessionId) || [];
  }

  /**
   * Get read receipts for session
   */
  getReadReceipts(sessionId: string): ReadReceipt[] {
    return this.readReceipts.get(sessionId) || [];
  }

  /**
   * Get file transfers for session
   */
  getFileTransfers(sessionId: string): FileTransfer[] {
    return Array.from(this.fileTransfers.values()).filter(t => t.sessionId === sessionId);
  }

  /**
   * Get media streams for session
   */
  getMediaStreams(sessionId: string): MediaStream[] {
    return Array.from(this.mediaStreams.values()).filter(s => s.sessionId === sessionId);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Initialize event handlers
   */
  private initializeEventHandlers(): void {
    // Set up event handlers for WebSocket and SSE
    // In production, implement actual event handlers
  }

  /**
   * Send session invitation
   */
  private async sendSessionInvitation(
    sessionId: string,
    initiatorId: string,
    participantId: string
  ): Promise<void> {
    // Send invitation via WebSocket or SSE
    await this.wsManager.sendMessage(participantId, {
      type: 'session_invitation',
      sessionId,
      initiatorId,
      timestamp: new Date()
    });
  }

  /**
   * Notify session participants
   */
  private async notifySessionParticipants(
    sessionId: string,
    eventType: string,
    data: any
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    for (const participant of session.participants) {
      if (participant.status === 'connected') {
        await this.wsManager.sendMessage(participant.id, {
          type: 'session_event',
          sessionId,
          eventType,
          data,
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: ParticipantRole): ParticipantPermissions {
    const hostPermissions: ParticipantPermissions = {
      canSpeak: true,
      canVideo: true,
      canShare: true,
      canRecord: true,
      canModerate: true,
      canInvite: true,
      canKick: true,
      canMute: true,
      canControl: true
    };

    const participantPermissions: ParticipantPermissions = {
      canSpeak: true,
      canVideo: true,
      canShare: false,
      canRecord: false,
      canModerate: false,
      canInvite: false,
      canKick: false,
      canMute: false,
      canControl: false
    };

    return role === 'host' ? hostPermissions : participantPermissions;
  }

  /**
   * Start file transfer
   */
  private async startFileTransfer(transfer: FileTransfer): Promise<void> {
    // Update transfer status
    transfer.status = 'transferring';
    transfer.progress = 0;

    // Simulate file transfer progress
    const progressInterval = setInterval(() => {
      transfer.progress += 10;
      transfer.lastUpdate = new Date();

      if (transfer.progress >= 100) {
        transfer.status = 'completed';
        transfer.completedAt = new Date();
        clearInterval(progressInterval);

        // Notify completion
        this.notifySessionParticipants(transfer.sessionId, 'file_transfer_completed', {
          transferId: transfer.id,
          participantId: transfer.senderId
        });
      }
    }, 1000);
  }

  /**
   * Initialize media stream
   */
  private async initializeMediaStream(stream: MediaStream): Promise<void> {
    // Update stream state
    stream.state = 'initializing';

    // Simulate stream initialization
    setTimeout(() => {
      stream.state = 'active';
      stream.quality = {
        bitrate: stream.type === 'video' ? 2000 : 128,
        resolution: stream.type === 'video' ? '1080p' : '',
        frameRate: stream.type === 'video' ? 30 : 0,
        latency: 50,
        packetLoss: 0.1
      };

      // Notify stream ready
      this.notifySessionParticipants(stream.sessionId, 'media_stream_ready', {
        streamId: stream.id,
        participantId: stream.participantId,
        streamType: stream.type
      });
    }, 2000);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate transfer ID
   */
  private generateTransferId(): string {
    return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate stream ID
   */
  private generateStreamId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// SUPPORTING CLASSES AND INTERFACES
// ============================================================================

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  port?: number;
  heartbeatInterval?: number;
  maxConnections?: number;
  compression?: boolean;
  encryption?: boolean;
}

/**
 * SSE configuration
 */
export interface SSEConfig {
  path?: string;
  defaultRetry?: number;
  maxConnections?: number;
  heartbeatInterval?: number;
}

/**
 * Real-time configuration
 */
export interface RealtimeConfig {
  websocket?: WebSocketConfig;
  sse?: SSEConfig;
  persistence?: PersistenceConfig;
}

/**
 * Persistence configuration
 */
export interface PersistenceConfig {
  enabled?: boolean;
  storage?: 'memory' | 'database' | 'file';
  retention?: number; // days
}

/**
 * Connection result
 */
export interface ConnectionResult {
  success: boolean;
  connectionId: string;
  agentId: string;
  timestamp: Date;
  error?: string;
}

/**
 * Disconnection result
 */
export interface DisconnectionResult {
  success: boolean;
  connectionId: string;
  agentId: string;
  reason?: string;
  timestamp: Date;
  error?: string;
}

/**
 * Message options
 */
export interface MessageOptions {
  type?: string;
  priority?: MessagePriority;
  compressed?: boolean;
  encrypted?: boolean;
}

/**
 * Message result
 */
export interface MessageResult {
  success: boolean;
  connectionId: string;
  messageId: string;
  timestamp: Date;
  error?: string;
}

/**
 * Broadcast result
 */
export interface BroadcastResult {
  success: boolean;
  roomId?: string;
  channel?: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  results: MessageResult[];
  timestamp: Date;
  error?: string;
}

/**
 * Room result
 */
export interface RoomResult {
  success: boolean;
  connectionId: string;
  roomId: string;
  role?: ParticipantRole;
  timestamp: Date;
  error?: string;
}

/**
 * WebSocket connection
 */
export interface WebSocketConnection {
  id: string;
  agentId: string;
  deviceInfo: DeviceInfo;
  networkInfo: NetworkInfo;
  state: 'connecting' | 'connected' | 'disconnected' | 'error';
  connectedAt: Date;
  disconnectedAt?: Date;
  lastActivity: Date;
  messages: {
    sent: number;
    received: number;
    bytes: number;
  };
  quality: {
    latency: number;
    jitter: number;
    packetLoss: number;
    bandwidth: {
      upload: number;
      download: number;
    };
  };
  security: any;
  disconnectionReason?: string;
  disconnectionCode?: number;
}

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  priority?: MessagePriority;
  compressed?: boolean;
  encrypted?: boolean;
  retry?: number;
}

/**
 * Connection statistics
 */
export interface ConnectionStats {
  connectionId: string;
  agentId: string;
  state: string;
  connectedAt: Date;
  lastActivity: Date;
  duration: number;
  messages: {
    sent: number;
    received: number;
    bytes: number;
  };
  quality: {
    latency: number;
    jitter: number;
    packetLoss: number;
    bandwidth: {
      upload: number;
      download: number;
    };
  };
  deviceInfo: DeviceInfo;
  networkInfo: NetworkInfo;
}

/**
 * Room statistics
 */
export interface RoomStats {
  roomId: string;
  memberCount: number;
  members: ConnectionStats[];
  totalMessages: number;
  averageLatency: number;
  totalBandwidth: number;
}

/**
 * All statistics
 */
export interface AllStats {
  totalConnections: number;
  activeConnections: number;
  totalRooms: number;
  totalMessages: number;
  averageLatency: number;
  totalBandwidth: number;
  uptime: number;
  timestamp: Date;
}

/**
 * SSE connection
 */
export interface SSEConnection {
  id: string;
  agentId: string;
  state: 'connecting' | 'connected' | 'disconnected' | 'error';
  connectedAt: Date;
  lastActivity: Date;
  lastEventId?: string;
  channels: Set<string>;
  events: {
    sent: number;
    delivered: number;
    failed: number;
  };
  retryCount: number;
  quality: {
    deliveryRate: number;
    averageLatency: number;
    connectionStability: number;
  };
}

/**
 * SSE connection result
 */
export interface SSEConnectionResult {
  success: boolean;
  connectionId: string;
  agentId: string;
  channels: string[];
  timestamp: Date;
  error?: string;
}

/**
 * SSE event
 */
export interface SSEEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  retry?: number;
}

/**
 * Event result
 */
export interface EventResult {
  success: boolean;
  eventId: string;
  connectionId: string;
  timestamp: Date;
  error?: string;
}

/**
 * SSE broadcast result
 */
export interface SSEBroadcastResult {
  success: boolean;
  channel: string;
  eventId: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  results: EventResult[];
  timestamp: Date;
}

/**
 * Subscription result
 */
export interface SubscriptionResult {
  success: boolean;
  connectionId: string;
  channel: string;
  timestamp: Date;
  error?: string;
}

/**
 * SSE connection statistics
 */
export interface SSEConnectionStats {
  connectionId: string;
  agentId: string;
  state: string;
  connectedAt: Date;
  lastActivity: Date;
  duration: number;
  channels: string[];
  events: {
    sent: number;
    delivered: number;
    failed: number;
  };
  quality: {
    deliveryRate: number;
    averageLatency: number;
    connectionStability: number;
  };
  retryCount: number;
}

/**
 * Channel statistics
 */
export interface ChannelStats {
  channel: string;
  subscriberCount: number;
  totalEvents: number;
  deliveredEvents: number;
  failedEvents: number;
  averageDeliveryRate: number;
  timestamp: Date;
}

/**
 * Session creation result
 */
export interface SessionCreationResult {
  success: boolean;
  sessionId: string;
  sessionType: SessionType;
  participants: string[];
  timestamp: Date;
  websocketUrl?: string;
  connectionToken?: string;
  config?: any;
  error?: string;
}

/**
 * Join session result
 */
export interface JoinSessionResult {
  success: boolean;
  sessionId: string;
  participantId: string;
  timestamp: Date;
  error?: string;
}

/**
 * Typing result
 */
export interface TypingResult {
  success: boolean;
  sessionId: string;
  participantId: string;
  isTyping: boolean;
  timestamp: Date;
  error?: string;
}

/**
 * Read receipt result
 */
export interface ReadReceiptResult {
  success: boolean;
  sessionId: string;
  messageId: string;
  participantId: string;
  timestamp: Date;
  error?: string;
}

/**
 * File share
 */
export interface FileShare {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string | ArrayBuffer;
  metadata?: Record<string, any>;
}

/**
 * File share result
 */
export interface FileShareResult {
  success: boolean;
  transferId: string;
  sessionId: string;
  participantId: string;
  timestamp: Date;
  error?: string;
}

/**
 * File transfer
 */
export interface FileTransfer {
  id: string;
  sessionId: string;
  senderId: string;
  file: FileShare;
  status: 'uploading' | 'transferring' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  lastUpdate?: Date;
  participants: string[];
}

/**
 * Media stream configuration
 */
export interface MediaStreamConfig {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution?: string;
  frameRate?: number;
  bitrate?: number;
  codec?: string;
  compression?: boolean;
}

/**
 * Media stream result
 */
export interface MediaStreamResult {
  success: boolean;
  streamId: string;
  sessionId: string;
  participantId: string;
  streamType: 'audio' | 'video' | 'screen';
  timestamp: Date;
  error?: string;
}

/**
 * Media stream
 */
export interface MediaStream {
  id: string;
  sessionId: string;
  participantId: string;
  type: 'audio' | 'video' | 'screen';
  config: MediaStreamConfig;
  state: 'starting' | 'active' | 'paused' | 'ended' | 'error';
  quality: {
    bitrate: number;
    resolution: string;
    frameRate: number;
    latency: number;
    packetLoss: number;
  };
  startedAt: Date;
  endedAt?: Date;
}

/**
 * Typing indicator
 */
export interface TypingIndicator {
  participantId: string;
  startedAt: Date;
  lastUpdate: Date;
  timeout?: NodeJS.Timeout;
}

/**
 * Read receipt
 */
export interface ReadReceipt {
  messageId: string;
  participantId: string;
  readAt: Date;
  confirmed: boolean;
}

/**
 * Message persistence
 */
class MessagePersistence {
  constructor(private config: PersistenceConfig) { }

  async saveMessage(message: AgentMessage): Promise<void> {
    // In production, save to database or file
    console.log('💾 Saving message:', message.id);
  }

  async getMessages(
    sessionId: string,
    limit?: number,
    offset?: number
  ): Promise<AgentMessage[]> {
    // In production, retrieve from database or file
    console.log(`📋 Getting messages for session ${sessionId}`);
    return [];
  }

  async deleteMessages(sessionId: string): Promise<void> {
    // In production, delete from database or file
    console.log(`🗑️ Deleting messages for session ${sessionId}`);
  }
}

export default RealtimeCommunicationSystem;