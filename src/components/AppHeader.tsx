"use client";

import { useState, useEffect } from 'react';
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/ui/AuthContext';
// AI context removed for lazy loading
import { TopBarSearch } from '@/components/TopBarSearch';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useOverlay } from '@/components/ui/OverlayContext';
import { fetchProfilePreview, getCachedProfilePreview } from '@/lib/profilePreview';
import { getUserProfilePicId } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className = '' }: AppHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { openOverlay, closeOverlay } = useOverlay();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [smallProfileUrl, setSmallProfileUrl] = useState<string | null>(null);
  const profilePicId = getUserProfilePicId(user);

  useEffect(() => {
    // Component initialization if needed
  }, [isAuthenticated, user]);

  useEffect(() => {
    let mounted = true;
    const cached = getCachedProfilePreview(profilePicId);
    if (cached !== undefined) {
      setSmallProfileUrl(cached ?? null);
    }

    const fetchPreview = async () => {
      try {
        if (profilePicId) {
          const url = await fetchProfilePreview(profilePicId, 64, 64);
          if (mounted) setSmallProfileUrl(url as unknown as string);
        } else {
          if (mounted) setSmallProfileUrl(null);
        }
      } catch (err) {
        console.warn('Failed to load profile preview', err);
        if (mounted) setSmallProfileUrl(null);
      }
    };
    fetchPreview();
    return () => { mounted = false; };
  }, [profilePicId]);

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  const handleAIGenerateClick = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const { ensureAI } = await import('@/lib/ai/lazy');
      const ai = await ensureAI();
      const openGenerateModal = ai.getOpenGenerateModal({ openOverlay, closeOverlay });
      await openGenerateModal({
        onGenerated: () => {
          // Additional handling if needed
        }
      });
    } catch (e) {
      console.error('Failed to load AI', e);
    } finally {
      setAiLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={`fixed top-0 right-0 left-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border ${className}`}>
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Left: WhisperRNote Logo - Always at the edge */}
        <div className="flex items-center gap-3 shrink-0">
          <img 
            src="/logo/whisperrnote.png" 
            alt="WhisperRNote Logo" 
            className="w-8 h-8 rounded-lg shadow-lg"
          />
          <h1 className="hidden sm:block text-xl font-black text-foreground bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
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
              disabled={aiLoading || aiGenerating}
              className={`gap-2 ${aiLoading ? 'opacity-60 cursor-wait' : ''}`}
              variant="default"
              title={aiLoading ? 'Loading AI...' : 'Generate with AI'}
            >
              <SparklesIcon className={`h-4 w-4 ${aiLoading || aiGenerating ? 'animate-pulse' : ''}`} />
              {aiLoading ? 'Loading...' : aiGenerating ? 'Generating...' : 'AI Generate'}
            </Button>
          </div>

           {/* Account Menu Button - Mobile Only */}
           <button
             onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
             className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-card/80 transition-all duration-200"
           >
             {/* Render profile picture if available, otherwise fallback to initials */}
             {smallProfileUrl ? (
               <img
                 src={smallProfileUrl}
                 alt={user?.name || user?.email || 'Account'}
                 className="h-5 w-5 rounded-full object-cover"
               />
             ) : (
               <div className="h-5 w-5 rounded-full bg-accent/80 flex items-center justify-center text-white text-xs font-medium">
                 {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
               </div>
             )}
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
                  href="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-background transition-colors duration-200"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Settings</span>
                </a>
                
                {/* Theme Toggle */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-foreground">Theme</span>
                  <ThemeToggle size="sm" />
                </div>
                
                <div className="border-t border-border my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
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