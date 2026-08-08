'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestsPage() {
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes in seconds

  const questions = [
    {
      id: 'q1',
      type: 'MCQ',
      topic: 'Calculus',
      question: 'What is the limit of (sin x) / x as x approaches 0?',
      options: ['0', '1', 'Infinity', 'Undefined'],
      correctAnswer: 1,
    },
    {
      id: 'q2',
      type: 'MCQ',
      topic: 'Algorithms',
      question: 'What is the worst-case time complexity of QuickSort?',
      options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(1)'],
      correctAnswer: 2,
    },
    {
      id: 'q3',
      type: 'NUMERICAL',
      topic: 'Physics',
      question: 'A body falls freely from rest under gravity (g = 10 m/s^2). Calculate its velocity in m/s after 3 seconds.',
      correctAnswerNum: 30,
    },
    {
      id: 'q4',
      type: 'MCQ',
      topic: 'Data Structures',
      question: 'Which data structure is primarily used for Breadth-First Search (BFS) graph traversal?',
      options: ['Stack', 'Queue', 'Heap', 'Tree'],
      correctAnswer: 1,
    },
    {
      id: 'q5',
      type: 'MCQ',
      topic: 'Calculus',
      question: 'What is the derivative of e^(2x) with respect to x?',
      options: ['e^(2x)', '2 * e^(2x)', '2x * e^(2x)', 'e^x'],
      correctAnswer: 1,
    },
  ];

  useEffect(() => {
    let timer;
    if (testStarted && !testSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, testSubmitted, timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectAnswer = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleNumericalAnswer = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const toggleMarkReview = (qId) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Calculate results on submission
  const calculateResults = () => {
    let correctCount = 0;
    let attemptedCount = 0;

    questions.forEach((q) => {
      const userAns = answers[q.id];
      if (userAns !== undefined && userAns !== '') {
        attemptedCount++;
        if (q.type === 'MCQ' && userAns === q.correctAnswer) {
          correctCount++;
        } else if (q.type === 'NUMERICAL' && Number(userAns) === q.correctAnswerNum) {
          correctCount++;
        }
      }
    });

    const score = correctCount * 4 - (attemptedCount - correctCount);
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    return { correctCount, attemptedCount, total: questions.length, score, accuracy };
  };

  const currentQ = questions[currentQuestionIndex];
  const results = calculateResults();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in-up">
      
      {/* Test Portal Header */}
      {!testStarted && !testSubmitted && (
        <div className="bg-surface border border-outline-variant p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-primary/10 text-primary rounded-xl material-symbols-outlined text-3xl">quiz</span>
            <div>
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">All-India PaathShalla Test Series 2026</span>
              <h1 className="text-2xl font-extrabold text-on-surface font-display">Full Mock Test #04 — Physics & Computer Science</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-xl text-center">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Questions</p>
              <p className="text-lg font-extrabold text-primary">5 Questions</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Duration</p>
              <p className="text-lg font-extrabold text-primary">45 Minutes</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Total Marks</p>
              <p className="text-lg font-extrabold text-primary">20 Marks</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Marking Scheme</p>
              <p className="text-lg font-extrabold text-emerald-600">+4 / -1</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-bold text-on-surface-variant">
            <p className="text-on-surface font-extrabold">Instructions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Do not refresh or leave the test browser tab during the exam session.</li>
              <li>You can mark questions for review and return to them anytime before final submission.</li>
              <li>Scientific numerical questions accept integer numbers.</li>
            </ul>
          </div>

          <button
            onClick={() => setTestStarted(true)}
            className="w-full py-4 bg-primary hover:bg-primary-container text-white font-extrabold rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 text-base"
          >
            <span className="material-symbols-outlined">play_circle</span>
            <span>START TEST NOW</span>
          </button>
        </div>
      )}

      {/* ACTIVE CBT TEST ENGINE */}
      {testStarted && !testSubmitted && (
        <div className="space-y-6">
          {/* Top Bar with Timer */}
          <div className="bg-surface border border-outline-variant p-4 rounded-2xl shadow-sm flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-base font-extrabold text-on-surface font-display">Mock Test #04 — Live Exam Interface</h2>
              <span className="text-xs text-primary font-bold">Topic: {currentQ.topic}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-800 px-4 py-2 rounded-xl text-sm font-extrabold">
                <span className="material-symbols-outlined text-base">timer</span>
                <span>Time Remaining: {formatTime(timeLeft)}</span>
              </div>

              <button
                onClick={() => setTestSubmitted(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all"
              >
                SUBMIT TEST
              </button>
            </div>
          </div>

          {/* Test Grid: Question & Question Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Question Stage */}
            <div className="lg:col-span-2 bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
                <span className="text-xs font-extrabold text-primary uppercase">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <button
                  onClick={() => toggleMarkReview(currentQ.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    markedForReview[currentQ.id]
                      ? 'bg-amber-500 text-black font-extrabold'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                  <span>{markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              <p className="text-base sm:text-lg font-bold text-on-surface font-display leading-relaxed">
                {currentQ.question}
              </p>

              {/* MCQ Options */}
              {currentQ.type === 'MCQ' && (
                <div className="space-y-3">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = answers[currentQ.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(currentQ.id, idx)}
                        className={`w-full p-4 rounded-xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-surface-container-low border-outline-variant hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                          isSelected ? 'bg-white text-primary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Numerical Input */}
              {currentQ.type === 'NUMERICAL' && (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-extrabold text-on-surface-variant">Enter Numerical Answer:</label>
                  <input
                    type="number"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleNumericalAnswer(currentQ.id, e.target.value)}
                    placeholder="Type number here..."
                    className="w-full p-3.5 bg-surface-container-low border border-outline-variant rounded-xl font-bold text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Previous / Next Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/60">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs rounded-xl disabled:opacity-30 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous</span>
                </button>

                <button
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl disabled:opacity-30 flex items-center gap-1 shadow-sm"
                >
                  <span>Next Question</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Question Palette (Prompt Spec #13) */}
            <div className="bg-surface border border-outline-variant p-5 rounded-2xl shadow-sm space-y-4 h-fit">
              <h3 className="text-sm font-extrabold text-primary font-display border-b border-outline-variant/60 pb-3">
                Question Palette
              </h3>

              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                  const isReview = markedForReview[q.id];
                  const isCurrent = idx === currentQuestionIndex;

                  let statusBg = 'bg-surface-container-high text-on-surface-variant border-outline-variant';
                  if (isReview) statusBg = 'bg-amber-500 text-black font-extrabold border-amber-600';
                  else if (isAnswered) statusBg = 'bg-emerald-600 text-white font-extrabold border-emerald-700';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center ${statusBg} ${
                        isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-3 border-t border-outline-variant/60 text-[11px] font-bold text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-surface-container-high border"></span>
                  <span>Unvisited</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TEST ANALYTICS AFTER SUBMISSION (Prompt Spec #13) */}
      {testSubmitted && (
        <div className="bg-surface border border-outline-variant p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <span className="p-3 bg-emerald-100 text-emerald-700 rounded-full material-symbols-outlined text-4xl inline-block">verified</span>
            <h2 className="text-2xl font-extrabold text-on-surface font-display">Test Submitted Successfully!</h2>
            <p className="text-xs text-on-surface-variant font-bold">Here is your detailed performance analytics report</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-surface-container-low rounded-2xl text-center">
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Total Score</p>
              <p className="text-2xl font-extrabold text-primary">{results.score} / 20</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Accuracy</p>
              <p className="text-2xl font-extrabold text-emerald-600">{results.accuracy}%</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Correct</p>
              <p className="text-2xl font-extrabold text-emerald-600">{results.correctCount} / {results.total}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Attempted</p>
              <p className="text-2xl font-extrabold text-on-surface">{results.attemptedCount} / {results.total}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setTestStarted(false);
                setTestSubmitted(false);
                setAnswers({});
                setMarkedForReview({});
                setTimeLeft(2700);
              }}
              className="px-6 py-3 bg-primary text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all"
            >
              RETRACT / RE-ATTEMPT TEST
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-surface-container-high text-on-surface font-extrabold text-xs rounded-xl border border-outline-variant"
            >
              RETURN TO DASHBOARD
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
