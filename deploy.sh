#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Run the node setup first
./setup-nodes.sh &
NODE_SETUP_PID=$!

# Wait for nodes to be fully initialized (check context-info.txt)
while [ ! -f "context-info.txt" ]; do
    echo "Waiting for nodes to initialize..."
    sleep 5
done

CONTEXT_ID=$(grep "Context ID:" context-info.txt | cut -d' ' -f3)

# Configure dfx environment
dfx start --clean --background

# Deploy canisters
echo -e "${YELLOW}Deploying canisters...${NC}"

# Create canisters
dfx canister create notes_canister
dfx canister create sharing_canister
dfx canister create sync_canister

# Get canister IDs
NOTES_CANISTER_ID=$(dfx canister id notes_canister)
SHARING_CANISTER_ID=$(dfx canister id sharing_canister)
SYNC_CANISTER_ID=$(dfx canister id sync_canister)

# Deploy canisters with appropriate node configuration
dfx deploy notes_canister --argument "(record { 
    node_url = \"http://localhost:2427\";
    context_id = \"$CONTEXT_ID\";
})"

dfx deploy sharing_canister --argument "(record { 
    node_url = \"http://localhost:2429\";
    context_id = \"$CONTEXT_ID\";
})"

dfx deploy sync_canister --argument "(record { 
    node_url = \"http://localhost:2428\";
    context_id = \"$CONTEXT_ID\";
})"

# Save deployment information
cat > deployment-info.txt << EOF
Notes Canister ID: $NOTES_CANISTER_ID
Sharing Canister ID: $SHARING_CANISTER_ID
Sync Canister ID: $SYNC_CANISTER_ID
Context ID: $CONTEXT_ID
EOF

echo -e "${GREEN}Deployment complete!${NC}"
echo "Deployment information saved to deployment-info.txt"

# Start development server
echo -e "${YELLOW}Starting development server...${NC}"
pnpm dev