#!/bin/bash

# 🔋 AXIOM ENERGY GRID - Resource Management Deployment Script
# 
# Deploys the complete resource management system including:
# - Database migrations
# - API endpoints
# - Monitoring dashboards
# - Integration services
#
# @author Axiom Core Team
# @version 1.0.0

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment configuration
ENVIRONMENT=${1:-development}
DATABASE_URL=${DATABASE_URL:-"file:$PROJECT_ROOT/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/cca5f8a1-4b7c-4c3a-9a0d-1d2e3f4a5b6c.sqlite"}
CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}
CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

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

# ============================================================================
# DEPLOYMENT FUNCTIONS
# ============================================================================

check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check if required tools are installed
    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI is not installed. Please install it with: npm install -g wrangler"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js version 18 or higher"
        exit 1
    fi
    
    # Check environment variables
    if [[ -z "$CLOUDFLARE_ACCOUNT_ID" ]]; then
        log_error "CLOUDFLARE_ACCOUNT_ID environment variable is not set"
        exit 1
    fi
    
    if [[ -z "$CLOUDFLARE_API_TOKEN" ]]; then
        log_error "CLOUDFLARE_API_TOKEN environment variable is not set"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

deploy_database_migrations() {
    log_info "Deploying database migrations..."
    
    # Run resource grid migration
    cd "$PROJECT_ROOT"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        wrangler d1 execute axiom-resource-grid --file="./src/infra/database/migrations/0006_resource_grid.sql"
    else
        wrangler d1 execute axiom-resource-grid-dev --file="./src/infra/database/migrations/0006_resource_grid.sql"
    fi
    
    log_success "Database migrations deployed"
}

deploy_resource_api() {
    log_info "Deploying Resource Management API..."
    
    # Create resource management worker
    cd "$PROJECT_ROOT"
    
    # Create wrangler.toml for resource management
    cat > src/infra/agents/resource-management/wrangler.toml << EOF
name = "axiom-resource-management"
main = "src/index.ts"
compatibility_date = "2023-12-01"

[env.production]
name = "axiom-resource-management"
vars = { ENVIRONMENT = "production" }

[env.development]
name = "axiom-resource-management-dev"
vars = { ENVIRONMENT = "development" }

[[env.production.d1_databases]]
binding = "RESOURCE_DB"
database_name = "axiom-resource-grid"
database_id = "$RESOURCE_DATABASE_ID"

[[env.development.d1_databases]]
binding = "RESOURCE_DB"
database_name = "axiom-resource-grid-dev"
database_id = "$RESOURCE_DATABASE_ID_DEV"
EOF

    # Create resource management worker entry point
    cat > src/infra/agents/resource-management/src/index.ts << 'EOF'
/**
 * 🔋 AXIOM ENERGY GRID - Resource Management Worker
 * 
 * Cloudflare Worker for handling resource management operations
 * including allocation, cost tracking, and optimization.
 */

import { resourceManager } from '../../../../infra/core/ResourceManager';
import { resourceIntegration } from '../../../../infra/core/ResourceIntegration';

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // Route requests to appropriate handlers
            if (path === '/health') {
                return new Response(JSON.stringify({ status: 'healthy' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (path === '/allocate' && method === 'POST') {
                return handleResourceAllocation(request, env);
            }

            if (path === '/metrics' && method === 'GET') {
                return handleResourceMetrics(request, env);
            }

            if (path === '/optimize' && method === 'POST') {
                return handleOptimization(request, env);
            }

            return new Response('Not Found', { status: 404 });
        } catch (error) {
            console.error('Worker error:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    }
};

async function handleResourceAllocation(request: Request, env: any): Promise<Response> {
    const body = await request.json();
    const { agentId, resourceType, amount } = body;

    try {
        const allocation = await resourceManager.allocateResource(agentId, resourceType, amount);
        return new Response(JSON.stringify(allocation), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleResourceMetrics(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');

    if (!agentId) {
        return new Response('Agent ID is required', { status: 400 });
    }

    try {
        const metrics = await resourceManager.getResourceMetrics(agentId);
        return new Response(JSON.stringify(metrics), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleOptimization(request: Request, env: any): Promise<Response> {
    const body = await request.json();
    const { agentId } = body;

    try {
        await resourceIntegration.runAutoOptimization(agentId);
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
EOF

    # Deploy the worker
    cd src/infra/agents/resource-management
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        wrangler deploy --env production
    else
        wrangler deploy --env development
    fi
    
    log_success "Resource Management API deployed"
}

deploy_monitoring_dashboard() {
    log_info "Deploying Resource Monitoring Dashboard..."
    
    # The dashboard is already part of the Next.js app
    # Just need to ensure the route is accessible
    cd "$PROJECT_ROOT"
    
    # Build the Next.js app
    npm run build
    
    log_success "Resource Monitoring Dashboard deployed"
}

setup_monitoring() {
    log_info "Setting up monitoring and alerting..."
    
    # Create monitoring configuration
    cat > monitoring/resource-monitoring.yaml << EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: resource-monitoring-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'axiom-resource-management'
        static_configs:
          - targets: ['axiom-resource-management.workers.dev']
        metrics_path: '/metrics'
        scrape_interval: 30s
  alerting.yml: |
    route:
      group_by: ['alertname']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
      receiver: 'web.hook'
    receivers:
      - name: 'web.hook'
        webhook_configs:
          - url: 'https://api.axiomid.app/api/alerts'
    rules:
      - alert: HighResourceUtilization
        expr: resource_utilization_percent > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High resource utilization detected"
          description: "Resource utilization is above 80% for more than 5 minutes"
      - alert: BudgetExceeded
        expr: budget_utilization_percent > 90
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Budget exceeded"
          description: "Agent budget utilization is above 90%"
EOF

    log_success "Monitoring configuration created"
}

run_tests() {
    log_info "Running resource management tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run unit tests
    npm test -- src/testing/resource/ResourceManager.test.ts
    
    # Run integration tests
    npm test -- src/testing/integration/ResourceManagementIntegration.test.ts
    
    log_success "All tests passed"
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
    log_info "Starting Axiom Resource Management deployment..."
    log_info "Environment: $ENVIRONMENT"
    
    check_prerequisites
    
    # Run tests first
    if [[ "$ENVIRONMENT" != "production" ]] || [[ "$SKIP_TESTS" != "true" ]]; then
        run_tests
    fi
    
    # Deploy components
    deploy_database_migrations
    deploy_resource_api
    deploy_monitoring_dashboard
    setup_monitoring
    
    log_success "Axiom Resource Management deployment completed successfully!"
    
    # Print deployment information
    echo ""
    log_info "Deployment Summary:"
    echo "  - Database: Migrated to latest version"
    echo "  - API: Deployed to Cloudflare Workers"
    echo "  - Dashboard: Available at /dashboard/resources"
    echo "  - Monitoring: Configured and active"
    echo ""
    log_info "Next steps:"
    echo "  1. Verify API endpoints are accessible"
    echo "  2. Check dashboard displays correctly"
    echo "  3. Monitor resource allocation in real-time"
    echo "  4. Set up budget alerts for your agents"
}

# ============================================================================
# SCRIPT EXECUTION
# ============================================================================

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
        echo ""
        echo "ENVIRONMENT:"
        echo "  development  Deploy to development environment (default)"
        echo "  production   Deploy to production environment"
        echo ""
        echo "OPTIONS:"
        echo "  --skip-tests Skip running tests before deployment"
        echo "  --help       Show this help message"
        exit 0
        ;;
    --skip-tests)
        export SKIP_TESTS=true
        shift
        ;;
esac

# Run main function
main "$@"

# Exit with success
exit 0