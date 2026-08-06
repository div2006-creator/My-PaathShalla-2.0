'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/ClientLayout';

export default function SchedulePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Wed'); // Default to Wednesday matching seeded data
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [room, setRoom] = useState('Room 302');
  const [submitting, setSubmitting] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule?day=${selectedDay}`);
      const data = await res.json();
      setSchedule(data.schedule || []);
    } catch (e) {
      console.error('Failed to fetch schedule', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (e, id) => {
    e.stopPropagation();
    setSchedule((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete scheduled class:', err);
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    if (!topic) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          startTime,
          endTime,
          room,
          dayOfWeek: selectedDay,
        }),
      });

      const data = await res.json();
      if (res.ok && data.class) {
        setTopic('');
        setModalOpen(false);
        await fetchSchedule();
      } else {
        alert(data.error || 'Failed to schedule class');
      }
    } catch (err) {
      console.error(err);
      alert('Error scheduling class. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-on-surface animate-fade-in-up">
      
      {/* Calendar Header */}
      <section className="bg-surface-container-lowest px-container-margin py-stack-lg custom-shadow rounded-b-[2rem] paper-layer">
        <div className="flex items-center justify-between mb-stack-md">
          <h2 className="font-headline-md text-headline-md text-primary font-bold">September 2026</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {days.map((day, idx) => {
            const dateNum = 14 + idx; // Mock dates Mon 14 - Fri 18
            const isActive = day === selectedDay;
            return (
              <div key={day} className="flex flex-col items-center gap-1 group">
                <span className={`font-label-md text-label-md uppercase font-bold ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {day}
                </span>
                <button 
                  onClick={() => setSelectedDay(day)}
                  className={`flex flex-col items-center justify-center transition-all active:scale-95 ${
                    isActive 
                      ? 'w-14 h-16 rounded-2xl bg-primary-container shadow-lg text-white' 
                      : 'w-12 h-14 rounded-2xl bg-surface-container text-on-surface'
                  }`}
                >
                  <span className="font-title-lg text-title-lg font-bold">{dateNum}</span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    isActive ? 'bg-secondary-container' : 'bg-secondary'
                  }`}></div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-stack-lg px-container-margin pb-8">
        <div className="flex items-center justify-between mb-stack-md">
          <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Class Schedule</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-primary-container transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Schedule Class</span>
            </button>
            <span className="font-label-md text-label-md text-secondary bg-secondary-fixed-dim/20 px-3 py-1 rounded-full font-bold">
              {schedule.length} {schedule.length === 1 ? 'Class' : 'Classes'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-stack-lg relative">
            {/* Timeline Rail */}
            {schedule.length > 0 && (
              <div className="absolute left-[2.25rem] top-4 bottom-4 w-0.5 bg-outline-variant/30 z-0"></div>
            )}

            {schedule.length > 0 ? (
              schedule.map((item) => {
                const isLiveNow = item.room === 'Live Class (Active)' || item.room.toLowerCase().includes('live');
                
                return (
                  <div key={item.id} className="flex gap-4 relative z-10">
                    
                    {/* Time Label */}
                    <div className="w-10 flex flex-col items-end pt-1 shrink-0">
                      <span className="font-label-md text-label-md text-on-surface-variant font-bold leading-none">{item.startTime.split(' ')[0]}</span>
                      <span className="font-label-md text-[10px] text-outline uppercase font-bold">{item.startTime.split(' ')[1]}</span>
                    </div>

                    {/* Dot */}
                    <div className={`w-5 h-5 rounded-full border-4 border-background shrink-0 mt-1.5 -ml-2.5 ${
                      isLiveNow ? 'bg-secondary' : 'bg-primary-container'
                    }`}></div>

                    {/* Card */}
                    {isLiveNow ? (
                      // Chalkboard themed card for active lab
                      <div className="flex-grow chalkboard-texture p-stack-md rounded-xl shadow-lg border-l-4 border-secondary transition-all hover:brightness-110 paper-layer">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-white">
                            <h4 className="font-title-lg text-title-lg font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>{item.subject}</h4>
                            <p className="font-body-md text-body-md opacity-80">{item.topic}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {user && user.role === 'TEACHER' && (
                              <button 
                                onClick={(e) => handleDeleteClass(e, item.id)} 
                                title="Remove Class"
                                className="p-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors z-20"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            )}
                            <span className="material-symbols-outlined text-secondary-container text-2xl">calculate</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-stack-sm flex-wrap">
                          <div className="flex items-center gap-1 text-white/60 text-label-md font-label-md">
                            <span className="material-symbols-outlined text-sm">person</span>
                            <span>{item.teacherName}</span>
                          </div>
                          <Link 
                            href="/live" 
                            className="px-4 py-1.5 bg-secondary-container text-on-secondary-container text-label-md font-bold rounded-lg hover:scale-105 active:scale-95 transition-transform"
                          >
                            Join Live
                          </Link>
                        </div>
                      </div>
                    ) : (
                      // Standard card
                      <div className="flex-grow p-stack-md bg-surface-container-lowest rounded-xl custom-shadow border-l-4 border-primary group active:scale-[0.99] transition-transform paper-layer">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-title-lg text-title-lg text-primary font-bold">{item.subject}</h4>
                            <p className="font-body-md text-body-md text-on-surface-variant">{item.topic}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {user && user.role === 'TEACHER' && (
                              <button 
                                onClick={(e) => handleDeleteClass(e, item.id)} 
                                title="Remove Class"
                                className="p-1 rounded text-error hover:bg-error-container/30 transition-colors z-20"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            )}
                            <span className="material-symbols-outlined text-primary-container text-2xl">school</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-stack-sm text-outline">
                          <div className="flex items-center gap-1 text-label-md font-label-md">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>{item.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-label-md font-label-md">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span>{item.room}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-2 border-t border-dashed border-outline-variant/30 pt-1">
                          Instructor: {item.teacherName}
                        </p>
                      </div>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-on-surface-variant text-body-md">
                No classes scheduled for {selectedDay}.
              </div>
            )}
          </div>
        )}
      </section>

      {/* FAB - Render only for Teachers */}
      {user && user.role === 'TEACHER' && (
        <button 
          onClick={() => setModalOpen(true)}
          className="fixed bottom-24 right-container-margin w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-transform z-40"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      )}

      {/* Modal - Schedule Class */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative paper-layer">
            
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
              <h3 className="font-title-lg text-primary font-bold">Schedule Class ({selectedDay})</h3>
              <button onClick={() => setModalOpen(false)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>

            <form onSubmit={handleScheduleClass} className="p-6 space-y-4">
              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-1">Subject</label>
                <select 
                  className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>History</option>
                  <option>English</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-1">Topic</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Calculus: Limits & Derivatives"
                  className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-1">Start Time</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 09:00 AM"
                    className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-1">End Time</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 10:00 AM"
                    className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-1">Room / Type</label>
                <select
                  className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                >
                  <option>Room 302</option>
                  <option>Room 105</option>
                  <option>Room 201</option>
                  <option>Live Class (Active)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
              >
                {submitting ? 'Scheduling...' : 'Schedule Class'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
