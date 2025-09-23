import { appwriteSubscriptionProvider } from './appwrite';
import type { SubscriptionProvider } from './provider';

// For now, the Appwrite provider is the default.
// In the future, this could be decided by a config value.
const subscriptionProvider: SubscriptionProvider = appwriteSubscriptionProvider;

export const getActivePlan = subscriptionProvider.getActivePlan;
export const enforcePlanLimit = subscriptionProvider.enforcePlanLimit;
export const listUserSubscriptions = subscriptionProvider.listUserSubscriptions;
export const getActiveSubscription = subscriptionProvider.getActiveSubscription;
export const upsertSubscription = subscriptionProvider.upsertSubscription;
