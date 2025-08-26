import { authenticateWithCustomToken } from './token';

/**
 * Wallet connection interface
 */
export interface WalletConnection {
  address: string;
  provider: string;
  chainId?: number;
  userId: string;
  connectedAt: Date;
}

/**
 * Wallet authentication result
 */
export interface WalletAuthResult {
  success: boolean;
  address?: string;
  userId?: string;
  error?: string;
}

/**
 * EIP-1193 compatible wallet provider interface
 */
interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

/**
 * Storage key for wallet connections
 */
const WALLET_STORAGE_KEY = 'whisperrnote_wallet_connections';

/**
 * Get stored wallet connections
 */
function getStoredConnections(): WalletConnection[] {
  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse stored wallet connections:', error);
    return [];
  }
}

/**
 * Store wallet connection
 */
function storeConnection(connection: WalletConnection): void {
  try {
    const connections = getStoredConnections();
    // Remove any existing connection for the same address
    const filtered = connections.filter(c => c.address.toLowerCase() !== connection.address.toLowerCase());
    filtered.push(connection);
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to store wallet connection:', error);
    throw new Error('Failed to store wallet connection');
  }
}

/**
 * Get the Ethereum provider from window
 */
function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  
  // Check for injected providers
  if (window.ethereum) {
    return window.ethereum as EthereumProvider;
  }
  
  return null;
}

/**
 * Detect wallet provider name
 */
function detectWalletProvider(provider: EthereumProvider): string {
  if (provider.isMetaMask) return 'MetaMask';
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet';
  if (provider.isRabby) return 'Rabby';
  return 'Unknown Wallet';
}

/**
 * Generate a unique challenge message for signature
 */
function generateSignatureMessage(address: string, timestamp: number): string {
  return `WhisperRNote Authentication\n\nSign this message to authenticate with WhisperRNote.\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost gas.`;
}

/**
 * Connect to a wallet and get the user's address
 */
export async function connectWallet(): Promise<{ address: string; provider: string; chainId?: number }> {
  try {
    const provider = getEthereumProvider();
    if (!provider) {
      throw new Error('No Ethereum wallet provider found. Please install MetaMask, Coinbase Wallet, or another compatible wallet.');
    }

    // Request account access
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    const address = accounts[0];
    const providerName = detectWalletProvider(provider);

    // Get chain ID
    let chainId: number | undefined;
    try {
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      chainId = parseInt(chainIdHex, 16);
    } catch (error) {
      console.warn('Failed to get chain ID:', error);
    }

    return {
      address: address.toLowerCase(),
      provider: providerName,
      chainId
    };

  } catch (error: any) {
    console.error('Wallet connection failed:', error);
    throw new Error(`Wallet connection failed: ${error.message}`);
  }
}

/**
 * Sign a message with the wallet for authentication
 */
export async function signAuthenticationMessage(address: string): Promise<string> {
  try {
    const provider = getEthereumProvider();
    if (!provider) {
      throw new Error('No wallet provider found');
    }

    const timestamp = Date.now();
    const message = generateSignatureMessage(address, timestamp);

    // Use personal_sign for compatibility with all wallets
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address]
    });

    return signature;

  } catch (error: any) {
    console.error('Message signing failed:', error);
    throw new Error(`Message signing failed: ${error.message}`);
  }
}

/**
 * Register a new wallet connection
 */
export async function registerWallet(): Promise<WalletConnection> {
  try {
    // Connect to wallet
    const { address, provider, chainId } = await connectWallet();
    
    // Sign authentication message
    const signature = await signAuthenticationMessage(address);
    
    // Create user ID from address
    const userId = `wallet_${address.toLowerCase()}`;
    
    // Create connection object
    const connection: WalletConnection = {
      address: address.toLowerCase(),
      provider,
      chainId,
      userId,
      connectedAt: new Date(),
    };

    // Store connection locally
    storeConnection(connection);

    // Create user account with wallet
    await createUserAccountWithWallet(connection, signature);

    return connection;

  } catch (error: any) {
    console.error('Wallet registration failed:', error);
    throw new Error(`Wallet registration failed: ${error.message}`);
  }
}

/**
 * Authenticate with an existing wallet connection
 */
export async function authenticateWithWallet(address?: string): Promise<WalletAuthResult> {
  try {
    const storedConnections = getStoredConnections();
    
    let targetConnection: WalletConnection | undefined;
    
    if (address) {
      // Find specific wallet connection
      targetConnection = storedConnections.find(c => 
        c.address.toLowerCase() === address.toLowerCase()
      );
    } else {
      // Try to connect to any available wallet
      try {
        const { address: connectedAddress } = await connectWallet();
        targetConnection = storedConnections.find(c => 
          c.address.toLowerCase() === connectedAddress.toLowerCase()
        );
      } catch (error) {
        return {
          success: false,
          error: 'No wallet connection available'
        };
      }
    }

    if (!targetConnection) {
      return {
        success: false,
        error: 'Wallet connection not found. Please register first.'
      };
    }

    // Sign authentication message
    const signature = await signAuthenticationMessage(targetConnection.address);
    
    // Verify signature (simplified - in production, verify on server)
    const isValid = await verifyWalletSignature(targetConnection.address, signature);
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid signature'
      };
    }

    // Create session with custom token
    await authenticateWithCustomToken(targetConnection.userId);

    return {
      success: true,
      address: targetConnection.address,
      userId: targetConnection.userId
    };

  } catch (error: any) {
    console.error('Wallet authentication failed:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
}

/**
 * Create user account after successful wallet connection
 */
async function createUserAccountWithWallet(connection: WalletConnection, signature: string): Promise<void> {
  try {
    // Call API to create user and get custom token
    const response = await fetch('/api/auth/wallet/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: connection.userId,
        address: connection.address,
        provider: connection.provider,
        chainId: connection.chainId,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'User creation failed');
    }

    await response.json();
    
    // Create session with the token
    await authenticateWithCustomToken(connection.userId);
    
  } catch (error: any) {
    console.error('Failed to create user account with wallet:', error);
    throw new Error(`Account creation failed: ${error.message}`);
  }
}

/**
 * Simplified signature verification (client-side)
 * In production, this should be done on the server with proper ECDSA verification
 */
async function verifyWalletSignature(address: string, signature: string): Promise<boolean> {
  try {
    // This is a simplified verification
    // In production, proper ECDSA signature verification should be done on the server
    // using libraries like ethers.js or web3.js to recover the address from the signature
    
    // For now, we'll do basic validation
    return !!(
      signature &&
      signature.length >= 132 && // Standard Ethereum signature length (0x + 128 hex chars)
      signature.startsWith('0x') &&
      address &&
      address.length === 42 // Standard Ethereum address length
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Get all stored wallet connections for debugging
 */
export function listStoredWallets(): WalletConnection[] {
  return getStoredConnections();
}

/**
 * Remove a wallet connection
 */
export function removeWallet(address: string): void {
  try {
    const connections = getStoredConnections();
    const filtered = connections.filter(c => 
      c.address.toLowerCase() !== address.toLowerCase()
    );
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove wallet:', error);
    throw new Error('Failed to remove wallet');
  }
}

/**
 * Check if wallet is available in browser
 */
export function isWalletAvailable(): boolean {
  return getEthereumProvider() !== null;
}

/**
 * Get current wallet connection status
 */
export async function getWalletStatus(): Promise<{
  connected: boolean;
  address?: string;
  provider?: string;
  chainId?: number;
}> {
  try {
    const provider = getEthereumProvider();
    if (!provider) {
      return { connected: false };
    }

    const accounts = await provider.request({ method: 'eth_accounts' });
    
    if (!accounts || accounts.length === 0) {
      return { connected: false };
    }

    const address = accounts[0];
    const providerName = detectWalletProvider(provider);

    let chainId: number | undefined;
    try {
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      chainId = parseInt(chainIdHex, 16);
    } catch (error) {
      console.warn('Failed to get chain ID:', error);
    }

    return {
      connected: true,
      address: address.toLowerCase(),
      provider: providerName,
      chainId
    };

  } catch (error) {
    console.error('Failed to get wallet status:', error);
    return { connected: false };
  }
}

/**
 * Listen for wallet account changes
 */
export function onWalletAccountChange(callback: (accounts: string[]) => void): void {
  const provider = getEthereumProvider();
  if (provider && provider.on) {
    provider.on('accountsChanged', callback);
  }
}

/**
 * Listen for wallet chain changes
 */
export function onWalletChainChange(callback: (chainId: string) => void): void {
  const provider = getEthereumProvider();
  if (provider && provider.on) {
    provider.on('chainChanged', callback);
  }
}

/**
 * Remove wallet event listeners
 */
export function removeWalletListeners(): void {
  const provider = getEthereumProvider();
  if (provider && provider.removeListener) {
    provider.removeListener('accountsChanged', () => {});
    provider.removeListener('chainChanged', () => {});
  }
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}