'use client';

import React, { useState, useEffect } from 'react';
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
  const { user, isAuthenticated, requireAuth } = useAuth();
  const router = useRouter();

  const [activeRoom, setActiveRoom] = useState(null);
  const [token, setToken] = useState('');
  const [classSubject, setClassSubject] = useState('Mathematics');
  const [classTopic, setClassTopic] = useState('Live Class Session');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  // Schedule Lobby States
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states for creating a new scheduled live class
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newTopic, setNewTopic] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM - 11:00 AM');
  const [newRoom, setNewRoom] = useState('Live Room A');

  // Check URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      const urlSubject = params.get('subject');
      const urlTopic = params.get('topic');

      if (urlSubject) setClassSubject(urlSubject);
      if (urlTopic) setClassTopic(urlTopic);

      if (urlRoom) {
        if (isAuthenticated) {
          setActiveRoom(urlRoom);
        }
      }
    }
  }, [isAuthenticated]);

  // Fetch schedule for the lobby
  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setSchedule(data.schedule || []);
    } catch (e) {
      console.error(e);
      setSchedule([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Delete scheduled class (Teacher)
  const handleDeleteClass = async (classId) => {
    if (!confirm('Are you sure you want to delete/remove this scheduled class?')) return;
    try {
      const res = await fetch(`/api/schedule?id=${classId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSchedule();
      }
    } catch (e) {
      console.error('Delete class error:', e);
    }
  };

  // Fetch LiveKit token when an active room is selected
  useEffect(() => {
    async function getToken() {
      if (!activeRoom) return;
      setConnecting(true);
      setError('');
      try {
        const nameParam = user?.name ? `&name=${encodeURIComponent(user.name)}` : '';
        const roleParam = user?.role ? `&role=${encodeURIComponent(user.role)}` : '';
        const res = await fetch(`/api/live/token?room=${encodeURIComponent(activeRoom)}${nameParam}${roleParam}`);
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          if (user && user.role === 'STUDENT') {
            fetch('/api/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                className: classSubject + ' - ' + classTopic,
                classId: activeRoom,
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
    if (activeRoom) {
      getToken();
    }
  }, [user, activeRoom, classSubject, classTopic]);

  const handleStartClass = (item) => {
    requireAuth(() => {
      setClassSubject(item.subject);
      setClassTopic(item.topic);
      setActiveRoom(item.id || item.room || 'live-class-' + Date.now());
    }, 'STUDENT');
  };

  const handleOpenScheduleModal = () => {
    requireAuth(() => {
      setCreateModalOpen(true);
    }, 'TEACHER');
  };

  const handleCreateScheduleClass = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject,
          topic: newTopic,
          startTime: newTime.split('-')[0]?.trim() || '10:00 AM',
          endTime: newTime.split('-')[1]?.trim() || '11:00 AM',
          room: newRoom,
          dayOfWeek: 'Today',
          teacherName: user?.name || 'Faculty Instructor',
        }),
      });

      if (res.ok) {
        setCreateModalOpen(false);
        setNewTopic('');
        fetchSchedule();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. IF AN ACTIVE ROOM IS SELECTED -> RENDER FULL LIVEKIT CLASSROOM STAGE
  if (activeRoom) {
    if (connecting) {
      return (
        <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center text-white space-y-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h2 className="text-lg font-bold">Connecting to PaathShalla WebRTC Stage...</h2>
            <p className="text-slate-400 text-xs mt-1">Classroom: {classSubject} - {classTopic}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center text-white space-y-4 p-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-xl font-bold">Could Not Connect to Classroom</h2>
          <p className="text-slate-400 text-xs max-w-md">{error}</p>
          <button 
            onClick={() => setActiveRoom(null)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs active:scale-95 transition-transform"
          >
            Return to Scheduled Classes Lobby
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
        <PaathShallaLiveClass 
          user={user} 
          classSubject={classSubject} 
          classTopic={classTopic}
          roomName={activeRoom}
          onLeaveRoom={() => setActiveRoom(null)} 
        />
        <RoomAudioRenderer />
      </LiveKitRoom>
    );
  }

  // 2. IF NO ACTIVE ROOM IS SELECTED -> RENDER SCHEDULED LIVE CLASSES LOBBY
  const isTeacher = user?.role === 'TEACHER';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Lobby Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-red-500/20 text-red-400 px-2.5 py-1 rounded border border-red-500/30">
            Live Classroom Stage
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Scheduled Live Classes</h1>
          <p className="text-xs text-slate-400">Select a scheduled live session below to start or join the WebRTC classroom</p>
        </div>

        <button
          onClick={handleOpenScheduleModal}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Schedule Live Class</span>
        </button>
      </div>

      {/* Scheduled Classes Feed Grid */}
      <div className="space-y-4">
        {loadingSchedule ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-300">Loading scheduled live classes...</p>
          </div>
        ) : schedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((item) => (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-800 hover:border-red-500/50 p-5 rounded-2xl shadow-md space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-extrabold uppercase">
                      {item.dayOfWeek || 'Today'} • {item.startTime} - {item.endTime}
                    </span>
                    <span className="text-xs font-bold text-amber-400">{item.subject}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white font-display">{item.topic}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Faculty: <strong className="text-slate-200">{item.teacherName || 'Faculty Instructor'}</strong> • Location: {item.room}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Ready for Broadcast
                  </span>

                  <div className="flex items-center gap-2">
                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteClass(item.id)}
                        className="p-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-slate-700 transition-colors"
                        title="Delete Scheduled Class"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStartClass(item)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">sensors</span>
                      <span>{isTeacher ? 'START LIVE CLASS' : 'JOIN LIVE CLASS'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center space-y-3">
            <span className="material-symbols-outlined text-slate-600 text-5xl">sensors_off</span>
            <h3 className="text-base font-bold text-white">No live classes scheduled right now.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isTeacher
                ? 'Create your first scheduled live class to start teaching your students.'
                : 'Check back soon! Your teachers will schedule live classes here.'}
            </p>
            <button
              onClick={handleOpenScheduleModal}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Schedule Live Class Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Schedule Live Class Modal (Teacher) */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-red-400 text-base">Schedule New Live Class</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateScheduleClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Subject</label>
                <select
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Reactions"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM - 11:00 AM"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    required
                    placeholder="Live Room A"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md mt-2"
              >
                Schedule & Create Live Class
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Custom Classroom UI Component
function PaathShallaLiveClass({ user, classSubject = "Mathematics", classTopic = "Live Class Session", roomName = "live-class", onLeaveRoom }) {
  const router = useRouter();

  // Native LiveKit Local Participant Media Control (Mic, Camera, Screen Share)
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();

  // Subscribe to live camera & screen share video tracks via LiveKit hook
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Classroom Feature States
  const [chats, setChats] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  // Recording States (Teacher)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState('IDLE');
  const [endModalOpen, setEndModalOpen] = useState(false);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Handle native LiveKit Media Toggles
  const handleToggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  const handleToggleCamera = async () => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    }
  };

  const handleToggleScreenShare = async () => {
    if (!localParticipant) return;
    try {
      const nextState = !(isScreenShareEnabled || isScreenSharing);
      await localParticipant.setScreenShareEnabled(nextState);
      setIsScreenSharing(nextState);
    } catch (err) {
      console.error('Screen share error:', err);
      alert('Could not toggle screen share: ' + (err.message || 'Permission denied or browser not supported'));
    }
  };

  const handleStartRecording = async () => {
    const currentRoom = roomName || 'live-class';
    setRecordingStatus('STARTING');
    try {
      const res = await fetch('/api/live/recording/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: currentRoom,
          title: `${classSubject}: ${classTopic}`,
          subject: classSubject,
          instructorName: user?.name || 'Faculty Instructor',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecordingSeconds(0);
        setIsRecording(true);
        setRecordingStatus('RECORDING');
      } else {
        alert(data.error || 'Unable to start recording. Please try again.');
        setRecordingStatus('IDLE');
      }
    } catch (err) {
      console.error('Start recording error:', err);
      alert('Unable to start recording. Please check connection.');
      setRecordingStatus('IDLE');
    }
  };

  const handleStopRecording = async () => {
    const currentRoom = roomName || 'live-class';
    setRecordingStatus('STOPPING');
    try {
      const res = await fetch('/api/live/recording/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: currentRoom,
        }),
      });
      const data = await res.json();
      setIsRecording(false);
      setRecordingStatus('IDLE');
      if (res.ok) {
        alert('Class recording stopped and saved to Class Recordings Library (/recordings)!');
      } else {
        alert(data.error || 'Failed to stop recording');
      }
    } catch (err) {
      console.error(err);
      setIsRecording(false);
      setRecordingStatus('IDLE');
    }
  };

  const handleLeaveTrigger = () => {
    if (user?.role === 'TEACHER') {
      setEndModalOpen(true);
    } else {
      handleLeave();
    }
  };

  const handleLeave = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
    } else {
      router.push('/dashboard');
    }
  };

  const handleConfirmEndClass = async () => {
    if (isRecording) {
      await handleStopRecording();
    }
    setEndModalOpen(false);
    handleLeave();
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChats([
      ...chats,
      {
        sender: user?.name || 'Student',
        role: user?.role || 'STUDENT',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F172A] overflow-hidden text-white font-sans">
      
      {/* 1. TOP CLASSROOM HEADER */}
      <ClassroomHeader
        courseTitle={classSubject}
        topicName={classTopic}
        isLive={true}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        participantCount={1}
        teacherName={user?.role === 'TEACHER' ? user?.name : 'Faculty Instructor'}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }}
        onLeaveClass={handleLeaveTrigger}
        userRole={user?.role || 'STUDENT'}
      />

      {/* 2. MAIN STAGE CONTENT (VIDEO GRID + SIDEBAR) */}
      <div className="flex-1 flex overflow-hidden relative">
        <VideoGrid
          tracks={tracks}
          layoutMode={layoutMode}
          isScreenSharing={isScreenShareEnabled || isScreenSharing}
          captionsEnabled={captionsEnabled}
          user={user}
        />

        {sidebarOpen && (
          <SidebarPanel
            activeTab="chat"
            chats={chats}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendChat={handleSendChat}
            user={user}
            isLocked={isLocked}
            onToggleLock={() => setIsLocked(!isLocked)}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* 3. FLOATING TOOLBAR CONTROLS */}
      <FloatingToolbar
        isMicrophoneEnabled={isMicrophoneEnabled}
        isCameraEnabled={isCameraEnabled}
        isScreenSharing={isScreenShareEnabled || isScreenSharing}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        userRole={user?.role || 'STUDENT'}
        isTeacher={user?.role === 'TEACHER'}
        handRaised={handRaised}
        onToggleHand={() => setHandRaised(!handRaised)}
        sidebarOpen={sidebarOpen}
        chatOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleChat={() => setSidebarOpen(!sidebarOpen)}
        onOpenWhiteboard={() => setWhiteboardOpen(true)}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        captionsEnabled={captionsEnabled}
        onToggleCaptions={() => setCaptionsEnabled(!captionsEnabled)}
        onLeaveClass={handleLeaveTrigger}
      />

      {/* 4. MODALS */}
      {whiteboardOpen && (
        <WhiteboardModal onClose={() => setWhiteboardOpen(false)} />
      )}

      {settingsOpen && (
        <DeviceSettingsModal onClose={() => setSettingsOpen(false)} />
      )}

      {/* End Class Confirmation Modal (Teacher) */}
      {endModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 space-y-4 text-white text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <span className="material-symbols-outlined text-2xl">call_end</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white">End this live class?</h3>
              <p className="text-xs text-slate-400">
                The live session will end for all participants and any active recording will be finalized automatically.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEndModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndClass}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                End Class
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
