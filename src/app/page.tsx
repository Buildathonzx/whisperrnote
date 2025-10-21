"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/ui/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, showAuthModal } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is logged in → go to notes
        router.replace('/notes');
      } else {
        // User is NOT logged in → show auth modal, not landing
        showAuthModal();
        // Don't navigate - stay at / but with auth modal open
      }
    }
  }, [isAuthenticated, isLoading, router, showAuthModal]);

  // / is completely transparent - never display anything
  return null;
}