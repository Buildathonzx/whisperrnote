import { AuthClient } from '@dfinity/auth-client';
import { Identity, Actor, HttpAgent } from '@dfinity/agent';

export class ICPAuth {
  private authClient: AuthClient | null = null;
  private contractsActor: any = null;
  
  async init(): Promise<boolean> {
    this.authClient = await AuthClient.create();
    if (await this.authClient.isAuthenticated()) {
      await this.initializeContractsActor();
    }
    return await this.authClient.isAuthenticated();
  }

  private async initializeContractsActor() {
    const identity = await this.getIdentity();
    if (!identity) return;

    const agent = new HttpAgent({ identity });
    
    // In local development, we need to fetch the root key
    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }

    this.contractsActor = Actor.createActor(
      // Your canister IDL definition will go here
      ({ IDL }) => IDL.Service({}),
      {
        agent,
        canisterId: 'br5f7-7uaaa-aaaaa-qaaca-cai'
      }
    );
  }

  async login(): Promise<Identity> {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    await this.authClient.login({
      identityProvider: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL,
      onSuccess: async () => {
        await this.initializeContractsActor();
        window.location.reload();
      },
      onError: (error) => console.error('Login failed:', error),
    });

    const identity = this.authClient.getIdentity();
    return identity;
  }

  async logout(): Promise<void> {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    await this.authClient.logout();
    window.location.reload();
  }

  async getIdentity(): Promise<Identity | null> {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    if (!await this.authClient.isAuthenticated()) {
      return null;
    }

    return this.authClient.getIdentity();
  }

  getContractsActor() {
    if (!this.contractsActor) {
      throw new Error('Contracts actor not initialized');
    }
    return this.contractsActor;
  }
}
