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
            <p className="text-xs text-emerald-400 font-bold">Authenticated User ID: {user.id}</p>
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

        {/* Account System Status */}
        <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">Account System Status</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Authenticated & Ready
          </span>
        </div>

      </div>

    </div>
  );
}
