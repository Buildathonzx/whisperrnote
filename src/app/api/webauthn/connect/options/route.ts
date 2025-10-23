import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { issueChallenge } from '../../../../../lib/passkeys';
import { PasskeyServer } from '../../../../../lib/passkey-server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const url = new URL(req.url);
    const forwardedHost = req.headers.get('x-forwarded-host');
    const hostHeader = forwardedHost || req.headers.get('host') || url.host;
    const hostNoPort = hostHeader.split(':')[0];
    const rpID = process.env.NEXT_PUBLIC_RP_ID || hostNoPort || 'localhost';
    const rpName = process.env.NEXT_PUBLIC_RP_NAME || 'WhisperRNote';

    const server = new PasskeyServer();
    const userEmail = email.toLowerCase();
    
    const userCreds = await server.getPasskeysByEmail(userEmail);
    const excludeCredentials = userCreds
      .filter((c) => c && c.id && typeof c.id === 'string')
      .map((c) => ({ id: c.id, type: 'public-key' as const }));

    const options = await generateRegistrationOptions({
      rpID,
      rpName,
      userID: userEmail,
      userName: userEmail,
      userDisplayName: userEmail,
      attestationType: 'direct',
      excludeCredentials,
    });

    const issued = issueChallenge(userEmail, parseInt(process.env.WEBAUTHN_CHALLENGE_TTL_MS || '120000', 10));
    (options as any).challengeToken = issued.challengeToken;
    (options as any).challenge = issued.challenge;
    
    return NextResponse.json(options);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
