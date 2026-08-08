'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/ClientLayout';

export default function TestsPage() {
  const { user } = useAuth();
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes

  // Teacher Create Test Modal
  const [createTestModalOpen, setCreateTestModalOpen] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('Mathematics');
  const [testDuration, setTestDuration] = useState(45);
  const [testTotalMarks, setTestTotalMarks] = useState(20);

  const [questions, setQuestions] = useState([
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
  ]);

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

  const handlePublishTest = (e) => {
    e.preventDefault();
    if (!testTitle.trim()) return;
    alert(`CBT Exam "${testTitle}" published successfully to all student portals!`);
    setCreateTestModalOpen(false);
    setTestTitle('');
  };

  const currentQ = questions[currentQuestionIndex];
  const results = calculateResults();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Test Portal Header */}
      {!testStarted && !testSubmitted && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-md space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-amber-500/20 text-amber-400 rounded-xl material-symbols-outlined text-3xl border border-amber-500/30">
                quiz
              </span>
              <div>
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">All-India PaathShalla CBT Exam Series 2026</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">Full Mock Test #04 — Physics & Computer Science</h1>
              </div>
            </div>

            {user?.role === 'TEACHER' && (
              <button
                onClick={() => setCreateTestModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md shrink-0"
              >
                + Create New Test
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-800/40 border border-slate-800 rounded-xl text-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p>
              <p className="text-lg font-extrabold text-white">{questions.length} Questions</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
              <p className="text-lg font-extrabold text-amber-400">45 Minutes</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Marks</p>
              <p className="text-lg font-extrabold text-white">20 Marks</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Marking Scheme</p>
              <p className="text-lg font-extrabold text-emerald-400">+4 / -1</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <p className="font-bold text-white">CBT Exam Rules:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Do not refresh or leave the test browser tab during the exam session.</li>
              <li>You can mark questions for review and return to them anytime before final submission.</li>
              <li>Numerical questions accept precise integer values.</li>
            </ul>
          </div>

          <button
            onClick={() => setTestStarted(true)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined">play_circle</span>
            <span>START CBT TEST NOW</span>
          </button>
        </div>
      )}

      {/* ACTIVE CBT TEST ENGINE */}
      {testStarted && !testSubmitted && (
        <div className="space-y-6">
          
          {/* Top Bar with Timer */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white font-display">Mock Test #04 — Live Exam Stage</h2>
              <span className="text-xs text-indigo-400 font-bold">Topic: {currentQ.topic}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-xs font-extrabold">
                <span className="material-symbols-outlined text-sm">timer</span>
                <span>Time Left: {formatTime(timeLeft)}</span>
              </div>

              <button
                onClick={() => setTestSubmitted(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                SUBMIT TEST
              </button>
            </div>
          </div>

          {/* Test Grid: Question & Question Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Question Stage */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <button
                  onClick={() => toggleMarkReview(currentQ.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    markedForReview[currentQ.id]
                      ? 'bg-amber-500 text-black font-extrabold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">bookmark</span>
                  <span>{markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              <p className="text-sm sm:text-base font-bold text-white font-display leading-relaxed">
                {currentQ.question}
              </p>

              {/* MCQ Options */}
              {currentQ.type === 'MCQ' && (
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = answers[currentQ.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(currentQ.id, idx)}
                        className={`w-full p-3.5 rounded-xl border text-left font-bold text-xs transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                          isSelected ? 'bg-white text-indigo-700' : 'bg-slate-800 text-slate-400'
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
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Enter Numerical Value Answer:</label>
                  <input
                    type="number"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleNumericalAnswer(currentQ.id, e.target.value)}
                    placeholder="Type answer number..."
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Previous / Next Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl disabled:opacity-30 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous</span>
                </button>

                <button
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl disabled:opacity-30 flex items-center gap-1 shadow-md"
                >
                  <span>Next Question</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Question Palette */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4 h-fit">
              <h3 className="text-xs font-extrabold text-white font-display border-b border-slate-800 pb-3">
                Question Palette
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                  const isReview = markedForReview[q.id];
                  const isCurrent = idx === currentQuestionIndex;

                  let statusBg = 'bg-slate-800 text-slate-400 border-slate-700';
                  if (isReview) statusBg = 'bg-amber-500 text-black font-black border-amber-600';
                  else if (isAnswered) statusBg = 'bg-emerald-600 text-white font-black border-emerald-700';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-bold border transition-all flex items-center justify-center ${statusBg} ${
                        isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[11px] font-medium text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border"></span>
                  <span>Unvisited</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TEST ANALYTICS REPORT */}
      {testSubmitted && (
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-md space-y-6 max-w-3xl mx-auto text-white">
          <div className="text-center space-y-2">
            <span className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full material-symbols-outlined text-4xl inline-block border border-emerald-500/30">
              verified
            </span>
            <h2 className="text-2xl font-extrabold text-white font-display">Test Submitted Successfully!</h2>
            <p className="text-xs text-slate-400">Here is your detailed performance report</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-800/40 border border-slate-800 rounded-2xl text-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Score</p>
              <p className="text-2xl font-black text-indigo-400">{results.score} / 20</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</p>
              <p className="text-2xl font-black text-emerald-400">{results.accuracy}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Correct</p>
              <p className="text-2xl font-black text-emerald-400">{results.correctCount} / {results.total}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Attempted</p>
              <p className="text-2xl font-black text-white">{results.attemptedCount} / {results.total}</p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setTestStarted(false);
                setTestSubmitted(false);
                setAnswers({});
                setMarkedForReview({});
                setTimeLeft(2700);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Re-attempt Test
            </button>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Teacher Create Test Modal */}
      {createTestModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-base">Create CBT Test Series</h3>
              <button onClick={() => setCreateTestModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handlePublishTest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mock Test #05 — Organic Chemistry"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Subject</label>
                <select
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Computer Science</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    value={testDuration}
                    onChange={(e) => setTestDuration(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    value={testTotalMarks}
                    onChange={(e) => setTestTotalMarks(Number(e.target.value))}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 mt-2"
              >
                Publish CBT Test Exam
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
