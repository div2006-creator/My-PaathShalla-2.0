'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/ClientLayout';

export default function DashboardPage() {
  const { user, isAuthenticated, requireAuth, loginWithGoogle } = useAuth();
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

  if (!isAuthenticated || !user) {
    return <GuestDashboard loginWithGoogle={loginWithGoogle} requireAuth={requireAuth} />;
  }

  const currentRole = roleOverride || user.role;

  return currentRole === 'TEACHER' ? <TeacherDashboard user={user} requireAuth={requireAuth} /> : <StudentDashboard user={user} requireAuth={requireAuth} />;
}

// ================= GUEST DASHBOARD =================
function GuestDashboard({ loginWithGoogle, requireAuth }) {
  const [schedule, setSchedule] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuestData() {
      try {
        const [schedRes, recRes] = await Promise.all([
          fetch('/api/schedule').catch(() => null),
          fetch('/api/recordings').catch(() => null),
        ]);

        const schedData = schedRes && schedRes.ok ? await schedRes.json().catch(() => ({})) : {};
        const recData = recRes && recRes.ok ? await recRes.json().catch(() => ({})) : {};

        setSchedule(schedData.schedule || []);
        setRecordings(recData.recordings || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchGuestData();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Hero Banner for Guests */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
            Welcome to PaathShalla 2.0 👋
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight text-white">
            Commercial Digital Classroom & LMS Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Explore live scheduled classes, class recordings, and coursework. Sign in with Google to join live classrooms or schedule classes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => loginWithGoogle('STUDENT')}
            className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign In with Google</span>
          </button>
          
          <button
            onClick={() => requireAuth(null, 'TEACHER')}
            className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <span>Teacher Portal</span>
          </button>
        </div>
      </section>

      {/* Scheduled Classes */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 animate-pulse">sensors</span>
            <span>Today's Classroom Schedule</span>
          </h3>
          <Link href="/live" className="text-xs font-bold text-indigo-400 hover:underline">
            View All Classes &gt;
          </Link>
        </div>

        {schedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                    {item.dayOfWeek || 'Today'} • {item.startTime}
                  </span>
                  <span className="text-xs font-bold text-amber-400">{item.subject}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white font-display">{item.topic}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Faculty: {item.teacherName} • {item.room}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-indigo-400">Class Session</span>
                  <button
                    onClick={() => requireAuth(() => {}, 'STUDENT')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    JOIN CLASS
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
            <span className="material-symbols-outlined text-slate-600 text-4xl">event_busy</span>
            <h4 className="font-bold text-white text-base">No live classes scheduled right now.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Scheduled live classes will appear here when added by faculty.</p>
          </div>
        )}
      </section>

      {/* Class Recordings */}
      <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400">videocam</span>
            <span>Recorded Lectures Archive</span>
          </h3>
          <Link href="/recordings" className="text-xs font-bold text-indigo-400 hover:underline">
            View All Recordings &gt;
          </Link>
        </div>

        {recordings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recordings.slice(0, 3).map((r) => (
              <div key={r.id} className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-amber-400">{r.subject}</span>
                <h4 className="font-bold text-white text-xs truncate">{r.title}</h4>
                <p className="text-[10px] text-slate-400">Duration: {r.duration}</p>
                <Link href="/recordings" className="inline-block px-3 py-1.5 bg-indigo-600 text-white font-bold text-[11px] rounded-lg">
                  Watch Recording
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 space-y-1">
            <span className="material-symbols-outlined text-slate-600 text-3xl">videocam_off</span>
            <p className="font-bold text-xs text-white">No class recordings available yet</p>
            <p className="text-[11px]">Recordings will appear here after live classes.</p>
          </div>
        )}
      </section>

    </div>
  );
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
    </div>
  );
}

// ================= STUDENT DASHBOARD =================
function StudentDashboard({ user, requireAuth }) {
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [schedRes, assignRes, recRes] = await Promise.all([
          fetch('/api/schedule').catch(() => null),
          fetch('/api/assignments').catch(() => null),
          fetch('/api/recordings').catch(() => null),
        ]);

        const schedData = schedRes && schedRes.ok ? await schedRes.json().catch(() => ({})) : {};
        const assignData = assignRes && assignRes.ok ? await assignRes.json().catch(() => ({})) : {};
        const recData = recRes && recRes.ok ? await recRes.json().catch(() => ({})) : {};

        setSchedule(schedData.schedule || []);
        setAssignments(assignData.assignments || []);
        setRecordings(recData.recordings || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const pendingAssignments = assignments.filter(a => !a.submissions || a.submissions.length === 0);
  const liveClass = schedule[0];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* 1. TOP HERO GREETING */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
            Welcome back, {user.name} 👋
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight text-white">
            {liveClass ? liveClass.subject : 'PaathShalla Student Portal'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {liveClass ? `Current Topic: ${liveClass.topic}` : 'Select a live class or review lecture recordings below.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => requireAuth(() => { window.location.href = '/live'; }, 'STUDENT')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">sensors</span>
            <span>JOIN LIVE CLASSROOM</span>
          </button>
        </div>
      </section>

      {/* 2. TODAY'S SCHEDULE */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 animate-pulse">sensors</span>
            <span>Today's Classroom Schedule</span>
          </h3>
          <Link href="/live" className="text-xs font-bold text-indigo-400 hover:underline">
            Full Timetable &gt;
          </Link>
        </div>

        {schedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                    {item.dayOfWeek || 'Today'} • {item.startTime}
                  </span>
                  <span className="text-xs font-bold text-amber-400">{item.subject}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white font-display">{item.topic}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Faculty: {item.teacherName} • {item.room}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-indigo-400">Class Session</span>
                  <button
                    onClick={() => requireAuth(() => { window.location.href = `/live?room=${item.id}`; }, 'STUDENT')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    JOIN CLASS
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-2">
            <span className="material-symbols-outlined text-slate-600 text-4xl">event_busy</span>
            <h4 className="font-bold text-white text-base">No live classes right now</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Upcoming classes will appear here when scheduled by your faculty.</p>
          </div>
        )}
      </section>

    </div>
  );
}

// ================= TEACHER DASHBOARD =================
function TeacherDashboard({ user, requireAuth }) {
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [schedRes, assignRes] = await Promise.all([
          fetch('/api/schedule').catch(() => null),
          fetch('/api/assignments').catch(() => null),
        ]);

        const schedData = schedRes && schedRes.ok ? await schedRes.json().catch(() => ({})) : {};
        const assignData = assignRes && assignRes.ok ? await assignRes.json().catch(() => ({})) : {};

        setSchedule(schedData.schedule || []);
        setAssignments(assignData.assignments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* TEACHER HERO */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
            Teacher Control Desk
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Welcome back, {user.name}
          </h2>
          <p className="text-xs text-slate-300">
            {schedule.length > 0
              ? `You have ${schedule.length} live classes scheduled.`
              : 'No live classes scheduled today.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => requireAuth(() => { window.location.href = '/live'; }, 'TEACHER')}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">sensors</span>
            <span>START LIVE CLASS</span>
          </button>
          
          <button
            onClick={() => requireAuth(() => { window.location.href = '/teacher/classes'; }, 'TEACHER')}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Create Class</span>
          </button>
        </div>
      </section>

      {/* TODAY'S SCHEDULE */}
      <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">schedule</span>
            <span>Today's Scheduled Classes</span>
          </h3>
          <Link href="/schedule" className="text-xs font-bold text-indigo-400 hover:underline">
            Full Timetable &gt;
          </Link>
        </div>

        {schedule.length > 0 ? (
          <div className="space-y-3">
            {schedule.map((item) => (
              <div key={item.id} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex justify-between items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400">{item.subject}</span>
                  <h4 className="font-bold text-white text-sm">{item.topic}</h4>
                  <p className="text-xs text-slate-400">{item.startTime} - {item.endTime} • {item.room}</p>
                </div>
                <button
                  onClick={() => requireAuth(() => { window.location.href = `/live?room=${item.id}`; }, 'TEACHER')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shrink-0 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">sensors</span> START CLASS
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-slate-600 text-4xl">event_busy</span>
            <h4 className="font-bold text-white text-base">No classes scheduled for today</h4>
            <button
              onClick={() => requireAuth(() => { window.location.href = '/teacher/classes'; }, 'TEACHER')}
              className="inline-block mt-2 px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl"
            >
              Create New Class
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
