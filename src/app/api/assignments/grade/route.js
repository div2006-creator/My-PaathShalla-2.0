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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { submissionId, grade, feedback } = await request.json();
    if (!submissionId || !grade) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: { grade, feedback },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
