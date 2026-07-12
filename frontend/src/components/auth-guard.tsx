'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

/**
 * Auth guard component — wraps protected pages.
 * Checks for a valid access_token in localStorage.
 * Optionally restricts to specific roles.
 * Redirects to /login if unauthenticated or unauthorized.
 */
export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: (user: User) => React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'authorized' | 'forbidden'>('loading');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const fetchUser = async (accessToken: string) => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
           return await refreshAuthToken();
        }
        throw new Error('Unauthorized');
      }
      return res.json();
    };

    const refreshAuthToken = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!refreshRes.ok) throw new Error('Refresh failed');
        
        const data = await refreshRes.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // Retry fetching user with new access token
        const meRes = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
        });
        if (!meRes.ok) throw new Error('Still unauthorized after refresh');
        return meRes.json();
    };

    fetchUser(token)
      .then((data: User) => {
        if (allowedRoles && !allowedRoles.includes(data.role)) {
          setStatus('forbidden');
          return;
        }
        setUser(data);
        setStatus('authorized');
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.replace('/login');
      });
  }, [router, allowedRoles]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-[#a16222] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-gray-100 gap-4">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold">403 — Forbidden</h1>
        <p className="text-gray-400 text-sm">Your role does not have access to this page.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-[#9f5e1f] hover:bg-[#8a511a] text-white rounded-md text-sm transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{user && children(user)}</>;
}
