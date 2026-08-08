'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'live' | 'recordings' | 'assignments' | 'attendance'
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);

  // Form states
  const [classNameInput, setClassNameInput] = useState('');
  const [sectionInput, setSectionInput] = useState('Section A');
  const [subjectInput, setSubjectInput] = useState('Mathematics');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');

  const handleCreateClass = (e) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;
    const newCls = {
      id: 'class-' + Date.now(),
      name: classNameInput,
      section: sectionInput,
      subject: subjectInput,
      teacher: 'Faculty Instructor',
      studentsCount: 0,
      activeLive: false,
      schedule: 'Scheduled Session',
      students: []
    };
    const updated = [newCls, ...classes];
    setClasses(updated);
    setSelectedClass(newCls);
    setClassNameInput('');
    setCreateModalOpen(false);
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentNameInput || !studentEmailInput || !selectedClass) return;
    const newStudent = {
      id: 'stu-' + Date.now(),
      name: studentNameInput,
      email: studentEmailInput,
      attendance: '100%',
      score: 'N/A'
    };

    const updatedCls = {
      ...selectedClass,
      studentsCount: (selectedClass.studentsCount || 0) + 1,
      students: [newStudent, ...(selectedClass.students || [])]
    };

    setSelectedClass(updatedCls);
    setClasses(classes.map(c => c.id === updatedCls.id ? updatedCls : c));
    setStudentNameInput('');
    setStudentEmailInput('');
    setAddStudentModalOpen(false);
  };

  const handleDeleteClass = (id) => {
    if (confirm('Are you sure you want to delete this class?')) {
      const remaining = classes.filter(c => c.id !== id);
      setClasses(remaining);
      setSelectedClass(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleRemoveStudent = (stuId) => {
    if (!selectedClass) return;
    const updatedStudents = selectedClass.students.filter(s => s.id !== stuId);
    const updatedCls = {
      ...selectedClass,
      studentsCount: updatedStudents.length,
      students: updatedStudents
    };
    setSelectedClass(updatedCls);
    setClasses(classes.map(c => c.id === updatedCls.id ? updatedCls : c));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30">
            Classroom Operations
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Class Management Hub</h1>
          <p className="text-xs text-slate-400">Manage sections, enrolled students, live sessions, and class materials</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Create New Class</span>
        </button>
      </div>

      {/* Main Classroom Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Class Selector Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Active Classes</h3>
          {classes.length > 0 ? (
            <div className="space-y-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full p-4 rounded-xl text-left border transition-all space-y-1.5 ${
                    selectedClass?.id === cls.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase text-amber-400">{cls.subject}</span>
                    {cls.activeLive && (
                      <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[9px] font-extrabold animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white truncate">{cls.name}</h4>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>{cls.section}</span>
                    <span>{cls.studentsCount} Students</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
              No classes created yet.
            </div>
          )}
        </div>

        {/* Selected Class Detail Stage */}
        {selectedClass ? (
          <div className="lg:col-span-3 space-y-6">
            
            {/* Class Banner Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-xs font-bold border border-indigo-500/30">
                    {selectedClass.subject} • {selectedClass.section}
                  </span>
                  <span className="text-xs text-slate-400">{selectedClass.schedule}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white font-display mt-2">{selectedClass.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Assigned Instructor: <strong className="text-slate-200">{selectedClass.teacher}</strong></p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/live?room=${selectedClass.id}&subject=${encodeURIComponent(selectedClass.subject)}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">sensors</span> Start Live Class
                </Link>
                <button
                  onClick={() => handleDeleteClass(selectedClass.id)}
                  className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-slate-700 transition-colors"
                  title="Delete Class"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>

            {/* 5 Core Tabs Navigation Bar */}
            <div className="grid grid-cols-5 border-b border-slate-800 bg-slate-900 rounded-xl p-1 text-xs font-bold gap-1 text-center">
              {[
                { id: 'overview', label: 'Overview', icon: 'dashboard' },
                { id: 'live', label: 'Live Class', icon: 'sensors' },
                { id: 'recordings', label: 'Recordings', icon: 'videocam' },
                { id: 'assignments', label: 'Assignments', icon: 'assignment' },
                { id: 'attendance', label: 'Attendance', icon: 'how_to_reg' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT AREAS */}
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Enrolled Students</span>
                    <p className="text-2xl font-black text-white">{selectedClass.studentsCount || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Class Section</span>
                    <p className="text-2xl font-black text-indigo-400">{selectedClass.section}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Subject</span>
                    <p className="text-2xl font-black text-amber-400">{selectedClass.subject}</p>
                  </div>
                </div>

                {/* Enrolled Students Directory */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm">Enrolled Students ({selectedClass.students ? selectedClass.students.length : 0})</h3>
                    <button
                      onClick={() => setAddStudentModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400"
                    >
                      + Enroll Student
                    </button>
                  </div>

                  {selectedClass.students && selectedClass.students.length > 0 ? (
                    <div className="space-y-2">
                      {selectedClass.students.map((stu) => (
                        <div key={stu.id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {stu.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{stu.name}</p>
                              <span className="text-[10px] text-slate-400">{stu.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold">
                            <span className="text-emerald-400">Att: {stu.attendance}</span>
                            <button
                              onClick={() => handleRemoveStudent(stu.id)}
                              className="text-slate-400 hover:text-red-400 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs space-y-2">
                      <p>No students enrolled in this class yet.</p>
                      <button
                        onClick={() => setAddStudentModalOpen(true)}
                        className="px-3.5 py-1.5 bg-amber-500 text-black font-extrabold rounded-xl"
                      >
                        Enroll First Student
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LIVE CLASS */}
            {activeTab === 'live' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4">
                <span className="material-symbols-outlined text-red-500 text-5xl animate-pulse">sensors</span>
                <h3 className="text-xl font-bold text-white font-display">Live Teaching Stage</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Launch the WebRTC LiveKit classroom stage for {selectedClass.name}. Enable screen sharing, digital whiteboard, and live attendance tracking.
                </p>
                <Link
                  href={`/live?room=${selectedClass.id}&subject=${encodeURIComponent(selectedClass.subject)}`}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">sensors</span> Start Live Classroom Now
                </Link>
              </div>
            )}

            {/* TAB 3: RECORDINGS */}
            {activeTab === 'recordings' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4">
                <span className="material-symbols-outlined text-indigo-400 text-5xl">videocam</span>
                <h3 className="text-xl font-bold text-white font-display">Class Lecture Recordings</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Access all recorded live classroom sessions and attached lecture PDFs for {selectedClass.name}.
                </p>
                <Link
                  href="/recordings"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">play_circle</span> Open Recordings Archive
                </Link>
              </div>
            )}

            {/* TAB 4: ASSIGNMENTS */}
            {activeTab === 'assignments' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4">
                <span className="material-symbols-outlined text-amber-400 text-5xl">assignment</span>
                <h3 className="text-xl font-bold text-white font-display">Class Assignments & Homework</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Create coursework, inspect student submissions, and grade assignments for {selectedClass.name}.
                </p>
                <Link
                  href="/assignments"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add_task</span> Open Assignments Portal
                </Link>
              </div>
            )}

            {/* TAB 5: ATTENDANCE */}
            {activeTab === 'attendance' && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4">
                <span className="material-symbols-outlined text-emerald-400 text-5xl">how_to_reg</span>
                <h3 className="text-xl font-bold text-white font-display">Class Attendance Tracker</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Review automated join/leave timestamps and attendance status for {selectedClass.name}.
                </p>
                <Link
                  href="/teacher/attendance"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">fact_check</span> View Attendance Logs
                </Link>
              </div>
            )}

          </div>
        ) : (
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center space-y-3">
            <span className="material-symbols-outlined text-slate-600 text-5xl">class</span>
            <h3 className="text-lg font-bold text-white">No classes created yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Create your first digital classroom section to begin teaching, scheduling live sessions, and assigning coursework.</p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md"
            >
              Create Class Now
            </button>
          </div>
        )}

      </div>

      {/* Create Class Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-base">Create New Class</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 12 — Mathematics"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    value={sectionInput}
                    onChange={(e) => setSectionInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Subject</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                  >
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Computer Science</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 mt-2"
              >
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-base">Enroll Student to Class</h3>
              <button onClick={() => setAddStudentModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singh"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@paathshalla.com"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={studentEmailInput}
                  onChange={(e) => setStudentEmailInput(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 mt-2"
              >
                Enroll Student
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
