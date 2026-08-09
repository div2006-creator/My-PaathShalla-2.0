'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';

export default function LoginPage() {
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'TEACHER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/dashboard');
  
  const router = useRouter();
  const { isAuthenticated, refreshUser } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errParam = params.get('error');
      const roleParam = params.get('role');
      const redParam = params.get('redirect');

      if (errParam) setError(errParam);
      if (roleParam) setRole(roleParam.toUpperCase());
      if (redParam) setRedirectUrl(redParam);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const handleToggleRole = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleGoogleLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/api/auth/google?role=${role}`;
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      await refreshUser();
      router.push(redirectUrl);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-screen relative z-10 overflow-hidden bg-slate-950 text-white">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Main Form container */}
      <div className="w-full max-w-md flex flex-col items-center z-10 space-y-6">
        
        {/* Logo & Brand Header */}
        <div className="w-full flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-amber-400 font-black text-3xl shadow-xl border border-indigo-400/30">
            P
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">PaathShalla 2.0</h1>
          <p className="text-xs text-slate-400 font-bold">Google-Verified EdTech Classroom Platform</p>
        </div>

        {/* Role Selection Switcher */}
        <div className="w-full bg-slate-900 rounded-xl p-1 flex border border-slate-800">
          <button 
            type="button"
            className={`flex-1 py-2.5 px-4 rounded-lg font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              role === 'STUDENT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`} 
            onClick={() => handleToggleRole('STUDENT')}
          >
            <span className="material-symbols-outlined text-base">person</span>
            <span>Student Portal</span>
          </button>
          <button 
            type="button"
            className={`flex-1 py-2.5 px-4 rounded-lg font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              role === 'TEACHER'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`} 
            onClick={() => handleToggleRole('TEACHER')}
          >
            <span className="material-symbols-outlined text-base">history_edu</span>
            <span>Teacher Portal</span>
          </button>
        </div>

        {/* Login/Register Card */}
        <div className="w-full bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
          
          {/* Security & Access Notice */}
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span>Google Identity & Role Policy</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Teacher Portal access is reserved exclusively for verified faculty (<strong className="text-amber-400">sharmadiv7880@gmail.com</strong>). All other accounts are automatically enrolled as Students.
            </p>
          </div>

          {/* Primary Google OAuth Button */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl transition-all font-extrabold text-xs shadow-lg active:scale-[0.98] border border-white"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Register / Sign In with Google ({role === 'TEACHER' ? 'Teacher' : 'Student'})</span>
            </button>
          </div>

          {/* Social Divider */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span>EXISTING VERIFIED USERS</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl text-xs font-bold border border-red-500/30">
              {error}
            </div>
          )}

          {/* Existing User Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Registered Email Address</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" 
                placeholder="Enter your verified email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-3 rounded-xl border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Sign In with Registered Email'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}
