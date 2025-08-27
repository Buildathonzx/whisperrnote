import { ICPConfig } from './types';

export function getICPConfig(): ICPConfig {
  const canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_BLOCKCHAIN;
  const network = process.env.NEXT_PUBLIC_DFX_NETWORK as 'local' | 'ic';

  if (!canisterId) {
    throw new Error('NEXT_PUBLIC_CANISTER_ID_BLOCKCHAIN environment variable is required');
  }

  if (!network) {
    throw new Error('NEXT_PUBLIC_DFX_NETWORK environment variable is required');
  }

  const host = network === 'local' 
    ? 'http://127.0.0.1:4943' 
    : 'https://ic0.app';

  return {
    canisterId,
    network,
    host,
  };
}

export function validateICPConfig(config: ICPConfig): boolean {
  return !!(config.canisterId && config.network && config.host);
}

export function isICPEnabled(): boolean {
  const enabled = process.env.NEXT_PUBLIC_INTEGRATION_ICP;
  return enabled === 'true';
}