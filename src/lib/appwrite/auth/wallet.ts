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

// Minimal provider interface
interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
}

function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum || null;
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
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  const from = accounts[0];
  const signature: string = await eth.request({ method: 'personal_sign', params: [message, from] });
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
