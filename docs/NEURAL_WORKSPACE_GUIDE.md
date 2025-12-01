# 🧠 Neural Workspace: Dynamic Agent Swarm Visualization

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Target Audience:** Developers, System Operators, and Technical Users

---

## 📖 Table of Contents

1. [Component Overview](#component-overview)
2. [Agent Types Documentation](#agent-types-documentation)
3. [Technical Implementation](#technical-implementation)
4. [API Documentation](#api-documentation)
5. [Usage Instructions](#usage-instructions)
6. [Development Guide](#development-guide)
7. [Troubleshooting](#troubleshooting)

---

## Component Overview

### Purpose and Functionality

The **NeuralWorkspace** component is a real-time visualization system for the **Agent Swarm** concept within the Axiom ecosystem. It provides an interactive grid-based interface that displays multiple AI agents, their current states, connections, and real-time thinking processes.

### Key Features

- **Dynamic Grid Layout**: Responsive grid system that adapts to different screen sizes
- **Real-time SSE Integration**: Live updates from LangGraph events via Server-Sent Events
- **Agent State Visualization**: Color-coded agents with animated thinking states
- **Interactive Connections**: Visual representation of agent collaborations and data flows
- **Event History**: Chronological log of all agent activities and system events
- **Agent Control Panel**: Direct interaction with individual agents for task triggering

### Integration with Axiom System

The NeuralWorkspace serves as the central monitoring and control interface for the Axiom agent ecosystem:

- **LangGraph Integration**: Connects to the LangGraph orchestration system for real-time event streaming
- **Agent Registry**: Interfaces with the existing agent types (Aqar, Tajer, Sofra, Mawid) and new specialized agents
- **State Management**: Maintains real-time state synchronization across all active agents
- **Workflow Orchestration**: Provides visual feedback for multi-agent workflows and collaborations

---

## Agent Types Documentation

### New Agent Types

The NeuralWorkspace introduces four new specialized agent types alongside the existing Axiom agents:

#### 🌟 Dreamer Agent
- **Color**: Purple (`#8B5CF6`)
- **Icon**: 🌟
- **Description**: Creative ideation and vision planning
- **Capabilities**:
  - Brainstorming and idea generation
  - Vision planning and roadmap creation
  - Creative problem-solving approaches
  - Innovation and concept development

#### 📊 Analyst Agent
- **Color**: Cyan (`#06B6D4`)
- **Icon**: 📊
- **Description**: Data analysis and pattern recognition
- **Capabilities**:
  - Statistical analysis and data interpretation
  - Pattern recognition and trend identification
  - Performance metrics and KPI analysis
  - Data-driven insights generation

#### ⚖️ Judge Agent
- **Color**: Red (`#EF4444`)
- **Icon**: ⚖️
- **Description**: Decision making and conflict resolution
- **Capabilities**:
  - Decision matrix evaluation
  - Conflict mediation and resolution
  - Risk assessment and mitigation
  - Quality assurance and validation

#### 🔨 Builder Agent
- **Color**: Orange (`#F97316`)
- **Icon**: 🔨
- **Description**: System architecture and implementation
- **Capabilities**:
  - System design and architecture
  - Implementation planning and execution
  - Technical solution development
  - Infrastructure optimization

### Existing Agent Types

The NeuralWorkspace maintains compatibility with existing Axiom agents:

#### 🤝 Tajer Agent
- **Color**: Purple (`#8B5CF6`)
- **Icon**: 🤝
- **Description**: Business negotiation and deal analysis

#### 🏢 Aqar Agent
- **Color**: Cyan (`#06B6D4`)
- **Icon**: 🏢
- **Description**: Property valuation and market analysis

#### 📅 Mawid Agent
- **Color**: Green (`#10B981`)
- **Icon**: 📅
- **Description**: Appointment scheduling and resource optimization

#### 🍽️ Sofra Agent
- **Color**: Yellow (`#F59E0B`)
- **Icon**: 🍽️
- **Description**: Customer experience and quality audit

### Agent Status States

Each agent can be in one of the following states:

- **Idle** (`bg-gray-400`): Agent is waiting for tasks
- **Thinking** (`bg-yellow-400`): Agent is processing a task with animated pulse effect
- **Completed** (`bg-green-400`): Agent successfully completed a task
- **Error** (`bg-red-400`): Agent encountered an error during processing

---

## Technical Implementation

### SSE Integration Details

The NeuralWorkspace uses Server-Sent Events (SSE) for real-time communication with the backend:

```typescript
// SSE Connection Setup
const eventSource = new EventSource('/api/dream');

eventSource.onmessage = (event) => {
  const data: LangGraphEvent = JSON.parse(event.data);
  handleSSEEvent(data);
};
```

#### Event Types

The system handles the following event types:

- `AGENT_THINKING`: Agent starts processing a task
- `AGENT_COMPLETED`: Agent finishes a task successfully
- `AGENT_ERROR`: Agent encounters an error
- `WORKFLOW_STARTED`: Multi-agent workflow begins
- `WORKFLOW_COMPLETED`: Multi-agent workflow ends
- `CONNECTION_ESTABLISHED`: Initial connection confirmation

### Framer Motion Animations

The component uses Framer Motion for smooth, performant animations:

#### Agent Animations
```typescript
// Thinking state animation
animate={{
  scale: agent.status === 'thinking' ? [1, 1.1, 1] : 1,
  opacity: agent.status === 'error' ? [1, 0.5, 1] : 1
}}
transition={{
  duration: agent.status === 'thinking' ? 2 : 1,
  repeat: agent.status === 'thinking' ? Infinity : 0
}}
```

#### Connection Animations
```typescript
// Data flow animation with moving particle
{conn.active && (
  <motion.circle
    r="4"
    fill="#10B981"
    animate={{ opacity: [0, 1, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <animateMotion
      dur="2s"
      repeatCount="indefinite"
      path={`M${sourcePos.x},${sourcePos.y} L${targetPos.x},${targetPos.y}`}
    />
  </motion.circle>
)}
```

### Real-time State Management

The component maintains state through React hooks:

```typescript
const [agents, setAgents] = useState<NeuralAgent[]>([]);
const [connections, setConnections] = useState<Connection[]>([]);
const [events, setEvents] = useState<LangGraphEvent[]>([]);
const [isConnected, setIsConnected] = useState(false);
```

State updates are handled through callbacks that process SSE events:

```typescript
const handleSSEEvent = useCallback((event: LangGraphEvent) => {
  setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
  
  switch (event.type) {
    case 'AGENT_THINKING':
      updateAgentStatus(event.agentId, 'thinking', event.data.thought, event.data.progress);
      break;
    // ... other cases
  }
}, []);
```

### Responsive Grid Layout

The grid system dynamically calculates cell sizes based on container dimensions:

```typescript
const getCellSize = () => {
  if (!containerRef.current) return { width: 150, height: 150 };
  const { width, height } = containerRef.current.getBoundingClientRect();
  return {
    width: width / gridSize.cols,
    height: height / gridSize.rows
  };
};
```

---

## API Documentation

### `/api/dream` SSE Endpoint

The Server-Sent Events endpoint provides real-time updates from the LangGraph system.

#### GET Request

**Endpoint**: `GET /api/dream`

**Response Headers**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
```

**Event Format**:
```
data: {"type":"AGENT_THINKING","agentId":"dreamer-1","agentType":"dreamer","timestamp":1701234567890,"data":{"thought":"Processing complex task...","progress":45}}
```

#### Event Schema

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

### POST Request for Agent Actions

**Endpoint**: `POST /api/dream`

**Request Body**:
```json
{
  "agentId": "dreamer-1",
  "action": "brainstorm",
  "parameters": {}
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
  "message": "Action brainstorm triggered for agent dreamer-1"
}
```

#### Error Responses

```json
{
  "error": "Missing required fields: agentId, action"
}
```

---

## Usage Instructions

### Accessing the NeuralWorkspace

1. **Direct Navigation**: Navigate to `/neural-workspace` in your browser
2. **From Dashboard**: Access through the main dashboard navigation menu
3. **Deep Linking**: Direct links to specific agent views using URL parameters

### Basic Operations

#### Viewing Agent States
- Agents are displayed as colored circles with status indicators
- Click on any agent to view detailed information in the side panel
- Agent colors indicate their type (purple for Dreamer, cyan for Analyst, etc.)

#### Monitoring Connections
- Active connections are shown as green lines between agents
- Data flow connections display animated particles
- Connection strength is indicated by line thickness

#### Controlling the Workspace
- **Play/Pause**: Control real-time updates with the pause button
- **Reset**: Clear all events and reset agent states to idle
- **Grid Size**: Switch between 3x3 and 4x4 grid layouts

### Agent Interaction

#### Quick Actions
Use the Quick Actions panel to trigger common agent tasks:
- **Brainstorm Ideas**: Trigger Dreamer agent ideation
- **Analyze Data**: Start Analyst agent processing
- **Make Decision**: Activate Judge agent decision-making
- **Build System**: Initiate Builder agent implementation

#### Individual Agent Control
1. Click on an agent to select it
2. View detailed information in the side panel
3. Use action buttons to trigger specific tasks:
   - Start Task: Begin general processing
   - Analyze Data: Trigger data analysis workflow

### Event Monitoring

The Recent Events panel displays:
- Last 100 events in chronological order
- Event type with color coding
- Agent information and timestamps
- Event messages and metadata

---

## Development Guide

### Extending the Component

#### Adding New Agent Types

1. **Update Agent Configuration**:
```typescript
const AGENT_CONFIG = {
  // ... existing agents
  newAgent: {
    name: 'New Agent',
    color: '#FF6B6B', // Choose a unique color
    icon: '🆕',
    description: 'New agent functionality description'
  }
};
```

2. **Update Type Definitions**:
```typescript
interface NeuralAgent {
  type: 'dreamer' | 'analyst' | 'judge' | 'builder' | 'tajer' | 'aqar' | 'mawid' | 'sofra' | 'newAgent';
  // ... other properties
}
```

3. **Add Initial Agent**:
```typescript
const initialAgents: NeuralAgent[] = [
  // ... existing agents
  {
    id: 'newagent-1',
    type: 'newAgent',
    name: AGENT_CONFIG.newAgent.name,
    color: AGENT_CONFIG.newAgent.color,
    icon: AGENT_CONFIG.newAgent.icon,
    description: AGENT_CONFIG.newAgent.description,
    status: 'idle',
    progress: 0,
    gridPosition: { x: 4, y: 1 }, // Choose appropriate position
    connections: ['analyst-1'], // Define connections
    lastActivity: Date.now()
  }
];
```

#### Customizing Animations

Modify the animation properties in the motion components:

```typescript
// Custom thinking animation
animate={{
  scale: agent.status === 'thinking' ? [1, 1.2, 1] : 1,
  rotate: agent.status === 'thinking' ? [0, 5, -5, 0] : 0,
}}
transition={{
  duration: agent.status === 'thinking' ? 3 : 1,
  repeat: agent.status === 'thinking' ? Infinity : 0,
  ease: "easeInOut"
}}
```

#### Adding New Connection Types

```typescript
interface Connection {
  type: 'collaboration' | 'data_flow' | 'dependency' | 'new_type';
}

// Update rendering logic
strokeDasharray={
  conn.type === 'data_flow' ? '5,5' : 
  conn.type === 'new_type' ? '10,5' : '0'
}
```

### Integration with Backend

#### Custom Event Handlers

```typescript
const handleSSEEvent = useCallback((event: LangGraphEvent) => {
  // Add custom event handling
  switch (event.type) {
    case 'CUSTOM_EVENT':
      handleCustomEvent(event);
      break;
    // ... existing cases
  }
}, []);

const handleCustomEvent = (event: LangGraphEvent) => {
  // Custom logic for new event type
  console.log('Custom event received:', event);
};
```

#### Extending API Endpoints

```typescript
// Add new POST endpoint functionality
export async function POST(request: NextRequest) {
  const { action, parameters } = await request.json();
  
  switch (action) {
    case 'custom_action':
      return handleCustomAction(parameters);
    // ... existing cases
  }
}
```

### Performance Optimization

#### Event Throttling
```typescript
const throttledUpdateAgentStatus = useCallback(
  throttle((agentId, status, thought, progress) => {
    setAgents(prev => prev.map(/* update logic */));
  }, 100), // Throttle to 100ms
  []
);
```

#### Virtualization for Large Event Lists
```typescript
// Implement virtual scrolling for events
const VirtualizedEventList = ({ events }) => {
  // Use react-window or react-virtualized
  // for performance with large event lists
};
```

---

## Troubleshooting

### Common Issues

#### SSE Connection Problems

**Issue**: Connection status shows "Disconnected"
**Solutions**:
1. Check if the `/api/dream` endpoint is accessible
2. Verify network connectivity and firewall settings
3. Check browser console for error messages
4. Ensure the backend server is running

**Debug Code**:
```javascript
// Test SSE endpoint directly
const eventSource = new EventSource('/api/dream');
eventSource.onopen = () => console.log('Connected');
eventSource.onerror = (e) => console.error('Connection error:', e);
```

#### Agent Not Responding

**Issue**: Clicking agent actions doesn't trigger responses
**Solutions**:
1. Check if the agent ID is correctly configured
2. Verify the POST request is being sent to `/api/dream`
3. Check network tab in browser dev tools for failed requests
4. Ensure backend is handling the action correctly

**Debug Code**:
```javascript
// Test agent action directly
fetch('/api/dream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    agentId: 'dreamer-1', 
    action: 'brainstorm', 
    parameters: {} 
  })
})
.then(response => response.json())
.then(data => console.log('Response:', data))
.catch(error => console.error('Error:', error));
```

#### Animation Performance Issues

**Issue**: Animations are laggy or slow
**Solutions**:
1. Reduce the number of concurrent animations
2. Optimize SVG rendering for connections
3. Use `will-change` CSS property for animated elements
4. Consider reducing animation duration

**Optimization Code**:
```css
.agent-circle {
  will-change: transform, opacity;
  transform: translateZ(0); /* Hardware acceleration */
}
```

#### Memory Leaks

**Issue**: Memory usage increases over time
**Solutions**:
1. Ensure proper cleanup in useEffect hooks
2. Limit the number of stored events
3. Clear unused connections and agent data
4. Use React.memo for expensive components

**Cleanup Code**:
```typescript
useEffect(() => {
  // Setup
  
  return () => {
    // Cleanup
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    // Clear intervals and timeouts
  };
}, []);
```

### Performance Monitoring

#### Key Metrics to Monitor

1. **SSE Connection Latency**: Time between event generation and UI update
2. **Animation Frame Rate**: Should maintain 60fps for smooth animations
3. **Memory Usage**: Monitor for leaks in long-running sessions
4. **Event Processing Time**: Time to handle and display incoming events

#### Debug Tools

```typescript
// Performance monitoring
const performanceMonitor = {
  startTime: Date.now(),
  eventCount: 0,
  
  logEvent() {
    this.eventCount++;
    const elapsed = Date.now() - this.startTime;
    const eventsPerSecond = (this.eventCount / elapsed) * 1000;
    console.log(`Events/sec: ${eventsPerSecond.toFixed(2)}`);
  }
};
```

### Browser Compatibility

The NeuralWorkspace is tested on:
- **Chrome 90+**: Full support
- **Firefox 88+**: Full support
- **Safari 14+**: Full support
- **Edge 90+**: Full support

**Note**: Server-Sent Events are not supported in Internet Explorer.

---

## 📞 Support and Contributing

### Getting Help

- **Documentation**: Check this guide and the main README
- **Issues**: Report bugs on the project repository
- **Discussions**: Join the development team discussions
- **Code Review**: Submit pull requests for improvements

### Contributing Guidelines

1. **Code Style**: Follow the existing TypeScript and React patterns
2. **Testing**: Add tests for new functionality
3. **Documentation**: Update this guide for new features
4. **Performance**: Consider performance implications of changes

---

*Last Updated: November 2025*  
*Document Version: 1.0.0*