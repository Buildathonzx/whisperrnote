'use client';

import React from 'react';
import { LoadingProvider, useLoading } from "@/components/ui/LoadingContext";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

interface AppContentProps {
  children: React.ReactNode;
}

const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const { isLoading, message } = useLoading();

  return (
    <>
      {children}
      {/* LoadingOverlay disabled - only use InitialLoadingScreen */}
    </>
  );
};

interface AppWithLoadingProps {
  children: React.ReactNode;
}

export const AppWithLoading: React.FC<AppWithLoadingProps> = ({ children }) => {
  return (
    <LoadingProvider>
      <AppContent>{children}</AppContent>
    </LoadingProvider>
  );
};