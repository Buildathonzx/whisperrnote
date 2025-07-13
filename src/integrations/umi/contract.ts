import { ethers } from 'ethers';
import { getUmiPublicClient, getUmiWalletClient } from './client';
import { getUmiAccount } from './wallet';

// Replace with actual deployed contract address and ABI
export const COUNTER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_UMI_COUNTER_CONTRACT_ADDRESS || '';
// import counterAbi from './Counter.json'; // Ensure ABI is available
const counterAbi: any[] = []; // TODO: Replace with actual ABI array

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

export class UmiCounterContract {
  private contract: ethers.Contract;
  constructor() {
    this.contract = new ethers.Contract(COUNTER_CONTRACT_ADDRESS, counterAbi);
  }

  async getCounter() {
    const fn = this.contract.getFunction('get');
    const tx = await fn.populateTransaction(await getUmiAccount());
    const { to, data } = { to: tx.to as `0x${string}`, data: tx.data as `0x${string}` };
    const res = await getUmiPublicClient().call({ to, data });
    // Parse result as needed
    return res;
  }

  async incrementCounter() {
    const fn = this.contract.getFunction('increment');
    const tx = await fn.populateTransaction(await getUmiAccount());
    const { to, data } = { to: tx.to as `0x${string}`, data: tx.data as `0x${string}` };
    const account = await getUmiAccount();
    const hash = await getUmiWalletClient().sendTransaction({ account, to, data });
    await getUmiPublicClient().waitForTransactionReceipt({ hash });
    return hash;
  }
}
