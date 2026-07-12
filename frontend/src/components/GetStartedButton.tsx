'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getAuthRoute } from '@/lib/auth';

interface GetStartedButtonProps {
  className?: string;
}

export function GetStartedButton({
  className = 'bg-black dark:bg-white text-white dark:text-black text-[14px] font-semibold px-7 py-3.5 flex items-center gap-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer',
}: GetStartedButtonProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(Boolean(token));
    }
  };

  useEffect(() => {
    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      const route = getAuthRoute();
      window.location.href = route;
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      <span>{isAuthenticated ? 'Go to Portal' : 'Get Started'}</span>
      <ArrowRight size={16} />
    </button>
  );
}
export default GetStartedButton;
