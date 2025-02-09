#!/bin/bash

# Build the blockchain canister
echo "Building blockchain canister..."
dfx build blockchain

# Deploy to local network if in development
if [ "$1" = "local" ]; then
    echo "Deploying to local network..."
    dfx deploy blockchain
    dfx deploy notes
    dfx canister call blockchain init
fi

# Set up Calimero integration
echo "Setting up Calimero integration..."
CALIMERO_CONTEXT_ID=$(dfx canister id blockchain)

# Update context configuration
echo "Updating context configuration..."
cp .env.example .env
sed -i "s/NEXT_PUBLIC_CANISTER_ID_BLOCKCHAIN=.*/NEXT_PUBLIC_CANISTER_ID_BLOCKCHAIN=$CALIMERO_CONTEXT_ID/" .env

echo "Deployment complete!"
echo "Blockchain Canister ID: $CALIMERO_CONTEXT_ID"