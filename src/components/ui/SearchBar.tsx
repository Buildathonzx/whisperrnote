'use client';

import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  isSearching = false,
  onClear,
  className = ''
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className={`h-5 w-5 transition-colors duration-200 ${
            isSearching ? 'text-accent animate-pulse' : 'text-foreground/40'
          }`} />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-12 py-3 sm:py-4 bg-card border border-border rounded-2xl text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 shadow-3d-light dark:shadow-3d-dark"
          placeholder={placeholder}
        />
        
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              onClear?.();
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/40 hover:text-foreground transition-colors duration-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl p-3 shadow-3d-light dark:shadow-3d-dark z-10">
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
            Searching...
          </div>
        </div>
      )}
    </div>
  );
}