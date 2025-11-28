# WebSocket Integration Plan for Raqib & Atid System

## Overview
This plan outlines the remaining steps to integrate the spiritual event system with existing WebSocket communication patterns in the Axiom system.

## Current Status
- ✅ Spiritual data types created for both Raqib and Atid
- ✅ IslamicPrinciple enum implemented
- ✅ SpiritualEvent interface created
- ✅ RaqibEdge and AtidEdge classes implemented
- ✅ Communication protocols implemented
- ✅ WebSocket communication imports added to both agents

## Remaining Tasks

### 1. Update RaqibEdge Class to Use SpiritualEventCommunicator
**File:** `src/infra/agents/narrative-generator/index.ts`
**Actions:**
- Add initialization of SpiritualEventCommunicator in constructor
- Add initialization of CoreAgentClient in constructor
- Update communicateWithCore method to use CoreAgentClient
- Add WebSocket connection handling methods

### 2. Update AtidEdge Class to Use SpiritualEventCommunicator
**File:** `src/infra/agents/error-reflection-engine/index.ts`
**Actions:**
- Add initialization of SpiritualEventCommunicator in constructor
- Add initialization of CoreAgentClient in constructor
- Update communicateWithCore method to use CoreAgentClient
- Add WebSocket connection handling methods

### 3. Add WebSocket Connection Handling Methods
**Files:** Both agent files
**Methods to add:**
- `connectWebSocket()`: Establish WebSocket connection
- `disconnectWebSocket()`: Close WebSocket connection
- `handleWebSocketMessage()`: Process incoming WebSocket messages
- `broadcastSpiritualEvent()`: Send events to connected clients
- `handleWebSocketError()`: Handle WebSocket errors

### 4. Add Real-time Event Broadcasting via WebSocket
**Files:** Both agent files
**Actions:**
- Update `processSuccessEvent()` in RaqibEdge to broadcast events
- Update `processErrorEvent()` in AtidEdge to broadcast events
- Add event filtering and subscription management
- Implement event batching for performance

### 5. Add Proper Error Handling and Logging
**Files:** Both agent files
**Actions:**
- Add try-catch blocks around WebSocket operations
- Implement comprehensive error logging
- Add connection status monitoring
- Add graceful degradation when WebSocket is unavailable

### 6. Ensure Cloudflare Workers Deployment Model Compatibility
**Files:** Both agent files
**Actions:**
- Verify WebSocket API usage is compatible with Cloudflare Workers
- Add proper Durable Object integration if needed
- Ensure environment variable usage follows Workers patterns
- Add proper request/response handling for Workers runtime

## Implementation Details

### WebSocket Configuration
```typescript
const wsConfig = {
    url: config.websocketUrl || 'wss://localhost:8080/spiritual-events',
    protocols: ['axiom-spiritual-v1'],
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000
};
```

### Core Agent Client Configuration
```typescript
const coreClientConfig = {
    baseUrl: config.coreAgentUrl || 'http://localhost:8000',
    timeout: 30000,
    retryAttempts: 3,
    apiKey: config.coreAgentApiKey
};
```

### Event Broadcasting Pattern
```typescript
async broadcastSpiritualEvent(event: SpiritualEvent): Promise<void> {
    try {
        await this.spiritualCommunicator.sendMessage({
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            eventType: event.eventType,
            sourceAgent: 'RaqibEdge' || 'AtidEdge',
            targetAgents: ['all'],
            payload: event,
            timestamp: new Date(),
            priority: 'normal',
            requiresAck: false
        });
    } catch (error) {
        console.error('Failed to broadcast spiritual event:', error);
        // Fallback to local processing
    }
}
```

## Integration Points

### 1. Existing WebSocket Patterns
- **Fleet Monitor**: `src/infra/agents/fleet-monitor/src/index.ts`
- **Collaboration Hub**: `src/infra/agents/collaboration-hub/src/index.ts`
- **Performance Metrics**: `src/infra/agents/performance-metrics/src/index.ts`

### 2. Communication Protocols
- **SpiritualEventCommunicator**: Handles WebSocket connections and message queuing
- **CoreAgentClient**: Handles HTTP communication with Python core agents
- **SpiritualDataCache**: Handles local caching and persistence

### 3. Event Flow
```
Edge Agent (Raqib/Atid) → SpiritualEvent → SpiritualEventCommunicator → WebSocket → Core Agent → Analysis Results → Edge Agent
```

## Testing Strategy
1. Unit tests for WebSocket connection handling
2. Integration tests for edge-core communication
3. End-to-end tests for event processing
4. Performance tests for high-volume event streaming

## Deployment Considerations
1. Environment variables for WebSocket URLs and core agent endpoints
2. Proper error handling for network failures
3. Monitoring and alerting for connection issues
4. Graceful degradation when services are unavailable

## Next Steps
1. Switch to Code mode to implement the remaining tasks
2. Test the WebSocket integration
3. Verify Cloudflare Workers compatibility
4. Update documentation