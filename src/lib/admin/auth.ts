import { getCurrentUser } from '@/lib/appwrite';

// Determines if current user is a founder based on user labels (Appwrite Account labels or custom prefs)
export async function requireFounder(): Promise<{ allowed: boolean; reason?: string; user?: any; }> {
  try {
    const user: any = await getCurrentUser();
    if (!user || !user.$id) return { allowed: false, reason: 'unauthenticated' };
    // Appwrite user objects may include labels array
    const labels: string[] = Array.isArray((user as any).labels) ? (user as any).labels : [];
    // Also allow a prefs flag fallback
    const prefs = (user as any).prefs || {};
    const isFounder = labels.includes('founder') || labels.includes('Founder') || prefs.founder === true;
    if (!isFounder) return { allowed: false, reason: 'forbidden', user };
    return { allowed: true, user };
  } catch (e: any) {
    return { allowed: false, reason: 'error:' + (e?.message || 'unknown') };
  }
}
