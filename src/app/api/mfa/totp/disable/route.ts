import { NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';

export async function POST(req: Request) {
  try {
    const user = await account.get();
    const prefs = user.prefs || {};
    
    delete prefs.totp_secret;
    prefs.totp_enabled = false;
    
    await account.updatePrefs(prefs);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to disable TOTP' },
      { status: 500 }
    );
  }
}
