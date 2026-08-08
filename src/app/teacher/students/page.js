'use client';

import React, { useState } from 'react';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([
    {
      id: 'stu-1',
      name: 'Aarav Mehta',
      email: 'aarav@paathshalla.com',
      class: 'Class 12 — Target JEE 2026',
      section: 'Section A',
      attendance: '96%',
      testScore: '92%',
      assignmentsSubmitted: '8/8',
      lastActive: '5 mins ago',
      doubtsSubmitted: 4,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'Top Performer'
    },
    {
      id: 'stu-2',
      name: 'Priya Sharma',
      email: 'priya@paathshalla.com',
      class: 'Class 12 — Target JEE 2026',
      section: 'Section A',
      attendance: '92%',
      testScore: '88%',
      assignmentsSubmitted: '7/8',
      lastActive: '1 hour ago',
      doubtsSubmitted: 2,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'Good Progress'
    },
    {
      id: 'stu-3',
      name: 'Rohan Gupta',
      email: 'rohan@paathshalla.com',
      class: 'Class 11 — Physics Core',
      section: 'Section B',
      attendance: '82%',
      testScore: '75%',
      assignmentsSubmitted: '5/8',
      lastActive: 'Yesterday',
      doubtsSubmitted: 6,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'Needs Support'
    },
    {
      id: 'stu-4',
      name: 'Ananya Roy',
      email: 'ananya@paathshalla.com',
      class: 'Class 12 — Target JEE 2026',
      section: 'Section A',
      attendance: '94%',
      testScore: '90%',
      assignmentsSubmitted: '8/8',
      lastActive: '10 mins ago',
      doubtsSubmitted: 1,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      status: 'Top Performer'
    }
  ]);

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMsgSent(true);
    setTimeout(() => {
      setMessageText('');
      setMsgSent(false);
      alert(`Direct message sent to ${selectedStudent.name}!`);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30">
            Student Management & Performance
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Student Roster & Profiles</h1>
          <p className="text-xs text-slate-400">Track individual student attendance, test accuracy, pending work, and send direct messages</p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by student name or email..."
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Cards List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredStudents.map((stu) => (
            <div
              key={stu.id}
              onClick={() => setSelectedStudent(stu)}
              className={`p-4 bg-slate-900 border rounded-2xl cursor-pointer transition-all space-y-3 ${
                selectedStudent?.id === stu.id
                  ? 'border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full border border-slate-700 object-cover" alt={stu.name} src={stu.avatar} />
                  <div>
                    <h4 className="font-bold text-white text-sm">{stu.name}</h4>
                    <p className="text-xs text-slate-400">{stu.email} • {stu.class}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                  stu.status === 'Top Performer' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  stu.status === 'Good Progress' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {stu.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                <div className="p-2 bg-slate-800/40 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold">Attendance</p>
                  <p className="font-bold text-emerald-400">{stu.attendance}</p>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold">Test Score</p>
                  <p className="font-bold text-amber-400">{stu.testScore}</p>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold">Submissions</p>
                  <p className="font-bold text-white">{stu.assignmentsSubmitted}</p>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold">Doubts</p>
                  <p className="font-bold text-indigo-400">{stu.doubtsSubmitted}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Student Detail Card */}
        {selectedStudent ? (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-5 h-fit">
            <div className="text-center space-y-2">
              <img className="w-16 h-16 rounded-full border-2 border-indigo-500 mx-auto object-cover" alt={selectedStudent.name} src={selectedStudent.avatar} />
              <h3 className="font-bold text-white text-base">{selectedStudent.name}</h3>
              <p className="text-xs text-slate-400">{selectedStudent.email}</p>
              <span className="text-[10px] text-slate-400 block font-medium">Last Active: {selectedStudent.lastActive}</span>
            </div>

            <div className="space-y-2 text-xs border-t border-b border-slate-800 py-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Class Section:</span>
                <span className="font-bold text-white">{selectedStudent.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overall Attendance:</span>
                <span className="font-bold text-emerald-400">{selectedStudent.attendance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Average CBT Score:</span>
                <span className="font-bold text-amber-400">{selectedStudent.testScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assignments Done:</span>
                <span className="font-bold text-white">{selectedStudent.assignmentsSubmitted}</span>
              </div>
            </div>

            {/* Direct Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-2">
              <label className="block text-xs font-bold text-white">Send Direct Message to Student</label>
              <textarea
                rows="3"
                required
                placeholder={`Type message to ${selectedStudent.name}...`}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button
                type="submit"
                disabled={msgSent}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                {msgSent ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-400 text-xs">
            Select a student to view full performance profile and send direct messages.
          </div>
        )}

      </div>

    </div>
  );
}
