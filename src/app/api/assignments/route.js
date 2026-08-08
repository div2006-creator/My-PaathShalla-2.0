import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

let inMemoryAssignments = [];

export async function GET(request) {
  try {
    let userId = 'default-student-id';
    let userRole = 'STUDENT';

    try {
      const cookieStore = cookies();
      const cUserId = cookieStore.get('userId')?.value;
      if (cUserId) {
        const user = await prisma.user.findUnique({ where: { id: cUserId } }).catch(() => null);
        if (user) {
          userId = user.id;
          userRole = user.role;
        }
      }
    } catch (e) {
      // Fallback
    }

    try {
      if (userRole === 'STUDENT') {
        const assignments = await prisma.assignment.findMany({
          include: {
            submissions: {
              where: { studentId: userId },
            },
          },
          orderBy: { dueDate: 'asc' },
        });
        if (assignments && assignments.length > 0) {
          return NextResponse.json({ assignments });
        }
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
        if (assignments && assignments.length > 0) {
          return NextResponse.json({ assignments });
        }
      }
    } catch (dbErr) {
      console.warn('Prisma assignments GET fallback to memory:', dbErr.message);
    }

    return NextResponse.json({ assignments: inMemoryAssignments });
  } catch (error) {
    return NextResponse.json({ assignments: inMemoryAssignments });
  }
}

export async function POST(request) {
  try {
    const { title, description, dueDate, subject, fileUrl, fileName } = await request.json();
    if (!title || !description || !dueDate || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAssignment = {
      id: 'assign-' + Date.now(),
      title,
      description,
      subject,
      dueDate: new Date(dueDate).toISOString(),
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      teacherId: 'default-teacher-id',
      createdAt: new Date().toISOString(),
      submissions: []
    };

    try {
      const assignment = await prisma.assignment.create({
        data: {
          title,
          description,
          dueDate: new Date(dueDate),
          subject,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          teacherId: 'default-teacher-id',
        },
      });
      if (assignment) {
        inMemoryAssignments.unshift(assignment);
        return NextResponse.json({ assignment });
      }
    } catch (dbErr) {
      console.warn('Prisma assignment POST fallback to memory:', dbErr.message);
    }

    inMemoryAssignments.unshift(newAssignment);
    return NextResponse.json({ assignment: newAssignment });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
