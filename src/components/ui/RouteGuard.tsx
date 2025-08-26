'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/signup',
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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const publicRoute = isPublicRoute(pathname);
    
    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && !publicRoute) {
      showAuthModal();
      return;
    }

    // If user is authenticated and on landing page, redirect to notes
    if (isAuthenticated && pathname === '/') {
      // Use silent redirect without global loading
      router.replace('/notes');
      return;
    }

  }, [isLoading, isAuthenticated, pathname, router, showAuthModal]);

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