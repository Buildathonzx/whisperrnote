import { NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';
import * as speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const user = await account.get();
    
    const secret = speakeasy.generateSecret({
      name: `WhisperRNote (${user.email})`,
      issuer: 'WhisperRNote'
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    return NextResponse.json({
      secret: secret.base32,
      qrCode
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to setup TOTP' },
      { status: 500 }
    );
  }
}
