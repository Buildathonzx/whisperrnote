"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ui/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, showAuthModal } = useAuth();
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Only run once to prevent loops
    if (hasRunRef.current || isLoading) return;
    hasRunRef.current = true;

    if (isAuthenticated) {
      router.push('/notes');
    } else {
      showAuthModal();
    }
  }, [isAuthenticated, isLoading, router, showAuthModal]);

  // Don't render anything - just redirect
  return null;
}