"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { updateNote, deleteNote } from '@/lib/appwrite';
import { useNotes } from '@/contexts/NotesContext';
import { useLoading } from '@/components/ui/LoadingContext';
import { useOverlay } from '@/components/ui/OverlayContext';
import { useAI } from '@/components/ui/AIContext';
import { useSearchParams } from 'next/navigation';
import type { Notes } from '@/types/appwrite.d';
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
  const { notes: allNotes, totalNotes, isLoading: isInitialLoading, refetchNotes, hasMore, loadMore } = useNotes();
  const { showLoading, hideLoading } = useLoading();
  const { openOverlay, closeOverlay } = useOverlay();
  const { isGenerating, setIsGenerating, setAIGenerateHandler } = useAI();
  const { isCollapsed } = useSidebar();
  const { isOpen: isDynamicSidebarOpen } = useDynamicSidebar();
  const searchParams = useSearchParams();

  // Fetch notes action for the search hook
  const fetchNotesAction = async () => {
    // Data is now coming from context, so we just return it
    return {
      documents: allNotes,
      total: allNotes.length
    };
  };

  // Search and pagination configuration
  const searchConfig = {
    searchFields: ['title', 'content', 'tags'],
    localSearch: true,
    threshold: 500,
    debounceMs: 300
  };

  // Derive UI page size from viewport (simple heuristic) or env
  const derivedPageSize = (() => {
    if (typeof window === 'undefined') return 12;
    const width = window.innerWidth;
    if (width < 640) return 8;
    if (width < 1024) return 12;
    if (width < 1440) return 16;
    return 20;
  })();

  const paginationConfig = {
    pageSize: derivedPageSize
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

  const handleNoteCreated = useCallback(async (newNote: Notes) => {
    await refetchNotes();
  }, [refetchNotes]);

  // Function to handle AI generation (memoized to avoid re-renders)
  const handleAIGenerate = useCallback(async (prompt: string, type: 'topic' | 'brainstorm' | 'research' | 'custom') => {
    setIsGenerating(true);
    try {
      const result = await aiService.generateContent(prompt, type);
      closeOverlay();
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
  }, [setIsGenerating, aiService, closeOverlay, openOverlay, handleNoteCreated]);

  // Register AI handler with context (only when handler identity changes)
  useEffect(() => {
    setAIGenerateHandler(handleAIGenerate);
    return () => setAIGenerateHandler(undefined);
  }, [setAIGenerateHandler, handleAIGenerate]);

  const handleAIGenerateFromPrompt = useCallback((prompt: string) => {
    openOverlay(
      <AIGeneratePromptModal
        onClose={closeOverlay}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
        initialPrompt={prompt}
      />
    );
  }, [openOverlay, closeOverlay, handleAIGenerate, isGenerating]);

  // Check for AI prompt from landing page and create-note trigger
  useEffect(() => {
    const aiPrompt = searchParams.get('ai-prompt');
    const pendingPrompt = typeof window !== 'undefined' ? sessionStorage.getItem('pending-ai-prompt') : null;
    const openCreateNote = typeof window !== 'undefined' ? sessionStorage.getItem('open-create-note') : null;
    
    if (aiPrompt) {
      handleAIGenerateFromPrompt(aiPrompt);
    } else if (pendingPrompt) {
      sessionStorage.removeItem('pending-ai-prompt');
      handleAIGenerateFromPrompt(pendingPrompt);
    }

    if (openCreateNote) {
      try { sessionStorage.removeItem('open-create-note'); } catch {}
      openOverlay(<CreateNoteForm onNoteCreated={handleNoteCreated} />);
    }
  }, [searchParams, handleAIGenerateFromPrompt, openOverlay, handleNoteCreated]);

  const handleNoteUpdated = async (updatedNote: Notes) => {
    if (!updatedNote.$id) {
      console.error('Cannot update note: missing ID');
      return;
    }
    await updateNote(updatedNote.$id, updatedNote);
    await refetchNotes();
  };

  const handleNoteDeleted = async (noteId: string) => {
    if (!noteId) {
      console.error('Cannot delete note: missing ID');
      return;
    }
    await deleteNote(noteId);
    await refetchNotes();
  };

  const handleCreateNoteClick = () => {
    openOverlay(<CreateNoteForm onNoteCreated={handleNoteCreated} />);
  };

  // Calculate available space and determine optimal card size
  const getGridClasses = () => {
    if (!isCollapsed && isDynamicSidebarOpen) {
      return 'grid gap-3 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]';
    } else if (!isCollapsed || isDynamicSidebarOpen) {
      return 'grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]';
    } else {
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
            {allNotes.length < totalNotes && !hasSearchResults ? (
              <>Loaded {allNotes.length} of {totalNotes} notes</>
            ) : (
              <>{hasSearchResults ? `${totalCount} ${totalCount === 1 ? 'note' : 'notes'} (filtered from ${totalNotes})` : `${totalNotes} ${totalNotes === 1 ? 'note' : 'notes'} in your collection`}</>
            )}
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
            totalCount={hasSearchResults ? totalCount : allNotes.length}
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
        <div className="flex flex-col gap-6">
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
          {hasMore && !isInitialLoading && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={loadMore}>Load More</Button>
            </div>
          )}
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
            totalCount={hasSearchResults ? totalCount : allNotes.length}
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
