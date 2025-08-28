// Simple in-memory store for WebAuthn challenges (dev-only)
// TODO: Replace with Appwrite Database persistence

type ChallengeRecord = {
  challenge: string;
  createdAt: number;
};

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const challengeByEmail = new Map<string, ChallengeRecord>();
const challengeByUser = new Map<string, ChallengeRecord>();

export function setChallengeForEmail(email: string, challenge: string) {
  challengeByEmail.set(email.toLowerCase(), { challenge, createdAt: Date.now() });
}

export function getChallengeForEmail(email: string): string | null {
  const rec = challengeByEmail.get(email.toLowerCase());
  if (!rec) return null;
  if (Date.now() - rec.createdAt > CHALLENGE_TTL_MS) {
    challengeByEmail.delete(email.toLowerCase());
    return null;
  }
  return rec.challenge;
}

export function deleteChallengeForEmail(email: string) {
  challengeByEmail.delete(email.toLowerCase());
}

export function setChallengeForUser(userId: string, challenge: string) {
  challengeByUser.set(userId, { challenge, createdAt: Date.now() });
}

export function getChallengeForUser(userId: string): string | null {
  const rec = challengeByUser.get(userId);
  if (!rec) return null;
  if (Date.now() - rec.createdAt > CHALLENGE_TTL_MS) {
    challengeByUser.delete(userId);
    return null;
  }
  return rec.challenge;
}

export function deleteChallengeForUser(userId: string) {
  challengeByUser.delete(userId);
}
