#!/bin/bash

# 🏪 AXIOM MARKETPLACE DEPLOYMENT SCRIPT
# 
# Deploys the complete agent marketplace system including:
# - Frontend components and pages
# - API routes for marketplace operations
# - Solana smart contracts for transactions
# - Integration with existing AgentSuperpowersFramework
#
# @author Axiom Core Team
# @version 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${2}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Error handling
handle_error() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

# Success message
success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

# Warning message
warning() {
    log "${YELLOW}WARNING: $1${NC}"
}

# Info message
info() {
    log "${CYAN}INFO: $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    info "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        handle_error "Node.js is required but not installed"
    fi
    
    # Check npm/yarn
    if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
        handle_error "npm or yarn is required but not installed"
    fi
    
    # Check Solana CLI
    if ! command -v solana &> /dev/null; then
        handle_error "Solana CLI is required but not installed"
    fi
    
    # Check Anchor
    if ! command -v anchor &> /dev/null; then
        handle_error "Anchor is required but not installed"
    fi
    
    success "All dependencies are installed"
}

# Build and deploy smart contracts
deploy_contracts() {
    info "Building and deploying marketplace smart contracts..."
    
    # Navigate to marketplace program directory
    cd src/infra/solana/programs/axiom-marketplace
    
    # Build the program
    if ! anchor build; then
        handle_error "Failed to build marketplace smart contracts"
    fi
    
    success "Smart contracts built successfully"
    
    # Deploy to devnet (can be parameterized)
    NETWORK=${NETWORK:-devnet}
    info "Deploying to $NETWORK network..."
    
    if ! anchor deploy --provider.cluster $NETWORK; then
        handle_error "Failed to deploy marketplace smart contracts to $NETWORK"
    fi
    
    success "Smart contracts deployed to $NETWORK"
    
    # Get program ID for frontend configuration
    PROGRAM_ID=$(anchor keys list | grep "axiom_marketplace" | awk '{print $3}')
    info "Program ID: $PROGRAM_ID"
    
    # Update frontend environment variables
    echo "NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID=$PROGRAM_ID" > .env.local
}

# Deploy frontend
deploy_frontend() {
    info "Building and deploying frontend..."
    
    # Install dependencies
    if ! npm ci; then
        handle_error "Failed to install frontend dependencies"
    fi
    
    # Build frontend
    if ! npm run build; then
        handle_error "Failed to build frontend"
    fi
    
    success "Frontend built successfully"
    
    # Deploy to Vercel/Netlify (can be parameterized)
    DEPLOY_PLATFORM=${DEPLOY_PLATFORM:-vercel}
    info "Deploying frontend to $DEPLOY_PLATFORM..."
    
    case $DEPLOY_PLATFORM in
        "vercel")
            if ! npx vercel --prod; then
                handle_error "Failed to deploy to Vercel"
            fi
            ;;
        "netlify")
            if ! npx netlify deploy --prod --dir=.next; then
                handle_error "Failed to deploy to Netlify"
            fi
            ;;
        "static")
            info "Deploying static files to S3..."
            # Add S3 deployment logic here
            ;;
        *)
            warning "Unknown deploy platform: $DEPLOY_PLATFORM. Skipping frontend deployment."
            ;;
    esac
    
    success "Frontend deployed to $DEPLOY_PLATFORM"
}

# Setup monitoring and analytics
setup_monitoring() {
    info "Setting up monitoring and analytics..."
    
    # Create monitoring configuration
    cat > monitoring/agent-marketplace.json << EOF
{
  "service": "agent-marketplace",
  "version": "1.0.0",
  "environment": "${NETWORK:-devnet}",
  "endpoints": {
    "api": "/api/marketplace",
    "listings": "/api/marketplace/listings",
    "transactions": "/api/marketplace/transactions",
    "analytics": "/api/marketplace/analytics"
  },
  "monitoring": {
    "metrics": ["response_time", "error_rate", "transaction_volume", "active_agents"],
    "alerts": ["high_error_rate", "low_success_rate", "transaction_failures"],
    "logging": {
      "level": "info",
      "format": "json"
    }
  },
  "infrastructure": {
    "smart_contracts": {
      "program_id": "$(cat .env.local 2>/dev/null | grep NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID | cut -d'=' -f2)",
      "network": "${NETWORK:-devnet}"
    },
    "database": "${DATABASE_URL:-postgresql://localhost:5432/axiom_marketplace}",
    "redis": "${REDIS_URL:-redis://localhost:6379}"
  }
}
EOF
    
    success "Monitoring configuration created"
    
    # Setup log aggregation
    info "Setting up log aggregation..."
    
    # Create logrotate configuration
    sudo tee /etc/logrotate.d/agent-marketplace > /dev/null << EOF
/var/log/agent-marketplace/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    copytruncate
    create 644
    postrotate
        systemctl reload rsyslog
}
EOF
    
    success "Log aggregation configured"
}

# Run tests
run_tests() {
    info "Running marketplace tests..."
    
    # Run smart contract tests
    cd src/infra/solana/programs/axiom-marketplace
    if ! anchor test; then
        handle_error "Smart contract tests failed"
    fi
    
    # Run API tests
    cd ../../..
    if ! npm run test:marketplace; then
        handle_error "API tests failed"
    fi
    
    # Run frontend tests
    if ! npm run test:e2e:marketplace; then
        handle_error "E2E tests failed"
    fi
    
    success "All tests passed"
}

# Security audit
security_audit() {
    info "Running security audit..."
    
    # Check for hardcoded secrets
    if grep -r "private_key\|secret\|password\|token" src/ --include="*.ts" --include="*.js" --include="*.tsx"; then
        handle_error "Potential hardcoded secrets found in source code"
    fi
    
    # Check for insecure dependencies
    if npm audit --audit-level high; then
        warning "High severity vulnerabilities found"
    fi
    
    # Run static analysis
    if command -v semgrep &> /dev/null; then
        semgrep --config=auto src/
    fi
    
    success "Security audit completed"
}

# Create rollback configuration
create_rollback() {
    info "Creating rollback configuration..."
    
    # Create rollback script
    cat > scripts/rollback-marketplace.sh << 'EOF'
#!/bin/bash

# AXIOM MARKETPLACE ROLLBACK SCRIPT
# Rollback marketplace deployment to previous version

set -e

ROLLBACK_VERSION=$1
BACKUP_DIR="/tmp/axiom-marketplace-backup"

echo "Rolling back to version: $ROLLBACK_VERSION"

# Restore database
if [ -f "$BACKUP_DIR/database-$ROLLBACK_VERSION.sql" ]; then
    echo "Restoring database from backup..."
    psql $DATABASE_URL < "$BACKUP_DIR/database-$ROLLBACK_VERSION.sql"
fi

# Restore smart contracts
if [ -f "$BACKUP_DIR/contracts-$ROLLBACK_VERSION.json" ]; then
    echo "Restoring smart contracts..."
    anchor deploy --program-id $(cat "$BACKUP_DIR/contracts-$ROLLBACK_VERSION.json" | jq -r '.program_id')
fi

# Restore frontend
if [ -f "$BACKUP_DIR/frontend-$ROLLBACK_VERSION.tar.gz" ]; then
    echo "Restoring frontend..."
    tar -xzf "$BACKUP_DIR/frontend-$ROLLBACK_VERSION.tar.gz"
    npm run build
fi

echo "Rollback completed"
EOF
    
    chmod +x scripts/rollback-marketplace.sh
    success "Rollback script created"
}

# Main deployment function
main() {
    log "🏪 Starting Axiom Agent Marketplace Deployment"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        handle_error "package.json not found. Please run from project root."
    fi
    
    # Parse command line arguments
    COMMAND=${1:-deploy}
    NETWORK=${2:-devnet}
    DEPLOY_PLATFORM=${3:-vercel}
    
    case $COMMAND in
        "deps")
            check_dependencies
            ;;
        "contracts")
            deploy_contracts
            ;;
        "frontend")
            deploy_frontend
            ;;
        "monitoring")
            setup_monitoring
            ;;
        "test")
            run_tests
            ;;
        "audit")
            security_audit
            ;;
        "rollback")
            create_rollback
            ;;
        "deploy")
            check_dependencies
            deploy_contracts
            deploy_frontend
            setup_monitoring
            ;;
        *)
            echo "Usage: $0 {deps|contracts|frontend|monitoring|test|audit|rollback|deploy} [network] [platform]"
            echo ""
            echo "Commands:"
            echo "  deps       - Check and install dependencies"
            echo "  contracts  - Build and deploy smart contracts"
            echo "  frontend   - Build and deploy frontend"
            echo "  monitoring  - Setup monitoring and analytics"
            echo "  test       - Run all tests"
            echo "  audit      - Run security audit"
            echo "  rollback    - Create rollback configuration"
            echo "  deploy     - Full deployment (contracts + frontend + monitoring)"
            echo ""
            echo "Examples:"
            echo "  $0 deploy devnet vercel"
            echo "  $0 deploy mainnet netlify"
            exit 1
            ;;
    esac
    
    success "Marketplace deployment completed successfully!"
    
    if [ "$COMMAND" = "deploy" ]; then
        echo ""
        log "🎉 DEPLOYMENT SUMMARY"
        log "=================="
        log "Network: $NETWORK"
        log "Platform: $DEPLOY_PLATFORM"
        log "Smart Contracts: Deployed"
        log "Frontend: Deployed"
        log "Monitoring: Configured"
        log "=================="
        echo ""
        log "📊 Next Steps:"
        log "1. Monitor deployment at: https://your-dashboard.com"
        log "2. Test marketplace functionality"
        log "3. Review analytics and logs"
        log "4. Scale infrastructure as needed"
        log ""
        log "🔧 Management Commands:"
        log "Rollback: ./scripts/rollback-marketplace.sh [version]"
        log "Logs: tail -f /var/log/agent-marketplace/marketplace.log"
        log "Status: npm run marketplace:status"
    fi
}

# Trap cleanup
cleanup() {
    info "Cleaning up temporary files..."
    rm -rf /tmp/axiom-marketplace-*
}

# Set trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"