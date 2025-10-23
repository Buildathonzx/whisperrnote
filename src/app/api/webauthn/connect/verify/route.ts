export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { verifyChallengeToken } from '../../../../../lib/passkeys';
import { PasskeyServer } from '../../../../../lib/passkey-server';

export async function POST(req: Request) {
  try {
    const { email, attestation, challenge, challengeToken } = await req.json();
    if (!email || !attestation || !challenge || !challengeToken) {
      return NextResponse.json({ error: 'email, attestation, challenge and challengeToken required' }, { status: 400 });
    }

    verifyChallengeToken(email.toLowerCase(), challenge, challengeToken);

    const url = new URL(req.url);
    const forwardedProto = req.headers.get('x-forwarded-proto');
    const forwardedHost = req.headers.get('x-forwarded-host');
    const hostHeader = forwardedHost || req.headers.get('host') || url.host;
    const protocol = (forwardedProto || url.protocol.replace(':', '')).toLowerCase();
    const hostNoPort = hostHeader.split(':')[0];
    const rpID = process.env.NEXT_PUBLIC_RP_ID || hostNoPort || 'localhost';
    const origin = process.env.NEXT_PUBLIC_ORIGIN || `${protocol}://${hostHeader}`;

    const server = new PasskeyServer();
    const result = await server.registerPasskey(email.toLowerCase(), attestation, challenge, { rpID, origin });
    
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
  }
}
