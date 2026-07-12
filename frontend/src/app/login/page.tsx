'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Check,
} from 'lucide-react';
import { setAuthSession, ROLE_ROUTES } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

interface RoleOption {
  role: string;
  name: string;
}

const ROLES: RoleOption[] = [
  { role: 'FLEET_MANAGER', name: 'Fleet Manager' },
  { role: 'DISPATCHER', name: 'Dispatcher' },
  { role: 'SAFETY_OFFICER', name: 'Safety Officer' },
  { role: 'FINANCIAL_ANALYST', name: 'Financial Analyst' },
];

const ROLE_LABEL: Record<string, string> = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('FLEET_MANAGER');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedRoute = localStorage.getItem('user_route');
    if (token && savedRoute && savedRoute !== '/login') {
      router.push(savedRoute);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [router]);

  const selectRole = (roleCode: string) => {
    setSelectedRole(roleCode);
    setDropdownOpen(false);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUser(null);

    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError('Invalid credentials or selected role.');
        setIsLoading(false);
        return;
      }

      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      });

      const meData = await meRes.json();

      if (!meRes.ok || !meData) {
        setError('Failed to verify account session with backend.');
        setIsLoading(false);
        return;
      }

      // Strictly validate that backend account role matches selected role
      if (meData.role && meData.role !== selectedRole) {
        setError('Invalid credentials or selected role.');
        setIsLoading(false);
        return;
      }

      setUser(meData);
      setAuthSession(loginData.access_token, loginData.refresh_token, meData.role);
      const targetRoute = ROLE_ROUTES[meData.role] || '/fleet-manager';
      window.location.href = targetRoute;
    } catch {
      setError('Connection refused. Please check backend API server.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeRoleName = ROLES.find((r) => r.role === selectedRole)?.name || 'Fleet Manager';

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#080808] text-gray-900 dark:text-gray-100 font-sans flex flex-col justify-between p-4 sm:p-6 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Header Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
            TransitOps
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-[420px] bg-white dark:bg-[#111111] border border-gray-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          {/* Card Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
              Sign in to Portal
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select your role and enter your account credentials
            </p>
          </div>

          {/* Simple Clean Role Dropdown without Icons */}
          <div className="mb-5 relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Select Role
            </label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 rounded-xl px-4 py-3 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {activeRoleName}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-gray-900 dark:text-white' : ''
                }`}
              />
            </button>

            {/* Simple Dropdown List */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-1.5 space-y-0.5">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.role;
                  return (
                    <button
                      key={role.role}
                      type="button"
                      onClick={() => selectRole(role.role)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer text-xs font-semibold ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <span>{role.name}</span>
                      {isSelected && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {user && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2.5">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Authenticated as {ROLE_LABEL[user.role] || user.role}. Redirecting...</span>
            </div>
          )}

          {/* Clean Login Form */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@transitops.demo"
                className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-medium px-4 py-3 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-xs font-medium px-4 py-3 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In to Portal'}</span>
              {!isLoading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-2">
        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
          © 2026 TransitOps Operations Platform
        </span>
      </footer>
    </div>
  );
}
