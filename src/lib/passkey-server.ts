import { Client, Users, ID, Query } from 'appwrite';
import crypto from 'crypto';
import * as SimpleWebAuthnServer from '@simplewebauthn/server';

const client = new Client();
const serverEndpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const serverProject = process.env.APPWRITE_PROJECT || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const serverApiKey = process.env.APPWRITE_API_KEY || '';

client.setEndpoint(serverEndpoint);
if (!serverProject) {
  throw new Error('Missing APPWRITE_PROJECT or NEXT_PUBLIC_APPWRITE_PROJECT_ID');
}
client.setProject(serverProject);
if (!serverApiKey) {
  throw new Error('Missing APPWRITE_API_KEY');
}
client.setKey(serverApiKey);

const users = new Users(client);

export class PasskeyServer {
  constructor() {}

  async getUserIfExists(email: string): Promise<any | null> {
    const usersList = await users.list([Query.equal('email', email), Query.limit(1)]);
    return (usersList as any).users?.[0] ?? null;
  }

  parseCredsMap(str: string | undefined): Record<string, string> {
    if (!str) return {};
    try { return JSON.parse(str) as Record<string, string>; } catch { return {}; }
  }

  async shouldBlockPasskeyForEmail(email: string): Promise<boolean> {
    const user = await this.getUserIfExists(email);
    if (!user) return false;
    const credsObj = this.parseCredsMap(user.prefs?.passkey_credentials as string | undefined);
    const hasPasskeys = Object.keys(credsObj).length > 0;
    return !hasPasskeys;
  }

  async hasWalletPreference(email: string): Promise<boolean> {
    const user = await this.getUserIfExists(email);
    if (!user) return false;
    const prefs = user.prefs || {};
    return Object.keys(prefs).some(key => key.startsWith('wallet'));
  }

  async prepareUser(email: string) {
    const usersList = await users.list([Query.equal('email', email), Query.limit(1)]);
    if ((usersList as any).users?.length > 0) {
      return (usersList as any).users[0];
    }
    return await users.create(ID.unique(), email);
  }

  async registerPasskey(
    email: string,
    credentialData: any,
    challenge: string,
    opts?: { rpID?: string; origin?: string }
  ) {
    if (await this.shouldBlockPasskeyForEmail(email)) {
      throw new Error('Account already exists');
    }
    
    const user = await this.prepareUser(email);

    const verification = await (SimpleWebAuthnServer.verifyRegistrationResponse as any)({
      response: credentialData,
      expectedChallenge: challenge,
      expectedOrigin: opts?.origin || process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000',
      expectedRPID: opts?.rpID || process.env.NEXT_PUBLIC_RP_ID || 'localhost'
    });

    if (!verification.verified) {
      throw new Error('Registration verification failed');
    }

    const registrationInfo: any = (verification as any).registrationInfo;
    const cred = registrationInfo?.credential || {};
    const passkeyData = {
      id: typeof cred.id === 'string' ? cred.id : Buffer.from(cred.id || new Uint8Array()).toString('base64url'),
      publicKey: Buffer.from(cred.publicKey || new Uint8Array()).toString('base64url'),
      counter: typeof cred.counter === 'number' ? cred.counter : (registrationInfo.counter || 0),
      transports: Array.isArray(cred.transports) ? cred.transports : (credentialData.response?.transports || [])
    };
    if (!passkeyData.id || !passkeyData.publicKey) {
      throw new Error('RegistrationInfo missing credential id/publicKey');
    }

    const existingPrefs = user.prefs || {};
    const credentialsStr = (existingPrefs.passkey_credentials || '') as string;
    const countersStr = (existingPrefs.passkey_counter || '') as string;

    const credObj: Record<string, string> = credentialsStr ? (JSON.parse(credentialsStr) as Record<string, string>) : {};
    const counterObj: Record<string, number> = countersStr ? (JSON.parse(countersStr) as Record<string, number>) : {};
    
    credObj[passkeyData.id] = passkeyData.publicKey;
    counterObj[passkeyData.id] = passkeyData.counter;
    
    const metadataStr = (existingPrefs.passkey_metadata || '') as string;
    let metadataObj: Record<string, any> = metadataStr ? JSON.parse(metadataStr) : {};
    const timeStr = this.formatTimestamp(Date.now());
    metadataObj[passkeyData.id] = {
      name: `Passkey ${timeStr}`,
      createdAt: Date.now(),
      lastUsedAt: null,
      status: 'active'
    };
    
    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_credentials = JSON.stringify(credObj);
    mergedPrefs.passkey_counter = JSON.stringify(counterObj);
    mergedPrefs.passkey_metadata = JSON.stringify(metadataObj);
    await users.updatePrefs(user.$id, mergedPrefs);

    const token = await users.createToken(user.$id, 64, 60);

    return {
      success: true,
      token: {
        secret: token.secret,
        userId: user.$id
      }
    };
  }

  async authenticatePasskey(
    email: string,
    assertion: any,
    challenge: string,
    opts?: { rpID?: string; origin?: string }
  ) {
    const user = await this.getUserIfExists(email);
    if (!user) {
      throw new Error('No passkeys found for user');
    }

    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    const countersStr = (user.prefs?.passkey_counter || '') as string;

    if (!credentialsStr) {
      throw new Error('No passkeys found for user');
    }
    
    const credObj: Record<string, string> = JSON.parse(credentialsStr) as Record<string, string>;
    const counterObj: Record<string, number> = countersStr ? (JSON.parse(countersStr) as Record<string, number>) : {};
    
    const credentialId = assertion.rawId || assertion.id;
    const publicKey = credObj[credentialId];
    const counter = counterObj[credentialId] || 0;
    
    if (!publicKey) {
      throw new Error('Unknown credential');
    }

    const metadataStr = (user.prefs?.passkey_metadata || '') as string;
    const isAvailable = await this.isPasskeyAvailable(credentialId, metadataStr);
    if (!isAvailable) {
      throw new Error('This passkey is disabled or has been marked as compromised.');
    }

    const verification = await (SimpleWebAuthnServer.verifyAuthenticationResponse as any)({
      response: assertion,
      expectedChallenge: challenge,
      expectedOrigin: opts?.origin || process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000',
      expectedRPID: opts?.rpID || process.env.NEXT_PUBLIC_RP_ID || 'localhost',
      credential: {
        counter: counter,
        id: Buffer.from(credentialId, 'base64url'),
        publicKey: Buffer.from(publicKey, 'base64url'),
      }
    });

    if (!verification.verified) {
      throw new Error('Authentication verification failed');
    }

    const authInfo: any = (verification as any).authenticationInfo;
    const newCounter = (authInfo && typeof authInfo.newCounter === 'number') ? authInfo.newCounter : counter;
    
    if (newCounter < counter) {
      await this.markPasskeyCompromised(email, credentialId);
      throw new Error('Potential passkey compromise detected. Counter regression. This credential has been used elsewhere. Please reset your account.');
    }
    
    counterObj[credentialId] = newCounter;
    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_counter = JSON.stringify(counterObj);
    
    const counterHistoryStr = (user.prefs?.passkey_counter_history || '') as string;
    let counterHistory: Record<string, Array<{ timestamp: number; counter: number }>> = {};
    if (counterHistoryStr) {
      try {
        counterHistory = JSON.parse(counterHistoryStr);
      } catch {
        counterHistory = {};
      }
    }
    
    if (!counterHistory[credentialId]) {
      counterHistory[credentialId] = [];
    }
    
    counterHistory[credentialId].push({
      timestamp: Date.now(),
      counter: newCounter,
    });
    
    if (counterHistory[credentialId].length > 50) {
      counterHistory[credentialId] = counterHistory[credentialId].slice(-50);
    }
    
    mergedPrefs.passkey_counter_history = JSON.stringify(counterHistory);
    
    const metadataStr2 = (user.prefs?.passkey_metadata || '') as string;
    let metadata: Record<string, any> = metadataStr2 ? JSON.parse(metadataStr2) : {};
    if (!metadata[credentialId]) {
      const timeStr = this.formatTimestamp(Date.now());
      metadata[credentialId] = {
        name: `Passkey ${timeStr}`,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        status: 'active'
      };
    } else {
      metadata[credentialId].lastUsedAt = Date.now();
    }
    mergedPrefs.passkey_metadata = JSON.stringify(metadata);
    
    await users.updatePrefs(user.$id, mergedPrefs);

    const token = await users.createToken(user.$id, 64, 60);

    return {
      success: true,
      token: {
        secret: token.secret,
        userId: user.$id
      }
    };
  }

  async getPasskeysByEmail(email: string): Promise<Array<{ id: string; publicKey: string; counter: number }>> {
    const user = await this.getUserIfExists(email);
    if (!user) return [];
    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    if (!credentialsStr) return [];
    const credObj: Record<string, string> = JSON.parse(credentialsStr) as Record<string, string>;
    return Object.entries(credObj).map(([id, pk]) => ({ id, publicKey: pk, counter: 0 }));
  }

  private parseMetadata(str: string | undefined): Record<string, any> {
    if (!str) return {};
    try { return JSON.parse(str) as Record<string, any>; } catch { return {}; }
  }

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  private initializeMetadata(credentialId: string, metadata: Record<string, any> = {}): any {
    if (metadata[credentialId]) return metadata;
    const timeStr = this.formatTimestamp(Date.now());
    metadata[credentialId] = {
      name: `Passkey ${timeStr}`,
      createdAt: Date.now(),
      lastUsedAt: null,
      status: 'active'
    };
    return metadata;
  }

  async listPasskeysWithMetadata(email: string): Promise<Array<{
    id: string;
    name: string;
    createdAt: number;
    lastUsedAt: number | null;
    status: 'active' | 'disabled' | 'compromised';
  }>> {
    const user = await this.prepareUser(email);
    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    const metadataStr = (user.prefs?.passkey_metadata || '') as string;

    if (!credentialsStr) return [];

    const metadata = this.parseMetadata(metadataStr);
    const credObj: Record<string, string> = JSON.parse(credentialsStr) as Record<string, string>;

    return Object.keys(credObj).map(id => {
      const meta = metadata[id] || this.initializeMetadata(id, {})[id];
      return {
        id,
        name: meta.name || `Passkey ${this.formatTimestamp(meta.createdAt || 0)}`,
        createdAt: meta.createdAt || Date.now(),
        lastUsedAt: meta.lastUsedAt || null,
        status: meta.status || 'active'
      };
    });
  }

  async getPasskeyInfo(email: string, credentialId: string): Promise<{
    id: string;
    name: string;
    createdAt: number;
    lastUsedAt: number | null;
    status: 'active' | 'disabled' | 'compromised';
  } | null> {
    const user = await this.prepareUser(email);
    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    const metadataStr = (user.prefs?.passkey_metadata || '') as string;

    const credObj: Record<string, string> = JSON.parse(credentialsStr || '{}') as Record<string, string>;
    if (!credObj[credentialId]) return null;

    const metadata = this.parseMetadata(metadataStr);
    const meta = metadata[credentialId] || this.initializeMetadata(credentialId, {})[credentialId];

    return {
      id: credentialId,
      name: meta.name || `Passkey ${this.formatTimestamp(meta.createdAt || 0)}`,
      createdAt: meta.createdAt || Date.now(),
      lastUsedAt: meta.lastUsedAt || null,
      status: meta.status || 'active'
    };
  }

  async renamePasskey(email: string, credentialId: string, newName: string): Promise<void> {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Passkey name cannot be empty');
    }
    if (newName.length > 50) {
      throw new Error('Passkey name must be 50 characters or less');
    }

    const user = await this.prepareUser(email);
    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    const credObj: Record<string, string> = JSON.parse(credentialsStr || '{}') as Record<string, string>;

    if (!credObj[credentialId]) {
      throw new Error('Passkey not found');
    }

    const metadataStr = (user.prefs?.passkey_metadata || '') as string;
    let metadata = this.parseMetadata(metadataStr);
    metadata = this.initializeMetadata(credentialId, metadata);
    metadata[credentialId].name = newName.trim();

    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_metadata = JSON.stringify(metadata);
    await users.updatePrefs(user.$id, mergedPrefs);
  }

  async disablePasskey(email: string, credentialId: string): Promise<void> {
    const user = await this.prepareUser(email);
    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    const credObj: Record<string, string> = JSON.parse(credentialsStr || '{}') as Record<string, string>;

    if (!credObj[credentialId]) {
      throw new Error('Passkey not found');
    }

    const metadataStr = (user.prefs?.passkey_metadata || '') as string;
    let metadata = this.parseMetadata(metadataStr);
    metadata = this.initializeMetadata(credentialId, metadata);
    metadata[credentialId].status = 'disabled';

    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_metadata = JSON.stringify(metadata);
    await users.updatePrefs(user.$id, mergedPrefs);
  }

  async enablePasskey(email: string, credentialId: string): Promise<void> {
    const user = await this.prepareUser(email);
    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    const credObj: Record<string, string> = JSON.parse(credentialsStr || '{}') as Record<string, string>;

    if (!credObj[credentialId]) {
      throw new Error('Passkey not found');
    }

    const metadataStr = (user.prefs?.passkey_metadata || '') as string;
    let metadata = this.parseMetadata(metadataStr);
    metadata = this.initializeMetadata(credentialId, metadata);
    metadata[credentialId].status = 'active';

    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_metadata = JSON.stringify(metadata);
    await users.updatePrefs(user.$id, mergedPrefs);
  }

  async deletePasskey(email: string, credentialId: string): Promise<void> {
    const user = await this.prepareUser(email);
    const credentialsStr = (user.prefs?.passkey_credentials || '') as string;
    const credObj: Record<string, string> = JSON.parse(credentialsStr || '{}') as Record<string, string>;

    if (!credObj[credentialId]) {
      throw new Error('Passkey not found');
    }

    const remainingKeys = Object.keys(credObj).filter(id => id !== credentialId);
    if (remainingKeys.length === 0) {
      throw new Error('Cannot delete the last passkey. Add another auth method first.');
    }

    delete credObj[credentialId];

    const counterStr = (user.prefs?.passkey_counter || '') as string;
    const counterObj: Record<string, number> = counterStr ? JSON.parse(counterStr) : {};
    delete counterObj[credentialId];

    const metadataStr = (user.prefs?.passkey_metadata || '') as string;
    const metadata = this.parseMetadata(metadataStr);
    delete metadata[credentialId];

    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_credentials = JSON.stringify(credObj);
    mergedPrefs.passkey_counter = JSON.stringify(counterObj);
    mergedPrefs.passkey_metadata = JSON.stringify(metadata);
    await users.updatePrefs(user.$id, mergedPrefs);
  }

  async isPasskeyAvailable(credentialId: string, metadataStr: string): Promise<boolean> {
    const metadata = this.parseMetadata(metadataStr);
    const status = metadata[credentialId]?.status || 'active';
    return status === 'active';
  }

  async updatePasskeyLastUsed(email: string, credentialId: string): Promise<void> {
    const user = await this.prepareUser(email);
    const metadataStr = (user.prefs?.passkey_metadata || '') as string;

    let metadata = this.parseMetadata(metadataStr);
    metadata = this.initializeMetadata(credentialId, metadata);
    metadata[credentialId].lastUsedAt = Date.now();

    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_metadata = JSON.stringify(metadata);
    await users.updatePrefs(user.$id, mergedPrefs);
  }

  async markPasskeyCompromised(email: string, credentialId: string): Promise<void> {
    const user = await this.prepareUser(email);
    const metadataStr = (user.prefs?.passkey_metadata || '') as string;

    let metadata = this.parseMetadata(metadataStr);
    metadata = this.initializeMetadata(credentialId, metadata);
    metadata[credentialId].status = 'compromised';

    const mergedPrefs = { ...(user.prefs || {}) } as Record<string, unknown>;
    mergedPrefs.passkey_metadata = JSON.stringify(metadata);
    await users.updatePrefs(user.$id, mergedPrefs);
  }
}
