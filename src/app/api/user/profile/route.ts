import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, comparePasswords } from '@/lib/auth-utils';

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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 400 }
    );
  }
}