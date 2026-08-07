'use client';

import React, { useState } from 'react';

export default function FloatingToolbar({
  isMicrophoneEnabled = true,
  isCameraEnabled = true,
  isScreenSharing = false,
  handRaised = false,
  chatOpen = true,
  captionsEnabled = false,
  isRecording = false,
  userRole = 'STUDENT',
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onOpenWhiteboard,
  onSendReaction,
  onToggleHand,
  onToggleChat,
  onOpenAI,
  onToggleCaptions,
  onOpenMoreMenu,
  onLeaveClass,
  onStartRecording,
  onStopRecording
}) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className="relative shrink-0 z-30">
      
      {/* Floating Reactions Quick Popup */}
      {showReactions && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-[#28292c] border border-white/10 p-2 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in-up">
          {['❤️', '👏', '👍', '🎉', '😂', '🔥', '😮'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSendReaction(emoji);
                setShowReactions(false);
              }}
              className="text-xl sm:text-2xl p-2 hover:bg-white/10 rounded-full transition-transform hover:scale-125 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Floating Glassmorphic Control Bar */}
      <div className="h-16 bg-[#202124]/90 backdrop-blur-xl rounded-full flex items-center justify-between px-3 sm:px-6 shadow-2xl border border-white/10 gap-2 sm:gap-3 overflow-x-auto no-scrollbar max-w-full">
        
        {/* Audio & Video Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={onToggleMic}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              isMicrophoneEnabled 
                ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' 
                : 'bg-[#ea4335] text-white shadow-lg'
            }`}
            title={isMicrophoneEnabled ? 'Turn Off Microphone' : 'Turn On Microphone'}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">{isMicrophoneEnabled ? 'mic' : 'mic_off'}</span>
          </button>
          
          <button 
            onClick={onToggleCamera}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              isCameraEnabled 
                ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' 
                : 'bg-[#ea4335] text-white shadow-lg'
            }`}
            title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">{isCameraEnabled ? 'videocam' : 'videocam_off'}</span>
          </button>
        </div>

        {/* Center Feature Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Screen Share (Present Now) */}
          <button 
            onClick={onToggleScreenShare}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing 
                ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={isScreenSharing ? 'Stop Presenting' : 'Present Screen Now'}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">present_to_all</span>
          </button>

          {/* Collaborative Jamboard Whiteboard */}
          <button 
            onClick={onOpenWhiteboard}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#3c4043] hover:bg-[#4a4e52] text-white flex items-center justify-center transition-all"
            title="Open Jamboard Whiteboard"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">draw</span>
          </button>

          {/* Live Emoji Reactions */}
          <button 
            onClick={() => setShowReactions(!showReactions)}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              showReactions 
                ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title="Send Emoji Reaction"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">mood</span>
          </button>

          {/* Raise Hand */}
          <button 
            onClick={onToggleHand}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              handRaised 
                ? 'bg-[#fbbc04] text-black font-bold shadow-lg' 
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title={handRaised ? 'Lower Hand' : 'Raise Hand'}
          >
            <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
          </button>

          {/* AI Assistant Panel */}
          <button 
            onClick={onOpenAI}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex items-center justify-center shadow-lg transition-all"
            title="Open AI Class Assistant"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">auto_awesome</span>
          </button>

          {/* Live Captions Subtitles */}
          <button 
            onClick={onToggleCaptions}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              captionsEnabled 
                ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title="Toggle Live Subtitles / Captions"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">closed_caption</span>
          </button>

          {/* Teacher Record Class */}
          {userRole === 'TEACHER' && (
            <button 
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-[#ea4335] text-white animate-pulse shadow-lg' 
                  : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
              }`}
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: isRecording ? "'FILL' 1" : "'FILL' 0" }}>
                {isRecording ? 'stop_circle' : 'radio_button_checked'}
              </span>
            </button>
          )}

          {/* In-Call Chat Drawer Toggle */}
          <button 
            onClick={onToggleChat}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
              chatOpen 
                ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
            }`}
            title="Toggle In-Call Sidebar"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">chat</span>
          </button>

          {/* More Options (Three Dots ⋮) */}
          <button 
            onClick={onOpenMoreMenu}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#3c4043] hover:bg-[#4a4e52] text-white flex items-center justify-center transition-all"
            title="More Options"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">more_vert</span>
          </button>
        </div>

        {/* Leave Class Button */}
        <div className="flex items-center shrink-0">
          <button 
            onClick={onLeaveClass}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#ea4335] text-white rounded-full font-bold text-xs sm:text-sm hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg"
            title="Leave Meeting"
          >
            <span className="material-symbols-outlined text-base sm:text-lg">call_end</span>
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>

      </div>
    </div>
  );
}
