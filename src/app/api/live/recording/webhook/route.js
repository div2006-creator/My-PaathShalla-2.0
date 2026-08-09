import { NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

if (!global.inMemoryRecordings) {
  global.inMemoryRecordings = [];
}

export async function POST(request) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY || 'APIDi33ZJiP3exb';
    const apiSecret = process.env.LIVEKIT_API_SECRET || '1m2pAR4D32sLqhv5Sf4FpyguYT5MvUFVLwzO9nZz3wL';

    const receiver = new WebhookReceiver(apiKey, apiSecret);
    const bodyText = await request.text();
    const authHeader = request.headers.get('authorization');

    let event;
    try {
      if (authHeader) {
        event = await receiver.receive(bodyText, authHeader);
      } else {
        event = JSON.parse(bodyText);
      }
    } catch (err) {
      console.warn('LiveKit Webhook signature check notice:', err.message);
      event = JSON.parse(bodyText);
    }

    if (!event) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    const { event: eventName, egressInfo } = event;

    if (egressInfo) {
      const egressId = egressInfo.egressId;
      const statusStr = egressInfo.status; // e.g. EGRESS_COMPLETE, EGRESS_FAILED

      let newStatus = 'PROCESSING';
      if (statusStr === 'EGRESS_COMPLETE' || statusStr === 3) {
        newStatus = 'READY';
      } else if (statusStr === 'EGRESS_FAILED' || statusStr === 4) {
        newStatus = 'FAILED';
      }

      // Update in DB
      try {
        await prisma.recording.updateMany({
          where: { egressId },
          data: {
            status: newStatus,
            videoUrl: egressInfo.fileResults?.[0]?.location || undefined,
          },
        });
      } catch (dbErr) {
        console.warn('Prisma webhook update warning:', dbErr.message);
      }

      // Update in memory
      const memRec = global.inMemoryRecordings.find((r) => r.egressId === egressId);
      if (memRec) {
        memRec.status = newStatus;
        if (egressInfo.fileResults?.[0]?.location) {
          memRec.videoUrl = egressInfo.fileResults[0].location;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Egress Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
