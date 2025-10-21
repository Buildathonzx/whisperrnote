import { account, ID } from './appwrite';
import { NextRequest } from 'next/server';

// Register a new user
export const register = async (email: string, password: string, name?: string) => {
  return account.create(ID.unique(), email, password, name);
};

// Login with email and password
export const login = async (email: string, password: string) => {
  return account.createEmailPasswordSession(email, password);
};

// Logout current session with comprehensive cleanup
export const logout = async () => {
  try {
    // Delete the current session
    await account.deleteSession('current');

    // Clear any local storage related to authentication
    if (typeof window !== 'undefined') {
      // Clear wallet connection data if it exists
      localStorage.removeItem('walletconnect');
      localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');

      // Clear any cached user data
      localStorage.removeItem('user_cache');
      sessionStorage.removeItem('auth_temp_data');
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Even if session deletion fails, we should clear local data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletconnect');
      localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
      localStorage.removeItem('user_cache');
      sessionStorage.removeItem('auth_temp_data');
    }
    throw error;
  }
};

// Get the currently authenticated user with enhanced error handling
export const getCurrentUser = async (retryCount = 0): Promise<any> => {
  const maxRetries = 2;

  try {
    const user = await account.get();
    if (user) {
      // Check user preferences to determine authentication method
      const preferences = user.prefs || {};
      return {
        ...user,
        authMethod: preferences.authMethod || 'email',
        walletAddress: preferences.walletAddress || null,
        passkeyCredentialId: preferences.passkeyCredentialId || null,
      };
    }
    return user;
  } catch (error: any) {
    // Handle specific error types
    if (error.code === 401 || error.message?.includes('unauthorized')) {
      // Session is invalid/expired
      console.warn('Authentication session expired or invalid');
      return null;
    }

    if (error.code === 429) {
      // Rate limited, don't retry
      console.warn('Rate limited while checking authentication');
      return null;
    }

    // For network errors or other issues, retry with exponential backoff
    if (retryCount < maxRetries && (
      error.message?.includes('network') ||
      error.message?.includes('timeout') ||
      error.code === 500
    )) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s
      console.warn(`Authentication check failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return getCurrentUser(retryCount + 1);
    }

    // For other errors, don't retry
    console.error('Authentication check failed:', error.message);
    return null;
  }
};

// Create email verification
export const createVerification = async (redirectUrl: string) => {
  return account.createVerification(redirectUrl);
};

// Complete email verification
export const completeVerification = async (userId: string, secret: string) => {
  return account.updateVerification(userId, secret);
};

// Create password recovery
export const createRecovery = async (email: string, redirectUrl: string) => {
  return account.createRecovery(email, redirectUrl);
};

// Complete password recovery
export const completeRecovery = async (userId: string, secret: string, password: string) => {
  return account.updateRecovery(userId, secret, password);
};

export const verifyAuth = async (req: NextRequest) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    return null;
  }
};

export const getAuthUser = async (token: string) => {
  const payload = token; // Assuming token is directly usable
  if (!payload) {
    return null;
  }

  try {
    const user = await getCurrentUser();
    if (!user) return null;
    return {
      id: user.$id,
      email: user.email,
      name: user.name,
      // walletAddress: user.walletAddress || null, // Not present on User<Preferences>
      createdAt: user.registration,
      updatedAt: user.$updatedAt || null,
    };
  } catch (error) {
    return null;
  }
};

export class AuthManager {
  private static instance: AuthManager;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }
}