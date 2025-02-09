#!/bin/bash

# Build and deploy ICP canister
echo "Building ICP notes storage canister..."
dfx build notes_storage

echo "Deploying ICP notes storage canister..."
dfx deploy notes_storage

# Build and deploy Calimero private contexts
echo "Building Calimero private contexts..."
cd logic
./build.sh
cd ..

echo "Deploying Calimero private contexts..."
dfx deploy private_contexts

echo "Setting up cross-canister calls..."
NOTES_CANISTER_ID=$(dfx canister id notes_storage)
PRIVATE_CONTEXTS_ID=$(dfx canister id private_contexts)

# Update configuration with canister IDs
echo "Updating configuration..."
cat > ./src/config.json << EOF
{
  "notes_canister_id": "$NOTES_CANISTER_ID",
  "private_contexts_id": "$PRIVATE_CONTEXTS_ID"
}
EOF

echo "Deployment complete!"