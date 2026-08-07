'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParticipants } from '@livekit/components-react';

export default function SidebarPanel({
  user,
  chats = [],
  onSendChat,
  chatInput,
  setChatInput,
  onClose,
  isLocked = false,
  onToggleLock
}) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'qna' | 'polls' | 'notes' | 'resources' | 'participants'
  const chatEndRef = useRef(null);

  // Real LiveKit Participants
  const liveParticipants = useParticipants();

  // Q&A State
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  // Polls State
  const [polls, setPolls] = useState([]);
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [votedPollId, setVotedPollId] = useState(null);

  // Poll Creator State (Teacher)
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [pollQuestionInput, setPollQuestionInput] = useState('');
  const [pollOption1, setPollOption1] = useState('');
  const [pollOption2, setPollOption2] = useState('');

  // Shared Notes State
  const [notesText, setNotesText] = useState(
    '# Class Lecture Notes\n\n1. Real-time collaborative notes taken during class session.\n2. Summaries and equations saved by instructor and students.'
  );

  // Shared Resources State
  const [resources] = useState([
    { id: 'res-1', name: 'Class_Lecture_Slides.pdf', size: '2.4 MB', type: 'PDF' },
    { id: 'res-2', name: 'Formula_Cheatsheet.pdf', size: '1.1 MB', type: 'PDF' }
  ]);

  // Participants Search State
  const [searchMember, setSearchMember] = useState('');
  const [studentMicsDisabled, setStudentMicsDisabled] = useState(false);
  const [studentCamsDisabled, setStudentCamsDisabled] = useState(false);

  // Fetch Q&A from backend
  const fetchQna = async () => {
    try {
      const res = await fetch('/api/live/qna');
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
    } catch (e) {
      console.error('Fetch QnA failed:', e);
    }
  };

  // Fetch Polls from backend
  const fetchPolls = async () => {
    try {
      const res = await fetch('/api/live/polls');
      const data = await res.json();
      if (data.polls) setPolls(data.polls);
    } catch (e) {
      console.error('Fetch Polls failed:', e);
    }
  };

  useEffect(() => {
    fetchQna();
    fetchPolls();
    const interval = setInterval(() => {
      fetchQna();
      fetchPolls();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeTab]);

  // Submit Q&A Question to Backend API
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const text = newQuestion;
    setNewQuestion('');
    try {
      const res = await fetch('/api/live/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: user.name || 'Student', text }),
      });
      if (res.ok) fetchQna();
    } catch (err) {
      console.error(err);
    }
  };

  // Upvote Q&A Question via Backend API
  const handleUpvoteQuestion = async (qId) => {
    try {
      const res = await fetch('/api/live/qna', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: qId, action: 'upvote' }),
      });
      if (res.ok) fetchQna();
    } catch (err) {
      console.error(err);
    }
  };

  // Vote on Poll via Backend API
  const handleVotePoll = async (pollId, optionIdx) => {
    if (votedPollId === pollId) return;
    setVotedPollId(pollId);
    setSelectedPollOption(optionIdx);
    try {
      const res = await fetch('/api/live/polls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionIndex: optionIdx }),
      });
      if (res.ok) fetchPolls();
    } catch (err) {
      console.error(err);
    }
  };

  // Create Poll (Teacher) via Backend API
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!pollQuestionInput || !pollOption1 || !pollOption2) return;
    const q = pollQuestionInput;
    const opts = [pollOption1, pollOption2];
    setPollQuestionInput('');
    setPollOption1('');
    setPollOption2('');
    setCreatePollOpen(false);
    try {
      const res = await fetch('/api/live/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, options: opts }),
      });
      if (res.ok) fetchPolls();
    } catch (err) {
      console.error(err);
    }
  };

  // Export Notes
  const handleDownloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([notesText], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'Class_Lecture_Notes.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Build Real Room Participants
  const realMembers = liveParticipants.length > 0 
    ? liveParticipants.map(p => ({
        id: p.sid || p.identity,
        name: p.identity === user.id ? 'You (' + (p.name || user.name) + ')' : (p.name || p.identity || 'Participant'),
        role: (p.metadata?.includes('TEACHER') || p.identity === user.id && user.role === 'TEACHER') ? 'TEACHER' : 'STUDENT',
        isMuted: !p.isMicrophoneEnabled,
        isCamOff: !p.isCameraEnabled,
        hand: false
      }))
    : [
        { id: user.id, name: user.name + ' (You)', role: user.role, isMuted: false, isCamOff: false, hand: false }
      ];

  const filteredMembers = realMembers.filter((m) =>
    m.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-80 fixed inset-x-0 bottom-0 top-14 z-50 lg:relative lg:top-0 lg:z-auto bg-[#202124] border border-white/10 rounded-t-3xl lg:rounded-2xl flex flex-col shadow-2xl overflow-hidden shrink-0 h-[75vh] lg:h-full">
      
      {/* 6 TAB NAVIGATION HEADER */}
      <div className="flex items-center overflow-x-auto no-scrollbar border-b border-white/10 bg-[#28292c] shrink-0 text-xs font-bold">
        {[
          { id: 'chat', label: 'Chat', icon: 'chat' },
          { id: 'qna', label: 'Q&A', icon: 'quiz' },
          { id: 'polls', label: 'Polls', icon: 'poll' },
          { id: 'notes', label: 'Notes', icon: 'description' },
          { id: 'resources', label: 'Files', icon: 'folder' },
          { id: 'participants', label: 'People', icon: 'group' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-3 flex items-center gap-1.5 shrink-0 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
        
        <button onClick={onClose} className="px-3 py-3 ml-auto text-gray-400 hover:text-white shrink-0">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {/* TAB 1: RICH IN-CALL CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
            {chats.map((c) => {
              const isMe = c.senderId === user.id;
              const isTeacher = c.senderRole === 'TEACHER';

              return (
                <div key={c.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
                    isTeacher ? 'bg-[#fbbc04] text-black' : isMe ? 'bg-[#8ab4f8] text-black' : 'bg-[#3c4043]'
                  }`}>
                    {c.senderName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={`flex flex-col gap-0.5 max-w-[82%] ${isMe ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-semibold text-[11px] ${isTeacher ? 'text-[#fbbc04]' : isMe ? 'text-[#8ab4f8]' : 'text-gray-300'}`}>
                        {c.senderName}
                      </span>
                      <span className="text-[9px] text-gray-500">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-2xl text-xs text-white ${
                      isMe 
                        ? 'bg-[#8ab4f8]/20 border border-[#8ab4f8]/30' 
                        : isTeacher 
                          ? 'bg-[#fbbc04]/10 border border-[#fbbc04]/30' 
                          : 'bg-[#3c4043] border border-white/10'
                    }`}>
                      {c.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-[#28292c] border-t border-white/10 shrink-0">
            <form onSubmit={onSendChat} className="relative flex items-center">
              <input 
                className="w-full bg-[#3c4043] border border-white/10 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-[#8ab4f8] text-xs text-white placeholder-gray-400" 
                placeholder="Send a message to everyone..." 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="absolute right-2 w-7 h-7 bg-[#8ab4f8] rounded-full flex items-center justify-center text-black hover:opacity-90 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-[15px] text-black">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Q&A BOARD */}
      {activeTab === 'qna' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] p-3 overflow-y-auto space-y-3">
          <form onSubmit={handleAddQuestion} className="flex gap-2">
            <input 
              type="text"
              placeholder="Ask a question to the class..."
              className="flex-1 bg-[#3c4043] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#8ab4f8]"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <button type="submit" className="px-3 py-2 bg-[#8ab4f8] text-black font-bold text-xs rounded-xl hover:opacity-90">
              Ask
            </button>
          </form>

          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="bg-[#28292c] border border-white/10 p-3 rounded-xl text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-[#8ab4f8]">{q.author}</span>
                  <button 
                    onClick={() => handleUpvoteQuestion(q.id)}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg text-white font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs text-[#8ab4f8]">thumb_up</span>
                    <span>{q.upvotes}</span>
                  </button>
                </div>
                <p className="text-white">{q.text}</p>
                {q.answered ? (
                  <div className="bg-green-500/10 border border-green-500/30 p-2 rounded-lg text-[11px] text-green-300">
                    <span className="font-bold">Answered Live:</span> {q.answer || 'Answered by teacher in live stream.'}
                  </div>
                ) : (
                  <span className="inline-block text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold">
                    Pending Answer
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE POLLS */}
      {activeTab === 'polls' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] p-3 overflow-y-auto space-y-4">
          {user.role === 'TEACHER' && (
            <button 
              onClick={() => setCreatePollOpen(!createPollOpen)}
              className="w-full py-2.5 bg-[#8ab4f8] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Create New Poll</span>
            </button>
          )}

          {createPollOpen && (
            <form onSubmit={handleCreatePoll} className="bg-[#28292c] border border-white/10 p-3 rounded-xl space-y-2 text-xs">
              <input 
                type="text" 
                placeholder="Poll Question..." 
                required
                className="w-full p-2 bg-[#3c4043] border border-white/10 rounded-lg text-white"
                value={pollQuestionInput}
                onChange={(e) => setPollQuestionInput(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Option 1" 
                required
                className="w-full p-2 bg-[#3c4043] border border-white/10 rounded-lg text-white"
                value={pollOption1}
                onChange={(e) => setPollOption1(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Option 2" 
                required
                className="w-full p-2 bg-[#3c4043] border border-white/10 rounded-lg text-white"
                value={pollOption2}
                onChange={(e) => setPollOption2(e.target.value)}
              />
              <button type="submit" className="w-full py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">
                Launch Live Poll
              </button>
            </form>
          )}

          {polls.map((p) => (
            <div key={p.id} className="bg-[#28292c] border border-white/10 p-3.5 rounded-xl space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">{p.question}</h4>
              <div className="space-y-2">
                {p.options.map((opt, idx) => {
                  const pct = p.totalVotes > 0 ? Math.round((opt.votes / p.totalVotes) * 100) : 0;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleVotePoll(p.id, idx)}
                      className={`w-full p-2.5 rounded-xl text-left border relative overflow-hidden transition-all ${
                        selectedPollOption === idx && votedPollId === p.id 
                          ? 'border-[#8ab4f8] bg-[#8ab4f8]/20' 
                          : 'border-white/10 bg-[#3c4043] hover:border-white/30'
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 bg-[#8ab4f8]/30 transition-all" style={{ width: `${pct}%` }}></div>
                      <div className="relative z-10 flex justify-between font-semibold">
                        <span>{opt.text}</span>
                        <span>{pct}% ({opt.votes})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 text-right">{p.totalVotes} Total Votes</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SHARED LECTURE NOTES */}
      {activeTab === 'notes' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">Class Lecture Notes</span>
            <button 
              onClick={handleDownloadNotes}
              className="px-2.5 py-1 bg-[#8ab4f8] text-black font-bold text-[11px] rounded-lg flex items-center gap-1 hover:opacity-90"
            >
              <span className="material-symbols-outlined text-xs">download</span> Export Notes
            </button>
          </div>
          <textarea
            className="flex-1 w-full bg-[#28292c] border border-white/10 rounded-xl p-3 text-xs text-gray-200 font-mono focus:outline-none focus:border-[#8ab4f8] resize-none"
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
          />
        </div>
      )}

      {/* TAB 5: CLASS RESOURCES & FILES */}
      {activeTab === 'resources' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] p-3 overflow-y-auto space-y-3 text-xs">
          <h4 className="font-bold text-gray-300 uppercase text-[10px] tracking-wider">Class Materials & Handouts</h4>
          {resources.map((res) => (
            <div key={res.id} className="bg-[#28292c] border border-white/10 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="material-symbols-outlined text-[#8ab4f8]">description</span>
                <div className="truncate">
                  <p className="font-bold text-white truncate">{res.name}</p>
                  <span className="text-[10px] text-gray-400">{res.size} • {res.type}</span>
                </div>
              </div>
              <button 
                onClick={() => alert(`Downloading ${res.name}...`)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors shrink-0"
                title="Download Resource"
              >
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: REAL ROOM PARTICIPANTS & TEACHER CONTROLS */}
      {activeTab === 'participants' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] p-3 space-y-3 text-xs overflow-y-auto">
          {user.role === 'TEACHER' && (
            <div className="bg-[#28292c] border border-white/10 p-3 rounded-xl space-y-2">
              <h4 className="font-bold text-[#fbbc04] uppercase text-[10px] tracking-wider">Host Controls</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setStudentMicsDisabled(!studentMicsDisabled)}
                  className={`p-2 rounded-lg font-bold text-[11px] transition-colors ${
                    studentMicsDisabled ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {studentMicsDisabled ? 'Mics Disabled' : 'Disable Mics'}
                </button>

                <button 
                  onClick={() => setStudentCamsDisabled(!studentCamsDisabled)}
                  className={`p-2 rounded-lg font-bold text-[11px] transition-colors ${
                    studentCamsDisabled ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {studentCamsDisabled ? 'Cams Disabled' : 'Disable Cams'}
                </button>
              </div>

              <button 
                onClick={onToggleLock}
                className="w-full py-2 bg-amber-500/20 text-amber-300 font-bold rounded-lg border border-amber-500/30 flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">{isLocked ? 'lock' : 'lock_open'}</span>
                <span>{isLocked ? 'Unlock Classroom' : 'Lock Classroom'}</span>
              </button>
            </div>
          )}

          <input 
            type="text" 
            placeholder="Search members..."
            className="w-full p-2 bg-[#3c4043] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none"
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
          />

          <div className="space-y-2">
            {filteredMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-[#28292c] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#3c4043] flex items-center justify-center text-xs font-bold text-white">
                    {m.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{m.name}</p>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      m.role === 'TEACHER' ? 'bg-[#fbbc04]/20 text-[#fbbc04]' : 'bg-white/10 text-gray-300'
                    }`}>
                      {m.role === 'TEACHER' ? 'Host Teacher' : 'Student'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-sm ${m.isMuted ? 'text-red-400' : 'text-green-400'}`}>
                    {m.isMuted ? 'mic_off' : 'mic'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}
