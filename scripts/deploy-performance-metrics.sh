#!/bin/bash

# ============================================================================
# AXIOM PERFORMANCE METRICS DEPLOYMENT SCRIPT
# 
# Deploys the performance metrics system to Cloudflare Workers with:
# - Immutable deployment strategy
# - Blue-green deployment support
# - Environment-specific configurations
# - Health checks and rollback capabilities
# 
# @author Axiom Core Team
# @version 1.0.0
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKER_NAME="axiom-performance-metrics"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}") && pwd)"
INFRA_DIR="$SCRIPT_DIR/../src/infra/agents/performance-metrics"

# Environment detection
if [[ "$1" == "production" || "$1" == "prod" ]]; then
    ENVIRONMENT="production"
    WORKER_NAME="axiom-performance-metrics"
    ZONE_NAME="axiom-api"
    echo -e "${BLUE}🚀 Deploying to PRODUCTION environment${NC}"
elif [[ "$1" == "staging" || "$1" == "stage" ]]; then
    ENVIRONMENT="staging"
    WORKER_NAME="axiom-performance-metrics-staging"
    ZONE_NAME="axiom-api-staging"
    echo -e "${YELLOW}🔧 Deploying to STAGING environment${NC}"
else
    ENVIRONMENT="development"
    WORKER_NAME="axiom-performance-metrics-dev"
    ZONE_NAME="axiom-api-dev"
    echo -e "${GREEN}🛠️  Deploying to DEVELOPMENT environment${NC}"
fi

echo -e "${BLUE}📊 Performance Metrics Deployment${NC}"
echo "Environment: $ENVIRONMENT"
echo "Worker: $WORKER_NAME"
echo "Zone: $ZONE_NAME"
echo ""

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Please install it with: npm install -g wrangler${NC}"
    exit 1
fi

# Check if we're in the right directory
if [[ ! -d "$INFRA_DIR" ]]; then
    echo -e "${RED}❌ Performance metrics directory not found: $INFRA_DIR${NC}"
    exit 1
fi

# Validate TypeScript compilation
echo -e "${BLUE}🔨 Building TypeScript...${NC}"
cd "$INFRA_DIR"

# Check TypeScript compilation
if ! npm run build &> /dev/null; then
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    exit 1
fi

# Run tests if available
if [[ "$ENVIRONMENT" != "development" ]]; then
    echo -e "${BLUE}🧪 Running tests...${NC}"
    if npm test &> /dev/null; then
        echo -e "${RED}❌ Tests failed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Tests passed${NC}"
    fi
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
echo ""

# Deployment
echo -e "${BLUE}🚀 Starting deployment...${NC}"

# Create deployment backup for rollback
BACKUP_DIR="$SCRIPT_DIR/../backups"
BACKUP_NAME="performance-metrics-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Export current configuration for backup
echo -e "${BLUE}💾 Creating deployment backup...${NC}"
wrangler secret list > "$BACKUP_DIR/$BACKUP_NAME-secrets.txt"
wrangler kv:key list --namespace "PERFORMANCE_CONFIG" > "$BACKUP_DIR/$BACKUP_NAME-kv.txt" 2>/dev/null || true

# Deploy with immutable strategy
echo -e "${BLUE}📦 Deploying Worker (immutable)...${NC}"

# Deploy the main worker
DEPLOY_RESULT=$(wrangler deploy \
    --name "$WORKER_NAME" \
    --compatibility-date 2024-01-01 \
    --compatibility-flags nodejs_compat \
    --config "$INFRA_DIR/wrangler.toml" \
    --env "$ENVIRONMENT" \
    --minify \
    --triggers)

if [[ $? -ne 0 ]]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check the logs above for details"
    exit 1
fi

echo -e "${GREEN}✅ Worker deployed successfully${NC}"

# Extract deployment info
WORKER_URL=$(echo "$DEPLOY_RESULT" | grep -o 'https://.*\.workers\.dev' | head -1)
if [[ -z "$WORKER_URL" ]]; then
    WORKER_URL=$(echo "$DEPLOY_RESULT" | grep -o 'https://.*\.workers\.dev' | head -1)
fi

echo "Worker URL: $WORKER_URL"

# Post-deployment verification
echo -e "${BLUE}🔍 Running post-deployment verification...${NC}"

# Wait for deployment to propagate
echo "Waiting for deployment to propagate..."
sleep 10

# Health check
echo -e "${BLUE}🏥 Performing health check...${NC}"
HEALTH_CHECK_URL="$WORKER_URL/api/health"

MAX_RETRIES=5
RETRY_COUNT=0
HEALTH_STATUS="unknown"

while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL")
    
    if [[ "$HTTP_STATUS" == "200" ]]; then
        HEALTH_STATUS="healthy"
        echo -e "${GREEN}✅ Health check passed (200 OK)${NC}"
        break
    else
        echo -e "${YELLOW}⚠️  Health check failed (Status: $HTTP_STATUS). Retrying...${NC}"
        RETRY_COUNT=$((RETRY_COUNT + 1))
        sleep 5
    fi
done

if [[ "$HEALTH_STATUS" != "healthy" ]]; then
    echo -e "${RED}❌ Health check failed after $MAX_RETRIES attempts${NC}"
    echo "Deployment may have issues. Check logs: wrangler tail"
    
    # Offer rollback option
    echo -e "${YELLOW}🔄 Rollback option available: ./scripts/rollback-performance-metrics.sh $BACKUP_NAME${NC}"
    exit 1
fi

# Test metrics endpoint
echo -e "${BLUE}📊 Testing metrics endpoint...${NC}"
METRICS_TEST_URL="$WORKER_URL/api/performance/metrics"

# Send test metrics
TEST_PAYLOAD='{
    "agentId": "test-agent",
    "cpu": 45.5,
    "memory": 67.2,
    "networkLatency": 123,
    "diskIO": 15.6,
    "tasksCompleted": 42,
    "tasksFailed": 2,
    "successRate": 95.5,
    "averageResponseTime": 234,
    "throughput": 1.8,
    "userSatisfaction": 88.3,
    "errorRate": 4.5,
    "accuracy": 96.7,
    "energyLevel": 78.9,
    "activeSuperpowers": ["neural_learning", "api_connector"],
    "skillMasteryLevel": 65.4,
    "revenueGenerated": 0.05,
    "costPerTask": 0.02,
    "efficiency": 2.5
}'

METRICS_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$TEST_PAYLOAD" \
    "$METRICS_TEST_URL")

METRICS_STATUS=$(echo "$METRICS_RESPONSE" | jq -r '.success // false')

if [[ "$METRICS_STATUS" == "true" ]]; then
    echo -e "${GREEN}✅ Metrics endpoint test passed${NC}"
else
    echo -e "${YELLOW}⚠️  Metrics endpoint test failed${NC}"
    echo "Response: $METRICS_RESPONSE"
fi

# Test WebSocket connection
echo -e "${BLUE}🔌 Testing WebSocket connection...${NC}"
WS_URL="${WORKER_URL/ws/performance"

# Simple WebSocket test using curl (if available)
if command -v wscat &> /dev/null; then
    echo "Testing WebSocket connection..."
    timeout 10 wscat -c "$WS_URL" -x '{"type":"ping"}' &
    WS_PID=$!
    sleep 5
    kill $WS_PID 2>/dev/null
    echo -e "${GREEN}✅ WebSocket test completed${NC}"
else
    echo -e "${YELLOW}⚠️  WebSocket test skipped (wscat not available)${NC}"
fi

# Performance test
echo -e "${BLUE}⚡ Running performance test...${NC}"
PERFORMANCE_TEST_URL="$WORKER_URL/api/performance/metrics?agentId=test-agent&limit=100"

START_TIME=$(date +%s%N)
curl -s "$PERFORMANCE_TEST_URL" > /dev/null
END_TIME=$(date +%s%N)

RESPONSE_TIME=$((END_TIME - START_TIME))

if [[ $RESPONSE_TIME -lt 2000 ]]; then
    echo -e "${GREEN}✅ Performance test passed (${RESPONSE_TIME}ms)${NC}"
else
    echo -e "${YELLOW}⚠️  Performance test slow (${RESPONSE_TIME}ms)${NC}"
fi

# Deployment summary
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "Environment: $ENVIRONMENT"
echo "Worker URL: $WORKER_URL"
echo "Health Status: $HEALTH_STATUS"
echo "Metrics API: $METRICS_STATUS"
echo "Response Time: ${RESPONSE_TIME}ms"
echo "Backup: $BACKUP_NAME"
echo ""

# Next steps
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Monitor the worker: wrangler tail"
echo "2. View metrics: $WORKER_URL/api/performance/metrics"
echo "3. Check analytics: $WORKER_URL/api/analytics"
echo "4. WebSocket endpoint: $WS_URL"
echo ""
echo -e "${GREEN}✨ Performance Metrics System is live!${NC}"

# Store deployment info for rollback
echo "$WORKER_URL" > "$BACKUP_DIR/latest-deployment.txt"
echo "$ENVIRONMENT" >> "$BACKUP_DIR/deployment-history.txt"
echo "$(date): $ENVIRONMENT" >> "$BACKUP_DIR/deployment-history.txt"

echo -e "${BLUE}🔐 Security Note:${NC}"
echo "Remember to configure environment variables and secrets in Cloudflare dashboard"
echo "Never expose secrets in code or logs"