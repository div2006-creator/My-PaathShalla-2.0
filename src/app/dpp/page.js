'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DPPPage() {
  const [activeDpp, setActiveDpp] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const dppList = [
    {
      id: 'dpp-12',
      title: 'DPP #12 — Binary Search Tree Rotations & Deletion',
      subject: 'Data Structures',
      questionsCount: 10,
      estimatedTime: '20 mins',
      difficulty: 'Medium',
      questions: [
        {
          id: 'dq1',
          question: 'In a BST, what is the maximum number of children a node can have?',
          options: ['1', '2', '3', 'Unlimited'],
          correct: 1,
          solution: 'A Binary Search Tree node can have at most 2 children: left child and right child.'
        },
        {
          id: 'dq2',
          question: 'Which traversal of a BST outputs elements in sorted ascending order?',
          options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
          correct: 1,
          solution: 'In-order traversal (Left, Root, Right) of any valid BST yields keys in strictly ascending order.'
        }
      ]
    },
    {
      id: 'dpp-11',
      title: 'DPP #11 — Definite Integrals & Fundamental Theorem',
      subject: 'Mathematics',
      questionsCount: 8,
      estimatedTime: '15 mins',
      difficulty: 'Hard',
      questions: []
    },
    {
      id: 'dpp-10',
      title: 'DPP #10 — Electromagnetic Induction & Lenz Law',
      subject: 'Physics',
      questionsCount: 10,
      estimatedTime: '25 mins',
      difficulty: 'Medium',
      questions: []
    }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-800 rounded-xl material-symbols-outlined text-2xl">fitness_center</span>
            <h1 className="text-2xl font-extrabold text-on-surface font-display">Daily Practice Problems (DPP)</h1>
          </div>
          <p className="text-xs text-on-surface-variant font-bold mt-1">Master core concepts through targeted daily problem sets</p>
        </div>
      </div>

      {/* DPP List View */}
      {!activeDpp && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dppList.map((dpp) => (
            <div key={dpp.id} className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm hover:border-primary transition-all space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-extrabold rounded-full">{dpp.subject}</span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full">{dpp.difficulty}</span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-on-surface font-display">{dpp.title}</h3>
                <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant mt-2">
                  <span>📝 {dpp.questionsCount} Questions</span>
                  <span>⏱ {dpp.estimatedTime}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveDpp(dpp)}
                className="w-full py-3 bg-primary hover:bg-primary-container text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>START DPP</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active DPP Runner */}
      {activeDpp && (
        <div className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-center border-b border-outline-variant/60 pb-4">
            <div>
              <span className="text-xs font-extrabold text-primary uppercase">{activeDpp.subject}</span>
              <h2 className="text-xl font-extrabold text-on-surface font-display">{activeDpp.title}</h2>
            </div>
            <button onClick={() => setActiveDpp(null)} className="px-4 py-2 bg-surface-container-high text-xs font-bold rounded-xl">Exit</button>
          </div>

          <div className="space-y-6">
            {activeDpp.questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-3">
                <p className="text-sm font-extrabold text-on-surface">Q{idx + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                      className={`w-full p-3 rounded-lg border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                        userAnswers[q.id] === oIdx ? 'bg-primary text-white border-primary' : 'bg-surface border-outline-variant text-on-surface'
                      }`}
                    >
                      <span className="font-extrabold">{String.fromCharCode(65 + oIdx)}.</span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>

                {submitted && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-800 space-y-1">
                    <p className="font-extrabold">Solution Walkthrough:</p>
                    <p>{q.solution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
          >
            SUBMIT DPP & SHOW SOLUTIONS
          </button>
        </div>
      )}

    </div>
  );
}
