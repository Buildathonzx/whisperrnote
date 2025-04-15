import { verifyAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, comparePasswords } from '@/lib/auth-utils';
import { AppwriteClient, Users } from '@/lib/appwrite';

const client = new AppwriteClient();
const users = new Users(client);

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return NextResponse.json(userWithoutPassword);
}

export async function PUT(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, currentPassword, newPassword } = await req.json();

    const updateData: any = {};

    if (name) {
      updateData.name = name;
    }

    if (currentPassword && newPassword) {
      const isValidPassword = await comparePasswords(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await users.update(user.id, updateData);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 400 }
    );
  }
}