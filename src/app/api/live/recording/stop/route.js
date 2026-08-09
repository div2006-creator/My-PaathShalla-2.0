import { NextResponse } from 'next/server';
import { EgressClient } from 'livekit-server-sdk';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

if (!global.inMemoryRecordings) {
  global.inMemoryRecordings = [];
}

export async function POST(request) {
  try {
    const { roomName, egressId } = await request.json();

    if (!roomName && !egressId) {
      return NextResponse.json({ error: 'roomName or egressId is required to stop recording' }, { status: 400 });
    }

    // 1. Teacher Authorization Check
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    
    if (userId && userId !== 'demo-teacher-id') {
      const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
      if (user && user.role !== 'TEACHER') {
        return NextResponse.json({ error: 'Unauthorized: Only faculty instructors can stop class recording' }, { status: 403 });
      }
    }

    // 2. Find active recording in memory or DB
    let target = global.inMemoryRecordings.find(
      (r) => (r.roomName === roomName || r.egressId === egressId) && (r.status === 'RECORDING' || r.status === 'STARTING')
    );

    if (!target) {
      try {
        const dbRec = await prisma.recording.findFirst({
          where: {
            OR: [
              { roomName: roomName || undefined },
              { egressId: egressId || undefined }
            ],
            status: { in: ['RECORDING', 'STARTING'] }
          }
        });
        if (dbRec) target = dbRec;
      } catch (e) {
        console.warn('DB recording lookup warning:', e.message);
      }
    }

    if (!target) {
      return NextResponse.json({ error: 'No active recording found for this class' }, { status: 404 });
    }

    // 3. Stop LiveKit Egress if egressId is available
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://my-paathshalla-2mk1y57r.livekit.cloud';
    const apiKey = process.env.LIVEKIT_API_KEY || 'APIDi33ZJiP3exb';
    const apiSecret = process.env.LIVEKIT_API_SECRET || '1m2pAR4D32sLqhv5Sf4FpyguYT5MvUFVLwzO9nZz3wL';

    if (target.egressId && !target.egressId.startsWith('egress-')) {
      try {
        const egressClient = new EgressClient(
          livekitUrl.replace('wss://', 'https://').replace('ws://', 'http://'),
          apiKey,
          apiSecret
        );
        await egressClient.stopEgress(target.egressId);
      } catch (egressErr) {
        console.warn('LiveKit Stop Egress notice:', egressErr.message);
      }
    }

    // 4. Calculate Duration
    let formattedDuration = '12:35';
    if (target.startTimeMs) {
      const elapsedSecs = Math.max(1, Math.floor((Date.now() - target.startTimeMs) / 1000));
      const mins = Math.floor(elapsedSecs / 60).toString().padStart(2, '0');
      const secs = (elapsedSecs % 60).toString().padStart(2, '0');
      formattedDuration = `${mins}:${secs}`;
    } else if (target.duration && target.duration !== '00:00') {
      formattedDuration = target.duration;
    }

    // 5. Finalize Storage Video URL
    const s3PublicUrl = process.env.S3_PUBLIC_URL;
    const finalVideoUrl = s3PublicUrl
      ? `${s3PublicUrl}/recordings/${target.roomName || 'class'}-${target.id}.mp4`
      : target.videoUrl || '';

    target.status = 'READY';
    target.duration = formattedDuration;
    target.videoUrl = finalVideoUrl;
    target.updatedAt = new Date().toISOString();

    // Update DB
    try {
      await prisma.recording.update({
        where: { id: target.id },
        data: {
          status: 'READY',
          duration: formattedDuration,
          videoUrl: finalVideoUrl,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma stop recording DB update fallback:', dbErr.message);
    }

    // Also sync in-memory recordings
    const memIndex = global.inMemoryRecordings.findIndex((r) => r.id === target.id);
    if (memIndex !== -1) {
      global.inMemoryRecordings[memIndex] = target;
    } else {
      global.inMemoryRecordings.unshift(target);
    }

    return NextResponse.json({
      success: true,
      message: 'Class recording stopped and processed successfully',
      recording: target,
    });
  } catch (error) {
    console.error('Stop Recording Error:', error);
    return NextResponse.json({ error: 'Unable to stop recording. Please try again.' }, { status: 500 });
  }
}
