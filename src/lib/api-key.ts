// Temporary API key validation stub
// Future: integrate with Appwrite collection storing hashed keys

export interface APIKeyValidationResult {
  valid: boolean;
  reason?: string;
  keyOwnerId?: string;
  plan?: string;
}

// Very lightweight format check (adjust as needed)
const BASIC_KEY_REGEX = /^[A-Za-z0-9_-]{20,80}$/;

export async function validateApiKey(key: string | null | undefined): Promise<APIKeyValidationResult> {
  if (!key) return { valid: false, reason: 'MISSING' };
  if (!BASIC_KEY_REGEX.test(key)) return { valid: false, reason: 'FORMAT' };
  // Placeholder: always false until backing store implemented
  return { valid: false, reason: 'UNVERIFIED' };
}
