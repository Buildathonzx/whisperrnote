// Utility helpers

// Safely get a user field preferring top-level value, then legacy prefs
// Example: getUserField(user, 'profilePicId') will return user.profilePicId || user.prefs?.profilePicId
export function getUserField<T = any>(user: any, field: string): T | null {
  if (!user) return null;
  if (user && Object.prototype.hasOwnProperty.call(user, field) && user[field] !== undefined && user[field] !== null) {
    return user[field] as T;
  }
  const prefs = user.prefs || {};
  if (prefs && Object.prototype.hasOwnProperty.call(prefs, field) && prefs[field] !== undefined && prefs[field] !== null) {
    return prefs[field] as T;
  }
  return null;
}

// Convenience accessor for profile picture id
export function getUserProfilePicId(user: any): string | null {
  return getUserField<string>(user, 'profilePicId');
}

// Convenience accessor for auth method
export function getUserAuthMethod(user: any): string | null {
  return getUserField<string>(user, 'authMethod');
}

// Convenience accessor for wallet address
export function getUserWalletAddress(user: any): string | null {
  return getUserField<string>(user, 'walletAddress');
}

// Subscription tier (fallback to FREE string) - do not import enum here to avoid cycles
export function getUserSubscriptionTier(user: any): string {
  return getUserField<string>(user, 'subscriptionTier') || 'FREE';
}

export function getUserSubscriptionExpiresAt(user: any): string | null {
  return getUserField<string>(user, 'subscriptionExpiresAt');
}
