import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const DEFAULT_USER = {
  id: 'default-student-id',
  name: 'Student Learner',
  email: 'student@paathshalla.com',
  role: 'STUDENT',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true }
      });
      if (user) {
        return NextResponse.json({ user });
      }
    }
    return NextResponse.json({ user: DEFAULT_USER });
  } catch (error) {
    return NextResponse.json({ user: DEFAULT_USER });
  }
}
