import { NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';

export async function POST(req: Request) {
  try {
    const user = await account.get();
    const prefs = user.prefs || {};
    
    prefs.email_mfa_enabled = true;

    await account.updatePrefs(prefs);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to enable email MFA' },
      { status: 500 }
    );
  }
}
