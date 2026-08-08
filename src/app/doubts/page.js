'use client';

import React, { useState } from 'react';

export default function DoubtsPage() {
  const [doubts, setDoubts] = useState([
    {
      id: 'd-1',
      subject: 'Mathematics',
      question: 'How to calculate the residue at essential singularity in contour integration?',
      type: 'Text',
      status: 'Resolved',
      teacherAnswer: 'Use the Laurent series expansion around z = z0. The coefficient of 1/(z - z0) gives the residue.',
      date: '2 hours ago',
      upvotes: 8
    },
    {
      id: 'd-2',
      subject: 'Physics',
      question: 'Why does induced EMF oppose the change in magnetic flux according to Lenz Law?',
      type: 'Image Attachment',
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
      status: 'Pending Teacher Answer',
      date: '4 hours ago',
      upvotes: 3
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState('Mathematics');
  const [doubtText, setDoubtText] = useState('');
  const [attachmentType, setAttachmentType] = useState('Text'); // 'Text' | 'Image' | 'Voice'

  const handleSubmitDoubt = (e) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    const newDoubt = {
      id: 'd-' + Date.now(),
      subject,
      question: doubtText,
      type: attachmentType,
      status: 'Pending Teacher Answer',
      date: 'Just now',
      upvotes: 1
    };

    setDoubts([newDoubt, ...doubts]);
    setDoubtText('');
    setModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-secondary/10 text-secondary rounded-xl material-symbols-outlined text-2xl">help_outline</span>
            <h1 className="text-2xl font-extrabold text-on-surface font-display">24/7 Academic Doubt Resolution</h1>
          </div>
          <p className="text-xs text-on-surface-variant font-bold mt-1">Get step-by-step explanations from subject expert faculty</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-primary hover:bg-primary-container text-white px-5 py-3 rounded-xl font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add_comment</span>
          <span>ASK A DOUBT</span>
        </button>
      </div>

      {/* Doubts Feed */}
      <div className="space-y-4 max-w-4xl">
        {doubts.map((d) => (
          <div key={d.id} className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-extrabold rounded-full">{d.subject}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                d.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-800'
              }`}>
                {d.status === 'Resolved' ? '✓ Resolved by Teacher' : '⏳ Pending Faculty Answer'}
              </span>
            </div>

            <p className="text-base font-extrabold text-on-surface font-display">{d.question}</p>

            {d.imageUrl && (
              <img src={d.imageUrl} alt="Doubt attachment" className="w-full max-w-md h-48 object-cover rounded-xl border border-outline-variant" />
            )}

            {d.teacherAnswer && (
              <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-1 text-xs font-bold">
                <p className="text-primary font-extrabold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Faculty Resolution:</span>
                </p>
                <p className="text-on-surface">{d.teacherAnswer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ask Doubt Modal (Prompt Spec #11) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
              <h3 className="text-lg font-extrabold text-primary font-display">Ask Your Doubt</h3>
              <button onClick={() => setModalOpen(false)} className="material-symbols-outlined text-on-surface-variant">close</button>
            </div>

            <form onSubmit={handleSubmitDoubt} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-on-surface-variant">Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 p-3 bg-surface-container-low border border-outline-variant rounded-xl font-bold text-xs">
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-on-surface-variant">Format</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {['Text', 'Image', 'Voice'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAttachmentType(type)}
                      className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                        attachmentType === type ? 'bg-primary text-white border-primary' : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-on-surface-variant">Question Details</label>
                <textarea
                  required
                  rows={4}
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  placeholder="Describe your question or difficulty..."
                  className="w-full mt-1 p-3 bg-surface-container-low border border-outline-variant rounded-xl font-bold text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-primary text-white font-extrabold text-xs rounded-xl shadow-md">
                SUBMIT DOUBT TO FACULTY
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
