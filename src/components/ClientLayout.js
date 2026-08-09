'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
  toggleRole: () => {},
  theme: 'dark',
  toggleTheme: () => {},
  loginWithGoogle: (role) => {},
  requireAuth: (callback, roleNeeded) => {},
});

export const useAuth = () => useContext(AuthContext);

export default function ClientLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTitle, setAuthModalTitle] = useState('Sign In Required');
  const [authModalMessage, setAuthModalMessage] = useState('Please sign in or register with Google to perform this action.');
  const [authModalTargetRole, setAuthModalTargetRole] = useState('STUDENT');
  const [pendingCallback, setPendingCallback] = useState(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Live Class Starting Soon', msg: 'Mathematics 101 starts at 10:00 AM', time: '10m ago', unread: true, type: 'live' },
    { id: 2, title: 'New Assignment Published', msg: 'Calculus Definite Integrals Practice Set', time: '1h ago', unread: true, type: 'assignment' },
    { id: 3, title: 'Test Results Published', msg: 'Physics Full Mock Test #04 score: 18/20', time: '3h ago', unread: false, type: 'test' },
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
      if (data && data.isAuthenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Failed to fetch auth state', e);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    setMobileSidebarOpen(false);
  }, [pathname]);

  const isTeacherEmail = (email) => (email || '').trim().toLowerCase() === 'sharmadiv7880@gmail.com';

  const toggleRole = () => {
    if (!user) return;
    if (!isTeacherEmail(user.email)) {
      setAuthModalTitle('Teacher Account Required');
      setAuthModalMessage('This action requires a Teacher account.');
      setAuthModalTargetRole('TEACHER');
      setAuthModalOpen(true);
      return;
    }
    setUser((prev) => {
      const newRole = prev?.role === 'TEACHER' ? 'STUDENT' : 'TEACHER';
      return { ...prev, role: newRole };
    });
  };

  const logout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    router.push('/dashboard');
  };

  const loginWithGoogle = (role = 'STUDENT') => {
    if (typeof window !== 'undefined') {
      window.location.href = `/api/auth/google?role=${role}`;
    }
  };

  const requireAuth = (callback, roleNeeded = 'STUDENT') => {
    if (isAuthenticated && user) {
      if (roleNeeded === 'TEACHER' && !isTeacherEmail(user.email)) {
        setAuthModalTitle('Teacher Account Required');
        setAuthModalMessage('This action requires a Teacher account.');
        setAuthModalTargetRole('TEACHER');
        setPendingCallback(() => callback);
        setAuthModalOpen(true);
        return false;
      }
      if (callback) callback();
      return true;
    } else {
      setAuthModalTitle(roleNeeded === 'TEACHER' ? 'Teacher Sign In Required' : 'Sign In Required');
      setAuthModalMessage(
        roleNeeded === 'TEACHER'
          ? 'Please sign in with Google as a Teacher to access Teacher controls.'
          : 'Please sign in or register with Google to join live classroom sessions.'
      );
      setAuthModalTargetRole(roleNeeded);
      setPendingCallback(() => callback);
      setAuthModalOpen(true);
      return false;
    }
  };

  const isTeacher = user?.role === 'TEACHER';

  const teacherNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/teacher/classes', label: 'Classes', icon: 'class' },
    { href: '/live', label: 'Live Classes', icon: 'sensors' },
    { href: '/recordings', label: 'Recordings', icon: 'videocam' },
    { href: '/assignments', label: 'Assignments', icon: 'assignment' },
    { href: '/teacher/attendance', label: 'Attendance', icon: 'how_to_reg' },
    { href: '/profile', label: 'Profile', icon: 'person' },
  ];

  const studentNavItems = [
    { href: '/dashboard', label: 'Home', icon: 'dashboard' },
    { href: '/live', label: 'Live Classes', icon: 'sensors' },
    { href: '/recordings', label: 'Recordings', icon: 'videocam' },
    { href: '/assignments', label: 'Assignments', icon: 'assignment' },
    { href: '/teacher/attendance', label: 'Attendance', icon: 'how_to_reg' },
    { href: '/profile', label: 'Profile', icon: 'person' },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        logout,
        refreshUser,
        toggleRole,
        theme,
        toggleTheme,
        loginWithGoogle,
        requireAuth,
      }}
    >
      <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col relative selection:bg-indigo-500 selection:text-white">
        
        {/* Universal Desktop Left Sidebar Navigation (Always Visible on Every Page) */}
        <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-900 border-r border-slate-800 flex flex-col p-4 z-40 hidden md:flex transition-all duration-200">
          
          {/* PaathShalla Brand Header */}
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
                  {isAuthenticated ? (isTeacher ? 'Teacher Portal' : 'Student LMS') : 'Guest Explorer'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
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

          {/* Sidebar Footer User & Auth Actions */}
          <div className="mt-auto border-t border-slate-800 pt-3 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                {isTeacherEmail(user.email) && (
                  <button
                    onClick={toggleRole}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">swap_horiz</span>
                    <span>{isTeacher ? 'Switch to Student View' : 'Switch to Teacher View'}</span>
                  </button>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      className="w-9 h-9 rounded-full border border-slate-700 object-cover shrink-0"
                      alt={user.name}
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
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
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => loginWithGoogle('STUDENT')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>

                <div className="flex justify-between items-center pt-1">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Login / Register
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Toggle Theme"
                  >
                    <span className="material-symbols-outlined text-sm">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Universal Desktop Top Header (Always Visible on Every Page) */}
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
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-lg">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>

            {isAuthenticated && user ? (
              <>
                {isTeacherEmail(user.email) && (
                  <button
                    onClick={toggleRole}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/20 transition-all active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                    <span>{isTeacher ? 'Teacher Mode' : 'Student Mode'}</span>
                  </button>
                )}

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
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  />
                  <span className="font-bold text-xs text-white">{user.name}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loginWithGoogle('STUDENT')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>

                <Link
                  href="/login"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Universal Mobile Top Header with Hamburger Menu Toggle */}
        <header className="md:hidden w-full sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center justify-center"
              title="Open Navigation Menu"
            >
              <span className="material-symbols-outlined text-sm">menu</span>
            </button>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-amber-400 font-black text-base shadow-sm">
              P
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-white leading-none">PaathShalla</h1>
              <span className="text-[9px] text-amber-400 font-extrabold uppercase">
                {isAuthenticated ? (isTeacher ? 'Teacher' : 'Student') : 'Guest'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-sm">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>

            {isAuthenticated ? (
              isTeacherEmail(user?.email) && (
                <button 
                  onClick={toggleRole}
                  className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-amber-500/30 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">swap_horiz</span>
                  <span>{isTeacher ? 'Teacher' : 'Student'}</span>
                </button>
              )
            ) : (
              <button
                onClick={() => loginWithGoogle('STUDENT')}
                className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Slide-over Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex md:hidden">
            <div className="w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 h-full flex flex-col p-4 shadow-2xl animate-fade-in-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-amber-400 font-black text-base shadow-sm">
                    P
                  </div>
                  <div>
                    <h1 className="font-display text-sm font-bold text-white leading-none">PaathShalla</h1>
                    <span className="text-[9px] text-amber-400 font-extrabold uppercase">
                      Navigation Menu
                    </span>
                  </div>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
                {navItems.map((item) => {
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                        active
                          ? 'bg-indigo-600 text-white font-bold shadow-md'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-slate-800 pt-3">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2.5">
                    <img
                      className="w-9 h-9 rounded-full border border-slate-700 object-cover shrink-0"
                      alt={user.name}
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{user.name}</p>
                      <span className="text-[9px] font-bold text-slate-400 truncate block">{user.email}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => loginWithGoogle('STUDENT')}
                    className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md text-center"
                  >
                    Sign In with Google
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
          </div>
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
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-white">{n.title}</h4>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{n.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Auth Modal Gating */}
        {authModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 text-white shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-xl">lock</span>
                  <h3 className="font-bold text-white text-base font-display">{authModalTitle}</h3>
                </div>
                <button onClick={() => setAuthModalOpen(false)} className="text-slate-400 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{authModalMessage}</p>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => loginWithGoogle(authModalTargetRole)}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google ({authModalTargetRole})</span>
                </button>

                <button
                  onClick={() => {
                    setAuthModalOpen(false);
                    router.push('/login');
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all text-center block"
                >
                  Sign In with Email / Register Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Page Stage (Always Aligned to the Left Sidebar) */}
        <main className="flex-1 md:ml-64 transition-all">
          {children}
        </main>

      </div>
    </AuthContext.Provider>
  );
}
