import { ethers } from 'ethers';
import { getUmiPublicClient, getUmiWalletClient } from './client';
import { getUmiAccount } from './wallet';

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
