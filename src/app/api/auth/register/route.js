import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRole = role.toUpperCase();
    const user = await prisma.user.create({
      data: {
        name,
        email,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
