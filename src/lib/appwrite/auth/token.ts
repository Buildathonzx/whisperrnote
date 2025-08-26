import { account } from '@/lib/appwrite';

export interface CreateTokenOptions {
  /** Token expiry in seconds (default: 900 = 15 minutes) */
  expire?: number;
  /** Length of the secret (default: 6) */
  length?: number;
}

/**
 * Custom token API response interface
 */
export interface TokenResponse {
  secret: string;
  expire: string;
  userId: string;
}

/**
 * Client-side function to exchange token secret for session
 */
export async function createSessionFromToken(
  userId: string, 
  secret: string
): Promise<void> {
  try {
    await account.createSession(userId, secret);
  } catch (error: any) {
    console.error('Failed to create session from token:', error);
    throw new Error(`Session creation failed: ${error.message}`);
  }
}

/**
 * Call API route to create a custom token (server-side operation)
 */
export async function requestCustomToken(
  userId: string,
  options: CreateTokenOptions = {}
): Promise<TokenResponse> {
  try {
    const response = await fetch('/api/auth/create-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...options
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token creation failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to request custom token:', error);
    throw new Error(`Token request failed: ${error.message}`);
  }
}

/**
 * Helper function to authenticate user with custom token flow
 */
export async function authenticateWithCustomToken(
  userId: string,
  tokenOptions: CreateTokenOptions = {}
): Promise<void> {
  try {
    // Request token from server
    const tokenResponse = await requestCustomToken(userId, tokenOptions);
    
    // Exchange token for session
    await createSessionFromToken(tokenResponse.userId, tokenResponse.secret);
  } catch (error: any) {
    console.error('Custom token authentication failed:', error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}