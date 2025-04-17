import { account, ID } from './appwrite';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { Identity } from '@dfinity/agent';
import { ICPAuth } from './icp/auth';
import { BlockchainService } from './blockchain/service';

// Register a new user
export const register = async (email: string, password: string, name?: string) => {
  return account.create(ID.unique(), email, password, name);
};

// Login with email and password
export const login = async (email: string, password: string) => {
  return account.createEmailPasswordSession(email, password);
};

// Logout current session
export const logout = async () => {
  return account.deleteSession('current');
};

// Get the currently authenticated user
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
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
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') || 
                cookies().get('token')?.value;

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
    return {
      id: user.$id,
      email: user.email,
      name: user.name,
      walletAddress: user.walletAddress || null,
      createdAt: user.registration,
      updatedAt: user.updatedAt || null,
    };
  } catch (error) {
    return null;
  }
};

export class AuthManager {
  private static instance: AuthManager;
  private icpAuth: ICPAuth;
  private blockchainService: BlockchainService | null = null;

  private constructor() {
    this.icpAuth = new ICPAuth();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async initialize(): Promise<boolean> {
    const isAuthenticated = await this.icpAuth.init();
    if (isAuthenticated) {
      await this.setupBlockchainService();
    }
    return isAuthenticated;
  }

  async login(): Promise<void> {
    const identity = await this.icpAuth.login();
    await this.setupBlockchainService(identity);
  }

  async logout(): Promise<void> {
    if (this.blockchainService) {
      this.blockchainService.disconnect();
      this.blockchainService = null;
    }
    await this.icpAuth.logout();
  }

  async getIdentity(): Promise<Identity | null> {
    return this.icpAuth.getIdentity();
  }

  getBlockchainService(): BlockchainService | null {
    return this.blockchainService;
  }

  private async setupBlockchainService(identity?: Identity) {
    const currentIdentity = identity || await this.getIdentity();
    if (!currentIdentity) return;

    // Initialize blockchain service with user's identity
    // This will be implemented when needed
  }

  isAuthenticated(): boolean {
    return this.blockchainService !== null;
  }
}