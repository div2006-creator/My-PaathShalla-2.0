import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

let inMemoryChats = [
  {
    id: 'seed-chat-1',
    classId: 'default-class',
    senderId: 'teacher-1',
    senderName: 'Prof. Rajesh Varma',
    senderRole: 'TEACHER',
    message: 'Welcome everyone to today’s Live Gurukul session!',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: 'seed-chat-2',
    classId: 'default-class',
    senderId: 'student-1',
    senderName: 'Aarav Mehta',
    senderRole: 'STUDENT',
    message: 'Good morning Professor! Ready for calculus.',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  }
];

export async function GET() {
  try {
    try {
      const chats = await prisma.liveChat.findMany({
        orderBy: { createdAt: 'asc' },
      });
      if (chats && chats.length > 0) {
        return NextResponse.json({ chats });
      }
    } catch (dbErr) {
      console.warn('Prisma live-chat GET fallback to memory:', dbErr.message);
    }
    return NextResponse.json({ chats: inMemoryChats });
  } catch (error) {
    return NextResponse.json({ chats: inMemoryChats });
  }
}

export async function POST(request) {
  try {
    let senderId = 'guest-student-id';
    let senderName = 'Aarav Mehta';
    let senderRole = 'STUDENT';

    try {
      const cookieStore = cookies();
      const userId = cookieStore.get('userId')?.value;
      if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
        if (user) {
          senderId = user.id;
          senderName = user.name === 'Aarav Mehta' ? 'You' : user.name;
          senderRole = user.role;
        }
      }
    } catch (e) {
      // Fallback
    }

    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const newChat = {
      id: 'chat-' + Date.now(),
      classId: 'default-class',
      senderId,
      senderName,
      senderRole,
      message,
      createdAt: new Date().toISOString()
    };

    try {
      const chat = await prisma.liveChat.create({
        data: {
          senderId,
          senderName,
          senderRole,
          message,
        },
      });
      if (chat) {
        inMemoryChats.push(chat);
        return NextResponse.json({ chat });
      }
    } catch (dbErr) {
      console.warn('Prisma live-chat POST fallback to memory:', dbErr.message);
    }

    inMemoryChats.push(newChat);
    return NextResponse.json({ chat: newChat });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
