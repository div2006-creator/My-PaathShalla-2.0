'use client';

import React from 'react';

export default function ClassroomHeader({
  courseTitle = "Data Structures & Algorithms",
  topicName = "Binary Search Trees",
  isLive = true,
  isRecording = false,
  recordingSeconds = 0,
  participantCount = 1,
  networkQuality = "HD Live",
  teacherName = "Faculty Instructor",
  isLocked = false,
  onToggleLock,
  onOpenSettings,
  onToggleFullscreen,
  onLeaveClass,
  userRole = "STUDENT"
}) {
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between shrink-0 z-30 sticky top-0">
      
      {/* Left: PaathShalla Brand | Course Info & Live Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={onLeaveClass}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 shrink-0"
          title="Back to Dashboard"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wide">PaathShalla</span>
            <span className="text-slate-600 font-bold">•</span>
            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-xs">
              {courseTitle}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
            <span className="flex items-center gap-1 font-extrabold text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {isLive ? '🔴 LIVE' : 'OFFLINE'}
            </span>
            <span>•</span>
            <span className="truncate">{teacherName}</span>
          </div>
        </div>
      </div>

      {/* Center: Prominent Recording Status Indicator */}
      <div className="flex items-center gap-3">
        {isRecording ? (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-400 px-3.5 py-1 rounded-full text-xs font-black tracking-wider animate-pulse shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span>🔴 REC {formatTime(recordingSeconds)}</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full text-xs text-slate-300 font-medium">
            <span className="material-symbols-outlined text-sm text-emerald-400">signal_cellular_alt</span>
            <span>{networkQuality}</span>
          </div>
        )}
      </div>

      {/* Right: Enrolled Count, Teacher Lock, Settings & Fullscreen */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-300">
          <span className="material-symbols-outlined text-sm text-indigo-400">group</span>
          <span>{participantCount} Students</span>
        </div>

        {userRole === 'TEACHER' && (
          <button 
            onClick={onToggleLock}
            className={`p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1 ${
              isLocked 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title={isLocked ? 'Unlock Classroom' : 'Lock Classroom'}
          >
            <span className="material-symbols-outlined text-lg">{isLocked ? 'lock' : 'lock_open'}</span>
            <span className="hidden xl:inline">{isLocked ? 'Locked' : 'Lock'}</span>
          </button>
        )}

        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
          title="Device Settings"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
        </button>

        <button 
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all hidden sm:flex"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined text-lg">fullscreen</span>
        </button>
      </div>

    </header>
  );
}
