'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = 'Loading...',
  className = 'min-h-[50vh]',
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 w-full ${className}`}>
      <div className="w-6 h-6 border-2 border-gray-200 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 font-sans tracking-wide">
        {message}
      </span>
    </div>
  );
}
export default LoadingState;
