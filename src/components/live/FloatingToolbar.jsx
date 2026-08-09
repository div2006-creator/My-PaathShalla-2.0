'use client';

import React from 'react';

export default function FloatingToolbar({
  isMicrophoneEnabled = true,
  isCameraEnabled = true,
  isScreenSharing = false,
  handRaised = false,
  chatOpen = false,
  sidebarOpen = false,
  captionsEnabled = false,
  isRecording = false,
  userRole = 'STUDENT',
  isTeacher = false,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onOpenWhiteboard,
  onToggleHand,
  onToggleChat,
  onToggleSidebar,
  onToggleCaptions,
  onLeaveClass,
  onStartRecording,
  onStopRecording
}) {
  const isTeacherUser = isTeacher || userRole === 'TEACHER';
  const isChatOpen = chatOpen || sidebarOpen;
  const toggleChatHandler = onToggleChat || onToggleSidebar;
  return (
    <div className="relative shrink-0 z-30">
      
      {/* Floating Glassmorphic Control Bar */}
      <div className="h-16 bg-slate-900/95 backdrop-blur-xl rounded-full flex items-center justify-between px-3 sm:px-6 shadow-2xl border border-slate-800 gap-2 sm:gap-3 overflow-x-auto no-scrollbar max-w-full">
        
        {/* Audio & Video Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={onToggleMic}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              isMicrophoneEnabled 
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                : 'bg-red-600 text-white shadow-lg'
            }`}
            title={isMicrophoneEnabled ? 'Turn Off Microphone' : 'Turn On Microphone'}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">{isMicrophoneEnabled ? 'mic' : 'mic_off'}</span>
          </button>
          
          <button 
            onClick={onToggleCamera}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              isCameraEnabled 
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                : 'bg-red-600 text-white shadow-lg'
            }`}
            title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">{isCameraEnabled ? 'videocam' : 'videocam_off'}</span>
          </button>
        </div>

        {/* Center Feature Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Screen Share */}
          <button 
            onClick={onToggleScreenShare}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing 
                ? 'bg-indigo-600 text-white font-bold shadow-lg' 
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">present_to_all</span>
          </button>

          {/* Collaborative Whiteboard */}
          <button 
            onClick={onOpenWhiteboard}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center transition-all"
            title="Open Teaching Whiteboard"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">draw</span>
          </button>

          {/* Raise Hand */}
          <button 
            onClick={onToggleHand}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              handRaised 
                ? 'bg-amber-500 text-black font-bold shadow-lg' 
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
            title={handRaised ? 'Lower Hand' : 'Raise Hand'}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">front_hand</span>
          </button>

          {/* Live Captions */}
          <button 
            onClick={onToggleCaptions}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              captionsEnabled 
                ? 'bg-indigo-600 text-white font-bold shadow-lg' 
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
            title="Toggle Captions"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">closed_caption</span>
          </button>

          {/* Teacher Record Class */}
          {isTeacherUser && (
            <button 
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-600 text-white animate-pulse shadow-lg' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">
                {isRecording ? 'stop_circle' : 'radio_button_checked'}
              </span>
            </button>
          )}

          {/* In-Call Sidebar Toggle */}
          <button 
            onClick={toggleChatHandler}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              isChatOpen 
                ? 'bg-indigo-600 text-white font-bold shadow-lg' 
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
            title="Toggle Classroom Panel"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">chat</span>
          </button>
        </div>

        {/* Leave / End Class Button */}
        <div className="flex items-center shrink-0">
          <button 
            onClick={onLeaveClass}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 text-white rounded-full font-bold text-xs sm:text-sm hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg"
            title={isTeacherUser ? 'End Class for All' : 'Leave Class'}
          >
            <span className="material-symbols-outlined text-base sm:text-lg">call_end</span>
            <span className="hidden sm:inline">{isTeacherUser ? 'End Class' : 'Leave'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
