'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/ClientLayout';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todo'); // 'todo' | 'completed'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // Submit modal state (Student)
  const [submitContent, setSubmitContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Grade modal state (Teacher)
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  // Create modal state (Teacher FAB)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newDueDate, setNewDueDate] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (e) {
      console.error('Failed to fetch assignments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!submitContent.trim() || !selectedAssignment) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          content: submitContent,
        }),
      });

      if (res.ok) {
        setSubmitContent('');
        setSelectedAssignment(null);
        await fetchAssignments();
      } else {
        alert('Failed to submit assignment');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeacherGrade = async (e) => {
    e.preventDefault();
    if (!grade.trim() || !selectedSubmission) return;

    setGrading(true);
    try {
      const res = await fetch('/api/assignments/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          grade,
          feedback,
        }),
      });

      if (res.ok) {
        setGrade('');
        setFeedback('');
        setSelectedSubmission(null);
        setSelectedAssignment(null);
        await fetchAssignments();
      } else {
        alert('Failed to submit grade');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGrading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newDueDate) return;

    setCreating(true);
    try {
      let fileUrl = null;
      let fileName = null;

      if (newFile) {
        const formData = new FormData();
        formData.append('file', newFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          fileUrl = uploadData.fileUrl;
          fileName = uploadData.fileName;
        } else {
          alert(uploadData.error || 'Failed to upload file');
          setCreating(false);
          return;
        }
      }

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          subject: newSubject,
          dueDate: new Date(newDueDate).toISOString(),
          fileUrl,
          fileName,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setNewFile(null);
        setCreateModalOpen(false);
        await fetchAssignments();
      } else {
        alert('Failed to create assignment');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filtering assignments based on role and tab
  let filteredAssignments = [];
  let pendingCount = 0;
  let completionRate = 0;

  if (user.role === 'STUDENT') {
    const todoList = assignments.filter(a => !a.submissions || a.submissions.length === 0);
    const completedList = assignments.filter(a => a.submissions && a.submissions.length > 0);
    
    pendingCount = todoList.length;
    completionRate = assignments.length > 0 ? Math.round((completedList.length / assignments.length) * 100) : 0;
    filteredAssignments = activeTab === 'todo' ? todoList : completedList;
  } else {
    // For teachers, 'todo' = assignments with ungraded submissions
    // 'completed' = assignments with graded submissions, or no submissions
    const ungradedList = assignments.filter(a => a.submissions && a.submissions.some(s => !s.grade));
    const gradedOrEmptyList = assignments.filter(a => !a.submissions || a.submissions.every(s => s.grade));
    
    pendingCount = ungradedList.length;
    completionRate = assignments.length > 0 ? Math.round(((assignments.length - pendingCount) / assignments.length) * 100) : 0;
    filteredAssignments = activeTab === 'todo' ? ungradedList : gradedOrEmptyList;
  }

  return (
    <div className="px-container-margin mt-stack-md animate-fade-in-up">
      
      {/* Header & Stats Bento Layout */}
      <section className="grid grid-cols-12 gap-4 mb-stack-lg">
        <div className="col-span-12">
          <h2 className="font-headline-md text-headline-md text-on-background font-bold">Your Assignments</h2>
          <p className="font-body-md text-on-surface-variant">Stay on track with your scholarly duties.</p>
        </div>
        <div className="col-span-7 bg-primary p-stack-md rounded-xl text-on-primary flex flex-col justify-between h-32 paper-shadow">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined opacity-80">trending_up</span>
            <span className="font-label-md text-label-md bg-white/10 px-2 py-1 rounded-full">Goal Rate</span>
          </div>
          <div>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="font-label-md text-label-md opacity-80">Completion Rate</div>
          </div>
        </div>
        <div className="col-span-5 bg-secondary-container p-stack-md rounded-xl text-on-secondary-container flex flex-col justify-center items-center text-center h-32 paper-shadow">
          <div className="text-3xl font-bold">{pendingCount}</div>
          <div className="font-label-md text-label-md font-semibold">{user.role === 'STUDENT' ? 'Pending' : 'To Grade'}</div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-stack-lg mb-stack-md border-b border-outline-variant/30">
        <button 
          className={`pb-2 font-title-lg text-title-lg font-bold transition-all ${
            activeTab === 'todo' ? 'border-b-2 border-secondary text-primary' : 'text-on-surface-variant'
          }`} 
          onClick={() => setActiveTab('todo')}
        >
          {user.role === 'STUDENT' ? 'To Do' : 'Pending Review'}
        </button>
        <button 
          className={`pb-2 font-title-lg text-title-lg font-bold transition-all ${
            activeTab === 'completed' ? 'border-b-2 border-secondary text-primary' : 'text-on-surface-variant'
          }`} 
          onClick={() => setActiveTab('completed')}
        >
          {user.role === 'STUDENT' ? 'Completed' : 'Reviewed / None'}
        </button>
      </div>

      {/* Assignments List */}
      <div className="space-y-stack-md">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
            const hasSubmitted = user.role === 'STUDENT' && assignment.submissions && assignment.submissions.length > 0;
            const studentSubmission = hasSubmitted ? assignment.submissions[0] : null;

            return (
              <div 
                key={assignment.id} 
                onClick={() => setSelectedAssignment(assignment)}
                className="bg-surface-container-lowest p-stack-md rounded-xl paper-shadow border border-outline-variant/10 active:scale-[0.98] transition-all duration-200 cursor-pointer paper-layer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${hasSubmitted ? 'bg-green-600' : 'bg-secondary'}`}></span>
                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{assignment.subject}</span>
                  </div>
                  <span className={`px-3 py-1 font-label-md text-label-md rounded-full font-semibold ${
                    user.role === 'STUDENT'
                      ? hasSubmitted 
                        ? studentSubmission.grade 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-primary text-white'
                        : 'bg-secondary-container text-on-secondary-container'
                      : assignment.submissions && assignment.submissions.some(s => !s.grade)
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-gray-100 text-on-surface-variant'
                  }`}>
                    {user.role === 'STUDENT'
                      ? hasSubmitted
                        ? studentSubmission.grade 
                          ? `Graded: ${studentSubmission.grade}` 
                          : 'Submitted'
                        : 'Pending'
                      : assignment.submissions 
                        ? `${assignment.submissions.filter(s => !s.grade).length} ungraded` 
                        : '0 submissions'
                    }
                  </span>
                </div>
                <h3 className="font-title-lg text-title-lg text-primary mb-1 font-bold">{assignment.title}</h3>
                <p className="font-body-md text-on-surface-variant mb-3 line-clamp-2">{assignment.description}</p>
                
                {assignment.fileUrl && (
                  <div className="inline-flex items-center gap-1 bg-secondary-fixed-dim/20 text-secondary px-2.5 py-1 rounded-md text-[11px] font-bold mb-3">
                    <span className="material-symbols-outlined text-[14px]">attach_file</span>
                    <span className="truncate max-w-[180px]">{assignment.fileName || 'Attached File'}</span>
                  </div>
                )}

                <div className="flex items-center justify-between dotted-border pb-2">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    <span className="font-label-md text-label-md">
                      Due: {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <button className="text-primary font-label-md text-label-md font-bold flex items-center gap-1">
                    {user.role === 'STUDENT'
                      ? hasSubmitted ? 'VIEW DETAILS' : 'START ASSIGNMENT'
                      : 'GRADE WORK'
                    } 
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-5xl text-slate-600">assignment</span>
            <p className="font-bold text-sm text-white">No assignments available.</p>
            <p className="text-xs text-slate-400">{user.role === 'TEACHER' ? 'Create an assignment to assign coursework to your class.' : 'Check back later for new coursework.'}</p>
          </div>
        )}
      </div>

      {/* Teacher FAB */}
      {user.role === 'TEACHER' && (
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="fixed bottom-28 right-6 w-14 h-14 bg-secondary-container text-on-secondary-container rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
        >
          <span className="material-symbols-outlined text-3xl">add_task</span>
        </button>
      )}

      {/* Assignment Detail / Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative paper-layer max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/30 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{selectedAssignment.subject}</span>
                <h3 className="font-title-lg text-primary font-bold truncate">{selectedAssignment.title}</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedAssignment(null);
                  setSelectedSubmission(null);
                }} 
                className="material-symbols-outlined text-outline hover:text-primary"
              >
                close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              <div>
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase font-bold mb-1">Description</h4>
                <p className="font-body-md text-on-surface">{selectedAssignment.description}</p>
                
                {selectedAssignment.fileUrl && (
                  <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between mt-3 border border-outline-variant/20">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="material-symbols-outlined text-primary">attach_file</span>
                      <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                        {selectedAssignment.fileName || 'Attachment File'}
                      </span>
                    </div>
                    <a 
                      href={selectedAssignment.fileUrl} 
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-primary text-on-primary rounded-lg text-label-md font-bold hover:scale-105 active:scale-95 transition-transform shrink-0 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span> Download
                    </a>
                  </div>
                )}

                <p className="text-[12px] text-outline mt-2">
                  Due date: {new Date(selectedAssignment.dueDate).toLocaleString()}
                </p>
              </div>

              {/* STUDENT VIEW */}
              {user.role === 'STUDENT' && (
                <div className="space-y-4 pt-4 border-t border-dashed border-outline-variant">
                  {selectedAssignment.submissions && selectedAssignment.submissions.length > 0 ? (
                    // Already Submitted View
                    <div className="space-y-4">
                      <div className="bg-surface-container-low p-4 rounded-xl">
                        <h4 className="font-label-md text-label-md text-primary font-bold mb-2">YOUR SUBMISSION</h4>
                        <p className="font-body-md text-on-surface italic">{selectedAssignment.submissions[0].content}</p>
                        <p className="text-[10px] text-outline mt-2">
                          Submitted on {new Date(selectedAssignment.submissions[0].submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {selectedAssignment.submissions[0].grade ? (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                          <h4 className="font-label-md text-label-md text-green-800 font-bold mb-1">GRADE: {selectedAssignment.submissions[0].grade}</h4>
                          {selectedAssignment.submissions[0].feedback && (
                            <p className="font-body-md text-green-900 mt-1">Feedback: {selectedAssignment.submissions[0].feedback}</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-primary font-label-md text-label-md">
                          Review in progress. Your teacher hasn't graded this yet.
                        </div>
                      )}
                    </div>
                  ) : (
                    // Submit Form
                    <form onSubmit={handleStudentSubmit} className="space-y-3">
                      <label className="block text-label-md font-bold text-on-surface-variant">YOUR ANSWER</label>
                      <textarea 
                        required
                        rows="5"
                        placeholder="Write your homework answer here..."
                        className="w-full p-3 border border-outline-variant rounded-xl bg-transparent focus:outline-none focus:border-primary text-body-md"
                        value={submitContent}
                        onChange={(e) => setSubmitContent(e.target.value)}
                      />
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit Work'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TEACHER VIEW */}
              {user.role === 'TEACHER' && (
                <div className="space-y-4 pt-4 border-t border-dashed border-outline-variant">
                  <h4 className="font-label-md text-label-md text-on-surface-variant uppercase font-bold">Student Submissions</h4>
                  
                  {selectedAssignment.submissions && selectedAssignment.submissions.length > 0 ? (
                    <div className="space-y-4">
                      {/* Submission List / Selection */}
                      {!selectedSubmission ? (
                        <div className="divide-y divide-outline-variant/30">
                          {selectedAssignment.submissions.map((sub) => (
                            <div 
                              key={sub.id} 
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setGrade(sub.grade || '');
                                setFeedback(sub.feedback || '');
                              }}
                              className="py-3 flex justify-between items-center hover:bg-surface-container/50 cursor-pointer rounded px-2"
                            >
                              <div>
                                <p className="font-body-lg font-bold text-primary">{sub.student.name}</p>
                                <p className="text-[10px] text-outline">
                                  Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded font-label-md text-label-md ${
                                sub.grade ? 'bg-green-100 text-green-800' : 'bg-secondary-container text-on-secondary-container'
                              }`}>
                                {sub.grade ? `Grade: ${sub.grade}` : 'Ungraded'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Individual Submission Grading Form
                        <div className="space-y-4">
                          <button 
                            type="button"
                            onClick={() => setSelectedSubmission(null)}
                            className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline mb-2"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to submissions list
                          </button>
                          
                          <div className="bg-surface-container-low p-4 rounded-xl">
                            <h5 className="font-label-md text-label-md text-primary font-bold mb-1">SUBMITTED WORK BY {selectedSubmission.student.name}</h5>
                            <p className="font-body-md text-on-surface italic">{selectedSubmission.content}</p>
                          </div>

                          <form onSubmit={handleTeacherGrade} className="space-y-3">
                            <div>
                              <label className="block text-label-md font-bold text-on-surface-variant mb-1">Grade (e.g. A+, B, C-)</label>
                              <input 
                                type="text"
                                required
                                placeholder="A+"
                                className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-label-md font-bold text-on-surface-variant mb-1">Feedback</label>
                              <textarea 
                                rows="3"
                                placeholder="Enter feedback details..."
                                className="w-full p-2 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-body-md"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                              />
                            </div>
                            <button 
                              type="submit"
                              disabled={grading}
                              className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
                            >
                              {grading ? 'Submitting Grade...' : 'Save Grade & Feedback'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-on-surface-variant text-body-md italic">No students have submitted this assignment yet.</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal (FAB link) */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-3 sm:p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative paper-layer max-h-[85vh] sm:max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant/30 shrink-0">
              <h3 className="font-title-lg text-primary font-bold">Create New Assignment</h3>
              <button onClick={() => setCreateModalOpen(false)} className="material-symbols-outlined text-outline hover:text-primary">close</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-grow">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Subject</label>
                <select 
                  className="w-full px-2.5 py-1.5 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-[13px]"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                >
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>History</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Integral Calculus Basics"
                  className="w-full px-2.5 py-1.5 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-[13px]"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Description</label>
                <textarea 
                  required
                  rows="2"
                  placeholder="Describe the homework details..."
                  className="w-full px-2.5 py-1.5 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-[13px]"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Due Date</label>
                <input 
                  type="datetime-local" 
                  required
                  className="w-full px-2.5 py-1.5 border border-outline-variant rounded-lg bg-transparent focus:outline-none focus:border-primary text-[13px]"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-0.5">Attach File (Optional)</label>
                <input 
                  type="file" 
                  className="w-full p-1 border border-outline-variant rounded-lg bg-transparent text-[12px] focus:outline-none focus:border-primary"
                  onChange={(e) => setNewFile(e.target.files[0] || null)}
                />
              </div>
              <button 
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-primary text-on-primary font-bold text-[14px] rounded-xl active:scale-95 transition-transform disabled:opacity-50 mt-1"
              >
                {creating ? 'Publishing & Uploading...' : 'Publish Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
