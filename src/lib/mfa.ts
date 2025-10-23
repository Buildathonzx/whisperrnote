import { account } from '@/lib/appwrite';

export interface MFAFactor {
  totp?: {
    enabled: boolean;
  };
  email?: {
    enabled: boolean;
  };
}

export interface MFAStatus {
  totp: boolean;
  email: boolean;
}

/**
 * Get current MFA status for the user
 */
export async function getMFAStatus(): Promise<MFAStatus> {
  try {
    const mfaFactors = await account.listMfaFactors();
    return {
      totp: !!mfaFactors?.totp?.enabled,
      email: !!mfaFactors?.email?.enabled,
    };
  } catch (err) {
    console.error('Failed to get MFA status:', err);
    return {
      totp: false,
      email: false,
    };
  }
}

/**
 * Create TOTP MFA factor - generates secret and QR code
 */
export async function createTOTPFactor() {
  try {
    const result = await account.createMfaAuthenticator('totp');
    return result;
  } catch (err) {
    console.error('Failed to create TOTP factor:', err);
    throw err;
  }
}

/**
 * Verify and enable TOTP MFA with OTP code
 */
export async function verifyTOTPFactor(otp: string) {
  try {
    const result = await account.verifyMfaAuthenticator('totp', otp);
    return result;
  } catch (err) {
    console.error('Failed to verify TOTP:', err);
    throw err;
  }
}

/**
 * Delete TOTP MFA factor
 */
export async function deleteTOTPFactor() {
  try {
    await account.deleteMfaAuthenticator('totp');
  } catch (err) {
    console.error('Failed to delete TOTP factor:', err);
    throw err;
  }
}

/**
 * Create email MFA factor
 */
export async function createEmailMFAFactor() {
  try {
    const result = await account.createMfaChallenge('email');
    return result;
  } catch (err) {
    console.error('Failed to create email MFA factor:', err);
    throw err;
  }
}

/**
 * Verify and enable email MFA with code
 */
export async function verifyEmailMFAFactor(challengeId: string, otp: string) {
  try {
    const result = await account.completeMfaChallenge(challengeId, otp);
    return result;
  } catch (err) {
    console.error('Failed to verify email MFA:', err);
    throw err;
  }
}

/**
 * Delete email MFA factor
 */
export async function deleteEmailMFAFactor() {
  try {
    await account.deleteMfaAuthenticator('email');
  } catch (err) {
    console.error('Failed to delete email MFA factor:', err);
    throw err;
  }
}

/**
 * Create MFA challenge for authentication
 */
export async function createMFAChallenge(factor: 'totp' | 'email') {
  try {
    const result = await account.createMfaChallenge(factor);
    return result;
  } catch (err) {
    console.error('Failed to create MFA challenge:', err);
    throw err;
  }
}

/**
 * Complete MFA challenge during authentication
 */
export async function completeMFAChallenge(challengeId: string, otp: string) {
  try {
    const result = await account.completeMfaChallenge(challengeId, otp);
    return result;
  } catch (err) {
    console.error('Failed to complete MFA challenge:', err);
    throw err;
  }
}
