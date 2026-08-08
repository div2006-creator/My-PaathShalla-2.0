'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const AuthContext = createContext({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
  toggleRole: () => {},
  theme: 'dark',
  toggleTheme: () => {},
});

export const useAuth = () => useContext(AuthContext);

const DEFAULT_STUDENT = {
  id: 'default-student-id',
  name: 'Aarav Mehta',
  email: 'aarav@paathshalla.com',
  role: 'STUDENT',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

const DEFAULT_TEACHER = {
  id: 'default-teacher-id',
  name: 'Prof. Rajesh Varma',
  email: 'varma@paathshalla.com',
  role: 'TEACHER',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
};

export default function ClientLayout({ children }) {
  const [user, setUser] = useState(DEFAULT_STUDENT);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Live Class Starting Soon', msg: 'Mathematics 101 starts at 10:00 AM', time: '10m ago', unread: true, type: 'live' },
    { id: 2, title: 'New Assignment Published', msg: 'Calculus Definite Integrals Practice Set', time: '1h ago', unread: true, type: 'assignment' },
    { id: 3, title: 'Test Results Published', msg: 'Physics Full Mock Test #04 score: 18/20', time: '3h ago', unread: false, type: 'test' },
    { id: 4, title: 'Teacher Announcement', msg: 'Tomorrow class schedule shifted to 11 AM', time: '1d ago', unread: false, type: 'announcement' },
  ]);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('paathshalla_theme') || 'dark';
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('paathshalla_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(user?.role === 'TEACHER' ? DEFAULT_TEACHER : DEFAULT_STUDENT);
      }
    } catch (e) {
      console.error('Failed to fetch auth state', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [pathname]);

  useEffect(() => {
    if (!loading) {
      if (pathname === '/login' || pathname === '/') {
        router.replace('/dashboard');
      }
    }
  }, [loading, pathname, router]);

  const toggleRole = () => {
    setUser((prev) => {
      const isTeacher = prev?.role === 'TEACHER';
      return isTeacher ? DEFAULT_STUDENT : DEFAULT_TEACHER;
    });
  };

  const logout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(DEFAULT_STUDENT);
    setLoading(false);
    router.replace('/dashboard');
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-base text-indigo-400">Loading PaathShalla...</p>
      </div>
    );
  }

  // Login page bypasses layout shell
  if (pathname === '/login') {
    return (
      <AuthContext.Provider value={{ user, loading, logout, refreshUser, toggleRole, theme, toggleTheme }}>
        {children}
      </AuthContext.Provider>
    );
  }

  const isLivePage = pathname === '/live';
  const isTeacher = user?.role === 'TEACHER';

  // Distinct Teacher Navigation Items
  const teacherNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/teacher/classes', label: 'My Classes', icon: 'class' },
    { href: '/schedule', label: 'Schedule', icon: 'calendar_today' },
    { href: '/live', label: 'Live Classes', icon: 'sensors' },
    { href: '/teacher/students', label: 'Students', icon: 'group' },
    { href: '/teacher/attendance', label: 'Attendance', icon: 'how_to_reg' },
    { href: '/assignments', label: 'Assignments', icon: 'assignment' },
    { href: '/tests', label: 'Test Series', icon: 'quiz' },
    { href: '/materials', label: 'Study Material', icon: 'folder' },
    { href: '/recordings', label: 'Recordings', icon: 'videocam' },
    { href: '/doubts', label: 'Doubt Desk', icon: 'help_outline' },
    { href: '/teacher/announcements', label: 'Announcements', icon: 'campaign' },
    { href: '/teacher/analytics', label: 'Analytics', icon: 'analytics' },
    { href: '/profile', label: 'Profile', icon: 'person' },
  ];

  // Distinct Student Navigation Items
  const studentNavItems = [
    { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
    { href: '/courses', label: 'My Courses', icon: 'school' },
    { href: '/live', label: 'Live Classes', icon: 'sensors' },
    { href: '/schedule', label: 'Schedule', icon: 'calendar_today' },
    { href: '/assignments', label: 'Assignments', icon: 'assignment' },
    { href: '/tests', label: 'Test Series', icon: 'quiz' },
    { href: '/dpp', label: 'DPP Practice', icon: 'fitness_center' },
    { href: '/doubts', label: 'Ask Doubts', icon: 'help_outline' },
    { href: '/materials', label: 'Study Library', icon: 'menu_book' },
    { href: '/recordings', label: 'Recordings', icon: 'videocam' },
    { href: '/profile', label: 'My Profile', icon: 'person' },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser, toggleRole, theme, toggleTheme }}>
      
      {/* Desktop Sidebar Navigation */}
      {!isLivePage && user && (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-900 border-r border-slate-800 flex flex-col p-4 z-40 hidden md:flex transition-all duration-200">
          
          {/* PaathShalla Original Brand Header */}
          <div className="mb-6 px-2 pt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-amber-400 font-black text-xl shadow-lg border border-indigo-400/30">
              P
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white tracking-tight leading-none">PaathShalla</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  isTeacher ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {isTeacher ? 'Teacher Portal' : 'Student LMS'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links with Active States */}
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar pr-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                    active
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 border border-indigo-400/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer User & Role Actions */}
          <div className="mt-auto border-t border-slate-800 pt-3 flex flex-col gap-2">
            <button
              onClick={toggleRole}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              <span>{isTeacher ? 'Switch to Student View' : 'Switch to Teacher View'}</span>
            </button>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  className="w-9 h-9 rounded-full border border-slate-700 object-cover shrink-0"
                  alt={user.name}
                  src={user.avatarUrl}
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-white truncate">{user.name}</p>
                  <span className="text-[9px] font-bold text-slate-400 truncate block">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined text-sm">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Desktop Top Header */}
      {!isLivePage && user && (
        <header className="hidden md:flex sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 ml-64 px-6 h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs font-medium">
              PaathShalla &gt; <strong className="text-white capitalize">{pathname.replace('/', '').replace('teacher/', '') || 'Dashboard'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleRole}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/20 transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
              <span>{isTeacher ? 'Teacher Mode' : 'Student Mode'}</span>
            </button>

            <Link
              href="/live"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-sm shadow-indigo-600/20"
            >
              <span className="material-symbols-outlined text-base">sensors</span>
              <span>Live Classroom</span>
            </Link>

            <div className="h-6 w-px bg-slate-800"></div>

            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                alt={user.name}
                src={user.avatarUrl}
              />
              <span className="font-bold text-xs text-white">{user.name}</span>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Top Header */}
      {!isLivePage && user && (
        <header className="md:hidden w-full sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-amber-400 font-black text-base shadow-sm">
              P
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-white leading-none">PaathShalla</h1>
              <span className="text-[9px] text-amber-400 font-extrabold uppercase">
                {isTeacher ? 'Teacher' : 'Student'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
            >
              <span className="material-symbols-outlined text-sm">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button 
              onClick={toggleRole}
              className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-amber-500/30 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">swap_horiz</span>
              <span>{isTeacher ? 'Teacher' : 'Student'}</span>
            </button>
          </div>
        </header>
      )}

      {/* Slide-over Notification Center Drawer */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full flex flex-col p-4 shadow-2xl animate-fade-in-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">notifications</span>
                <h3 className="font-bold text-white text-sm">Notification Center</h3>
              </div>
              <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="flex justify-between items-center py-2 text-xs">
              <span className="text-slate-400">{unreadCount} unread</span>
              <button onClick={markAllNotificationsRead} className="text-indigo-400 font-bold hover:underline">
                Mark all as read
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                    n.unread
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-amber-400">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-slate-300">{n.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 relative z-10 ${isLivePage ? '' : 'md:ml-64 pb-24 md:pb-12'}`}>
        <div className="max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Student & Teacher Specific) */}
      {!isLivePage && user && (
        <nav className="md:hidden fixed bottom-0 w-full z-40 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-1 pt-2 pb-4">
          {!isTeacher ? (
            <>
              <Link 
                href="/dashboard"
                className={`flex flex-col items-center justify-center px-2 py-1 ${
                  pathname === '/dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span className="text-[10px] mt-0.5">Home</span>
              </Link>

              <Link 
                href="/courses"
                className={`flex flex-col items-center justify-center px-2 py-1 ${
                  pathname === '/courses' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">school</span>
                <span className="text-[10px] mt-0.5">Classes</span>
              </Link>

              <Link 
                href="/live"
                className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl ${
                  pathname === '/live' 
                    ? 'bg-red-600 text-white font-extrabold shadow-md' 
                    : 'bg-red-500/20 text-red-400 font-bold border border-red-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-lg">sensors</span>
                <span className="text-[10px] mt-0.5">LIVE</span>
              </Link>

              <Link 
                href="/tests"
                className={`flex flex-col items-center justify-center px-2 py-1 ${
                  pathname === '/tests' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">quiz</span>
                <span className="text-[10px] mt-0.5">Tests</span>
              </Link>

              <Link 
                href="/profile"
                className={`flex flex-col items-center justify-center px-2 py-1 ${
                  pathname === '/profile' ? 'text-indigo-400 font-bold' : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">person</span>
                <span className="text-[10px] mt-0.5">Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/dashboard"
                className={`flex flex-col items-center justify-center px-2 py-1 ${
                  pathname === '/dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span className="text-[10px] mt-0.5">Dashboard</span>
              </Link>

              <Link 
                href="/teacher/classes"
                className={`flex flex-col items-center justify-center px-2 py-1 ${
                  pathname === '/teacher/classes' ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">class</span>
                <span className="text-[10px] mt-0.5">Classes</span>
              </Link>

              <Link 
                href="/live"
                className="flex flex-col items-center justify-center px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold shadow-md"
              >
                <span className="material-symbols-outlined text-lg">sensors</span>
                <span className="text-[10px] mt-0.5">Start Live</span>
              </Link>

              <Link 
                href="/teacher/students"
                className={`flex flex-col items-center justify-center px-2 py-1 ${
                  pathname === '/teacher/students' ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-lg">group</span>
                <span className="text-[10px] mt-0.5">Students</span>
              </Link>

              <button 
                onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
                className="flex flex-col items-center justify-center px-2 py-1 text-slate-400"
              >
                <span className="material-symbols-outlined text-lg">menu</span>
                <span className="text-[10px] mt-0.5">More</span>
              </button>
            </>
          )}
        </nav>
      )}

      {/* Teacher Mobile More Drawer */}
      {mobileMoreOpen && isTeacher && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">Teacher Quick Links</h4>
              <button onClick={() => setMobileMoreOpen(false)} className="text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
              <Link href="/teacher/attendance" onClick={() => setMobileMoreOpen(false)} className="p-3 bg-slate-800 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">how_to_reg</span> Attendance
              </Link>
              <Link href="/assignments" onClick={() => setMobileMoreOpen(false)} className="p-3 bg-slate-800 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">assignment</span> Assignments
              </Link>
              <Link href="/teacher/announcements" onClick={() => setMobileMoreOpen(false)} className="p-3 bg-slate-800 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">campaign</span> Announcements
              </Link>
              <Link href="/teacher/analytics" onClick={() => setMobileMoreOpen(false)} className="p-3 bg-slate-800 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">analytics</span> Analytics
              </Link>
            </div>
          </div>
        </div>
      )}

    </AuthContext.Provider>
  );
}
