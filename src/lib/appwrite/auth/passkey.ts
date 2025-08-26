import { 
  startRegistration, 
  startAuthentication,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON
} from '@simplewebauthn/browser';
import { authenticateWithCustomToken } from './token';

/**
 * Passkey credential interface
 */
export interface PasskeyCredential {
  credentialId: string;
  publicKey: string;
  userId: string;
  email?: string;
  displayName?: string;
  createdAt: Date;
}

/**
 * Passkey registration options
 */
export interface PasskeyRegistrationOptions {
  email: string;
  displayName?: string;
  challenge?: string;
}

/**
 * Passkey authentication result
 */
export interface PasskeyAuthResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Storage key for passkey credentials
 */
const PASSKEY_STORAGE_KEY = 'whisperrnote_passkey_credentials';

/**
 * Get stored passkey credentials
 */
function getStoredCredentials(): PasskeyCredential[] {
  try {
    const stored = localStorage.getItem(PASSKEY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse stored passkey credentials:', error);
    return [];
  }
}

/**
 * Store passkey credential
 */
function storeCredential(credential: PasskeyCredential): void {
  try {
    const credentials = getStoredCredentials();
    // Remove any existing credential for the same user
    const filtered = credentials.filter(c => c.userId !== credential.userId);
    filtered.push(credential);
    localStorage.setItem(PASSKEY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to store passkey credential:', error);
    throw new Error('Failed to store passkey credential');
  }
}

/**
 * Generate a random challenge for WebAuthn
 */
function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}


/**
 * Register a new passkey for a user
 */
export async function registerPasskey(options: PasskeyRegistrationOptions): Promise<PasskeyCredential> {
  try {
    const challenge = options.challenge || generateChallenge();
    const userId = 'temp_id'; // Will be replaced by server with actual unique ID
    
    // Prepare registration options for WebAuthn
    const registrationOptions = {
      rp: {
        name: 'WhisperRNote',
        id: window.location.hostname,
      },
      user: {
        id: userId, // Use string instead of Uint8Array
        name: options.email,
        displayName: options.displayName || options.email.split('@')[0],
      },
      challenge: challenge, // Use string challenge
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' as const }, // ES256
        { alg: -257, type: 'public-key' as const }, // RS256
      ],
      timeout: 60000,
      attestation: 'direct' as const,
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as const,
        userVerification: 'required' as const,
        requireResidentKey: true,
      },
    };

    // Start WebAuthn registration
    const registrationResponse: RegistrationResponseJSON = await startRegistration({
      optionsJSON: registrationOptions
    });

    // Extract public key from response
    const publicKey = registrationResponse.response.publicKey || '';

    // Create credential object
    const credential: PasskeyCredential = {
      credentialId: registrationResponse.id,
      publicKey,
      userId,
      email: options.email,
      displayName: options.displayName,
      createdAt: new Date(),
    };

    // Store credential locally
    storeCredential(credential);

    // Create user account with custom token
    await createUserAccountWithPasskey(credential);

    return credential;

  } catch (error: any) {
    console.error('Passkey registration failed:', error);
    throw new Error(`Passkey registration failed: ${error.message}`);
  }
}

/**
 * Authenticate with an existing passkey
 */
export async function authenticateWithPasskey(email?: string): Promise<PasskeyAuthResult> {
  try {
    const storedCredentials = getStoredCredentials();
    
    // Filter credentials by email if provided
    const availableCredentials = email 
      ? storedCredentials.filter(c => c.email === email)
      : storedCredentials;

    if (availableCredentials.length === 0) {
      return {
        success: false,
        error: 'No passkey credentials found'
      };
    }

    // Prepare authentication options
    const challenge = generateChallenge();
    const authenticationOptions = {
      challenge: challenge, // Use string challenge
      timeout: 60000,
      userVerification: 'required' as const,
      allowCredentials: availableCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key' as const,
        transports: ['internal'] as AuthenticatorTransport[],
      })),
    };

    // Start WebAuthn authentication
    const authResponse: AuthenticationResponseJSON = await startAuthentication({
      optionsJSON: authenticationOptions
    });

    // Find the credential that was used
    const usedCredential = availableCredentials.find(c => c.credentialId === authResponse.id);
    if (!usedCredential) {
      return {
        success: false,
        error: 'Credential not found'
      };
    }

    // Verify signature (simplified - in production, verify on server)
    const isValid = await verifyPasskeySignature(authResponse, usedCredential);
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid signature'
      };
    }

    // Create session with custom token
    await authenticateWithCustomToken(usedCredential.userId);

    return {
      success: true,
      userId: usedCredential.userId
    };

  } catch (error: any) {
    console.error('Passkey authentication failed:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
}

/**
 * Create user account after successful passkey registration
 */
async function createUserAccountWithPasskey(credential: PasskeyCredential): Promise<void> {
  try {
    // Call API to create user and get custom token
    const response = await fetch('/api/auth/passkey/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credential.email,
        displayName: credential.displayName,
        credentialId: credential.credentialId,
        publicKey: credential.publicKey,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'User creation failed');
    }

    const result = await response.json();
    
    // Update credential with the actual userId returned from server
    credential.userId = result.userId;
    storeCredential(credential);
    
    // Create session with the token
    await authenticateWithCustomToken(result.userId);
    
  } catch (error: any) {
    console.error('Failed to create user account with passkey:', error);
    throw new Error(`Account creation failed: ${error.message}`);
  }
}

/**
 * Simplified signature verification (client-side)
 * In production, this should be done on the server
 */
async function verifyPasskeySignature(
  authResponse: AuthenticationResponseJSON,
  credential: PasskeyCredential
): Promise<boolean> {
  try {
    // This is a simplified verification
    // In production, proper signature verification should be done on the server
    // using the stored public key and the authentication response
    
    // For now, we'll do basic validation
    return !!(
      authResponse.response.signature &&
      authResponse.response.authenticatorData &&
      authResponse.response.clientDataJSON &&
      credential.publicKey
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Get all stored passkey credentials for debugging
 */
export function listStoredPasskeys(): PasskeyCredential[] {
  return getStoredCredentials();
}

/**
 * Remove a passkey credential
 */
export function removePasskey(credentialId: string): void {
  try {
    const credentials = getStoredCredentials();
    const filtered = credentials.filter(c => c.credentialId !== credentialId);
    localStorage.setItem(PASSKEY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove passkey:', error);
    throw new Error('Failed to remove passkey');
  }
}

/**
 * Check if passkeys are supported in current browser
 */
export function isPasskeySupported(): boolean {
  return !!(
    window.PublicKeyCredential &&
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
  );
}

/**
 * Check if platform authenticator is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  try {
    if (!isPasskeySupported()) return false;
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.error('Failed to check platform authenticator availability:', error);
    return false;
  }
}