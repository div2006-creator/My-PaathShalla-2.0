import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'STUDENT') {
      const assignments = await prisma.assignment.findMany({
        include: {
          submissions: {
            where: { studentId: userId },
          },
        },
        orderBy: { dueDate: 'asc' },
      });
      return NextResponse.json({ assignments });
    } else {
      const assignments = await prisma.assignment.findMany({
        include: {
          submissions: {
            include: {
              student: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });
      return NextResponse.json({ assignments });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, description, dueDate, subject, fileUrl, fileName } = await request.json();
    if (!title || !description || !dueDate || !subject) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        subject,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        teacherId: userId,
      },
    });

    return NextResponse.json({ assignment });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
