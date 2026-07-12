'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Wrench, ShieldAlert, LogOut, LayoutDashboard, User } from 'lucide-react';
import AuthGuard from '@/components/auth-guard';
import { apiClient } from '@/lib/api';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function SafetyOfficerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiClient('/auth/me');
        setUser(data);
      } catch (e) {
        // Handle unauthenticated state in apiClient which redirects to /login
      }
    }
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.replace('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/safety-officer', icon: LayoutDashboard },
    { name: 'Maintenance', href: '/safety-officer/maintenance', icon: Wrench },
    { name: 'Driver Safety', href: '/safety-officer/drivers', icon: ShieldAlert },
  ];

  return (
    <AuthGuard allowedRoles={['SAFETY_OFFICER']}>
      {() => (
        <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans">
          {/* Sidebar */}
          <aside className="w-64 border-r border-zinc-800 flex flex-col bg-[#111111] shrink-0 justify-between">
            <div>
              {/* Brand Header */}
              <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
                <div className="text-orange-500 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                  <Shield size={22} className="animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white font-serif italic">TransitOps</h1>
                  <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Safety Suite</span>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/safety-officer' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'border border-orange-500/50 bg-orange-500/10 text-orange-400 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Profile Card */}
            <div className="p-4 border-t border-zinc-800 bg-[#111111]/60 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-black shadow-md shrink-0">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'SO'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-white">{user?.name || 'Loading...'}</p>
                  <p className="text-xs text-zinc-500 truncate capitalize font-mono">Safety Officer</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-400 border border-zinc-700/50 rounded-md text-xs font-semibold tracking-wide transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Header */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#111111]/40 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {pathname === '/safety-officer'
                    ? 'Safety Dashboard'
                    : pathname.startsWith('/safety-officer/maintenance')
                    ? 'Vehicle Maintenance'
                    : 'Driver Safety Roster'}
                </h2>
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[11px] text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Work Session
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-300">{user?.name}</span>
                <span className="text-xs font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10 px-2 py-1 rounded">
                  Safety Officer
                </span>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto p-8 relative bg-[#0d0d0d]">
              {children}
            </main>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
