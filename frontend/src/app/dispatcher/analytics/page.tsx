'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsComingSoonPage() {
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dispatch Analytics
        </h1>
      </div>

      <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 rounded-3xl shadow-xs p-12 text-center">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Coming Soon</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            Route efficiency, turnaround times, and dispatcher KPI reporting are currently under active development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
