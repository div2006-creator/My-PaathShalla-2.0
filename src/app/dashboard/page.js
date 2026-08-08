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

// ================= STUDENT DASHBOARD (STITCH WEB THEME) =================
function StudentDashboard({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [schedRes, assignRes, recRes] = await Promise.all([
          fetch('/api/schedule'),
          fetch('/api/assignments'),
          fetch('/api/recordings'),
        ]);

        const schedData = await schedRes.json();
        const assignData = await assignRes.json();
        const recData = await recRes.json();

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Real Stats from Database
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.submissions && a.submissions.length > 0);
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments.length / totalAssignments) * 100) : 0;
  const pendingAssignment = assignments.find(a => !a.submissions || a.submissions.length === 0);
  const liveClass = schedule.find(c => c.room === 'Live Class (Active)');
  const upcomingClasses = schedule.filter(c => c.id !== liveClass?.id);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      
      {/* Hero: Continue Learning (Prompt Spec #4) */}
      <section className="bg-gradient-to-r from-primary to-primary-container text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              <span>Continue Learning</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">Data Structures & Algorithms</h2>
            <p className="text-sm opacity-90">Current Lesson: <strong className="text-white underline">Binary Search Trees (BST - Insertion & Deletion)</strong></p>
            
            {/* Clean Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Course Completion Progress</span>
                <span className="text-secondary font-extrabold">68%</span>
              </div>
              <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div className="bg-gradient-to-r from-secondary to-amber-300 h-full rounded-full transition-all duration-500" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/courses"
              className="bg-secondary text-black px-6 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">play_circle</span>
              <span>Continue Learning</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Student Stats Rail */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface border border-outline-variant p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Study Streak</span>
            <span className="material-symbols-outlined text-amber-500">local_fire_department</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary mt-1">14 Days</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">⚡ Active Daily Learner</p>
        </div>

        <div className="bg-surface border border-outline-variant p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Assignments</span>
            <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary mt-1">{completedAssignments.length} / {totalAssignments}</p>
          <p className="text-[11px] text-on-surface-variant font-bold mt-1">{completionRate}% Completed</p>
        </div>

        <div className="bg-surface border border-outline-variant p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Test Accuracy</span>
            <span className="material-symbols-outlined text-emerald-500">analytics</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary mt-1">92%</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Top 5% Student Rank</p>
        </div>

        <div className="bg-surface border border-outline-variant p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Live Lectures</span>
            <span className="material-symbols-outlined text-red-500">videocam</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary mt-1">{schedule.length}</p>
          <p className="text-[11px] text-on-surface-variant font-bold mt-1">Available 24/7</p>
        </div>
      </section>

      {/* Dedicated Live Classes Section (Prompt Spec #5) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-extrabold text-primary font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 animate-pulse">sensors</span>
              <span>Live Classroom Sessions</span>
            </h3>
            <p className="text-xs text-on-surface-variant font-bold">Join ongoing interactive lectures with real-time doubt solving</p>
          </div>
          <Link href="/live" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
            <span>Go to Classroom Stage</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Now Card */}
          <div className="bg-surface border-2 border-red-500/30 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-red-500 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                LIVE NOW 🔴
              </span>
              <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-lg flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>42 Watching</span>
              </span>
            </div>

            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Mathematics 101</span>
            <h4 className="text-lg sm:text-xl font-extrabold text-on-surface font-display mt-1">Integral Calculus & Limits Deep Dive</h4>
            
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant/60">
              <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs shrink-0">
                PV
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-on-surface truncate">Prof. Rajesh Varma</p>
                <p className="text-[11px] text-on-surface-variant font-bold">Senior IIT-JEE Faculty</p>
              </div>
              <Link
                href="/live?subject=Mathematics&topic=Integral+Calculus+%26+Limits"
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md active:scale-95 transition-all shrink-0"
              >
                JOIN CLASS
              </Link>
            </div>
          </div>

          {/* Upcoming Class Card */}
          <div className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm hover:border-primary transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/30 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs">schedule</span>
                Tomorrow at 10:00 AM
              </span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">Physics</span>
            </div>

            <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Physics - Unit 4</span>
            <h4 className="text-lg sm:text-xl font-extrabold text-on-surface font-display mt-1">Electromagnetic Induction & Faraday Laws</h4>
            
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant/60">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0">
                AS
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-on-surface truncate">Dr. Ananya Sharma</p>
                <p className="text-[11px] text-on-surface-variant font-bold">Head of Physics</p>
              </div>
              <button
                onClick={() => alert("Reminder set! You will receive a notification 15 minutes before class starts.")}
                className="bg-surface-container-high hover:bg-surface-container-highest text-primary border border-outline-variant px-4 py-2.5 rounded-xl font-extrabold text-xs active:scale-95 transition-all shrink-0 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">notifications_active</span>
                <span>SET REMINDER</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Schedule & Recordings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Schedule */}
          <section className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
              <h3 className="text-lg font-bold text-primary font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">calendar_month</span>
                <span>Upcoming Class Schedule</span>
              </h3>
              <Link href="/schedule" className="text-xs font-bold text-primary hover:underline">View Full Calendar &gt;</Link>
            </div>
            
            {upcomingClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingClasses.map((item) => (
                  <div key={item.id} className="p-4 border border-outline-variant/60 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {item.startTime} - {item.endTime}
                      </span>
                      <span className="text-[11px] font-bold text-on-surface-variant">{item.dayOfWeek}</span>
                    </div>
                    <h4 className="font-bold text-on-surface text-base truncate">{item.subject}</h4>
                    <p className="text-xs text-on-surface-variant truncate">{item.topic}</p>
                    <div className="pt-2 border-t border-outline-variant/40 text-[11px] text-on-surface-variant flex justify-between font-bold">
                      <span>{item.teacherName}</span>
                      <span>{item.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm py-4 font-bold">No additional classes scheduled for today.</p>
            )}
          </section>

          {/* Recordings Quick View */}
          <section className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
              <h3 className="text-lg font-bold text-primary font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">video_library</span>
                <span>Recent Recorded Lectures</span>
              </h3>
              <Link href="/recordings" className="text-xs font-bold text-primary hover:underline">Browse Library &gt;</Link>
            </div>

            {recordings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recordings.slice(0, 4).map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group border border-outline-variant rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all bg-surface"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={video.title} src={video.thumbnailUrl} />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                          <span className="material-symbols-outlined text-2xl">play_arrow</span>
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-bold uppercase text-primary tracking-wider">{video.subject}</span>
                      <h5 className="font-bold text-on-surface text-sm truncate">{video.title}</h5>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5 font-bold">{video.instructorName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm py-4 font-bold">No recorded lectures available yet.</p>
            )}
          </section>

        </div>

        {/* Right Column: Pending Assignments & Actions */}
        <div className="space-y-8">
          
          {/* Pending Assignment Card */}
          <section className="bg-surface-container-lowest border border-outline-variant/60 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-primary font-display flex items-center gap-2 border-b border-outline-variant/40 pb-3">
              <span className="material-symbols-outlined text-secondary">assignment</span>
              <span>Pending Assignment</span>
            </h3>

            {pendingAssignment ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary-container/10 border border-secondary/20 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-secondary bg-secondary-container/30 px-2 py-0.5 rounded">
                      {pendingAssignment.subject}
                    </span>
                    <span className="text-xs text-error font-bold">Due Soon</span>
                  </div>
                  <h4 className="font-bold text-primary text-base">{pendingAssignment.title}</h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2">{pendingAssignment.description}</p>
                </div>
                <Link
                  href="/assignments"
                  className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all"
                >
                  <span>Submit Assignment</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <span className="material-symbols-outlined text-4xl text-green-600">task_alt</span>
                <h4 className="font-bold text-primary text-base">All Caught Up!</h4>
                <p className="text-xs text-on-surface-variant">You have completed all pending coursework.</p>
              </div>
            )}
          </section>

          {/* Quick Action Navigation Cards */}
          <section className="bg-surface-container-lowest border border-outline-variant/60 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-primary font-display border-b border-outline-variant/40 pb-3">
              Quick Shortcuts
            </h3>
            <div className="space-y-3">
              <Link
                href="/assignments"
                className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <span className="material-symbols-outlined text-lg">edit_note</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-primary">All Assignments</h5>
                    <p className="text-[11px] text-on-surface-variant">Track homework & submissions</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-sm">chevron_right</span>
              </Link>

              <Link
                href="/schedule"
                className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-lg">event_available</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-primary">Timetable & Schedule</h5>
                    <p className="text-[11px] text-on-surface-variant">View weekly class calendar</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-sm">chevron_right</span>
              </Link>

              <Link
                href="/recordings"
                className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-variant flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">play_circle</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-primary">Recorded Archive</h5>
                    <p className="text-[11px] text-on-surface-variant">Replay past lectures</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-sm">chevron_right</span>
              </Link>
            </div>
          </section>

        </div>

      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/40">
              <h3 className="font-bold text-primary text-base truncate">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="material-symbols-outlined text-on-surface-variant hover:text-primary">close</button>
            </div>
            <video className="w-full aspect-video bg-black" controls autoPlay src={selectedVideo.videoUrl} />
            <div className="p-4 bg-surface-container-low text-sm text-on-surface">
              <p className="font-bold">{selectedVideo.instructorName}</p>
              <p className="text-on-surface-variant text-xs">{selectedVideo.subject} • Duration: {selectedVideo.duration}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ================= TEACHER DASHBOARD (STITCH WEB THEME) =================
function TeacherDashboard({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Assignment fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newDueDate, setNewDueDate] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [schedRes, assignRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/assignments'),
      ]);
      const schedData = await schedRes.json();
      const assignData = await assignRes.json();

      setSchedule(schedData.schedule || []);
      setAssignments(assignData.assignments || []);
    } catch (e) {
      console.error(e);
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
      let fileUrl = null;
      let fileName = null;

      if (newFile) {
        const formData = new FormData();
        formData.append('file', newFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          fileUrl = uploadData.fileUrl;
          fileName = uploadData.fileName;
        } else {
          alert(uploadData.error || 'Failed to upload file');
          setCreating(false);
          return;
        }
      }

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          subject: newSubject,
          dueDate: new Date(newDueDate).toISOString(),
          fileUrl,
          fileName,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setNewFile(null);
        setModalOpen(false);
        await fetchDashboardData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create assignment');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Count ungraded submissions
  let ungradedCount = 0;
  assignments.forEach(a => {
    if (a.submissions) {
      a.submissions.forEach(sub => {
        if (!sub.grade) ungradedCount++;
      });
    }
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 animate-fade-in-up">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/60 pb-6">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-secondary font-label-md bg-secondary-container/20 px-2.5 py-1 rounded">
            Teacher Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary tracking-tight mt-2">Welcome back, {user.name}</h2>
          <p className="text-on-surface-variant font-body-md text-base mt-1">Manage your active classes and review student submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add_task</span>
            <span>Create Assignment</span>
          </button>
          <Link
            href="/live"
            className="bg-secondary-container text-on-secondary-container px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-secondary transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">videocam</span>
            <span>Start Live Session</span>
          </Link>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Submissions Section */}
          <section className="bg-surface-container-lowest border border-outline-variant/60 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
              <h3 className="text-lg font-bold text-primary font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
                <span>Student Submissions</span>
              </h3>
              <span className="text-xs font-bold bg-error-container text-on-error-container px-2.5 py-1 rounded-full">
                {ungradedCount} Pending Grade
              </span>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((item) => (
                  <div key={item.id} className="p-4 border border-outline-variant/60 rounded-xl bg-surface-container-low/40 flex justify-between items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-secondary">{item.subject}</span>
                      <h4 className="font-bold text-primary text-base">{item.title}</h4>
                      <p className="text-xs text-on-surface-variant">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Link
                      href="/assignments"
                      className="px-4 py-2 bg-primary-fixed text-on-primary-fixed text-xs font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors shrink-0"
                    >
                      Review Work ({item.submissions?.length || 0})
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm py-4">No assignments published yet.</p>
            )}
          </section>

          {/* Schedule */}
          <section className="bg-surface-container-lowest border border-outline-variant/60 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
              <h3 className="text-lg font-bold text-primary font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">calendar_today</span>
                <span>Your Teaching Schedule</span>
              </h3>
              <Link href="/schedule" className="text-xs font-bold text-primary hover:underline">Full Schedule &gt;</Link>
            </div>

            <div className="space-y-3">
              {schedule.map((item) => (
                <div key={item.id} className="p-4 border border-outline-variant/60 rounded-xl flex justify-between items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-secondary">{item.startTime} - {item.endTime}</span>
                    <h5 className="font-bold text-primary text-base">{item.subject}</h5>
                    <p className="text-xs text-on-surface-variant">{item.topic} • {item.room}</p>
                  </div>
                  <Link
                    href="/live"
                    className="px-4 py-2 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-lg hover:bg-secondary transition-colors shrink-0"
                  >
                    Launch Live Room
                  </Link>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Actions */}
        <div className="space-y-8">
          <section className="bg-surface-container-lowest border border-outline-variant/60 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-primary font-display border-b border-outline-variant/40 pb-3">
              Teacher Actions
            </h3>
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Publish New Assignment</span>
            </button>
            <Link
              href="/schedule"
              className="w-full py-3 border border-outline-variant/60 text-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-lg">event_available</span>
              <span>Manage Class Timetable</span>
            </Link>
          </section>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
              <h3 className="font-bold text-primary text-lg">Create New Assignment</h3>
              <button onClick={() => setModalOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:text-primary">close</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Subject</label>
                <select
                  className="w-full p-2.5 border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:border-primary"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>History</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Practice Set"
                  className="w-full p-2.5 border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:border-primary"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Assignment instructions..."
                  className="w-full p-2.5 border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:border-primary"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-2.5 border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:border-primary"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Attachment (Optional)</label>
                <input
                  type="file"
                  className="w-full text-xs text-on-surface-variant"
                  onChange={(e) => setNewFile(e.target.files[0] || null)}
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary-container disabled:opacity-50 transition-all mt-2"
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
