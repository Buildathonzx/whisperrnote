import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
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
    const { email, attResp, userId } = await request.json();

    if (!email || !attResp || !userId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const expectedChallenge = getChallengeForEmail(email);
    if (!expectedChallenge) {
      return NextResponse.json({ message: 'Challenge expired or not found' }, { status: 400 });
    }

    const { rpID, origin } = getRp(request);

    const verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    deleteChallengeForEmail(email);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ message: 'Registration verification failed' }, { status: 400 });
    }

    const info = verification.registrationInfo;

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    await users.updatePrefs(userId, {
      authMethod: 'passkey',
      passkeyCredentialId: Buffer.from(info.credentialID).toString('base64url'),
      passkeyPublicKey: Buffer.from(info.credentialPublicKey).toString('base64url'),
      passkeyCounter: info.counter,
      passkeyBackedUp: info.credentialBackedUp,
      passkeyDeviceType: info.credentialDeviceType,
      passkeyEmail: email,
      registeredAt: new Date().toISOString(),
    } as any);

    const token = await users.createToken(userId);

    return NextResponse.json({
      success: true,
      userId,
      secret: token.secret,
      expire: token.expire,
    });
  } catch (error: any) {
    console.error('verify-registration error:', error);
    return NextResponse.json({ message: error.message || 'Verification failed' }, { status: 500 });
  }
}
