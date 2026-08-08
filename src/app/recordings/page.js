'use client';

import React, { useState, useEffect } from 'react';

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchRecordings() {
      try {
        const res = await fetch('/api/recordings');
        const data = await res.json();
        setRecordings(data.recordings || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchRecordings();
  }, []);

  const filteredRecordings = recordings.filter(r =>
    (r.title && r.title.toLowerCase().includes(search.toLowerCase())) ||
    (r.subject && r.subject.toLowerCase().includes(search.toLowerCase())) ||
    (r.instructorName && r.instructorName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/30">
            Recorded Video Archive
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Class Lecture Recordings</h1>
          <p className="text-xs text-slate-400">Replay past live classroom lectures, download lecture slide PDFs, and review class notes</p>
        </div>

        <input
          type="text"
          placeholder="Search by topic or instructor..."
          className="w-full sm:w-64 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2 col-span-full">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-300">Loading lecture recordings...</p>
          </div>
        ) : filteredRecordings.length > 0 ? (
          filteredRecordings.map((rec) => (
            <div
              key={rec.id}
              className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-500 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Stage */}
                <div 
                  onClick={() => setSelectedVideo(rec)}
                  className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
                >
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={rec.title} src={rec.thumbnailUrl} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">play_arrow</span>
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-slate-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                    {rec.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {rec.subject}
                  </span>
                  <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">{rec.title}</h3>
                  <p className="text-xs text-slate-400">Instructor: {rec.instructorName}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex justify-between items-center text-xs">
                <button
                  onClick={() => alert(`Downloading lecture notes for "${rec.title}"...`)}
                  className="text-indigo-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span className="material-symbols-outlined text-xs">description</span> Download Notes
                </button>
                <button
                  onClick={() => setSelectedVideo(rec)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  ▶ Watch Recording
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center space-y-2 col-span-full">
            <span className="material-symbols-outlined text-slate-600 text-5xl">videocam_off</span>
            <h3 className="text-base font-bold text-white">No class recordings available yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Recordings will appear here after your live classes.</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative text-white">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase">{selectedVideo.subject}</span>
                <h3 className="font-bold text-white text-sm truncate">{selectedVideo.title}</h3>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <video className="w-full aspect-video bg-black" controls autoPlay src={selectedVideo.videoUrl} />

            <div className="p-4 bg-slate-950 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-white">Instructor: {selectedVideo.instructorName}</p>
                <p className="text-slate-400 text-[11px]">Duration: {selectedVideo.duration}</p>
              </div>
              <button
                onClick={() => alert(`Downloading lecture notes for "${selectedVideo.title}"...`)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">download</span> Download Notes PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
