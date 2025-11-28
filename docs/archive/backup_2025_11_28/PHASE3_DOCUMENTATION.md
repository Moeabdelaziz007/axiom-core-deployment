# Phase 3: Intelligence & Ops Documentation

## Overview

Phase 3: Intelligence & Ops introduces three core components to the Axiom ecosystem:

1. **Market Analyst Agent (MAA)** - AI-powered MENA real estate market analysis
2. **Operations Automation Agent (OAA)** - AI-driven deployment, monitoring, and incident response
3. **Secure IDP Pipeline** - Unified authentication and authorization with SSO, MFA, and OAuth2

This documentation provides comprehensive guides for architecture, deployment, integration, and maintenance of these components.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Market Analyst Agent](#market-analyst-agent-maa)
3. [Operations Automation Agent](#operations-automation-agent-oaa)
4. [Secure IDP Pipeline](#secure-idp-pipeline)
5. [Integration Layer](#integration-layer)
6. [Deployment Guide](#deployment-guide)
7. [Monitoring and Alerting](#monitoring-and-alerting)
8. [Testing Framework](#testing-framework)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                            │
│                    (Central Router)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼────┐ ┌────▼─────┐
│ Market Analyst │ │   OAA  │ │Secure IDP│
│    Agent      │ │        │ │ Pipeline │
└───────┬──────┘ └───┬────┘ └────┬─────┘
        │            │           │
┌───────▼──────┐ ┌──▼────┐ ┌───▼─────┐
│  D-RAG LLM   │ │AI Core│ │Auth Core │
│ (Oracle/Gem) │ │        │ │          │
└──────────────┘ └───────┘ └──────────┘
```

### Technology Stack

- **Runtime**: Cloudflare Workers (Edge Computing)
- **Language**: TypeScript/JavaScript
- **AI/ML**: Gemini API, Oracle VM (D-RAG routing)
- **Database**: PostgreSQL, Vector Databases
- **Authentication**: OAuth2, JWT, MFA
- **Monitoring**: Custom dashboards, Prometheus metrics
- **Deployment**: Wrangler CLI, CI/CD pipelines

## Market Analyst Agent (MAA)

### Purpose

The Market Analyst Agent provides AI-powered real estate market analysis with specialization in MENA region properties. It offers property valuation, investment insights, and market trend analysis.

### Key Features

- **MENA Region Specialization**: Deep understanding of local real estate markets
- **Property Valuation**: AI-driven property valuation algorithms
- **Market Trend Analysis**: Real-time market trend identification
- **Investment Recommendations**: Data-driven investment insights
- **D-RAG Routing**: Intelligent routing between Oracle VM (free) and Gemini (paid)

### Architecture

```
┌─────────────────────────────────────────┐
│        Market Analyst Agent           │
├─────────────────────────────────────────┤
│  Request Processing & Validation       │
├─────────────────────────────────────────┤
│  D-RAG Router                        │
│  ├─ Oracle VM (Free Tier)           │
│  └─ Gemini API (Premium)             │
├─────────────────────────────────────────┤
│  Analysis Engine                      │
│  ├─ Property Valuation               │
│  ├─ Market Trends                    │
│  └─ Investment Scoring               │
├─────────────────────────────────────────┤
│  MENA Data Layer                     │
│  ├─ Regional Regulations              │
│  ├─ Market Data                      │
│  └─ Property Database                │
└─────────────────────────────────────────┘
```

### API Endpoints

#### Property Analysis
```http
POST /api/market-analyst/analyze
Content-Type: application/json

{
  "property": {
    "location": "Dubai Marina",
    "type": "apartment",
    "bedrooms": 2,
    "bathrooms": 2,
    "area": 1200,
    "price": 1500000,
    "currency": "AED"
  },
  "analysisType": ["valuation", "investment", "market_trends"]
}
```

#### Market Trends
```http
GET /api/market-analyst/trends?region=Dubai&property_type=apartment
```

#### Investment Recommendations
```http
POST /api/market-analyst/recommendations
Content-Type: application/json

{
  "criteria": {
    "budget": 2000000,
    "propertyType": "apartment",
    "regions": ["Dubai", "Abu Dhabi"],
    "investmentHorizon": "5_years"
  }
}
```

### Configuration

```yaml
# src/infra/agents/market-analyst/wrangler.toml
name = "market-analyst-agent"
main = "src/index.ts"
compatibility_date = "2023-10-30"

[env.production.vars]
GEMINI_API_KEY = ""
ORACLE_VM_ENDPOINT = ""
AXIOM_SECRET_KEY = ""
REAL_ESTATE_API_KEY = ""
MARKET_DATA_API_KEY = ""

[[env.production.d1_databases]]
binding = "MARKET_DB"
database_name = "axiom-market-data"

[[env.production.d1_databases]]
binding = "ANALYTICS_DB"
database_name = "axiom-analytics"

[[env.production.kv_namespaces]]
binding = "MARKET_CACHE"
id = "market-cache-namespace"

[[env.production.vectorize]]
binding = "MARKET_VECTOR_INDEX"
index_name = "market-property-index"
```

## Operations Automation Agent (OAA)

### Purpose

The Operations Automation Agent provides AI-driven automation for deployment, monitoring, and incident response across the Axiom ecosystem.

### Key Features

- **AI-Driven Decision Making**: Intelligent incident response and resource optimization
- **Automated Deployments**: Zero-touch deployment pipelines with rollback capabilities
- **Resource Optimization**: Dynamic resource allocation based on usage patterns
- **Incident Response**: Automated detection and resolution of system issues
- **Performance Monitoring**: Real-time performance tracking and alerting

### Architecture

```
┌─────────────────────────────────────────┐
│     Operations Automation Agent        │
├─────────────────────────────────────────┤
│  Request Processing & Routing         │
├─────────────────────────────────────────┤
│  AI Decision Engine                  │
│  ├─ Incident Analysis                │
│  ├─ Resource Optimization           │
│  └─ Deployment Planning              │
├─────────────────────────────────────────┤
│  Automation Workflows                │
│  ├─ Deployment Pipeline              │
│  ├─ Incident Response               │
│  └─ Resource Management             │
├─────────────────────────────────────────┤
│  Monitoring Integration               │
│  ├─ Metrics Collection               │
│  ├─ Alert Processing                │
│  └─ Performance Analysis            │
└─────────────────────────────────────────┘
```

### API Endpoints

#### Deployment
```http
POST /api/operations/deploy
Content-Type: application/json

{
  "service": "market-analyst-agent",
  "version": "2.1.3",
  "environment": "production",
  "config": {
    "resources": {
      "cpu": "500m",
      "memory": "512Mi",
      "replicas": 2
    },
    "healthChecks": {
      "enabled": true,
      "path": "/health",
      "interval": 30
    }
  }
}
```

#### Incident Management
```http
POST /api/operations/incidents
Content-Type: application/json

{
  "severity": "medium",
  "service": "api-gateway",
  "description": "High response time detected",
  "metrics": {
    "responseTime": 1250,
    "errorRate": 2.3,
    "cpuUsage": 78
  }
}
```

#### Resource Optimization
```http
GET /api/operations/optimization/recommendations?service=market-analyst-agent
```

### Configuration

```yaml
# src/infra/agents/operations-automation/wrangler.toml
name = "operations-automation-agent"
main = "src/index.ts"
compatibility_date = "2023-10-30"

[env.production.vars]
GEMINI_API_KEY = ""
ORACLE_VM_ENDPOINT = ""
AXIOM_SECRET_KEY = ""
DEPLOYMENT_WEBHOOK = ""
MONITORING_WEBHOOK = ""
INCIDENT_WEBHOOK = ""

[[env.production.d1_databases]]
binding = "OPERATIONS_DB"
database_name = "axiom-operations"

[[env.production.d1_databases]]
binding = "INCIDENT_DB"
database_name = "axiom-incidents"

[[env.production.kv_namespaces]]
binding = "OPERATIONS_CACHE"
id = "operations-cache-namespace"
```

## Secure IDP Pipeline

### Purpose

The Secure IDP Pipeline provides unified authentication and authorization with support for SSO, MFA, and OAuth2 integrations with major identity providers.

### Key Features

- **Single Sign-On (SSO)**: Unified authentication across all Axiom services
- **Multi-Factor Authentication (MFA)**: Enhanced security with multiple authentication factors
- **OAuth2 Integration**: Support for Google, Microsoft, and Apple identity providers
- **Session Management**: Secure session handling with configurable policies
- **Security Compliance**: GDPR, SOC2, and other regulatory compliance features

### Architecture

```
┌─────────────────────────────────────────┐
│        Secure IDP Pipeline            │
├─────────────────────────────────────────┤
│  Authentication Gateway               │
├─────────────────────────────────────────┤
│  Identity Providers                  │
│  ├─ Google OAuth2                   │
│  ├─ Microsoft OAuth2                 │
│  ├─ Apple OAuth2                    │
│  └─ Local Authentication            │
├─────────────────────────────────────────┤
│  Security Layer                      │
│  ├─ MFA Verification                │
│  ├─ Session Management               │
│  ├─ Rate Limiting                   │
│  └─ Brute Force Protection         │
├─────────────────────────────────────────┤
│  Authorization Engine                │
│  ├─ Role-Based Access Control        │
│  ├─ Permission Management            │
│  └─ Policy Enforcement              │
└─────────────────────────────────────────┘
```

### API Endpoints

#### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "mfaCode": "123456"
}
```

#### OAuth2 Authorization
```http
GET /api/auth/oauth2/google/authorize?redirect_uri=https://axiom.example.com/callback&state=random123
```

#### Session Management
```http
GET /api/auth/sessions
POST /api/auth/sessions/validate
DELETE /api/auth/sessions/{sessionId}
```

#### User Profile
```http
GET /api/auth/profile
PUT /api/auth/profile
DELETE /api/auth/profile
```

### Configuration

```yaml
# src/infra/agents/secure-idp/wrangler.toml
name = "secure-idp-pipeline"
main = "src/index.ts"
compatibility_date = "2023-10-30"

[env.production.vars]
GEMINI_API_KEY = ""
ORACLE_VM_ENDPOINT = ""
AXIOM_SECRET_KEY = ""
JWT_SECRET = ""
MFA_SECRET = ""
OAUTH_GOOGLE_CLIENT_ID = ""
OAUTH_GOOGLE_CLIENT_SECRET = ""
OAUTH_MICROSOFT_CLIENT_ID = ""
OAUTH_MICROSOFT_CLIENT_SECRET = ""
OAUTH_APPLE_CLIENT_ID = ""
OAUTH_APPLE_PRIVATE_KEY = ""

[[env.production.d1_databases]]
binding = "IDENTITY_DB"
database_name = "axiom-identity"

[[env.production.d1_databases]]
binding = "SESSION_DB"
database_name = "axiom-sessions"

[[env.production.kv_namespaces]]
binding = "SESSION_CACHE"
id = "session-cache-namespace"
```

## Integration Layer

### API Gateway

The API Gateway serves as the central router for all Phase 3 components, providing unified access control, rate limiting, and request routing.

#### Configuration

```yaml
# src/infra/integration/api-gateway/wrangler.toml
name = "api-gateway"
main = "src/index.ts"
compatibility_date = "2023-10-30"

[env.production.vars]
GEMINI_API_KEY = ""
ORACLE_VM_ENDPOINT = ""
AXIOM_SECRET_KEY = ""

[[env.production.d1_databases]]
binding = "GATEWAY_DB"
database_name = "axiom-gateway"

[[env.production.kv_namespaces]]
binding = "GATEWAY_CACHE"
id = "gateway-cache-namespace"
```

#### Communication Protocols

```typescript
// src/infra/integration/protocols/src/index.ts

// Standardized request/response format
interface AxiomRequest {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  payload: any;
  metadata: {
    userId?: string;
    sessionId?: string;
    requestId: string;
    version: string;
  };
}

interface AxiomResponse {
  id: string;
  requestId: string;
  timestamp: string;
  status: 'success' | 'error';
  payload: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    processingTime: number;
    version: string;
  };
}

// Component communication protocol
interface ComponentMessage {
  type: 'request' | 'response' | 'event' | 'alert';
  source: string;
  destination: string;
  timestamp: string;
  payload: any;
}
```

## Deployment Guide

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Wrangler CLI** (latest version)
3. **Cloudflare Account** with appropriate permissions
4. **Domain names** for each component
5. **API keys** for external services

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/axiom/axiom-core-deployment.git
cd axiom-core-deployment
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy environment template
cp .env.example .env.production

# Edit with your values
nano .env.production
```

4. Authenticate with Cloudflare:
```bash
wrangler auth login
```

### Deployment Process

1. **Deploy Individual Components**:
```bash
# Market Analyst Agent
cd src/infra/agents/market-analyst
wrangler deploy --env production

# Operations Automation Agent
cd src/infra/agents/operations-automation
wrangler deploy --env production

# Secure IDP Pipeline
cd src/infra/agents/secure-idp
wrangler deploy --env production

# API Gateway
cd src/infra/integration/api-gateway
wrangler deploy --env production
```

2. **Deploy All Components**:
```bash
chmod +x scripts/deploy-phase3.sh
./scripts/deploy-phase3.sh production us-central1 axiom-core-deployment
```

3. **Verify Deployment**:
```bash
# Check component health
curl https://market-analyst.axiom.example.com/health
curl https://operations-automation.axiom.example.com/health
curl https://secure-idp.axiom.example.com/health
curl https://api-gateway.axiom.example.com/health
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `ORACLE_VM_ENDPOINT` | Oracle VM endpoint URL | Yes |
| `AXIOM_SECRET_KEY` | Axiom system secret key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `MFA_SECRET` | MFA generation secret | Yes |
| `OAUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `OAUTH_MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID | Yes |
| `OAUTH_MICROSOFT_CLIENT_SECRET` | Microsoft OAuth client secret | Yes |
| `OAUTH_APPLE_CLIENT_ID` | Apple OAuth client ID | Yes |
| `OAUTH_APPLE_PRIVATE_KEY` | Apple OAuth private key | Yes |

## Monitoring and Alerting

### Dashboard Access

Access the Phase 3 monitoring dashboard at:
```
https://monitoring.axiom.example.com
```

### Key Metrics

#### Market Analyst Agent
- Response time (target: < 1000ms)
- Error rate (target: < 5%)
- Analysis accuracy (target: > 90%)
- API usage statistics

#### Operations Automation Agent
- Deployment success rate (target: > 95%)
- Incident response time (target: < 5 minutes)
- Resource utilization efficiency
- Automation coverage

#### Secure IDP Pipeline
- Authentication success rate (target: > 99%)
- MFA usage rate (target: > 80%)
- Session security metrics
- OAuth2 integration health

### Alert Configuration

Alerts are configured in `src/infra/monitoring/phase3-monitoring-config.json`:

```json
{
  "components": [
    {
      "name": "Market Analyst Agent",
      "url": "https://market-analyst.axiom.example.com",
      "healthCheckPath": "/health",
      "metricsPath": "/metrics",
      "alertThresholds": {
        "responseTime": 1000,
        "errorRate": 5,
        "cpuUsage": 80,
        "memoryUsage": 85
      }
    }
  ],
  "notificationChannels": [
    {
      "type": "email",
      "recipients": ["devops@axiom.example.com"]
    },
    {
      "type": "slack",
      "webhook": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
    }
  ]
}
```

## Testing Framework

### Test Structure

The testing framework is organized into three levels:

1. **Unit Tests**: Individual component functionality
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Complete workflow testing

### Running Tests

1. **All Tests**:
```bash
npm run test:phase3
```

2. **Component-Specific Tests**:
```bash
npm run test:phase3:market-analyst
npm run test:phase3:operations-automation
npm run test:phase3:secure-idp
```

3. **Integration Tests**:
```bash
npm run test:phase3:integration
```

### Test Framework Usage

```typescript
import { Phase3TestRunner } from './src/testing/phase3/Phase3TestRunner';

const runner = new Phase3TestRunner();

// Run all tests
const results = await runner.runAllTests();

// Run specific component tests
const marketAnalystResults = await runner.runComponentTests('Market Analyst Agent');

// Run integration tests
const integrationResults = await runner.runIntegrationTests();

// Generate report
const report = runner.generateTestReport();
console.log(report);
```

### Test Coverage

Target test coverage: 80% for all components

Coverage reports are generated in:
```
coverage/phase3/
├── market-analyst/
├── operations-automation/
├── secure-idp/
└── integration/
```

## Security Considerations

### Authentication & Authorization

1. **Zero-Trust Architecture**: All requests require authentication
2. **Multi-Factor Authentication**: Required for all administrative access
3. **Role-Based Access Control**: Granular permission management
4. **Session Management**: Secure session handling with configurable timeouts

### Data Protection

1. **Encryption at Rest**: AES-256 encryption for all stored data
2. **Encryption in Transit**: TLS 1.3 for all network communications
3. **Key Management**: Regular key rotation with secure storage
4. **Data Minimization**: Only collect and store necessary data

### Compliance

1. **GDPR Compliance**: Full compliance with EU data protection regulations
2. **SOC2 Compliance**: Security and availability controls
3. **Industry Standards**: Follow OWASP security guidelines
4. **Regular Audits**: Quarterly security assessments

### Security Monitoring

1. **Real-time Threat Detection**: Automated security monitoring
2. **Anomaly Detection**: AI-powered threat identification
3. **Audit Logging**: Comprehensive audit trails for all actions
4. **Incident Response**: Automated security incident handling

## Troubleshooting

### Common Issues

#### Deployment Failures

1. **Authentication Errors**:
   - Verify Cloudflare authentication: `wrangler whoami`
   - Check environment variables
   - Validate API keys and secrets

2. **Configuration Errors**:
   - Review wrangler.toml files
   - Check database bindings
   - Validate KV namespace configurations

#### Runtime Issues

1. **Performance Problems**:
   - Check resource allocation
   - Monitor D-RAG routing efficiency
   - Review AI API usage limits

2. **Authentication Issues**:
   - Verify JWT configuration
   - Check MFA settings
   - Validate OAuth2 provider configurations

#### Integration Issues

1. **Component Communication**:
   - Check API Gateway routing
   - Verify network connectivity
   - Review authentication tokens

2. **Data Synchronization**:
   - Check database connections
   - Verify data consistency
   - Review replication status

### Debugging Tools

1. **Logs**: Access component logs via Cloudflare dashboard
2. **Metrics**: Review performance metrics in monitoring dashboard
3. **Tracing**: Use distributed tracing for request flow analysis
4. **Testing**: Run component-specific test suites

### Support Contacts

- **DevOps Team**: devops@axiom.example.com
- **Security Team**: security@axiom.example.com
- **On-Call Engineer**: oncall@axiom.example.com
- **Documentation**: https://docs.axiom.example.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial Phase 3 release |
| 1.1.0 | 2024-02-01 | Enhanced monitoring dashboard |
| 1.2.0 | 2024-02-15 | Improved AI decision making |
| 1.3.0 | 2024-03-01 | Added OAuth2 provider support |

---

*This documentation is maintained by the Axiom DevOps team. For updates or corrections, please submit a pull request or contact devops@axiom.example.com.*