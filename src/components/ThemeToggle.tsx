"use client";

import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ 
  className = '', 
  size = 'md', 
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'w-8 h-5',
    md: 'w-10 h-6', 
    lg: 'w-12 h-7'
  };

  const knobSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-foreground">
          {isDark ? 'Dark' : 'Light'} Mode
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center ${sizeClasses[size]} 
          rounded-full border-2 border-border bg-card
          transition-all duration-300 ease-in-out
          hover:shadow-3d-light dark:hover:shadow-3d-dark
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
          focus:ring-offset-background
          ${isDark ? 'justify-end' : 'justify-start'}
        `}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        type="button"
      >
        {/* Background gradient */}
        <div 
          className={`
            absolute inset-0 rounded-full transition-all duration-300
            ${isDark 
              ? 'bg-gradient-to-r from-dark-card to-accent/20' 
              : 'bg-gradient-to-r from-accent/20 to-light-card'
            }
          `}
        />
        
        {/* Toggle knob */}
        <div 
          className={`
            relative ${knobSizeClasses[size]} rounded-full
            border border-border bg-background
            shadow-inner-light dark:shadow-inner-dark
            transition-all duration-300 ease-in-out
            flex items-center justify-center
            ${isDark ? 'translate-x-0' : 'translate-x-0'}
          `}
        >
          {/* Icon */}
          {isDark ? (
            <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
}