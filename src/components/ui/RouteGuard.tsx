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
  '/verify',
  '/login',
  '/signup'
];

const BLOG_POST_PATTERN = /^\/blog\/[^\/]+$/;

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path) || BLOG_POST_PATTERN.test(path);
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
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
      showLoading('Redirecting to login...');
      setTimeout(() => {
        router.replace('/login');
        hideLoading();
      }, 500);
      return;
    }

    // If user is authenticated and trying to access auth routes, redirect to notes
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      showLoading('Redirecting to your notes...');
      setTimeout(() => {
        router.replace('/notes');
        hideLoading();
      }, 500);
      return;
    }

    // If user is authenticated and on landing page, redirect to notes
    if (isAuthenticated && pathname === '/') {
      showLoading('Loading your workspace...');
      setTimeout(() => {
        router.replace('/notes');
        hideLoading();
      }, 500);
      return;
    }

  }, [isLoading, isAuthenticated, pathname, router, showLoading, hideLoading]);

  // Show loading during initial auth check
  if (isLoading) {
    return null; // Loading overlay will be shown by useEffect
  }

  // Show loading while redirecting
  const publicRoute = isPublicRoute(pathname);
  if (!isAuthenticated && !publicRoute) {
    return null; // Will redirect to login
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    return null; // Will redirect to notes
  }

  return <>{children}</>;
};