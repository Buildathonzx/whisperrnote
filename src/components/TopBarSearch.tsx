"use client";

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Notes } from '@/types/appwrite-types';

interface TopBarSearchProps {
  className?: string;
}

export function TopBarSearch({ className = '' }: TopBarSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Notes[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Replace with actual search API call
      // For now, using mock data to demonstrate the UI
      const mockResults: Notes[] = [
        {
          $id: '1',
          title: 'Project Meeting Notes',
          content: 'Discussion about the new feature implementation and timeline...',
          tags: ['work', 'meeting'],
          $createdAt: new Date().toISOString(),
          userId: 'user1'
        } as Notes,
        {
          $id: '2', 
          title: 'Personal Todo List',
          content: 'Things to do this weekend including grocery shopping...',
          tags: ['personal', 'todo'],
          $createdAt: new Date().toISOString(),
          userId: 'user1'
        } as Notes
      ];
      
      // Filter mock results
      const filteredResults = mockResults.filter((note: Notes) => {
        const searchLower = query.toLowerCase();
        return (
          note.title?.toLowerCase().includes(searchLower) ||
          note.content?.toLowerCase().includes(searchLower) ||
          note.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      });
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const hasSearchResults = searchResults.length > 0;

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <MagnifyingGlassIcon className="h-5 w-5 text-muted" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={handleFocus}
          className={`
            w-full pl-10 pr-10 py-2 
            bg-card border border-border rounded-xl
            text-foreground placeholder-muted
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
            transition-all duration-200
            hover:shadow-card-light dark:hover:shadow-card-dark
            ${isOpen ? 'shadow-3d-light dark:shadow-3d-dark' : ''}
          `}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-background transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-muted" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-3d-light dark:shadow-3d-dark z-50 max-h-96 overflow-hidden">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm text-muted">Searching...</p>
            </div>
          ) : hasSearchResults && searchResults.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-medium text-muted">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((note: Notes) => (
                  <a
                    key={note.$id}
                    href={`/notes/${note.$id}`}
                    className="block px-4 py-3 hover:bg-background transition-colors border-b border-border last:border-b-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {note.title || 'Untitled Note'}
                        </h4>
                        {note.content && (
                          <p className="text-xs text-muted mt-1 line-clamp-2">
                            {note.content.substring(0, 100)}...
                          </p>
                        )}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {note.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="inline-block px-2 py-1 text-xs bg-accent/20 text-accent rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-xs text-muted">
                                +{note.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 text-xs text-muted">
                        {new Date(note.$createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : searchQuery ? (
            <div className="p-6 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">
                No notes found for &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-muted mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <div className="p-6 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">
                Start typing to search your notes
              </p>
              <p className="text-xs text-muted mt-1">
                Search by title, content, or tags
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}