import { getCurrentUser as getAuthUser } from '@/lib/auth';
import { getCurrentUser as getAppwriteUser } from '@/lib/appwrite';

// Determines if current user is an admin based on Appwrite user preference 'admin' == 'true' (string) or boolean true fallback
export async function requireFounder(): Promise<{ allowed: boolean; reason?: string; user?: any; prefValue?: any; }> {
  try {
    // Try auth-layer enriched user first, fallback to raw Appwrite
    let user: any = await getAuthUser();
    if (!user) user = await getAppwriteUser();
    if (!user || !user.$id) return { allowed: false, reason: 'unauthenticated' };
    // Use user preferences for admin gating. Appwrite stores preferences in user.prefs
    const prefs = (user as any).prefs || {};
    const adminPref = prefs.admin === true || prefs.admin === 'true' || prefs.admin === 1 || prefs.admin === '1';
    const labels: string[] = Array.isArray(user.labels) ? user.labels : [];
    const labelAdmin = labels.includes('admin') || labels.includes('Admin');
    const allowed = adminPref || labelAdmin;
    if (!allowed) return { allowed: false, reason: 'forbidden', user, prefValue: prefs.admin, labels } as any; // expose for debugging
    return { allowed: true, user, prefValue: prefs.admin } as any;
  } catch (e: any) {
    return { allowed: false, reason: 'error:' + (e?.message || 'unknown') };
  }
}
