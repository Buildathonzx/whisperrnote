import { getActivePlan } from '.';
import type { SubscriptionPlan } from '@/types/appwrite';

// Centralized plan policy definitions (soft limits). Adjust as product evolves.
export const planPolicies: Record<SubscriptionPlan, {
  notes: number | null;          // null = unlimited
  storageMB: number | null;
  apiKeys: number | null;
  collaboratorsPerNote: number | null;
  aiGenerationsPerMonth: number | null;
  attachmentSizeMB: number;      // max single attachment size
}> = {
  free: {
    notes: null, // unlimited free tier now
    storageMB: 250,
    apiKeys: 2,
    collaboratorsPerNote: 5,
    aiGenerationsPerMonth: 200,
    attachmentSizeMB: 10,
  },
  pro: {
    notes: null, // unlimited pro tier now
    storageMB: 10240, // 10 GB
    apiKeys: 10,
    collaboratorsPerNote: 25,
    aiGenerationsPerMonth: 5000,
    attachmentSizeMB: 100,
  },
  org: {
    notes: null, // unlimited
    storageMB: null,
    apiKeys: 100,
    collaboratorsPerNote: 100,
    aiGenerationsPerMonth: 50000,
    attachmentSizeMB: 250,
  }
};

export type PlanResource = keyof typeof planPolicies['free'];

export interface PlanLimitCheck {
  allowed: boolean;
  limit: number | null; // null means unlimited
  plan: SubscriptionPlan;
  resource: PlanResource;
  current: number;
  remaining: number | null;
  upgradeRecommended: boolean;
}

// Generic limit enforcement (non-mutating). Consumers decide whether to block.
export async function enforcePlanLimit(userId: string, resource: PlanResource, currentValue: number): Promise<PlanLimitCheck> {
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

export async function getPlanLimits(userId: string) {
  const { plan } = await getActivePlan(userId);
  return { plan, policy: planPolicies[plan] };
}
