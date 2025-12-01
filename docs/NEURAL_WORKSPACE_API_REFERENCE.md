# 🔌 Neural Workspace API Reference

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Target Audience:** Developers and System Integrators

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Event Types](#event-types)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Integration Examples](#integration-examples)

---

## Overview

The Neural Workspace API provides real-time access to agent states, events, and control mechanisms through Server-Sent Events (SSE) and REST endpoints. This API enables external systems to:

- Monitor agent activities in real-time
- Trigger agent actions and workflows
- Receive notifications about agent state changes
- Integrate with existing LangGraph orchestration systems

---

## Authentication

Currently, the Neural Workspace API does not require authentication for development environments. For production deployments, authentication will be implemented using:

```typescript
// Future authentication headers
headers: {
  'Authorization': 'Bearer <your-api-key>',
  'X-Tenant-ID': '<your-tenant-id>'
}
```

---

## Endpoints

### Server-Sent Events Endpoint

#### `GET /api/dream`

Establishes a persistent connection for real-time event streaming.

**Request Headers**:
```http
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Response Headers**:
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
```

**Response Format**:
```
id: event-id-123
event: message
data: {"type":"AGENT_THINKING","agentId":"dreamer-1",...}

retry: 3000
```

**Connection Lifecycle**:
1. Initial connection established
2. `CONNECTION_ESTABLISHED` event sent
3. Continuous stream of agent events
4. Auto-disconnect after 5 minutes (reconnect recommended)
5. Manual disconnect on client request

### Agent Control Endpoint

#### `POST /api/dream`

Triggers specific actions on individual agents.

**Request Headers**:
```http
Content-Type: application/json
```

**Request Body**:
```json
{
  "agentId": "dreamer-1",
  "action": "brainstorm",
  "parameters": {
    "topic": "product innovation",
    "duration": 300
  }
}
```

**Response**:
```json
{
  "success": true,
  "agentId": "dreamer-1",
  "action": "brainstorm",
  "status": "TRIGGERED",
  "timestamp": 1701234567890,
  "message": "Action brainstorm triggered for agent dreamer-1",
  "workflowId": "workflow-abc-123"
}
```

**Available Actions**:

| Agent Type | Action | Description | Parameters |
|------------|--------|-------------|------------|
| dreamer | brainstorm | Generate creative ideas | `{ topic: string, count: number }` |
| dreamer | vision | Create strategic vision | `{ timeframe: string, scope: string }` |
| analyst | analyze | Perform data analysis | `{ dataset: string, method: string }` |
| analyst | report | Generate analysis report | `{ format: string, sections: array }` |
| judge | decide | Make decision based on criteria | `{ criteria: array, options: array }` |
| judge | evaluate | Evaluate options against metrics | `{ metrics: array, weights: object }` |
| builder | build | Implement system or component | `{ spec: object, environment: string }` |
| builder | deploy | Deploy built system | `{ target: string, config: object }` |
| tajer | negotiate | Handle business negotiation | `{ deal: object, strategy: string }` |
| aqar | evaluate | Property valuation | `{ property: object, method: string }` |
| mawid | schedule | Optimize scheduling | `{ constraints: array, objectives: array }` |
| sofra | audit | Quality audit | `{ criteria: array, scope: string }` |

---

## Event Types

### Agent Events

#### `AGENT_THINKING`

Emitted when an agent begins processing a task.

```json
{
  "type": "AGENT_THINKING",
  "agentId": "dreamer-1",
  "agentType": "dreamer",
  "timestamp": 1701234567890,
  "data": {
    "thought": "Exploring innovative approaches to user engagement",
    "progress": 25,
    "metadata": {
      "taskId": "task-abc-123",
      "priority": "HIGH",
      "estimatedDuration": 180
    }
  }
}
```

#### `AGENT_COMPLETED`

Emitted when an agent successfully completes a task.

```json
{
  "type": "AGENT_COMPLETED",
  "agentId": "analyst-1",
  "agentType": "analyst",
  "timestamp": 1701234567890,
  "data": {
    "result": {
      "summary": "Analysis complete with 95% confidence",
      "insights": ["trend1", "trend2", "trend3"],
      "recommendations": ["rec1", "rec2"]
    },
    "metadata": {
      "processingTime": 145,
      "dataPoints": 1000
    }
  }
}
```

#### `AGENT_ERROR`

Emitted when an agent encounters an error during processing.

```json
{
  "type": "AGENT_ERROR",
  "agentId": "judge-1",
  "agentType": "judge",
  "timestamp": 1701234567890,
  "data": {
    "error": "Insufficient data for decision making",
    "code": "INSUFFICIENT_DATA",
    "recoverable": true,
    "metadata": {
      "requiredData": ["market_trends", "user_feedback"],
      "availableData": ["user_feedback"]
    }
  }
}
```

### Workflow Events

#### `WORKFLOW_STARTED`

Emitted when a multi-agent workflow begins.

```json
{
  "type": "WORKFLOW_STARTED",
  "timestamp": 1701234567890,
  "data": {
    "workflowId": "workflow-xyz-789",
    "name": "Product Development Cycle",
    "agents": ["dreamer-1", "analyst-1", "judge-1", "builder-1"],
    "estimatedDuration": 3600,
    "metadata": {
      "initiator": "user-123",
      "priority": "CRITICAL"
    }
  }
}
```

#### `WORKFLOW_COMPLETED`

Emitted when a multi-agent workflow completes.

```json
{
  "type": "WORKFLOW_COMPLETED",
  "timestamp": 1701234567890,
  "data": {
    "workflowId": "workflow-xyz-789",
    "result": {
      "status": "SUCCESS",
      "output": "Product development cycle completed successfully",
      "deliverables": ["design_spec", "analysis_report", "implementation_plan"]
    },
    "metadata": {
      "actualDuration": 3450,
      "agentContributions": {
        "dreamer-1": "concept_design",
        "analyst-1": "market_analysis",
        "judge-1": "decision_validation",
        "builder-1": "implementation_plan"
      }
    }
  }
}
```

### System Events

#### `CONNECTION_ESTABLISHED`

Emitted when a new SSE connection is established.

```json
{
  "type": "CONNECTION_ESTABLISHED",
  "timestamp": 1701234567890,
  "data": {
    "message": "Connected to Neural Workspace",
    "agents": ["dreamer", "analyst", "judge", "builder", "tajer", "aqar", "mawid", "sofra"],
    "agentConfig": {
      "dreamer": {
        "name": "Dreamer",
        "color": "#8B5CF6",
        "icon": "🌟",
        "description": "Creative ideation and vision planning"
      }
      // ... other agent configs
    },
    "connectionId": "conn-abc-123"
  }
}
```

---

## Data Models

### Agent Model

```typescript
interface NeuralAgent {
  id: string;
  type: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  name: string;
  color: string;
  icon: string;
  description: string;
  status: 'idle' | 'thinking' | 'completed' | 'error';
  progress: number;
  thought?: string;
  gridPosition: { x: number; y: number };
  connections: string[];
  lastActivity: number;
  metadata?: Record<string, any>;
}
```

### Connection Model

```typescript
interface Connection {
  id: string;
  source: string;
  target: string;
  strength: number;
  active: boolean;
  type: 'collaboration' | 'data_flow' | 'dependency';
}
```

### Event Model

```typescript
interface LangGraphEvent {
  type: 'AGENT_THINKING' | 'AGENT_COMPLETED' | 'AGENT_ERROR' | 'WORKFLOW_STARTED' | 'WORKFLOW_COMPLETED' | 'CONNECTION_ESTABLISHED';
  agentId?: string;
  agentType?: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra';
  timestamp: number;
  data: {
    thought?: string;
    progress?: number;
    result?: any;
    error?: string;
    metadata?: Record<string, any>;
    message?: string;
    agents?: string[];
    agentConfig?: Record<string, any>;
  };
}
```

---

## Error Handling

### HTTP Error Codes

| Code | Description | Example Response |
|------|-------------|------------------|
| 400 | Bad Request | `{"error": "Missing required fields: agentId, action"}` |
| 404 | Not Found | `{"error": "Agent not found: invalid-agent-id"}` |
| 429 | Too Many Requests | `{"error": "Rate limit exceeded. Try again later."}` |
| 500 | Internal Server Error | `{"error": "Internal server error"}` |

### SSE Error Handling

SSE connections can fail for various reasons. Implement proper error handling:

```javascript
const eventSource = new EventSource('/api/dream');

eventSource.onerror = (error) => {
  console.error('SSE connection error:', error);
  
  // Implement reconnection logic
  setTimeout(() => {
    eventSource.close();
    connectWithBackoff();
  }, 3000);
};

function connectWithBackoff(retryCount = 0) {
  const maxRetries = 5;
  const baseDelay = 1000;
  const maxDelay = 30000;
  
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  
  setTimeout(() => {
    if (retryCount < maxRetries) {
      console.log(`Attempting to reconnect (attempt ${retryCount + 1})`);
      // Reconnect logic here
      connectWithBackoff(retryCount + 1);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }, delay);
}
```

---

## Rate Limiting

### Current Limits

- **SSE Connections**: 10 concurrent connections per client
- **POST Requests**: 100 requests per minute per IP
- **Event Rate**: Maximum 100 events per second per connection

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701234567
```

### Handling Rate Limits

```javascript
async function makeAgentRequest(agentId, action, parameters) {
  try {
    const response = await fetch('/api/dream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, action, parameters })
    });
    
    if (response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const waitTime = resetTime ? (resetTime * 1000) - Date.now() : 60000;
      
      console.log(`Rate limited. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Retry the request
      return makeAgentRequest(agentId, action, parameters);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

---

## Integration Examples

### JavaScript/TypeScript Client

```typescript
class NeuralWorkspaceClient {
  private eventSource: EventSource | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  
  constructor(private baseUrl: string = '') {}
  
  // Connect to SSE stream
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.eventSource = new EventSource(`${this.baseUrl}/api/dream`);
      
      this.eventSource.onopen = () => {
        console.log('Connected to Neural Workspace');
        resolve();
      };
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('Error parsing event:', error);
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        reject(error);
      };
    });
  }
  
  // Register event handlers
  on(eventType: string, handler: Function) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }
  
  // Trigger agent action
  async triggerAction(agentId: string, action: string, parameters: any = {}) {
    const response = await fetch(`${this.baseUrl}/api/dream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, action, parameters })
    });
    
    return await response.json();
  }
  
  // Handle incoming events
  private handleEvent(event: LangGraphEvent) {
    const handlers = this.eventHandlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
    
    // Also call general event handlers
    const generalHandlers = this.eventHandlers.get('*') || [];
    generalHandlers.forEach(handler => handler(event));
  }
  
  // Disconnect
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// Usage example
const client = new NeuralWorkspaceClient();

// Register event handlers
client.on('AGENT_THINKING', (event) => {
  console.log(`Agent ${event.agentId} is thinking: ${event.data.thought}`);
});

client.on('AGENT_COMPLETED', (event) => {
  console.log(`Agent ${event.agentId} completed task:`, event.data.result);
});

// Connect and trigger actions
await client.connect();
await client.triggerAction('dreamer-1', 'brainstorm', { topic: 'AI innovation' });
```

### React Hook Integration

```typescript
import { useEffect, useState, useCallback } from 'react';

interface UseNeuralWorkspaceReturn {
  agents: NeuralAgent[];
  events: LangGraphEvent[];
  isConnected: boolean;
  triggerAction: (agentId: string, action: string, parameters?: any) => Promise<void>;
}

export function useNeuralWorkspace(): UseNeuralWorkspaceReturn {
  const [agents, setAgents] = useState<NeuralAgent[]>([]);
  const [events, setEvents] = useState<LangGraphEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const triggerAction = useCallback(async (agentId: string, action: string, parameters: any = {}) => {
    try {
      const response = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action, parameters })
      });
      
      const result = await response.json();
      console.log('Action triggered:', result);
    } catch (error) {
      console.error('Failed to trigger action:', error);
    }
  }, []);
  
  useEffect(() => {
    const eventSource = new EventSource('/api/dream');
    
    eventSource.onopen = () => setIsConnected(true);
    eventSource.onerror = () => setIsConnected(false);
    
    eventSource.onmessage = (event) => {
      try {
        const data: LangGraphEvent = JSON.parse(event.data);
        setEvents(prev => [data, ...prev.slice(0, 99)]);
        
        // Handle agent state updates
        if (data.agentId && data.type.startsWith('AGENT_')) {
          setAgents(prev => prev.map(agent => 
            agent.id === data.agentId 
              ? { ...agent, status: data.type === 'AGENT_ERROR' ? 'error' : data.type === 'AGENT_COMPLETED' ? 'completed' : 'thinking' }
              : agent
          ));
        }
      } catch (error) {
        console.error('Error parsing event:', error);
      }
    };
    
    return () => {
      eventSource.close();
    };
  }, []);
  
  return { agents, events, isConnected, triggerAction };
}
```

### Python Client Example

```python
import asyncio
import aiohttp
import json
from typing import Dict, Any, Callable, Optional

class NeuralWorkspaceClient:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
        self.event_handlers: Dict[str, Callable] = {}
    
    async def connect(self):
        """Establish SSE connection"""
        self.session = aiohttp.ClientSession()
        
        async with self.session.get(f"{self.base_url}/api/dream") as response:
            async for line in response.content:
                if line.startswith(b'data: '):
                    try:
                        event_data = json.loads(line[6:].decode())
                        await self.handle_event(event_data)
                    except json.JSONDecodeError:
                        continue
    
    async def handle_event(self, event: Dict[str, Any]):
        """Handle incoming events"""
        event_type = event.get('type')
        if event_type in self.event_handlers:
            await self.event_handlers[event_type](event)
    
    def on(self, event_type: str, handler: Callable):
        """Register event handler"""
        self.event_handlers[event_type] = handler
    
    async def trigger_action(self, agent_id: str, action: str, parameters: Dict[str, Any] = None):
        """Trigger agent action"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        payload = {
            "agentId": agent_id,
            "action": action,
            "parameters": parameters or {}
        }
        
        async with self.session.post(
            f"{self.base_url}/api/dream",
            json=payload
        ) as response:
            return await response.json()
    
    async def close(self):
        """Close connection"""
        if self.session:
            await self.session.close()

# Usage example
async def main():
    client = NeuralWorkspaceClient()
    
    # Register event handlers
    async def on_agent_thinking(event):
        print(f"Agent {event['agentId']} is thinking: {event['data']['thought']}")
    
    client.on('AGENT_THINKING', on_agent_thinking)
    
    # Connect and trigger action
    await client.connect()
    result = await client.trigger_action('dreamer-1', 'brainstorm', {'topic': 'AI innovation'})
    print("Action result:", result)
    
    await client.close()

asyncio.run(main())
```

---

## 📞 Support

For API-related questions and issues:

- **Documentation**: Refer to the main [Neural Workspace Guide](./NEURAL_WORKSPACE_GUIDE.md)
- **Issues**: Report bugs on the project repository
- **Discussions**: Join the development team discussions
- **Examples**: Check the integration examples above

---

*Last Updated: November 2025*  
*API Version: 1.0.0*