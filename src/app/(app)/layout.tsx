"use client";

import React from 'react';
import { DesktopSidebar, MobileBottomNav } from '@/components/Navigation';
import AppHeader from '@/components/AppHeader';
import { SidebarProvider, useSidebar } from '@/components/ui/SidebarContext';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* App Header with AI Selector */}
      <AppHeader />
      
      {/* Main Content */}
      <div className={`relative pt-16 md:pt-16 pb-24 md:pb-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {children}
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