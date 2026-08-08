'use client';

import React, { useState } from 'react';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedStudent) return;
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
            Student Roster
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Enrolled Students & Performance</h1>
          <p className="text-xs text-slate-400">Track student attendance, test accuracy, coursework submissions, and direct messaging</p>
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
          {filteredStudents.length > 0 ? (
            filteredStudents.map((stu) => (
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
                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center text-xs">
                      {stu.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{stu.name}</h4>
                      <p className="text-xs text-slate-400">{stu.email}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Learner
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-2 text-slate-400">
              <span className="material-symbols-outlined text-slate-600 text-4xl">group_off</span>
              <h3 className="font-bold text-white text-base">No students enrolled yet.</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Enrolled students will automatically appear here once they register for your classes.</p>
            </div>
          )}
        </div>

        {/* Selected Student Detail Card */}
        {selectedStudent ? (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-5 h-fit text-white">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-lg flex items-center justify-center mx-auto border-2 border-indigo-500">
                {selectedStudent.name[0]}
              </div>
              <h3 className="font-bold text-white text-base">{selectedStudent.name}</h3>
              <p className="text-xs text-slate-400">{selectedStudent.email}</p>
            </div>

            {/* Direct Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-2 pt-3 border-t border-slate-800">
              <label className="block text-xs font-bold text-white">Send Direct Message</label>
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
                {msgSent ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-400 text-xs">
            Select an enrolled student to send direct messages.
          </div>
        )}

      </div>

    </div>
  );
}
