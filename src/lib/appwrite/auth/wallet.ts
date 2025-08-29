import { authenticateWithCustomToken } from './token';

export type NonceResponse = {
  address: string;
  nonceToken: string;
  domain: string;
  uri: string;
  version: string;
  chainId: number;
  statement: string;
  issuedAt: string;
  expirationTime: string;
  // legacy fields may be present but are not required
  nonce?: string;
};

export type WalletAvailability = {
  available: boolean;
  browserExtension: boolean;
  mobileApp: boolean;
  hardwareSupported: boolean;
  recommendedAction: 'install' | 'openApp' | 'connect';
  message: string;
  deepLink?: boolean;
};

export type WalletStatus = {
  connected: boolean;
  address?: string;
  authenticated?: boolean;
};

// Minimal provider interface
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isTrust?: boolean;
}

// Extend window interface for ethereum
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return ethereum || null;
}

export async function requestNonce(address: string): Promise<NonceResponse> {
  const res = await fetch('/api/auth/wallet/nonce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) throw new Error('Failed to request nonce');
  return res.json();
}

export function buildSiweMessage(fields: NonceResponse): string {
  return `${fields.domain} wants you to sign in with your Ethereum account:\n${fields.address}\n\n${fields.statement}\n\nURI: ${fields.uri}\nVersion: ${fields.version}\nChain ID: ${fields.chainId}\nNonce: ${fields.nonceToken}\nIssued At: ${fields.issuedAt}\nExpiration Time: ${fields.expirationTime}`;
}

export async function signMessage(message: string): Promise<string> {
  const eth = getEthereumProvider();
  if (!eth) throw new Error('No injected Ethereum provider');
  const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[];
  const from = accounts[0];
  const signature = await eth.request({ method: 'personal_sign', params: [message, from] }) as string;
  return signature;
}

export async function verifyWalletLogin(params: { address: string; signature: string; nonceToken: string; email?: string }) {
  const res = await fetch('/api/auth/wallet/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Wallet verification failed');
  return data as { success: true; userId: string; secret: string; expire: number } | { status: string; message: string };
}

export function getWalletAvailability(): WalletAvailability {
  try {
    if (typeof window === 'undefined') {
      return {
        available: false,
        browserExtension: false,
        mobileApp: false,
        hardwareSupported: false,
        recommendedAction: 'install',
        message: 'Wallet not available in server environment'
      };
    }

    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!ethereum) {
      return {
        available: false,
        browserExtension: false,
        mobileApp: false,
        hardwareSupported: false,
        recommendedAction: 'install',
        message: isMobile ? 'Install a mobile wallet app' : 'Install MetaMask or another wallet extension',
        deepLink: isMobile
      };
    }

    // Check if it's a browser extension wallet
    const isExtension = !!(ethereum.isMetaMask || ethereum.isCoinbaseWallet || ethereum.isTrust || false);

    return {
      available: true,
      browserExtension: isExtension,
      mobileApp: !isExtension && isMobile,
      hardwareSupported: true, // Assume hardware support if wallet is available
      recommendedAction: 'connect',
      message: 'Wallet detected and ready to connect'
    };
  } catch {
    return {
      available: false,
      browserExtension: false,
      mobileApp: false,
      hardwareSupported: false,
      recommendedAction: 'install',
      message: 'Error checking wallet availability'
    };
  }
}

export async function getWalletStatus(): Promise<WalletStatus> {
  try {
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      return { connected: false };
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
    const connected = accounts.length > 0;

    return {
      connected,
      address: connected ? accounts[0] : undefined,
      authenticated: false // We'll check authentication separately
    };
  } catch {
    return { connected: false };
  }
}

export async function registerWallet(email: string) {
  try {
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      throw new Error('No Ethereum wallet provider found');
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
    const address = accounts[0];

    // Use the existing loginWithWallet function which handles the full flow
    const result = await loginWithWallet(address, email);

    if ('userId' in result) {
      return { success: true, address, userId: result.userId };
    } else {
      throw new Error(result.message || 'Wallet registration failed');
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to register wallet');
  }
}

export async function authenticateWithWallet() {
  try {
    const walletStatus = await getWalletStatus();
    if (!walletStatus.connected || !walletStatus.address) {
      throw new Error('No wallet connected');
    }

    // Use the existing loginWithWallet function
    const result = await loginWithWallet(walletStatus.address);

    if ('userId' in result) {
      return { success: true, userId: result.userId };
    } else {
      return { success: false, error: result.message || 'Authentication failed' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Wallet authentication failed' };
  }
}

export async function loginWithWallet(address: string, email?: string) {
  const nonce = await requestNonce(address);
  const message = buildSiweMessage(nonce);
  const signature = await signMessage(message);
  const verified = await verifyWalletLogin({ address, signature, nonceToken: nonce.nonceToken, email });
  if ('success' in verified && verified.success) {
    await authenticateWithCustomToken(verified.userId);
    return { userId: verified.userId };
  }
  return verified; // e.g., { status: 'email_verification_required', ... }
}
