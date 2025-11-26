#!/bin/bash

# 🕸️ SWARM PROTOCOL - Collaboration System Test Script
# 
# Test script for validating the collaboration system functionality
# Tests session creation, task delegation, team formation, and knowledge sharing
# 
# @author Axiom Core Team
# @version 1.0.0

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COLLABORATION_HUB_URL="${COLLABORATION_HUB_URL:-https://collaboration-hub-production.amrikyy.workers.dev}"
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo -e "${BLUE}🕸️  SWARM PROTOCOL - Collaboration System Test${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Function to print test results
print_result() {
    local test_name=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC} - $test_name: $message"
    else
        echo -e "${YELLOW}⚠️  WARN${NC} - $test_name: $message"
    fi
}

# Function to make API request
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo -e "${BLUE}🔄 Testing: $method $endpoint${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -X GET "$BASE_URL/api/collaboration/$endpoint" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -X POST "$BASE_URL/api/collaboration/$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    echo "$response"
}

# Test 1: Create Collaboration Session
echo -e "${YELLOW}📝 Test 1: Create Collaboration Session${NC}"
session_data='{
    "name": "Test Operation Alpha",
    "description": "Test session for collaboration system validation",
    "type": "realtime",
    "participants": ["tajer", "aqar"],
    "objectives": ["Test API connectivity", "Validate message routing", "Verify task delegation"]
}'

session_response=$(make_request "POST" "sessions" "$session_data")
session_id=$(echo "$session_response" | jq -r '.session.id // empty')

if [ -n "$session_id" ]; then
    print_result "Session Creation" "PASS" "Session created with ID: $session_id"
else
    print_result "Session Creation" "FAIL" "Failed to create session"
    echo -e "${RED}Response: $session_response${NC}"
fi

echo ""

# Test 2: Create Task in Session
echo -e "${YELLOW}📋 Test 2: Create Task in Session${NC}"
if [ -n "$session_id" ]; then
    task_data='{
        "sessionId": "'$session_id'",
        "title": "Test API Integration",
        "description": "Validate task creation and assignment functionality",
        "assignedTo": ["aqar"],
        "assignedBy": "tajer",
        "priority": "high"
    }'
    
    task_response=$(make_request "POST" "tasks" "$task_data")
    task_id=$(echo "$task_response" | jq -r '.task.id // empty')
    
    if [ -n "$task_id" ]; then
        print_result "Task Creation" "PASS" "Task created with ID: $task_id"
    else
        print_result "Task Creation" "FAIL" "Failed to create task"
        echo -e "${RED}Response: $task_response${NC}"
    fi
else
    print_result "Task Creation" "SKIP" "No session available"
fi

echo ""

# Test 3: Create Team
echo -e "${YELLOW}👥 Test 3: Create Team${NC}"
team_data='{
    "name": "Test Alpha Team",
    "description": "Test team for collaboration system validation",
    "type": "temporary",
    "leader": "tajer",
    "members": ["tajer", "aqar", "mawid"]
}'

team_response=$(make_request "POST" "teams" "$team_data")
team_id=$(echo "$team_response" | jq -r '.team.id // empty')

if [ -n "$team_id" ]; then
    print_result "Team Creation" "PASS" "Team created with ID: $team_id"
else
    print_result "Team Creation" "FAIL" "Failed to create team"
    echo -e "${RED}Response: $team_response${NC}"
fi

echo ""

# Test 4: Create Knowledge Entry
echo -e "${YELLOW}🧠 Test 4: Create Knowledge Entry${NC}"
knowledge_data='{
    "title": "Test API Patterns",
    "type": "skill",
    "content": "Best practices for API testing and validation in collaborative systems",
    "contributor": "tajer",
    "tags": ["testing", "api", "collaboration"],
    "quality": 85,
    "usefulness": 90
}'

knowledge_response=$(make_request "POST" "knowledge" "$knowledge_data")
knowledge_id=$(echo "$knowledge_response" | jq -r '.knowledge.id // empty')

if [ -n "$knowledge_id" ]; then
    print_result "Knowledge Creation" "PASS" "Knowledge entry created with ID: $knowledge_id"
else
    print_result "Knowledge Creation" "FAIL" "Failed to create knowledge entry"
    echo -e "${RED}Response: $knowledge_response${NC}"
fi

echo ""

# Test 5: Fetch Sessions List
echo -e "${YELLOW}📊 Test 5: Fetch Sessions List${NC}"
sessions_response=$(make_request "GET" "sessions")
sessions_count=$(echo "$sessions_response" | jq -r '.sessions | length // 0')

if [ "$sessions_count" -gt 0 ]; then
    print_result "Sessions Fetch" "PASS" "Found $sessions_count sessions"
else
    print_result "Sessions Fetch" "FAIL" "No sessions found"
fi

echo ""

# Test 6: Fetch Tasks List
echo -e "${YELLOW}📋 Test 6: Fetch Tasks List${NC}"
tasks_response=$(make_request "GET" "tasks")
tasks_count=$(echo "$tasks_response" | jq -r '.tasks | length // 0')

if [ "$tasks_count" -gt 0 ]; then
    print_result "Tasks Fetch" "PASS" "Found $tasks_count tasks"
else
    print_result "Tasks Fetch" "FAIL" "No tasks found"
fi

echo ""

# Test 7: Fetch Teams List
echo -e "${YELLOW}👥 Test 7: Fetch Teams List${NC}"
teams_response=$(make_request "GET" "teams")
teams_count=$(echo "$teams_response" | jq -r '.teams | length // 0')

if [ "$teams_count" -gt 0 ]; then
    print_result "Teams Fetch" "PASS" "Found $teams_count teams"
else
    print_result "Teams Fetch" "FAIL" "No teams found"
fi

echo ""

# Test 8: Fetch Knowledge List
echo -e "${YELLOW}🧠 Test 8: Fetch Knowledge List${NC}"
knowledge_response=$(make_request "GET" "knowledge")
knowledge_count=$(echo "$knowledge_response" | jq -r '.knowledge | length // 0')

if [ "$knowledge_count" -gt 0 ]; then
    print_result "Knowledge Fetch" "PASS" "Found $knowledge_count knowledge entries"
else
    print_result "Knowledge Fetch" "FAIL" "No knowledge entries found"
fi

echo ""

# Test 9: Test Collaboration Hub Connection
echo -e "${YELLOW}🔌 Test 9: Test Collaboration Hub Connection${NC}"
hub_response=$(curl -s -X POST "$COLLABORATION_HUB_URL/mission/create" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Mission Beta",
        "leader": "tajer",
        "agents": ["aqar", "mawid"]
    }')

hub_status=$(echo "$hub_response" | jq -r '.status // "error"')

if [ "$hub_status" = "created" ]; then
    print_result "Hub Connection" "PASS" "Successfully connected to Collaboration Hub"
else
    print_result "Hub Connection" "FAIL" "Failed to connect to Collaboration Hub"
    echo -e "${RED}Response: $hub_response${NC}"
fi

echo ""
echo -e "${BLUE}🎯 Test Summary${NC}"
echo -e "${BLUE}================${NC}"

# Count passed tests
total_tests=9
passed_tests=$(grep -c "PASS" <<< "$(print_result 2>&1)")
failed_tests=$(grep -c "FAIL" <<< "$(print_result 2>&1)")

echo -e "${GREEN}Passed: $passed_tests/$total_tests${NC}"
echo -e "${RED}Failed: $failed_tests/$total_tests${NC}"

if [ "$passed_tests" -eq "$total_tests" ]; then
    echo -e "${GREEN}🎉 All tests passed! Collaboration system is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the system.${NC}"
    exit 1
fi