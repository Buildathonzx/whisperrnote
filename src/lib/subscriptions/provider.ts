import type { Subscription, SubscriptionPlan, SubscriptionStatus } from '@/types/appwrite';
import type { PlanResource } from './policy';

export interface PlanLimitCheck {
  allowed: boolean;
  limit: number | null;
  plan: SubscriptionPlan;
  resource: PlanResource;
  current: number;
  remaining: number | null;
  upgradeRecommended: boolean;
}

export interface ActivePlan {
  plan: SubscriptionPlan;
  status: SubscriptionStatus | 'none';
  periodEnd: string | null;
  seats: number | null;
  subscriptionId: string | null;
}

export interface SubscriptionProvider {
  getActivePlan(userId: string): Promise<ActivePlan>;
  enforcePlanLimit(userId: string, resource: PlanResource, currentValue: number): Promise<PlanLimitCheck>;
  listUserSubscriptions(userId: string): Promise<{ documents: Subscription[], total: number }>;
  getActiveSubscription(userId: string): Promise<Subscription | null>;
  upsertSubscription(userId: string, plan: SubscriptionPlan, patch?: Partial<Subscription>): Promise<Subscription>;
}
