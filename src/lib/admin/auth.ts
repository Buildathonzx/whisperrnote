import { getCurrentUser } from '@/lib/auth';

// Determines if current user is an admin based on Appwrite user preference 'admin' == 'true' (string) or boolean true fallback
export async function requireFounder(): Promise<{ allowed: boolean; reason?: string; user?: any; prefValue?: any; }> {
  try {
    const user: any = await getCurrentUser();
    if (!user || !user.$id) return { allowed: false, reason: 'unauthenticated' };
    // Use user preferences for admin gating. Appwrite stores preferences in user.prefs
    const prefs = (user as any).prefs || {};
    const adminPref = (prefs.admin === true) || (prefs.admin === 'true');
    if (!adminPref) return { allowed: false, reason: 'forbidden', user, prefValue: (user as any).prefs?.admin }; // expose pref for debugging
    return { allowed: true, user };
  } catch (e: any) {
    return { allowed: false, reason: 'error:' + (e?.message || 'unknown') };
  }
}
