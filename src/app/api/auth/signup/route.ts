import { NextRequest, NextResponse } from 'next/server';
import { account, ID } from '@/lib/appwrite';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    // Register user with Appwrite
    const user = await account.create(ID.unique(), email, password, name);
    // Optionally, you can trigger email verification here if needed
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Registration failed' },
      { status: 400 }
    );
  }
}

export const runtime = 'nodejs';
