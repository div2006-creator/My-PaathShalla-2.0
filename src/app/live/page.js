'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';
import { LiveKitRoom, RoomAudioRenderer, useTracks, useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';

// Modular Live Classroom Components
import ClassroomHeader from '@/components/live/ClassroomHeader';
import VideoGrid from '@/components/live/VideoGrid';
import SidebarPanel from '@/components/live/SidebarPanel';
import FloatingToolbar from '@/components/live/FloatingToolbar';
import WhiteboardModal from '@/components/live/WhiteboardModal';
import AIAssistantModal from '@/components/live/AIAssistantModal';
import DeviceSettingsModal from '@/components/live/DeviceSettingsModal';

// Main Page Component
export default function LiveClassPage() {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('paathshalla-class');
  const [classSubject, setClassSubject] = useState('Mathematics 101');
  const [classTopic, setClassTopic] = useState('Integral Calculus & Limits');
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      const urlSubject = params.get('subject');
      const urlTopic = params.get('topic');

      if (urlRoom) setRoomName(urlRoom);
      if (urlSubject) setClassSubject(urlSubject);
      if (urlTopic) setClassTopic(urlTopic);
    }
  }, []);

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch(`/api/live/token?room=${roomName}`);
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          if (user && user.role === 'STUDENT') {
            fetch('/api/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                className: classSubject + ' - ' + classTopic,
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
  }, [user, roomName, classSubject, classTopic]);

  if (!user) return null;

  if (connecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white">
        <div className="w-12 h-12 border-4 border-[#8ab4f8] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-sm sm:text-base text-[#8ab4f8]">Connecting to Premium Live Classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#121212] p-4 text-center text-white">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h2 className="text-xl font-bold text-white">Failed to Join Classroom</h2>
        <p className="text-gray-400 text-xs mt-2 max-w-md">{error}</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-6 py-2.5 bg-[#8ab4f8] text-black rounded-xl font-bold active:scale-95 transition-transform"
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
      <PaathShallaLiveClass user={user} classSubject={classSubject} classTopic={classTopic} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

// Custom Conference UI Component
function PaathShallaLiveClass({ user, classSubject = "Mathematics 101", classTopic = "Integral Calculus & Limits" }) {
  const router = useRouter();

  // Classroom Feature States
  const [chats, setChats] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [reactionsList, setReactionsList] = useState([]);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  // Recording States (Teacher)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('Mathematics Live Class - Calculus & Limits');
  const [recordingSubject, setRecordingSubject] = useState('Mathematics');
  const [savingRecording, setSavingRecording] = useState(false);

  // LiveKit hooks
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

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

  // Screen Share Handler
  const handleToggleScreenShare = async () => {
    try {
      const newState = !isScreenSharing;
      await localParticipant?.setScreenShareEnabled(newState);
      setIsScreenSharing(newState);
    } catch (err) {
      console.error('Screen share toggle:', err);
      setIsScreenSharing(!isScreenSharing);
    }
  };

  // Emoji Reaction Handler
  const handleSendReaction = (emoji) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.floor(Math.random() * 60) + 20,
    };
    setReactionsList((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactionsList((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);
  };

  // Fullscreen Handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    setMoreMenuOpen(false);
  };

  // LiveKit tracks
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  // Sync Live Chat
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
      
      {/* Floating Animated Reactions Particles */}
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

      {/* 1. GLASS STICKY HEADER */}
      <ClassroomHeader 
        courseTitle={classSubject}
        topicName={classTopic}
        isLive={true}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        participantCount={tracks.length > 0 ? tracks.length : 14}
        networkQuality="5G HD (60 FPS)"
        teacherName="Prof. Rajesh Varma"
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleFullscreen={handleToggleFullscreen}
        onLeaveClass={handleLeaveClass}
        userRole={user.role}
      />

      {/* 2. MAIN CLASSROOM AREA */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden p-3 sm:p-4 gap-4 min-h-0">
        
        {/* Stage Container */}
        <div className="flex-grow flex flex-col gap-3 relative min-w-0 h-full">
          
          {/* Live Captions Banner */}
          {captionsEnabled && (
            <div className="absolute top-4 inset-x-8 z-30 pointer-events-none flex justify-center">
              <div className="bg-black/85 backdrop-blur-md border border-white/10 px-5 py-2 rounded-xl text-center text-xs sm:text-sm text-yellow-300 font-medium shadow-2xl max-w-xl animate-fade-in-up">
                <span className="text-gray-400 font-bold mr-2">[Live AI Subtitles]:</span>
                "Welcome to today's Calculus lecture. Please turn to chapter 4 on derivatives and limits."
              </div>
            </div>
          )}

          {/* Video Grid Component */}
          <VideoGrid 
            tracks={tracks}
            userRole={user.role}
            userId={user.id}
            isScreenSharing={isScreenSharing}
            handRaised={handRaised}
            layoutMode={layoutMode}
          />

          {/* More Options Menu (⋮) Popup */}
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

          {/* 3. FLOATING TOOLBAR */}
          <FloatingToolbar 
            isMicrophoneEnabled={isMicrophoneEnabled}
            isCameraEnabled={isCameraEnabled}
            isScreenSharing={isScreenSharing}
            handRaised={handRaised}
            chatOpen={sidebarOpen}
            captionsEnabled={captionsEnabled}
            isRecording={isRecording}
            userRole={user.role}
            onToggleMic={() => localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)}
            onToggleCamera={() => localParticipant?.setCameraEnabled(!isCameraEnabled)}
            onToggleScreenShare={handleToggleScreenShare}
            onOpenWhiteboard={() => setWhiteboardOpen(true)}
            onSendReaction={handleSendReaction}
            onToggleHand={() => setHandRaised(!handRaised)}
            onToggleChat={() => setSidebarOpen(!sidebarOpen)}
            onOpenAI={() => setAiAssistantOpen(true)}
            onToggleCaptions={() => setCaptionsEnabled(!captionsEnabled)}
            onOpenMoreMenu={() => setMoreMenuOpen(!moreMenuOpen)}
            onLeaveClass={handleLeaveClass}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />

        </div>

        {/* 4. TABBED RIGHT SIDEBAR PANEL */}
        {sidebarOpen && (
          <SidebarPanel 
            user={user}
            chats={chats}
            onSendChat={handleSendChat}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onClose={() => setSidebarOpen(false)}
            isLocked={isLocked}
            onToggleLock={() => setIsLocked(!isLocked)}
          />
        )}

      </main>

      {/* 5. MODALS & DRAWERS */}
      {whiteboardOpen && (
        <WhiteboardModal 
          onClose={() => setWhiteboardOpen(false)} 
          isTeacher={user.role === 'TEACHER'}
        />
      )}

      {aiAssistantOpen && (
        <AIAssistantModal 
          onClose={() => setAiAssistantOpen(false)} 
          userRole={user.role}
        />
      )}

      {settingsOpen && (
        <DeviceSettingsModal 
          onClose={() => setSettingsOpen(false)} 
        />
      )}

      {/* Save Recording Modal */}
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
