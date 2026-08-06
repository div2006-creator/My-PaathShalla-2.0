import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day'); // "Mon", "Tue", "Wed", etc.
    
    const query = {};
    if (day) {
      query.dayOfWeek = day;
    }
    const schedule = await prisma.classSchedule.findMany({
      where: query,
    });
    return NextResponse.json({ schedule });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    const { subject, topic, startTime, endTime, room, dayOfWeek } = await request.json();
    if (!subject || !topic || !startTime || !endTime || !room || !dayOfWeek) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newClass = await prisma.classSchedule.create({
      data: {
        subject,
        topic,
        startTime,
        endTime,
        room,
        dayOfWeek,
        teacherName,
      },
    });

    return NextResponse.json({ class: newClass });
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

    await prisma.classSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
