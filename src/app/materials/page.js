'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/ClientLayout';

export default function MaterialsPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ALL'); // ALL, Notes, Assignments, DPP, PYQ, Question Banks, Videos
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Form state
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Notes');
  const [subjectInput, setSubjectInput] = useState('Mathematics');

  const [materials, setMaterials] = useState([
    { id: 'mat-1', title: 'Calculus Definite Integrals Cheatsheet', category: 'Notes', subject: 'Mathematics', type: 'PDF', size: '2.4 MB', date: 'Yesterday', downloads: 142 },
    { id: 'mat-2', title: 'Electromagnetic Induction Formula Sheet', category: 'Notes', subject: 'Physics', type: 'PDF', size: '1.8 MB', date: '3 days ago', downloads: 98 },
    { id: 'mat-3', title: 'JEE Main 2025 Solved PYQ Collection', category: 'PYQ', subject: 'Mathematics', type: 'PDF', size: '5.2 MB', date: '1 week ago', downloads: 310 },
    { id: 'mat-4', title: 'Organic Reaction Mechanism Flowchart', category: 'Notes', subject: 'Chemistry', type: 'Image', size: '3.1 MB', date: '4 days ago', downloads: 215 },
    { id: 'mat-5', title: 'DPP #04 — Daily Practice Problem Set', category: 'DPP', subject: 'Physics', type: 'PDF', size: '1.1 MB', date: 'Today', downloads: 64 },
    { id: 'mat-6', title: 'Algorithms & Data Structures Question Bank', category: 'Question Banks', subject: 'Computer Science', type: 'PDF', size: '4.5 MB', date: '2 weeks ago', downloads: 180 },
  ]);

  const filteredMaterials = materials.filter(m => {
    const matchesCat = activeCategory === 'ALL' || m.category === activeCategory;
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const newMat = {
      id: 'mat-' + Date.now(),
      title: titleInput,
      category: categoryInput,
      subject: subjectInput,
      type: 'PDF',
      size: '2.0 MB',
      date: 'Just now',
      downloads: 0
    };

    setMaterials([newMat, ...materials]);
    setTitleInput('');
    setUploadModalOpen(false);
  };

  const handleDownload = (mat) => {
    alert(`Downloading "${mat.title}" (${mat.size})...`);
    setMaterials(materials.map(m => m.id === mat.id ? { ...m, downloads: m.downloads + 1 } : m));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/30">
            Study Resource Library
          </span>
          <h1 className="text-2xl font-extrabold text-white font-display mt-1">Study Materials & Handouts</h1>
          <p className="text-xs text-slate-400">Access organized lecture notes, DPPs, PYQs, and question banks</p>
        </div>

        {user?.role === 'TEACHER' && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>Upload Study Material</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
          {['ALL', 'Notes', 'DPP', 'PYQ', 'Question Banks', 'Assignments'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by topic or subject..."
          className="w-full md:w-64 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((mat) => (
          <div key={mat.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {mat.subject}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {mat.category}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm leading-snug">{mat.title}</h3>
              <p className="text-[11px] text-slate-400">{mat.type} Document • {mat.size}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-[10px] text-slate-500">{mat.downloads} downloads</span>
              <button
                onClick={() => handleDownload(mat)}
                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs rounded-xl border border-indigo-500/30 flex items-center gap-1 transition-all"
              >
                <span className="material-symbols-outlined text-sm">download</span> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-base">Upload Study Material</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Integration Formula Sheet"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                  >
                    <option>Notes</option>
                    <option>DPP</option>
                    <option>PYQ</option>
                    <option>Question Banks</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Subject</label>
                  <select
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                  >
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Computer Science</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Upload File (PDF/Image)</label>
                <input type="file" className="w-full text-slate-400" />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 mt-2"
              >
                Publish Resource
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
