import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

let inMemoryRecordings = [
  {
    id: 'rec-1',
    title: 'Integral Calculus & Limits Deep Dive',
    subject: 'Mathematics',
    instructorName: 'Prof. Rajesh Varma',
    duration: '45:20',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'rec-2',
    title: 'Electromagnetic Induction & Faraday Experiments',
    subject: 'Physics',
    instructorName: 'Prof. Rajesh Varma',
    duration: '38:15',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'rec-3',
    title: 'Organic Chemistry Reactions & Mechanisms',
    subject: 'Chemistry',
    instructorName: 'Prof. Rajesh Varma',
    duration: '52:10',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');

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

      const recordings = await prisma.recording.findMany({
        where: query,
        orderBy: { createdAt: 'desc' },
      });

      if (recordings && recordings.length > 0) {
        return NextResponse.json({ recordings });
      }
    } catch (dbErr) {
      console.warn('Prisma recordings GET fallback to memory:', dbErr.message);
    }

    let filtered = inMemoryRecordings;
    if (subject && subject !== 'All Recordings' && subject !== 'All') {
      filtered = filtered.filter(r => r.subject.toLowerCase() === subject.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(search.toLowerCase()) || 
        r.instructorName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ recordings: filtered });
  } catch (error) {
    return NextResponse.json({ recordings: inMemoryRecordings });
  }
}

export async function POST(request) {
  try {
    const { title, subject, instructorName, duration, videoUrl, thumbnailUrl } = await request.json();

    if (!title || !subject || !instructorName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRecording = {
      id: 'rec-' + Date.now(),
      title,
      subject,
      instructorName,
      duration: duration || '15:30',
      videoUrl: videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    try {
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
      if (recording) {
        inMemoryRecordings.unshift(recording);
        return NextResponse.json({ recording });
      }
    } catch (dbErr) {
      console.warn('Prisma recording POST fallback to memory:', dbErr.message);
    }

    inMemoryRecordings.unshift(newRecording);
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

    try {
      await prisma.recording.delete({
        where: { id },
      });
    } catch (dbErr) {
      console.warn('Prisma recording DELETE fallback to memory:', dbErr.message);
    }

    inMemoryRecordings = inMemoryRecordings.filter(r => r.id !== id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
