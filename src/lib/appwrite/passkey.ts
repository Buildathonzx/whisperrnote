import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { account, functions } from '../appwrite';

const PASSKEY_FUNCTION_ID = process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID_PASSKEY!;

console.log('Passkey function ID:', PASSKEY_FUNCTION_ID);

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
    const startResult = await functions.createExecution(
      PASSKEY_FUNCTION_ID,
      JSON.stringify({ action: 'register/begin', email })
    );

    if (startResult.responseStatusCode !== 200) {
      throw new Error(startResult.responseBody);
    }

    const { options, challengeId } = JSON.parse(startResult.responseBody);

    // 2. Browser prompts for biometric
    const registration = await startRegistration(options);

    // 3. Complete registration
    const finishResult = await functions.createExecution(
      PASSKEY_FUNCTION_ID,
      JSON.stringify({ action: 'register/complete', challengeId, registration })
    );

    if (finishResult.responseStatusCode !== 200) {
      throw new Error(finishResult.responseBody);
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
    console.log('Starting passkey authentication with function ID:', PASSKEY_FUNCTION_ID);
    
    // 1. Start authentication
    const startResult = await functions.createExecution(
      PASSKEY_FUNCTION_ID,
      JSON.stringify({ action: 'authenticate/begin', email })
    );
    console.log('Start result status:', startResult.responseStatusCode);

    if (startResult.responseStatusCode !== 200) {
      throw new Error(startResult.responseBody);
    }

    const { options, challengeId } = JSON.parse(startResult.responseBody);

    // 2. Browser prompts for biometric
    const authentication = await startAuthentication(options);

    // 3. Complete authentication
    const finishResult = await functions.createExecution(
      PASSKEY_FUNCTION_ID,
      JSON.stringify({ action: 'authenticate/complete', challengeId, authentication })
    );

    if (finishResult.responseStatusCode !== 200) {
      throw new Error(finishResult.responseBody);
    }

    const { userId, secret } = JSON.parse(finishResult.responseBody);

    // 4. Create Appwrite session using the token
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