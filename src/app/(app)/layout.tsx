"use client";

import React from 'react';
import { MobileBottomNav } from '@/components/Navigation';
import AppHeader from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/SidebarContext';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-x-hidden">
      {/* Temporarily removed sidebar */}
      {/* <DesktopSidebar /> */}
      
      {/* App Header */}
      <AppHeader />
      
      {/* Main Content - Centered and using 80% width */}
      <main className="pt-16 pb-24 md:pb-8 w-full flex justify-center">
        <div className="w-full max-w-[80%] px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
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