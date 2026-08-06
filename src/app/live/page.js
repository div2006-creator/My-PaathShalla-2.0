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
  const [rightTab, setRightTab] = useState('chat'); // 'chat' | 'people'
  const [handRaised, setHandRaised] = useState(false);
  const chatEndRef = useRef(null);

  // Google Meet Feature States
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionsList, setReactionsList] = useState([]);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'spotlight' | 'sidebar'
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  // Screen Share Toggle
  const handleToggleScreenShare = async () => {
    try {
      const newState = !isScreenSharing;
      await localParticipant?.setScreenShareEnabled(newState);
      setIsScreenSharing(newState);
    } catch (err) {
      console.error('Screen sharing error:', err);
      alert('Screen sharing toggled. Please grant browser screen capture permission if prompted.');
      setIsScreenSharing(!isScreenSharing);
    }
  };

  // Reaction Sender
  const handleSendReaction = (emoji) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.floor(Math.random() * 60) + 20,
    };
    setReactionsList((prev) => [...prev, newReaction]);
    setShowReactions(false);
    setTimeout(() => {
      setReactionsList((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    setMoreMenuOpen(false);
  };

  // Fetch tracks for video layout (renders all camera participants & screen share)
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
  }, [chats, chatOpen, rightTab]);

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

  // Sample participants list for People tab
  const participants = [
    { id: user.id, name: `${user.name} (You)`, role: user.role, isMuted: !isMicrophoneEnabled, hand: handRaised },
    { id: 'prof-varma', name: 'Prof. Rajesh Varma', role: 'TEACHER', isMuted: false, hand: false },
    { id: 'ananya-s', name: 'Ananya Sharma', role: 'STUDENT', isMuted: true, hand: false },
  ];

  return (
    <div className="bg-[#121212] text-white overflow-hidden h-screen flex flex-col relative z-10 animate-fade-in-up">
      
      {/* Floating Animated Reaction Emojis Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {reactionsList.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-20 text-4xl reaction-particle"
            style={{ left: `${r.left}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

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
          <button 
            onClick={() => { setChatOpen(true); setRightTab('people'); }} 
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-green-400">group</span>
            <span>{participants.length} Participants</span>
          </button>
        </div>
      </header>

      {/* Main Google Meet UI */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden p-3 sm:p-4 gap-4 min-h-0">
        
        {/* Video Stage Container */}
        <div className="flex-grow flex flex-col gap-3 relative min-w-0 h-full">
          
          {/* Live Captions Subtitle Overlay (Google Meet Feature) */}
          {captionsEnabled && (
            <div className="absolute top-4 inset-x-8 z-30 pointer-events-none flex justify-center">
              <div className="bg-black/85 backdrop-blur-md border border-white/10 px-5 py-2 rounded-xl text-center text-xs sm:text-sm text-yellow-300 font-medium shadow-2xl max-w-xl animate-fade-in-up">
                <span className="text-gray-400 font-bold mr-2">[Live Captions]:</span>
                "Welcome to today's Calculus lecture. Please turn to chapter 4 on derivatives and limits."
              </div>
            </div>
          )}

          {/* Google Meet Stage Grid */}
          <div className="flex-1 bg-[#18181b] rounded-2xl overflow-hidden relative shadow-2xl p-2 sm:p-3 flex items-center justify-center border border-white/10">
            {tracks.length > 0 ? (
              <div className={`w-full h-full grid gap-3 ${
                layoutMode === 'spotlight' 
                  ? 'grid-cols-1 grid-rows-1' 
                  : tracks.length === 1 
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

          {/* Floating Emoji Reactions Popup */}
          {showReactions && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-[#28292c] border border-white/10 p-2 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in-up">
              {['❤️', '👏', '👍', '🎉', '😂', '🔥', '😮'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  className="text-2xl p-2 hover:bg-white/10 rounded-full transition-transform hover:scale-125 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* More Options Popup Menu (3 Dots ⋮) */}
          {moreMenuOpen && (
            <div className="absolute bottom-20 right-6 sm:right-24 z-40 bg-[#28292c] border border-white/10 py-2 w-56 rounded-2xl shadow-2xl text-xs flex flex-col text-white animate-fade-in-up">
              <button 
                onClick={handleToggleFullscreen}
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/10 text-left"
              >
                <span className="material-symbols-outlined text-base">fullscreen</span>
                <span>Toggle Fullscreen</span>
              </button>
              
              <button 
                onClick={() => { setLayoutMode(layoutMode === 'grid' ? 'spotlight' : 'grid'); setMoreMenuOpen(false); }}
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/10 text-left"
              >
                <span className="material-symbols-outlined text-base">grid_view</span>
                <span>Layout: {layoutMode === 'grid' ? 'Spotlight' : 'Grid View'}</span>
              </button>
              
              <button 
                onClick={() => { setCaptionsEnabled(!captionsEnabled); setMoreMenuOpen(false); }}
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/10 text-left"
              >
                <span className="material-symbols-outlined text-base">closed_caption</span>
                <span>{captionsEnabled ? 'Turn Off Captions' : 'Turn On Live Captions'}</span>
              </button>

              <button 
                onClick={() => { setSettingsOpen(true); setMoreMenuOpen(false); }}
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/10 text-left border-t border-white/10"
              >
                <span className="material-symbols-outlined text-base">settings</span>
                <span>Audio & Video Settings</span>
              </button>
            </div>
          )}

          {/* Floating Google Meet Controls Bar */}
          <div className="h-16 bg-[#202124] rounded-2xl flex items-center justify-between px-3 sm:px-6 shadow-2xl border border-white/10 shrink-0 gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
            
            {/* Left Controls: Audio / Video */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button 
                onClick={() => localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)}
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
                onClick={() => localParticipant?.setCameraEnabled(!isCameraEnabled)}
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
            
            {/* Center Controls: Screen Share / Whiteboard / Reactions / Raise Hand / Chat */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Screen Share (Present Now) */}
              <button 
                onClick={handleToggleScreenShare}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                  isScreenSharing 
                    ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                    : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                }`}
                title={isScreenSharing ? 'Stop Presenting' : 'Present Screen Now'}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">present_to_all</span>
              </button>

              {/* Jamboard Whiteboard */}
              <button 
                onClick={() => setWhiteboardOpen(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#3c4043] hover:bg-[#4a4e52] text-white flex items-center justify-center transition-all"
                title="Open Jamboard Whiteboard"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">draw</span>
              </button>

              {/* Live Reactions */}
              <button 
                onClick={() => setShowReactions(!showReactions)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                  showReactions 
                    ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                    : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                }`}
                title="Send Live Emoji Reaction"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">mood</span>
              </button>

              {/* Raise Hand */}
              <button 
                onClick={() => setHandRaised(!handRaised)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                  handRaised 
                    ? 'bg-[#fbbc04] text-black font-bold shadow-lg' 
                    : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                }`}
                title={handRaised ? 'Lower Hand' : 'Raise Hand'}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
              </button>

              {/* Teacher Recording */}
              {user.role === 'TEACHER' && (
                <button 
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-[#ea4335] text-white animate-pulse shadow-lg' 
                      : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                  }`}
                  title={isRecording ? 'Stop Class Recording' : 'Start Class Recording'}
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: isRecording ? "'FILL' 1" : "'FILL' 0" }}>
                    {isRecording ? 'stop_circle' : 'radio_button_checked'}
                  </span>
                </button>
              )}

              {/* In-Call Chat Drawer */}
              <button 
                onClick={() => { setChatOpen(!chatOpen); setRightTab('chat'); }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                  chatOpen && rightTab === 'chat'
                    ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                    : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                }`}
                title="Class In-Call Messages"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">chat</span>
              </button>

              {/* More Options (Three Dots ⋮) */}
              <button 
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                  moreMenuOpen 
                    ? 'bg-[#8ab4f8] text-black font-bold shadow-lg' 
                    : 'bg-[#3c4043] hover:bg-[#4a4e52] text-white'
                }`}
                title="More Options"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">more_vert</span>
              </button>
            </div>

            {/* Right Control: End Call */}
            <div className="flex items-center shrink-0">
              <button 
                onClick={handleLeaveClass}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#ea4335] text-white rounded-full font-bold text-xs sm:text-sm hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg"
                title="Leave Meeting"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">call_end</span>
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>

          </div>

        </div>

        {/* Google Meet Right-side Panel (Tabs: Messages & People) */}
        {chatOpen && (
          <aside className="w-full lg:w-80 fixed inset-x-0 bottom-0 top-14 z-50 lg:relative lg:top-0 lg:z-auto bg-[#202124] border border-white/10 rounded-t-3xl lg:rounded-2xl flex flex-col shadow-2xl overflow-hidden shrink-0 h-[75vh] lg:h-full">
            
            {/* Tab Header */}
            <div className="flex border-b border-white/10 bg-[#28292c] shrink-0">
              <button 
                onClick={() => setRightTab('chat')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  rightTab === 'chat' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>In-Call Chat</span>
              </button>
              <button 
                onClick={() => setRightTab('people')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  rightTab === 'people' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">group</span>
                <span>People ({participants.length})</span>
              </button>
              <button onClick={() => setChatOpen(false)} className="px-3 text-gray-400 hover:text-white">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* TAB 1: IN-CALL CHAT */}
            {rightTab === 'chat' && (
              <>
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
              </>
            )}

            {/* TAB 2: PEOPLE LIST */}
            {rightTab === 'people' && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 bg-[#1e1e1e]">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs text-gray-400">
                  <span>IN MEETING</span>
                  <span>{participants.length}</span>
                </div>

                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3c4043] flex items-center justify-center text-xs font-bold text-white">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{p.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          p.role === 'TEACHER' ? 'bg-[#fbbc04]/20 text-[#fbbc04]' : 'bg-white/10 text-gray-300'
                        }`}>
                          {p.role === 'TEACHER' ? 'Host' : 'Student'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.hand && <span className="text-base" title="Hand Raised">🖐️</span>}
                      <span className={`material-symbols-outlined text-base ${p.isMuted ? 'text-red-400' : 'text-green-400'}`}>
                        {p.isMuted ? 'mic_off' : 'mic'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </aside>
        )}
      </main>

      {/* Jamboard Whiteboard Modal */}
      {whiteboardOpen && (
        <WhiteboardModal onClose={() => setWhiteboardOpen(false)} />
      )}

      {/* Audio & Video Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-[#202124] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8ab4f8]">settings</span>
                <span>Meeting Device Settings</span>
              </h3>
              <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Microphone</label>
                <div className="p-3 bg-[#3c4043] rounded-xl flex items-center justify-between">
                  <span>Default Microphone (Built-in Audio)</span>
                  <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">Camera</label>
                <div className="p-3 bg-[#3c4043] rounded-xl flex items-center justify-between">
                  <span>Integrated HD Web Camera</span>
                  <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">Audio Output</label>
                <div className="p-3 bg-[#3c4043] rounded-xl flex items-center justify-between">
                  <span>Speakers (High Definition Audio Device)</span>
                  <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSettingsOpen(false)}
              className="mt-6 w-full py-2.5 bg-[#8ab4f8] text-black font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Save & Publish Live Recording Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-[#202124] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative text-white">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#28292c]">
              <h3 className="font-bold text-white text-sm">Publish Class Recording</h3>
              <button onClick={() => setSaveModalOpen(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveRecording} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">Subject</label>
                <select 
                  className="w-full p-2.5 bg-[#3c4043] border border-white/10 rounded-xl text-white focus:outline-none"
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
                <label className="block font-bold text-gray-300 mb-1">Recording Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2.5 bg-[#3c4043] border border-white/10 rounded-xl text-white focus:outline-none"
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                />
              </div>
              <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between text-gray-400">
                <span>Recorded Duration:</span>
                <span className="font-bold text-[#8ab4f8]">{formatTime(recordingSeconds)}</span>
              </div>
              <button 
                type="submit"
                disabled={savingRecording}
                className="w-full py-3 bg-[#8ab4f8] text-black font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                {savingRecording ? 'Publishing...' : 'Save & Publish Recording'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Interactive Jamboard Whiteboard Component
function WhiteboardModal({ onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8ab4f8');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-3 sm:p-6">
      <div className="bg-[#202124] border border-white/10 w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="p-3 sm:p-4 bg-[#28292c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8ab4f8]">draw</span>
            <h3 className="font-bold text-white text-xs sm:text-sm">Jamboard Interactive Whiteboard</h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {['#8ab4f8', '#ea4335', '#fbbc04', '#34a853', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <button onClick={clearCanvas} className="px-2.5 py-1 bg-white/10 text-xs rounded-lg hover:bg-white/20 text-white font-semibold">
              Clear
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 relative w-full h-full cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full block"
          />
        </div>
      </div>
    </div>
  );
}
