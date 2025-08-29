"use client";

import React, { useState, useEffect } from 'react';
import { getAllNotes, updateNote, deleteNote } from '@/lib/appwrite';
import { useLoading } from '@/components/ui/LoadingContext';
import { useOverlay } from '@/components/ui/OverlayContext';
import { useAI } from '@/components/ui/AIContext';
import { useSearchParams } from 'next/navigation';
import type { Notes } from '@/types/appwrite';
import NoteCard from '@/components/ui/NoteCard';
import { NoteGridSkeleton } from '@/components/ui/NoteCardSkeleton';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useSearch } from '@/hooks/useSearch';
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import CreateNoteForm from './CreateNoteForm';
import { MobileBottomNav } from '@/components/Navigation';
import { AIGeneratePromptModal } from '@/components/AIGeneratePromptModal';
import { MobileFAB } from '@/components/MobileFAB';
import { useSidebar } from '@/components/ui/SidebarContext';
import { useDynamicSidebar } from '@/components/ui/DynamicSidebar';
import { aiServiceInstance as aiService } from '@/lib/ai-service';
import { NotesErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function NotesPage() {
  const [allNotes, setAllNotes] = useState<Notes[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { showLoading, hideLoading } = useLoading();
  const { openOverlay, closeOverlay } = useOverlay();
  const { isGenerating, setIsGenerating, setAIGenerateHandler } = useAI();
  const { isCollapsed } = useSidebar();
  const { isOpen: isDynamicSidebarOpen } = useDynamicSidebar();
  const searchParams = useSearchParams();

  // Fetch notes action for the search hook
  const fetchNotesAction = async () => {
    // For now, we'll fetch all notes and let the search hook handle filtering
    // In a production app with many notes, you'd want server-side search
    const result = await getAllNotes();
    return {
      documents: result.documents as Notes[],
      total: result.total
    };
  };

  // Search and pagination configuration
  const searchConfig = {
    searchFields: ['title', 'content', 'tags'],
    localSearch: true, // Use frontend search for better UX with larger datasets
    threshold: 500, // Switch to backend search if more than 500 notes (increased from 200)
    debounceMs: 300
  };

  const paginationConfig = {
    pageSize: 12 // Show 12 notes per page
  };

  // Use the search hook
  const {
    items: paginatedNotes,
    totalCount,
    error,
    searchQuery,
    setSearchQuery,
    hasSearchResults,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    clearSearch
  } = useSearch({
    data: allNotes,
    fetchDataAction: fetchNotesAction,
    searchConfig,
    paginationConfig
  });

  // Register AI handler with context
  useEffect(() => {
    setAIGenerateHandler(handleAIGenerate);
    return () => setAIGenerateHandler(undefined);
  }, [setAIGenerateHandler]);

  // Function to fetch and sync notes
  const fetchAndSyncNotes = async (showLoadingIndicator = false) => {
    if (showLoadingIndicator) {
      showLoading('Loading your notes...');
    }

    try {
      const res = await getAllNotes();
      const notes = Array.isArray(res.documents) ? (res.documents as Notes[]) : [];
      // Deduplicate notes by $id to prevent duplicate keys
      const uniqueNotes = notes.filter((note, index, arr) =>
        arr.findIndex(n => n.$id === note.$id) === index
      );
      setAllNotes(uniqueNotes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      // Don't clear notes on error to avoid losing local state
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAndSyncNotes(true);
    setIsInitialLoading(false);
  }, []);

  // Periodic sync to keep notes synchronized across tabs/sessions
  useEffect(() => {
    if (isInitialLoading) return; // Don't sync during initial load

    const syncInterval = setInterval(async () => {
      try {
        const { documents: latestNotes } = await getAllNotes();
        setAllNotes((currentNotes) => {
          const latestMap = new Map(latestNotes.map(note => [note.$id, note]));
          const currentMap = new Map(currentNotes.map(note => [note.$id, note]));

          // Check if there are any differences
          const hasChanges = latestNotes.length !== currentNotes.length ||
            latestNotes.some(note => {
              const current = currentMap.get(note.$id);
              return !current ||
                current.$updatedAt !== note.$updatedAt ||
                current.title !== note.title ||
                current.content !== note.content;
            });

          if (hasChanges) {
            console.log('Notes synchronized with server');
            return latestNotes;
          }

          return currentNotes; // No changes
        });
      } catch (error) {
        console.error('Background sync failed:', error);
        // Don't show error to user for background sync failures
      }
    }, 30000); // Sync every 30 seconds

    // Also sync when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && !isInitialLoading) {
        console.log('Page visible, syncing notes');
        fetchAndSyncNotes(false); // Don't show loading indicator for background sync
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialLoading]);

  // Check for AI prompt from landing page
  useEffect(() => {
    const aiPrompt = searchParams.get('ai-prompt');
    const pendingPrompt = typeof window !== 'undefined' ? sessionStorage.getItem('pending-ai-prompt') : null;
    
    if (aiPrompt) {
      // Direct from landing page with prompt
      handleAIGenerateFromPrompt(aiPrompt);
    } else if (pendingPrompt) {
      // From sessionStorage after auth
      sessionStorage.removeItem('pending-ai-prompt');
      handleAIGenerateFromPrompt(pendingPrompt);
    }
  }, [searchParams]);

  const handleAIGenerateFromPrompt = (prompt: string) => {
    openOverlay(
      <AIGeneratePromptModal
        onClose={closeOverlay}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
        initialPrompt={prompt}
      />
    );
  };

  const handleAIGenerate = async (prompt: string, type: 'topic' | 'brainstorm' | 'research' | 'custom') => {
    setIsGenerating(true);
    
    try {
      // Use real AI generation with Gemini
      const result = await aiService.generateContent(prompt, type);
      
      // Close the prompt modal and open create note form with content
      closeOverlay();
      
      // Open the create note form with pre-filled content
      openOverlay(
        <CreateNoteForm 
          initialContent={{
            title: result.title,
            content: result.content,
            tags: result.tags
          }}
          onNoteCreated={handleNoteCreated} 
        />
      );
      
    } catch (error) {
      console.error('AI Generation Failed:', error instanceof Error ? error.message : 'Unable to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNoteCreated = async (newNote: Notes) => {
    // Optimistic update: Add note to local state immediately for better UX
    setAllNotes((prevNotes) => {
      const exists = prevNotes.some(note => note.$id === newNote.$id);
      if (exists) {
        return prevNotes;
      }
      return [newNote, ...prevNotes];
    });

    // Then sync with database in background
    try {
      const { documents: refreshedNotes } = await getAllNotes();
      // Use a more sophisticated merge to handle concurrent updates
      setAllNotes((currentNotes) => {
        const refreshedMap = new Map(refreshedNotes.map(note => [note.$id, note]));
        const currentMap = new Map(currentNotes.map(note => [note.$id, note]));

        // Merge: prefer database version for existing notes, keep local additions
        const merged = refreshedNotes.slice();

        // Add any local notes that aren't in the refreshed list (our optimistic update)
        currentNotes.forEach(note => {
          if (!refreshedMap.has(note.$id)) {
            merged.unshift(note); // Add to beginning
          }
        });

        // Remove duplicates and sort by creation date (newest first)
        const unique = merged.filter((note, index, arr) =>
          arr.findIndex(n => n.$id === note.$id) === index
        );

        return unique.sort((a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      });
    } catch (error) {
      console.error('Failed to sync notes after creation:', error);
      // Note: We keep the optimistic update even if sync fails
      // This provides better UX - user sees their note immediately
    }
  };

  const handleNoteUpdated = async (updatedNote: Notes) => {
    if (!updatedNote.$id) {
      console.error('Cannot update note: missing ID');
      return;
    }

    // Store original note for potential rollback
    const originalNote = allNotes.find(note => note.$id === updatedNote.$id);

    // Optimistic update: Update local state immediately
    setAllNotes((prevNotes) =>
      prevNotes.map(note =>
        note.$id === updatedNote.$id ? { ...note, ...updatedNote } : note
      )
    );

    try {
      await updateNote(updatedNote.$id, updatedNote);

      // On success, sync with database to ensure consistency
      const { documents: refreshedNotes } = await getAllNotes();
      setAllNotes((currentNotes) => {
        const refreshedMap = new Map(refreshedNotes.map(note => [note.$id, note]));

        // Update with server version if it exists, otherwise keep our optimistic update
        return currentNotes.map(note => {
          const serverVersion = refreshedMap.get(note.$id);
          return serverVersion || note;
        });
      });
    } catch (error) {
      console.error('Failed to update note:', error);

      // Rollback optimistic update on failure
      if (originalNote) {
        setAllNotes((prevNotes) =>
          prevNotes.map(note =>
            note.$id === updatedNote.$id ? originalNote : note
          )
        );
      }

      // Could show user-friendly error message here
      // For now, just log the error
    }
  };

  const handleNoteDeleted = async (noteId: string) => {
    if (!noteId) {
      console.error('Cannot delete note: missing ID');
      return;
    }

    // Store note for potential rollback
    const noteToDelete = allNotes.find(note => note.$id === noteId);

    // Optimistic update: Remove from local state immediately
    setAllNotes((prevNotes) =>
      prevNotes.filter(note => note.$id !== noteId)
    );

    try {
      await deleteNote(noteId);

      // On success, sync with database to ensure consistency
      const { documents: refreshedNotes } = await getAllNotes();
      setAllNotes(refreshedNotes);
    } catch (error) {
      console.error('Failed to delete note:', error);

      // Rollback optimistic update on failure
      if (noteToDelete) {
        setAllNotes((prevNotes) => {
          // Insert back at the original position if possible
          const newNotes = [...prevNotes];
          // For simplicity, just add to the beginning
          newNotes.unshift(noteToDelete);
          return newNotes;
        });
      }
    }
  };

  const handleCreateNoteClick = () => {
    openOverlay(<CreateNoteForm onNoteCreated={handleNoteCreated} />);
  };

  // Calculate available space and determine optimal card size
  const getGridClasses = () => {
    // Determine available space based on sidebar states
    if (!isCollapsed && isDynamicSidebarOpen) {
      // Both sidebars open - very constrained space
      return 'grid gap-3 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]';
    } else if (!isCollapsed || isDynamicSidebarOpen) {
      // One sidebar open - moderate space
      return 'grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]';
    } else {
      // Full space available - optimal distribution
      return 'grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]';
    }
  };

  // Get tags from existing notes for filtering
  const existingTags = Array.from(new Set(allNotes.flatMap(note => note.tags || [])));
  const tags = existingTags.length > 0 ? existingTags.slice(0, 8) : ['Personal', 'Work', 'Ideas', 'To-Do'];

  return (
    <NotesErrorBoundary>
      <div className="flex-1 min-h-screen">
        {/* Mobile Header - Hidden on Desktop */}
        <header className="mb-8 flex items-center justify-between md:hidden">
          <h1 className="text-3xl font-bold text-light-fg dark:text-dark-fg">
            Notes
          </h1>
          <div className="flex items-center gap-3">
            <Button size="icon" onClick={handleCreateNoteClick}>
              <PlusCircleIcon className="h-6 w-6" />
            </Button>
          </div>
        </header>

        {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-light-fg dark:text-dark-fg mb-2">
            My Notes
          </h1>
          <p className="text-lg text-light-fg/70 dark:text-dark-fg/70">
            {totalCount} {totalCount === 1 ? 'note' : 'notes'} in your collection
            {hasSearchResults && ` (filtered from ${allNotes.length})`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleCreateNoteClick} size="icon">
            <PlusCircleIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {tags.map((tag, index) => (
            <Button 
              key={index} 
              variant="secondary" 
              size="sm" 
              className="whitespace-nowrap"
              onClick={() => setSearchQuery(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      {/* Top Pagination */}
      {totalPages > 1 && (
        <div className="mb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            totalCount={totalCount}
            pageSize={paginationConfig.pageSize}
            compact={false}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-2xl">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Notes Grid */}
      {isInitialLoading ? (
        <NoteGridSkeleton count={12} />
      ) : paginatedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-light-card dark:bg-dark-card rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            {hasSearchResults ? (
              <MagnifyingGlassIcon className="h-12 w-12 text-light-fg/50 dark:text-dark-fg/50" />
            ) : (
              <PlusCircleIcon className="h-12 w-12 text-light-fg/50 dark:text-dark-fg/50" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-light-fg dark:text-dark-fg mb-3">
            {hasSearchResults ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-light-fg/70 dark:text-dark-fg/70 mb-6 max-w-md">
            {hasSearchResults 
              ? `No notes match "${searchQuery}". Try different keywords or create a new note.`
              : 'Start your knowledge journey by creating your first note. Capture ideas, thoughts, and insights.'
            }
          </p>
          {hasSearchResults ? (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={clearSearch}>
                Clear Search
              </Button>
              <Button onClick={handleCreateNoteClick} className="gap-2">
                <PlusCircleIcon className="h-5 w-5" />
                Create Note
              </Button>
            </div>
          ) : (
            <Button onClick={handleCreateNoteClick} className="gap-2">
              <PlusCircleIcon className="h-5 w-5" />
              Create Your First Note
            </Button>
          )}
        </div>
      ) : (
        <div className={getGridClasses()}>
          {paginatedNotes.map((note) => (
            <NoteCard 
              key={note.$id} 
              note={note} 
              onUpdate={handleNoteUpdated}
              onDelete={handleNoteDeleted}
            />
          ))}
        </div>
      )}

      {/* Bottom Pagination */}
      {totalPages > 1 && paginatedNotes.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            totalCount={totalCount}
            pageSize={paginationConfig.pageSize}
            compact={false}
          />
        </div>
      )}

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* Mobile FAB */}
        <MobileFAB />
      </div>
    </NotesErrorBoundary>
  );
}