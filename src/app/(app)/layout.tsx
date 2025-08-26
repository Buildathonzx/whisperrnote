"use client";

import React from 'react';
import { DesktopSidebar, MobileBottomNav } from '@/components/Navigation';
import AppHeader from '@/components/AppHeader';
import { SidebarProvider, useSidebar } from '@/components/ui/SidebarContext';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-x-hidden">
      {/* Header spans full width */}
      <AppHeader />
      
      {/* Main layout container */}
      <div className="pt-16">
        {/* Sidebar - now fixed positioned */}
        <DesktopSidebar />
        
        {/* Main content area - offset to account for fixed sidebar */}
        <main className={`min-w-0 pb-24 md:pb-8 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          {/* Content wrapper with proper padding */}
          <div className="px-4 md:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}