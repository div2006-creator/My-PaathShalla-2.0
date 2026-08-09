'use client';

import React, { useState } from 'react';
import { Track } from 'livekit-client';
import ParticipantCard from './ParticipantCard';

export default function VideoGrid({
  tracks = [],
  userRole = 'STUDENT',
  userId = '',
  isScreenSharing = false,
  handRaised = false,
  layoutMode = 'grid' // 'grid' | 'spotlight' | 'sidebar'
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pinnedTrackId, setPinnedTrackId] = useState(null);

  // Pagination for > 9 participants
  const pageSize = 9;
  const totalPages = Math.ceil(tracks.length / pageSize) || 1;
  const currentTracks = tracks.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Identify screen share track if active
  const screenShareTrack = tracks.find(
    (t) =>
      t.source === 'screen_share' ||
      t.source === Track.Source.ScreenShare ||
      t.publication?.source === 'screen_share' ||
      t.publication?.source === Track.Source.ScreenShare
  ) || (isScreenSharing ? tracks[0] : null);

  const cameraTracks = isScreenSharing
    ? tracks.filter((t) => t !== screenShareTrack)
    : currentTracks;

  // Toggle Pinned Track
  const handleTogglePin = (trackId) => {
    if (pinnedTrackId === trackId) {
      setPinnedTrackId(null);
    } else {
      setPinnedTrackId(trackId);
    }
  };

  // If a track is pinned, feature it on main stage
  const pinnedTrack = tracks.find(
    (t) => (t.participant?.sid + t.source) === pinnedTrackId
  );

  return (
    <div className="flex-1 bg-[#18181b] rounded-2xl overflow-hidden relative shadow-2xl p-2 sm:p-3 flex items-center justify-center border border-white/10 h-full w-full min-h-0">
      
      {/* SCREEN SHARE ACTIVE MODE (Google Meet Presentation View) */}
      {(isScreenSharing || screenShareTrack) ? (
        <div className="w-full h-full flex flex-col lg:flex-row gap-3 relative min-h-0">
          
          {/* Main 70% Screen Share Stage */}
          <div className="flex-1 lg:w-[72%] h-full bg-black rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl flex items-center justify-center">
            {screenShareTrack ? (
              <ParticipantCard 
                trackReference={screenShareTrack} 
                isTeacher={true} 
                isPinned={true} 
              />
            ) : (
              <div className="text-center p-6">
                <span className="material-symbols-outlined text-6xl text-[#8ab4f8] animate-pulse">present_to_all</span>
                <h3 className="text-white font-bold text-base mt-2">Presenting Screen to Class</h3>
                <p className="text-gray-400 text-xs mt-1">Your screen presentation is active for all students</p>
              </div>
            )}

            {/* Floating Picture-in-Picture (PiP) Teacher Camera */}
            <div className="absolute top-4 right-4 w-40 sm:w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-[#8ab4f8] z-30 pointer-events-auto bg-black">
              {tracks[0] && (
                <ParticipantCard 
                  trackReference={tracks[0]} 
                  isLocal={true} 
                  isTeacher={userRole === 'TEACHER'} 
                />
              )}
            </div>
          </div>

          {/* Collapsible Right Participant Strip */}
          <div className="lg:w-[28%] h-auto lg:h-full flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar shrink-0">
            {cameraTracks.map((trackRef) => {
              const trackId = trackRef.participant?.sid + trackRef.source;
              const isLocal = trackRef.participant?.identity === userId;
              
              return (
                <div key={trackId} className="w-48 lg:w-full aspect-video shrink-0">
                  <ParticipantCard 
                    trackReference={trackRef} 
                    isLocal={isLocal} 
                    isTeacher={trackRef.participant?.metadata?.includes('TEACHER')} 
                    isPinned={pinnedTrackId === trackId}
                    onTogglePin={() => handleTogglePin(trackId)}
                  />
                </div>
              );
            })}
          </div>

        </div>
      ) : pinnedTrack ? (
        /* PINNED VIDEO SPOTLIGHT MODE */
        <div className="w-full h-full flex flex-col lg:flex-row gap-3 relative min-h-0">
          <div className="flex-1 lg:w-[75%] h-full bg-black rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
            <ParticipantCard 
              trackReference={pinnedTrack} 
              isPinned={true} 
              onTogglePin={() => setPinnedTrackId(null)}
            />
          </div>
          <div className="lg:w-[25%] h-auto lg:h-full flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar shrink-0">
            {tracks.filter((t) => (t.participant?.sid + t.source) !== pinnedTrackId).map((trackRef) => {
              const trackId = trackRef.participant?.sid + trackRef.source;
              return (
                <div key={trackId} className="w-48 lg:w-full aspect-video shrink-0">
                  <ParticipantCard 
                    trackReference={trackRef} 
                    onTogglePin={() => handleTogglePin(trackId)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ADAPTIVE PARTICIPANT GRID MODE */
        <div className="w-full h-full flex flex-col justify-between relative">
          
          {tracks.length > 0 ? (
            <div className={`w-full h-full grid gap-3 ${
              tracks.length === 1 
                ? 'grid-cols-1 grid-rows-1' 
                : tracks.length === 2 
                  ? 'grid-cols-1 md:grid-cols-2 grid-rows-1 md:grid-rows-1' 
                  : tracks.length <= 4 
                    ? 'grid-cols-2 grid-rows-2' 
                    : 'grid-cols-2 md:grid-cols-3 grid-rows-2 md:grid-rows-3'
            }`}>
              {currentTracks.map((trackRef) => {
                const trackId = trackRef.participant?.sid + trackRef.source;
                const isLocal = trackRef.participant?.identity === userId;

                return (
                  <ParticipantCard 
                    key={trackId} 
                    trackReference={trackRef} 
                    isLocal={isLocal} 
                    isTeacher={trackRef.participant?.metadata?.includes('TEACHER') || userRole === 'TEACHER'} 
                    handRaised={handRaised && isLocal}
                    isPinned={pinnedTrackId === trackId}
                    onTogglePin={() => handleTogglePin(trackId)}
                  />
                );
              })}
            </div>
          ) : (
            /* EMPTY STAGE FALLBACK */
            <div className="text-white text-center p-6 flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary mb-3">
                <span className="material-symbols-outlined text-5xl">videocam_off</span>
              </div>
              <h3 className="font-bold text-base text-white">No active camera streams</h3>
              <p className="text-gray-400 text-xs mt-1">Turn on your camera to broadcast video to the classroom</p>
            </div>
          )}

          {/* PAGINATION CONTROLS FOR > 9 PARTICIPANTS */}
          {totalPages > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-3 text-xs z-30 shadow-2xl">
              <button 
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-1 text-gray-300 hover:text-white disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              <span className="font-semibold text-white">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-1 text-gray-300 hover:text-white disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
