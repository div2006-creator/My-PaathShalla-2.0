import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

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

    const response = NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        avatarUrl: user.avatarUrl 
      } 
    });

    response.cookies.set('userId', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error?.code || error?.name?.includes('Prisma') 
      ? 'Database error. Please check database connection.'
      : (error.message || 'An error occurred during login');
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
