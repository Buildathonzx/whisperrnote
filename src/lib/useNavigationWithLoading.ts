'use client';

import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/ui/LoadingContext';
import { useCallback } from 'react';

export const useNavigationWithLoading = () => {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const navigateTo = useCallback((path: string, message?: string) => {
    showLoading(message || 'Loading...');
    
    // Add a slight delay to show the loading screen
    setTimeout(() => {
      router.push(path);
      // Hide loading after navigation
      setTimeout(() => {
        hideLoading();
      }, 500); // Keep loading visible for 500ms after navigation
    }, 100);
  }, [router, showLoading, hideLoading]);

  const navigateBack = useCallback((message?: string) => {
    showLoading(message || 'Going back...');
    
    setTimeout(() => {
      router.back();
      setTimeout(() => {
        hideLoading();
      }, 500);
    }, 100);
  }, [router, showLoading, hideLoading]);

  const navigateReplace = useCallback((path: string, message?: string) => {
    showLoading(message || 'Loading...');
    
    setTimeout(() => {
      router.replace(path);
      setTimeout(() => {
        hideLoading();
      }, 500);
    }, 100);
  }, [router, showLoading, hideLoading]);

  return {
    navigateTo,
    navigateBack,
    navigateReplace,
    showLoading,
    hideLoading,
  };
};