'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/ClientLayout';

export default function RecordingsPage() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'History', 'Literature'];

  useEffect(() => {
    async function fetchRecordings() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('search', searchQuery);
        if (selectedSubject && selectedSubject !== 'All') queryParams.set('subject', selectedSubject);

        const res = await fetch(`/api/recordings?${queryParams.toString()}`);
        const data = await res.json();
        setRecordings(data.recordings || []);
      } catch (e) {
        console.error('Failed to fetch recordings', e);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(() => {
      fetchRecordings();
    }, 300); // Debounce search inputs

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSubject]);

  const handleDeleteRecording = async (e, id) => {
    e.stopPropagation();
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/recordings?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete recording:', err);
    }
  };

  return (
    <div className="px-container-margin mt-stack-md animate-fade-in-up">
      
      {/* Search and Filters */}
      <section className="mb-stack-lg">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all rounded-t-xl font-body-md text-on-surface focus:outline-none" 
            placeholder="Search lessons, teachers, or topics..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
          {subjects.map((subject) => {
            const isActive = subject === selectedSubject;
            return (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-full font-label-md text-label-md shrink-0 transition-colors ${
                  isActive 
                    ? 'bg-primary text-on-primary font-bold' 
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant/30'
                }`}
              >
                {subject === 'All' ? 'All Recordings' : subject}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid of Recordings */}
      <section className="space-y-stack-lg pb-8">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">Recent Sessions</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.length > 0 ? (
              recordings.map((video) => (
                <div 
                  key={video.id}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden paper-shadow group active:scale-[0.98] transition-transform duration-200 paper-layer"
                >
                  {/* Thumbnail & Play Overlay */}
                  <div 
                    onClick={() => setPlayingVideo(video)}
                    className="relative aspect-video w-full overflow-hidden cursor-pointer"
                  >
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={video.title} src={video.thumbnailUrl} />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-14 h-14 bg-secondary-container rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold backdrop-blur-md">
                      {video.duration}
                    </div>
                    <div className="absolute top-3 left-3 px-3 py-1 bg-secondary-fixed-dim text-on-secondary-fixed rounded-full text-label-md font-label-md shadow-sm font-bold">
                      {video.subject}
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-title-lg text-title-lg text-on-surface font-bold leading-tight">{video.title}</h3>
                      {user && user.role === 'TEACHER' && (
                        <button 
                          onClick={(e) => handleDeleteRecording(e, video.id)} 
                          title="Delete Recording"
                          className="p-1 text-error hover:bg-error-container/30 rounded transition-colors z-20"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant mb-4">
                      <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {video.instructorName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-label-md font-label-md truncate">{video.instructorName}</span>
                      <span className="w-1 h-1 bg-outline-variant rounded-full shrink-0"></span>
                      <span className="text-label-md font-label-md shrink-0">
                        {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="dotted-line mb-3"></div>
                    <div className="flex items-center gap-4 text-outline text-[12px] font-bold">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        <span>{video.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Available Offline</span>
                      </div>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center py-12 text-on-surface-variant text-body-md">
                No recordings found matching your query.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Pop-up Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative paper-layer">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
              <h3 className="font-title-lg text-primary font-bold truncate">{playingVideo.title}</h3>
              <button onClick={() => setPlayingVideo(null)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>
            <video className="w-full aspect-video" controls autoPlay src={playingVideo.videoUrl} />
            <div className="p-4 bg-surface-container-low text-body-md text-on-surface">
              <p className="font-bold">{playingVideo.instructorName}</p>
              <p className="text-on-surface-variant text-[12px]">{playingVideo.subject} • Duration: {playingVideo.duration}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
