import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true }
      }).catch(() => null);

      if (user) {
        return NextResponse.json({ user, isAuthenticated: true });
      }
    }

    return NextResponse.json({ user: null, isAuthenticated: false });
  } catch (error) {
    return NextResponse.json({ user: null, isAuthenticated: false });
  }
}
