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
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'participants' | 'resources'
  const chatEndRef = useRef(null);

  // Real LiveKit Participants
  const liveParticipants = useParticipants();

  // Shared Resources State
  const [resources] = useState([
    { id: 'res-1', name: 'Class_Lecture_Slides.pdf', size: '2.4 MB', type: 'PDF' },
    { id: 'res-2', name: 'Formula_Cheatsheet.pdf', size: '1.1 MB', type: 'PDF' }
  ]);

  // Participants Search & Mute controls
  const [searchMember, setSearchMember] = useState('');
  const [studentMicsDisabled, setStudentMicsDisabled] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const displayParticipants = liveParticipants.length > 0
    ? liveParticipants.map(p => ({
        id: p.identity,
        name: p.name || p.identity,
        role: p.isLocal && user?.role === 'TEACHER' ? 'TEACHER' : 'STUDENT',
        isLocal: p.isLocal,
        isMuted: !p.isMicrophoneEnabled,
        isHandRaised: p.isSpeaking
      }))
    : [
        { id: 'p1', name: 'Prof. Rajesh Varma (You)', role: user?.role || 'TEACHER', isMuted: false, isHandRaised: false },
        { id: 'p2', name: 'Aarav Mehta', role: 'STUDENT', isMuted: true, isHandRaised: true },
        { id: 'p3', name: 'Rohan Gupta', role: 'STUDENT', isMuted: false, isHandRaised: false },
        { id: 'p4', name: 'Priya Sharma', role: 'STUDENT', isMuted: fontIsMuted(true), isHandRaised: false }
      ];

  function fontIsMuted(val) { return val; }

  const filteredParticipants = displayParticipants.filter(p =>
    p.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-30 shadow-2xl">
      
      {/* Header with 3 Tabs: Chat, Participants, Resources */}
      <div className="p-3 border-b border-slate-800 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-white text-xs font-display flex items-center gap-1.5">
            <span className="material-symbols-outlined text-indigo-400 text-sm">meeting_room</span>
            <span>Classroom Panel</span>
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleLock}
              className={`p-1 rounded-lg text-xs transition-colors ${
                isLocked ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title={isLocked ? 'Unlock Panel' : 'Lock Panel Open'}
            >
              <span className="material-symbols-outlined text-sm">{isLocked ? 'lock' : 'lock_open'}</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-800/60 p-1 rounded-xl text-xs font-bold text-slate-300">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            <span>Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'participants' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            <span>Peers ({displayParticipants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">folder</span>
            <span>Handouts</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chats.map((msg, idx) => {
              const isMe = msg.sender === user?.name || msg.sender === 'You';
              const isTeacher = msg.role === 'TEACHER' || msg.isTeacher;
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-slate-300">{msg.sender}</span>
                    {isTeacher && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 font-extrabold rounded text-[9px] border border-amber-500/30">
                        Teacher
                      </span>
                    )}
                    <span className="text-slate-500">{msg.time || 'Now'}</span>
                  </div>
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : isTeacher
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/30 rounded-tl-none font-medium'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={onSendChat} className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-900">
            <input
              type="text"
              placeholder="Ask teacher or chat with class..."
              className="flex-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 2: PARTICIPANTS */}
      {activeTab === 'participants' && (
        <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search participant..."
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
            />
          </div>

          {user?.role === 'TEACHER' && (
            <div className="flex items-center justify-between p-2.5 bg-slate-800/60 border border-slate-800 rounded-xl text-xs">
              <span className="text-slate-300 font-bold">Mute All Students</span>
              <button
                onClick={() => setStudentMicsDisabled(!studentMicsDisabled)}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  studentMicsDisabled ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {studentMicsDisabled ? 'All Muted' : 'Mute All'}
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredParticipants.map((p) => (
              <div key={p.id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <span className="text-[10px] text-slate-400">{p.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {p.isHandRaised && (
                    <span className="p-1 bg-amber-500/20 text-amber-400 rounded-md text-xs" title="Hand Raised">
                      ✋
                    </span>
                  )}
                  <span className={`material-symbols-outlined text-base ${p.isMuted ? 'text-red-400' : 'text-emerald-400'}`}>
                    {p.isMuted ? 'mic_off' : 'mic'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-300">Shared Class Materials & Handouts</h4>
          {resources.map((res) => (
            <div key={res.id} className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-red-400 text-2xl">picture_as_pdf</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{res.name}</p>
                  <p className="text-[10px] text-slate-400">{res.size}</p>
                </div>
              </div>
              <button
                onClick={() => alert(`Downloading ${res.name}...`)}
                className="p-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
