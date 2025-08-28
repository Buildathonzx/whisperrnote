import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { Client, Users } from 'node-appwrite';
import { getChallengeForEmail, deleteChallengeForEmail } from '../_store';

function getRp(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;
  const rpID = process.env.PASSKEY_RP_ID || host.split(':')[0];
  return { rpID, origin };
}

export async function POST(request: NextRequest) {
  try {
    const { email, authResp, userId } = await request.json();
    if (!email || !authResp || !userId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const expectedChallenge = getChallengeForEmail(email);
    if (!expectedChallenge) {
      return NextResponse.json({ message: 'Challenge expired or not found' }, { status: 400 });
    }

    const { rpID, origin } = getRp(request);

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    const user = await users.get(userId);
    const prefs: any = user.prefs || {};
    const credId = prefs.passkeyCredentialId as string | undefined;
    const pubKeyB64 = prefs.passkeyPublicKey as string | undefined;
    const counter = Number(prefs.passkeyCounter || 0);

    if (!credId || !pubKeyB64) {
      return NextResponse.json({ message: 'No stored passkey for user' }, { status: 400 });
    }

    const credentialPublicKey = Buffer.from(pubKeyB64, 'base64url');

    const verification = await verifyAuthenticationResponse({
      response: authResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credId,
        publicKey: new Uint8Array(credentialPublicKey.buffer, credentialPublicKey.byteOffset, credentialPublicKey.byteLength),
        counter,
        transports: ['internal'],
      },
      requireUserVerification: true,
    } as any);

    deleteChallengeForEmail(email);

    if (!verification.verified || !verification.authenticationInfo) {
      return NextResponse.json({ message: 'Authentication verification failed' }, { status: 400 });
    }

    const newCounter = verification.authenticationInfo.newCounter;
    await users.updatePrefs(userId, { passkeyCounter: newCounter } as any);

    const token = await users.createToken(userId);
    return NextResponse.json({ success: true, userId, secret: token.secret, expire: token.expire });
  } catch (error: any) {
    console.error('verify-authentication error:', error);
    return NextResponse.json({ message: error.message || 'Verification failed' }, { status: 500 });
  }
}
