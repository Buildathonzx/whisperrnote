import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsed: true,
      expiresAt: true
    }
  });

  return NextResponse.json(apiKeys);
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, expiresAt } = await req.json();
    
    const key = crypto.randomBytes(32).toString('base64url');
    
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        userId: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      select: {
        id: true,
        key: true,
        name: true,
        createdAt: true,
        expiresAt: true
      }
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 400 }
    );
  }
}