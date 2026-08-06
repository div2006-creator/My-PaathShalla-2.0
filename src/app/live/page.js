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
    <div className="bg-[#121212] text-white overflow-hidden h-screen flex flex-col relative z-10 animate-fade-in-up">
      {/* Google Meet Dark Top Header */}
      <header className="w-full bg-[#1e1e1e] flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={handleLeaveClass} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors" title="Leave Class">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <h1 className="text-sm sm:text-base text-white font-bold truncate max-w-[180px] sm:max-w-md">
              Live Gurukul Class Session
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30 shrink-0 font-bold text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span>REC {formatTime(recordingSeconds)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/10 text-white px-3 py-1 rounded-full text-xs font-semibold">
            <span className="material-symbols-outlined text-sm text-green-400">group</span>
            <span>{tracks.length || 1} Connected</span>
          </div>
        </div>
      </header>

      {/* Main Google Meet UI */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden p-3 sm:p-4 gap-4 min-h-0">
        
        {/* Video Stage Container */}
        <div className="flex-grow flex flex-col gap-3 relative min-w-0 h-full">
          
          {/* Google Meet Stage Grid */}
          <div className="flex-1 bg-[#18181b] rounded-2xl overflow-hidden relative shadow-2xl p-2 sm:p-3 flex items-center justify-center border border-white/10">
            {tracks.length > 0 ? (
              <div className={`w-full h-full grid gap-3 ${
                tracks.length === 1 
                  ? 'grid-cols-1 grid-rows-1' 
                  : tracks.length === 2 
                    ? 'grid-cols-1 md:grid-cols-2 grid-rows-1 md:grid-rows-1' 
                    : 'grid-cols-2 grid-rows-2'
              }`}>
                {tracks.map((trackReference) => {
                  const isMe = trackReference.participant?.identity === user.id;
                  const nameLabel = isMe ? 'You' : (trackReference.participant?.name || 'Participant');
                  
                  return (
                    <div 
                      key={trackReference.participant.sid + trackReference.source} 
                      className="google-meet-tile relative w-full h-full bg-[#202124] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-lg"
                    >
                      <ParticipantTile trackRef={trackReference} />
                      
                      {/* Google Meet Participant Name Tag */}
                      <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-2 z-20 border border-white/10 shadow-md">
                        <span className="material-symbols-outlined text-sm text-green-400">mic</span>
                        <span>{nameLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-white text-center p-6 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-5xl">videocam_off</span>
                </div>
                <h3 className="font-bold text-base text-white">No active camera streams</h3>
                <p className="text-gray-400 text-xs mt-1">Turn on your camera to start broadcasting video</p>
              </div>
            )}
          </div>

          {/* Floating Google Meet Controls Bar */}
          <div className="h-16 bg-[#202124] rounded-2xl flex items-center justify-between px-4 sm:px-6 shadow-2xl border border-white/10 shrink-0 gap-3 overflow-x-auto no-scrollbar">
            
            {/* Left Controls: Audio / Video */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isMicrophoneEnabled 
                    ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' 
                    : 'bg-[#ea4335] text-white shadow-lg'
                }`}
                title={isMicrophoneEnabled ? 'Turn Off Microphone' : 'Turn On Microphone'}
              >
                <span className="material-symbols-outlined text-xl">{isMicrophoneEnabled ? 'mic' : 'mic_off'}</span>
              </button>
              
              <button 
                onClick={() => localParticipant?.setCameraEnabled(!isCameraEnabled)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isCameraEnabled 
                    ? 'bg-[#3c4043] hover:bg-[#4a4e52] text-white' 
                    : 'bg-[#ea4335] text-white shadow-lg'
                }`}
                title={isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                <span className="material-symbols-outlined text-xl">{isCameraEnabled ? 'videocam' : 'videocam_off'}</span>
              </button>
            </div>
            
            {/* Center Controls: Raise Hand / Record / Chat */}
            <div className="flex items-center gap-3 shrink-0">
              {user.role === 'TEACHER' && (
                <button 
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-[#ea4335] text-white animate-pulse shadow-lg' 
                      : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                  }`}
                  title={isRecording ? 'Stop Class Recording' : 'Start Class Recording'}
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isRecording ? "'FILL' 1" : "'FILL' 0" }}>
                    {isRecording ? 'stop_circle' : 'radio_button_checked'}
                  </span>
                </button>
              )}

              <button 
                onClick={() => setHandRaised(!handRaised)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  handRaised 
                    ? 'bg-[#fbbc04] text-black font-bold shadow-lg' 
                    : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                }`}
                title={handRaised ? 'Lower Hand' : 'Raise Hand'}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
              </button>

              <button 
                onClick={() => setChatOpen(!chatOpen)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  chatOpen 
                    ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                    : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                }`}
                title="Class In-Call Messages"
              >
                <span className="material-symbols-outlined text-xl">chat</span>
              </button>
            </div>

            {/* Right Control: End Call */}
            <div className="flex items-center shrink-0">
              <button 
                onClick={handleLeaveClass}
                className="px-5 py-2.5 bg-[#ea4335] text-white rounded-full font-bold text-xs sm:text-sm hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                title="Leave Meeting"
              >
                <span className="material-symbols-outlined text-lg">call_end</span>
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>

          </div>

        </div>

        {/* Google Meet Right-side Chat Panel */}
        {chatOpen && (
          <aside className="w-full lg:w-80 fixed inset-x-0 bottom-0 top-14 z-50 lg:relative lg:top-0 lg:z-auto bg-[#202124] border border-white/10 rounded-t-3xl lg:rounded-2xl flex flex-col shadow-2xl overflow-hidden shrink-0 h-[75vh] lg:h-full">
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#28292c]">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#8ab4f8]">chat</span>
                <span>In-Call Messages</span>
              </h3>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-[#1e1e1e]">
              {chats.map((chat) => {
                const isMe = chat.senderId === user.id;
                const isTeacher = chat.senderRole === 'TEACHER';

                return (
                  <div key={chat.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
                      isTeacher ? 'bg-[#fbbc04] text-black' : isMe ? 'bg-[#8ab4f8] text-black' : 'bg-[#3c4043]'
                    }`}>
                      {chat.senderName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`flex flex-col gap-0.5 max-w-[80%] ${isMe ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-semibold text-[11px] ${isTeacher ? 'text-[#fbbc04]' : isMe ? 'text-[#8ab4f8]' : 'text-gray-300'}`}>
                          {chat.senderName}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`p-2.5 rounded-2xl text-xs text-white ${
                        isMe 
                          ? 'bg-[#8ab4f8]/20 border border-[#8ab4f8]/30 text-white' 
                          : isTeacher 
                            ? 'bg-[#fbbc04]/10 border border-[#fbbc04]/30 text-white' 
                            : 'bg-[#3c4043] border border-white/10'
                      }`}>
                        {chat.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-[#28292c] border-t border-white/10 shrink-0">
              <form onSubmit={handleSendChat} className="relative flex items-center">
                <input 
                  className="w-full bg-[#3c4043] border border-white/10 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-[#8ab4f8] text-xs text-white placeholder-gray-400" 
                  placeholder="Send a message to everyone..." 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="absolute right-2 w-7 h-7 bg-[#8ab4f8] rounded-full flex items-center justify-center text-black hover:opacity-90 active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-[15px] text-black">send</span>
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
