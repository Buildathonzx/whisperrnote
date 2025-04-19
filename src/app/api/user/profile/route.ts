import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';

export async function GET(req: NextRequest) {
  // This endpoint should only be used for server-side admin actions or debugging.
  // For client-side profile, use the Appwrite account API directly in the browser.
  try {
    const user = await account.get();
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { name, newPassword, currentPassword } = await req.json();
    let updatedUser = null;
    if (name) {
      updatedUser = await account.updateName(name);
    }
    if (currentPassword && newPassword) {
      await account.updatePassword(newPassword, currentPassword);
      // Optionally, you can fetch the updated user again
      updatedUser = await account.get();
    }
    return NextResponse.json(updatedUser || { success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update profile' }, { status: 400 });
  }
}


export const runtime = 'nodejs';
