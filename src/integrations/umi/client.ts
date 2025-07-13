import { createPublicClient, createWalletClient, custom } from 'viem';
import { umiDevnet } from './network';

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
