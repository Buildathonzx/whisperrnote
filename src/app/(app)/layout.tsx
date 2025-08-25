"use client";

import React, { useState } from 'react';
import { DesktopSidebar } from '@/components/Navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement theme persistence
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Desktop Sidebar */}
      <DesktopSidebar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      {/* Main Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}