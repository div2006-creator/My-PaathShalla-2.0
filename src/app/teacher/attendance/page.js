'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/ClientLayout';

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('All');
  const [search, setSearch] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?className=${selectedClass}&search=${search}`);
      const data = await res.json();
      setRecords(data.attendanceRecords || []);
    } catch (e) {
      console.error(e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedClass]);

  const handleStatusChange = async (id, newStatus) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus } : r));
    try {
      await fetch('/api/attendance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRecords = records.filter(r =>
    (r.studentName && r.studentName.toLowerCase().includes(search.toLowerCase())) ||
    (r.className && r.className.toLowerCase().includes(search.toLowerCase()))
  );

  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const totalCount = records.length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/30">
            {isTeacher ? 'Teacher Attendance Operations' : 'Student Attendance Tracker'}
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Classroom Attendance Logs</h1>
          <p className="text-xs text-slate-400">Automated join/leave time tracking calculated directly from LiveKit classroom sessions</p>
        </div>

        <button
          onClick={fetchAttendance}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh Logs
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Overall Attendance %</span>
          <p className="text-2xl font-black text-emerald-400">{attendanceRate}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Present</span>
          <p className="text-2xl font-black text-white">{presentCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Late Arrivals</span>
          <p className="text-2xl font-black text-amber-400">{lateCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Absent</span>
          <p className="text-2xl font-black text-red-400">{absentCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400">Class Filter:</span>
          <select
            className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="All">All Classes</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Filter by class or student name..."
          className="w-full sm:w-64 p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        {filteredRecords.length > 0 ? (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Subject & Class</th>
                {isTeacher && <th className="p-4">Student</th>}
                <th className="p-4">Session Date</th>
                <th className="p-4">Join Time</th>
                <th className="p-4">Leave Time</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{r.className}</p>
                    <span className="text-[10px] text-indigo-400">{r.subject}</span>
                  </td>
                  {isTeacher && (
                    <td className="p-4">
                      <p className="font-bold text-white">{r.studentName}</p>
                      <span className="text-[10px] text-slate-500">{r.studentEmail}</span>
                    </td>
                  )}
                  <td className="p-4">{r.date}</td>
                  <td className="p-4">{r.joinTime}</td>
                  <td className="p-4">{r.leaveTime}</td>
                  <td className="p-4 font-bold text-white">{r.durationMinutes} mins</td>
                  <td className="p-4 text-center">
                    {isTeacher ? (
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black border focus:outline-none cursor-pointer ${
                          r.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          r.status === 'LATE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        <option value="PRESENT" className="bg-slate-900 text-emerald-400">PRESENT</option>
                        <option value="LATE" className="bg-slate-900 text-amber-400">LATE</option>
                        <option value="ABSENT" className="bg-slate-900 text-red-400">ABSENT</option>
                      </select>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                        r.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        r.status === 'LATE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {r.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-slate-600 text-5xl">fact_check</span>
            <h3 className="text-base font-bold text-white">No attendance records available yet.</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Attendance records will be calculated automatically as students join live classroom sessions.</p>
          </div>
        )}
      </div>

    </div>
  );
}
