'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = [
  '/',
  '/blog',
  '/reset',
  '/verify'
];

const BLOG_POST_PATTERN = /^\/blog\/[^\/]+$/;

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path) || BLOG_POST_PATTERN.test(path);
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isLoading, isAuthenticated, showAuthModal } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      showLoading('Checking authentication...');
      return;
    }

    hideLoading();

    const publicRoute = isPublicRoute(pathname);
    
    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && !publicRoute) {
      showAuthModal('login');
      return;
    }

    // If user is authenticated and on landing page, redirect to notes
    if (isAuthenticated && pathname === '/') {
      showLoading('Loading your workspace...');
      setTimeout(() => {
        router.replace('/notes');
        hideLoading();
      }, 200);
      return;
    }

  }, [isLoading, isAuthenticated, pathname, router, showAuthModal, showLoading, hideLoading]);

  // Show loading during initial auth check
  if (isLoading) {
    return null; // Loading overlay will be shown by useEffect
  }

  // For protected routes when user is not authenticated, stay on current page and show auth modal
  const publicRoute = isPublicRoute(pathname);
  if (!isAuthenticated && !publicRoute) {
    // Don't render the protected content until authenticated
    // Auth modal will handle the authentication flow
    return null;
  }

  if (isAuthenticated && pathname === '/') {
    return null; // Will redirect to notes
  }

  return <>{children}</>;
};