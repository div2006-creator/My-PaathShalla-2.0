'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ClientLayout';

export default function LoginPage() {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  const handleToggleRole = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { email, password } 
        : { name, email, password, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      await refreshUser();
      router.push('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-container-margin py-stack-lg min-h-screen relative z-10 overflow-hidden">
      {/* Full Background Classroom Illustration */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <img 
          className="w-full h-full object-cover opacity-50" 
          alt="Traditional Classroom Background" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBI5DhJ4ShKoWGst84yiFVN3w31WZAaFh-Mt8axaKcsTSh5aInzsYREPdeYKJrP0dM0OOFdaxIPb5qdIpqTPK9upTPz4x6k0XEm4ps0m8-cGlzb2GtWbQZmTde1C71hWiPG54xgtYnKGS34qiUKeQ2Y-tqcQfvQedVWHv22ROxnrU0XzfVQogsbEy2uPmumMN0zpnK0OC8BjRZY0ObKgFDa8pulc8c41mi-bnFWXsGXVDSqsI-UMxEgtPNALRI_lkA36GoZgZjsoc"
        />
        {/* Soft radial vignette overlay to keep form inputs highly legible */}
        <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-background/40 to-background/70"></div>
      </div>

      {/* Blur Accents */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl z-10"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl z-10"></div>

      {/* Main Form container */}
      <div className="w-full max-w-sm flex flex-col items-center z-10">
        
        {/* Logo Section */}
        <div className="w-full flex flex-col items-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 mb-4 relative">
            <div className="absolute inset-0 bg-primary rounded-full opacity-10 animate-pulse"></div>
            <div className="w-full h-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined !text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
          </div>
          <h1 className="font-display-lg text-headline-md text-primary tracking-tight">My PaathShalla</h1>
          <p className="font-title-lg text-[16px] text-on-surface-variant opacity-80 mt-1">Your Classroom, Anywhere</p>
        </div>

        {/* Role Selection */}
        <div className="w-full bg-surface-container-low rounded-xl p-1 flex mb-6 border border-outline-variant/30">
          <button 
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all duration-300 ${
              role === 'student' ? 'active-role' : 'text-on-surface-variant'
            }`} 
            onClick={() => handleToggleRole('student')}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            Student
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all duration-300 ${
              role === 'teacher' ? 'active-role' : 'text-on-surface-variant'
            }`} 
            onClick={() => handleToggleRole('teacher')}
          >
            <span className="material-symbols-outlined text-[18px]">history_edu</span>
            Teacher
          </button>
        </div>

        {/* Login/Register Card */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-stack-md shadow-[0_8px_30px_rgb(0,6,102,0.05)] border border-outline-variant/20 relative overflow-hidden paper-layer">
          
          {error && (
            <div className="mb-4 p-3 bg-error-container/20 text-error rounded-lg text-body-md border border-error/10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-stack-md">
            
            {mode === 'register' && (
              <div className="relative">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Full Name</label>
                <input 
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 px-1 font-body-md transition-all placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
                  placeholder="Enter your name" 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="relative">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Email Address</label>
              <input 
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 px-1 font-body-md transition-all placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
                placeholder="Enter your email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 ml-1">Password</label>
              <input 
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 px-1 font-body-md transition-all placeholder:text-outline/50 focus:ring-0 focus:outline-none" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {mode === 'login' && (
              <div className="flex justify-end pt-1">
                <button type="button" className="font-label-md text-label-md text-primary-container hover:underline">Forgot Password?</button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-stack-sm pt-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-primary text-on-primary font-title-lg text-title-lg py-4 rounded-xl shadow-md hover:scale-[0.98] transition-transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
                {!submitting && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
              </button>
              
              <button 
                type="button"
                className="w-full bg-secondary-container text-on-secondary-container font-title-lg text-title-lg py-4 rounded-xl shadow-sm hover:scale-[0.98] transition-transform active:scale-95"
                onClick={handleToggleMode}
              >
                {mode === 'login' ? 'Create Account' : 'Back to Login'}
              </button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="mt-6 mb-4 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-outline-variant opacity-50"></div>
            <span className="font-label-md text-label-md text-outline">OR</span>
            <div className="flex-1 h-[1px] bg-outline-variant opacity-50"></div>
          </div>

          {/* Google Login Button */}
          <div className="w-full">
            <button 
              type="button"
              onClick={() => {
                window.location.href = `/api/auth/google?role=${role}`;
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-outline-variant/60 rounded-xl hover:bg-surface-container transition-all duration-200 font-title-lg text-title-md text-on-surface shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <div className="inline-block px-4 py-2 bg-primary-fixed-dim/20 rounded-full">
            <p className="font-label-md text-label-md text-primary opacity-80">
              Trusted by 5,000+ PaathShallas nationwide
            </p>
          </div>
        </div>

      </div>

      {/* Background decoration replaced with full screen image */}
    </div>
  );
}
