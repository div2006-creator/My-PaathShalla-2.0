'use client';

import React from 'react';

export default function ClassroomHeader({
  courseTitle = "Mathematics 101",
  topicName = "Integral Calculus & Limits",
  isLive = true,
  isRecording = false,
  recordingSeconds = 0,
  participantCount = 14,
  networkQuality = "Excellent (5G HD)",
  teacherName = "Prof. Rajesh Varma",
  isLocked = false,
  onToggleLock,
  onOpenSettings,
  onToggleFullscreen,
  onLeaveClass,
  userRole = "STUDENT"
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <header className="w-full bg-[#1e1e1e]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between shrink-0 z-30 sticky top-0">
      
      {/* Left: Course Info & Live Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={onLeaveClass}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all active:scale-95 shrink-0"
          title="Back to Dashboard"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-xs">
              {courseTitle}
            </span>
            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-gray-500"></span>
            <span className="hidden md:inline-block text-xs text-[#8ab4f8] font-medium truncate max-w-[200px]">
              {topicName}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400">
            <span className="flex items-center gap-1 font-semibold text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {isLive ? 'LIVE CLASS' : 'OFFLINE'}
            </span>
            <span>•</span>
            <span className="truncate">{teacherName}</span>
          </div>
        </div>
      </div>

      {/* Center: Recording Status & Network Status */}
      <div className="hidden lg:flex items-center gap-3">
        {isRecording && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>REC {formatTime(recordingSeconds)}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">
          <span className="material-symbols-outlined text-sm text-green-400">signal_cellular_alt</span>
          <span>{networkQuality}</span>
        </div>

        {isLocked && (
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>Class Locked</span>
          </div>
        )}
      </div>

      {/* Right: Enrolled Count, Teacher Lock, Settings & Fullscreen */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#28292c] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-medium text-white shadow-inner">
          <span className="material-symbols-outlined text-sm text-[#8ab4f8]">group</span>
          <span>{participantCount} Enrolled</span>
        </div>

        {userRole === 'TEACHER' && (
          <button 
            onClick={onToggleLock}
            className={`p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1 ${
              isLocked 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            title={isLocked ? 'Unlock Classroom' : 'Lock Classroom (Prevent new joins)'}
          >
            <span className="material-symbols-outlined text-lg">{isLocked ? 'lock' : 'lock_open'}</span>
            <span className="hidden xl:inline">{isLocked ? 'Locked' : 'Lock Class'}</span>
          </button>
        )}

        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95"
          title="Classroom Device Settings"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
        </button>

        <button 
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95 hidden sm:flex"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined text-lg">fullscreen</span>
        </button>
      </div>

    </header>
  );
}
