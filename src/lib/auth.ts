import { prisma } from './prisma';
import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function verifyAuth(req: NextRequest) {
  // Check for JWT token
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  // Check for API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });
    
    if (key && (!key.expiresAt || key.expiresAt > new Date())) {
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsed: new Date() }
      });
      return key.user;
    }
  }

  return null;
}