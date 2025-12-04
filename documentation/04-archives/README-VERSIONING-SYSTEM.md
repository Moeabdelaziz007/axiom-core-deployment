# 🔄 AXIOM AGENT VERSIONING AND ROLLBACK SYSTEM

A comprehensive versioning and rollback system for Axiom agents with semantic versioning, blue-green deployments, database migrations, and hot updates.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Initialize versioning system
npx ts-node scripts/axiom-versioning-cli.ts init

# Create your first version
npx ts-node scripts/axiom-versioning-cli.ts create-version -i patch -c "Initial release"

# Deploy to staging
npx ts-node scripts/axiom-versioning-cli.ts deploy -v 1.0.0 -e staging
```

### Basic Usage

```bash
# Create a new minor version
npx ts-node scripts/axiom-versioning-cli.ts create-version -i minor -c "Added new features"

# Deploy with blue-green strategy
npx ts-node scripts/axiom-versioning-cli.ts deploy -v 1.1.0 -e production -s blue-green

# Emergency rollback
npx ts-node scripts/axiom-versioning-cli.ts rollback -e production --emergency

# Create hot update
npx ts-node scripts/axiom-versioning-cli.ts create-hot-update -v 1.1.0 -p 1 -t bugfix -d "Critical security fix" --critical --immediate

# Check system health
npx ts-node scripts/axiom-versioning-cli.ts health --detailed
```

## 📋 Features

### ✅ Version Management
- **Semantic Versioning**: Automatic MAJOR.MINOR.PATCH version management
- **Version History**: Complete version history with changelog tracking
- **Compatibility Checking**: Automatic version compatibility validation
- **Branch Management**: Support for feature branches and releases

### 🔄 Deployment Strategies
- **Blue-Green**: Zero-downtime deployments with instant rollback
- **Rolling**: Gradual rollout with health monitoring
- **Canary**: Testing with small percentage of traffic
- **All-at-Once**: Immediate deployment to all instances

### 🗄️ Database Migrations
- **Schema Migrations**: Safe database schema changes
- **Data Migrations**: Data transformation and cleanup
- **Rollback Support**: Automatic rollback script generation
- **Dependency Resolution**: Migration dependency management

### 🔥 Hot Updates
- **Live Patching**: Update without full deployment
- **Gradual Rollout**: Percentage-based rollout with monitoring
- **Security Updates**: Immediate deployment for critical fixes
- **A/B Testing**: Compare different update versions
- **Auto-Rollback**: Automatic rollback on threshold breach

### 🛡️ Safety Features
- **Health Checks**: Comprehensive deployment verification
- **Rollback Points**: Automatic rollback point creation
- **Approval Workflows**: Multi-level approval system
- **Monitoring**: Real-time deployment monitoring
- **Notifications**: Slack, email, and webhook notifications

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AXIOM VERSIONING SYSTEM                    │
├─────────────────────────────────────────────────────────┤
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
│  ┌─────────────────────────────────────────────────┐     │
│  │            Database Migration System              │     │
│  │                                                 │     │
│  │ • Schema Migrations                             │     │
│  │ • Data Transformations                         │     │
│  │ • Rollback Support                             │     │
│  │ • Validation                                   │     │
│  └─────────────────────────────────────────────────┘     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐     │
│  │              CI/CD Pipeline                     │     │
│  │                                                 │     │
│  │ • GitHub Actions                               │     │
│  │ • Quality Gates                               │     │
│  │ • Automated Testing                            │     │
│  │ • Environment Promotion                        │     │
│  └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/infra/versioning/
├── AgentVersioningSystem.ts      # Core versioning system
├── DatabaseMigrationSystem.ts   # Database migration manager
├── DeploymentManager.ts         # Deployment orchestration
├── HotUpdateSystem.ts         # Hot update management
└── AxiomSystemCore.ts        # Main orchestrator

src/testing/versioning/
├── VersioningSystemTests.test.ts    # Comprehensive test suite
└── VersioningSystemDocumentation.md # Detailed documentation

scripts/
├── axiom-versioning-cli.ts        # Command-line interface
└── rollback-procedures.ts          # Enhanced rollback procedures

.github/workflows/
└── axiom-versioning-pipeline.yml      # CI/CD pipeline

docs/
├── versioning-system-guide.md     # Complete user guide
└── README-VERSIONING-SYSTEM.md     # This file
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/axiom"
DATABASE_POOL_SIZE="10"

# Versioning Configuration
MAX_ROLLBACK_POINTS="10"
AUTO_ROLLBACK_ON_FAILURE="true"
REQUIRE_APPROVAL_FOR_PRODUCTION="true"

# Deployment Configuration
DEFAULT_DEPLOYMENT_STRATEGY="blue-green"
HEALTH_CHECK_TIMEOUT="30000"
ROLLBACK_THRESHOLD="5"

# Notification Configuration
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
EMAIL_SERVICE_URL="https://api.emailservice.com/..."
```

### Configuration File

Create `axiom-versioning.json` in your project root:

```json
{
  "project": {
    "name": "axiom-agent",
    "version": "1.0.0"
  },
  "versioning": {
    "autoIncrement": true,
    "requireApproval": true,
    "maxVersions": 50
  },
  "deployment": {
    "defaultStrategy": "blue-green",
    "requireApprovalForProduction": true,
    "autoRollbackOnFailure": true,
    "healthCheckTimeout": 30000
  },
  "migrations": {
    "autoRun": false,
    "requireBackup": true,
    "batchSize": 100
  },
  "hotUpdates": {
    "enabled": true,
    "requireApproval": true,
    "autoRollbackThreshold": 5
  },
  "monitoring": {
    "enabled": true,
    "metricsInterval": 60000,
    "alertThresholds": {
      "errorRate": 5,
      "responseTime": 5000,
      "uptime": 99.9
    }
  },
  "notifications": {
    "channels": ["slack", "email"],
    "events": ["started", "completed", "failed", "rolled_back"],
    "templates": {
      "deployment": "🚀 Deployment {{version}} to {{environment}}: {{status}}",
      "rollback": "🔄 Rollback {{version}} on {{environment}}: {{status}}",
      "hotUpdate": "🔥 Hot Update {{version}}-{{patch}}: {{status}}"
    }
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run versioning system tests
npm run test:versioning

# Run with coverage
npm run test:versioning -- --coverage

# Run specific test file
npx vitest src/testing/versioning/VersioningSystemTests.test.ts
```

### Test Coverage

The test suite covers:
- Version creation and management
- Compatibility checking
- Rollback mechanisms
- Database migrations
- Hot update deployments
- CI/CD integration
- Error handling and edge cases

## 🚀 Deployment

### CI/CD Pipeline

The GitHub Actions pipeline provides:

1. **Quality Gates**: Automated testing and validation
2. **Version Management**: Automatic version incrementing
3. **Build Process**: Docker image creation and artifact packaging
4. **Database Migrations**: Schema validation and migration execution
5. **Deployment**: Multiple deployment strategies support
6. **Health Checks**: Comprehensive deployment verification
7. **Rollback**: Automatic rollback on failure
8. **Notifications**: Multi-channel notification system

### Deployment Strategies

#### Blue-Green Deployment

1. Deploy to inactive environment (green)
2. Run comprehensive health checks
3. Switch traffic to green environment
4. Monitor for issues
5. Keep blue environment for rollback

#### Rolling Deployment

1. Update instances in batches
2. Health check each batch
3. Continue until all instances updated
4. Monitor overall system health

#### Canary Deployment

1. Deploy to small subset (5-10%)
2. Monitor closely for issues
3. Gradually increase rollout percentage
4. Full rollout if successful

## 🔄 Rollback Procedures

### Automatic Rollback

- Triggered on health check failures
- Uses pre-created rollback points
- Zero-downtime rollback for blue-green
- Gradual rollback for rolling deployments

### Emergency Rollback

- Instant rollback to last known good state
- Bypasses approval requirements
- Maximum priority rollback execution
- Comprehensive verification after rollback

### Manual Rollback

```bash
# List available rollback points
npx ts-node scripts/axiom-versioning-cli.ts rollback -e production

# Rollback to specific version
npx ts-node scripts/axiom-versioning-cli.ts rollback -e production -v 1.0.0

# Emergency rollback
npx ts-node scripts/axiom-versioning-cli.ts rollback -e production --emergency
```

## 🔥 Hot Updates

### Creating Hot Updates

```bash
# Create security hot update
npx ts-node scripts/axiom-versioning-cli.ts create-hot-update \
  -v 1.0.0 \
  -p 1 \
  -t security \
  -prio critical \
  -d "Fix critical security vulnerability" \
  --critical \
  --immediate

# Create bugfix hot update
npx ts-node scripts/axiom-versioning-cli.ts create-hot-update \
  -v 1.0.0 \
  -p 1 \
  -t bugfix \
  -prio medium \
  -d "Fix memory leak in agent processing"
```

### Hot Update Rollout

- Gradual rollout with monitoring
- Automatic rollback on error threshold breach
- Real-time progress tracking
- A/B testing support

## 📊 Monitoring

### System Metrics

- Deployment success/failure rates
- Average deployment time
- Hot update effectiveness
- System uptime and performance
- Error rates and response times

### Health Checks

- API endpoint monitoring
- Database connection health
- Performance metrics validation
- Security scan results
- Functional test results

## 🛡️ Security

### Security Features

- No hardcoded credentials or secrets
- Encrypted configuration storage
- Role-based access control
- Audit logging for all operations
- Security scanning for hot updates
- Dependency vulnerability scanning

### Best Practices

1. **Always use rollback points** before deployments
2. **Test in staging** before production
3. **Monitor deployments** closely after rollout
4. **Keep rollback plans** up to date
5. **Use approval workflows** for production changes
6. **Document all changes** with changelogs
7. **Regular security audits** of the versioning system
8. **Backup data** before major migrations

## 🔧 Troubleshooting

### Common Issues

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

#### Version Conflicts

**Problem**: Version compatibility errors
```
Error: Version 1.2.0 is not compatible with 1.1.0
```

**Solution**:
1. Check breaking changes in version history
2. Update compatibility matrix
3. Use migration scripts if available
4. Consider using rolling deployment

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

### Getting Help

```bash
# Get CLI help
npx ts-node scripts/axiom-versioning-cli.ts --help

# Get specific command help
npx ts-node scripts/axiom-versioning-cli.ts deploy --help

# Check system status
npx ts-node scripts/axiom-versioning-cli.ts status --detailed

# System health check
npx ts-node scripts/axiom-versioning-cli.ts health
```

## 📚 Documentation

- [Complete User Guide](docs/versioning-system-guide.md)
- [API Reference](src/testing/versioning/VersioningSystemDocumentation.md)
- [Test Documentation](src/testing/versioning/VersioningSystemTests.test.ts)
- [Configuration Reference](src/infra/core/AxiomSystemCore.ts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request
7. Follow the contribution guidelines

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Documentation: [Link to documentation]
- Issues: [Link to issue tracker]
- Discussions: [Link to discussions]
- Email: [Support email]

---

**Built with ❤️ for the Axiom Agent Ecosystem**