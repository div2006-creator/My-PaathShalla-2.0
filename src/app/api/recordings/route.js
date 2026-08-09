import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

if (!global.inMemoryRecordings) {
  global.inMemoryRecordings = [];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');

    let dbRecordings = [];
    try {
      const query = {};
      if (subject && subject !== 'All Recordings' && subject !== 'All') {
        query.subject = subject;
      }

      if (search) {
        query.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { instructorName: { contains: search, mode: 'insensitive' } },
        ];
      }

      dbRecordings = await prisma.recording.findMany({
        where: query,
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      console.warn('Prisma recordings GET fallback to memory:', dbErr.message);
    }

    // Combine DB recordings and active memory recordings without duplicates
    const combined = [...dbRecordings];
    global.inMemoryRecordings.forEach((mem) => {
      if (!combined.some((d) => d.id === mem.id)) {
        combined.unshift(mem);
      }
    });

    let filtered = combined;
    if (subject && subject !== 'All Recordings' && subject !== 'All') {
      filtered = filtered.filter((r) => r.subject.toLowerCase() === subject.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.instructorName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ recordings: filtered });
  } catch (error) {
    return NextResponse.json({ recordings: global.inMemoryRecordings || [] });
  }
}

export async function POST(request) {
  try {
    const { title, subject, instructorName, duration, videoUrl, thumbnailUrl, roomName } = await request.json();

    if (!title || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRecording = {
      id: 'rec-' + Date.now(),
      title,
      subject,
      instructorName: instructorName || 'Faculty Instructor',
      duration: duration || '15:30',
      status: 'READY',
      videoUrl: videoUrl || '',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      roomName: roomName || 'live-room',
      createdAt: new Date().toISOString()
    };

    try {
      const recording = await prisma.recording.create({
        data: {
          id: newRecording.id,
          title,
          subject,
          instructorName: newRecording.instructorName,
          duration: newRecording.duration,
          status: 'READY',
          videoUrl: newRecording.videoUrl,
          thumbnailUrl: newRecording.thumbnailUrl,
          roomName: newRecording.roomName,
        },
      });
      if (recording) {
        global.inMemoryRecordings.unshift(recording);
        return NextResponse.json({ recording });
      }
    } catch (dbErr) {
      console.warn('Prisma recording POST fallback to memory:', dbErr.message);
    }

    global.inMemoryRecordings.unshift(newRecording);
    return NextResponse.json({ recording: newRecording });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing recording ID' }, { status: 400 });
    }

    // Authorization check
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (userId && userId !== 'demo-teacher-id') {
      const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
      if (user && user.role !== 'TEACHER') {
        return NextResponse.json({ error: 'Unauthorized: Only faculty can delete recordings' }, { status: 403 });
      }
    }

    try {
      await prisma.recording.delete({
        where: { id },
      });
    } catch (dbErr) {
      console.warn('Prisma recording DELETE fallback to memory:', dbErr.message);
    }

    global.inMemoryRecordings = global.inMemoryRecordings.filter((r) => r.id !== id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
