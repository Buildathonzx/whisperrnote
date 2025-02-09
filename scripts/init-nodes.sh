#!/bin/bash
set -e

# Configuration
NOTES_PRIMARY_PORT=2427
SYNC_MEDIATOR_PORT=2428
SHARING_COORDINATOR_PORT=2429
SWARM_BASE_PORT=2527

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Initializing WhisperNote nodes...${NC}"

# Initialize Primary Node (notes-primary)
echo -e "${YELLOW}Initializing Primary Node...${NC}"
merod --node-name notes-primary init \
    --server-port $NOTES_PRIMARY_PORT \
    --swarm-port $SWARM_BASE_PORT

# Initialize Sync Node (sync-mediator)
echo -e "${YELLOW}Initializing Sync Node...${NC}"
merod --node-name sync-mediator init \
    --server-port $SYNC_MEDIATOR_PORT \
    --swarm-port $((SWARM_BASE_PORT + 1))

# Initialize Sharing Node (sharing-coordinator)
echo -e "${YELLOW}Initializing Sharing Node...${NC}"
merod --node-name sharing-coordinator init \
    --server-port $SHARING_COORDINATOR_PORT \
    --swarm-port $((SWARM_BASE_PORT + 2))

# Generate identities for each node
echo -e "${YELLOW}Generating node identities...${NC}"

# Store the identity outputs
PRIMARY_IDENTITY=$(merod --node-name notes-primary identity new)
SYNC_IDENTITY=$(merod --node-name sync-mediator identity new)
SHARING_IDENTITY=$(merod --node-name sharing-coordinator identity new)

# Extract public keys
PRIMARY_PUBLIC_KEY=$(echo "$PRIMARY_IDENTITY" | grep "Public key:" | cut -d':' -f2 | tr -d ' ')
SYNC_PUBLIC_KEY=$(echo "$SYNC_IDENTITY" | grep "Public key:" | cut -d':' -f2 | tr -d ' ')
SHARING_PUBLIC_KEY=$(echo "$SHARING_IDENTITY" | grep "Public key:" | cut -d':' -f2 | tr -d ' ')

# Save node information
cat > node-info.txt << EOF
Notes Primary Node:
Server Port: $NOTES_PRIMARY_PORT
Swarm Port: $SWARM_BASE_PORT
Public Key: $PRIMARY_PUBLIC_KEY

Sync Mediator Node:
Server Port: $SYNC_MEDIATOR_PORT
Swarm Port: $((SWARM_BASE_PORT + 1))
Public Key: $SYNC_PUBLIC_KEY

Sharing Coordinator Node:
Server Port: $SHARING_COORDINATOR_PORT
Swarm Port: $((SWARM_BASE_PORT + 2))
Public Key: $SHARING_PUBLIC_KEY
EOF

echo -e "${GREEN}Node initialization complete!${NC}"
echo "Node information has been saved to node-info.txt"