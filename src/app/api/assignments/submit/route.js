import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId, content } = await request.json();
    if (!assignmentId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.submission.findFirst({
      where: { assignmentId, studentId: userId },
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: { content, submittedAt: new Date() },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: userId,
          content,
        },
      });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
