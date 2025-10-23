import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { issueChallenge } from '../../../../../lib/passkeys';
import { PasskeyServer } from '../../../../../lib/passkey-server';

export async function POST(req: Request) {
  try {
    const { userId: rawUserId } = await req.json();
    const userId = String(rawUserId).trim().toLowerCase();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const url = new URL(req.url);
    const forwardedHost = req.headers.get('x-forwarded-host');
    const hostHeader = forwardedHost || req.headers.get('host') || url.host;
    const hostNoPort = hostHeader.split(':')[0];
    const rpID = process.env.NEXT_PUBLIC_RP_ID || hostNoPort || 'localhost';

    const server = new PasskeyServer();
    if (await server.shouldBlockPasskeyForEmail(userId)) {
      const hasWallet = await server.hasWalletPreference(userId);
      const errorMessage = hasWallet 
        ? 'Account already connected with wallet'
        : 'Account already exists';
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }
    
    const userCreds = await server.getPasskeysByEmail(userId);
    const allowCredentials = userCreds
      .filter((c) => c && c.id && typeof c.id === 'string')
      .map((c) => ({ id: c.id, type: 'public-key' as const }));

    const options = await generateAuthenticationOptions({
      allowCredentials,
      userVerification: 'preferred',
      rpID,
    });

    const issued = issueChallenge(userId, parseInt(process.env.WEBAUTHN_CHALLENGE_TTL_MS || '120000', 10));
    (options as any).challengeToken = issued.challengeToken;
    (options as any).challenge = issued.challenge;
    
    return NextResponse.json(options);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
