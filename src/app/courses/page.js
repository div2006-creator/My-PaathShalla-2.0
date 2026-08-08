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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in-up">
      
      {/* 1. COURSE HEADER (Prompt Spec #6) */}
      <section className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-extrabold rounded-full uppercase tracking-wider">
                Computer Science & Engineering
              </span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-800 text-xs font-extrabold rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-xs fill-1 text-amber-500">star</span>
                <span>4.9 ★ (14,280 Students Enrolled)</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-display">
              Data Structures & Algorithms (Mastery Batch 2026)
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">person</span>
              <span>Lead Faculty: <strong>Prof. Rajesh Varma (Ex-IIT Delhi)</strong></span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between text-xs font-extrabold">
                <span className="text-on-surface-variant">Course Completion</span>
                <span className="text-primary font-bold">68% Completed</span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <Link
              href="/live"
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-sm hover:bg-primary-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm animate-pulse">sensors</span>
              <span>JOIN LIVE CLASSROOM</span>
            </Link>
          </div>
        </div>

        {/* 9 Course Navigation Tabs (Prompt Spec #6) */}
        <div className="flex gap-2 overflow-x-auto border-t border-outline-variant/60 pt-3 no-scrollbar">
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
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. VIDEO LECTURE PAGE EXPERIENCE (Prompt Spec #7) */}
      {activeTab === 'lectures' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Video Player & Resources */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group">
              <video
                src={currentLecture.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Below Video Actions (Prompt Spec #7) */}
            <div className="bg-surface border border-outline-variant p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Now Playing</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-on-surface font-display">{currentLecture.title}</h2>
                  <p className="text-xs text-on-surface-variant font-bold mt-0.5">Instructor: {currentLecture.instructor}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2.5 rounded-xl border border-outline-variant text-xs font-bold flex items-center gap-1 transition-all ${
                      isLiked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{isLiked ? 'favorite' : 'favorite_border'}</span>
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                  </button>

                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2.5 rounded-xl border border-outline-variant text-xs font-bold flex items-center gap-1 transition-all ${
                      isBookmarked ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{isBookmarked ? 'bookmark_added' : 'bookmark'}</span>
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                  </button>

                  <Link
                    href="/doubts"
                    className="px-4 py-2.5 bg-secondary text-black rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">help</span>
                    <span>Ask Doubt</span>
                  </Link>
                </div>
              </div>

              {/* Lecture Navigation (Previous / Next) */}
              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/60">
                <button
                  disabled={activeLectureIndex === 0}
                  onClick={() => setActiveLectureIndex(prev => prev - 1)}
                  className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface text-xs font-bold rounded-xl disabled:opacity-30 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous Lecture</span>
                </button>

                <span className="text-xs font-extrabold text-on-surface-variant">
                  Lecture {activeLectureIndex + 1} of {lectures.length}
                </span>

                <button
                  disabled={activeLectureIndex === lectures.length - 1}
                  onClick={() => setActiveLectureIndex(prev => prev + 1)}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary-container text-xs font-bold rounded-xl disabled:opacity-30 flex items-center gap-1 shadow-sm"
                >
                  <span>Next Lecture</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Lecture Resources (Prompt Spec #7) */}
              <div className="pt-3 border-t border-outline-variant/60 space-y-3">
                <h3 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">Lecture Resources & Study Material</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert(`Downloading ${currentLecture.pdfNotes}...`); }}
                    className="p-3 bg-surface-container-low border border-outline-variant rounded-xl flex items-center gap-3 hover:border-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-red-500 text-2xl">picture_as_pdf</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">Lecture PDF Notes</p>
                      <p className="text-[10px] text-on-surface-variant font-semibold">Download PDF (2.4 MB)</p>
                    </div>
                  </a>

                  <Link
                    href="/dpp"
                    className="p-3 bg-surface-container-low border border-outline-variant rounded-xl flex items-center gap-3 hover:border-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-amber-500 text-2xl">fitness_center</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">DPP Sheet</p>
                      <p className="text-[10px] text-on-surface-variant font-semibold">10 Practice Questions</p>
                    </div>
                  </Link>

                  <Link
                    href="/assignments"
                    className="p-3 bg-surface-container-low border border-outline-variant rounded-xl flex items-center gap-3 hover:border-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-primary text-2xl">assignment</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">Homework Assignment</p>
                      <p className="text-[10px] text-on-surface-variant font-semibold">Submit by Sunday</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Lecture Playlist */}
          <div className="bg-surface border border-outline-variant p-5 rounded-2xl shadow-sm space-y-4 h-fit">
            <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
              <h3 className="text-sm font-extrabold text-primary font-display flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                <span>Course Lectures Playlist</span>
              </h3>
              <span className="text-xs font-bold text-on-surface-variant">{lectures.length} Videos</span>
            </div>

            <div className="space-y-2">
              {lectures.map((lec, idx) => {
                const isActive = idx === activeLectureIndex;
                return (
                  <button
                    key={lec.id}
                    onClick={() => setActiveLectureIndex(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isActive
                        ? 'bg-primary/10 border-primary shadow-sm'
                        : 'bg-surface-container-low/50 border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isActive ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-extrabold line-clamp-2 ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                        {lec.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-bold mt-1">
                        <span>⏱ {lec.duration}</span>
                        <span>•</span>
                        {lec.completed ? (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            <span>Watched</span>
                          </span>
                        ) : (
                          <span className="text-amber-600">Pending</span>
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
        <div className="bg-surface border border-outline-variant p-8 rounded-2xl shadow-sm text-center space-y-4">
          <span className="material-symbols-outlined text-primary text-5xl">auto_stories</span>
          <h3 className="text-xl font-extrabold text-on-surface font-display capitalize">{activeTab} Hub</h3>
          <p className="text-xs text-on-surface-variant font-bold max-w-md mx-auto">
            All course materials, practice sheets, and announcement updates for {activeTab} are organized and updated daily.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/materials" className="px-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl shadow-sm">
              Explore Resource Library
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
