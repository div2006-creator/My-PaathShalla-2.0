'use client';

import React from 'react';
import { ParticipantTile } from '@livekit/components-react';

export default function ParticipantCard({
  trackReference,
  isLocal = false,
  isTeacher = false,
  isSpeaking = false,
  isPinned = false,
  handRaised = false,
  onTogglePin,
  onSpotlight
}) {
  const participant = trackReference?.participant;
  const identity = participant?.identity;
  const name = isLocal ? 'You' : (participant?.name || 'Student');

  return (
    <div 
      className={`google-meet-tile relative w-full h-full bg-[#202124] rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ${
        isSpeaking 
          ? 'border-2 border-[#8ab4f8] shadow-[0_0_25px_rgba(138,180,248,0.4)] scale-[1.01]' 
          : 'border border-white/10 shadow-lg hover:border-white/20'
      }`}
    >
      {/* LiveKit Video Renderer */}
      {trackReference ? (
        <ParticipantTile trackRef={trackReference} />
      ) : (
        /* Camera Off Google Meet Avatar Fallback */
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl border-2 shadow-xl ${
            isTeacher ? 'bg-[#fbbc04] text-black border-[#fbbc04]/50' : 'bg-primary border-primary/50'
          }`}>
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <p className="mt-3 text-xs sm:text-sm font-semibold text-white truncate max-w-[150px]">{name}</p>
        </div>
      )}

      {/* Floating Top Badges */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-1.5">
          {isTeacher && (
            <span className="bg-[#fbbc04] text-black text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">stars</span> Host Teacher
            </span>
          )}
          {isLocal && !isTeacher && (
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
              You
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {handRaised && (
            <span className="bg-[#fbbc04] text-black text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1 shadow-lg animate-bounce">
              🖐️ Hand Raised
            </span>
          )}
          
          <button 
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
              isPinned ? 'bg-[#8ab4f8] text-black' : 'bg-black/50 text-white hover:bg-black/70'
            }`}
            title={isPinned ? 'Unpin Video' : 'Pin Video to Stage'}
          >
            <span className="material-symbols-outlined text-sm">{isPinned ? 'push_pin' : 'keep'}</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Name & Audio Meter Badge */}
      <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-medium flex items-center gap-2 z-20 border border-white/10 shadow-md max-w-[85%]">
        <div className="flex items-center gap-1">
          {isSpeaking ? (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-green-400 animate-[ping_0.6s_ease-in-out_infinite] h-full"></span>
              <span className="w-0.5 bg-green-400 animate-[ping_0.8s_ease-in-out_infinite] h-2"></span>
              <span className="w-0.5 bg-green-400 animate-[ping_0.4s_ease-in-out_infinite] h-3"></span>
            </div>
          ) : (
            <span className="material-symbols-outlined text-sm text-green-400">mic</span>
          )}
        </div>
        
        <span className="truncate font-semibold">{name}</span>
        
        <span className="text-[10px] text-gray-400 bg-white/10 px-1.5 py-0.5 rounded font-mono ml-auto">
          5G HD
        </span>
      </div>

    </div>
  );
}
