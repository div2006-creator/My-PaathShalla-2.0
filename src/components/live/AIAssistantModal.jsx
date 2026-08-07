'use client';

import React, { useState } from 'react';

export default function AIAssistantModal({ onClose, userRole = 'STUDENT' }) {
  const [activeAITab, setActiveAITab] = useState('summary'); // 'summary' | 'transcription' | 'quiz' | 'homework'
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  const summaryData = {
    title: 'Lecture Summary: Integral Calculus & Limits',
    takeaways: [
      'The Fundamental Theorem of Calculus connects differentiation and integration.',
      'Integration by parts formula: ∫ u dv = uv - ∫ v du.',
      'Definite integrals compute net area under curves between limits [a, b].'
    ],
    keyTerms: ['Antiderivative', 'Limits', 'U-Substitution', 'Riemann Sum']
  };

  const sampleQuiz = [
    {
      id: 1,
      q: 'What is the derivative of x²?',
      options: ['2x', 'x³/3', 'x', '2'],
      correct: 0
    },
    {
      id: 2,
      q: 'What is ∫ 1/x dx?',
      options: ['ln|x| + C', 'x²/2 + C', '-1/x² + C', 'e^x + C'],
      correct: 0
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-3 sm:p-6 animate-fade-in-up">
      <div className="bg-[#202124] border border-white/10 w-full max-w-2xl rounded-2xl flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* HEADER */}
        <div className="p-4 bg-[#28292c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">auto_awesome</span>
            <h3 className="font-bold text-sm sm:text-base">PaathShalla AI Classroom Co-Pilot</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* AI FEATURE TABS */}
        <div className="flex border-b border-white/10 bg-[#1e1e1e] text-xs font-bold shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'summary', label: 'AI Summary', icon: 'summarize' },
            { id: 'transcription', label: 'Live Transcript', icon: 'subtitles' },
            { id: 'quiz', label: 'Smart Quiz', icon: 'quiz' },
            { id: 'homework', label: 'AI Homework', icon: 'school' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAITab(tab.id)}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 shrink-0 border-b-2 transition-colors ${
                activeAITab === tab.id
                  ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: AI SUMMARY & TAKEAWAYS */}
          {activeAITab === 'summary' && (
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
                <h4 className="font-bold text-purple-300 text-sm mb-2">{summaryData.title}</h4>
                <p className="text-gray-300">Generated real-time AI key concepts and takeaways from today's lecture.</p>
              </div>

              <div>
                <h5 className="font-bold text-gray-300 uppercase text-[10px] tracking-wider mb-2">Key Takeaways</h5>
                <ul className="space-y-2">
                  {summaryData.takeaways.map((t, idx) => (
                    <li key={idx} className="bg-[#28292c] p-3 rounded-xl flex items-start gap-2.5 border border-white/5">
                      <span className="material-symbols-outlined text-purple-400 text-sm shrink-0 mt-0.5">check_circle</span>
                      <span className="text-gray-200">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-gray-300 uppercase text-[10px] tracking-wider mb-2">Extracted Keywords</h5>
                <div className="flex flex-wrap gap-2">
                  {summaryData.keyTerms.map((term, idx) => (
                    <span key={idx} className="bg-white/10 border border-white/10 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      #{term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TRANSCRIPTION & AI TRANSLATION */}
          {activeAITab === 'transcription' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#28292c] p-3 rounded-xl border border-white/10">
                <span className="font-bold text-gray-300">Translation Language</span>
                <select
                  className="bg-[#3c4043] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Hindi (हिंदी)</option>
                  <option>Spanish (Español)</option>
                  <option>French (Français)</option>
                </select>
              </div>

              <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-[#fbbc04] font-bold">Prof. Rajesh Varma (10:15 AM):</span>
                  <p className="text-gray-300">"Welcome class! Today we are studying definite integrals and u-substitution techniques."</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#8ab4f8] font-bold">Aarav Mehta (10:17 AM):</span>
                  <p className="text-gray-300">"Professor, does the limits change when we switch variables in u-substitution?"</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#fbbc04] font-bold">Prof. Rajesh Varma (10:18 AM):</span>
                  <p className="text-gray-300">"Excellent question Aarav. Yes, you must evaluate the new u-limits or substitute back to x."</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SMART AI QUIZ */}
          {activeAITab === 'quiz' && (
            <div className="space-y-4">
              <p className="text-gray-300">AI has generated an instant 2-question quiz based on the ongoing lecture:</p>
              
              {sampleQuiz.map((q) => (
                <div key={q.id} className="bg-[#28292c] border border-white/10 p-4 rounded-xl space-y-3">
                  <h5 className="font-bold text-white text-sm">{q.q}</h5>
                  <div className="space-y-2">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUserAnswers({ ...userAnswers, [q.id]: idx })}
                        className={`w-full p-2.5 rounded-xl text-left border transition-all ${
                          userAnswers[q.id] === idx
                            ? 'border-purple-400 bg-purple-500/20 font-bold'
                            : 'border-white/10 bg-[#3c4043] hover:border-white/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => setQuizSubmitted(true)}
                className="w-full py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 active:scale-95 transition-all"
              >
                {quizSubmitted ? 'Score: 100% (2/2 Correct!)' : 'Submit AI Quiz Answers'}
              </button>
            </div>
          )}

          {/* TAB 4: SMART HOMEWORK RECOMMENDATIONS */}
          {activeAITab === 'homework' && (
            <div className="space-y-3">
              <div className="bg-[#28292c] border border-white/10 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <span className="material-symbols-outlined text-sm">assignment</span>
                  <span>Recommended Practice Problems</span>
                </div>
                <p className="text-gray-300">1. Exercise 4.2: Problems 1 to 15 (Integration by Substitution)</p>
                <p className="text-gray-300">2. Solve the 3 challenge limits on Page 142.</p>
              </div>

              <div className="bg-[#28292c] border border-white/10 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#8ab4f8] font-bold">
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  <span>Suggested Supplementary Video</span>
                </div>
                <p className="text-gray-300">"Visualizing Calculus Integration & Area Under Curves" (12 min)</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
