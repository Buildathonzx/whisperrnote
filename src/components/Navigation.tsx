'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  PlusCircleIcon, 
  ShareIcon, 
  UserIcon,
  TagIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  PowerIcon,
} from '@heroicons/react/24/outline';
import { useOverlay } from '@/components/ui/OverlayContext';
import { useAuth } from '@/components/ui/AuthContext';
import CreateNoteForm from '@/app/(app)/notes/CreateNoteForm';

interface NavigationProps {
  toggleTheme?: () => void;
  isDarkMode?: boolean;
  className?: string;
}

export const MobileBottomNav: React.FC<NavigationProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { openOverlay } = useOverlay();

  const handleCreateClick = () => {
    // Open the actual CreateNoteForm overlay
    openOverlay(
      <CreateNoteForm 
        onNoteCreated={(newNote) => {
          // Handle the note creation - could refresh a global state or navigate
          console.log('Note created:', newNote);
        }} 
      />
    );
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  return (
    <footer className={`fixed bottom-4 left-4 right-4 z-50 md:hidden ${className}`}>
      <nav className="bg-light-card dark:bg-dark-card border-2 border-light-border dark:border-dark-border rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="flex justify-around items-center">
          <a 
            href="/notes" 
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${
              isActive('/notes') 
                ? 'text-white bg-accent shadow-lg transform -translate-y-0.5' 
                : 'text-light-fg dark:text-dark-fg hover:bg-light-bg dark:hover:bg-dark-bg hover:transform hover:-translate-y-0.5'
            }`}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs font-semibold">Notes</span>
          </a>
          
          <button 
            onClick={() => {/* Open search drawer */}}
            className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl text-light-fg dark:text-dark-fg hover:bg-light-bg dark:hover:bg-dark-bg transition-all duration-200 hover:transform hover:-translate-y-0.5"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
            <span className="text-xs font-semibold">Search</span>
          </button>
          
          <button 
            onClick={handleCreateClick}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-accent to-accent/80 text-white rounded-2xl shadow-lg hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-200"
          >
            <PlusCircleIcon className="h-7 w-7" />
          </button>
          
          <a 
            href="/shared" 
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${
              isActive('/shared') 
                ? 'text-white bg-accent shadow-lg transform -translate-y-0.5' 
                : 'text-light-fg dark:text-dark-fg hover:bg-light-bg dark:hover:bg-dark-bg hover:transform hover:-translate-y-0.5'
            }`}
          >
            <ShareIcon className="h-6 w-6" />
            <span className="text-xs font-semibold">Shared</span>
          </a>
          
          <a 
            href="/profile" 
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${
              isActive('/profile') 
                ? 'text-white bg-accent shadow-lg transform -translate-y-0.5' 
                : 'text-light-fg dark:text-dark-fg hover:bg-light-bg dark:hover:bg-dark-bg hover:transform hover:-translate-y-0.5'
            }`}
          >
            <UserIcon className="h-6 w-6" />
            <span className="text-xs font-semibold">Profile</span>
          </a>
        </div>
      </nav>
    </footer>
  );
};

export const DesktopSidebar: React.FC<NavigationProps> = ({ 
  toggleTheme, 
  isDarkMode, 
  className = '' 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { openOverlay } = useOverlay();
  const { user, isAuthenticated, logout } = useAuth();

  const handleCreateClick = () => {
    openOverlay(
      <CreateNoteForm 
        onNoteCreated={(newNote) => {
          // Handle the note creation - could refresh a global state or navigate
          console.log('Note created:', newNote);
        }} 
      />
    );
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  const navItems = [
    { icon: HomeIcon, label: 'My Notes', path: '/notes' },
    { icon: ShareIcon, label: 'Shared with Me', path: '/shared' },
    { icon: TagIcon, label: 'Tags', path: '/tags' },
    { icon: DocumentTextIcon, label: 'Blog', path: '/blog' },
    { icon: PuzzlePieceIcon, label: 'Extensions', path: '/extensions' },
    { icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-light-card dark:bg-dark-card border-r-2 border-light-border dark:border-dark-border shadow-[inset_-1px_0_0_rgba(255,255,255,0.1),2px_0_8px_rgba(0,0,0,0.08)] z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'} ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b-2 border-light-border dark:border-dark-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center shadow-lg">
              <DocumentTextIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-light-fg dark:text-dark-fg bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              WhisperNote
            </h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg text-light-fg dark:text-dark-fg transition-all duration-200 hover:shadow-md"
        >
          {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Create Button */}
      <div className="p-6 border-b border-light-border dark:border-dark-border">
        <button
          onClick={handleCreateClick}
          className={`w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white rounded-2xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:transform hover:-translate-y-0.5 ${isCollapsed ? 'px-3' : ''}`}
        >
          <PlusCircleIcon className="h-6 w-6" />
          {!isCollapsed && <span>Create Note</span>}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group ${
                active 
                  ? 'bg-accent text-white shadow-lg transform translate-x-1' 
                  : 'text-light-fg dark:text-dark-fg hover:bg-light-bg dark:hover:bg-dark-bg hover:transform hover:translate-x-0.5'
              } ${isCollapsed ? 'justify-center px-3' : ''}`}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              {!isCollapsed && <span className="font-semibold">{item.label}</span>}
              {active && !isCollapsed && (
                <div className="w-1 h-6 bg-white rounded-full ml-auto"></div>
              )}
            </a>
          );
        })}
      </nav>

      {/* User Profile & Controls */}
      <div className="p-6 border-t border-light-border dark:border-dark-border space-y-4">
        {/* Theme Toggle */}
        {toggleTheme && (
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <span className="text-sm font-medium text-light-fg dark:text-dark-fg">Theme</span>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg text-light-fg dark:text-dark-fg transition-all duration-200"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        )}

        {/* User Info */}
        {isAuthenticated && user && (
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center text-white font-bold">
              {user.name ? user.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-light-fg dark:text-dark-fg truncate">
                  {user.name || user.email || 'User'}
                </p>
                <p className="text-xs text-light-fg/70 dark:text-dark-fg/70 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        {isAuthenticated && (
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-light-fg dark:text-dark-fg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ${isCollapsed ? 'justify-center px-3' : ''}`}
          >
            <PowerIcon className="h-5 w-5" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

// Default export that includes both components
export default function Navigation({ toggleTheme, isDarkMode }: NavigationProps) {
  return (
    <>
      <DesktopSidebar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <MobileBottomNav />
    </>
  );
}
