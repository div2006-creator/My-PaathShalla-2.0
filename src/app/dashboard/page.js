'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return user.role === 'TEACHER' ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />;
}

// ================= STUDENT DASHBOARD =================
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
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.submissions && a.submissions.length > 0);
  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments.length / totalAssignments) * 100) : 0;
  
  // Find first pending assignment
  const pendingAssignment = assignments.find(a => !a.submissions || a.submissions.length === 0);

  // Find if there is any class currently marked as active live classroom
  const liveClass = schedule.find(c => c.room === 'Live Class (Active)');
  const upcomingClasses = schedule.filter(c => c.id !== liveClass?.id);

  return (
    <div className="px-container-margin pt-stack-lg space-y-stack-lg animate-fade-in-up">
      
      {/* Welcome Message */}
      <section className="space-y-1">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">Namaste, {user.name.split(' ')[0]}!</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Ready for your learning session today?</p>
      </section>

      {/* Today's Live Class */}
      {liveClass && (
        <section className="space-y-stack-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-title-lg text-title-lg text-primary font-bold">Today's Live Classes</h3>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-700 rounded-full"></span> Live
            </span>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-primary-container p-stack-md text-white card-shadow">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-on-primary-container opacity-20 rounded-full blur-2xl"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-widest">{liveClass.subject}</span>
                  <h4 className="font-headline-md text-[20px] font-bold leading-tight">{liveClass.topic}</h4>
                  <p className="font-body-md text-body-md opacity-80 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    {liveClass.teacherName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-label-md font-label-md bg-white/10 px-3 py-1.5 rounded-lg w-fit">
                <span className="material-symbols-outlined text-[16px]">videocam</span>
                <span>WebRTC Class Connection Active</span>
              </div>
              <Link 
                href="/live" 
                className="w-full py-3 bg-secondary-container text-on-secondary-container font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:scale-[0.99] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">play_circle</span>
                Join Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Schedule */}
      <section className="space-y-stack-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg text-primary font-bold">Upcoming Schedule</h3>
          <Link href="/schedule" className="text-primary font-label-md text-label-md hover:underline">View All</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-container-margin px-container-margin">
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map((item) => (
              <div key={item.id} className="min-w-[200px] bg-white border border-outline-variant p-4 rounded-xl space-y-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-secondary font-bold">{item.startTime}</p>
                  <h5 className="font-body-lg font-semibold text-on-surface truncate">{item.subject}</h5>
                  <p className="text-label-md text-on-surface-variant truncate">{item.topic}</p>
                </div>
                <div className="pt-2 border-t border-dashed border-outline-variant text-[11px] text-on-surface-variant">
                  {item.room} • {item.teacherName}
                </div>
              </div>
            ))
          ) : (
            <p className="text-on-surface-variant text-body-md">No more classes scheduled for today.</p>
          )}
        </div>
      </section>

      {/* Pending Assignments progress */}
      <section className="space-y-stack-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg text-primary font-bold">Pending Assignments</h3>
          <Link href="/assignments" className="text-primary font-label-md text-label-md hover:underline">View List</Link>
        </div>
        {pendingAssignment ? (
          <div className="bg-white p-stack-md rounded-xl border border-outline-variant card-shadow space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">assignment</span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-body-lg font-bold text-on-surface truncate">{pendingAssignment.title}</h4>
                  <span className="font-label-md text-label-md text-error bg-error-container/20 px-2 py-0.5 rounded shrink-0">
                    Due soon
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant truncate">{pendingAssignment.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-label-md font-label-md">
                <span className="text-on-surface-variant">Your completion rate</span>
                <span className="text-secondary font-bold">{completionRate}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container rounded-full transition-all duration-300" style={{ width: `${completionRate}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-outline-variant text-center card-shadow">
            <span className="material-symbols-outlined text-4xl text-green-600 mb-2">check_circle</span>
            <p className="font-body-lg font-bold text-on-surface">All caught up!</p>
            <p className="text-on-surface-variant text-body-md">No pending assignments left.</p>
          </div>
        )}
      </section>

      {/* Quick Access to Recent Recordings */}
      <section className="space-y-stack-sm pb-8">
        <h3 class="font-title-lg text-title-lg text-primary font-bold">Quick Access</h3>
        <div className="grid grid-cols-2 gap-4">
          {recordings.slice(0, 2).map((video) => (
            <div 
              key={video.id} 
              onClick={() => setSelectedVideo(video)}
              className="group relative aspect-video rounded-xl overflow-hidden border border-outline-variant bg-surface-container cursor-pointer shadow-sm"
            >
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={video.title} src={video.thumbnailUrl} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <p className="text-[10px] uppercase font-bold text-secondary-fixed-dim">{video.subject}</p>
                <p className="font-label-md truncate">{video.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
              <h3 className="font-title-lg text-primary font-bold truncate">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>
            <video className="w-full aspect-video" controls autoPlay src={selectedVideo.videoUrl} />
            <div className="p-4 bg-surface-container-low text-body-md text-on-surface">
              <p className="font-bold">{selectedVideo.instructorName}</p>
              <p className="text-on-surface-variant text-[12px]">{selectedVideo.subject} • Duration: {selectedVideo.duration}</p>
            </div>
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
  const [modalOpen, setModalOpen] = useState(false);

  // New Assignment fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newDueDate, setNewDueDate] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [creating, setCreating] = useState(false);
  // Tool Modals
  const [quizMakerOpen, setQuizMakerOpen] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [rubricOpen, setRubricOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  // Attendance States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [todayAttendanceCount, setTodayAttendanceCount] = useState(0);
  const [attendanceFilterDate, setAttendanceFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Quiz Maker States
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correct: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const updateQuestionText = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const updateCorrectOption = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].correct = parseInt(value);
    setQuestions(updated);
  };

  const handlePublishQuiz = (e) => {
    e.preventDefault();
    alert(`Success: "${quizTitle}" with ${questions.length} questions has been published! Students will receive a push notification.`);
    setQuizTitle('');
    setQuestions([{ text: '', options: ['', '', '', ''], correct: 0 }]);
    setQuizMakerOpen(false);
  };

  // Curriculum States
  const [curriculum, setCurriculum] = useState({
    Mathematics: [
      { id: 1, topic: 'Limits & Continuity', done: true },
      { id: 2, topic: 'Derivatives & Integration', done: false },
      { id: 3, topic: 'Differential Equations', done: false }
    ],
    Physics: [
      { id: 4, topic: 'Newtonian Mechanics', done: true },
      { id: 5, topic: 'Electrostatics', done: false },
      { id: 6, topic: 'Wave Optics', done: false }
    ],
    Chemistry: [
      { id: 7, topic: 'Chemical Kinetics', done: true },
      { id: 8, topic: 'Thermodynamics', done: false },
      { id: 9, topic: 'Electrochemistry', done: false }
    ]
  });
  const [newTopicName, setNewTopicName] = useState('');
  const [curriculumSubject, setCurriculumSubject] = useState('Mathematics');

  const toggleCurriculumTopic = (subj, id) => {
    const updated = { ...curriculum };
    updated[subj] = updated[subj].map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    );
    setCurriculum(updated);
  };

  const handleAddCurriculumTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    const updated = { ...curriculum };
    updated[curriculumSubject].push({
      id: Date.now(),
      topic: newTopicName,
      done: false
    });
    setCurriculum(updated);
    setNewTopicName('');
  };

  // Rubric States
  const [rubricScores, setRubricScores] = useState({
    content: 4,
    structure: 3,
    effort: 4
  });

  const updateRubricScore = (criteria, score) => {
    setRubricScores({ ...rubricScores, [criteria]: score });
  };

  const totalRubricScore = rubricScores.content + rubricScores.structure + rubricScores.effort;

  const fetchDashboardData = async () => {
    try {
      const [schedRes, assignRes, attRes] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/assignments'),
        fetch(`/api/attendance?date=${new Date().toISOString().split('T')[0]}`),
      ]);
      const schedData = await schedRes.json();
      const assignData = await assignRes.json();
      const attData = await attRes.json();

      setSchedule(schedData.schedule || []);
      setAssignments(assignData.assignments || []);
      setTodayAttendanceCount((attData.attendanceRecords || []).length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const q = new URLSearchParams();
      if (attendanceFilterDate) q.set('date', attendanceFilterDate);
      if (attendanceSearch) q.set('search', attendanceSearch);
      const res = await fetch(`/api/attendance?${q.toString()}`);
      const data = await res.json();
      setAttendanceRecords(data.attendanceRecords || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (attendanceOpen) {
      fetchAttendance();
    }
  }, [attendanceOpen, attendanceFilterDate, attendanceSearch]);

  const handleUpdateAttendanceStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setAttendanceRecords((prev) =>
          prev.map((rec) => (rec.id === id ? { ...rec, status: newStatus } : rec))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteClass = async (e, id) => {
    e.stopPropagation();
    setSchedule((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete scheduled class:', err);
    }
  };

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
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Count ungraded submissions
  let ungradedCount = 0;
  let ungradedSubmissions = [];
  assignments.forEach(a => {
    if (a.submissions) {
      a.submissions.forEach(sub => {
        if (!sub.grade) {
          ungradedCount++;
          ungradedSubmissions.push(sub);
        }
      });
    }
  });

  // Filter Wednesday schedule for teacher
  const teacherWedClasses = schedule.filter(s => s.dayOfWeek === 'Wed');

  return (
    <div className="px-container-margin pt-stack-md flex flex-col gap-stack-lg animate-fade-in-up">
      
      {/* Welcome Header */}
      <section className="flex flex-col gap-stack-sm">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-on-surface-variant tracking-wider font-bold">NAMASTE, TEACHER</span>
          <h2 className="font-headline-md text-primary font-bold">Welcome back, {user.name.split(' ')[0]}</h2>
        </div>
        <Link 
          href="/live" 
          className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-200 card-shadow text-center font-bold"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
          <span className="font-title-lg text-title-lg">Start Live Class</span>
        </Link>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-2 gap-stack-md">
        
        {/* Student Submissions */}
        <div className="col-span-2 bg-surface-container-lowest p-stack-md rounded-xl card-shadow flex flex-col gap-stack-sm relative overflow-hidden paper-layer">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h3 className="font-title-lg text-title-lg text-primary font-bold">Submissions</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{ungradedCount} pending reviews</p>
            </div>
            {ungradedCount > 0 && (
              <div className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-md text-label-md font-bold animate-pulse shrink-0">
                {ungradedCount} NEW
              </div>
            )}
          </div>
          <div className="flex -space-x-3 mt-2 overflow-hidden">
            {ungradedSubmissions.slice(0, 4).map((sub, i) => (
              <div 
                key={sub.id} 
                className={`w-8 h-8 rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-white ${
                  i % 3 === 0 ? 'bg-primary-container' : i % 3 === 1 ? 'bg-secondary' : 'bg-surface-tint'
                }`}
              >
                {sub.student.name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
            {ungradedSubmissions.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                +{ungradedSubmissions.length - 4}
              </div>
            )}
          </div>
          <Link href="/assignments" className="mt-2 text-primary font-label-md text-label-md flex items-center gap-1 hover:underline font-bold">
            View ungraded work <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-primary transform rotate-12">assignment</span>
          </div>
        </div>

        {/* Create Assignment button */}
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-primary text-on-primary p-stack-md rounded-xl card-shadow flex flex-col justify-between aspect-square active:scale-[0.98] transition-all hover:brightness-110 text-left"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          <div>
            <h4 className="font-title-lg text-title-lg font-bold">Create Assignment</h4>
            <p className="text-primary-fixed text-[12px] opacity-80">Quick draft</p>
          </div>
        </button>

        {/* Automatic Attendance System Button */}
        <button 
          onClick={() => setAttendanceOpen(true)}
          className="bg-secondary-container text-on-secondary-container p-stack-md rounded-xl card-shadow flex flex-col justify-between aspect-square active:scale-[0.98] transition-all hover:brightness-105 text-left border border-secondary/20 relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-3xl text-primary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">LIVE DB</span>
          </div>
          <div>
            <h4 className="font-title-lg text-title-lg font-bold text-primary">Attendance</h4>
            <p className="font-body-md text-[12px] text-on-surface-variant font-medium mt-0.5">
              Today: <strong className="text-primary font-bold">{todayAttendanceCount} Logged</strong>
            </p>
          </div>
        </button>

        {/* Performance insights (Dynamic stats) */}
        <div className="bg-surface-container-high p-stack-md rounded-xl card-shadow flex flex-col justify-between aspect-square">
          <span className="material-symbols-outlined text-3xl text-primary">trending_up</span>
          <div>
            <h4 className="font-title-lg text-title-lg text-primary font-bold">Insights</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">Ungraded: {ungradedCount}</p>
          </div>
        </div>

      </section>

      {/* Schedule */}
      <section className="flex flex-col gap-stack-md">
        <div className="flex justify-between items-end">
          <h3 className="font-headline-md text-headline-md text-primary font-bold">Upcoming Sessions</h3>
          <Link href="/schedule" className="font-label-md text-label-md text-primary-container font-bold hover:underline">View Calendar</Link>
        </div>
        <div className="flex flex-col gap-stack-sm">
          {teacherWedClasses.length > 0 ? (
            teacherWedClasses.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <div className="dotted-line my-2"></div>}
                <div className="bg-surface-container-lowest p-stack-md rounded-xl card-shadow flex gap-stack-md items-center paper-layer">
                  <div className="flex flex-col items-center justify-center min-w-[60px] py-2 bg-primary-fixed rounded-lg text-on-primary-fixed shrink-0">
                    <span className="font-label-md text-label-md font-bold">{item.startTime.split(' ')[0]}</span>
                    <span className="font-headline-md-mobile text-[14px] font-bold">{item.startTime.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-title-lg text-title-lg text-primary font-bold truncate">{item.subject}</h4>
                      <button 
                        onClick={(e) => handleDeleteClass(e, item.id)} 
                        title="Remove Class"
                        className="p-1 rounded text-error hover:bg-error-container/30 transition-colors z-20"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <p className="text-on-surface-variant text-[12px] truncate">{item.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold">Grade 10</span>
                      <span className="text-on-surface-variant text-[12px] flex items-center gap-1 font-bold">
                        <span className="material-symbols-outlined text-sm">group</span> {item.room}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <p className="text-on-surface-variant text-body-md">No classes scheduled for today.</p>
          )}
        </div>
      </section>

      {/* Chalkboard note */}
      <section className="chalkboard-texture p-stack-md rounded-2xl text-on-primary-container relative overflow-hidden card-shadow">
        <div className="relative z-10 flex flex-col gap-stack-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-primary-container">edit_note</span>
            <span className="font-label-md text-label-md uppercase tracking-widest opacity-80 font-bold">Teacher's Note</span>
          </div>
          <p className="font-display-lg-mobile text-[16px] italic opacity-90 leading-relaxed">
            "The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires."
          </p>
          <span className="font-label-md text-label-md self-end opacity-75">— William Arthur Ward</span>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]"></div>
      </section>

      {/* Quick Tools */}
      <section className="flex flex-col gap-stack-md pb-8">
        <h3 className="font-headline-md text-headline-md text-primary font-bold">Teaching Tools</h3>
        <div className="flex gap-stack-md overflow-x-auto pb-4 -mx-container-margin px-container-margin no-scrollbar">
          <div 
            onClick={() => setQuizMakerOpen(true)}
            className="min-w-[140px] bg-surface-container-lowest p-stack-md rounded-xl card-shadow border-b-4 border-secondary flex flex-col gap-3 paper-layer cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-fixed-dim flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined">quiz</span>
            </div>
            <span className="font-title-lg text-[16px] text-primary font-bold">Quiz Maker</span>
          </div>
          <div 
            onClick={() => setCurriculumOpen(true)}
            className="min-w-[140px] bg-surface-container-lowest p-stack-md rounded-xl card-shadow border-b-4 border-primary flex flex-col gap-3 paper-layer cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              <span className="material-symbols-outlined">library_books</span>
            </div>
            <span className="font-title-lg text-[16px] text-primary font-bold">Curriculum</span>
          </div>
          <div 
            onClick={() => setRubricOpen(true)}
            className="min-w-[140px] bg-surface-container-lowest p-stack-md rounded-xl card-shadow border-b-4 border-error flex flex-col gap-3 paper-layer cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
              <span className="material-symbols-outlined">grade</span>
            </div>
            <span className="font-title-lg text-[16px] text-primary font-bold">Grading Rubric</span>
          </div>
        </div>
      </section>

      {/* Quick Assignment Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-3 sm:p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative paper-layer max-h-[85vh] sm:max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant/30 shrink-0">
              <h3 className="font-title-lg text-primary font-bold">Create New Assignment</h3>
              <button onClick={() => setModalOpen(false)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-grow">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Subject</label>
                <select 
                  className="w-full px-2.5 py-1.5 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-[13px]"
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
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Integral Calculus Basics"
                  className="w-full px-2.5 py-1.5 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-[13px]"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Description</label>
                <textarea 
                  required
                  rows="2"
                  placeholder="Describe the homework details..."
                  className="w-full px-2.5 py-1.5 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-[13px]"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Due Date</label>
                <input 
                  type="datetime-local" 
                  required
                  className="w-full px-2.5 py-1.5 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-[13px]"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Attach File (Optional)</label>
                <input 
                  type="file" 
                  className="w-full p-1 border border-outline-variant rounded-lg bg-transparent text-[12px] focus:outline-none focus:border-primary"
                  onChange={(e) => setNewFile(e.target.files[0] || null)}
                />
              </div>
              <button 
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-primary text-on-primary font-bold text-[14px] rounded-xl active:scale-95 transition-transform disabled:opacity-50 mt-1"
              >
                {creating ? 'Publishing & Uploading...' : 'Publish Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. Quiz Maker Modal */}
      {quizMakerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative paper-layer max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center shrink-0">
              <h3 className="font-title-lg text-primary font-bold">Quiz Maker</h3>
              <button onClick={() => setQuizMakerOpen(false)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>
            
            <form onSubmit={handlePublishQuiz} className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-1">Quiz Subject</label>
                <select 
                  className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>History</option>
                  <option>English</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-1">Quiz Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Quantum Mechanics Quiz 1"
                  className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              <div className="dotted-line my-4"></div>

              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-surface-container-low p-4 rounded-xl space-y-3 relative border border-outline-variant/20">
                    <span className="absolute top-2 right-3 font-bold text-label-md text-primary">Q{qIdx + 1}</span>
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">Question Text</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Type question here..."
                        className="w-full p-2 border border-outline-variant rounded-lg bg-white focus:outline-none focus:border-primary text-body-md"
                        value={q.text}
                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>
                          <label className="block text-[10px] text-on-surface-variant mb-0.5">Option {oIdx + 1}</label>
                          <input 
                            type="text" 
                            required
                            placeholder={`Option ${oIdx + 1}`}
                            className="w-full p-1.5 border border-outline-variant rounded-lg bg-white focus:outline-none focus:border-primary text-[12px]"
                            value={opt}
                            onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">Correct Option</label>
                      <select
                        className="w-full p-2 border border-outline-variant rounded-lg bg-white text-[12px] focus:outline-none"
                        value={q.correct}
                        onChange={(e) => updateCorrectOption(qIdx, e.target.value)}
                      >
                        <option value={0}>Option 1</option>
                        <option value={1}>Option 2</option>
                        <option value={2}>Option 3</option>
                        <option value={3}>Option 4</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button"
                onClick={addQuestion}
                className="w-full py-2 bg-secondary-container text-on-secondary-container font-bold rounded-xl border border-secondary/20 hover:bg-secondary/15 transition-all text-center flex items-center justify-center gap-1 text-label-md"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add Question
              </button>

              <button 
                type="submit"
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform mt-4"
              >
                Publish Quiz
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Curriculum Modal */}
      {curriculumOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative paper-layer max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center shrink-0">
              <h3 className="font-title-lg text-primary font-bold">Curriculum Manager</h3>
              <button onClick={() => setCurriculumOpen(false)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-6">
              {Object.keys(curriculum).map((subj) => (
                <div key={subj} className="space-y-2">
                  <h4 className="font-title-lg text-primary font-bold border-b border-outline-variant/30 pb-1">{subj}</h4>
                  <div className="space-y-1">
                    {curriculum[subj].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                        <span className={`text-body-md ${item.done ? 'line-through text-outline' : 'text-on-surface'}`}>{item.topic}</span>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-secondary rounded border-outline-variant focus:ring-0 cursor-pointer"
                          checked={item.done}
                          onChange={() => toggleCurriculumTopic(subj, item.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="dotted-line my-4"></div>

              {/* Add Topic Form */}
              <form onSubmit={handleAddCurriculumTopic} className="space-y-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <h5 className="font-label-md font-bold text-primary uppercase tracking-wider">Add Custom Topic</h5>
                <div>
                  <label className="block text-[10px] text-on-surface-variant mb-1">Select Subject</label>
                  <select 
                    className="w-full p-2 border border-outline-variant rounded-lg bg-white text-[12px] focus:outline-none"
                    value={curriculumSubject}
                    onChange={(e) => setCurriculumSubject(e.target.value)}
                  >
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant mb-1">Topic Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Wave Particle Duality"
                    className="w-full p-2 border border-outline-variant rounded-lg bg-white text-[12px] focus:outline-none"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-primary text-on-primary text-[12px] font-bold rounded-lg active:scale-95 transition-transform">
                  Add Topic
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. Grading Rubric Modal */}
      {rubricOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative paper-layer">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center shrink-0">
              <h3 className="font-title-lg text-primary font-bold">Grading Rubric Calculator</h3>
              <button onClick={() => setRubricOpen(false)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                
                {/* Content Accuracy */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md font-bold text-on-surface">Content & Accuracy</span>
                    <span className="text-secondary font-bold text-label-md">{rubricScores.content} / 4</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateRubricScore('content', score)}
                        className={`flex-1 py-1.5 rounded-lg text-label-md font-bold transition-all ${
                          rubricScores.content === score 
                            ? 'bg-primary text-white scale-105 shadow' 
                            : 'bg-surface-container text-on-surface-variant hover:bg-outline-variant/30'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Structure */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md font-bold text-on-surface">Structure & Presentation</span>
                    <span className="text-secondary font-bold text-label-md">{rubricScores.structure} / 4</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateRubricScore('structure', score)}
                        className={`flex-1 py-1.5 rounded-lg text-label-md font-bold transition-all ${
                          rubricScores.structure === score 
                            ? 'bg-primary text-white scale-105 shadow' 
                            : 'bg-surface-container text-on-surface-variant hover:bg-outline-variant/30'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Effort */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md font-bold text-on-surface">Detail & Effort</span>
                    <span className="text-secondary font-bold text-label-md">{rubricScores.effort} / 4</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateRubricScore('effort', score)}
                        className={`flex-1 py-1.5 rounded-lg text-label-md font-bold transition-all ${
                          rubricScores.effort === score 
                            ? 'bg-primary text-white scale-105 shadow' 
                            : 'bg-surface-container text-on-surface-variant hover:bg-outline-variant/30'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Total Summary */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
                <div>
                  <h4 className="font-title-lg text-primary font-bold">Total Rubric Score</h4>
                  <p className="text-[12px] text-on-surface-variant">Click scores to calculate totals</p>
                </div>
                <div className="text-right">
                  <span className="font-headline-md text-secondary font-bold">{totalRubricScore}</span>
                  <span className="text-outline text-title-lg font-bold"> / 12</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  alert(`Rubric calculation complete: ${totalRubricScore}/12. Copied to assignment feedback!`);
                  setRubricOpen(false);
                }}
                className="w-full py-3 bg-secondary text-white font-bold rounded-xl active:scale-95 transition-transform"
              >
                Apply Rubric
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= AUTOMATIC ATTENDANCE SYSTEM MODAL ================= */}
      {attendanceOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] animate-fade-in-up overflow-hidden">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-primary text-on-primary flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary font-bold text-2xl">how_to_reg</span>
                <div>
                  <h3 className="font-title-lg text-title-lg font-bold text-white">Automatic Attendance System</h3>
                  <p className="text-white/80 text-[11px]">Real-time Database Logged Attendance</p>
                </div>
              </div>
              <button 
                onClick={() => setAttendanceOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Filter Controls */}
            <div className="p-3 sm:p-4 bg-surface-container-low border-b border-outline-variant/20 flex flex-wrap gap-3 items-center justify-between shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="material-symbols-outlined text-outline text-sm">search</span>
                <input 
                  type="text" 
                  placeholder="Search student name or email..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[13px] text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[12px] font-bold text-on-surface-variant">Date:</label>
                <input 
                  type="date"
                  value={attendanceFilterDate}
                  onChange={(e) => setAttendanceFilterDate(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[13px] font-bold text-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Records List */}
            <div className="p-4 overflow-y-auto flex-grow space-y-3">
              {loadingAttendance ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : attendanceRecords.length > 0 ? (
                <div className="space-y-2">
                  {attendanceRecords.map((rec) => (
                    <div 
                      key={rec.id}
                      className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-[12px] font-bold text-primary shrink-0">
                          {rec.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-title-lg text-[14px] text-primary font-bold leading-tight">{rec.studentName}</h4>
                          <p className="text-[11px] text-on-surface-variant">{rec.studentEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] uppercase tracking-wider text-outline font-bold block">{rec.className}</span>
                          <span className="text-[11px] text-on-surface font-bold">
                            Join: {new Date(rec.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Status badge toggles */}
                        <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
                          <button 
                            type="button"
                            onClick={() => handleUpdateAttendanceStatus(rec.id, 'PRESENT')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              rec.status === 'PRESENT' 
                                ? 'bg-green-600 text-white shadow' 
                                : 'bg-surface-container text-on-surface-variant hover:bg-outline-variant/20'
                            }`}
                          >
                            PRESENT
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleUpdateAttendanceStatus(rec.id, 'LATE')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              rec.status === 'LATE' 
                                ? 'bg-amber-500 text-white shadow' 
                                : 'bg-surface-container text-on-surface-variant hover:bg-outline-variant/20'
                            }`}
                          >
                            LATE
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleUpdateAttendanceStatus(rec.id, 'ABSENT')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              rec.status === 'ABSENT' 
                                ? 'bg-red-600 text-white shadow' 
                                : 'bg-surface-container text-on-surface-variant hover:bg-outline-variant/20'
                            }`}
                          >
                            ABSENT
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">find_in_page</span>
                  <p className="font-body-md text-[14px]">No attendance records found for {attendanceFilterDate}.</p>
                  <p className="text-[12px] opacity-70 mt-1">Attendance is logged automatically when students join live class sessions.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-surface-container-low border-t border-outline-variant/20 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-on-surface-variant font-bold">
                Total Records: {attendanceRecords.length}
              </span>
              <button 
                type="button"
                onClick={() => setAttendanceOpen(false)}
                className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-[12px] font-bold active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
