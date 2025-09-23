'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

interface DynamicSidebarContextType {
  isOpen: boolean;
  content: ReactNode | null;
  openSidebar: (content: ReactNode) => void;
  closeSidebar: () => void;
}

const DynamicSidebarContext = createContext<DynamicSidebarContextType | undefined>(undefined);

export function DynamicSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const openSidebar = (newContent: ReactNode) => {
    setContent(newContent);
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    // Delay clearing content to allow for exit animation
    setTimeout(() => setContent(null), 300);
  };

  return (
    <DynamicSidebarContext.Provider value={{ isOpen, content, openSidebar, closeSidebar }}>
      {children}
    </DynamicSidebarContext.Provider>
  );
}

export function useDynamicSidebar() {
  const context = useContext(DynamicSidebarContext);
  if (context === undefined) {
    throw new Error('useDynamicSidebar must be used within a DynamicSidebarProvider');
  }
  return context;
}

export function DynamicSidebar() {
  const { isOpen, content, closeSidebar } = useDynamicSidebar();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full flex flex-col bg-light-bg dark:bg-dark-bg border-l border-light-border dark:border-dark-border z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full sm:w-96 md:w-[28rem] lg:w-[32rem]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-light-fg dark:text-dark-fg">
            Details
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="h-8 w-8"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {content}
        </div>
      </div>
    </>
  );
}