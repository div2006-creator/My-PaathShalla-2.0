'use client';

import React from 'react';

export default function StudentAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/30">
          Personal Performance Analytics
        </span>
        <h1 className="text-2xl font-extrabold text-white font-display mt-1">My Learning Progress & Accuracy</h1>
        <p className="text-xs text-slate-400">Track weekly study hours, course syllabus completion, test accuracy, and strong vs weak topics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Weekly Study Hours</span>
          <p className="text-2xl font-black text-indigo-400">28.5 hrs</p>
          <span className="text-[10px] text-emerald-400 font-bold">⚡ +4.2 hrs vs last week</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Course Progress</span>
          <p className="text-2xl font-black text-amber-400">68%</p>
          <span className="text-[10px] text-amber-300 font-bold">On track for JEE Exam</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Class Attendance</span>
          <p className="text-2xl font-black text-emerald-400">96%</p>
          <span className="text-[10px] text-emerald-400 font-bold">24/25 Sessions Attended</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Test Accuracy</span>
          <p className="text-2xl font-black text-white">92%</p>
          <span className="text-[10px] text-indigo-400 font-bold">Top 5% Student Rank</span>
        </div>
      </div>

      {/* Strong & Weak Topic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strong Topics */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="material-symbols-outlined text-emerald-400">verified</span>
            <span>Strong Mastered Topics</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-white">Calculus — Limits & Continuity</span>
                <span className="text-emerald-400">98% Accuracy</span>
              </div>
              <p className="text-slate-400 text-[11px]">Mastered 14/14 test questions in under 2 minutes per question.</p>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-white">Data Structures — Queues & Stacks</span>
                <span className="text-emerald-400">95% Accuracy</span>
              </div>
              <p className="text-slate-400 text-[11px]">Complete accuracy on BFS/DFS traversal questions.</p>
            </div>
          </div>
        </section>

        {/* Needs Focus */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="material-symbols-outlined text-amber-400">warning</span>
            <span>Topics Needing Practice</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">Physics — Electromagnetic Induction</span>
                <span className="text-amber-400">65% Accuracy</span>
              </div>
              <p className="text-slate-400 text-[11px]">Recommended: Watch recorded lecture #04 & practice DPP #02.</p>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">Chemistry — Esterification Mechanisms</span>
                <span className="text-amber-400">70% Accuracy</span>
              </div>
              <p className="text-slate-400 text-[11px]">Recommended: Submit a doubt or review study library cheatsheet.</p>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
