"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/ui/AuthContext';
import AIModeSelect from '@/components/AIModeSelect';
import { AIMode, SubscriptionTier } from '@/types/ai';
import { updateAIMode, getAIMode } from '@/lib/appwrite';

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className = '' }: AppHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentAIMode, setCurrentAIMode] = useState<AIMode>(AIMode.STANDARD);
  const [userTier, setUserTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAIMode = async () => {
      if (isAuthenticated && user) {
        try {
          const mode = await getAIMode(user.$id);
          setCurrentAIMode((mode as AIMode) || AIMode.STANDARD);
          
          // TODO: Get actual user subscription tier from user data
          // For now, defaulting to FREE
          setUserTier(SubscriptionTier.FREE);
        } catch (error) {
          console.error('Failed to load AI mode:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadAIMode();
  }, [isAuthenticated, user]);

  const handleAIModeChange = async (mode: AIMode) => {
    if (user) {
      try {
        await updateAIMode(user.$id, mode);
        setCurrentAIMode(mode);
      } catch (error) {
        console.error('Failed to update AI mode:', error);
      }
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <header className={`fixed top-0 right-0 left-0 md:left-72 z-30 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm border-b border-light-border dark:border-dark-border ${className}`}>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Add other header content here if needed */}
        </div>
        
        <div className="flex items-center gap-4">
          <AIModeSelect
            currentMode={currentAIMode}
            userTier={userTier}
            onModeChangeAction={handleAIModeChange}
          />
        </div>
      </div>
    </header>
  );
}