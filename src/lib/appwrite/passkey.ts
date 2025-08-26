import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { account } from '../appwrite';

const PASSKEY_FUNCTION_URL = process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_PASSKEY_URL!;

export interface PasskeyAuthResult {
  success: boolean;
  user?: any;
  message?: string;
}

export interface PasskeyError extends Error {
  name: string;
}

export function isPasskeySupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  );
}

export function handlePasskeyError(error: PasskeyError): string {
  if (error.name === 'NotSupportedError') {
    return 'Passkeys are not supported on this device/browser';
  }
  if (error.name === 'SecurityError') {
    return 'Security error - please try again';
  }
  if (error.name === 'AbortError') {
    return 'Authentication was cancelled';
  }
  return error.message || 'Authentication failed';
}

async function signUpWithPasskey(email: string): Promise<PasskeyAuthResult> {
  try {
    // 1. Start registration
    const startResponse = await fetch(
      `${PASSKEY_FUNCTION_URL}/v1/challenges`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );

    if (!startResponse.ok) {
      throw new Error(await startResponse.text());
    }

    const { options, challengeId } = await startResponse.json();

    // 2. Browser prompts for biometric
    const registration = await startRegistration(options);

    // 3. Complete registration
    const finishResponse = await fetch(
      `${PASSKEY_FUNCTION_URL}/v1/challenges`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, registration }),
      }
    );

    if (!finishResponse.ok) {
      throw new Error(await finishResponse.text());
    }

    return {
      success: true,
      message: 'Passkey registered! You can now sign in.',
    };
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

async function signInWithPasskey(email: string): Promise<PasskeyAuthResult> {
  try {
    // 1. Start authentication
    const startResponse = await fetch(
      `${PASSKEY_FUNCTION_URL}/v1/tokens`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );

    if (!startResponse.ok) {
      throw new Error(await startResponse.text());
    }

    const { options, challengeId } = await startResponse.json();

    // 2. Browser prompts for biometric
    const authentication = await startAuthentication(options);

    // 3. Complete authentication
    const finishResponse = await fetch(
      `${PASSKEY_FUNCTION_URL}/v1/tokens`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, authentication }),
      }
    );

    if (!finishResponse.ok) {
      throw new Error(await finishResponse.text());
    }

    const { userId, secret } = await finishResponse.json();

    // 4. Create Appwrite session
    await account.createSession(userId, secret);

    return { success: true, user: await account.get() };
  } catch (error: any) {
    throw new Error(`Sign in failed: ${error.message}`);
  }
}

export async function continueWithPasskey(email: string): Promise<PasskeyAuthResult> {
  if (!isPasskeySupported()) {
    throw new Error('Passkeys are not supported in this browser');
  }

  if (!email || !email.includes('@')) {
    throw new Error('Valid email address is required');
  }

  try {
    // Try sign in first
    return await signInWithPasskey(email);
  } catch (error: any) {
    // If no credentials found, auto-register then sign in
    if (error.message.includes('No credentials found') || 
        error.message.includes('not found') ||
        error.message.includes('404')) {
      await signUpWithPasskey(email);
      return await signInWithPasskey(email);
    }
    throw error;
  }
}