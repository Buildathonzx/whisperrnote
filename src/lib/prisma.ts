import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  var prisma: ReturnType<typeof PrismaClient.prototype.$extends> | undefined;
}

export const prisma = global.prisma || new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}