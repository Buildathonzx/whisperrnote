#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Node ports
NOTES_PRIMARY_PORT=2427
SYNC_MEDIATOR_PORT=2428
SHARING_COORDINATOR_PORT=2429

# Function to check node health
check_node_health() {
    local node_name=$1
    local port=$2
    local response
    
    response=$(curl -s -X GET "http://localhost:${port}/health" 2>/dev/null)
    local status=$?
    
    if [ $status -eq 0 ] && [ "$(echo "$response" | jq -r '.status')" == "healthy" ]; then
        echo -e "${GREEN}✓${NC} $node_name is healthy"
        return 0
    else
        echo -e "${RED}✗${NC} $node_name is not responding"
        return 1
    fi
}

# Function to get node metrics
get_node_metrics() {
    local node_name=$1
    local port=$2
    local response
    
    response=$(curl -s -X GET "http://localhost:${port}/metrics" 2>/dev/null)
    if [ $? -eq 0 ]; then
        local connected_peers=$(echo "$response" | jq -r '.connected_peers')
        local sync_status=$(echo "$response" | jq -r '.sync_status')
        local pending_ops=$(echo "$response" | jq -r '.pending_operations')
        
        echo -e "${BLUE}$node_name Metrics:${NC}"
        echo "- Connected Peers: $connected_peers"
        echo "- Sync Status: $sync_status"
        echo "- Pending Operations: $pending_ops"
    else
        echo -e "${RED}Failed to get metrics for $node_name${NC}"
    fi
}

# Function to check context connection
check_context_connection() {
    local node_name=$1
    local port=$2
    
    if [ ! -f "context-info.txt" ]; then
        echo -e "${RED}context-info.txt not found${NC}"
        return 1
    fi
    
    local context_id=$(grep "Context ID:" context-info.txt | cut -d' ' -f3)
    local response
    
    response=$(curl -s -X GET "http://localhost:${port}/admin-api/contexts/${context_id}/status" 2>/dev/null)
    if [ $? -eq 0 ] && [ "$(echo "$response" | jq -r '.connected')" == "true" ]; then
        echo -e "${GREEN}✓${NC} $node_name is connected to context"
        return 0
    else
        echo -e "${RED}✗${NC} $node_name is not connected to context"
        return 1
    fi
}

# Main monitoring loop
while true; do
    clear
    echo -e "${YELLOW}=== WhisperNote Node Monitor ===${NC}"
    echo -e "Press Ctrl+C to exit\n"
    
    # Check node health
    echo -e "${YELLOW}Node Health Status:${NC}"
    check_node_health "Notes Primary" $NOTES_PRIMARY_PORT
    check_node_health "Sync Mediator" $SYNC_MEDIATOR_PORT
    check_node_health "Sharing Coordinator" $SHARING_COORDINATOR_PORT
    echo ""
    
    # Check context connections
    echo -e "${YELLOW}Context Connectivity:${NC}"
    check_context_connection "Notes Primary" $NOTES_PRIMARY_PORT
    check_context_connection "Sync Mediator" $SYNC_MEDIATOR_PORT
    check_context_connection "Sharing Coordinator" $SHARING_COORDINATOR_PORT
    echo ""
    
    # Get node metrics
    echo -e "${YELLOW}Node Metrics:${NC}"
    get_node_metrics "Notes Primary" $NOTES_PRIMARY_PORT
    echo ""
    get_node_metrics "Sync Mediator" $SYNC_MEDIATOR_PORT
    echo ""
    get_node_metrics "Sharing Coordinator" $SHARING_COORDINATOR_PORT
    
    # Check node logs for errors
    echo -e "\n${YELLOW}Recent Errors:${NC}"
    for node in "notes-primary" "sync-mediator" "sharing-coordinator"; do
        if [ -f "logs/${node}.log" ]; then
            errors=$(tail -n 50 "logs/${node}.log" | grep -i "error" || true)
            if [ ! -z "$errors" ]; then
                echo -e "${RED}${node}:${NC}"
                echo "$errors"
            fi
        fi
    done
    
    sleep 10
done