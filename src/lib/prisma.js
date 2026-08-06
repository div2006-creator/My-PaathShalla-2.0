import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mypaathshalla?schema=public';

if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost'))) {
  console.warn('⚠️ WARNING: DATABASE_URL is missing or set to localhost in Vercel/Production environment!');
}

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
