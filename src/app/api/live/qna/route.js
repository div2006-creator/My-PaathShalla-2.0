import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let inMemoryQna = [
  {
    id: 'q-1',
    author: 'Aarav Mehta',
    text: 'Does this integral substitution formula hold when x is negative in real domain?',
    upvotes: 4,
    answered: true,
    answer: 'Yes, provided x is within the real domain of definition.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'q-2',
    author: 'Ananya Sharma',
    text: 'Will the lecture recording be available in the Recordings Library right after class?',
    upvotes: 7,
    answered: false,
    answer: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  }
];

export async function GET() {
  return NextResponse.json({ questions: inMemoryQna });
}

export async function POST(request) {
  try {
    const { author, text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    const newQuestion = {
      id: 'q-' + Date.now(),
      author: author || 'Student',
      text,
      upvotes: 1,
      answered: false,
      answer: '',
      createdAt: new Date().toISOString()
    };

    inMemoryQna.push(newQuestion);
    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, action, answer } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing question ID' }, { status: 400 });
    }

    inMemoryQna = inMemoryQna.map((q) => {
      if (q.id === id) {
        if (action === 'upvote') {
          return { ...q, upvotes: q.upvotes + 1 };
        }
        if (action === 'answer') {
          return { ...q, answered: true, answer: answer || 'Answered Live by Teacher.' };
        }
      }
      return q;
    });

    return NextResponse.json({ questions: inMemoryQna });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
