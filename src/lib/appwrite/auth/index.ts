import { account, ID } from '../core/client';
import type { Users } from '@/types/appwrite';

export async function signupEmailPassword(email: string, password: string, name: string) {
  return account.create(ID.unique(), email, password, name);
}

export async function loginEmailPassword(email: string, password: string) {
  return account.createEmailPasswordSession(email, password);
}

export async function logout() {
  return account.deleteSession('current');
}

export async function getCurrentUser(): Promise<Users | null> {
  try {
    return await account.get() as unknown as Users;
  } catch {
    return null;
  }
}

export async function sendEmailVerification(redirectUrl: string) {
  return account.createVerification(redirectUrl);
}

export async function completeEmailVerification(userId: string, secret: string) {
  return account.updateVerification(userId, secret);
}

export async function getEmailVerificationStatus(): Promise<boolean> {
  try {
    const user = await account.get();
    return !!user.emailVerification;
  } catch {
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, redirectUrl: string) {
  return account.createRecovery(email, redirectUrl);
}

export async function completePasswordReset(userId: string, secret: string, password: string) {
  return account.updateRecovery(userId, secret, password);
}
