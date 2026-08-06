import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room') || 'paathshalla-class';

    let identity = 'student-id-' + Math.floor(Math.random() * 1000);
    let name = 'Aarav Mehta';
    let role = 'STUDENT';
    let avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740';

    try {
      const cookieStore = cookies();
      const userId = cookieStore.get('userId')?.value;
      if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
        if (user) {
          identity = user.id;
          name = user.name;
          role = user.role;
          avatarUrl = user.avatarUrl || avatarUrl;
        }
      }
    } catch (e) {
      console.warn('Using default LiveKit token identity fallback:', e.message);
    }

    const apiKey = process.env.LIVEKIT_API_KEY || 'APIDi33ZJiP3exb';
    const apiSecret = process.env.LIVEKIT_API_SECRET || '1m2pAR4D32sLqhv5Sf4FpyguYT5MvUFVLwzO9nZz3wL';

    // Initialize access token with user metadata
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
