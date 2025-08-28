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
    // 1) Ask server for options (and server will provision/find user)
    const genRes = await fetch('/api/auth/passkey/generate-registration-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: options.email, displayName: options.displayName }),
    });
    if (!genRes.ok) {
      const err = await genRes.json();
      throw new Error(err.message || 'Failed to get registration options');
    }
    const { options: creationOptions, userId } = await genRes.json();

    // 2) Browser creates credential
    const attResp: RegistrationResponseJSON = await startRegistration({ optionsJSON: creationOptions });

    // 3) Send response to server for verification + persistence
    const verRes = await fetch('/api/auth/passkey/verify-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: options.email, attResp, userId }),
    });
    if (!verRes.ok) {
      const err = await verRes.json();
      throw new Error(err.message || 'Registration verification failed');
    }
    const { secret } = await verRes.json();

    // 4) Create Appwrite session via custom token
    await authenticateWithCustomToken(userId);

    // Minimal client-side record
    const credential: PasskeyCredential = {
      credentialId: attResp.id,
      publicKey: '',
      userId,
      email: options.email,
      displayName: options.displayName,
      createdAt: new Date(),
    };
    storeCredential(credential);

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
    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    // 1) Ask server for options
    const genRes = await fetch('/api/auth/passkey/generate-authentication-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!genRes.ok) {
      const err = await genRes.json();
      return { success: false, error: err.message || 'Failed to get authentication options' };
    }
    const { options: requestOptions, userId } = await genRes.json();

    // 2) Browser authenticates
    const authResp: AuthenticationResponseJSON = await startAuthentication({ optionsJSON: requestOptions });

    // 3) Verify with server
    const verRes = await fetch('/api/auth/passkey/verify-authentication', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, authResp, userId }),
    });
    if (!verRes.ok) {
      const err = await verRes.json();
      return { success: false, error: err.message || 'Authentication verification failed' };
    }
    const { secret } = await verRes.json();

    // 4) Create session
    await authenticateWithCustomToken(userId);

    return { success: true, userId };

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