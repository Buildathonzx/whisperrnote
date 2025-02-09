import { prisma } from './prisma';
import { verifyToken } from './auth-utils';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { Identity } from '@dfinity/agent';
import { ICPAuth } from './icp/auth';
import { BlockchainService } from './blockchain/service';

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

  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  return user;
};

export const getAuthUser = async (token: string) => {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      walletAddress: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return user;
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