'use client';

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api";
import { Sidebar, DEFAULT_SAFETY_NAV_ITEMS } from "@/components/Sidebar";

interface UserProfile {
  name?: string;
  role?: string;
}

export default function SafetyOfficerLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verifySession = () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login';
        return false;
      }
      return true;
    };

    if (!verifySession()) return;

    window.addEventListener('storage', verifySession);
    window.addEventListener('focus', verifySession);

    async function fetchUser() {
      try {
        const data = await apiClient('/auth/me');
        if (isMounted && data) {
          setUser(data);
        }
      } catch {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    fetchUser();

    return () => {
      isMounted = false;
      window.removeEventListener('storage', verifySession);
      window.removeEventListener('focus', verifySession);
    };
  }, []);

  const displayName = user?.name || 'Demo Safety Officer';
  const avatarInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'SO';

  return (
    <div className="flex h-screen bg-[#F4F4F5] dark:bg-[#070707] text-gray-900 dark:text-gray-100 overflow-hidden font-sans p-3 gap-3 transition-colors">
      {/* Floating Sidebar Card */}
      <Sidebar
        navItems={DEFAULT_SAFETY_NAV_ITEMS}
        roleName="Safety Officer"
        profileHref="/safety-officer/profile"
        user={user}
      />

      {/* Floating Main Content Card */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0F0F0F] shadow-sm">
        {/* Sleek Minimal Header */}
        <header className="h-14 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between px-6 shrink-0">
          <div className="text-xs font-semibold tracking-wide text-gray-400 dark:text-gray-500">
            Safety & Maintenance Portal
          </div>
          <Link
            href="/safety-officer/profile"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <span suppressHydrationWarning className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
              {displayName}
            </span>
            <Avatar className="h-7 w-7 rounded-full border-0 bg-transparent">
              <AvatarFallback suppressHydrationWarning className="bg-gray-100 dark:bg-white/10 text-[11px] font-semibold text-gray-700 dark:text-gray-200 rounded-full group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </header>

        {/* Clean Page Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
