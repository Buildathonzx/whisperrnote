import bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}