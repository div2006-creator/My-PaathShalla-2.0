'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const AuthContext = createContext({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const DEFAULT_USER = {
  id: 'default-student-id',
  name: 'Aarav Mehta',
  email: 'aarav@paathshalla.com',
  role: 'STUDENT',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740'
};

export default function ClientLayout({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(DEFAULT_USER);
      }
    } catch (e) {
      console.error('Failed to fetch auth state', e);
      setUser(DEFAULT_USER);
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
      const newRole = isTeacher ? 'STUDENT' : 'TEACHER';
      return {
        id: isTeacher ? 'default-student-id' : 'default-teacher-id',
        name: isTeacher ? 'Aarav Mehta' : 'Prof. Rajesh Varma',
        email: isTeacher ? 'aarav@paathshalla.com' : 'varma@paathshalla.com',
        role: newRole,
        avatarUrl: isTeacher
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740'
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEIqpGngz3OzOf8MycyD8ZTLaDZj8xnjPRgVCZo_BCUhWDa3NIwBcaPKmokKyPL3S6SodrJ3k00KCV4brCXT5ZODgYFVbg3X5NVrYVXepnv9EzVEIq5VYzof4V0nQ2U0Kl0Rh5iR1IrGbovbIcR8JIP8VLtCkerslMF_GhMwDxYkiUm3IDBx7uK-3jrrf1ZMr1A5tAG27dHjI1ivlvZL3X2TIWsMvoDSbYK_5eOWi9pld8R8wdqGn2UyFfzFG9BFwb9l6BAqLpWEc'
      };
    });
  };

  const logout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(DEFAULT_USER);
    setLoading(false);
    router.replace('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-title-lg text-primary font-bold">Loading PaathShalla...</p>
      </div>
    );
  }

  // Login page has no shell
  if (pathname === '/login') {
    return (
      <AuthContext.Provider value={{ user, loading, logout, refreshUser, toggleRole }}>
        {children}
      </AuthContext.Provider>
    );
  }

  const isLivePage = pathname === '/live';

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
    { href: '/schedule', label: 'Schedule', icon: 'calendar_today' },
    { href: '/assignments', label: 'Assignments', icon: 'assignment' },
    { href: '/recordings', label: 'Recordings', icon: 'videocam' },
    { href: '/live', label: 'Live Gurukul', icon: 'sensors' },
  ];

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser, toggleRole }}>
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none chalk-texture z-0"></div>

      {/* Desktop Sidebar Navigation (Stitch Web Style) */}
      {!isLivePage && user && (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/60 flex-col gap-2 p-4 z-40 hidden md:flex">
          {/* Logo & Brand Header */}
          <div className="mb-6 px-3 pt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-md">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            <div>
              <h1 className="font-display-lg text-[20px] font-bold text-primary leading-tight">My Paathshala</h1>
              <p className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant opacity-75">Web Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                    active
                      ? 'bg-secondary-container text-on-secondary-container shadow-sm border border-secondary/20'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span className="text-[14px] font-label-md">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer User Card */}
          <div className="mt-auto border-t border-outline-variant/60 pt-4 flex flex-col gap-3 px-2">
            <button
              onClick={toggleRole}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-xl border border-secondary/30 hover:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              <span>{user.role === 'TEACHER' ? 'Switch to Student' : 'Switch to Teacher'}</span>
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  className="w-10 h-10 rounded-full border border-outline-variant object-cover shrink-0"
                  alt={user.name}
                  src={user.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740'}
                />
                <div className="min-w-0">
                  <p className="font-bold text-[13px] text-primary truncate">{user.name}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full inline-block">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Desktop Top Header */}
      {!isLivePage && user && (
        <header className="hidden md:flex sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/60 ml-64 px-8 h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-on-surface-variant text-[13px] font-bold capitalize">
              PaathShalla Portal &gt; <strong className="text-primary">{pathname.replace('/', '') || 'Dashboard'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleRole}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container text-[12px] font-bold border border-secondary/30 hover:scale-[0.98] transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>{user.role === 'TEACHER' ? 'Switch to Student View' : 'Switch to Teacher View'}</span>
            </button>

            <Link
              href="/live"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-[13px] font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">sensors</span>
              <span>Live Classroom</span>
            </Link>

            <div className="h-6 w-px bg-outline-variant/60"></div>

            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full border border-outline-variant object-cover"
                alt={user.name}
                src={user.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740'}
              />
              <span className="font-bold text-[13px] text-primary">{user.name}</span>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Top Header */}
      {!isLivePage && user && (
        <header className="md:hidden w-full sticky top-0 z-50 bg-surface/90 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-outline-variant/60">
          <div className="flex items-center gap-3">
            <img 
              className="w-9 h-9 rounded-full object-cover border border-outline-variant" 
              alt="User Avatar"
              src={user.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740'} 
            />
            <div>
              <h1 className="font-display-lg text-[16px] text-primary font-bold leading-tight">My Paathshala</h1>
              <p className="text-[10px] uppercase font-label-md text-on-surface-variant font-bold opacity-75">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleRole}
              className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
              <span>{user.role === 'TEACHER' ? 'Student' : 'Teacher'}</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 relative z-10 ${isLivePage ? '' : 'md:ml-64 pb-28 md:pb-12'}`}>
        <div className="max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav Bar */}
      {!isLivePage && user && (
        <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container-lowest shadow-lg border-t border-outline-variant flex justify-around items-center px-2 pt-2 pb-6">
          <Link 
            href="/dashboard"
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 active:scale-98 ${
              pathname === '/dashboard' 
                ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
            <span className="font-label-md text-[11px]">Home</span>
          </Link>

          <Link 
            href="/schedule"
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 active:scale-98 ${
              pathname === '/schedule' 
                ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/schedule' ? "'FILL' 1" : "'FILL' 0" }}>calendar_today</span>
            <span className="font-label-md text-[11px]">Schedule</span>
          </Link>

          <Link 
            href="/assignments"
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 active:scale-98 ${
              pathname === '/assignments' 
                ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/assignments' ? "'FILL' 1" : "'FILL' 0" }}>assignment</span>
            <span className="font-label-md text-[11px]">Assignments</span>
          </Link>

          <Link 
            href="/recordings"
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 active:scale-98 ${
              pathname === '/recordings' 
                ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/recordings' ? "'FILL' 1" : "'FILL' 0" }}>videocam</span>
            <span className="font-label-md text-[11px]">Recordings</span>
          </Link>
        </nav>
      )}
    </AuthContext.Provider>
  );
}
