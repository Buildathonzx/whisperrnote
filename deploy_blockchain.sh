#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check DFX version
DFX_VERSION=$(dfx --version)
REQUIRED_VERSION="0.15.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$DFX_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then 
    echo -e "${GREEN}DFX version check passed${NC}"
else
    echo -e "${RED}DFX version must be $REQUIRED_VERSION or higher${NC}"
    exit 1
fi

# Build the blockchain canister
echo -e "${YELLOW}Building blockchain canister...${NC}"
dfx build blockchain

# Deploy to local network if in development
if [ "$1" = "local" ]; then
    echo -e "${YELLOW}Deploying to local network...${NC}"
    dfx deploy blockchain
    dfx deploy notes
    dfx canister call blockchain init
fi

# Set up Calimero integration
echo -e "${YELLOW}Setting up Calimero integration...${NC}"
CALIMERO_CONTEXT_ID=$(dfx canister id blockchain)

# Update context configuration
echo -e "${YELLOW}Updating context configuration...${NC}"
cp .env.example .env
sed -i "s/NEXT_PUBLIC_CANISTER_ID_BLOCKCHAIN=.*/NEXT_PUBLIC_CANISTER_ID_BLOCKCHAIN=$CALIMERO_CONTEXT_ID/" .env

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Blockchain Canister ID: $CALIMERO_CONTEXT_ID${NC}"