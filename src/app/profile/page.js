'use client';

import React from 'react';
import { useAuth } from '@/components/ClientLayout';

export default function ProfilePage() {
  const { user, logout, toggleRole } = useAuth();

  if (!user) return null;

  const isTeacher = user.role === 'TEACHER';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-md space-y-6 text-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-indigo-500/40 object-cover shadow-lg"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-white font-display">{user.name}</h1>
              <span className={`px-3 py-0.5 text-xs font-extrabold rounded-full uppercase ${
                isTeacher ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {user.role}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-bold">{user.email}</p>
            <p className="text-xs text-emerald-400 font-bold">PaathShalla Digital ID: #PS-84920</p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={toggleRole}
              className="px-4 py-2.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold rounded-xl border border-amber-500/30 transition-all"
            >
              Switch Role ({isTeacher ? 'Student' : 'Teacher'})
            </button>

            <button
              onClick={logout}
              className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-xl border border-red-500/30 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-center">
          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
            <span className="material-symbols-outlined text-amber-400 text-2xl">local_fire_department</span>
            <p className="text-xl font-black text-white">14 Days</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Study Streak</p>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
            <span className="material-symbols-outlined text-indigo-400 text-2xl">schedule</span>
            <p className="text-xl font-black text-indigo-400">48 Hours</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Hours Studied</p>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
            <span className="material-symbols-outlined text-emerald-400 text-2xl">analytics</span>
            <p className="text-xl font-black text-emerald-400">92%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy Rate</p>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
            <span className="material-symbols-outlined text-purple-400 text-2xl">emoji_events</span>
            <p className="text-xl font-black text-purple-400">3 Badges</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Achievements</p>
          </div>
        </div>
      </div>

    </div>
  );
}
