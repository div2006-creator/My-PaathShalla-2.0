'use client';

import React from 'react';

export default function TeacherAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30">
          Academic Intelligence
        </span>
        <h1 className="text-2xl font-extrabold text-white font-display mt-1">Classroom Performance & Analytics</h1>
        <p className="text-xs text-slate-400">Class engagement, CBT accuracy trends, submission completion rates, and weak topic alerts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Class Attendance</span>
          <p className="text-2xl font-black text-emerald-400">94.2%</p>
          <span className="text-[10px] text-emerald-400 font-bold">↑ 2.4% vs last week</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">CBT Test Avg Score</span>
          <p className="text-2xl font-black text-amber-400">78.5%</p>
          <span className="text-[10px] text-amber-300 font-bold">Top 10% All-India Rank</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Assignment Rate</span>
          <p className="text-2xl font-black text-indigo-400">91.0%</p>
          <span className="text-[10px] text-indigo-300 font-bold">116/128 Submitted</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Live Engagement</span>
          <p className="text-2xl font-black text-white">88%</p>
          <span className="text-[10px] text-slate-400 font-bold">Poll & Quiz response</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weak Topic Alerts */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="material-symbols-outlined text-amber-400">warning</span>
            <span>Identify Weak Topics & Concept Gaps</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">Definite Integral Substitution (Calculus)</span>
                <span className="text-red-400">44% Accuracy</span>
              </div>
              <p className="text-slate-400 text-[11px]">28 out of 42 students struggled with variable boundary substitution.</p>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-[44%]"></div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">Faraday EMF Calculation (Physics)</span>
                <span className="text-amber-400">62% Accuracy</span>
              </div>
              <p className="text-slate-400 text-[11px]">Formula sign errors in Lenz's law application.</p>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[62%]"></div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-emerald-400 font-bold">QuickSort Partitioning (Algorithms)</span>
                <span className="text-emerald-400">92% Accuracy</span>
              </div>
              <p className="text-slate-400 text-[11px]">Strong conceptual mastery demonstrated across all sections.</p>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[92%]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Comparison */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="material-symbols-outlined text-indigo-400">equalizer</span>
            <span>Section-wise Benchmark Comparison</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-white">Section A — Target JEE 2026</span>
                <span className="text-indigo-400">86.4% Overall Score</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[86.4%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-white">Section B — Physics Core</span>
                <span className="text-amber-400">76.2% Overall Score</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[76.2%]"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-white">Section C — Organic Chemistry</span>
                <span className="text-emerald-400">81.0% Overall Score</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[81.0%]"></div>
              </div>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
