# Contributing to WhisperNote 🌟

Thank you for your interest in contributing to WhisperNote! This document provides detailed instructions for setting up the development environment and understanding the system architecture.

## Table of Contents
- [System Requirements](#system-requirements)
- [Node Architecture](#node-architecture)
- [Development Setup](#development-setup)
- [Node Configuration](#node-configuration)
- [Local Development](#local-development)
- [Testing](#testing)
- [Creating Pull Requests](#creating-pull-requests)

## System Requirements

- Node.js (v20+)
- Rust (1.75 or later)
- DFX (v0.15.0 or later)
- Calimero SDK (latest)
- IC Wasm Tools
- Candid Extractor
- pnpm (v8+)
- Flutter (3.19+ for mobile/desktop apps)

## Node Architecture

WhisperNote operates on a three-node architecture for enhanced security and reliability:

### 1. Primary Node (notes-primary)
- Main storage node for encrypted notes
- Handles CRUD operations
- Manages version control
- Required configuration:
```bash
merod --node-name notes-primary init --server-port 2427 --swarm-port 2527
```

### 2. Sync Node (sync-mediator)
- Manages real-time synchronization
- Handles conflict resolution
- Maintains backup states
- Required configuration:
```bash
merod --node-name sync-mediator init --server-port 2428 --swarm-port 2528
```

### 3. Sharing Node (sharing-coordinator)
- Manages note sharing operations
- Handles key distribution
- Controls access permissions
- Required configuration:
```bash
merod --node-name sharing-coordinator init --server-port 2429 --swarm-port 2529
```

## Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/whisperrnote.git
   cd whisperrnote
   ```

2. **Install Required Tools:**
   ```bash
   # Install IC Wasm tools
   cargo install ic-wasm
   
   # Install Candid extractor
   cargo install candid-extractor

   # Install dependencies
   pnpm install
   ```

3. **Build and Deploy:**
   ```bash
   # Build WASM modules
   ./predeploy.sh
   
   # Deploy to local network
   ./deploy.sh local
   ```

## Node Configuration

### Creating a Calimero Context

1. **Initialize Context on Primary Node:**
   ```bash
   # Create application instance
   application install file ./logic/res/blockchain.wasm
   
   # Create ICP context
   context create <APPLICATION_ID> --protocol icp
   ```

2. **Generate Node Identities:**
   ```bash
   # On Sync Node
   identity new
   
   # On Sharing Node
   identity new
   ```

3. **Invite Nodes to Context:**
   ```bash
   # From Primary Node, invite Sync Node
   context invite <CONTEXT_ID> <CONTEXT_IDENTITY> <SYNC_NODE_PUBLIC_KEY>
   
   # From Primary Node, invite Sharing Node
   context invite <CONTEXT_ID> <CONTEXT_IDENTITY> <SHARING_NODE_PUBLIC_KEY>
   ```

4. **Join Context from Other Nodes:**
   ```bash
   # On Sync Node
   context join <PRIVATE_KEY> <INVITATION_PAYLOAD>
   
   # On Sharing Node
   context join <PRIVATE_KEY> <INVITATION_PAYLOAD>
   ```

## Local Development

1. **Start the Development Server:**
   ```bash
   pnpm dev
   ```

2. **Build Contracts:**
   ```bash
   cd logic
   ./build.sh
   ```

3. **Deploy Contracts:**
   ```bash
   dfx deploy
   ```

## Testing

1. **Run Unit Tests:**
   ```bash
   pnpm test
   ```

2. **Run Integration Tests:**
   ```bash
   cd logic
   cargo test --package logic -- --nocapture
   ```

3. **End-to-End Tests:**
   ```bash
   pnpm test:e2e
   ```

## Creating Pull Requests

1. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Commit Your Changes:**
   - Follow conventional commits format
   - Include tests for new features
   - Update documentation as needed

3. **Submit Pull Request:**
   - Provide clear description of changes
   - Link related issues
   - Ensure CI passes
   - Request review from maintainers

## Debugging Tips

### Common Issues

1. **Node Synchronization Issues:**
   - Verify network connectivity between nodes
   - Check node logs for sync errors
   - Ensure correct context configuration

2. **Contract Deployment Issues:**
   - Verify DFX version compatibility
   - Check canister cycles
   - Validate contract initialization parameters

3. **Key Management Issues:**
   - Verify key shares distribution
   - Check encryption parameters
   - Validate sharing node configuration

## Architecture Guidelines

When contributing new features, follow these architectural principles:

1. **Security First:**
   - All data must be encrypted before storage
   - Use proper key management practices
   - Implement secure sharing protocols

2. **Data Flow:**
   ```
   Client -> Primary Node -> Sync Node -> Sharing Node
   ```

3. **State Management:**
   - Use atomic operations
   - Implement proper error handling
   - Maintain data consistency across nodes

## Code Style Guidelines

1. **Typescript:**
   - Use strict type checking
   - Follow ESLint configuration
   - Document complex functions

2. **Rust:**
   - Follow Rust style guide
   - Use proper error handling
   - Document public APIs

3. **Testing:**
   - Write unit tests for all features
   - Include integration tests
   - Document test scenarios

## Need Help?

- Join our [Discord](https://discord.gg/whisperrnote)
- Check our [Documentation](https://docs.whisperrnote.space)
- Visit our [Application](https://whisperrnote.space)
- Create an issue on GitHub

Thank you for contributing to WhisperNote! 🚀