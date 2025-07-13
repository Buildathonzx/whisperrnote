// --- Umi Network Config ---
import { defineChain } from 'viem';

// Umi devnet chain definition
export const umiDevnet = defineChain({
  id: 42069,
  name: 'Umi',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://devnet.uminetwork.com'] } },
});

// --- Extend for WhisperNote Features ---
// You can add modules for note encryption, decentralized storage, etc., and expose them here for integration.

export * from './network';
export * from './wallet';
export * from './client';
export * from './contract';
// --- Viem Clients ---
export function getUmiPublicClient() {
  return createPublicClient({
    chain: umiDevnet,
    transport: custom(window.ethereum!),
  });
}

export function getUmiWalletClient() {
  return createWalletClient({
    chain: umiDevnet,
    transport: custom(window.ethereum!),
  });
}

// --- Contract Interaction Module ---
export interface ContractConfig {
  address: string;
  abi: any;
}

export class UmiContract {
  private contract: ethers.Contract;
  constructor(public config: ContractConfig) {
    this.contract = new ethers.Contract(config.address, config.abi);
  }

  async getFunctionTx(name: string, params: any[] = []) {
    const fn = this.contract.getFunction(name);
    const tx = await fn.populateTransaction(...params);
    return { to: tx.to as `0x${string}`, data: tx.data as `0x${string}` };
  }

  async callPublic(name: string, params: any[] = []) {
    const { to, data } = await this.getFunctionTx(name, params);
    return await getUmiPublicClient().call({ to, data });
  }

  async sendTx(name: string, params: any[] = []) {
    const { to, data } = await this.getFunctionTx(name, params);
    const account = await getUmiAccount();
    const hash = await getUmiWalletClient().sendTransaction({ account, to, data });
    await getUmiPublicClient().waitForTransactionReceipt({ hash });
    return hash;
  }
}

