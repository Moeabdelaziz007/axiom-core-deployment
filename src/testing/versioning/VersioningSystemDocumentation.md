# 🔄 AXIOM AGENT VERSIONING AND ROLLBACK SYSTEM

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Installation and Setup](#installation-and-setup)
5. [Usage Examples](#usage-examples)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

## Overview

The Axiom Agent Versioning and Rollback System is a comprehensive solution for managing agent deployments with semantic versioning, blue-green deployments, database migrations, and hot updates. This system ensures safe, reliable, and zero-downtime deployments with automatic rollback capabilities.

### Key Features

- **Semantic Versioning**: Automatic version management with MAJOR.MINOR.PATCH format
- **Blue-Green Deployments**: Zero-downtime deployments with instant rollback
- **Database Migrations**: Safe schema and data migrations with rollback support
- **Hot Updates**: Live patching without full deployments
- **Automated Testing**: Integrated quality gates and health checks
- **CI/CD Integration**: GitHub Actions workflow for automated deployments
- **Monitoring**: Real-time deployment monitoring and alerting

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AXIOM VERSIONING SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────┐  │
│  │ Version Control  │  │ Deployment      │  │ Hot Update │  │
│  │ System         │  │ Manager         │  │ System     │  │
│  │                 │  │                 │  │             │  │
│  │ • Semantic     │  │ • Blue-Green   │  │ • Live     │  │
│  │   Versioning   │  │ • Rolling      │  │   Patching  │  │
│  │ • Compatibility │  │ • Canary       │  │ • A/B      │  │
│  │ • History      │  │ • Health       │  │   Testing   │  │
│  │                 │  │   Checks       │  │             │  │
│  └─────────────────┘  └─────────────────┘  └───────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │            Database Migration System              │     │
│  │                                                 │     │
│  │ • Schema Migrations                             │     │
│  │ • Data Transformations                         │     │
│  │ • Rollback Support                             │     │
│  │ • Validation                                   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              CI/CD Pipeline                     │     │
│  │                                                 │     │
│  │ • GitHub Actions                               │     │
│  │ • Quality Gates                               │     │
│  │ • Automated Testing                            │     │
│  │ • Environment Promotion                        │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. AgentVersioningSystem

The core versioning system that manages semantic versions, compatibility, and rollback points.

#### Key Methods

```typescript
// Create new version
const version = await versioningSystem.createVersion('minor', undefined, ['New features']);

// Get version compatibility
const isCompatible = versioningSystem.isCompatible('1.0.0', '1.1.0');

// Create rollback point
const rollbackPoint = await versioningSystem.createRollbackPoint('staging', '1.0.0', 'Backup');

// Execute rollback
const rollbackResult = await versioningSystem.executeRollback(rollbackPoint.id);
```

#### Features

- Semantic version parsing and comparison
- Version compatibility matrix
- Automatic changelog generation
- Rollback point management
- Version history tracking

### 2. DatabaseMigrationSystem

Handles database schema and data migrations with automatic rollback support.

#### Key Methods

```typescript
// Load migrations
await migrationSystem.loadMigrations('./migrations');

// Run migrations
const result = await migrationSystem.runMigrations({
  connection: dbConnection,
  environment: 'production',
  dryRun: false
});

// Validate schema
const validation = await migrationSystem.validateSchema(expectedSchema);
```

#### Features

- Migration dependency resolution
- Automatic rollback script generation
- Schema validation and diff
- Transaction-based execution
- Migration history tracking

### 3. DeploymentManager

Manages deployment strategies with blue-green, rolling, and canary deployments.

#### Key Methods

```typescript
// Start deployment
const deploymentId = await deploymentManager.startDeployment({
  version: '1.0.0',
  environmentId: 'production',
  strategy: 'blue-green',
  healthChecks: [...],
  rollbackOnFailure: true
});

// Get deployment status
const status = deploymentManager.getDeploymentStatus(deploymentId);

// Emergency rollback
await deploymentManager.emergencyRollback('production');
```

#### Features

- Multiple deployment strategies
- Health check integration
- Automatic rollback on failure
- Progress tracking and logging
- Notification system

### 4. HotUpdateSystem

Manages hot updates and live patching with gradual rollout.

#### Key Methods

```typescript
// Create hot update
const hotUpdateId = await hotUpdateSystem.createHotUpdate({
  version: '1.0.0',
  patchVersion: '1',
  type: 'bugfix',
  priority: 'medium',
  description: 'Test hot update',
  critical: false,
  targetVersions: ['1.0.0'],
  rolloutStrategy: 'gradual'
});

// Submit for approval
await hotUpdateSystem.submitForApproval(hotUpdateId);

// Start rollout
await hotUpdateSystem.startRollout(hotUpdateId);
```

#### Features

- Approval workflow
- Security and performance testing
- Gradual rollout strategies
- Automatic rollback on threshold breach
- Real-time monitoring

## Installation and Setup

### Prerequisites

- Node.js 18+
- TypeScript 5+
- Database (PostgreSQL, MySQL, or SQLite)
- CI/CD platform (GitHub Actions recommended)

### Installation

```bash
# Install dependencies
npm install

# Build system
npm run build

# Run tests
npm test
```

### Environment Setup

Create `.env` file:

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/axiom"
DATABASE_POOL_SIZE="10"

# Versioning Configuration
MAX_ROLLBACK_POINTS="10"
AUTO_ROLLBACK_ON_FAILURE="true"
REQUIRE_APPROVAL_FOR_PRODUCTION="true"

# Notification Configuration
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
EMAIL_SERVICE_URL="https://api.emailservice.com/..."

# Deployment Configuration
DEFAULT_DEPLOYMENT_STRATEGY="blue-green"
HEALTH_CHECK_TIMEOUT="30000"
ROLLBACK_THRESHOLD="5"
```

### Database Setup

```sql
-- Create versioning tables
CREATE TABLE schema_migrations (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  checksum TEXT NOT NULL,
  executed_at DATETIME NOT NULL,
  execution_time INTEGER,
  status TEXT NOT NULL
);

CREATE TABLE rollback_points (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  environment_id TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  data TEXT,
  rollback_commands TEXT,
  created_by TEXT,
  approved_by TEXT
);
```

## Usage Examples

### Example 1: Basic Version Management

```typescript
import { AgentVersioningSystem } from './src/infra/versioning/AgentVersioningSystem';

const versioningSystem = new AgentVersioningSystem();

// Create a new minor version
const version = await versioningSystem.createVersion(
  'minor',
  undefined,
  ['Add new agent capabilities', 'Improve performance']
);

console.log(`Created version: ${version.version}`);
console.log(`Semantic version: ${JSON.stringify(version.semanticVersion)}`);

// Check compatibility with previous version
const isCompatible = versioningSystem.isCompatible('1.0.0', '1.1.0');
console.log(`Compatible: ${isCompatible}`);
```

### Example 2: Blue-Green Deployment

```typescript
import { DeploymentManager } from './src/infra/versioning/DeploymentManager';
import { AgentVersioningSystem } from './src/infra/versioning/AgentVersioningSystem';

const versioningSystem = new AgentVersioningSystem();
const deploymentManager = new DeploymentManager(versioningSystem);

// Start blue-green deployment
const deploymentId = await deploymentManager.startDeployment({
  version: '1.1.0',
  environmentId: 'production',
  strategy: 'blue-green',
  healthChecks: [
    {
      id: 'api-health',
      name: 'API Health Check',
      type: 'api',
      endpoint: 'https://api.axiom.com/health',
      method: 'GET',
      expectedStatus: 200,
      timeout: 30000,
      retries: 3
    },
    {
      id: 'database-health',
      name: 'Database Health Check',
      type: 'database',
      timeout: 30000,
      retries: 3
    }
  ],
  rollbackOnFailure: true,
  timeout: 600000,
  dryRun: false,
  notifications: [
    {
      type: 'slack',
      enabled: true,
      recipients: ['#deployments'],
      events: ['started', 'completed', 'failed', 'rolled_back']
    }
  ],
  approvalRequired: true,
  approvers: ['tech-lead', 'product-manager']
});

console.log(`Deployment started: ${deploymentId}`);

// Monitor deployment progress
const checkProgress = async () => {
  const status = deploymentManager.getDeploymentStatus(deploymentId);
  console.log(`Progress: ${status.progress}% - ${status.currentStep}`);
  
  if (status.status === 'completed') {
    console.log('Deployment completed successfully!');
  } else if (status.status === 'failed') {
    console.log(`Deployment failed: ${status.error}`);
  } else {
    setTimeout(checkProgress, 5000);
  }
};

checkProgress();
```

### Example 3: Database Migration

```typescript
import { DatabaseMigrationSystem } from './src/infra/versioning/DatabaseMigrationSystem';

const migrationSystem = new DatabaseMigrationSystem(dbConnection);

// Load migrations from directory
await migrationSystem.loadMigrations('./migrations');

// Run all pending migrations
const result = await migrationSystem.runMigrations({
  connection: dbConnection,
  version: '1.1.0',
  environment: 'production',
  dryRun: false,
  force: false,
  batchSize: 100
});

if (result.success) {
  console.log(`Migrations completed: ${result.executed.length} executed`);
} else {
  console.error(`Migrations failed: ${result.failed.length} failed`);
  result.failed.forEach(failure => {
    console.error(`- ${failure.id}: ${failure.error}`);
  });
}
```

### Example 4: Hot Update Deployment

```typescript
import { HotUpdateSystem } from './src/infra/versioning/HotUpdateSystem';

const hotUpdateSystem = new HotUpdateSystem();

// Create a critical security hot update
const hotUpdateId = await hotUpdateSystem.createHotUpdate({
  version: '1.1.0',
  patchVersion: '1',
  type: 'security',
  priority: 'critical',
  description: 'Fix security vulnerability in agent authentication',
  critical: true,
  targetVersions: ['1.1.0'],
  rolloutStrategy: 'immediate',
  rolloutPercentage: 100,
  rolloutSteps: 1,
  stepDelay: 0,
  autoRollback: true,
  rollbackThreshold: 1,
  script: `
    // Update authentication logic
    const authModule = require('./auth');
    authModule.patchSecurityVulnerability();
  `,
  verificationChecks: [
    {
      id: 'security-check',
      name: 'Security Verification',
      type: 'security',
      timeout: 30000,
      retries: 3
    }
  ],
  rollbackPlan: `
    // Revert authentication changes
    const authModule = require('./auth');
    authModule.revertSecurityPatch();
  `,
  metadata: {
    cve: 'CVE-2024-1234',
    severity: 'critical',
    discoveredBy: 'security-team'
  }
});

// Submit for approval (automatically approved for critical updates)
await hotUpdateSystem.submitForApproval(hotUpdateId);

// Start immediate rollout
await hotUpdateSystem.startRollout(hotUpdateId);

console.log(`Critical hot update deployed: ${hotUpdateId}`);
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|-----------|-------------|---------|----------|
| `DATABASE_URL` | Database connection string | - | Yes |
| `MAX_ROLLBACK_POINTS` | Maximum rollback points to keep | 10 | No |
| `AUTO_ROLLBACK_ON_FAILURE` | Auto-rollback on deployment failure | true | No |
| `REQUIRE_APPROVAL_FOR_PRODUCTION` | Require approval for production | true | No |
| `DEFAULT_DEPLOYMENT_STRATEGY` | Default deployment strategy | blue-green | No |
| `HEALTH_CHECK_TIMEOUT` | Health check timeout in ms | 30000 | No |
| `ROLLBACK_THRESHOLD` | Error rate threshold for rollback | 5 | No |

### Configuration Files

#### versioning.config.json

```json
{
  "versioning": {
    "autoIncrement": {
      "enabled": true,
      "strategy": "conventional-commits"
    },
    "compatibility": {
      "checkBreakingChanges": true,
      "generateMatrix": true
    },
    "changelog": {
      "generate": true,
      "format": "conventional"
    }
  },
  "deployment": {
    "defaultStrategy": "blue-green",
    "healthCheckInterval": 30000,
    "rollbackTimeout": 600000,
    "maxRetries": 3
  },
  "hotUpdates": {
    "enabled": true,
    "defaultRolloutStrategy": "gradual",
    "autoApproval": {
      "critical": true,
      "security": true,
      "bugfix": false
    }
  },
  "notifications": {
    "channels": ["slack", "email"],
    "events": ["started", "completed", "failed", "rolled_back"],
    "templates": {
      "slack": "🚀 Deployment {{version}} to {{environment}}: {{status}}",
      "email": "Deployment {{version}} {{status}}"
    }
  }
}
```

## Best Practices

### Version Management

1. **Use Semantic Versioning**: Follow MAJOR.MINOR.PATCH format
2. **Document Breaking Changes**: Always document breaking changes in changelog
3. **Test Compatibility**: Verify backward compatibility before releases
4. **Tag Releases**: Use Git tags for release versions
5. **Maintain History**: Keep complete version history

### Deployment Strategies

1. **Blue-Green for Production**: Use blue-green for zero-downtime deployments
2. **Canary for Testing**: Use canary for testing with real traffic
3. **Rolling for High Availability**: Use rolling for maintaining availability
4. **Health Checks**: Always include comprehensive health checks
5. **Rollback Planning**: Always create rollback points before deployment

### Database Migrations

1. **Forward and Backward**: Always provide rollback scripts
2. **Transaction Safety**: Use transactions for multi-step migrations
3. **Test Migrations**: Test migrations in staging first
4. **Backup Data**: Create data backups before schema changes
5. **Dependency Management**: Define clear migration dependencies

### Hot Updates

1. **Security First**: Prioritize security updates with immediate rollout
2. **Gradual Rollout**: Use gradual rollout for non-critical updates
3. **Monitor Closely**: Monitor hot updates closely after deployment
4. **Rollback Ready**: Always have rollback plans ready
5. **Test Thoroughly**: Test hot updates in isolated environment

## Troubleshooting

### Common Issues

#### Version Conflicts

**Problem**: Version compatibility errors
```
Error: Version 1.2.0 is not compatible with 1.1.0
```

**Solution**:
1. Check breaking changes in version history
2. Update compatibility matrix
3. Use migration scripts if available

#### Deployment Failures

**Problem**: Deployment fails during health checks
```
Error: Health check failed: API timeout
```

**Solution**:
1. Check health check endpoints
2. Verify network connectivity
3. Increase timeout values
4. Use emergency rollback if needed

#### Migration Issues

**Problem**: Migration stuck in running state
```
Error: Migration 001 stuck in running state
```

**Solution**:
1. Check database connection
2. Verify migration script syntax
3. Check for locked tables
4. Force rollback if necessary

### Debug Mode

Enable debug logging:

```bash
export DEBUG=axiom:versioning:*
export LOG_LEVEL=debug
```

### Health Check Commands

```bash
# Check versioning system status
curl -X GET http://localhost:3000/api/versioning/status

# Check deployment status
curl -X GET http://localhost:3000/api/deployment/{deploymentId}

# Force emergency rollback
curl -X POST http://localhost:3000/api/rollback/emergency \
  -H "Content-Type: application/json" \
  -d '{"environmentId": "production"}'
```

## API Reference

### AgentVersioningSystem

#### Methods

- `createVersion(increment, prerelease?, changelog?, breakingChanges?)`
- `getVersion(version)`
- `getAllVersions()`
- `isCompatible(version1, version2)`
- `createRollbackPoint(environmentId, version, description)`
- `executeRollback(rollbackPointId)`
- `emergencyRollback(environmentId)`

#### Types

- `SemanticVersion`
- `VersionMetadata`
- `RollbackPoint`
- `VersionCompatibility`

### DatabaseMigrationSystem

#### Methods

- `loadMigrations(migrationDir)`
- `addMigration(migration)`
- `getMigrations()`
- `runMigrations(context)`
- `executeMigration(migrationId)`
- `rollbackMigration(migrationId)`
- `validateSchema(expectedSchema)`

#### Types

- `MigrationScript`
- `DatabaseConnection`
- `MigrationResult`
- `SchemaValidationResult`

### DeploymentManager

#### Methods

- `startDeployment(config)`
- `getDeploymentStatus(deploymentId)`
- `executeRollback(deploymentId, rollbackPointId, config)`
- `emergencyRollback(environmentId)`

#### Types

- `DeploymentConfig`
- `DeploymentStatus`
- `HealthCheckResult`
- `TrafficSwitchConfig`

### HotUpdateSystem

#### Methods

- `createHotUpdate(config)`
- `getHotUpdate(id)`
- `getAllHotUpdates()`
- `submitForApproval(hotUpdateId)`
- `approveHotUpdate(hotUpdateId, approver, role, approved, comments?)`
- `runHotUpdateTests(hotUpdateId)`
- `startRollout(hotUpdateId)`
- `rollbackHotUpdate(hotUpdateId)`

#### Types

- `HotUpdateConfig`
- `HotUpdateStatus`
- `HotUpdateRolloutEntry`
- `HotUpdateApproval`
- `HotUpdateTestResult`

## Support

For support and questions:

- Documentation: [Link to documentation]
- Issues: [Link to issue tracker]
- Discussions: [Link to discussions]
- Email: [Support email]

## License

This project is licensed under the MIT License - see the LICENSE file for details.