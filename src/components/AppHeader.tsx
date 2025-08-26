"use client";

import { useState, useEffect } from 'react';
import { UserCircleIcon, ShareIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/ui/AuthContext';
import { useAI } from '@/components/ui/AIContext';
import { TopBarSearch } from '@/components/TopBarSearch';
import { Button } from '@/components/ui/Button';

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className = '' }: AppHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isGenerating, showAIGenerateModal } = useAI();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    // Component initialization if needed
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  const handleAIGenerateClick = () => {
    showAIGenerateModal();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={`fixed top-0 right-0 left-0 z-30 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm border-b border-light-border dark:border-dark-border ${className}`}>
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Left: WhisperRNote Logo - Always at the edge */}
        <div className="flex items-center gap-3 shrink-0">
          <img 
            src="/logo/whisperrnote.png" 
            alt="WhisperRNote Logo" 
            className="w-8 h-8 rounded-lg shadow-lg"
          />
          <h1 className="hidden sm:block text-xl font-black text-light-fg dark:text-dark-fg bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
            WhisperRNote
          </h1>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <TopBarSearch />
        </div>
        
        {/* Right: AI Generate Button (Desktop) + Account Menu */}
        <div className="relative flex items-center gap-3 shrink-0">
          {/* AI Generate Button - Desktop Only */}
          <div className="hidden md:block">
            <Button 
              onClick={handleAIGenerateClick}
              disabled={isGenerating}
              className="gap-2"
              variant="default"
            >
              <SparklesIcon className="h-4 w-4" />
              AI Generate
            </Button>
          </div>

          {/* Account Menu Button */}
          <button
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-card/80 transition-all duration-200"
          >
            <UserCircleIcon className="h-5 w-5 text-foreground" />
            <span className="hidden sm:inline text-sm font-medium text-foreground">
              {user?.name || user?.email || 'Account'}
            </span>
          </button>

          {/* Account Dropdown Menu */}
          {isAccountMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsAccountMenuOpen(false)}
              />
              
              {/* Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg z-20 py-2">
                <a
                  href="/shared"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-background transition-colors duration-200"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Shared with Me</span>
                </a>
                
                <a
                  href="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-background transition-colors duration-200"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Settings</span>
                </a>
                
                <div className="border-t border-border my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}