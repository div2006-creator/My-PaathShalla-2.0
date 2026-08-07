import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let inMemoryPolls = [
  {
    id: 'poll-1',
    question: 'What is the indefinite integral ∫ x² dx ?',
    options: [
      { text: 'x³/3 + C', votes: 12 },
      { text: '2x + C', votes: 2 },
      { text: 'x³ + C', votes: 1 }
    ],
    totalVotes: 15,
    active: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  }
];

export async function GET() {
  return NextResponse.json({ polls: inMemoryPolls });
}

export async function POST(request) {
  try {
    const { question, options } = await request.json();
    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: 'Question and at least 2 options are required' }, { status: 400 });
    }

    const newPoll = {
      id: 'poll-' + Date.now(),
      question,
      options: options.map((optText) => ({ text: optText, votes: 0 })),
      totalVotes: 0,
      active: true,
      createdAt: new Date().toISOString()
    };

    inMemoryPolls.unshift(newPoll);
    return NextResponse.json({ poll: newPoll });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { pollId, optionIndex } = await request.json();
    if (!pollId || optionIndex === undefined) {
      return NextResponse.json({ error: 'Missing pollId or optionIndex' }, { status: 400 });
    }

    inMemoryPolls = inMemoryPolls.map((p) => {
      if (p.id === pollId && p.options[optionIndex]) {
        const updatedOpts = [...p.options];
        updatedOpts[optionIndex] = {
          ...updatedOpts[optionIndex],
          votes: updatedOpts[optionIndex].votes + 1
        };
        return {
          ...p,
          options: updatedOpts,
          totalVotes: p.totalVotes + 1
        };
      }
      return p;
    });

    return NextResponse.json({ polls: inMemoryPolls });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
