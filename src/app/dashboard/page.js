'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';

export default function DashboardPage() {
  const { user } = useAuth();
  const [roleOverride, setRoleOverride] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole) {
        setRoleOverride(urlRole.toUpperCase());
      }
    }
  }, []);

  if (!user) return null;

  const currentRole = roleOverride || user.role;

  return currentRole === 'TEACHER' ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />;
}

// ================= SKELETON LOADER COMPONENT =================
function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-pulse">
      <div className="h-44 bg-slate-800/60 rounded-2xl"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800/40 rounded-xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 bg-slate-800/40 rounded-xl"></div>
          <div className="h-48 bg-slate-800/40 rounded-xl"></div>
        </div>
        <div className="h-96 bg-slate-800/40 rounded-xl"></div>
      </div>
    </div>
  );
}

// ================= STUDENT DASHBOARD =================
function StudentDashboard({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedRes, assignRes, recRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/assignments'),
        fetch('/api/recordings'),
      ]);

      if (!schedRes.ok || !assignRes.ok || !recRes.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const schedData = await schedRes.json();
      const assignData = await assignRes.json();
      const recData = await recRes.json();

      setSchedule(schedData.schedule || []);
      setAssignments(assignData.assignments || []);
      setRecordings(recData.recordings || []);
    } catch (e) {
      console.error(e);
      setError('Unable to fetch your dashboard updates. Please check connection.');
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-slate-300">
        <span className="material-symbols-outlined text-amber-500 text-5xl mb-2">cloud_off</span>
        <h3 className="text-lg font-bold text-white">Dashboard Loading Error</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.submissions && a.submissions.length > 0);
  const pendingAssignments = assignments.filter(a => !a.submissions || a.submissions.length === 0);
  const liveClass = schedule.find(c => c.room?.includes('Live') || c.id === 'sched-1') || schedule[0];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* 1. TOP HERO GREETING & PRIMARY ACTION: TODAY'S HIGHLIGHT */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Good morning, {user.name} 👋
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight text-white">
              Data Structures & Algorithms (Section A)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Current Topic: <strong className="text-amber-400 font-bold">Binary Search Trees & Graph Traversals</strong>
            </p>
            
            {/* Learning Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Course Syllabus Completion</span>
                <span className="text-amber-400 font-extrabold">68% Complete</span>
              </div>
              <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-indigo-400/20">
                <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/live?subject=Data+Structures&topic=Binary+Search+Trees"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">sensors</span>
              <span>JOIN LIVE CLASSROOM</span>
            </Link>
            <Link
              href="/courses"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
            >
              <span>View Course Syllabus</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TODAY'S SCHEDULE & LIVE CLASSROOM */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 animate-pulse">sensors</span>
            <span>Today's Classroom Schedule</span>
          </h3>
          <Link href="/schedule" className="text-xs font-bold text-indigo-400 hover:underline">
            Full Timetable &gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Live Class Card */}
          <div className="bg-slate-900 border-2 border-red-500/40 p-5 rounded-2xl shadow-md space-y-3 relative">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                LIVE NOW 🔴
              </span>
              <span className="text-[11px] text-slate-400 font-medium">10:00 AM - 11:30 AM</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Mathematics 101</span>
              <h4 className="text-base font-bold text-white font-display">Integral Calculus & Limits Deep Dive</h4>
              <p className="text-xs text-slate-400 mt-0.5">Faculty: Prof. Rajesh Varma • Room 302</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">group</span> 42 Students Joined
              </span>
              <Link
                href="/live?subject=Mathematics&topic=Integral+Calculus"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                JOIN CLASS
              </Link>
            </div>
          </div>

          {/* Upcoming Today Class Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md text-[10px] font-bold uppercase">
                Upcoming Today
              </span>
              <span className="text-[11px] text-slate-400 font-medium">02:00 PM - 03:30 PM</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Physics</span>
              <h4 className="text-base font-bold text-white font-display">Electromagnetic Induction & Faraday Laws</h4>
              <p className="text-xs text-slate-400 mt-0.5">Faculty: Dr. Ananya Sharma • Lab 04</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-medium">Reminder set for 01:45 PM</span>
              <button
                onClick={() => alert('Notification reminder set!')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                Set Alert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PENDING WORK & LEARNING METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Pending Work & Recent Recordings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Work (Assignments & DPPs) */}
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">assignment</span>
                <span>Pending Work & Submissions</span>
              </h3>
              <Link href="/assignments" className="text-xs font-bold text-indigo-400 hover:underline">
                View All ({pendingAssignments.length}) &gt;
              </Link>
            </div>

            {pendingAssignments.length > 0 ? (
              <div className="space-y-3">
                {pendingAssignments.map((a) => (
                  <div key={a.id} className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-xl flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {a.subject}
                      </span>
                      <h4 className="font-bold text-white text-sm">{a.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{a.description}</p>
                    </div>
                    <Link
                      href="/assignments"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shrink-0 transition-all"
                    >
                      Submit
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-1">
                <span className="material-symbols-outlined text-emerald-400 text-3xl">task_alt</span>
                <p className="text-xs text-slate-300 font-bold">All caught up! No pending assignments.</p>
              </div>
            )}
          </section>

          {/* Recent Recorded Lectures */}
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">video_library</span>
                <span>Recent Lecture Recordings</span>
              </h3>
              <Link href="/recordings" className="text-xs font-bold text-indigo-400 hover:underline">
                Browse Library &gt;
              </Link>
            </div>

            {recordings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recordings.slice(0, 2).map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedVideo(rec)}
                    className="group bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500 transition-all"
                  >
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={rec.title} src={rec.thumbnailUrl} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-white">play_circle</span>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-slate-950/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {rec.duration}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">{rec.subject}</span>
                      <h5 className="font-bold text-white text-xs truncate">{rec.title}</h5>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">No recorded lectures available.</p>
            )}
          </section>

        </div>

        {/* Right Column: Performance Summary & Quick Shortcuts */}
        <div className="space-y-6">
          
          {/* Performance Summary Card */}
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-white font-display border-b border-slate-800 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">analytics</span>
              <span>Recent Test Results</span>
            </h3>

            <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Mock Test #04 Score</span>
                <span className="text-base font-black text-emerald-400">18 / 20</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-slate-700/60">
                <div className="p-2 bg-slate-900/60 rounded-lg">
                  <p className="text-[10px] text-slate-400">Accuracy</p>
                  <p className="font-bold text-white">92%</p>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-lg">
                  <p className="text-[10px] text-slate-400">Batch Rank</p>
                  <p className="font-bold text-amber-400">Rank #04</p>
                </div>
              </div>
            </div>

            <Link
              href="/tests"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition-all"
            >
              <span>Take Full CBT Test</span>
              <span className="material-symbols-outlined text-sm">quiz</span>
            </Link>
          </section>

          {/* Quick Action Shortcuts */}
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-2">
              Quick Actions
            </h3>
            
            <Link
              href="/doubts"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-400">help_outline</span>
                <span>Ask Teacher a Doubt</span>
              </div>
              <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
            </Link>

            <Link
              href="/materials"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-400">folder</span>
                <span>Study Library Notes</span>
              </div>
              <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
            </Link>
          </section>

        </div>

      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative text-white">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="font-bold text-sm truncate">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <video className="w-full aspect-video bg-black" controls autoPlay src={selectedVideo.videoUrl} />
          </div>
        </div>
      )}

    </div>
  );
}

// ================= TEACHER DASHBOARD =================
function TeacherDashboard({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // New Assignment fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newDueDate, setNewDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedRes, assignRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/assignments'),
      ]);

      if (!schedRes.ok || !assignRes.ok) {
        throw new Error('Failed to fetch teacher dashboard data');
      }

      const schedData = await schedRes.json();
      const assignData = await assignRes.json();

      setSchedule(schedData.schedule || []);
      setAssignments(assignData.assignments || []);
    } catch (e) {
      console.error(e);
      setError('Unable to load teacher records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newDueDate) return;

    setCreating(true);
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          subject: newSubject,
          dueDate: new Date(newDueDate).toISOString(),
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setModalOpen(false);
        await fetchDashboardData();
      } else {
        alert('Failed to create assignment');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-slate-300">
        <span className="material-symbols-outlined text-amber-500 text-5xl mb-2">cloud_off</span>
        <h3 className="text-lg font-bold text-white">Teacher Portal Error</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{error}</p>
        <button onClick={fetchDashboardData} className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* 1. TEACHER HERO & QUICK ACTIONS */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
            Teacher Control Desk
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Welcome back, {user.name}
          </h2>
          <p className="text-xs text-slate-300">
            You have <strong className="text-amber-400">2 live classes scheduled</strong> today and <strong className="text-amber-400">3 ungraded submissions</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/live"
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">sensors</span>
            <span>START LIVE CLASS</span>
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">add_task</span>
            <span>Create Assignment</span>
          </button>
        </div>
      </section>

      {/* 2. OVERVIEW STATISTICS CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Students</span>
          <p className="text-2xl font-black text-white">128</p>
          <span className="text-[10px] text-emerald-400 font-bold">Enrolled in 3 classes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Classes</span>
          <p className="text-2xl font-black text-indigo-400">4</p>
          <span className="text-[10px] text-indigo-300 font-bold">Sec A, B & C</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Assignments</span>
          <p className="text-2xl font-black text-amber-400">{assignments.length}</p>
          <span className="text-[10px] text-amber-300 font-bold">3 Pending Grade</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Attendance</span>
          <p className="text-2xl font-black text-emerald-400">94%</p>
          <span className="text-[10px] text-emerald-400 font-bold">Today's Session</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Published Tests</span>
          <p className="text-2xl font-black text-white">6</p>
          <span className="text-[10px] text-slate-400 font-bold">CBT Format</span>
        </div>
      </section>

      {/* 3. TODAY'S CLASSES & SCHEDULE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Classes */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">schedule</span>
                <span>Today's Classes</span>
              </h3>
              <Link href="/schedule" className="text-xs font-bold text-indigo-400 hover:underline">
                Full Schedule &gt;
              </Link>
            </div>

            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex justify-between items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-amber-400">{item.startTime} - {item.endTime}</span>
                    <h4 className="font-bold text-white text-base">{item.subject}</h4>
                    <p className="text-xs text-slate-400">{item.topic} • Section A • 42 Students</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/live"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      START CLASS
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Student Submissions to Review */}
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">assignment_turned_in</span>
                <span>Assignments & Student Submissions</span>
              </h3>
              <Link href="/assignments" className="text-xs font-bold text-indigo-400 hover:underline">
                Review All &gt;
              </Link>
            </div>

            <div className="space-y-3">
              {assignments.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl flex justify-between items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase">{item.subject}</span>
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                  </div>
                  <Link
                    href="/assignments"
                    className="px-3.5 py-1.5 bg-slate-800 text-indigo-400 hover:text-white font-bold text-xs rounded-lg border border-slate-700"
                  >
                    Submissions ({item.submissions?.length || 0})
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Quick Teacher Actions */}
        <div className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-2">
              Teacher Actions
            </h3>

            <Link href="/teacher/classes" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">class</span> Manage Classes
              </div>
              <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
            </Link>

            <Link href="/teacher/students" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">group</span> View Students
              </div>
              <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
            </Link>

            <Link href="/teacher/attendance" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">how_to_reg</span> Take Attendance
              </div>
              <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
            </Link>

            <Link href="/teacher/announcements" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">campaign</span> Send Announcement
              </div>
              <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
            </Link>
          </section>
        </div>

      </div>

      {/* Create Assignment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-400 text-base">Create New Assignment</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Subject</label>
                <select
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>History</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Definite Integrals"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Instructions for students..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all mt-2"
              >
                {creating ? 'Publishing...' : 'Publish Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
