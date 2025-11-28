# 🔋 AXIOM ENERGY GRID - Resource Management System

## Overview

The Axiom Resource Management System is a comprehensive "Energy Grid" that manages the complete economic lifecycle of AI agents in the Axiom ecosystem. Unlike traditional resource management that focuses only on CPU & RAM, our system manages the full spectrum of agent resources:

- **🧠 AI Tokens**: Cost of Gemini API calls and LLM operations
- **⛓ Crypto**: Solana gas fees and blockchain transaction costs  
- **⏱ Time**: Cloudflare Workers compute time and execution costs
- **💾 Memory**: D1 database and R2 storage costs
- **🌐 Network**: API calls, Tavily searches, and external service costs

## Architecture

The system is built in three interconnected layers:

### Phase 1: Resource Ledger 📒
**Foundation layer** that stores and tracks all resource data

- **Database Schema**: Complete PostgreSQL schema with JSONB for flexible resource tracking
- **Resource Types**: `COMPUTE_MS`, `AI_TOKENS`, `STORAGE_KB`, `NETWORK_REQS`, `SOLANA_LAMPORTS`
- **Quota Management**: Multi-tier quotas (FREE, PRO, ENTERPRISE, CUSTOM)
- **Usage Logging**: Time-series usage logs with cost tracking
- **Optimization Rules**: Configurable rules for automatic resource optimization

### Phase 2: Allocation Engine 🎛️
**Middleware layer** that validates, allocates, and tracks resources

- **Quota Validation**: Pre-execution checks to ensure sufficient resources
- **Real-time Allocation**: Dynamic resource allocation with immediate feedback
- **Cost Calculation**: Accurate cost tracking for all resource types
- **Usage Logging**: Detailed logging of all resource consumption
- **Auto-scaling**: Intelligent scaling based on performance metrics

### Phase 3: Optimization UI 📉
**Dashboard layer** that provides real-time monitoring and control

- **Resource Gauges**: Visual indicators for current resource utilization
- **Cost Analytics**: Real-time cost tracking and budget management
- **Performance Metrics**: Comprehensive performance monitoring and bottleneck detection
- **Optimization Recommendations**: AI-powered recommendations for efficiency improvements
- **Scaling Controls**: Manual and automatic scaling controls

## Core Components

### 1. ResourceManager Class

**Location**: `src/infra/core/ResourceManager.ts`

The central engine that handles all resource operations:

```typescript
// Check resource quota
const checkResult = await resourceManager.checkResourceQuota(agentId, 'AI_TOKENS', 1000);

// Allocate resources
const allocation = await resourceManager.allocateResource(agentId, 'COMPUTE_MS', 5000);

// Get resource metrics
const metrics = await resourceManager.getResourceMetrics(agentId);

// Analyze performance
const analysis = await resourceManager.analyzePerformance(agentId);
```

**Key Features**:
- Singleton pattern for consistent resource management
- Real-time quota validation and allocation
- Comprehensive cost tracking
- Performance analysis and bottleneck detection
- Automatic scaling execution

### 2. ResourceIntegration Class

**Location**: `src/infra/core/ResourceIntegration.ts`

Integration layer that connects with existing Axiom frameworks:

```typescript
// Track superpower execution
await resourceIntegration.trackSuperpowerExecution(agentId, 'data_analysis', {
  'AI_TOKENS': 500,
  'COMPUTE_MS': 1000
});

// Get performance recommendations
const recommendations = await resourceIntegration.getResourcePerformanceRecommendations(agentId);

// Share resources with other agents
await resourceIntegration.shareResources(agentId, 'COMPUTE_MS', 1000, targetAgentId);
```

**Integration Points**:
- **AgentSuperpowersFramework**: Track resource usage during superpower execution
- **PerformanceAnalyticsEngine**: Enhance performance metrics with resource data
- **AgentMarketplaceEngine**: Find cost-effective resource deals
- **AgentCollaborationSystem**: Enable resource sharing between agents

### 3. Resource Monitor Dashboard

**Location**: `src/app/dashboard/resources/page.tsx`

Real-time dashboard for monitoring and controlling resources:

**Features**:
- **Resource Gauges**: Visual utilization meters with threshold alerts
- **Cost Charts**: Real-time cost tracking with budget forecasts
- **Scaling Activity**: History of automatic scaling events
- **Performance Metrics**: Response times, throughput, and efficiency scores
- **Alerts Panel**: Real-time alerts for budget and performance issues

### 4. Resource Management API

**Location**: `src/app/api/resources/route.ts`

RESTful API for all resource operations:

**Endpoints**:
- `GET /api/resources?action=metrics&agentId={id}` - Get resource metrics
- `GET /api/resources?action=quota&agentId={id}` - Get quota information
- `GET /api/resources?action=cost&agentId={id}` - Get cost tracking
- `GET /api/resources?action=recommendations&agentId={id}` - Get optimization recommendations
- `POST /api/resources` - Allocate resources, share resources, purchase from marketplace
- `POST /api/resources?action=optimize` - Run optimization

## Resource Types

### 1. Compute Resources (COMPUTE_MS)
- **Description**: Cloudflare Workers execution time
- **Unit**: Milliseconds (ms)
- **Cost**: $0.00001 per ms
- **Quota Example**: 3,600,000 ms (1 hour) for PRO tier
- **Use Cases**: Agent execution, data processing, API calls

### 2. AI Tokens (AI_TOKENS)
- **Description**: Gemini API token usage
- **Unit**: Tokens
- **Cost**: $0.000001 per token
- **Quota Example**: 1,000,000 tokens for PRO tier
- **Use Cases**: LLM inference, text generation, reasoning

### 3. Storage (STORAGE_KB)
- **Description**: D1 database and R2 storage
- **Unit**: Kilobytes (KB)
- **Cost**: $0.000001 per KB
- **Quota Example**: 10,485,760 KB (10GB) for PRO tier
- **Use Cases**: Agent data, conversation history, file storage

### 4. Network (NETWORK_REQS)
- **Description**: External API calls and requests
- **Unit**: Requests
- **Cost**: $0.001 per request
- **Quota Example**: 10,000 requests for PRO tier
- **Use Cases**: Tavily searches, external API calls, webhooks

### 5. Blockchain (SOLANA_LAMPORTS)
- **Description**: Solana transaction fees
- **Unit**: Lamports
- **Cost**: $0.000001 per lamport
- **Quota Example**: 10,000,000 lamports (0.01 SOL) for PRO tier
- **Use Cases**: Token swaps, smart contract calls, DeFi operations

## Quota Tiers

### FREE Tier
- **Compute**: 180,000 ms (5 minutes)
- **AI Tokens**: 100,000 tokens
- **Storage**: 1,048,576 KB (1GB)
- **Network**: 1,000 requests
- **Blockchain**: 1,000,000 lamports (0.001 SOL)
- **Cost**: $0

### PRO Tier
- **Compute**: 3,600,000 ms (1 hour)
- **AI Tokens**: 1,000,000 tokens
- **Storage**: 10,485,760 KB (10GB)
- **Network**: 10,000 requests
- **Blockchain**: 10,000,000 lamports (0.01 SOL)
- **Cost**: $10/month

### ENTERPRISE Tier
- **Compute**: 36,000,000 ms (10 hours)
- **AI Tokens**: 10,000,000 tokens
- **Storage**: 104,857,600 KB (100GB)
- **Network**: 100,000 requests
- **Blockchain**: 100,000,000 lamports (0.1 SOL)
- **Cost**: $100/month

## Optimization Features

### 1. Automatic Scaling
- **Horizontal Scaling**: Add more agent instances based on load
- **Vertical Scaling**: Increase resource quotas based on usage patterns
- **Cooldown Periods**: Prevent rapid scaling oscillations
- **Threshold-based**: Configurable thresholds for scaling decisions

### 2. Cost Optimization
- **Marketplace Integration**: Find cheaper resource deals
- **Resource Sharing**: Share unused resources with other agents
- **Budget Alerts**: Automatic alerts when budget thresholds are exceeded
- **Usage Analytics**: Detailed breakdown of resource costs

### 3. Performance Optimization
- **Bottleneck Detection**: Identify resource constraints
- **Efficiency Scoring**: Rate agent efficiency based on cost vs output
- **Recommendation Engine**: AI-powered optimization suggestions
- **A/B Testing**: Test optimization strategies automatically

## Integration Guide

### 1. Basic Resource Allocation

```typescript
import { resourceManager } from '@/infra/core/ResourceManager';

// Check if agent has sufficient quota
const checkResult = await resourceManager.checkResourceQuota(
  'agent-123',
  'AI_TOKENS',
  1000
);

if (checkResult.allowed) {
  // Allocate resources for task
  const allocation = await resourceManager.allocateResource(
    'agent-123',
    'AI_TOKENS',
    1000,
    'task-456'
  );
  
  console.log(`Allocated ${allocation.allocatedAmount} tokens for $${allocation.costUSD}`);
}
```

### 2. Performance Monitoring

```typescript
import { resourceManager } from '@/infra/core/ResourceManager';

// Get comprehensive resource metrics
const metrics = await resourceManager.getResourceMetrics('agent-123');

console.log('Resource Utilization:', metrics.current);
console.log('Performance:', metrics.performance);
console.log('Cost Analysis:', metrics.cost);

// Analyze performance and get recommendations
const analysis = await resourceManager.analyzePerformance('agent-123');

console.log('Bottlenecks:', analysis.bottlenecks);
console.log('Optimization Actions:', analysis.optimizationActions);
```

### 3. Integration with Superpowers

```typescript
import { resourceIntegration } from '@/infra/core/ResourceIntegration';

// Track resource usage during superpower execution
await resourceIntegration.trackSuperpowerExecution(
  'agent-123',
  'data_analysis',
  {
    'AI_TOKENS': 500,
    'COMPUTE_MS': 2000,
    'NETWORK_REQS': 5
  }
);

// Get efficiency recommendations
const recommendations = await resourceIntegration.getResourcePerformanceRecommendations('agent-123');

// Execute high-priority recommendations automatically
await resourceIntegration.runAutoOptimization('agent-123');
```

### 4. Resource Sharing

```typescript
import { resourceIntegration } from '@/infra/core/ResourceIntegration';

// Share unused resources with other agents
await resourceIntegration.shareResources(
  'agent-123',
  'COMPUTE_MS',
  600000, // 10 minutes
  'agent-456'
);

// Find marketplace deals for cheaper resources
const deals = await resourceIntegration.findMarketplaceDeals('agent-123');

// Purchase resources from marketplace
const allocation = await resourceIntegration.purchaseFromMarketplace(
  'agent-123',
  'deal-789',
  1000000 // 1M AI tokens
);
```

## Deployment

### Prerequisites
- Node.js 18+ and npm
- Cloudflare Workers account
- D1 database provisioned
- Environment variables configured

### Database Setup

```bash
# Run database migrations
wrangler d1 execute axiom-resource-grid --file="./src/infra/database/migrations/0006_resource_grid.sql"
```

### API Deployment

```bash
# Deploy resource management API
./scripts/deploy-resource-management.sh production

# Deploy to development
./scripts/deploy-resource-management.sh development
```

### Environment Variables

```bash
# Cloudflare configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# Database configuration
RESOURCE_DATABASE_ID=your_database_id
RESOURCE_DATABASE_ID_DEV=your_dev_database_id

# Feature flags
ENABLE_SUPERPOWERS_TRACKING=true
ENABLE_PERFORMANCE_ANALYTICS=true
ENABLE_MARKETPLACE_OPTIMIZATION=true
ENABLE_COLLABORATION_SHARING=true
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Resource Utilization**
   - CPU utilization > 80% (warning)
   - Memory utilization > 90% (critical)
   - Token usage approaching quota limits

2. **Cost Metrics**
   - Daily spend vs budget
   - Cost per task trends
   - Unexpected cost spikes

3. **Performance Metrics**
   - Response time degradation
   - Error rate increases
   - Throughput drops

### Alert Configuration

```yaml
# Example alert configuration
alerts:
  - name: HighResourceUtilization
    condition: resource_utilization_percent > 80
    duration: 5m
    severity: warning
    action: notify
    
  - name: BudgetExceeded
    condition: budget_utilization_percent > 90
    duration: 1m
    severity: critical
    action: throttle
```

## Testing

### Unit Tests

```bash
# Run resource manager tests
npm test -- src/testing/resource/ResourceManager.test.ts

# Run integration tests
npm test -- src/testing/integration/ResourceManagementIntegration.test.ts
```

### Test Coverage

- ✅ Resource allocation and quota validation
- ✅ Cost tracking and budget management
- ✅ Performance analysis and optimization
- ✅ Scaling policies and execution
- ✅ Integration with existing frameworks
- ✅ Error handling and edge cases
- ✅ Performance under load

## Security Considerations

1. **Resource Isolation**: Each agent's resources are strictly isolated
2. **Quota Enforcement**: Hard limits prevent resource abuse
3. **Cost Controls**: Budget limits prevent unexpected charges
4. **Audit Logging**: All resource operations are logged
5. **Access Control**: Only authorized agents can manage resources

## Troubleshooting

### Common Issues

1. **Resource Allocation Failed**
   - Check agent quota limits
   - Verify resource type is valid
   - Ensure sufficient budget

2. **High Costs**
   - Review resource utilization metrics
   - Check for inefficient operations
   - Consider optimization recommendations

3. **Performance Issues**
   - Analyze bottleneck reports
   - Check scaling configuration
   - Review optimization rules

### Debug Commands

```bash
# Check resource allocation logs
wrangler tail axiom-resource-management

# Query database for usage logs
wrangler d1 execute axiom-resource-grid --command="SELECT * FROM usage_logs WHERE agent_id = 'agent-123' LIMIT 10"

# Monitor real-time metrics
curl "https://api.axiomid.app/api/resources?action=metrics&agentId=agent-123"
```

## Future Enhancements

### Planned Features

1. **Multi-cloud Support**: Support for AWS, Azure, and GCP resources
2. **Advanced Analytics**: Machine learning for usage prediction
3. **Resource Trading**: P2P resource marketplace
4. **Edge Computing**: Resource allocation at edge locations
5. **Green Computing**: Carbon footprint tracking and optimization

### Roadmap

- **Q1 2024**: Multi-cloud support and advanced analytics
- **Q2 2024**: Resource trading and P2P marketplace
- **Q3 2024**: Edge computing and global distribution
- **Q4 2024**: Green computing and sustainability features

## Support

For technical support and questions:

- **Documentation**: [docs.axiomid.app](https://docs.axiomid.app)
- **API Reference**: [api.axiomid.app](https://api.axiomid.app)
- **Community**: [discord.gg/axiom](https://discord.gg/axiom)
- **Issues**: [github.com/axiom/issues](https://github.com/axiom/issues)

---

*This documentation covers the complete Axiom Resource Management System. For specific implementation details, refer to the source code and inline documentation.*