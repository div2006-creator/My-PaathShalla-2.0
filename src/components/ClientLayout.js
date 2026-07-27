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

export default function ClientLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to fetch auth state', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [pathname]);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname]);

  const logout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-title-lg text-primary">Loading PaathShalla...</p>
      </div>
    );
  }

  // Login page has no shell
  if (pathname === '/login') {
    return (
      <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Active live class on mobile might want full screen without top/bottom bars. Let's hide the bars on `/live` as well!
  const isLivePage = pathname === '/live';

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {/* Background Chalk Texture */}
      <div className="fixed inset-0 pointer-events-none chalk-texture z-0"></div>

      {/* Global Header */}
      {!isLivePage && user && (
        <header className="w-full sticky top-0 z-50 bg-background flex items-center justify-between px-container-margin py-stack-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary overflow-hidden border-2 border-primary-container shrink-0">
              <img 
                className="w-full h-full object-cover" 
                alt="User Avatar"
                src={user.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740'} 
              />
            </div>
            <div>
              <h1 className="font-display-lg-mobile text-[18px] text-primary font-bold leading-tight">My PaathShalla</h1>
              <p className="text-[10px] uppercase font-label-md text-on-surface-variant font-bold opacity-75">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={logout}
              className="text-primary hover:opacity-80 transition-opacity p-2 rounded-full hover:bg-surface-container active:scale-95 transition-transform duration-150 flex items-center justify-center"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:opacity-80 transition-opacity active:scale-95 transition-transform duration-150">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 relative z-10 ${isLivePage ? '' : 'pb-32'}`}>
        {children}
      </main>

      {/* Bottom Nav Bar */}
      {!isLivePage && user && (
        <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container-lowest shadow-sm border-t border-outline-variant flex justify-around items-center px-2 pt-2 pb-8">
          <Link 
            href="/dashboard"
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 active:scale-98 ${
              pathname === '/dashboard' 
                ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          
          <Link 
            href="/schedule"
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 active:scale-98 ${
              pathname === '/schedule' 
                ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/schedule' ? "'FILL' 1" : "'FILL' 0" }}>school</span>
            <span className="font-label-md text-label-md">Classes</span>
          </Link>

          <Link 
            href="/assignments"
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 active:scale-98 ${
              pathname === '/assignments' 
                ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/assignments' ? "'FILL' 1" : "'FILL' 0" }}>assignment</span>
            <span className="font-label-md text-label-md">Assignments</span>
          </Link>

          <Link 
            href="/recordings"
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all duration-200 active:scale-98 ${
              pathname === '/recordings' 
                ? 'bg-secondary-container text-on-secondary-container rounded-full' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/recordings' ? "'FILL' 1" : "'FILL' 0" }}>videocam</span>
            <span className="font-label-md text-label-md">Recordings</span>
          </Link>
        </nav>
      )}
    </AuthContext.Provider>
  );
}
