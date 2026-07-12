'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Fuel,
  DollarSign,
  BarChart3,
  MapPin,
  Wrench,
  ShieldAlert,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { clearAuthSession } from '@/lib/auth';

export interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  navItems?: NavItem[];
  roleName?: string;
  profileHref?: string;
  user?: {
    name?: string;
    role?: string;
  } | null;
}

export const DEFAULT_FLEET_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/fleet-manager', icon: <LayoutDashboard size={18} /> },
  { name: 'Vehicles', href: '/fleet-manager/vehicles', icon: <Truck size={18} /> },
  { name: 'Drivers', href: '/fleet-manager/drivers', icon: <Users size={18} /> },
  { name: 'Maintenance', href: '/fleet-manager/maintenance', icon: <Wrench size={18} /> },
  { name: 'Fuel & Expenses', href: '/fleet-manager/fuel-expenses', icon: <DollarSign size={18} /> },
  { name: 'Analytics', href: '/fleet-manager/analytics', icon: <BarChart3 size={18} /> },
  { name: 'Profile Settings', href: '/fleet-manager/profile', icon: <UserCog size={18} /> },
];

export const DEFAULT_FINANCIAL_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/financial-analyst', icon: <LayoutDashboard size={18} /> },
  { name: 'Fuel Logs', href: '/financial-analyst/fuel-logs', icon: <Fuel size={18} /> },
  { name: 'Expenses', href: '/financial-analyst/expenses', icon: <DollarSign size={18} /> },
  { name: 'Analytics', href: '/financial-analyst/analytics', icon: <BarChart3 size={18} /> },
  { name: 'Profile Settings', href: '/financial-analyst/profile', icon: <UserCog size={18} /> },
];

export const DEFAULT_DISPATCHER_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/dispatcher', icon: <LayoutDashboard size={18} /> },
  { name: 'Trips', href: '/dispatcher/trips', icon: <MapPin size={18} /> },
  { name: 'Fleet Status', href: '/dispatcher/fleet', icon: <Truck size={18} /> },
  { name: 'Drivers', href: '/dispatcher/drivers', icon: <Users size={18} /> },
  { name: 'Profile Settings', href: '/dispatcher/profile', icon: <UserCog size={18} /> },
];

export const DEFAULT_SAFETY_NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/safety-officer', icon: <LayoutDashboard size={18} /> },
  { name: 'Maintenance', href: '/safety-officer/maintenance', icon: <Wrench size={18} /> },
  { name: 'Driver Safety', href: '/safety-officer/drivers', icon: <ShieldAlert size={18} /> },
  { name: 'Profile Settings', href: '/safety-officer/profile', icon: <UserCog size={18} /> },
];

export function Sidebar({
  navItems = DEFAULT_FLEET_NAV_ITEMS,
  roleName = 'Fleet Manager',
  profileHref = '/fleet-manager/profile',
  user
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('transitops_sidebar_collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = (nextState: boolean) => {
    setIsCollapsed(nextState);
    localStorage.setItem('transitops_sidebar_collapsed', String(nextState));
  };

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = '/login';
  };

  return (
    <aside
      className={`${isCollapsed ? 'w-16' : 'w-56'
        } rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0F0F0F] flex flex-col justify-between font-sans shrink-0 shadow-sm overflow-hidden transition-all duration-300 relative select-none`}
    >
      <div>
        {/* Header */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.04]">
          {!isCollapsed ? (
            <>
              <Link href="/" className="flex items-center gap-2.5 group overflow-hidden pl-1">
                <div className="w-7 h-7 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7" />
                  </svg>
                </div>
                <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
                  TransitOps
                </span>
              </Link>
              <button
                onClick={() => toggleSidebar(true)}
                title="Fold sidebar"
                className="w-7 h-7 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => toggleSidebar(false)}
              title="Unfold sidebar"
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer mx-auto"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1.5">
          {navItems.map((item) => {
            const isRoot = item.name === 'Dashboard' || item.href === '/fleet-manager' || item.href === '/financial-analyst';
            const isActive = isRoot
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'gap-3 px-3.5 py-2.5'
                  } rounded-xl text-xs font-semibold transition-all ${isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/[0.05]'
                  }`}
              >
                <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
                {!isCollapsed && <span className="whitespace-nowrap truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Actions */}
      <div className="p-2.5 border-t border-gray-100 dark:border-white/[0.06]">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <Link
                href={profileHref}
                className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px] hover:text-black dark:hover:text-white transition-colors"
              >
                {user?.name || roleName}
              </Link>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-1">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
export default Sidebar;
