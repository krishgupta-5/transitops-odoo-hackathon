'use client';

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";

export default function FleetManagerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

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

  const navItems = [
    { name: 'Dashboard', href: '/fleet-manager' },
    { name: 'Vehicles', href: '/fleet-manager/vehicles' },
    { name: 'Drivers', href: '/fleet-manager/drivers' },
  ];

  return (
    <div className="flex h-screen bg-[#111111] text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 font-serif italic">TransitOps</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/fleet-manager' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'border border-orange-500/50 bg-orange-500/10 text-orange-400 font-medium'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#111111]">
          <div className="w-96">
            <Input 
              placeholder="Search fleet..." 
              className="bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 h-9 rounded-md focus-visible:ring-zinc-600"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-300">{user?.name || 'Loading...'}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-purple-400 border border-purple-400/30 bg-purple-400/10 px-2 py-1 rounded">
                {user?.role === 'FLEET_MANAGER' ? 'Fleet Manager' : user?.role || '...'}
              </span>
              <Avatar className="h-8 w-8 bg-zinc-700">
                <AvatarFallback className="text-xs bg-zinc-700 text-zinc-200">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
