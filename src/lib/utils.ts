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

// Convenience accessor for wallet address (checks both walletEth and walletAddress)
export function getUserWalletAddress(user: any): string | null {
  return getUserField<string>(user, 'walletEth') || getUserField<string>(user, 'walletAddress');
}

// Subscription tier (fallback to FREE string) - do not import enum here to avoid cycles
export function getUserSubscriptionTier(user: any): string {
  return getUserField<string>(user, 'subscriptionTier') || 'FREE';
}

export function getUserSubscriptionExpiresAt(user: any): string | null {
  return getUserField<string>(user, 'subscriptionExpiresAt');
}

// Get list of OAuth identity providers connected to the account
export function getUserIdentities(user: any): {
  google: boolean;
  github: boolean;
  other: string[];
} {
  const result = {
    google: false,
    github: false,
    other: [] as string[]
  };

  if (!user?.identities || !Array.isArray(user.identities)) {
    return result;
  }

  for (const identity of user.identities) {
    const provider = (identity?.provider || '').toLowerCase();
    if (provider === 'google') {
      result.google = true;
    } else if (provider === 'github') {
      result.github = true;
    } else if (provider) {
      result.other.push(provider);
    }
  }

  return result;
}

// Check if user has a wallet connected
export function hasWalletConnected(user: any): boolean {
  return !!getUserWalletAddress(user);
}

// Format bytes into human readable size (B, KB, MB, GB)
export function formatFileSize(bytes: number | null | undefined): string {
  const b = typeof bytes === 'number' && bytes >= 0 ? bytes : 0;
  if (b < 1024) return b + 'B';
  const kb = b / 1024;
  if (kb < 1024) return kb.toFixed(kb < 10 ? 2 : 1) + 'KB';
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(mb < 10 ? 2 : 1) + 'MB';
  const gb = mb / 1024;
  return gb.toFixed(gb < 10 ? 2 : 1) + 'GB';
}
