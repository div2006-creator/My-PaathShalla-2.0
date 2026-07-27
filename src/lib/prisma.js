import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let prisma;

function getPrismaClient() {
  // On Vercel serverless environment, copy dev.db to /tmp if needed for write access
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      } catch (err) {
        console.error('Error copying dev.db to /tmp:', err);
      }
    }

    const dbUrl = fs.existsSync(tmpDbPath) ? `file:${tmpDbPath}` : undefined;

    return new PrismaClient({
      ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    });
  }

  return new PrismaClient();
}

if (process.env.NODE_ENV === 'production') {
  prisma = getPrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = getPrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
