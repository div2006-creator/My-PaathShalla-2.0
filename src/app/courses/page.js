'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/ClientLayout';

export default function CoursesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lectures'); // 'overview' | 'lectures' | 'notes' | 'dpp' | 'assignments' | 'tests' | 'doubts' | 'resources' | 'announcements'
  const [activeLectureIndex, setActiveLectureIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const lectures = [
    {
      id: 'lec-1',
      title: 'Lecture 01: Introduction to Binary Search Trees (BST)',
      duration: '48:20',
      instructor: 'Prof. Rajesh Varma',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      pdfNotes: 'BST_Lecture01_Notes.pdf',
      dppFile: 'DPP_01_BST_Insertion.pdf',
      completed: true,
    },
    {
      id: 'lec-2',
      title: 'Lecture 02: BST Deletion Algorithm & Corner Cases',
      duration: '52:15',
      instructor: 'Prof. Rajesh Varma',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      pdfNotes: 'BST_Lecture02_Notes.pdf',
      dppFile: 'DPP_02_BST_Deletion.pdf',
      completed: true,
    },
    {
      id: 'lec-3',
      title: 'Lecture 03: AVL Trees & Self-Balancing Rotations',
      duration: '1:05:40',
      instructor: 'Prof. Rajesh Varma',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      pdfNotes: 'AVL_Trees_Notes.pdf',
      dppFile: 'DPP_03_AVL_Rotations.pdf',
      completed: false,
    },
    {
      id: 'lec-4',
      title: 'Lecture 04: Red-Black Trees & B-Tree Applications',
      duration: '58:30',
      instructor: 'Prof. Rajesh Varma',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      pdfNotes: 'RedBlack_Trees_Notes.pdf',
      dppFile: 'DPP_04_RedBlack.pdf',
      completed: false,
    },
  ];

  const currentLecture = lectures[activeLectureIndex];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* 1. COURSE HEADER */}
      <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-md uppercase tracking-wider border border-indigo-500/30">
                Computer Science & Engineering
              </span>
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-md flex items-center gap-1 border border-amber-500/30">
                <span className="material-symbols-outlined text-xs text-amber-400">star</span>
                <span>4.9 ★ (14,280 Students Enrolled)</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Data Structures & Algorithms (Mastery Batch 2026)
            </h1>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-indigo-400">person</span>
              <span>Lead Faculty: <strong className="text-white">Prof. Rajesh Varma (Ex-IIT Delhi)</strong></span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Course Completion</span>
                <span className="text-amber-400 font-extrabold">68% Completed</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <Link
              href="/live?subject=Data+Structures&topic=Binary+Search+Trees"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm animate-pulse">sensors</span>
              <span>JOIN LIVE CLASSROOM</span>
            </Link>
          </div>
        </div>

        {/* Course Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto border-t border-slate-800 pt-3 no-scrollbar text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: 'info' },
            { id: 'lectures', label: 'Lectures', icon: 'play_circle' },
            { id: 'notes', label: 'PDF Notes', icon: 'description' },
            { id: 'dpp', label: 'DPP Practice', icon: 'fitness_center' },
            { id: 'assignments', label: 'Assignments', icon: 'assignment' },
            { id: 'tests', label: 'Test Series', icon: 'quiz' },
            { id: 'doubts', label: 'Ask Doubts', icon: 'help' },
            { id: 'resources', label: 'Resources', icon: 'folder' },
            { id: 'announcements', label: 'Announcements', icon: 'campaign' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. VIDEO LECTURE PAGE */}
      {activeTab === 'lectures' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Video Player & Resources */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Player Stage */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group border border-slate-800">
              <video
                src={currentLecture.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Below Video Actions */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Now Playing</span>
                  <h2 className="text-base sm:text-lg font-bold text-white font-display">{currentLecture.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Instructor: {currentLecture.instructor}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                      isLiked ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{isLiked ? 'favorite' : 'favorite_border'}</span>
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                  </button>

                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                      isBookmarked ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{isBookmarked ? 'bookmark_added' : 'bookmark'}</span>
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                  </button>

                  <Link
                    href="/doubts"
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">help</span>
                    <span>Ask Doubt</span>
                  </Link>
                </div>
              </div>

              {/* Lecture Navigation */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <button
                  disabled={activeLectureIndex === 0}
                  onClick={() => setActiveLectureIndex(prev => prev - 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl disabled:opacity-30 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous</span>
                </button>

                <span className="text-xs font-bold text-slate-400">
                  Lecture {activeLectureIndex + 1} of {lectures.length}
                </span>

                <button
                  disabled={activeLectureIndex === lectures.length - 1}
                  onClick={() => setActiveLectureIndex(prev => prev + 1)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl disabled:opacity-30 flex items-center gap-1 shadow-md"
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Lecture Handouts & Resources */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Lecture Resources & Materials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert(`Downloading ${currentLecture.pdfNotes}...`); }}
                    className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-3 hover:border-indigo-500 transition-all"
                  >
                    <span className="material-symbols-outlined text-red-400 text-2xl">picture_as_pdf</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">PDF Notes</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Download PDF (2.4 MB)</p>
                    </div>
                  </a>

                  <Link
                    href="/dpp"
                    className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-3 hover:border-indigo-500 transition-all"
                  >
                    <span className="material-symbols-outlined text-amber-400 text-2xl">fitness_center</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">DPP Practice</p>
                      <p className="text-[10px] text-slate-400 font-semibold">10 Practice Set Questions</p>
                    </div>
                  </Link>

                  <Link
                    href="/assignments"
                    className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center gap-3 hover:border-indigo-500 transition-all"
                  >
                    <span className="material-symbols-outlined text-indigo-400 text-2xl">assignment</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">Homework</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Submit Assignment</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Playlist */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 h-fit">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold text-indigo-400 font-display flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                <span>Course Lectures Playlist</span>
              </h3>
              <span className="text-xs font-bold text-slate-400">{lectures.length} Videos</span>
            </div>

            <div className="space-y-2">
              {lectures.map((lec, idx) => {
                const isActive = idx === activeLectureIndex;
                return (
                  <button
                    key={lec.id}
                    onClick={() => setActiveLectureIndex(idx)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-sm'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold line-clamp-2 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {lec.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-1">
                        <span>⏱ {lec.duration}</span>
                        <span>•</span>
                        {lec.completed ? (
                          <span className="text-emerald-400 font-bold">Watched</span>
                        ) : (
                          <span className="text-amber-400 font-bold">Pending</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Non-video Tab Placeholders */}
      {activeTab !== 'lectures' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
          <span className="material-symbols-outlined text-indigo-400 text-4xl">auto_stories</span>
          <h3 className="text-lg font-bold text-white font-display capitalize">{activeTab} Hub</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All course materials, practice sheets, and announcement updates for {activeTab} are organized and updated daily.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/materials" className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm">
              Explore Resource Library
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
