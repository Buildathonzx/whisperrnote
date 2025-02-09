#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if node info exists
if [ ! -f "node-info.txt" ]; then
    echo -e "${RED}Error: node-info.txt not found. Please run init-nodes.sh first${NC}"
    exit 1
fi

# Function to start a node in the background
start_node() {
    local node_name=$1
    local log_file="logs/${node_name}.log"
    
    mkdir -p logs
    echo -e "${YELLOW}Starting $node_name...${NC}"
    merod --node-name "$node_name" run > "$log_file" 2>&1 &
    sleep 2 # Wait for node to start
    
    # Check if node started successfully
    if pgrep -f "merod --node-name $node_name" > /dev/null; then
        echo -e "${GREEN}$node_name started successfully${NC}"
    else
        echo -e "${RED}Failed to start $node_name. Check $log_file for details${NC}"
        exit 1
    fi
}

# Create logs directory
mkdir -p logs

# Start all nodes
echo -e "${GREEN}Starting WhisperNote nodes...${NC}"
start_node "notes-primary"
start_node "sync-mediator"
start_node "sharing-coordinator"

# Wait for nodes to be fully ready
sleep 5

# Setup context and connections
echo -e "${YELLOW}Setting up node connections...${NC}"

# Install application on primary node
APP_ID=$(merod --node-name notes-primary application install file ../logic/res/blockchain.wasm | grep -oP 'Installed application: \K.*')

if [ -z "$APP_ID" ]; then
    echo -e "${RED}Failed to install application${NC}"
    exit 1
fi

# Create context on primary node
CONTEXT_OUTPUT=$(merod --node-name notes-primary context create "$APP_ID" --protocol icp)
CONTEXT_ID=$(echo "$CONTEXT_OUTPUT" | grep -oP 'Created context \K[^ ]*')
CONTEXT_IDENTITY=$(echo "$CONTEXT_OUTPUT" | grep -oP 'with identity \K.*')

if [ -z "$CONTEXT_ID" ] || [ -z "$CONTEXT_IDENTITY" ]; then
    echo -e "${RED}Failed to create context${NC}"
    exit 1
fi

# Read public keys from node info
SYNC_PUBLIC_KEY=$(grep -A 2 "Sync Mediator Node:" node-info.txt | grep "Public Key:" | cut -d':' -f2 | tr -d ' ')
SHARING_PUBLIC_KEY=$(grep -A 2 "Sharing Coordinator Node:" node-info.txt | grep "Public Key:" | cut -d':' -f2 | tr -d ' ')

# Invite sync node
SYNC_INVITE=$(merod --node-name notes-primary context invite "$CONTEXT_ID" "$CONTEXT_IDENTITY" "$SYNC_PUBLIC_KEY")
SYNC_PAYLOAD=$(echo "$SYNC_INVITE" | grep -oP 'Invitation payload: \K.*')

# Invite sharing node
SHARING_INVITE=$(merod --node-name notes-primary context invite "$CONTEXT_ID" "$CONTEXT_IDENTITY" "$SHARING_PUBLIC_KEY")
SHARING_PAYLOAD=$(echo "$SHARING_INVITE" | grep -oP 'Invitation payload: \K.*')

# Join context from sync node
merod --node-name sync-mediator context join "$SYNC_PUBLIC_KEY" "$SYNC_PAYLOAD"

# Join context from sharing node
merod --node-name sharing-coordinator context join "$SHARING_PUBLIC_KEY" "$SHARING_PAYLOAD"

# Save context information
cat > context-info.txt << EOF
Application ID: $APP_ID
Context ID: $CONTEXT_ID
Context Identity: $CONTEXT_IDENTITY
EOF

echo -e "${GREEN}WhisperNote node network successfully initialized!${NC}"
echo "Context information has been saved to context-info.txt"
echo -e "Monitor node logs in the logs/ directory"