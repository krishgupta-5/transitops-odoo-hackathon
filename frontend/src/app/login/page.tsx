'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ArrowRight } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

interface RoleInfo {
  role: string;
  name: string;
  demo_email: string;
  demo_password: string;
  route: string;
  description: string;
}

const FALLBACK_ROLES: RoleInfo[] = [
  { role: 'FLEET_MANAGER', name: 'Fleet Manager', demo_email: 'fleet@transitops.demo', demo_password: 'transitops2026', route: '/fleet-manager', description: 'Fleet & Maintenance management' },
  { role: 'DISPATCHER', name: 'Dispatcher', demo_email: 'dispatcher@transitops.demo', demo_password: 'transitops2026', route: '/dispatcher', description: 'Live Dispatch & Routing' },
  { role: 'SAFETY_OFFICER', name: 'Safety Officer', demo_email: 'safety@transitops.demo', demo_password: 'transitops2026', route: '/safety-officer', description: 'Safety & Compliance inspection' },
  { role: 'FINANCIAL_ANALYST', name: 'Financial Analyst', demo_email: 'finance@transitops.demo', demo_password: 'transitops2026', route: '/financial-analyst', description: 'Financial & Fuel analytics' },
];

const ROLE_LABEL: Record<string, string> = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export default function LoginPage() {
  const [roles, setRoles] = useState<RoleInfo[]>(FALLBACK_ROLES);
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch(`${API_BASE}/auth/roles`);
        if (res.ok) {
          const data = await res.json();
          if (data.roles && Array.isArray(data.roles)) setRoles(data.roles);
        }
      } catch {
        // Fallback silently
      }
    }
    fetchRoles();
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoleCode(e.target.value);
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
        setError(loginData.detail || 'Wrong login/password');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('refresh_token', loginData.refresh_token);

      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      });

      const meData = await meRes.json();

      if (meRes.ok) {
        setUser(meData);
        const roleRouteMap: Record<string, string> = {
          FLEET_MANAGER: '/fleet-manager',
          DISPATCHER: '/dispatcher',
          SAFETY_OFFICER: '/safety-officer',
          FINANCIAL_ANALYST: '/financial-analyst',
        };
        setTimeout(() => {
          window.location.href = roleRouteMap[meData.role] || '/';
        }, 1200);
      }
    } catch {
      setError('Connection refused.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 font-mono flex flex-col items-center transition-colors">

      {/* Structural Container matching landing page */}
      <div className="w-full max-w-[1200px] min-h-screen border-x border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#0A0A0A] flex flex-col relative transition-colors">

        {/* Centered Login Section */}
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">

          {/* Clean Flat Login Card */}
          <div className="w-full max-w-[420px] bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-gray-800 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors">

            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" className="text-black dark:text-white">
                  <path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-mono font-medium tracking-tight text-gray-900 dark:text-gray-100">Sign in to TransitOps</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 font-mono uppercase tracking-wider">Operational Access Portal</p>
            </div>

            {/* Success Banner */}
            {user && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} className="text-black" />
                <div className="flex-1">
                  <p className="font-semibold text-black">Authentication successful</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Routing to {ROLE_LABEL[user.role] || user.role}...
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && !user && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 flex items-center gap-3 text-sm text-gray-900">
                <AlertCircle size={18} className="shrink-0 text-black" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Role Dropdown */}
              <div>
                <label className="block text-[11px] font-mono font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Operational Role
                </label>
                <div className="relative">
                  <select
                    value={selectedRoleCode}
                    onChange={handleRoleChange}
                    className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-none px-4 py-3 text-[14px] text-gray-900 dark:text-gray-100 appearance-none focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all cursor-pointer bg-white dark:bg-[#0F0F0F]"
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">Select your role</option>
                    {roles.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-mono font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@transitops.demo"
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-none px-4 py-3 text-[14px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-mono font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-[12px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white underline-offset-2 hover:underline transition-all">
                    Reset
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-none px-4 py-3 text-[14px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold rounded-none py-3.5 text-[14px] transition-all hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.99] mt-6 flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate Now</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-gray-400 font-mono uppercase tracking-widest">
              © 2026 TransitOps. Secure Access Portal.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
