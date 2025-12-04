# 🕸️ Swarm Protocol - Agent Collaboration System

## Overview

The Swarm Protocol is a comprehensive agent collaboration system built on top of the existing AgentSuperpowersFramework. It enables intelligent agents to work together, share knowledge, and solve complex problems through coordinated effort.

## Features

### 1. Real-time Collaboration Interface
- Interactive collaboration workspace with real-time updates
- Multi-agent task coordination and assignment
- Knowledge sharing and intelligence pooling
- Collaborative problem-solving with AI assistance
- Team communication with chat, video, and screen sharing

### 2. Collaboration Protocols
- Secure agent-to-agent communication channels
- Task delegation and result aggregation
- Conflict resolution and consensus mechanisms
- Role-based access control and permissions
- Audit trail for all collaborative activities

### 3. Intelligence Sharing System
- Dynamic knowledge base that learns from collaborations
- Cross-agent skill sharing and temporary lending
- Collaborative learning and adaptation
- Reputation system for collaboration quality
- Incentive mechanisms for valuable contributions

### 4. Team Management
- Agent team creation and management
- Role assignment and hierarchy management
- Team performance tracking and analytics
- Resource allocation and budget management
- Team dashboard with real-time metrics

### 5. Integration Points
- Connect with existing AgentSuperpowersFramework for skill tracking
- Integrate with FleetMonitor for real-time status
- Connect with performance metrics system for optimization
- Provide collaboration-based skill advancement
- Create collaboration history and analytics

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  SWARM PROTOCOL ARCHITECTURE           │
├─────────────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    │
│  │   FRONTEND    │    │   BACKEND     │    │
│  │   Dashboard    │    │   API Routes   │    │
│  │   Components   │    │   Hub Service   │    │
│  └─────────────────┘    └─────────────────┘    │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    │
│  │  Collaboration  │    │   Real-time    │    │
│  │     Hub (DO)   │    │ WebSocket Hub  │    │
│  └─────────────────┘    └─────────────────┘    │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    │
│  │    Database    │    │   Performance   │    │
│  │     (D1)      │    │   Analytics     │    │
│  └─────────────────┘    └─────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

1. **Node.js 18+** - For running the development server
2. **npm/yarn** - Package manager
3. **Cloudflare Workers** - For deploying the collaboration hub
4. **D1 Database** - For persistent storage
5. **Redis (Optional)** - For caching and session management

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd axiom-core-deployment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

```bash
# Database
DATABASE_URL="your-d1-database-url"

# Collaboration Hub
COLLABORATION_HUB_URL="https://your-collaboration-hub.workers.dev"
COLLABORATION_HUB_API_KEY="your-api-key"

# Frontend
NEXT_PUBLIC_COLLAB_HUB_WS="wss://your-collaboration-hub.workers.dev/connect"

# Agent Framework Integration
AGENT_SUPERPOWERS_API_URL="https://your-agent-superpowers-api.com"
FLEET_MONITOR_URL="https://your-fleet-monitor.com"
```

## Deployment

### 1. Deploy Collaboration Hub

```bash
# Deploy the real-time collaboration hub
npm run deploy:collaboration-hub

# The script will:
# 1. Build the collaboration hub service
# 2. Deploy to Cloudflare Workers
# 3. Run database migrations
# 4. Set up monitoring and alerting
```

### 2. Deploy Frontend

```bash
# Deploy the collaboration dashboard
npm run deploy:dashboard

# The script will:
# 1. Build the Next.js application
# 2. Deploy to Vercel/Netlify
# 3. Configure environment variables
```

### 3. Configure Monitoring

```bash
# Set up monitoring and alerting
npm run setup:monitoring

# The script will:
# 1. Configure performance monitoring
# 2. Set up error alerting
# 3. Create health check endpoints
```

## API Documentation

### Sessions API

#### Create Session
```http
POST /api/collaboration/sessions
Content-Type: application/json

{
  "name": "Operation Alpha",
  "description": "Real-time property analysis task",
  "type": "realtime",
  "participants": ["tajer", "aqar"],
  "objectives": ["Analyze market", "Generate report"]
}
```

#### Get Sessions
```http
GET /api/collaboration/sessions?status=active&type=realtime
```

### Tasks API

#### Create Task
```http
POST /api/collaboration/tasks
Content-Type: application/json

{
  "sessionId": "session-123",
  "title": "Analyze Property Market",
  "description": "Conduct market analysis",
  "assignedTo": ["aqar"],
  "assignedBy": "tajer",
  "priority": "high"
}
```

#### Update Task
```http
PUT /api/collaboration/tasks
Content-Type: application/json

{
  "taskId": "task-123",
  "updates": {
    "status": "completed",
    "progress": 100
  }
}
```

### Teams API

#### Create Team
```http
POST /api/collaboration/teams
Content-Type: application/json

{
  "name": "Real Estate Specialists",
  "description": "Team for property analysis",
  "type": "permanent",
  "leader": "tajer",
  "members": ["tajer", "aqar", "mawid"]
}
```

### Knowledge API

#### Create Knowledge Entry
```http
POST /api/collaboration/knowledge
Content-Type: application/json

{
  "title": "Advanced Negotiation Techniques",
  "type": "skill",
  "content": "Comprehensive negotiation guide",
  "contributor": "tajer",
  "tags": ["negotiation", "business"],
  "quality": 92,
  "usefulness": 88
}
```

## Testing

### Run Test Suite

```bash
# Run the comprehensive test suite
chmod +x scripts/test-collaboration-system.sh
./scripts/test-collaboration-system.sh

# The test will validate:
# 1. Session creation and management
# 2. Task delegation and tracking
# 3. Team formation and management
# 4. Knowledge sharing and learning
# 5. Real-time communication
# 6. Integration with existing systems
```

### Manual Testing

1. **Create a collaboration session**
   ```bash
   curl -X POST http://localhost:3000/api/collaboration/sessions \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Session",
       "type": "realtime",
       "participants": ["tajer", "aqar"],
       "objectives": ["Test collaboration"]
     }'
   ```

2. **Create a task**
   ```bash
   curl -X POST http://localhost:3000/api/collaboration/tasks \
     -H "Content-Type: application/json" \
     -d '{
       "sessionId": "session-123",
       "title": "Test Task",
       "assignedTo": ["aqar"],
       "assignedBy": "tajer",
       "priority": "high"
     }'
   ```

3. **Create a team**
   ```bash
   curl -X POST http://localhost:3000/api/collaboration/teams \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Team",
       "type": "temporary",
       "leader": "tajer",
       "members": ["tajer", "aqar", "mawid"]
     }'
   ```

4. **Test WebSocket connection**
   - Open the dashboard at `http://localhost:3000/dashboard/collaboration`
   - Check browser console for WebSocket connection status
   - Verify real-time updates are working

## Frontend Components

### SwarmNetwork Component

The main visualization component for the collaboration network:

```typescript
import SwarmNetwork from '@/components/collaboration/SwarmNetwork';

// Usage in dashboard page
<SwarmNetwork />
```

### CollaborationDashboard Component

The main dashboard component with tabs for different collaboration aspects:

```typescript
import CollaborationDashboard from '@/app/dashboard/collaboration/page';

// Access at /dashboard/collaboration
```

## Integration with Existing Systems

### AgentSuperpowersFramework Integration

```typescript
import { AgentSuperpowersFramework } from '@/infra/core/AgentSuperpowersFramework';

// Use for skill tracking and advancement
const framework = new AgentSuperpowersFramework();
const agentSkills = await framework.getAgentSkills('tajer');
```

### FleetMonitor Integration

```typescript
import { useFleetMonitor } from '@/hooks/useFleetMonitor';

// Use for real-time agent status
const { agentStatus, fleetMetrics } = useFleetMonitor();
```

## Monitoring and Analytics

### Performance Metrics

The system tracks the following metrics:

- **Session Metrics**: Active sessions, completion rates, average duration
- **Task Metrics**: Creation rate, completion rate, average completion time
- **Team Metrics**: Productivity, quality, collaboration efficiency
- **Knowledge Metrics**: Sharing rate, quality scores, learning velocity
- **Communication Metrics**: Message volume, response times, connection quality

### Health Checks

```bash
# Check system health
curl http://localhost:3000/api/health

# Check collaboration hub status
curl https://your-collaboration-hub.workers.dev/health
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check environment variables
   - Verify collaboration hub is running
   - Check firewall settings

2. **API Calls Return Errors**
   - Verify database connection
   - Check request format and headers
   - Review server logs

3. **Performance Issues**
   - Monitor database query performance
   - Check WebSocket message queue size
   - Review resource allocation

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
DEBUG=collaboration npm run dev

# Or in production
DEBUG=collaboration npm run start
```

## Security Considerations

1. **Authentication**: All API endpoints require proper authentication
2. **Authorization**: Role-based access control for all operations
3. **Data Validation**: Input validation on all API endpoints
4. **Audit Trail**: Complete logging of all collaborative activities
5. **Rate Limiting**: Protection against API abuse
6. **Encryption**: Secure communication channels between agents

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation at `/docs`

---

**🕸️ The Swarm Protocol - Enabling Intelligent Agent Collaboration**