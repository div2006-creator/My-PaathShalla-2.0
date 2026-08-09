import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    name: 'Prof. Divya Sharma',
    email: 'sharmadiv7880@gmail.com',
    role: 'TEACHER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room') || 'paathshalla-class';
    const paramName = searchParams.get('name');
    const paramRole = searchParams.get('role');

    let identity = 'user-id-' + Math.floor(Math.random() * 10000);
    let name = paramName || 'Student Learner';
    let role = paramRole || 'STUDENT';
    let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    try {
      const cookieStore = cookies();
      const userId = cookieStore.get('userId')?.value;
      if (userId) {
        identity = userId;
        if (DEMO_USERS[userId]) {
          const demo = DEMO_USERS[userId];
          name = paramName || demo.name;
          role = paramRole || demo.role;
          avatarUrl = demo.avatarUrl;
        } else {
          const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
          if (user) {
            identity = user.id;
            name = user.name || paramName || 'Student Learner';
            role = user.role || paramRole || 'STUDENT';
            avatarUrl = user.avatarUrl || avatarUrl;
          }
        }
      }
    } catch (e) {
      console.warn('LiveKit token session resolution error:', e.message);
    }

    if (paramName && paramName.trim()) {
      name = paramName.trim();
    }
    if (paramRole) {
      role = paramRole;
    }

    const apiKey = process.env.LIVEKIT_API_KEY || 'APIDi33ZJiP3exb';
    const apiSecret = process.env.LIVEKIT_API_SECRET || '1m2pAR4D32sLqhv5Sf4FpyguYT5MvUFVLwzO9nZz3wL';

    // Initialize access token with registered Google account identity
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name,
      metadata: JSON.stringify({ role, avatarUrl }),
    });

    // Grant audio/video stream publishing rights
    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return NextResponse.json({ token });
  } catch (error) {
    console.error('LiveKit Token error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate token' }, { status: 500 });
  }
}
