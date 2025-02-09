import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

export class ICPAuth {
  private authClient: AuthClient | null = null;
  
  async init(): Promise<boolean> {
    this.authClient = await AuthClient.create();
    return this.authClient.isAuthenticated();
  }

  async login(): Promise<Identity> {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    await this.authClient.login({
      identityProvider: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL,
      onSuccess: () => window.location.reload(),
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
}
