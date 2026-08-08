'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/ClientLayout';

export default function DoubtsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, PENDING, RESOLVED
  const [doubtModalOpen, setDoubtModalOpen] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [doubtSubject, setDoubtSubject] = useState('Mathematics');
  const [doubtType, setDoubtType] = useState('TEXT'); // TEXT, IMAGE, VOICE
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Teacher reply state
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [doubts, setDoubts] = useState([
    {
      id: 'd-1',
      studentName: 'Aarav Mehta',
      subject: 'Mathematics',
      type: 'TEXT',
      question: 'In Definite Integrals, why does the substitution u = x^2 invert upper and lower limits when limits are negative?',
      status: 'RESOLVED',
      createdAt: 'Today at 08:30 AM',
      reply: 'When u = x^2, if original limits are -2 to 0, then u goes from (-2)^2=4 to 0^2=0. The integral limits swap direction, introducing a negative sign via ∫[a..b] = -∫[b..a].',
      repliedBy: 'Prof. Rajesh Varma'
    },
    {
      id: 'd-2',
      studentName: 'Rohan Gupta',
      subject: 'Physics',
      type: 'IMAGE',
      question: 'Attached schematic diagram for magnetic flux induction. Please check calculation for 50-turn coil EMF.',
      status: 'PENDING',
      createdAt: 'Yesterday at 05:45 PM',
      reply: null,
      repliedBy: null
    },
    {
      id: 'd-3',
      studentName: 'Priya Sharma',
      subject: 'Chemistry',
      type: 'VOICE',
      question: 'Voice Question (00:42 secs): Explaining esterification acyl-cleavage doubt.',
      status: 'PENDING',
      createdAt: '2 days ago',
      reply: null,
      repliedBy: null
    }
  ]);

  const isTeacher = user?.role === 'TEACHER';

  const filteredDoubts = doubts.filter(d => {
    if (activeFilter === 'PENDING') return d.status === 'PENDING';
    if (activeFilter === 'RESOLVED') return d.status === 'RESOLVED';
    return true;
  });

  const handleSubmitDoubt = (e) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    const newDoubt = {
      id: 'd-' + Date.now(),
      studentName: user.name,
      subject: doubtSubject,
      type: doubtType,
      question: doubtText,
      status: 'PENDING',
      createdAt: 'Just now',
      reply: null,
      repliedBy: null
    };

    setDoubts([newDoubt, ...doubts]);
    setDoubtText('');
    setDoubtModalOpen(false);
  };

  const handleTeacherReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedDoubt) return;

    const updated = doubts.map(d => d.id === selectedDoubt.id ? {
      ...d,
      status: 'RESOLVED',
      reply: replyText,
      repliedBy: user.name
    } : d);

    setDoubts(updated);
    setSelectedDoubt(null);
    setReplyText('');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30">
            {isTeacher ? 'Teacher Doubt Inbox' : '1-on-1 Doubt Clearing Desk'}
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Doubt Resolution Hub</h1>
          <p className="text-xs text-slate-400">Ask doubt via text, image diagram, or voice recording with direct response from faculty</p>
        </div>

        {!isTeacher && (
          <button
            onClick={() => setDoubtModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">help</span>
            <span>Ask New Doubt</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'PENDING', 'RESOLVED'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === f
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'ALL' ? 'All Doubts' : f === 'PENDING' ? 'Pending Answers' : 'Resolved'}
          </button>
        ))}
      </div>

      {/* Doubts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Doubts Feed */}
        <div className="lg:col-span-2 space-y-4">
          {filteredDoubts.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {item.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-xs">
                      {item.type === 'IMAGE' ? 'image' : item.type === 'VOICE' ? 'mic' : 'notes'}
                    </span>
                    {item.type}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                  item.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {item.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold mb-1">Asked by {item.studentName} • {item.createdAt}</p>
                <p className="text-sm font-bold text-white leading-relaxed">{item.question}</p>
              </div>

              {/* Faculty Reply Section */}
              {item.reply ? (
                <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1 text-xs">
                  <p className="font-bold text-amber-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Faculty Solution by {item.repliedBy}:
                  </p>
                  <p className="text-slate-200 leading-relaxed">{item.reply}</p>
                </div>
              ) : isTeacher ? (
                <button
                  onClick={() => setSelectedDoubt(item)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Answer this Doubt
                </button>
              ) : (
                <p className="text-xs text-slate-500 italic">Waiting for faculty response...</p>
              )}
            </div>
          ))}
        </div>

        {/* Teacher Reply Form / Instructions */}
        {selectedDoubt && isTeacher ? (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4 h-fit text-white">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-sm">Answer Student Doubt</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedDoubt.studentName} • {selectedDoubt.subject}</p>
            </div>

            <p className="text-xs bg-slate-800/60 p-3 rounded-xl text-slate-300 font-medium">"{selectedDoubt.question}"</p>

            <form onSubmit={handleTeacherReply} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Faculty Explanation</label>
                <textarea
                  rows="5"
                  required
                  placeholder="Provide step-by-step solution..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl hover:bg-amber-400"
                >
                  Send Resolution
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoubt(null)}
                  className="px-3 py-2.5 bg-slate-800 text-slate-400 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-3 h-fit text-xs text-slate-400">
            <h3 className="font-bold text-white text-sm">Doubt Submission Guidelines</h3>
            <p>1. State your specific equation or conceptual question clearly.</p>
            <p>2. You can upload an image diagram or record a voice note for complex doubts.</p>
            <p>3. PaathShalla faculty responds within 2 hours during active class windows.</p>
          </div>
        )}

      </div>

      {/* Ask Doubt Modal (Student) */}
      {doubtModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-base">Ask Teacher a Doubt</h3>
              <button onClick={() => setDoubtModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmitDoubt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Subject</label>
                <select
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={doubtSubject}
                  onChange={(e) => setDoubtSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Computer Science</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Doubt Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['TEXT', 'IMAGE', 'VOICE'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDoubtType(t)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        doubtType === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Doubt Description</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your question or equation..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                />
              </div>

              {doubtType === 'IMAGE' && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Upload Diagram / Photo</label>
                  <input type="file" accept="image/*" className="w-full text-slate-400" />
                </div>
              )}

              {doubtType === 'VOICE' && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-300 font-bold">{isRecording ? '🔴 Recording Voice Note...' : 'Click to Record Voice Note'}</span>
                  <button
                    type="button"
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isRecording ? 'Stop' : 'Record'}
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 mt-2"
              >
                Submit Doubt to Faculty
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
