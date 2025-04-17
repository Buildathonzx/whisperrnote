import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    // Log in user with Appwrite (create email session)
    const session = await account.createEmailPasswordSession(email, password);
    return NextResponse.json({ session });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Login failed' },
      { status: 400 }
    );
  }
}
