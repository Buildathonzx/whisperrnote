import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { Client, Users, ID } from 'node-appwrite';
import { setChallengeForEmail } from '../_store';

function getRp(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const rpID = process.env.PASSKEY_RP_ID || host.split(':')[0];
  const rpName = process.env.PASSKEY_RP_NAME || 'WhisperRNote';
  return { rpID, rpName };
}

export async function POST(request: NextRequest) {
  try {
    const { email, displayName } = await request.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const { rpID, rpName } = getRp(request);

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const users = new Users(client);

    let appwriteUserId: string;
    try {
      try {
        const userId = ID.unique();
        const emailUsername = email.split('@')[0];
        const cleanName = emailUsername.replace(/[^a-zA-Z]/g, '') || 'User';
        const user = await users.create(userId, email, undefined, undefined, cleanName);
        appwriteUserId = user.$id;
      } catch (createErr: any) {
        if (createErr?.code === 409) {
          const list = await users.list();
          const match = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (!match) throw new Error('Existing user not found after 409');
          appwriteUserId = match.$id;
        } else {
          throw createErr;
        }
      }
    } catch (e: any) {
      console.error('Appwrite user provisioning failed:', e);
      return NextResponse.json({ message: e.message || 'User provisioning failed' }, { status: 500 });
    }

    const options = await generateRegistrationOptions({
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
    });

    setChallengeForEmail(email, options.challenge);

    return NextResponse.json({ options, userId: appwriteUserId });
  } catch (error: any) {
    console.error('generate-registration-options error:', error);
    return NextResponse.json({ message: error.message || 'Failed to generate options' }, { status: 500 });
  }
}
