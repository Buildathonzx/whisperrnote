import { Identity, AnonymousIdentity } from '@dfinity/agent';

export class ICPAuth {
  private identity: Identity | null = null;

  async init(): Promise<boolean> {
    // Stub: always unauthenticated
    this.identity = new AnonymousIdentity();
    return false;
  }

  async login(): Promise<Identity> {
    // Stub: returns anonymous identity
    this.identity = new AnonymousIdentity();
    return this.identity;
  }

  async logout(): Promise<void> {
    this.identity = null;
  }

  async getIdentity(): Promise<Identity | null> {
    return this.identity;
  }
}
