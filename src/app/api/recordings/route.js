import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');

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

    const recordings = await prisma.recording.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recordings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, subject, instructorName, duration, videoUrl, thumbnailUrl } = await request.json();

    if (!title || !subject || !instructorName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const recording = await prisma.recording.create({
      data: {
        title,
        subject,
        instructorName,
        duration: duration || '15:30',
        videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      },
    });

    return NextResponse.json({ recording });
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

    await prisma.recording.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
