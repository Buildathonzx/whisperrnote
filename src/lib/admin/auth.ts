import { getCurrentUser } from '@/lib/appwrite';

// Determines if current user is an admin based on Appwrite user preference 'admin' == 'true' (string) or boolean true fallback
export async function requireFounder(): Promise<{ allowed: boolean; reason?: string; user?: any; }> {
  try {
    const user: any = await getCurrentUser();
    if (!user || !user.$id) return { allowed: false, reason: 'unauthenticated' };
    // Use user preferences for admin gating. Appwrite stores preferences in user.prefs
    const prefs = (user as any).prefs || {};
    const adminPref = (prefs.admin === true) || (prefs.admin === 'true');
    if (!adminPref) return { allowed: false, reason: 'forbidden', user };
    return { allowed: true, user };
  } catch (e: any) {
    return { allowed: false, reason: 'error:' + (e?.message || 'unknown') };
  }
}
