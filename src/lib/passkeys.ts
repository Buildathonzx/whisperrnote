import crypto from 'crypto';

function getSecrets(): Array<{ secret: string; rotatedAt: number }> {
  const rotatingSecretsJson = process.env.PASSKEY_CHALLENGE_SECRETS;
  if (rotatingSecretsJson) {
    try {
      const secrets = JSON.parse(rotatingSecretsJson);
      if (Array.isArray(secrets) && secrets.length > 0 && secrets[0]?.secret) {
        return secrets;
      }
    } catch {
      // Fall through to fallback
    }
  }

  const singleSecret = process.env.PASSKEY_CHALLENGE_SECRET || 'dev-insecure-secret';
  return [{ secret: singleSecret, rotatedAt: Date.now() }];
}

function getCurrentSecret(): string {
  const secrets = getSecrets();
  return secrets[0]?.secret || 'dev-insecure-secret';
}

function randomChallenge(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function issueChallenge(userId: string, ttlMs: number) {
  const challenge = randomChallenge();
  const exp = Date.now() + ttlMs;
  const payload = JSON.stringify({ u: userId, c: challenge, e: exp });
  
  const currentSecret = getCurrentSecret();
  const sig = crypto.createHmac('sha256', currentSecret).update(payload).digest('base64url');
  const token = Buffer.from(payload).toString('base64url') + '.' + sig;
  
  return { challenge, challengeToken: token };
}

export function verifyChallengeToken(userId: string, challenge: string, token: string) {
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Malformed challenge token');

  const payloadJson = Buffer.from(parts[0], 'base64url').toString();
  const sig = parts[1];

  const secrets = getSecrets();
  let validSig = false;

  for (const secretObj of secrets) {
    const expectedSig = crypto.createHmac('sha256', secretObj.secret).update(payloadJson).digest('base64url');
    try {
      if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        validSig = true;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!validSig) throw new Error('Invalid challenge signature');

  let parsed: { u: string; c: string; e: number };
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    throw new Error('Bad challenge payload');
  }

  if (parsed.u !== userId) throw new Error('User mismatch');
  if (parsed.c !== challenge) throw new Error('Challenge mismatch');
  if (Date.now() > parsed.e) throw new Error('Challenge expired');

  return true;
}

export function getPasskeysByEmail(email: string) {
  // This is a placeholder - actual implementation would fetch from database
  return [];
}
