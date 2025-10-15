  import { databases, ID, Query, APPWRITE_DATABASE_ID, APPWRITE_TABLE_ID_SUBSCRIPTIONS } from '../appwrite';

// Indicates whether subscription storage is configured
const SUBSCRIPTIONS_CONFIGURED = Boolean(APPWRITE_DATABASE_ID && APPWRITE_TABLE_ID_SUBSCRIPTIONS);

import type { Subscription, SubscriptionPlan, SubscriptionStatus } from '@/types/appwrite';
import type { SubscriptionProvider, ActivePlan } from './provider';
import { planPolicies, PlanResource } from './policy';

async function listUserSubscriptions(userId: string) {
  if (!SUBSCRIPTIONS_CONFIGURED) {
    return { documents: [], total: 0 } as any;
  }
  try {
    return await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_TABLE_ID_SUBSCRIPTIONS,
      [Query.equal('userId', userId), Query.orderDesc('currentPeriodStart'), Query.limit(20)] as any
    );
  } catch (e) {
    console.error('listUserSubscriptions failed', e);
    return { documents: [], total: 0 } as any;
  }
}

async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  if (!SUBSCRIPTIONS_CONFIGURED) {
    return null;
  }
  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_TABLE_ID_SUBSCRIPTIONS,
      [
        Query.equal('userId', userId),
        Query.limit(5),
        Query.orderDesc('currentPeriodEnd')
      ] as any
    );
    const subs = res.documents as any[];
    const now = Date.now();
    // Active if status active or trialing and periodEnd in future
    const active = subs.find(s => {
      const status: SubscriptionStatus | null = (s.status ?? null);
      const end = s.currentPeriodEnd ? Date.parse(s.currentPeriodEnd) : 0;
      return (status === 'active' || status === 'trialing') && (!end || end > now);
    });
    return active || null;
  } catch (e) {
    console.error('getActiveSubscription failed', e);
    return null;
  }
}

async function upsertSubscription(userId: string, plan: SubscriptionPlan, patch: Partial<Subscription> = {}) {
  if (!SUBSCRIPTIONS_CONFIGURED) {
    // If subscriptions are not configured, return a fake minimal subscription for local/dev safety
    const nowIso = new Date().toISOString();
    return {
      $id: 'local-subscription',
      userId,
      plan,
      status: patch.status || 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
      currentPeriodStart: patch.currentPeriodStart || nowIso,
      currentPeriodEnd: patch.currentPeriodEnd || null
    } as unknown as Subscription;
  }
  try {
    const existing = await listUserSubscriptions(userId);
    const nowIso = new Date().toISOString();
    const base: any = {
      userId,
      plan,
      updatedAt: nowIso,
      ...patch,
    };
    if (!patch.currentPeriodStart) base.currentPeriodStart = nowIso;
    if (!patch.status) base.status = 'active';
    // Try to find latest by plan
    const byPlan = (existing.documents as any[]).find(d => d.plan === plan);
    if (byPlan) {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_TABLE_ID_SUBSCRIPTIONS,
        byPlan.$id,
        base
      );
       return await databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_TABLE_ID_SUBSCRIPTIONS, byPlan.$id) as unknown as Subscription;
    }
    base.createdAt = nowIso;
    const created = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_TABLE_ID_SUBSCRIPTIONS,
      ID.unique(),
      base
    );
     return created as unknown as Subscription;
  } catch (e) {
    console.error('upsertSubscription failed', e);
    throw e;
  }
}

async function getActivePlan(userId: string): Promise<ActivePlan> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return { plan: 'free', status: 'none', periodEnd: null, seats: null, subscriptionId: null };
  return { plan: sub.plan, status: (sub.status || 'active') as any, periodEnd: sub.currentPeriodEnd || null, seats: sub.seats || null, subscriptionId: (sub as any).$id || null };
}

async function enforcePlanLimit(userId: string, resource: PlanResource, currentValue: number) {
    const { plan } = await getActivePlan(userId);
    const policy = planPolicies[plan];
    const limit = policy[resource];
    if (limit == null) {
        return { allowed: true, limit: null, plan, resource, current: currentValue, remaining: null, upgradeRecommended: false };
    }
    const remaining = Math.max(limit - currentValue, 0);
    return {
        allowed: currentValue < limit,
        limit,
        plan,
        resource,
        current: currentValue,
        remaining,
        upgradeRecommended: currentValue >= limit && plan !== 'org'
    };
}


export const appwriteSubscriptionProvider: SubscriptionProvider = {
    getActivePlan,
    enforcePlanLimit,
    listUserSubscriptions,
    getActiveSubscription,
    upsertSubscription,
};
