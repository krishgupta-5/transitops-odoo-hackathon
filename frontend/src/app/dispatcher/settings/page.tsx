'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DispatcherSettingsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dispatcher/profile');
  }, [router]);
  return null;
}
