import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const chats = await prisma.liveChat.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ chats });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const chat = await prisma.liveChat.create({
      data: {
        senderId: user.id,
        senderName: user.name === 'Aarav Mehta' ? 'You' : user.name,
        senderRole: user.role,
        message,
      },
    });

    return NextResponse.json({ chat });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
