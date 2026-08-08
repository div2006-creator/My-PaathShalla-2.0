import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const DEMO_USERS = {
  'demo-student-id': {
    id: 'demo-student-id',
    name: 'Verified Student Learner',
    email: 'student@paathshalla.com',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  'demo-teacher-id': {
    id: 'demo-teacher-id',
    name: 'Prof. Faculty Instructor',
    email: 'teacher@paathshalla.com',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
};

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (userId) {
      if (DEMO_USERS[userId]) {
        return NextResponse.json({ user: DEMO_USERS[userId], isAuthenticated: true });
      }

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
