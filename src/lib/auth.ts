import { prisma } from './prisma';
import { verifyToken } from './auth-utils';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const verifyAuth = async (req: NextRequest) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') || 
                cookies().get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  return user;
};

export const getAuthUser = async (token: string) => {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      walletAddress: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return user;
};