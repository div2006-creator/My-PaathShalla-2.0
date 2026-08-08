'use client';

import React, { useState } from 'react';

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 'ann-1',
      title: 'Tomorrow Calculus Lecture Rescheduled',
      content: 'Tomorrow’s Mathematics 101 live session will start at 11:00 AM instead of 10:00 AM. Please revise substitution rules before class.',
      targetClass: 'Mathematics 101',
      priority: 'HIGH',
      createdAt: 'Today at 09:30 AM',
      author: 'Prof. Rajesh Varma'
    },
    {
      id: 'ann-2',
      title: 'Physics Mock Test #05 Syllabus Update',
      content: 'Mock Test #05 will cover Electromagnetic Induction, Magnetic Flux, and Lens Law. Test opens Saturday at 10:00 AM.',
      targetClass: 'Physics Core',
      priority: 'NORMAL',
      createdAt: 'Yesterday at 04:15 PM',
      author: 'Dr. Ananya Sharma'
    }
  ]);

  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [targetClassInput, setTargetClassInput] = useState('All Classes');
  const [priorityInput, setPriorityInput] = useState('NORMAL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handlePublish = (e) => {
    e.preventDefault();
    if (!titleInput.trim() || !contentInput.trim()) return;

    const newAnn = {
      id: 'ann-' + Date.now(),
      title: titleInput,
      content: contentInput,
      targetClass: targetClassInput,
      priority: priorityInput,
      createdAt: 'Just now',
      author: 'Prof. Rajesh Varma'
    };

    setAnnouncements([newAnn, ...announcements]);
    setTitleInput('');
    setContentInput('');
    setCreateModalOpen(false);
  };

  const handleDelete = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30">
            Class Broadcasts
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Classroom Announcements</h1>
          <p className="text-xs text-slate-400">Broadcast important updates, timetable shifts, and exam reminders to student feeds</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">campaign</span>
          <span>Publish Announcement</span>
        </button>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4 max-w-4xl">
        {announcements.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                  item.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {item.priority} PRIORITY
                </span>
                <span className="text-xs font-bold text-amber-400">{item.targetClass}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">{item.createdAt}</span>
                <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-400">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white text-base font-display">{item.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between font-medium">
              <span>Published by {item.author}</span>
              <span className="text-emerald-400 font-bold">In-App Notification Sent ✓</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-base">New Class Announcement</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handlePublish} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Class</label>
                <select
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={targetClassInput}
                  onChange={(e) => setTargetClassInput(e.target.value)}
                >
                  <option>All Classes</option>
                  <option>Mathematics 101</option>
                  <option>Physics Core</option>
                  <option>Chemistry Core</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Change for Tomorrow"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Content Message</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Write message content for students..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Priority Level</label>
                <select
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={priorityInput}
                  onChange={(e) => setPriorityInput(e.target.value)}
                >
                  <option value="NORMAL">Normal Notice</option>
                  <option value="HIGH">High Priority Alert</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 mt-2"
              >
                Broadcast Announcement
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
