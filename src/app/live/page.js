'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';
import { LiveKitRoom, useTracks, ParticipantTile, useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

// Main Page Component
export default function LiveClassPage() {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('paathshalla-class');
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch(`/api/live/token?room=${roomName}`);
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          // Automatically log attendance if student
          if (user && user.role === 'STUDENT') {
            fetch('/api/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                className: 'Live Class Session',
                classId: roomName,
              }),
            }).catch((err) => console.error('Auto attendance failed:', err));
          }
        } else {
          setError(data.error || 'Failed to generate token');
        }
      } catch (err) {
        setError('Error generating room access token');
      } finally {
        setConnecting(false);
      }
    }
    if (user) {
      getToken();
    }
  }, [user, roomName]);

  if (!user) return null;

  if (connecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-title-lg text-primary">Connecting to Live Room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4 text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-4">error</span>
        <h2 className="font-headline-md text-primary font-bold">Failed to Join Class</h2>
        <p className="text-on-surface-variant text-body-md mt-2 max-w-md">{error}</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://my-paathshalla-2mk1y57r.livekit.cloud';

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={true}
      audio={true}
      data-lk-theme="default"
    >
      <PaathShallaLiveClass user={user} />
    </LiveKitRoom>
  );
}

// Custom Conference UI Component
function PaathShallaLiveClass({ user }) {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const chatEndRef = useRef(null);

  // LiveKit hooks
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  
  // Recording states (Teacher)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('Mathematics Live Class - Calculus & Limits');
  const [recordingSubject, setRecordingSubject] = useState('Mathematics');
  const [savingRecording, setSavingRecording] = useState(false);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartRecording = () => {
    setRecordingSeconds(0);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setSaveModalOpen(true);
  };

  const handleSaveRecording = async (e) => {
    e.preventDefault();
    setSavingRecording(true);
    try {
      const res = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recordingTitle,
          subject: recordingSubject,
          instructorName: user.name,
          duration: formatTime(recordingSeconds) || '15:00',
        }),
      });

      if (res.ok) {
        alert('Recording published successfully to Class Recordings Library!');
        setSaveModalOpen(false);
      } else {
        alert('Failed to save recording');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRecording(false);
    }
  };

  // Fetch tracks for video layout (renders all camera participants)
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  // Database Chat sync
  const fetchChats = async () => {
    try {
      const res = await fetch('/api/live-chat');
      const data = await res.json();
      setChats(data.chats || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, chatOpen]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    try {
      const res = await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) fetchChats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveClass = () => {
    router.push('/dashboard');
  };

  return (
    <div className="bg-background text-on-background overflow-hidden h-screen flex flex-col relative z-10 animate-fade-in-up">
      {/* Header */}
      <header className="w-full bg-background flex items-center justify-between px-container-margin py-stack-sm h-16 border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={handleLeaveClass} className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity">
            arrow_back
          </button>
          <h1 className="font-headline-md-mobile text-[16px] md:text-[20px] text-primary font-bold truncate max-w-[200px] md:max-w-md">
            Active Classroom Session
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-600/10 text-red-600 px-3 py-1 rounded-full border border-red-600/20 shrink-0 font-bold">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
              <span className="font-label-md text-[11px] uppercase tracking-wider">REC {formatTime(recordingSeconds)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-error-container text-on-error-container px-3 py-1 rounded-full border border-error/20 shrink-0">
            <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
            <span className="font-label-md text-[10px] md:text-label-md uppercase tracking-wider font-bold">Live Room Connected</span>
          </div>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden p-2 sm:p-4 md:p-6 gap-4 md:gap-6 min-h-0">
        
        {/* Video Stage */}
        <div className="flex-grow flex flex-col gap-3 sm:gap-6 relative min-w-0 h-full">
          
          {/* LiveKit grid container */}
          <div className="flex-1 bg-inverse-surface rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-lg p-2 sm:p-4 flex flex-wrap justify-center items-center gap-3 sm:gap-4 bg-[radial-gradient(#2d3133_1px,transparent_1px)] [background-size:16px_16px]">
            {tracks.length > 0 ? (
              tracks.map((trackReference) => (
                <div key={trackReference.participant.sid + trackReference.source} className="w-full max-w-full sm:max-w-md md:max-w-lg aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-outline/20 relative shadow">
                  <ParticipantTile trackRef={trackReference} />
                </div>
              ))
            ) : (
              <div className="text-white text-center p-4">
                <span className="material-symbols-outlined text-5xl sm:text-6xl animate-pulse text-outline mb-2">videocam_off</span>
                <p className="font-bold text-sm sm:text-base">No active video streams yet</p>
                <p className="text-outline text-xs sm:text-label-md mt-1">Camera feeds will appear here centered in 16:9 HD framing</p>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="h-16 sm:h-20 bg-surface-container-lowest rounded-xl sm:rounded-2xl flex items-center justify-between px-3 sm:px-6 shadow-sm border border-outline-variant/10 shrink-0 gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button 
                onClick={() => localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMicrophoneEnabled ? 'bg-surface-container-high hover:bg-outline-variant' : 'bg-error text-white'
                }`}
                title={isMicrophoneEnabled ? 'Mute Mic' : 'Unmute Mic'}
              >
                <span className="material-symbols-outlined text-lg sm:text-2xl">{isMicrophoneEnabled ? 'mic' : 'mic_off'}</span>
              </button>
              <button 
                onClick={() => localParticipant?.setCameraEnabled(!isCameraEnabled)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                  isCameraEnabled ? 'bg-surface-container-high hover:bg-outline-variant' : 'bg-error text-white'
                }`}
                title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                <span className="material-symbols-outlined text-lg sm:text-2xl">{isCameraEnabled ? 'videocam' : 'videocam_off'}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Teacher Recording Button */}
              {user.role === 'TEACHER' && (
                <button 
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`px-3 sm:px-4 h-10 sm:h-12 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm transition-all ${
                    isRecording 
                      ? 'bg-red-600 text-white animate-pulse shadow-lg' 
                      : 'bg-surface-container-high text-primary hover:bg-outline-variant'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Start Class Recording'}
                >
                  <span className="material-symbols-outlined text-base sm:text-xl" style={{ fontVariationSettings: isRecording ? "'FILL' 1" : "'FILL' 0" }}>
                    {isRecording ? 'stop_circle' : 'radio_button_checked'}
                  </span>
                  <span className="hidden sm:inline">{isRecording ? 'Stop Rec' : 'Record Class'}</span>
                </button>
              )}

              <button 
                onClick={() => setHandRaised(!handRaised)}
                className={`px-3 sm:px-5 h-10 sm:h-12 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm transition-all ${
                  handRaised 
                    ? 'bg-secondary text-white border border-secondary' 
                    : 'bg-secondary-container text-on-secondary-container shadow shadow-black/10 hover:opacity-90 active:scale-95'
                }`}
              >
                <span className="material-symbols-outlined text-base sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
                <span className="hidden sm:inline">{handRaised ? 'Lower Hand' : 'Raise Hand'}</span>
              </button>
              <button 
                onClick={() => setChatOpen(!chatOpen)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                  chatOpen ? 'bg-primary text-white' : 'bg-surface-container-high hover:bg-outline-variant'
                }`}
                title="Toggle Class Chat"
              >
                <span className="material-symbols-outlined text-lg sm:text-2xl">forum</span>
              </button>
            </div>

            <div className="flex items-center shrink-0">
              <button 
                onClick={handleLeaveClass}
                className="px-4 sm:px-6 h-10 sm:h-12 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 bg-error text-on-error font-bold text-xs sm:text-sm hover:bg-on-error-container transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-base sm:text-xl">call_end</span>
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic Chat Sidebar / Mobile Bottom Sheet */}
        {chatOpen && (
          <aside className="w-full lg:w-80 fixed inset-x-0 bottom-0 top-16 z-50 lg:relative lg:top-0 lg:z-auto bg-surface-container-lowest border border-outline-variant rounded-t-3xl lg:rounded-3xl flex flex-col shadow-2xl overflow-hidden shrink-0 h-[75vh] lg:h-full paper-layer">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between shrink-0">
              <h3 className="font-title-lg text-primary font-bold">Class Chat</h3>
              <button onClick={() => setChatOpen(false)} className="material-symbols-outlined text-outline hover:text-primary transition-colors">
                close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
              {chats.map((chat) => {
                const isMe = chat.senderId === user.id;
                const isTeacher = chat.senderRole === 'TEACHER';

                return (
                  <div key={chat.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
                      isTeacher ? 'bg-primary-container' : isMe ? 'bg-secondary' : 'bg-surface-tint'
                    }`}>
                      {chat.senderName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMe ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-label-md font-bold text-[11px] ${isTeacher ? 'text-primary' : 'text-on-surface'}`}>
                          {chat.senderName}
                        </span>
                        <span className="text-[9px] text-outline">
                          {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`p-3 rounded-xl text-body-md border ${
                        isTeacher 
                          ? 'bg-primary/5 border-primary/10 border-l-4 border-l-primary' 
                          : isMe 
                            ? 'bg-secondary-container/20 border-secondary-container/30' 
                            : 'bg-surface-container-low border-outline-variant/30'
                      }`}>
                        {chat.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 shrink-0">
              <form onSubmit={handleSendChat} className="relative flex items-center">
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-primary focus:ring-0 text-body-md" 
                  placeholder="Type a message..." 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="absolute right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:opacity-90 active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-[16px] text-white">send</span>
                </button>
              </form>
            </div>
          </aside>
        )}
      </main>

      {/* Save & Publish Live Recording Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative paper-layer">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
              <h3 className="font-title-lg text-primary font-bold">Publish Class Recording</h3>
              <button onClick={() => setSaveModalOpen(false)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>
            <form onSubmit={handleSaveRecording} className="p-6 space-y-4">
              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-1">Subject</label>
                <select 
                  className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                  value={recordingSubject}
                  onChange={(e) => setRecordingSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>History</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-1">Recording Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Calculus Live Session"
                  className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                />
              </div>
              <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex justify-between items-center">
                <span className="text-body-md font-bold text-primary">Recorded Duration</span>
                <span className="font-mono text-title-md font-bold text-secondary">{formatTime(recordingSeconds)}</span>
              </div>
              <button 
                type="submit"
                disabled={savingRecording}
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                {savingRecording ? 'Publishing...' : 'Publish to Class Library'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
