#!/bin/bash

# Phase 3: Intelligence & Ops Deployment Script
# This script deploys all Phase 3 components including Market Analyst Agent, Operations Automation Agent, and Secure IDP Pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
REGION=${2:-us-central1}
PROJECT_ID=${3:-axiom-core-deployment}

# Component URLs
MARKET_ANALYST_URL="https://market-analyst.axiom.example.com"
OPERATIONS_AUTOMATION_URL="https://operations-automation.axiom.example.com"
SECURE_IDP_URL="https://secure-idp.axiom.example.com"
API_GATEWAY_URL="https://api-gateway.axiom.example.com"

# Deployment directories
MARKET_ANALYST_DIR="src/infra/agents/market-analyst"
OPERATIONS_AUTOMATION_DIR="src/infra/agents/operations-automation"
SECURE_IDP_DIR="src/infra/agents/secure-idp"
API_GATEWAY_DIR="src/infra/integration/api-gateway"

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment
validate_environment() {
    log_info "Validating deployment environment..."
    
    # Check required commands
    if ! command_exists wrangler; then
        log_error "Wrangler CLI is not installed. Please install it with: npm install -g wrangler"
        exit 1
    fi
    
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js"
        exit 1
    fi
    
    if ! command_exists npm; then
        log_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check if directories exist
    if [ ! -d "$MARKET_ANALYST_DIR" ]; then
        log_error "Market Analyst Agent directory not found: $MARKET_ANALYST_DIR"
        exit 1
    fi
    
    if [ ! -d "$OPERATIONS_AUTOMATION_DIR" ]; then
        log_error "Operations Automation Agent directory not found: $OPERATIONS_AUTOMATION_DIR"
        exit 1
    fi
    
    if [ ! -d "$SECURE_IDP_DIR" ]; then
        log_error "Secure IDP Pipeline directory not found: $SECURE_IDP_DIR"
        exit 1
    fi
    
    if [ ! -d "$API_GATEWAY_DIR" ]; then
        log_error "API Gateway directory not found: $API_GATEWAY_DIR"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Function to deploy Market Analyst Agent
deploy_market_analyst_agent() {
    log_info "Deploying Market Analyst Agent..."
    
    cd "$MARKET_ANALYST_DIR"
    
    # Install dependencies
    log_info "Installing dependencies for Market Analyst Agent..."
    npm install
    
    # Run tests
    log_info "Running tests for Market Analyst Agent..."
    npm test
    
    # Deploy to Cloudflare Workers
    log_info "Deploying Market Analyst Agent to Cloudflare Workers..."
    wrangler deploy --env "$ENVIRONMENT"
    
    # Verify deployment
    log_info "Verifying Market Analyst Agent deployment..."
    if curl -f -s "$MARKET_ANALYST_URL/health" > /dev/null; then
        log_success "Market Analyst Agent deployed successfully"
    else
        log_error "Market Analyst Agent deployment verification failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Function to deploy Operations Automation Agent
deploy_operations_automation_agent() {
    log_info "Deploying Operations Automation Agent..."
    
    cd "$OPERATIONS_AUTOMATION_DIR"
    
    # Install dependencies
    log_info "Installing dependencies for Operations Automation Agent..."
    npm install
    
    # Run tests
    log_info "Running tests for Operations Automation Agent..."
    npm test
    
    # Deploy to Cloudflare Workers
    log_info "Deploying Operations Automation Agent to Cloudflare Workers..."
    wrangler deploy --env "$ENVIRONMENT"
    
    # Verify deployment
    log_info "Verifying Operations Automation Agent deployment..."
    if curl -f -s "$OPERATIONS_AUTOMATION_URL/health" > /dev/null; then
        log_success "Operations Automation Agent deployed successfully"
    else
        log_error "Operations Automation Agent deployment verification failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Function to deploy Secure IDP Pipeline
deploy_secure_idp_pipeline() {
    log_info "Deploying Secure IDP Pipeline..."
    
    cd "$SECURE_IDP_DIR"
    
    # Install dependencies
    log_info "Installing dependencies for Secure IDP Pipeline..."
    npm install
    
    # Run tests
    log_info "Running tests for Secure IDP Pipeline..."
    npm test
    
    # Deploy to Cloudflare Workers
    log_info "Deploying Secure IDP Pipeline to Cloudflare Workers..."
    wrangler deploy --env "$ENVIRONMENT"
    
    # Verify deployment
    log_info "Verifying Secure IDP Pipeline deployment..."
    if curl -f -s "$SECURE_IDP_URL/health" > /dev/null; then
        log_success "Secure IDP Pipeline deployed successfully"
    else
        log_error "Secure IDP Pipeline deployment verification failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Function to deploy API Gateway
deploy_api_gateway() {
    log_info "Deploying API Gateway..."
    
    cd "$API_GATEWAY_DIR"
    
    # Install dependencies
    log_info "Installing dependencies for API Gateway..."
    npm install
    
    # Run tests
    log_info "Running tests for API Gateway..."
    npm test
    
    # Deploy to Cloudflare Workers
    log_info "Deploying API Gateway to Cloudflare Workers..."
    wrangler deploy --env "$ENVIRONMENT"
    
    # Verify deployment
    log_info "Verifying API Gateway deployment..."
    if curl -f -s "$API_GATEWAY_URL/health" > /dev/null; then
        log_success "API Gateway deployed successfully"
    else
        log_error "API Gateway deployment verification failed"
        exit 1
    fi
    
    cd - > /dev/null
}

# Function to run integration tests
run_integration_tests() {
    log_info "Running integration tests..."
    
    # Run Phase 3 integration tests
    node -e "
    const Phase3TestRunner = require('./src/testing/phase3/Phase3TestRunner.js').default;
    const runner = new Phase3TestRunner();
    
    runner.runIntegrationTests()
        .then(results => {
            const totalTests = results.length;
            const passedTests = results.filter(r => r.status === 'pass').length;
            const failedTests = results.filter(r => r.status === 'fail').length;
            
            console.log(\`Integration tests completed: \${passedTests}/\${totalTests} passed\`);
            
            if (failedTests > 0) {
                console.error('Some integration tests failed');
                process.exit(1);
            } else {
                console.log('All integration tests passed');
                process.exit(0);
            }
        })
        .catch(error => {
            console.error('Integration test execution failed:', error);
            process.exit(1);
        });
    "
    
    if [ $? -eq 0 ]; then
        log_success "Integration tests passed"
    else
        log_error "Integration tests failed"
        exit 1
    fi
}

# Function to configure monitoring
configure_monitoring() {
    log_info "Configuring monitoring for Phase 3 components..."
    
    # Create monitoring configuration
    cat > "src/infra/monitoring/phase3-monitoring-config.json" << EOF
{
  "components": [
    {
      "name": "Market Analyst Agent",
      "url": "$MARKET_ANALYST_URL",
      "healthCheckPath": "/health",
      "metricsPath": "/metrics",
      "alertThresholds": {
        "responseTime": 1000,
        "errorRate": 5,
        "cpuUsage": 80,
        "memoryUsage": 85
      }
    },
    {
      "name": "Operations Automation Agent",
      "url": "$OPERATIONS_AUTOMATION_URL",
      "healthCheckPath": "/health",
      "metricsPath": "/metrics",
      "alertThresholds": {
        "responseTime": 2000,
        "errorRate": 3,
        "cpuUsage": 75,
        "memoryUsage": 80
      }
    },
    {
      "name": "Secure IDP Pipeline",
      "url": "$SECURE_IDP_URL",
      "healthCheckPath": "/health",
      "metricsPath": "/metrics",
      "alertThresholds": {
        "responseTime": 500,
        "errorRate": 1,
        "cpuUsage": 70,
        "memoryUsage": 75
      }
    },
    {
      "name": "API Gateway",
      "url": "$API_GATEWAY_URL",
      "healthCheckPath": "/health",
      "metricsPath": "/metrics",
      "alertThresholds": {
        "responseTime": 300,
        "errorRate": 2,
        "cpuUsage": 65,
        "memoryUsage": 70
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
EOF
    
    log_success "Monitoring configuration created"
}

# Function to generate deployment report
generate_deployment_report() {
    log_info "Generating deployment report..."
    
    REPORT_FILE="deployment-reports/phase3-deployment-$(date +%Y%m%d-%H%M%S).md"
    mkdir -p deployment-reports
    
    cat > "$REPORT_FILE" << EOF
# Phase 3: Intelligence & Ops Deployment Report

## Deployment Information
- **Environment**: $ENVIRONMENT
- **Region**: $REGION
- **Project ID**: $PROJECT_ID
- **Deployment Date**: $(date)
- **Deployed By**: $(whoami)

## Components Deployed

### Market Analyst Agent
- **URL**: $MARKET_ANALYST_URL
- **Status**: ✅ Deployed
- **Health Check**: $MARKET_ANALYST_URL/health

### Operations Automation Agent
- **URL**: $OPERATIONS_AUTOMATION_URL
- **Status**: ✅ Deployed
- **Health Check**: $OPERATIONS_AUTOMATION_URL/health

### Secure IDP Pipeline
- **URL**: $SECURE_IDP_URL
- **Status**: ✅ Deployed
- **Health Check**: $SECURE_IDP_URL/health

### API Gateway
- **URL**: $API_GATEWAY_URL
- **Status**: ✅ Deployed
- **Health Check**: $API_GATEWAY_URL/health

## Integration Tests
- **Status**: ✅ Passed
- **Test Date**: $(date)

## Monitoring
- **Status**: ✅ Configured
- **Dashboard**: https://monitoring.axiom.example.com

## Rollback Instructions
If issues are detected, use the following rollback commands:

### Market Analyst Agent
\`\`\`bash
cd $MARKET_ANALYST_DIR
wrangler rollback --env $ENVIRONMENT
\`\`\`

### Operations Automation Agent
\`\`\`bash
cd $OPERATIONS_AUTOMATION_DIR
wrangler rollback --env $ENVIRONMENT
\`\`\`

### Secure IDP Pipeline
\`\`\`bash
cd $SECURE_IDP_DIR
wrangler rollback --env $ENVIRONMENT
\`\`\`

### API Gateway
\`\`\`bash
cd $API_GATEWAY_DIR
wrangler rollback --env $ENVIRONMENT
\`\`\`

## Next Steps
1. Monitor component health for 24 hours
2. Review performance metrics
3. Verify user acceptance testing
4. Update documentation

## Contact Information
- **DevOps Team**: devops@axiom.example.com
- **On-Call Engineer**: oncall@axiom.example.com
EOF
    
    log_success "Deployment report generated: $REPORT_FILE"
}

# Main deployment function
main() {
    log_info "Starting Phase 3: Intelligence & Ops deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Region: $REGION"
    log_info "Project ID: $PROJECT_ID"
    
    # Validate environment
    validate_environment
    
    # Deploy components
    deploy_market_analyst_agent
    deploy_operations_automation_agent
    deploy_secure_idp_pipeline
    deploy_api_gateway
    
    # Run integration tests
    run_integration_tests
    
    # Configure monitoring
    configure_monitoring
    
    # Generate deployment report
    generate_deployment_report
    
    log_success "Phase 3: Intelligence & Ops deployment completed successfully!"
    log_info "Access the components at:"
    log_info "  - Market Analyst Agent: $MARKET_ANALYST_URL"
    log_info "  - Operations Automation Agent: $OPERATIONS_AUTOMATION_URL"
    log_info "  - Secure IDP Pipeline: $SECURE_IDP_URL"
    log_info "  - API Gateway: $API_GATEWAY_URL"
    log_info "  - Monitoring Dashboard: https://monitoring.axiom.example.com"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"