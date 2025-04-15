import { verifyToken } from './auth-utils';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { Identity } from '@dfinity/agent';
import { ICPAuth } from './icp/auth';
import { BlockchainService } from './blockchain/service';
import { Appwrite } from 'appwrite';

const appwriteClient = new Appwrite();
appwriteClient.setEndpoint('https://appwrite.example.com/v1').setProject('your_project_id');

export const verifyAuth = async (req: NextRequest) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') || 
                cookies().get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  try {
    const user = await appwriteClient.account.get();
    return user;
  } catch (error) {
    return null;
  }
};

export const getAuthUser = async (token: string) => {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  try {
    const user = await appwriteClient.account.get();
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