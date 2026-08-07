export const dynamic = 'force-dynamic';

let inMemoryAssignments = [
  {
    id: 'assign-1',
    title: 'Integral Calculus & Area Under Curves',
    description: 'Solve problems 1 to 10 on page 142. Show all substitution steps and evaluate definite integral limits.',
    subject: 'Mathematics',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    fileUrl: null,
    fileName: null,
    teacherId: 'default-teacher-id',
    createdAt: new Date().toISOString(),
    submissions: [
      {
        id: 'sub-1',
        assignmentId: 'assign-1',
        studentId: 'default-student-id',
        content: 'Calculus substitution solution: Let u = x^2 + 1, then du = 2x dx. The definite integral evaluates to 42.5.',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        grade: 'A+',
        feedback: 'Excellent step-by-step substitution work!'
      }
    ]
  },
  {
    id: 'assign-2',
    title: 'Electromagnetic Induction & Faraday Laws',
    description: 'Calculate magnetic flux changes and induced electromotive force (EMF) in a 50-turn copper coil.',
    subject: 'Physics',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    fileUrl: null,
    fileName: null,
    teacherId: 'default-teacher-id',
    createdAt: new Date().toISOString(),
    submissions: []
  },
  {
    id: 'assign-3',
    title: 'Organic Reaction Mechanisms & Esterification',
    description: 'Draw the nucleophilic acyl substitution mechanism for acetic acid and ethanol esterification.',
    subject: 'Chemistry',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    fileUrl: null,
    fileName: null,
    teacherId: 'default-teacher-id',
    createdAt: new Date().toISOString(),
    submissions: []
  }
];

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
