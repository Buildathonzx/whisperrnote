import { ethers } from 'ethers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthSession {
  userId: string;
  expiresAt: number;
  publicKey?: string;
}

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

export const getWalletMessage = (nonce: string) => {
  return `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
};

export const verifyWalletSignature = (message: string, signature: string, address: string) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch {
    return false;
  }
};

export const generateNonce = () => {
  return Math.random().toString(36).substring(2, 15);
};

export function getAuthSession(): AuthSession | null {
  const session = localStorage.getItem('auth_session');
  if (!session) return null;
  
  try {
    const parsed = JSON.parse(session) as AuthSession;
    if (parsed.expiresAt < Date.now()) {
      localStorage.removeItem('auth_session');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setAuthSession(identity: Identity, publicKey?: string): void {
  const session: AuthSession = {
    userId: identity.getPrincipal().toText(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    publicKey
  };
  localStorage.setItem('auth_session', JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem('auth_session');
}

export async function requireAuth(): Promise<boolean> {
  const auth = AuthManager.getInstance();
  if (auth.isAuthenticated()) {
    return true;
  }

  const session = getAuthSession();
  if (!session) {
    return false;
  }

  return auth.initialize();
}

export function getStoredNoteKeys(): Record<string, string> {
  const keys: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('note_key_')) {
      const noteId = key.replace('note_key_', '');
      const privateKey = localStorage.getItem(key);
      if (privateKey) {
        keys[noteId] = privateKey;
      }
    }
  }
  return keys;
}