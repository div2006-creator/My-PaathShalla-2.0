'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/ClientLayout';

export default function RecordingsPage() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef(null);

  const fetchRecordings = async () => {
    try {
      const res = await fetch('/api/recordings');
      const data = await res.json();
      setRecordings(data.recordings || []);
    } catch (e) {
      console.error(e);
      setRecordings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const handleDeleteRecording = async (id, title) => {
    if (!confirm(`Delete this recording "${title}"? This will permanently remove it from memory and cloud storage.`)) return;
    try {
      const res = await fetch(`/api/recordings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecordings(recordings.filter((r) => r.id !== id));
        if (selectedVideo?.id === id) {
          setSelectedVideo(null);
        }
      } else {
        alert('Failed to delete recording');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const subjects = ['All', ...Array.from(new Set(recordings.map((r) => r.subject).filter(Boolean)))];

  const filteredRecordings = recordings.filter((r) => {
    const matchesSubject = selectedSubject === 'All' || r.subject === selectedSubject;
    const matchesSearch =
      (r.title && r.title.toLowerCase().includes(search.toLowerCase())) ||
      (r.subject && r.subject.toLowerCase().includes(search.toLowerCase())) ||
      (r.instructorName && r.instructorName.toLowerCase().includes(search.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const isTeacher = user?.role === 'TEACHER';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/30">
            Recorded Video Archive
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Class Lecture Recordings</h1>
          <p className="text-xs text-slate-400">Replay past live classroom lectures, download lecture slide PDFs, and review class notes</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Subject Filter Switcher */}
          <select
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub === 'All' ? 'All Subjects' : sub}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search by topic or instructor..."
            className="w-full sm:w-64 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2 col-span-full">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-300">Loading lecture recordings...</p>
          </div>
        ) : filteredRecordings.length > 0 ? (
          filteredRecordings.map((rec) => {
            const isReady = rec.status === 'READY' || !rec.status;
            const isProcessing = rec.status === 'PROCESSING' || rec.status === 'STARTING' || rec.status === 'RECORDING';
            const isFailed = rec.status === 'FAILED';

            return (
              <div
                key={rec.id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-500 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Stage */}
                  <div 
                    onClick={() => isReady && setSelectedVideo(rec)}
                    className={`relative aspect-video bg-slate-950 overflow-hidden ${isReady ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" 
                      alt={rec.title} 
                      src={rec.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'} 
                    />
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      {isReady && (
                        <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-3xl">play_arrow</span>
                        </div>
                      )}
                      {isProcessing && (
                        <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                          <span>Processing recording...</span>
                        </div>
                      )}
                      {isFailed && (
                        <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">error</span>
                          <span>Recording failed</span>
                        </div>
                      )}
                    </div>

                    <span className="absolute bottom-2 right-2 bg-slate-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                      {rec.duration || '00:00'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {rec.subject}
                      </span>
                      {rec.createdAt && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(rec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">{rec.title}</h3>
                    <p className="text-xs text-slate-400">Instructor: {rec.instructorName}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex justify-between items-center text-xs">
                  {isTeacher && (
                    <button
                      onClick={() => handleDeleteRecording(rec.id, rec.title)}
                      className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-slate-700 transition-colors"
                      title="Delete Recording"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {isReady ? (
                      <button
                        onClick={() => setSelectedVideo(rec)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                      >
                        ▶ Watch Recording
                      </button>
                    ) : isProcessing ? (
                      <span className="text-xs font-bold text-amber-400 px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        Processing...
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-400 px-3 py-1.5 bg-red-500/10 rounded-xl border border-red-500/20">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center space-y-3 col-span-full">
            <span className="material-symbols-outlined text-slate-600 text-5xl">videocam_off</span>
            <h3 className="text-base font-bold text-white">No recordings yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Recordings will appear here after your live classes.
            </p>
          </div>
        )}
      </div>

      {/* Professional Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative text-white flex flex-col max-h-[90vh]">
            
            {/* Player Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase">{selectedVideo.subject}</span>
                <h3 className="font-bold text-white text-sm truncate max-w-md">{selectedVideo.title}</h3>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Video Stage */}
            <div className="relative aspect-video bg-black flex-1 overflow-hidden">
              <video 
                ref={videoRef}
                className="w-full h-full object-contain" 
                controls 
                autoPlay 
                src={selectedVideo.videoUrl || ''} 
              />
            </div>

            {/* Controls Bar & Speed Selector */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-3 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">Instructor: {selectedVideo.instructorName}</p>
                  <p className="text-slate-400 text-[11px]">Duration: {selectedVideo.duration || 'N/A'}</p>
                </div>

                {/* Playback Speed Controls */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 px-2">Speed:</span>
                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                        playbackSpeed === spd
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Handout PDF Downloads */}
              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-indigo-400">folder_open</span>
                  Class Resources & Slide Handouts
                </span>
                <button
                  onClick={() => alert(`Downloading lecture slides for "${selectedVideo.title}"...`)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span> Download PDF Notes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
