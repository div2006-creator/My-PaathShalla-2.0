'use client';

import React from 'react';
import { useAuth } from '@/components/ClientLayout';

export default function ProfilePage() {
  const { user, logout, toggleRole } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in-up">
      
      {/* Profile Card */}
      <div className="bg-surface border border-outline-variant p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={user.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740'}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover shadow-md"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-on-surface font-display">{user.name}</h1>
              <span className="px-3 py-0.5 bg-primary text-white text-xs font-extrabold rounded-full uppercase">
                {user.role}
              </span>
              <span className="px-3 py-0.5 bg-amber-500 text-black text-xs font-extrabold rounded-full uppercase">
                Target JEE 2026
              </span>
            </div>

            <p className="text-xs text-on-surface-variant font-bold">{user.email}</p>
            <p className="text-xs text-emerald-600 font-extrabold">PaathShalla Registered Learner ID: #PS-84920</p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={toggleRole}
              className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-extrabold rounded-xl"
            >
              Switch Role ({user.role === 'TEACHER' ? 'Student' : 'Teacher'})
            </button>

            <button
              onClick={logout}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-extrabold rounded-xl border border-red-500/30"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Student Achievements & Stats (Prompt Spec #18) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-outline-variant/60 text-center">
          <div className="p-4 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-amber-500 text-2xl">local_fire_department</span>
            <p className="text-xl font-extrabold text-primary mt-1">14 Days</p>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase">Study Streak</p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
            <p className="text-xl font-extrabold text-primary mt-1">48 Hours</p>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase">Hours Studied</p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-emerald-500 text-2xl">analytics</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">92%</p>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase">Accuracy Rate</p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-purple-600 text-2xl">emoji_events</span>
            <p className="text-xl font-extrabold text-purple-700 mt-1">3 Badges</p>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase">Achievements</p>
          </div>
        </div>
      </div>

    </div>
  );
}
