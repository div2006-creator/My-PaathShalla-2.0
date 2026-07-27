import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room') || 'paathshalla-class';

    // Verify user authentication
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Server configuration error: LiveKit credentials missing' }, { status: 500 });
    }

    // Initialize access token with user metadata
    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: user.name,
      metadata: JSON.stringify({ role: user.role, avatarUrl: user.avatarUrl }),
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
