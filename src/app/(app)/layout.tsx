"use client";

import React from 'react';
import { DesktopSidebar, MobileBottomNav } from '@/components/Navigation';
import AppHeader from '@/components/AppHeader';
import { SidebarProvider, useSidebar } from '@/components/ui/SidebarContext';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-x-hidden">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Main Content Area - Dynamically adjusts to sidebar */}
      <div className={`transition-all duration-300 ${
        isCollapsed 
          ? 'md:ml-16 md:mr-0' 
          : 'md:ml-64 md:mr-0'
      }`}>
        
        {/* App Header */}
        <AppHeader />
        
        {/* Main Content - Always fits within available width */}
        <main className="pt-16 pb-24 md:pb-8 px-4 md:px-6 lg:px-8 w-full max-w-none overflow-x-hidden">
          <div className="w-full max-w-full">
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