#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Make all scripts executable
chmod +x scripts/init-nodes.sh
chmod +x scripts/start-nodes.sh
chmod +x scripts/monitor-nodes.sh

echo -e "${YELLOW}WhisperNote Node Setup${NC}"
echo "This script will set up the complete WhisperNote node infrastructure"

# Check requirements
echo -e "\n${YELLOW}Checking requirements...${NC}"
required_commands=("merod" "dfx" "cargo" "pnpm" "jq" "curl")

for cmd in "${required_commands[@]}"; do
    if ! command -v "$cmd" &> /dev/null; then
        echo -e "${RED}Error: $cmd is required but not installed${NC}"
        exit 1
    fi
done

# Build the Rust contracts first
echo -e "\n${YELLOW}Building Rust contracts...${NC}"
(cd logic && ./build.sh)

# Initialize nodes
echo -e "\n${YELLOW}Initializing nodes...${NC}"
./scripts/init-nodes.sh

# Start nodes
echo -e "\n${YELLOW}Starting nodes...${NC}"
./scripts/start-nodes.sh

# Start monitoring in the background
echo -e "\n${YELLOW}Starting node monitor...${NC}"
./scripts/monitor-nodes.sh &
MONITOR_PID=$!

# Save the monitor PID for later cleanup
echo $MONITOR_PID > .monitor-pid

echo -e "\n${GREEN}WhisperNote node infrastructure setup complete!${NC}"
echo "- Node information: node-info.txt"
echo "- Context information: context-info.txt"
echo "- Node logs: logs/ directory"
echo "- Monitor PID: $MONITOR_PID"
echo -e "\nPress Ctrl+C to stop monitoring and shutdown nodes"

# Trap Ctrl+C
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    
    # Kill the monitor
    if [ -f .monitor-pid ]; then
        kill $(cat .monitor-pid)
        rm .monitor-pid
    fi
    
    # Stop all nodes
    pkill -f "merod --node-name" || true
    
    echo -e "${GREEN}Shutdown complete${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for Ctrl+C
wait