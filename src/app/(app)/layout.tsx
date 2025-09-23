"use client";

import React from 'react';
import { DesktopSidebar, MobileBottomNav } from '@/components/Navigation';
import AppHeader from '@/components/AppHeader';
import { SidebarProvider, useSidebar } from '@/components/ui/SidebarContext';
import { DynamicSidebarProvider, useDynamicSidebar, DynamicSidebar } from '@/components/ui/DynamicSidebar';
import { NotesProvider } from '@/contexts/NotesContext';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { isOpen: isDynamicSidebarOpen } = useDynamicSidebar();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header spans full width */}
      <AppHeader />
      
      {/* Main layout container */}
      <div className="pt-16">
        {/* Sidebar - now fixed positioned */}
        <DesktopSidebar />
        
        {/* Main content area - offset to account for fixed sidebar and dynamic sidebar */}
        <main className={`min-w-0 pb-24 md:pb-8 transition-all duration-300 ${
          isCollapsed ? 'md:ml-16' : 'md:ml-64'
        } ${
          isDynamicSidebarOpen 
            ? 'md:mr-[28rem] lg:mr-[32rem]' 
            : ''
        }`}>
          {/* Content wrapper with proper padding */}
          <div className="px-4 md:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Dynamic Sidebar */}
      <DynamicSidebar />
      
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
      <DynamicSidebarProvider>
        <NotesProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </NotesProvider>
      </DynamicSidebarProvider>
    </SidebarProvider>
  );
}