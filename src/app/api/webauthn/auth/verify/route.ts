export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { verifyChallengeToken } from '../../../../../lib/passkeys';
import { PasskeyServer } from '../../../../../lib/passkey-server';

export async function POST(req: Request) {
  let userId = '';
  const server = new PasskeyServer();

  try {
    const { userId: rawUserId, assertion, challengeToken, challenge } = await req.json();
    userId = String(rawUserId).trim().toLowerCase();
    if (!userId || !assertion || !challengeToken || !challenge) {
      return NextResponse.json({ error: 'userId, assertion, challenge and challengeToken required' }, { status: 400 });
    }

    verifyChallengeToken(userId, challenge, challengeToken);

    const url = new URL(req.url);
    const forwardedProto = req.headers.get('x-forwarded-proto');
    const forwardedHost = req.headers.get('x-forwarded-host');
    const hostHeader = forwardedHost || req.headers.get('host') || url.host;
    const protocol = (forwardedProto || url.protocol.replace(':', '')).toLowerCase();
    const hostNoPort = hostHeader.split(':')[0];
    const rpID = process.env.NEXT_PUBLIC_RP_ID || hostNoPort || 'localhost';
    const origin = process.env.NEXT_PUBLIC_ORIGIN || `${protocol}://${hostHeader}`;

    if (typeof assertion !== 'object' || !assertion) {
      return NextResponse.json({ error: 'Malformed assertion: not an object' }, { status: 400 });
    }
    if (!(assertion as any).response || !(assertion as any).response.clientDataJSON) {
      return NextResponse.json({ error: 'Malformed assertion: missing response.clientDataJSON' }, { status: 400 });
    }

    const result = await server.authenticatePasskey(userId, assertion, challenge, { rpID, origin });
    if (!result?.token?.secret) {
      return NextResponse.json({ error: 'Failed to create custom token' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, token: result.token });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
