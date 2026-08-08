'use client';

import React, { useState, useEffect } from 'react';

export default function LiveQuizModal({ onClose, userRole }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const questionData = {
    question: "What is the result of evaluating ∫ (2x + 1) dx from x=0 to x=2?",
    options: [
      { id: 0, text: "4" },
      { id: 1, text: "6" },
      { id: 2, text: "8" },
      { id: 3, text: "10" }
    ],
    correctId: 1
  };

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption === null) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative text-white">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg material-symbols-outlined text-lg">
              quiz
            </span>
            <h3 className="font-bold text-white text-sm">Live Classroom MCQ Quiz</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-500/30">
              <span className="material-symbols-outlined text-xs">timer</span>
              <span>00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Question 1 of 1</span>
            <h4 className="font-bold text-white text-base leading-relaxed">{questionData.question}</h4>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                {questionData.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full p-3.5 rounded-xl border text-left font-bold transition-all flex items-center gap-3 ${
                      selectedOption === opt.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      selectedOption === opt.id ? 'bg-white text-indigo-700' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + opt.id)}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={selectedOption === null}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl disabled:opacity-40 transition-all shadow-md mt-2"
              >
                SUBMIT ANSWER
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl space-y-2">
                <span className={`material-symbols-outlined text-4xl ${
                  selectedOption === questionData.correctId ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {selectedOption === questionData.correctId ? 'check_circle' : 'cancel'}
                </span>
                <h4 className="font-bold text-white text-sm">
                  {selectedOption === questionData.correctId ? 'Correct Answer! 🎉' : 'Incorrect Answer'}
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Correct Option: <strong className="text-amber-400">Option B (6)</strong>
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
              >
                Continue Live Session
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
