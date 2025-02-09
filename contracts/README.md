# Internet Computer (ICP) Devnet Setup

This repository provides a scripts and binaries to set up a local ICP devnet environment and deploy needed contracts and accounts.

## Scripts

- `deploy_devnet_fresh.sh` - Starts a fresh dfx environment and deploys the contracts.
- `deploy_devnet_addon.sh` - Deploys the contracts on already existing dfx environment.

The scripts does the following:
- Creates accounts needed for ledger deployment.
- Deploys the context, ledger and example external contract.
- Funds the deployed context contract for initial usage.
- Calls required initial methods on deployed contracts.

## Documentation

For more detailed documentation about the Internet Computer, refer to the [ICP Developer Docs](https://internetcomputer.org/docs/current/developer-docs/backend/rust/).
For more details about Calimero and its integration with ICP, refer to the [Calimero Getting Started Guide](https://calimero-network.github.io/tutorials/awesome-projects/building-with-icp).

---

### Requirements

Make sure you have the following tools installed:

1. **dfx**  
   Install the Dfinity SDK from [dfx CLI Reference](https://internetcomputer.org/docs/current/developer-docs/developer-tools/cli-tools/cli-reference/).

2. **cargo**  
   Install Rust's package manager and build tool from [Rust Installation Guide](https://www.rust-lang.org/tools/install).

3. **candid-extractor**  
   A utility for generating Candid files. More details can be found in the [Candid Documentation](https://internetcomputer.org/docs/current/developer-docs/backend/rust/generating-candid).


---


### Script Workflow

The scripts performs the following steps:

----
<lb/>

**This step is done only in `deploy_devnet_fresh.sh` script.**
1. Configure `dfx`
- Sets the `dfxvm` value.
- Stops any running instances of `dfx`.
- Removes all cached data, accounts, and wallets.
- Starts a clean `dfx` instance.
----

2. Create Accounts
Once the `dfx` instance is running, the script creates four accounts:
- **Minting**: Used by the ledger contract for deploying new tokens.
- **Initial**: An account with some initial funds, also used by ledger.
- **Archive**: Used by the ledger for archiving transactions.
- **Recipient**: A test wallet for testing transfer functionality from the proxy contract.

3. Deploy Contracts
The script deploys the following contracts, as described in `/context-config/dfx.json`:
- **Context Config Contract**: Manages Calimero contexts.
- **Ledger Contract**: Implements token-related functionalities.

Proxy contract is deployed when context is created. And need to be funded to execute ICP cross-contract calls with depositing and transferring tokens.

- **Proxy Contract**: Used for creating proposals to:
  - Execute ICP cross-contract calls.
  - Setting configuration variables such as minimal threshold of approvals for proposal execution, max proposal number, etc.
  - Execute token transfer functions.

---

## Running the Script

Give execute permissions to the scripts:
```bash
chmod +x deploy_devnet_fresh.sh
chmod +x deploy_devnet_addon.sh
```

Run the desired setup script by executing the following command in your terminal:

```bash
./deploy_devnet_fresh.sh

or

./deploy_devnet_addon.sh
```

Result of script(s) execution:

```bash
=== Deployment Summary ===

Context Contract ID: bkyz2-fmaaa-aaaaa-qaaaq-cai

Ledger Contract ID: bd3sg-teaaa-aaaaa-qaaba-cai

Demo External Contract ID: be2us-64aaa-aaaaa-qaabq-cai

Account Information:

Minting Account: 12a44cc6fe5e63c5e6e12c1394e1f3957923e2fb8bc19c5ab874069b1d7d09be

Initial Account: 7a02180324fe5fd1d166da5b64153aa00733e7668ef09a2768d57f3b46d45150

Archive Principal: 3zco6-bvphl-en3tr-qkj2q-x5nsc-f4f7y-xhepw-p7nn6-oy6u2-ib6fh-sae

Recipient Principal: yv4mq-bsmzs-nic7y-5dgjt-ywfhg-zsejx-v2pmd-gbqxf-w4ofu-hninr-iqe

Deployment completed successfully!
```

## Next Steps

With the local ICP devnet setup complete, you can now:

- **Spin up nodes**: Configure and run nodes for the Internet Computer's local development environment.  
- **Install applications**: Install application in the running nodes.  
- **Create and manage contracts**: Build, deploy, and interact with smart contracts designed for your applications on the Internet Computer through the Dfx or through Calimero proxy contract.

For a detailed guide on setting up your environment and deploying applications, visit the [Calimero Network Getting Started Guide](https://calimero-network.github.io/getting-started/setup).

Code and implementation details can be found:
- For context contract: [calimero-network/core](https://github.com/calimero-network/core/tree/master/contracts/icp/context-config)
- For proxy contract: [calimero-network/core](https://github.com/calimero-network/core/tree/master/contracts/icp/context-proxy)
- Ledger contract is deployed from ICP registry and is not part of this repository.

## Calimero Core

Explore Calimero codebase [here](https://github.com/calimero-network/core).