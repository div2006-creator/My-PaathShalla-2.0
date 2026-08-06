import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Check if running on Vercel/Production without a valid cloud DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || '';
    if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))) {
      return NextResponse.json({ 
        error: 'Database URL not configured on Vercel. Please set DATABASE_URL in Vercel Settings -> Environment Variables to your cloud PostgreSQL database (e.g. Neon.tech or Supabase).' 
      }, { status: 500 });
    }

    const { name, email, password, role } = await request.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRole = role.toUpperCase();

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        avatarUrl: userRole === 'STUDENT'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740'
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEIqpGngz3OzOf8MycyD8ZTLaDZj8xnjPRgVCZo_BCUhWDa3NIwBcaPKmokKyPL3S6SodrJ3k00KCV4brCXT5ZODgYFVbg3X5NVrYVXepnv9EzVEIq5VYzof4V0nQ2U0Kl0Rh5iR1IrGbovbIcR8JIP8VLtCkerslMF_GhMwDxYkiUm3IDBx7uK-3jrrf1ZMr1A5tAG27dHjI1ivlvZL3X2TIWsMvoDSbYK_5eOWi9pld8R8wdqGn2UyFfzFG9BFwb9l6BAqLpWEc'
      }
    });

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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = error.message || 'An error occurred during registration';
    if (error?.message?.includes('localhost') || error?.code === 'P1001') {
      errorMessage = 'Database unreachable. If deployed on Vercel, please set DATABASE_URL in Vercel Settings -> Environment Variables to your cloud PostgreSQL database (e.g., Neon or Supabase).';
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
