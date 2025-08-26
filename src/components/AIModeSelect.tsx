"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, SparklesIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { AIMode, SubscriptionTier, getAIModeDisplayName, getAIModeDescription, canUseAIMode } from '@/types/ai';

interface AIModeSelectProps {
  currentMode: AIMode;
  userTier: SubscriptionTier;
  onModeChangeAction: (mode: AIMode) => void;
  className?: string;
}

export default function AIModeSelect({ currentMode, userTier, onModeChangeAction, className = '' }: AIModeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modes = [
    { mode: AIMode.STANDARD, requiresTier: SubscriptionTier.FREE },
    { mode: AIMode.CREATIVE, requiresTier: SubscriptionTier.PRO },
    { mode: AIMode.ULTRA, requiresTier: SubscriptionTier.PRO_PLUS }
  ];

  const getRequiredTierText = (mode: AIMode): string => {
    switch (mode) {
      case AIMode.CREATIVE:
        return "Pro";
      case AIMode.ULTRA:
        return "Pro+";
      default:
        return "";
    }
  };

  const handleModeSelect = (mode: AIMode) => {
    if (canUseAIMode(userTier, mode)) {
      onModeChangeAction(mode);
      setIsOpen(false);
    }
  };

  const isLocked = (mode: AIMode): boolean => !canUseAIMode(userTier, mode);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <SparklesIcon className="h-5 w-5 text-accent" />
        <span className="text-sm font-medium text-light-fg dark:text-dark-fg">
          {getAIModeDisplayName(currentMode)}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-light-fg/60 dark:text-dark-fg/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-light-border dark:border-dark-border">
            <p className="text-xs font-medium text-light-fg/70 dark:text-dark-fg/70 px-2 py-1">
              AI Generation Mode
            </p>
          </div>
          
          <div className="py-2">
            {modes.map(({ mode }) => {
              const locked = isLocked(mode);
              const isSelected = currentMode === mode;
              const requiredTierText = getRequiredTierText(mode);
              
              return (
                <button
                  key={mode}
                  onClick={() => handleModeSelect(mode)}
                  disabled={locked}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200 ${
                    locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${isSelected ? 'bg-accent/10 border-r-2 border-accent' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      mode === AIMode.STANDARD ? 'bg-green-500' :
                      mode === AIMode.CREATIVE ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-light-fg dark:text-dark-fg">
                          {getAIModeDisplayName(mode)}
                        </span>
                        {requiredTierText && (
                          <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded-md font-medium">
                            {requiredTierText}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-light-fg/60 dark:text-dark-fg/60 mt-0.5">
                        {getAIModeDescription(mode)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {locked && <LockClosedIcon className="h-4 w-4 text-light-fg/40 dark:text-dark-fg/40" />}
                    {isSelected && !locked && (
                      <div className="w-2 h-2 bg-accent rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {userTier === SubscriptionTier.FREE && (
            <div className="border-t border-light-border dark:border-dark-border p-3">
              <button className="w-full px-3 py-2 bg-gradient-to-r from-accent to-accent/80 text-white rounded-lg text-sm font-medium hover:from-accent/90 hover:to-accent/70 transition-all duration-200">
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}