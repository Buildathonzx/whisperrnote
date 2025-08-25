"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ui/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Let AuthContext handle the initial loading and auth check
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/notes');
      } else {
        router.replace('/landing');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Return null - AuthContext will show loading screen
  return null;
}