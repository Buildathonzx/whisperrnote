import { Client, Account } from 'appwrite';
import { cookies } from 'next/headers';

/**
 * Fetch current Appwrite user on the server by forwarding request cookies
 * using Appwrite's X-Fallback-Cookies header (SSR safe).
 */
export async function fetchServerAppwriteUser(): Promise<any | null> {
  try {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT || process.env.APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT;
    if (!endpoint || !project) return null;

    const cookieStore = cookies();
    const all = cookieStore.getAll();
    if (!all.length) return null; // no cookies => likely unauthenticated
    const headerValue = all.map(c => `${c.name}=${encodeURIComponent(c.value)}`).join('; ');

    const client = new Client().setEndpoint(endpoint).setProject(project);
    // Forward cookies manually so the backend can resolve session
    (client as any).headers = {
      ...(client as any).headers,
      'X-Fallback-Cookies': headerValue,
    };

    const account = new Account(client);
    const user = await account.get();
    if (!user || !(user as any).$id) return null;
    return user;
  } catch (e) {
    return null;
  }
}

/** Determine if user has admin privileges via prefs.admin truthy or labels including admin/Admin */
export function isAdminUser(user: any): boolean {
  if (!user) return false;
  const prefs = (user as any).prefs || {};
  const labels: string[] = Array.isArray((user as any).labels) ? (user as any).labels : [];
  const adminPref = prefs.admin === true || prefs.admin === 'true' || prefs.admin === 1 || prefs.admin === '1';
  const labelAdmin = labels.includes('admin') || labels.includes('Admin');
  return adminPref || labelAdmin;
}

/** Convenience: fetch and return user only if admin */
export async function getServerAdminUser(): Promise<any | null> {
  const user = await fetchServerAppwriteUser();
  if (!user) return null;
  return isAdminUser(user) ? user : null;
}
