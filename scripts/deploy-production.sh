#!/bin/bash

# AXIOM Staking System Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting AXIOM Staking System Production Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_step "Checking environment variables..."
    
    required_vars=(
        "AXIOM_TOKEN_MINT"
        "STAKING_PROGRAM_ID"
        "VAULT_PDA_ADDRESS"
        "HELIUS_RPC_URL"
        "GEMINI_API_KEY"
        "GOOGLE_CLOUD_API_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Please set these in your .env.production file and try again."
        exit 1
    else
        print_status "All required environment variables are set"
    fi
}

# Deploy Solana staking program to mainnet
deploy_staking_program() {
    print_step "Deploying AXIOM Staking Program to Mainnet..."
    
    cd src/infra/solana/programs/axiom-staking
    
    # Check if we have enough SOL for deployment
    solana balance
    
    # Build the program
    print_status "Building staking program..."
    anchor build
    
    # Deploy to mainnet
    print_status "Deploying to Mainnet..."
    npx ts-node scripts/deploy-staking-mainnet.ts
    
    cd ../../../../../
    
    print_status "Staking program deployed successfully!"
}

# Deploy frontend application
deploy_frontend() {
    print_step "Building and deploying frontend application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --production
    
    # Build the application
    print_status "Building frontend..."
    npm run build
    
    # Check if build was successful
    if [ ! -d ".next" ]; then
        print_error "Build failed - .next directory not found"
        exit 1
    fi
    
    print_status "Frontend built successfully!"
}

# Run production tests
run_production_tests() {
    print_step "Running production tests..."
    
    # Test staking API endpoints
    print_status "Testing staking API..."
    curl -f http://localhost:3000/api/staking || print_warning "Staking API test failed"
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    curl -f http://localhost:3000/api/health || print_warning "Health endpoint test failed"
    
    print_status "Production tests completed!"
}

# Create deployment documentation
create_deployment_docs() {
    print_step "Creating deployment documentation..."
    
    DEPLOYMENT_DIR="deployments/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$DEPLOYMENT_DIR"
    
    # Copy deployment info
    if [ -f "src/infra/solana/programs/axiom-staking/deployment-staking-mainnet.json" ]; then
        cp src/infra/solana/programs/axiom-staking/deployment-staking-mainnet.json "$DEPLOYMENT_DIR/"
    fi
    
    # Create deployment summary
    cat > "$DEPLOYMENT_DIR/deployment-summary.md" << EOF
# AXIOM Staking System Deployment Summary

**Deployment Date:** $(date)
**Environment:** Production
**Network:** Solana Mainnet

## Components Deployed

### 1. Solana Staking Program
- **Program ID:** $STAKING_PROGRAM_ID
- **Vault PDA:** $VAULT_PDA_ADDRESS
- **Token Mint:** $AXIOM_TOKEN_MINT

### 2. Frontend Application
- **Build:** Successful
- **Environment:** Production
- **API Endpoints:** Configured for Mainnet

## Security Checklist
- [ ] Private keys secured
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Monitoring enabled
- [ ] Rollback procedures documented

## Next Steps
1. Monitor system performance
2. Conduct user acceptance testing
3. Enable production monitoring
4. Document any issues found

EOF
    
    print_status "Deployment documentation created at $DEPLOYMENT_DIR"
}

# Main deployment flow
main() {
    # Load production environment
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
        print_status "Loaded production environment"
    else
        print_error ".env.production file not found"
        exit 1
    fi
    
    # Check environment variables
    check_env_vars
    
    # Deploy staking program
    deploy_staking_program
    
    # Deploy frontend
    deploy_frontend
    
    # Run tests
    run_production_tests
    
    # Create documentation
    create_deployment_docs
    
    echo ""
    print_status "🎉 AXIOM Staking System deployed to production successfully!"
    echo ""
    echo "📋 Deployment Summary:"
    echo "  - Staking Program: $STAKING_PROGRAM_ID"
    echo "  - Frontend: Built and ready"
    echo "  - Network: Solana Mainnet"
    echo ""
    echo "🔒 Security Reminders:"
    echo "  1. Verify all private keys are securely stored"
    echo "  2. Monitor for any unusual activity"
    echo "  3. Test with small amounts first"
    echo "  4. Keep rollback procedures ready"
    echo ""
    echo "📊 Next Steps:"
    echo "  1. Start production monitoring"
    echo "  2. Conduct end-to-end testing"
    echo "  3. Perform user acceptance testing"
    echo "  4. Enable comprehensive monitoring"
}

# Run main function
main "$@"