/**
 * 🌐 AXIOM INTEGRATION PROTOCOLS
 * 
 * Standardized communication protocols and data formats for
 * Phase 3 component integration.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

export interface ProtocolMessage {
  id: string;
  type: 'request' | 'response' | 'event' | 'command';
  source: string;
  target: string;
  timestamp: Date;
  data: any;
  metadata: Record<string, any>;
  signature?: string;
}

export interface ComponentStatus {
  component: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  lastHeartbeat: Date;
  metrics?: Record<string, any>;
  errors?: string[];
}

export interface DataSyncRequest {
  source: string;
  target: string;
  dataType: 'user' | 'market' | 'operational' | 'security';
  syncType: 'full' | 'incremental' | 'real-time';
  filters?: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
}

export interface DataSyncResponse {
  success: boolean;
  recordsSynced: number;
  errors?: string[];
  lastSync: Date;
  syncId: string;
}

// ============================================================================
// STANDARD PROTOCOLS
// ============================================================================

/**
 * Component Heartbeat Protocol
 */
export class HeartbeatProtocol {
  static generateHeartbeat(component: string, status: ComponentStatus['status']): ProtocolMessage {
    return {
      id: `hb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      source: component,
      target: 'gateway',
      timestamp: new Date(),
      data: {
        status,
        lastHeartbeat: new Date(),
        metrics: {} // Would include actual metrics
      },
      metadata: {
        protocol: 'heartbeat',
        version: '1.0.0'
      }
    };
  }
}

/**
 * Component Communication Protocol
 */
export class CommunicationProtocol {
  static createRequest(
    source: string,
    target: string,
    type: ProtocolMessage['type'],
    data: any,
    metadata?: Record<string, any>
  ): ProtocolMessage {
    return {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'request',
      source,
      target,
      timestamp: new Date(),
      data,
      metadata: {
        protocol: 'communication',
        version: '1.0.0',
        ...metadata
      }
    };
  }

  static createResponse(
    requestId: string,
    source: string,
    target: string,
    data: any,
    success: boolean = true,
    metadata?: Record<string, any>
  ): ProtocolMessage {
    return {
      id: requestId,
      type: 'response',
      source,
      target,
      timestamp: new Date(),
      data,
      success,
      metadata: {
        protocol: 'communication',
        version: '1.0.0',
        ...metadata
      }
    };
  }
}

/**
 * Data Synchronization Protocol
 */
export class DataSyncProtocol {
  static createSyncRequest(request: DataSyncRequest): ProtocolMessage {
    return {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'command',
      source: request.source,
      target: request.target,
      timestamp: new Date(),
      data: {
        command: 'sync',
        request,
        priority: request.priority,
        syncType: request.syncType,
        filters: request.filters
      },
      metadata: {
        protocol: 'data-sync',
        version: '1.0.0'
      }
    };
  }

  static createSyncResponse(
    syncId: string,
    source: string,
    target: string,
    success: boolean,
    recordsSynced: number = 0,
    errors?: string[],
    lastSync: Date = new Date(),
    metadata?: Record<string, any>
  ): ProtocolMessage {
    return {
      id: syncId,
      type: 'response',
      source,
      target,
      timestamp: new Date(),
      data: {
        command: 'sync',
        success,
        recordsSynced,
        errors,
        lastSync
      },
      metadata: {
        protocol: 'data-sync',
        version: '1.0.0',
        ...metadata
      }
    };
  }
}

// ============================================================================
// SECURITY PROTOCOLS
// ============================================================================

/**
 * Message Authentication Protocol
 */
export class AuthenticationProtocol {
  static signMessage(message: ProtocolMessage, secretKey: string): ProtocolMessage {
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify(message);

    // Create HMAC signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const data = encoder.encode(payload);

    // This is a mock implementation - use proper crypto in production
    const signature = btoa(`${keyData}.${data}`);

    return {
      ...message,
      signature,
      metadata: {
        protocol: 'authentication',
        version: '1.0.0',
        algorithm: 'HMAC-SHA256',
        timestamp
      }
    };
  }

  static verifyMessage(message: ProtocolMessage, signature: string, secretKey: string): boolean {
    try {
      const timestamp = message.metadata?.timestamp || '';
      const payload = JSON.stringify({
        ...message,
        timestamp
      });

      // This is a mock implementation - use proper crypto verification in production
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secretKey);
      const data = encoder.encode(payload);

      const expectedSignature = btoa(`${keyData}.${data}`);
      const isValid = signature === expectedSignature;

      return isValid;
    } catch (error) {
      console.error('Message verification failed:', error);
      return false;
    }
  }
}

// ============================================================================
// EVENT PROTOCOLS
// ============================================================================

/**
 * Component Event Protocol
 */
export class EventProtocol {
  static createEvent(
    source: string,
    type: string,
    data: any,
    severity: 'info' | 'warning' | 'error' | 'critical',
    metadata?: Record<string, any>
  ): ProtocolMessage {
    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      source,
      target: 'gateway',
      timestamp: new Date(),
      data: {
        eventType: type,
        severity,
        ...data
      },
      metadata: {
        protocol: 'event',
        version: '1.0.0',
        severity,
        ...metadata
      }
    };
  }
}

// ============================================================================
// ROUTING PROTOCOLS
// ============================================================================

/**
 * Request Routing Protocol
 */
export class RoutingProtocol {
  static routeRequest(
    request: ProtocolMessage,
    availableTargets: string[]
  ): string | null {
    // Simple routing logic based on target component
    for (const target of availableTargets) {
      if (request.target === target) {
        return target;
      }
    }

    return null;
  }

  /**
   * Load Balancing Protocol
   */
  static selectTarget(
    targets: string[],
    metrics?: Record<string, any>
  ): string | null {
    // Simple round-robin selection
    if (targets.length === 0) return null;

    const selectedIndex = Math.floor(Math.random() * targets.length);
    return targets[selectedIndex];
  }
}

// ============================================================================
// MONITORING PROTOCOLS
// ============================================================================

/**
 * Metrics Collection Protocol
 */
export class MetricsProtocol {
  static createMetric(
    component: string,
    metric: string,
    value: number | string,
    unit?: string,
    tags?: string[],
    metadata?: Record<string, any>
  ): ProtocolMessage {
    return {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      source: component,
      target: 'monitoring',
      timestamp: new Date(),
      data: {
        metric,
        value,
        unit,
        tags,
        timestamp: new Date().toISOString()
      },
      metadata: {
        protocol: 'metrics',
        version: '1.0.0',
        ...metadata
      }
    };
  }

  /**
   * Alert Protocol
   */
  static createAlert(
    component: string,
    type: 'performance' | 'security' | 'resource' | 'availability',
    severity: 'info' | 'warning' | 'error' | 'critical',
    message: string,
    threshold?: number,
    currentValue?: number,
    metadata?: Record<string, any>
  ): ProtocolMessage {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      source: component,
      target: 'gateway',
      timestamp: new Date(),
      data: {
        alertType: type,
        severity,
        message,
        threshold,
        currentValue,
        timestamp: new Date().toISOString()
      },
      metadata: {
        protocol: 'alerting',
        version: '1.0.0',
        severity,
        ...metadata
      }
    };
  }
}

export default {
  HeartbeatProtocol,
  CommunicationProtocol,
  DataSyncProtocol,
  AuthenticationProtocol,
  EventProtocol,
  RoutingProtocol,
  MetricsProtocol
};