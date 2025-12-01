# 🔷 Core Opal Integration Layer for Axiom

## Overview

The Core Opal Integration Layer is a comprehensive solution that enables Axiom agents to leverage Google Opal's visual workflow capabilities while maintaining compatibility with the existing architecture. This foundational layer integrates Opal's "vibe coding" workflows with Axiom's sophisticated agent orchestration system and Google Gemini AI capabilities.

## 🏗️ Architecture

### Components

1. **Opal Agent Extension Types** (`src/types/opal-agents.ts`)
   - TypeScript interfaces for Opal-enabled agents
   - MENA-specific workflow templates
   - Agent capability definitions
   - Configuration schemas

2. **Opal API Client** (`src/lib/opal-client.ts`)
   - Google Opal API integration
   - Workflow creation, execution, and monitoring
   - Error handling and retry mechanisms
   - Authentication with Google services
   - Real-time updates via SSE

3. **Workflow Bridge Service** (`src/services/workflow-bridge.ts`)
   - Translates between Opal workflows and Axiom agent operations
   - Maps Opal nodes to agent capabilities
   - Handles data flow between systems
   - Implements execution graph and topological sorting
   - Caching and performance optimization

4. **Opal Integration Service** (`src/services/opal-integration.ts`)
   - Central orchestration service
   - Workflow execution management
   - Agent state tracking
   - Performance analytics
   - Health monitoring

5. **Test Suite** (`src/tests/opal-integration-tests.ts`)
   - Comprehensive validation tests
   - Integration testing with ai-engine.ts
   - Performance and security testing
   - Demonstration scripts

## 🚀 Key Features

### MENA-Specific Agent Support
- **TAJER** (Commerce/Sales): Business analysis, financial calculations
- **MUSAFIR** (Travel): Route optimization, travel planning
- **SOFRA** (Restaurant/Food): Menu analysis, customer experience
- **MOSTASHAR** (Legal/Consulting): Legal analysis, compliance checking

### Workflow Capabilities
- Visual workflow creation and execution
- Real-time monitoring and progress tracking
- Multimodal support (text, image, document)
- Error handling and retry mechanisms
- Performance metrics and analytics
- Security sandboxing

### Integration Features
- Seamless integration with existing ai-engine.ts
- Google Gemini API utilization
- Agent collaboration system compatibility
- Performance monitoring and alerts
- Rate limiting and API management
- Event-driven architecture

## 📋 Usage Examples

### Basic Workflow Execution

```typescript
import { OpalIntegrationService, OpalIntegrationConfig } from '../services/opal-integration';
import { AgentType } from '../types/opal-agents';

// Initialize the service
const config: OpalIntegrationConfig = {
  opalBridgeConfig: {
    apiEndpoint: 'https://api.opal.dev/v1',
    authentication: {
      type: 'api_key',
      credentials: { apiKey: process.env.OPAL_API_KEY! }
    },
    timeout: 30000,
    retryAttempts: 3,
    rateLimiting: { requestsPerMinute: 100, burstLimit: 10 },
    webhooks: { enabled: true, secret: process.env.OPAL_WEBHOOK_SECRET! }
  },
  workflowBridgeConfig: {
    defaultTimeout: 300000,
    maxRetries: 3,
    enableCaching: true,
    cacheTimeout: 300000,
    enableMetrics: true
  },
  agentConfigs: DEFAULT_OPAL_CONFIGS,
  monitoring: { enabled: true, logLevel: 'info', metricsCollection: true }
};

const opalService = new OpalIntegrationService(config);

// Execute a workflow
const request = {
  workflowTemplateId: 'tajer-business-analysis',
  agentId: 'tajer-opal-agent',
  agentType: AgentType.TAJER,
  inputData: {
    dealAmount: 100000,
    currency: 'USD',
    location: 'Dubai, UAE',
    industry: 'real_estate'
  },
  priority: 'normal'
};

const result = await opalService.executeWorkflow(request);
console.log('Workflow completed:', result);
```

### Agent State Monitoring

```typescript
// Get agent state
const agentState = opalService.getAgentState('tajer-opal-agent');
console.log('Agent status:', agentState.status);
console.log('Current executions:', agentState.currentExecutions);
console.log('Capabilities:', agentState.capabilities);

// Get all agent states
const allAgents = opalService.getAllAgentStates();
console.log('Total active agents:', allAgents.filter(a => a.status === 'active').length);

// Get performance analytics
const analytics = opalService.getAnalytics();
console.log('Total executions:', analytics.totalExecutions);
console.log('Success rate:', analytics.successfulExecutions / analytics.totalExecutions);
```

### Workflow Template Management

```typescript
// Get available templates
const templates = await opalService.getWorkflowTemplates({
  category: 'business_analysis',
  agentType: AgentType.TAJER
});

console.log('Available business workflows:', templates.length);

// Filter by tags
const menaTemplates = await opalService.getWorkflowTemplates({
  tags: ['mena', 'arabic', 'business']
});

// Create new template
const newTemplate = {
  name: 'Custom Dubai Analysis',
  description: 'Custom workflow for Dubai market analysis',
  category: 'custom',
  agentType: AgentType.TAJER,
  nodes: [
    {
      id: 'input',
      type: 'input',
      name: 'Market Data Input',
      position: { x: 100, y: 100 },
      config: {},
      inputs: [],
      outputs: [{ id: 'data', name: 'Market Data', type: 'object' }]
    }
    // ... more nodes
  ],
  connections: [],
  metadata: { version: '1.0.0', author: 'axiom-core', tags: ['custom', 'dubai'] }
};

const templateId = await opalService.createWorkflowTemplate(newTemplate);
console.log('Created template:', templateId);
```

### Health Monitoring

```typescript
// Check service health
const health = await opalService.healthCheck();
console.log('Service status:', health.status);
console.log('Issues:', health.issues);
console.log('Components:', health.components);

// Monitor specific components
const bridgeHealth = await workflowBridge.getHealth();
console.log('Workflow bridge status:', bridgeHealth.status);

// Event monitoring
opalService.on('workflow_completed', (event) => {
  console.log('Workflow completed:', event.executionId);
});

opalService.on('workflow_failed', (event) => {
  console.error('Workflow failed:', event.executionId, event.error);
});
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npx ts-node src/tests/opal-integration-tests.ts test

# Run demonstration
npx ts-node src/tests/opal-integration-tests.ts demo
```

The test suite validates:
- Type definitions and imports
- API client initialization
- Workflow bridge functionality
- Integration service operations
- Agent type integration
- MENA workflow templates
- Performance metrics
- Error handling
- Security features
- Caching mechanisms

## 🔧 Configuration

### Environment Variables

```bash
# Required for production
OPAL_API_KEY=your_opal_api_key
OPAL_WEBHOOK_SECRET=your_webhook_secret
GOOGLE_API_KEY=your_google_api_key

# Optional configuration
OPAL_API_ENDPOINT=https://api.opal.dev/v1
OPAL_TIMEOUT=30000
OPAL_RATE_LIMIT=100
```

### Agent Configurations

Each MENA agent has default configurations:

```typescript
// TAJER Agent - Commerce/Sales
{
  agentType: AgentType.TAJER,
  opalCapabilities: [
    {
      id: 'business_analysis',
      name: 'Business Analysis',
      nodeTypes: ['AI_ANALYSIS', 'PROCESSOR', 'DECISION'],
      estimatedExecutionTime: 300000,
      costPerExecution: 0.50
    }
  ],
  executionTimeout: 900000,
  retryPolicy: { maxRetries: 3, fallbackStrategy: 'alternate_agent' },
  sandboxConfig: { enabled: true, memoryLimit: 512*1024*1024 },
  monitoringConfig: { enabled: true, logLevel: 'info' }
}
```

## 📊 Performance Monitoring

### Metrics Collection
- Execution times and success rates
- AI API call counts and costs
- Memory usage and performance
- Agent utilization rates
- Error patterns and frequencies

### Real-time Monitoring
```typescript
// Enable real-time monitoring
opalService.on('execution_update', (event) => {
  console.log(`Progress: ${event.progress}% for ${event.executionId}`);
});

// Monitor agent performance
setInterval(async () => {
  const health = await opalService.healthCheck();
  if (health.status !== 'healthy') {
    console.warn('Service degradation detected:', health.issues);
  }
}, 30000);
```

## 🔒 Security Features

### Sandboxing
- Memory and execution time limits
- Network access restrictions
- File system access controls
- API call whitelisting

### Authentication
- OAuth 2.0, API Key, or Service Account support
- Webhook signature verification
- Rate limiting and burst protection

### Data Protection
- Input validation and sanitization
- Output data filtering
- Secure error handling
- Audit logging

## 🌍 MENA-Specific Features

### Regional Optimizations
- Currency conversion (USD, SAR, AED, EGP, LBP)
- Arabic language support
- Islamic finance calculations
- Cultural context awareness
- Local business hours consideration

### Workflow Templates
- **Tajer Business Analysis**: Real estate and investment analysis
- **Sofra Menu Analysis**: Restaurant menu optimization
- **Custom MENA workflows**: Region-specific business processes

## 🔄 Integration Points

### With Existing Axiom Architecture
- **ai-engine.ts**: Seamless Gemini API integration
- **Agent Collaboration System**: Compatible with existing protocols
- **Performance Analytics**: Integrated monitoring and alerting
- **Security Framework**: Aligned with existing security measures

### API Compatibility
- RESTful API design
- OpenAPI specification support
- Webhook event streaming
- Rate limiting compliance

## 🚨 Error Handling

### Retry Mechanisms
- Exponential backoff
- Circuit breaker patterns
- Fallback strategies
- Manual escalation

### Error Categories
- Network failures
- API rate limits
- Validation errors
- Execution timeouts
- Security violations

## 📈 Scaling Considerations

### Horizontal Scaling
- Stateless service design
- Load balancing support
- Database clustering ready
- Message queue integration

### Performance Optimization
- Response caching
- Connection pooling
- Resource pooling
- Garbage collection tuning

## 🛠️ Development

### File Structure
```
src/
├── types/
│   └── opal-agents.ts          # Type definitions
├── lib/
│   └── opal-client.ts          # API client
├── services/
│   ├── opal-integration.ts     # Main service
│   └── workflow-bridge.ts      # Bridge service
└── tests/
    └── opal-integration-tests.ts # Test suite
```

### Adding New Agent Types
1. Extend `AgentType` enum in `opal-agents.ts`
2. Add agent configuration in `DEFAULT_OPAL_CONFIGS`
3. Implement capability handlers in `workflow-bridge.ts`
4. Create workflow templates for the new agent
5. Add tests for the new integration

### Extending Workflow Capabilities
1. Add new node types to `OpalNodeType` enum
2. Implement handlers in `WorkflowBridgeService`
3. Update agent capability mappings
4. Add validation rules
5. Test with real workflows

## 📝 API Reference

### OpalIntegrationService
- `executeWorkflow(request)`: Execute a workflow
- `getExecutionStatus(id)`: Get execution status
- `cancelExecution(id)`: Cancel running execution
- `createWorkflowTemplate(template)`: Create new template
- `getWorkflowTemplates(filters)`: Get available templates
- `getAgentState(id)`: Get agent state
- `getAnalytics()`: Get performance analytics
- `healthCheck()`: Service health check

### WorkflowBridgeService
- `executeWorkflow(template, agentId, inputData)`: Execute via bridge
- `getHealth()`: Bridge health status
- `cleanupCache()`: Clean expired cache entries

### OpalAPIClient
- `createWorkflow(template)`: Create workflow
- `executeWorkflow(request)`: Execute workflow
- `getExecutionStatus(id)`: Get execution status
- `healthCheck()`: API client health

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain backward compatibility
3. Add tests for new features
4. Update documentation
5. Follow MENA regional considerations
6. Ensure security compliance

## 📄 License

This integration layer is part of the Axiom system and follows the same licensing terms.

---

**🔷 Core Opal Integration Layer v1.0.0**
*Enabling visual workflows for MENA region AI agents*