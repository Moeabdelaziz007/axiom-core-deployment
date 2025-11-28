# 📊 Axiom Performance Metrics System Documentation

## Overview

The Axiom Performance Metrics System is a comprehensive monitoring and analytics platform designed to provide real-time insights into agent performance, health, and optimization opportunities. The system integrates seamlessly with the existing AgentSuperpowersFramework and FleetMonitor to provide a unified view of agent capabilities and performance.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Dashboard (React/Next.js)          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Analytics    │  │ Performance  │  │ WebSocket    │  │
│  │ Dashboard   │  │ Metrics API  │  │ Broadcasting  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Cloudflare Durable Objects (Storage & Processing) │  │
│  │ • PerformanceMetricsDO (Main storage)          │  │
│  │ • PerformanceAnalyticsDO (Analytics engine)     │  │
│  │ • PerformanceAlertsDO (Alert management)    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Data Sources                                      │  │
│  │ • Fleet Monitor (Real-time agent status)        │  │
│  │ • Agent Superpowers Framework (Skills & evolution) │  │
│  │ • D1 Database (Agent stats & history)          │  │
│  │ • Solana Blockchain (Transactions & rewards)      │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Core Performance Metrics Types ([`PerformanceMetricsTypes.ts`](src/infra/core/PerformanceMetricsTypes.ts))

Comprehensive TypeScript interfaces defining:
- Agent performance metrics (CPU, memory, network, etc.)
- Performance trends and predictions
- Anomaly detection results
- Performance alerts and notifications
- Optimization recommendations
- Resource utilization reports
- WebSocket message formats

### 2. Metrics Collection API ([`/api/performance/metrics/route.ts`](src/app/api/performance/metrics/route.ts))

RESTful API endpoints for:
- **POST** `/api/performance/metrics` - Submit agent metrics
- **GET** `/api/performance/metrics` - Retrieve metrics with filtering
- **DELETE** `/api/performance/metrics/[agentId]` - Clear agent metrics

Features:
- Real-time metrics validation
- Automatic anomaly detection
- Performance alerting
- Data aggregation and rollups

### 3. Dashboard Stats API ([`/api/agent/[id]/dashboard-stats/route.ts`](src/app/api/agent/[id]/dashboard-stats/route.ts))

Super-endpoint that aggregates data from multiple sources:
- Agent status from Fleet Monitor
- Skills and experience from D1 Database
- Recent transactions from Solana
- Performance metrics from monitoring system

### 4. Performance Metrics Durable Object ([`src/infra/agents/performance-metrics/src/index.ts`](src/infra/agents/performance-metrics/src/index.ts))

High-performance storage and processing:
- Time-series metrics storage with automatic compression
- Real-time aggregation and rollups
- Statistical anomaly detection
- Performance scoring and ranking
- WebSocket broadcasting for live updates

### 5. Performance Analytics Engine ([`src/infra/core/PerformanceAnalyticsEngine.ts`](src/infra/core/PerformanceAnalyticsEngine.ts))

Advanced analytics capabilities:
- Trend analysis using linear regression
- Predictive insights with confidence scoring
- Multi-algorithm anomaly detection
- Performance optimization recommendations
- Comparative analysis and benchmarking

### 6. Database Schema ([`src/infra/database/schema.sql`](src/infra/database/schema.sql))

Comprehensive database structure:
- Agent statistics and basic information
- Skills and mastery tracking
- Performance metrics history
- Performance alerts and notifications
- Agent transactions and financial records
- Performance scores and rankings
- Optimization recommendations
- Resource utilization reports

### 7. Deployment Configuration ([`src/infra/agents/performance-metrics/wrangler.toml`](src/infra/agents/performance-metrics/wrangler.toml))

Production-ready Cloudflare Workers configuration:
- Environment-specific settings
- Durable Object bindings
- KV storage for configuration
- D1 database bindings
- Cron triggers for periodic tasks
- Resource limits and compatibility flags

### 8. Deployment Scripts ([`scripts/deploy-performance-metrics.sh`](scripts/deploy-performance-metrics.sh))

Automated deployment with:
- Immutable deployment strategy
- Pre-deployment validation
- Health checks and verification
- Backup and rollback capabilities
- Performance testing
- Security best practices

## Key Features

### Real-Time Monitoring
- **Live Metrics Collection**: Agents report performance metrics in real-time
- **WebSocket Broadcasting**: Instant updates to connected dashboard clients
- **Health Monitoring**: Continuous health checks with alerting
- **Anomaly Detection**: Statistical and pattern-based anomaly identification

### Performance Analytics
- **Trend Analysis**: Linear regression and volatility calculations
- **Predictive Insights**: Future performance predictions with confidence scores
- **Comparative Analysis**: Agent benchmarking and ranking
- **Optimization Recommendations**: AI-powered performance improvement suggestions

### Alerting System
- **Threshold-Based Alerts**: Configurable alerts for any metric
- **Severity Levels**: Info, Warning, Error, Critical
- **Cooldown Periods**: Prevent alert fatigue
- **Multiple Channels**: WebSocket, webhook, email notifications

### Performance Scoring
- **Component Scores**: Efficiency, Reliability, Quality, Scalability, Cost-Effectiveness
- **Weighted Overall Score**: Comprehensive performance evaluation
- **Historical Ranking**: Track performance changes over time
- **Benchmark Comparison**: Compare against industry standards

### Data Management
- **Time-Series Storage**: Efficient storage with automatic cleanup
- **Data Aggregation**: Multiple time windows (5min, 1hr, 1day, etc.)
- **Data Export**: JSON, CSV, Excel, PDF formats
- **Retention Policies**: Configurable data retention periods

## Integration Points

### AgentSuperpowersFramework Integration
- **Skill Tracking**: Monitor skill acquisition and mastery
- **Performance Impact**: Analyze superpower effects on performance
- **Evolution Monitoring**: Track agent level progression
- **Energy Management**: Monitor energy consumption and recovery

### FleetMonitor Integration
- **Real-Time Status**: Live agent health and status updates
- **Performance Correlation**: Correlate fleet status with performance metrics
- **Predictive Alerts**: Anticipate issues before they impact users

### Database Integration
- **Agent Statistics**: Level, experience, skill points, reputation
- **Skill Management**: Acquired skills, mastery levels, prerequisites
- **Transaction History**: Performance rewards, skill purchases, penalties
- **Performance History**: Long-term performance tracking

## Deployment

### Prerequisites
- Node.js 18+ and npm
- Cloudflare Workers account and wrangler CLI
- D1 database provisioned
- Environment variables configured

### Environment Setup
```bash
# Production
export ENVIRONMENT=production
export LOG_LEVEL=info
export METRICS_RETENTION_HOURS=168

# Development
export ENVIRONMENT=development
export LOG_LEVEL=debug
```

### Deployment Commands
```bash
# Deploy to production
./scripts/deploy-performance-metrics.sh

# Deploy to staging
ENVIRONMENT=staging ./scripts/deploy-performance-metrics.sh

# Deploy to development
ENVIRONMENT=development ./scripts/deploy-performance-metrics.sh
```

### Health Checks
```bash
# Check worker health
curl https://axiom-performance-metrics.workers.dev/api/health

# Check metrics endpoint
curl https://axiom-performance-metrics.workers.dev/api/performance/metrics

# Test WebSocket connection
wscat ws://axiom-performance-metrics.workers.dev/ws/performance
```

## API Endpoints

### Metrics API
- `POST /api/performance/metrics`
  - Submit agent performance metrics
  - Real-time validation and anomaly detection
  - Automatic alerting based on thresholds

- `GET /api/performance/metrics`
  - Retrieve metrics with filtering options
  - Support for time ranges, metric selection, aggregation
  - Pagination for large datasets

- `DELETE /api/performance/metrics/[agentId]`
  - Clear metrics for specific agent
  - Used for data privacy and cleanup

### Dashboard API
- `GET /api/agent/[id]/dashboard-stats`
  - Comprehensive dashboard data aggregation
  - Combines data from Fleet Monitor, D1, Solana, and performance system
  - Single-request dashboard initialization

### Analytics API
- `POST /api/analytics/trends`
  - Generate trend analysis for specific metrics
  - Support for multiple trend algorithms

- `GET /api/analytics/anomalies`
  - Retrieve detected anomalies with filtering
  - Include severity levels and recommendations

- `GET /api/analytics/scores`
  - Get performance scores and rankings
  - Support for time-based ranking queries

### WebSocket Endpoints
- `WS /ws/performance`
  - Real-time metrics broadcasting
  - Subscription-based updates
  - Connection health monitoring

## Performance Metrics

### System Metrics
- **CPU Usage**: 0-100% utilization
- **Memory Usage**: 0-100% utilization
- **Network Latency**: Round-trip time in milliseconds
- **Disk I/O**: Read/write operations per second
- **Tasks Completed**: Total tasks processed
- **Tasks Failed**: Failed task count
- **Success Rate**: Percentage of successful tasks
- **Average Response Time**: Mean task completion time
- **Throughput**: Tasks per minute
- **User Satisfaction**: 0-100% satisfaction score
- **Error Rate**: Percentage of failed operations
- **Accuracy**: 0-100% accuracy score
- **Energy Level**: 0-100% agent energy
- **Active Superpowers**: Currently enabled abilities
- **Skill Mastery Level**: 0-100% overall skill proficiency
- **Revenue Generated**: Total revenue from completed tasks
- **Cost Per Task**: Average cost per task
- **Efficiency**: Output-to-input resource ratio

### Alert Thresholds
- **CPU**: Warning at 70%, Critical at 90%
- **Memory**: Warning at 75%, Critical at 90%
- **Response Time**: Warning at 500ms, Critical at 1000ms
- **Success Rate**: Warning below 90%, Critical below 80%
- **Error Rate**: Warning above 5%, Critical above 15%
- **User Satisfaction**: Warning below 80%, Critical below 60%

## Security Considerations

### Data Protection
- All sensitive data stored in encrypted KV storage
- No credentials or API keys in source code
- Environment-based configuration management
- Regular security audits and dependency updates

### Access Control
- Role-based access to performance data
- API rate limiting and DDoS protection
- Secure WebSocket connections with authentication
- Audit logging for all data access

### Compliance
- GDPR-compliant data handling
- Data retention policies enforced
- User consent for data collection
- Regular security assessments

## Monitoring and Observability

### Logging
- Structured logging with correlation IDs
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized log aggregation
- Real-time log analysis and alerting

### Metrics Collection
- Automatic metric collection from all agents
- Health check endpoints for monitoring
- Performance benchmarking and SLA tracking
- Custom metric definitions and collection

### Alerting
- Multi-channel alert delivery (WebSocket, webhook, email)
- Alert escalation and de-duplication
- Integration with incident management systems

### Dashboards
- Real-time performance dashboards
- Historical trend analysis
- Anomaly detection visualization
- Custom report generation and scheduling

## Troubleshooting

### Common Issues
- **High Memory Usage**: Check for memory leaks in long-running processes
- **Slow Response Times**: Analyze database queries and external API calls
- **Connection Failures**: Review WebSocket configurations and network policies
- **Anomaly False Positives**: Adjust sensitivity thresholds and algorithms

### Debug Tools
- Performance metrics validation endpoint
- WebSocket connection testing utilities
- Database query optimization analysis
- Log aggregation and search tools

### Performance Optimization
- Database indexing strategies
- Caching policies and invalidation
- Load balancing and auto-scaling
- Resource cleanup and garbage collection

## Future Enhancements

### Planned Features
- **Machine Learning**: Advanced predictive models for performance forecasting
- **A/B Testing**: Framework for testing performance improvements
- **Custom Dashboards**: User-configurable dashboard layouts
- **API Versioning**: Backward-compatible API evolution
- **Multi-Region**: Global deployment and data synchronization

### Scalability Improvements
- **Horizontal Scaling**: Multiple worker instances with load balancing
- **Data Partitioning**: Time-based data sharding for performance
- **Caching Layers**: Multi-level caching for frequently accessed data
- **Async Processing**: Background job processing for heavy analytics

## Support

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Performance Metrics Reference](./METRICS_REFERENCE.md)

### Contact
- **Engineering Team**: engineering@axiom.ai
- **Support**: support@axiom.ai
- **Documentation**: docs@axiom.ai

---

*Last updated: November 25, 2024*