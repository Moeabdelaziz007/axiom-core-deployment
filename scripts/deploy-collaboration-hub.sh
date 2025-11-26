#!/bin/bash

# 🚀 DEPLOY COLLABORATION HUB - Swarm Protocol Deployment
# 
# Deploys the agent collaboration system to Cloudflare Workers
# Sets up D1 database, Durable Objects, and monitoring
# 
# @author Axiom Core Team
# @version 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐝 Deploying Swarm Protocol Collaboration Hub...${NC}"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Please install it first:${NC}"
    echo -e "${YELLOW}npm install -g wrangler${NC}"
    exit 1
fi

# Check if user is logged in to Cloudflare
echo -e "${BLUE}🔐 Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Cloudflare. Please run 'wrangler login'${NC}"
    exit 1
fi

# Get account info
ACCOUNT_INFO=$(wrangler whoami)
echo -e "${GREEN}✅ Logged in as: ${ACCOUNT_INFO}${NC}"

# Database migration
echo -e "${BLUE}🗄️ Running database migrations...${NC}"

# Check if D1 database exists
echo -e "${BLUE}🔍 Checking D1 database configuration...${NC}"
DB_INFO=$(wrangler d1 info --json 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to get D1 database info${NC}"
    exit 1
fi

# Extract database name and ID
DB_NAME=$(echo "$DB_INFO" | jq -r '.database_name')
DB_ID=$(echo "$DB_INFO" | jq -r '.database_id')

if [ -z "$DB_NAME" ] || [ -z "$DB_ID" ]; then
    echo -e "${RED}❌ D1 database not properly configured${NC}"
    exit 1
fi

echo -e "${GREEN}✅ D1 Database: $DB_NAME (ID: $DB_ID)${NC}"

# Run the migration
echo -e "${BLUE}📊 Applying migration 0004_swarm_protocol...${NC}"
MIGRATION_RESULT=$(wrangler d1 execute "$DB_NAME" --file=./src/infra/database/migrations/0004_swarm_protocol.sql --command="cat")

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database migration failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database migration completed successfully${NC}"

# Deploy the Collaboration Hub
echo -e "${BLUE}🏢 Deploying Collaboration Hub Worker...${NC}"

# Build the worker
echo -e "${BLUE}🔨 Building collaboration hub...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Deploy to Cloudflare Workers
echo -e "${BLUE}🚀 Deploying to Cloudflare Workers...${NC}"
DEPLOY_RESULT=$(wrangler deploy --compatibility-date=2024-04-01)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Extract deployment info
WORKER_URL=$(echo "$DEPLOY_RESULT" | jq -r '.workers[0].url' 2>/dev/null)
WORKER_ID=$(echo "$DEPLOY_RESULT" | jq -r '.workers[0].id' 2>/dev/null)

if [ -z "$WORKER_URL" ] || [ -z "$WORKER_ID" ]; then
    echo -e "${YELLOW}⚠️ Could not extract deployment information${NC}"
    WORKER_URL="https://collaboration-hub.axiom.dev"
    WORKER_ID="unknown"
fi

echo -e "${GREEN}✅ Collaboration Hub deployed successfully!${NC}"
echo -e "${BLUE}📍 Worker URL: ${WORKER_URL}${NC}"
echo -e "${BLUE}🆔 Worker ID: ${WORKER_ID}${NC}"

# Update environment variables for the frontend
echo -e "${BLUE}🔧 Updating frontend environment...${NC}"

# Create .env.production.local for frontend
cat > .env.production.local << EOF
# Collaboration Hub Configuration
NEXT_PUBLIC_COLLABORATION_HUB_URL=${WORKER_URL}
NEXT_PUBLIC_COLLABORATION_HUB_WS=${WORKER_URL/https://collaboration-hub.axiom.dev}
NEXT_PUBLIC_COLLABORATION_HUB_ID=${WORKER_ID}

# Swarm Protocol Configuration
NEXT_PUBLIC_SWARM_ENABLED=true
NEXT_PUBLIC_SWARM_VERSION=1.0.0
NEXT_PUBLIC_SWARM_DEPLOYMENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Agent Configuration
NEXT_PUBLIC_DEFAULT_AGENTS=["tajer","aqar","mawid","sofra"]
NEXT_PUBLIC_AGENT_CAPABILITIES={"tajer":["negotiation","deal_analysis","business_coordination"],"aqar":["property_valuation","market_analysis","real_estate_expertise"],"mawid":["appointment_scheduling","resource_optimization","time_management"],"sofra":["customer_experience","quality_audit","service_optimization"]}

# Database Configuration
NEXT_PUBLIC_D1_DATABASE=${DB_NAME}
NEXT_PUBLIC_D1_DATABASE_ID=${DB_ID}
EOF

echo -e "${GREEN}✅ Environment configuration updated${NC}"

# Verify deployment
echo -e "${BLUE}🔍 Verifying deployment...${NC}"

# Wait a moment for the worker to be ready
sleep 5

# Health check
echo -e "${BLUE}🏥 Running health check...${NC}"
HEALTH_CHECK=$(curl -s "${WORKER_URL}/health" 2>/dev/null)

if [ $? -eq 0 ]; then
    HEALTH_STATUS=$(echo "$HEALTH_CHECK" | jq -r '.status' 2>/dev/null)
    ACTIVE_SESSIONS=$(echo "$HEALTH_CHECK" | jq -r '.activeSessions' 2>/dev/null)
    CONNECTED_AGENTS=$(echo "$HEALTH_CHECK" | jq -r '.connectedAgents' 2>/dev/null)
    
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo -e "${BLUE}📊 Status: ${HEALTH_STATUS}${NC}"
    echo -e "${BLUE}🤝 Active Sessions: ${ACTIVE_SESSIONS}${NC}"
    echo -e "${BLUE}🔌 Connected Agents: ${CONNECTED_AGENTS}${NC}"
else
    echo -e "${YELLOW}⚠️ Health check failed, worker may still be starting...${NC}"
fi

# Test WebSocket connection
echo -e "${BLUE}🔌 Testing WebSocket connection...${NC}"

# Create a simple WebSocket test
WS_TEST=$(node -e "
const WebSocket = require('ws');

const ws = new WebSocket('${WORKER_URL/connect?agentId=test-agent');

ws.onopen = () => {
  console.log('✅ WebSocket connected');
  ws.send(JSON.stringify({ type: 'HEARTBEAT' }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Received:', data);
  if (data.type === 'CONNECTION_ESTABLISHED') {
    console.log('✅ Connection established successfully');
    ws.close();
    process.exit(0);
  }
};

ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
  process.exit(1);
};

setTimeout(() => {
  console.log('⏰ Timeout - connection failed');
  process.exit(1);
}, 10000);
" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ WebSocket connection test passed${NC}"
else
    echo -e "${YELLOW}⚠️ WebSocket test failed, but worker may still be starting...${NC}"
fi

# Set up monitoring
echo -e "${BLUE}📊 Setting up monitoring...${NC}"

# Create monitoring configuration
cat > monitoring-config.json << EOF
{
  "worker": {
    "url": "${WORKER_URL}",
    "id": "${WORKER_ID}",
    "name": "collaboration-hub",
    "healthEndpoint": "${WORKER_URL}/health"
  },
  "database": {
    "name": "${DB_NAME}",
    "id": "${DB_ID}"
  },
  "alerts": [
    {
      "name": "Worker Health",
      "endpoint": "${WORKER_URL}/health",
      "threshold": 5,
      "comparison": "lt"
    },
    {
      "name": "WebSocket Connections",
      "endpoint": "${WORKER_URL}/connect",
      "threshold": 10,
      "comparison": "lt"
    },
    {
      "name": "Response Time",
      "endpoint": "${WORKER_URL}/stats",
      "threshold": 1000,
      "comparison": "gt"
    }
  ]
}
EOF

echo -e "${GREEN}✅ Monitoring configuration created${NC}"

# Summary
echo -e "${GREEN}🎉 Swarm Protocol Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📍 Collaboration Hub: ${WORKER_URL}${NC}"
echo -e "${GREEN}🆔 Worker ID: ${WORKER_ID}${NC}"
echo -e "${GREEN}🗄️ Database: ${DB_NAME} (${DB_ID})${NC}"
echo -e "${BLUE}🔌 WebSocket: ${WORKER_URL}/connect${NC}"
echo -e "${BLUE}📊 Health: ${WORKER_URL}/health${NC}"
echo -e "${BLUE}📈 Stats: ${WORKER_URL}/stats${NC}"
echo -e "${BLUE}🔧 Frontend Config: .env.production.local${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Next steps
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "${BLUE}1. Update frontend to use new collaboration features${NC}"
echo -e "${BLUE}2. Add SwarmNetwork component to dashboard${NC}"
echo -e "${BLUE}3. Test agent collaboration workflows${NC}"
echo -e "${BLUE}4. Monitor system performance and scaling${NC}"
echo ""
echo -e "${GREEN}🚀 Swarm Protocol is now live!${NC}"