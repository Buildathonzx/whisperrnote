import { defineChain } from 'viem';

export const umiDevnet = defineChain({
  id: 42069,
  name: 'Umi',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://devnet.uminetwork.com'] } },
});
