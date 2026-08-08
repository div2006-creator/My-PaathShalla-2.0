'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SchedulePage() {
  const [filterView, setFilterView] = useState('TODAY'); // TODAY, WEEK, MONTH
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch('/api/schedule');
        const data = await res.json();
        setSchedule(data.schedule || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, []);

  const fullEvents = schedule.map(s => ({
    id: s.id,
    title: `${s.subject}: ${s.topic}`,
    time: `${s.startTime} - ${s.endTime}`,
    type: 'LIVE_CLASS',
    day: s.dayOfWeek || 'Today',
    instructor: s.teacherName,
    room: s.room
  }));

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/30">
            Timetable & Calendar
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Class Schedule & Academic Calendar</h1>
          <p className="text-xs text-slate-400">View live lecture times, upcoming CBT tests, assignment deadlines, and events</p>
        </div>

        {/* Today / Week / Month Filter Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {['TODAY', 'WEEK', 'MONTH'].map((v) => (
            <button
              key={v}
              onClick={() => setFilterView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterView === v
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Feed Grid */}
      <div className="space-y-4">
        {fullEvents.length > 0 ? (
          fullEvents.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    LIVE CLASS
                  </span>
                  <span className="text-xs font-bold text-slate-400">{item.day} • {item.time}</span>
                </div>
                <h3 className="font-bold text-white text-base font-display">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.instructor} • {item.room}</p>
              </div>

              <Link
                href={`/live?subject=${encodeURIComponent(item.title)}`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shrink-0 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">sensors</span> Join Room
              </Link>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center space-y-2">
            <span className="material-symbols-outlined text-slate-600 text-5xl">event_busy</span>
            <h3 className="text-base font-bold text-white">No upcoming classes scheduled.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">You're all caught up! Scheduled classes will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
