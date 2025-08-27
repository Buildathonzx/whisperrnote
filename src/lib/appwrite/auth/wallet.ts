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
 * Connect to a wallet with device-specific logic
 */
export async function connectWallet(): Promise<{ address: string; provider: string; chainId?: number }> {
  try {
    const device = getDeviceInfo();
    const provider = getEthereumProvider();
    
    // If no provider detected, handle based on device type
    if (!provider) {
      if (device.isMobile) {
        // On mobile, try to open wallet app
        const availability = getWalletAvailability();
        if (availability.deepLink) {
          // Open wallet app
          window.open(availability.deepLink, '_blank');
          // Wait a bit and check again for provider
          await new Promise(resolve => setTimeout(resolve, 2000));
          const newProvider = getEthereumProvider();
          if (!newProvider) {
            throw new Error('Please open this page in your mobile wallet app (MetaMask, Coinbase Wallet, etc.)');
          }
          return await connectWithProvider(newProvider);
        }
      }
      
      throw new Error('No Ethereum wallet provider found. Please install MetaMask, Coinbase Wallet, or another compatible wallet.');
    }

    return await connectWithProvider(provider);

  } catch (error: any) {
    console.error('Wallet connection failed:', error);
    throw new Error(`Wallet connection failed: ${error.message}`);
  }
}

/**
 * Connect with a specific provider (extracted for reuse)
 */
async function connectWithProvider(provider: EthereumProvider): Promise<{ address: string; provider: string; chainId?: number }> {
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
export async function registerWallet(email: string): Promise<WalletConnection> {
  try {
    // Connect to wallet
    const { address, provider, chainId } = await connectWallet();
    
    // Sign authentication message
    const signature = await signAuthenticationMessage(address);
    
    // Generate a proper Appwrite-compatible userId (let API generate it)
    const userId = 'unique()'; // This will be replaced by server with actual unique ID
    
    // Create connection object
    const connection: WalletConnection = {
      address: address.toLowerCase(),
      provider,
      chainId,
      userId, // Will be updated after account creation
      connectedAt: new Date(),
    };

    // Store connection locally
    storeConnection(connection);

    // Create user account with wallet
    await createUserAccountWithWallet(connection, signature, email);

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
async function createUserAccountWithWallet(connection: WalletConnection, signature: string, email: string): Promise<void> {
  try {
    // Call API to create user and get custom token
    const response = await fetch('/api/auth/wallet/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        address: connection.address,
        provider: connection.provider,
        chainId: connection.chainId,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Wallet registration API error:', {
        status: response.status,
        statusText: response.statusText,
        error: error,
        url: response.url
      });
      throw new Error(error.error || error.message || 'User creation failed');
    }

    const result = await response.json();
    
    // Update connection with the actual userId returned from server
    connection.userId = result.userId;
    storeConnection(connection);
    
    // Create session with the token
    await authenticateWithCustomToken(result.userId);
    
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
 * Device and platform detection utilities
 */
interface DeviceInfo {
  isMobile: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  browserName: string;
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      browserName: 'unknown'
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);
  
  let browserName = 'unknown';
  if (userAgent.includes('chrome')) browserName = 'chrome';
  else if (userAgent.includes('firefox')) browserName = 'firefox';
  else if (userAgent.includes('safari')) browserName = 'safari';
  else if (userAgent.includes('edge')) browserName = 'edge';
  
  return {
    isMobile,
    isDesktop: !isMobile,
    isIOS,
    isAndroid,
    browserName
  };
}

/**
 * Wallet availability status with detailed info
 */
export interface WalletAvailability {
  available: boolean;
  browserExtension: boolean;
  mobileApp: boolean;
  hardwareSupported: boolean;
  recommendedAction: 'connect' | 'install' | 'openApp' | 'connectHardware';
  message: string;
  deepLink?: string;
}

/**
 * Check comprehensive wallet availability
 */
export function getWalletAvailability(): WalletAvailability {
  const device = getDeviceInfo();
  const hasEthereumProvider = getEthereumProvider() !== null;
  
  // Desktop with browser extension
  if (device.isDesktop && hasEthereumProvider) {
    return {
      available: true,
      browserExtension: true,
      mobileApp: false,
      hardwareSupported: true,
      recommendedAction: 'connect',
      message: 'Wallet extension detected'
    };
  }
  
  // Desktop without browser extension
  if (device.isDesktop && !hasEthereumProvider) {
    return {
      available: true, // Still available - can install or use hardware
      browserExtension: false,
      mobileApp: false,
      hardwareSupported: true,
      recommendedAction: 'install',
      message: 'Install MetaMask, Coinbase Wallet, or connect hardware wallet'
    };
  }
  
  // Mobile - always potentially available via apps
  if (device.isMobile) {
    const deepLink = device.isIOS 
      ? 'https://metamask.app.link/dapp/' + window.location.host
      : 'https://metamask.app.link/dapp/' + window.location.host;
      
    return {
      available: true,
      browserExtension: hasEthereumProvider,
      mobileApp: true,
      hardwareSupported: false,
      recommendedAction: hasEthereumProvider ? 'connect' : 'openApp',
      message: hasEthereumProvider 
        ? 'Mobile wallet detected' 
        : 'Open in wallet app or install wallet',
      deepLink
    };
  }
  
  // Fallback
  return {
    available: true, // Don't disable - let user try
    browserExtension: false,
    mobileApp: false,
    hardwareSupported: false,
    recommendedAction: 'install',
    message: 'Install a compatible wallet'
  };
}

/**
 * Check if wallet is available (simplified for backward compatibility)
 */
export function isWalletAvailable(): boolean {
  return getWalletAvailability().available;
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