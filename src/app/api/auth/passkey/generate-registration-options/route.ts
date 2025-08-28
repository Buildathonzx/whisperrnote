import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
// Types imported from @simplewebauthn/server runtime; JSON shape inferred
import { Client, Users, ID } from 'node-appwrite';

function getRp(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;
  const rpID = process.env.PASSKEY_RP_ID || host.split(':')[0];
  const rpName = process.env.PASSKEY_RP_NAME || 'WhisperRNote';
  return { rpID, rpName, origin };
}

export async function POST(request: NextRequest) {
  try {
    const { email, displayName } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const { rpID, rpName } = getRp(request);

    // Ensure a stable userId. If the user exists in Appwrite, reuse it; else create a staged id for the WebAuthn user handle.
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    let appwriteUserId: string;
    try {
      const list = await users.list({ search: email, limit: 1 });
      const match = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (match) {
        appwriteUserId = match.$id;
      } else {
        // Create a placeholder user (passwordless) now; name can be finalized on verify
        const userId = ID.unique();
        const emailUsername = email.split('@')[0];
        const cleanName = emailUsername.replace(/[^a-zA-Z]/g, '') || 'User';
        const user = await users.create(userId, email, undefined, undefined, cleanName);
        appwriteUserId = user.$id;
      }
    } catch (e: any) {
      console.error('Appwrite user fetch/create failed:', e);
      return NextResponse.json({ message: e.message || 'User provisioning failed' }, { status: 500 });
    }

    const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: email,
      userDisplayName: displayName || email.split('@')[0],
      userID: appwriteUserId,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257],
    } as GenerateRegistrationOptionsOpts);

    // TODO: Persist options.challenge keyed by appwriteUserId/email in Appwrite DB
    // For now, return it to the client and also echo the userId for later verify

    return NextResponse.json({ options, userId: appwriteUserId });
  } catch (error: any) {
    console.error('generate-registration-options error:', error);
    return NextResponse.json({ message: error.message || 'Failed to generate options' }, { status: 500 });
  }
}
