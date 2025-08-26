"use client";

import React from 'react';
import { DesktopSidebar, MobileBottomNav } from '@/components/Navigation';
import AppHeader from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/SidebarContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-x-hidden">
        {/* Header spans full width */}
        <AppHeader />
        
        {/* Main layout container - flexbox for sidebar + content */}
        <div className="flex pt-16">
          {/* Sidebar - will take its natural width */}
          <DesktopSidebar />
          
          {/* Main content area - takes remaining space */}
          <main className="flex-1 min-w-0 pb-24 md:pb-8">
            {/* Content wrapper with proper padding */}
            <div className="px-4 md:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}