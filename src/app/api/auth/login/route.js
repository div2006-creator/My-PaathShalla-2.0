import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))) {
      return NextResponse.json({ 
        error: 'Database URL not configured on Vercel. Please set DATABASE_URL in Vercel Settings -> Environment Variables to your cloud PostgreSQL database.' 
      }, { status: 500 });
    }

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = cleanEmail === 'sharmadiv7880@gmail.com' ? 'TEACHER' : 'STUDENT';

    const user = await prisma.user.findUnique({ 
      where: { email: cleanEmail } 
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    if (!user.password) {
      return NextResponse.json({ 
        error: 'This account was created using Google. Please log in with Google.' 
      }, { status: 400 });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    // Sync assigned role
    if (user.role !== assignedRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: assignedRole }
      }).catch(() => null);
    }

    const response = NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: assignedRole, 
        avatarUrl: user.avatarUrl 
      } 
    });

    response.cookies.set('userId', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = error.message || 'An error occurred during login';
    if (error?.message?.includes('localhost') || error?.code === 'P1001') {
      errorMessage = 'Database unreachable. If deployed on Vercel, please set DATABASE_URL in Vercel Settings.';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
