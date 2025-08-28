// Simple in-memory nonce store for wallet auth (dev-only)
// TODO: Replace with Appwrite Database persistence in production

export type NonceRecord = {
  nonce: string;
  address: string;
  createdAt: number;
  used?: boolean;
};

const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const nonceByAddress = new Map<string, NonceRecord>();

export function issueNonce(address: string): string {
  const normalized = address.toLowerCase();
  const nonce = crypto.getRandomValues(new Uint32Array(4)).join('-');
  nonceByAddress.set(normalized, { nonce, address: normalized, createdAt: Date.now(), used: false });
  return nonce;
}

export function getNonce(address: string): NonceRecord | null {
  const rec = nonceByAddress.get(address.toLowerCase());
  if (!rec) return null;
  if (rec.used) return null;
  if (Date.now() - rec.createdAt > NONCE_TTL_MS) {
    nonceByAddress.delete(address.toLowerCase());
    return null;
  }
  return rec;
}

export function markNonceUsed(address: string) {
  const rec = nonceByAddress.get(address.toLowerCase());
  if (rec) rec.used = true;
}
