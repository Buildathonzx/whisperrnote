"use client";

import React from 'react';
import { DesktopSidebar, MobileBottomNav } from '@/components/Navigation';
import AppHeader from '@/components/AppHeader';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* App Header with AI Selector */}
      <AppHeader />
      
      {/* Main Content */}
      <div className="relative pt-16 md:pt-16 pb-24 md:pb-0">
        {children}
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}