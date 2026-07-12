'use client';

import React, { useState } from 'react';
import { Grid3X3, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    is_active: boolean;
  } | null>(null);
  const [tokens, setTokens] = useState<{
    access_token: string;
    refresh_token: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUser(null);
    setTokens(null);

    try {
      // Login — sends form-urlencoded as OAuth2PasswordRequestForm expects
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
        setError(loginData.detail || 'Login failed');
        setIsLoading(false);
        return;
      }

      setTokens(loginData);

      // Store tokens for auth guard
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('refresh_token', loginData.refresh_token);

      // Fetch /auth/me to get full user profile
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      });

      const meData = await meRes.json();

      if (meRes.ok) {
        setUser(meData);

        // Redirect to role-based route after a short delay
        const roleRouteMap: Record<string, string> = {
          FLEET_MANAGER: '/fleet-manager',
          DISPATCHER: '/dispatcher',
          SAFETY_OFFICER: '/safety-officer',
          FINANCIAL_ANALYST: '/financial-analyst',
        };
        const route = roleRouteMap[meData.role] || '/';
        setTimeout(() => {
          window.location.href = route;
        }, 1200);
      }
    } catch {
      setError('Cannot reach the backend. Is uvicorn running on port 8000?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#cfd5dc] flex-col justify-between p-12 text-[#1a1a1a]">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="text-[#a16222]">
              <Grid3X3 size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">TransitOps</h1>
              <p className="text-sm font-medium text-gray-600 mt-1">Smart Transport Operations Platform</p>
            </div>
          </div>

          <div className="mt-24 max-w-md">
            <h2 className="text-2xl font-semibold mb-6">One login, four roles:</h2>
            <ul className="space-y-4 text-lg">
              {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map((roleItem) => (
                <li key={roleItem} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a16222]"></span>
                  <span className="font-medium text-gray-800">{roleItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          TRANSITOPS © 2026 · RBAC ENABLED
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-[#141414] text-gray-100 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto relative">
          
          {/* Success State — shown after login */}
          {user && (
            <div className="absolute -right-4 top-0 translate-x-full hidden xl:block w-72 bg-[#0f1f0f] border border-green-900/50 rounded-lg p-4 shadow-xl">
              <div className="text-xs text-gray-400 mb-2">Authenticated ✓</div>
              <div className="space-y-1.5 text-sm text-green-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="text-green-500/80 text-xs pl-5">{user.email}</div>
                <div className="text-green-500/80 text-xs pl-5">Role: <span className="font-mono font-semibold text-green-400">{user.role}</span></div>
                <div className="text-green-500/80 text-xs pl-5">Active: {user.is_active ? 'Yes' : 'No'}</div>
              </div>
            </div>
          )}

          {/* Error State Snippet — desktop */}
          {error && !user && (
            <div className="absolute -right-4 top-0 translate-x-full hidden xl:block w-64 bg-[#1e1313] border border-red-900/50 rounded-lg p-4 shadow-xl">
              <div className="text-xs text-gray-400 mb-1">Error state</div>
              <div className="flex gap-2 items-start text-red-500 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="leading-tight">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2">Sign in to your account</h2>
            <p className="text-gray-400 text-sm">Enter your credentials to continue</p>
          </div>

          {/* Mobile Error State */}
          {error && !user && (
            <div className="xl:hidden flex gap-2 items-start text-red-400 text-sm mb-6 bg-red-500/10 p-3 rounded-md border border-red-500/20">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Mobile Success State */}
          {user && (
            <div className="xl:hidden flex gap-2 items-start text-green-400 text-sm mb-6 bg-green-500/10 p-3 rounded-md border border-green-500/20">
              <CheckCircle2 size={18} className="shrink-0" />
              <p>Logged in as <strong>{user.name}</strong> — Role: <span className="font-mono">{user.role}</span></p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fleet@transitops.demo"
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#a16222] focus:ring-1 focus:ring-[#a16222] transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#a16222] focus:ring-1 focus:ring-[#a16222] transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-700 bg-[#1a1a1a] group-hover:border-gray-500 transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <svg className="w-3.5 h-3.5 text-[#a16222] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
              
              <a href="#" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</a>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9f5e1f] hover:bg-[#8a511a] text-white font-medium py-3 rounded-md transition-colors mt-4 flex justify-center items-center h-12"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-800/50">
            <p className="text-xs text-gray-500 mb-4">Access is scoped by role after login:</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><span className="text-gray-300">• Fleet Manager</span> &rarr; Fleet, Maintenance</li>
              <li><span className="text-gray-300">• Dispatcher</span> &rarr; Dashboard, Trips</li>
              <li><span className="text-gray-300">• Safety Officer</span> &rarr; Drivers, Compliance</li>
              <li><span className="text-gray-300">• Financial Analyst</span> &rarr; Fuel &amp; Expenses, Analytics</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
