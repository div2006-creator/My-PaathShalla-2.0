'use client';

import React, { useState } from 'react';

export default function MaterialsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Notes', 'PDFs', 'DPP', 'Assignments', 'Previous Year Papers', 'Question Banks'];

  const resources = [
    {
      id: 'r-1',
      title: 'Complete Integral Calculus Formula Sheet 2026',
      category: 'Notes',
      subject: 'Mathematics',
      size: '3.4 MB',
      downloads: 4820,
    },
    {
      id: 'r-2',
      title: 'JEE Advanced 2025 Physics Solved Paper (Paper 1 & 2)',
      category: 'Previous Year Papers',
      subject: 'Physics',
      size: '5.1 MB',
      downloads: 8200,
    },
    {
      id: 'r-3',
      title: 'Data Structures & Algorithms Question Bank (500+ MCQs)',
      category: 'Question Banks',
      subject: 'Computer Science',
      size: '8.2 MB',
      downloads: 12400,
    },
    {
      id: 'r-4',
      title: 'Organic Chemistry Reactions Mind Map',
      category: 'Notes',
      subject: 'Chemistry',
      size: '2.8 MB',
      downloads: 6100,
    }
  ];

  const filtered = resources.filter((r) => {
    const matchCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in-up">
      
      {/* Header */}
      <div className="border-b border-outline-variant/60 pb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-primary/10 text-primary rounded-xl material-symbols-outlined text-2xl">menu_book</span>
          <h1 className="text-2xl font-extrabold text-on-surface font-display">Study Material & Resource Library</h1>
        </div>
        <p className="text-xs text-on-surface-variant font-bold mt-1">Search and download formulas, lecture notes, PYQs, and practice banks</p>
      </div>

      {/* Search & Category Filter (Prompt Spec #15) */}
      <div className="space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, PYQs, formula sheets, or subjects..."
            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-outline-variant rounded-2xl font-bold text-xs focus:border-primary focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-surface border border-outline-variant p-5 rounded-2xl shadow-sm hover:border-primary transition-all flex items-start gap-4">
            <div className="p-3 bg-red-500/10 text-red-600 rounded-xl shrink-0">
              <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-extrabold rounded-full">{item.subject}</span>
                <span className="text-[10px] font-bold text-on-surface-variant">{item.category}</span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface font-display leading-snug truncate">{item.title}</h3>
              <p className="text-[11px] text-on-surface-variant font-bold">PDF • {item.size} • {item.downloads} Downloads</p>
            </div>

            <button
              onClick={() => alert(`Downloading ${item.title}...`)}
              className="p-2.5 bg-primary text-white hover:bg-primary-container rounded-xl shadow-sm shrink-0 active:scale-95 transition-all"
              title="Download File"
            >
              <span className="material-symbols-outlined text-lg">download</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
