import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

let inMemorySchedule = [
  {
    id: 'seed-sched-1',
    subject: 'Mathematics',
    topic: 'Calculus: Derivatives & Applications',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    room: 'Live Class (Active)',
    dayOfWeek: 'Wed',
    teacherName: 'Prof. Rajesh Varma'
  },
  {
    id: 'seed-sched-2',
    subject: 'Physics',
    topic: 'Electromagnetism & Waves',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    room: 'Room 302',
    dayOfWeek: 'Wed',
    teacherName: 'Dr. Anita Sharma'
  },
  {
    id: 'seed-sched-3',
    subject: 'Chemistry',
    topic: 'Organic Reaction Mechanisms',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    room: 'Room 105',
    dayOfWeek: 'Thu',
    teacherName: 'Prof. Rajesh Varma'
  },
  {
    id: 'seed-sched-4',
    subject: 'History',
    topic: 'Modern Indian History',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    room: 'Room 201',
    dayOfWeek: 'Fri',
    teacherName: 'Prof. Vikram Singh'
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day'); // "Mon", "Tue", "Wed", etc.
    
    const query = {};
    if (day) query.dayOfWeek = day;

    try {
      const schedule = await prisma.classSchedule.findMany({ where: query });
      if (schedule && schedule.length > 0) {
        return NextResponse.json({ schedule });
      }
    } catch (dbErr) {
      console.warn('Prisma schedule GET fallback to memory:', dbErr.message);
    }

    const filtered = day ? inMemorySchedule.filter(s => s.dayOfWeek === day) : inMemorySchedule;
    return NextResponse.json({ schedule: filtered });
  } catch (error) {
    return NextResponse.json({ schedule: inMemorySchedule });
  }
}

export async function POST(request) {
  try {
    let teacherName = 'Prof. Rajesh Varma';
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
      if (user?.name) {
        teacherName = user.name;
      }
    }

    const body = await request.json();
    const { subject, topic, startTime, endTime, room, dayOfWeek } = body;
    if (!subject || !topic || !startTime || !endTime || !room || !dayOfWeek) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newClassData = {
      id: 'sched-' + Date.now(),
      subject,
      topic,
      startTime,
      endTime,
      room,
      dayOfWeek,
      teacherName,
    };

    try {
      const dbClass = await prisma.classSchedule.create({
        data: { subject, topic, startTime, endTime, room, dayOfWeek, teacherName },
      });
      if (dbClass) {
        inMemorySchedule.push(dbClass);
        return NextResponse.json({ class: dbClass });
      }
    } catch (dbErr) {
      console.warn('Prisma schedule POST fallback to memory:', dbErr.message);
    }

    inMemorySchedule.push(newClassData);
    return NextResponse.json({ class: newClassData });
  } catch (error) {
    console.error('Schedule POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to schedule class' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing class ID' }, { status: 400 });
    }

    try {
      await prisma.classSchedule.delete({ where: { id } });
    } catch (dbErr) {
      console.warn('Prisma schedule DELETE fallback to memory:', dbErr.message);
    }

    inMemorySchedule = inMemorySchedule.filter(item => item.id !== id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
