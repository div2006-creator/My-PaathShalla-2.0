'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([
    {
      id: 'class-1',
      name: 'Class 12 — Target JEE 2026',
      section: 'Section A',
      subject: 'Mathematics',
      teacher: 'Prof. Rajesh Varma',
      studentsCount: 42,
      activeLive: true,
      schedule: 'Mon, Wed, Fri (10:00 AM - 11:30 AM)',
      students: [
        { id: 's1', name: 'Aarav Mehta', email: 'aarav@paathshalla.com', attendance: '96%', score: '92%' },
        { id: 's2', name: 'Priya Sharma', email: 'priya@paathshalla.com', attendance: '92%', score: '88%' },
        { id: 's3', name: 'Rohan Gupta', email: 'rohan@paathshalla.com', attendance: '88%', score: '85%' },
        { id: 's4', name: 'Ananya Roy', email: 'ananya@paathshalla.com', attendance: '94%', score: '90%' },
      ]
    },
    {
      id: 'class-2',
      name: 'Class 11 — Physics Core',
      section: 'Section B',
      subject: 'Physics',
      teacher: 'Dr. Ananya Sharma',
      studentsCount: 38,
      activeLive: false,
      schedule: 'Tue, Thu, Sat (02:00 PM - 03:30 PM)',
      students: [
        { id: 's5', name: 'Siddharth Nair', email: 'sid@paathshalla.com', attendance: '90%', score: '84%' },
        { id: 's6', name: 'Neha Patel', email: 'neha@paathshalla.com', attendance: '95%', score: '91%' },
      ]
    },
    {
      id: 'class-3',
      name: 'Class 12 — Organic Chemistry',
      section: 'Section C',
      subject: 'Chemistry',
      teacher: 'Dr. Vikramaditya',
      studentsCount: 45,
      activeLive: false,
      schedule: 'Mon, Tue, Thu (11:30 AM - 01:00 PM)',
      students: [
        { id: 's7', name: 'Kabir Verma', email: 'kabir@paathshalla.com', attendance: '91%', score: '87%' },
      ]
    }
  ]);

  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, students, live, assignments, tests, attendance, materials, recordings, announcements, analytics
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
      teacher: 'Prof. Rajesh Varma',
      studentsCount: 0,
      activeLive: false,
      schedule: 'Mon, Wed (10:00 AM)',
      students: []
    };
    setClasses([newCls, ...classes]);
    setSelectedClass(newCls);
    setClassNameInput('');
    setCreateModalOpen(false);
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentNameInput || !studentEmailInput) return;
    const newStudent = {
      id: 'stu-' + Date.now(),
      name: studentNameInput,
      email: studentEmailInput,
      attendance: '100%',
      score: 'N/A'
    };

    const updatedCls = {
      ...selectedClass,
      studentsCount: selectedClass.studentsCount + 1,
      students: [newStudent, ...selectedClass.students]
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
      if (remaining.length > 0) setSelectedClass(remaining[0]);
    }
  };

  const handleRemoveStudent = (stuId) => {
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
                  href="/live"
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

            {/* 10-Tab Navigation Bar */}
            <div className="flex items-center overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-900 rounded-xl p-1 text-xs font-bold gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: 'dashboard' },
                { id: 'students', label: 'Students', icon: 'group' },
                { id: 'live', label: 'Live Classes', icon: 'sensors' },
                { id: 'assignments', label: 'Assignments', icon: 'assignment' },
                { id: 'tests', label: 'Tests', icon: 'quiz' },
                { id: 'attendance', label: 'Attendance', icon: 'how_to_reg' },
                { id: 'materials', label: 'Materials', icon: 'folder' },
                { id: 'recordings', label: 'Recordings', icon: 'videocam' },
                { id: 'announcements', label: 'Announcements', icon: 'campaign' },
                { id: 'analytics', label: 'Analytics', icon: 'analytics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENT AREAS */}
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Enrolled Students</span>
                  <p className="text-2xl font-black text-white">{selectedClass.studentsCount}</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Class Attendance</span>
                  <p className="text-2xl font-black text-emerald-400">94% Average</p>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Published Coursework</span>
                  <p className="text-2xl font-black text-amber-400">8 Modules</p>
                </div>
              </div>
            )}

            {/* TAB 2: STUDENTS MANAGEMENT */}
            {activeTab === 'students' && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">Enrolled Student Directory</h3>
                  <button
                    onClick={() => setAddStudentModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400"
                  >
                    + Add Student
                  </button>
                </div>

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
                        <span className="text-amber-400">Avg: {stu.score}</span>
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
              </div>
            )}

            {/* OTHER TABS QUICK VIEW */}
            {['live', 'assignments', 'tests', 'attendance', 'materials', 'recordings', 'announcements', 'analytics'].includes(activeTab) && (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-indigo-400">inventory_2</span>
                <h4 className="font-bold text-white text-base capitalize">{activeTab} Module Hub</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Access live sessions, grade coursework, track attendance, or review analytics specifically scoped to {selectedClass.name}.
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400">
            Select a class from the left sidebar to view details.
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
                  placeholder="e.g. Class 12 — Advanced Physics"
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
