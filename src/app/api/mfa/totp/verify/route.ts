import { NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';
import * as speakeasy from 'speakeasy';

export async function POST(req: Request) {
  try {
    const { secret, code } = await req.json();
    
    if (!secret || !code) {
      return NextResponse.json(
        { error: 'Missing secret or verification code' },
        { status: 400 }
      );
    }

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    const user = await account.get();
    const prefs = user.prefs || {};
    
    prefs.totp_secret = secret;
    prefs.totp_enabled = true;
    
    await account.updatePrefs(prefs);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to verify TOTP' },
      { status: 500 }
    );
  }
}
