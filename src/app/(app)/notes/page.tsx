"use client";

import React, { useState, useEffect } from 'react';
import { listNotes as appwriteListNotes } from '@/lib/appwrite';
import { useLoading } from '@/components/ui/LoadingContext';
import { useOverlay } from '@/components/ui/OverlayContext';
import { useAI } from '@/components/ui/AIContext';
import { useSearchParams } from 'next/navigation';
import type { Notes } from '@/types/appwrite-types';
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

export default function NotesPage() {
  const [allNotes, setAllNotes] = useState<Notes[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { showLoading, hideLoading } = useLoading();
  const { openOverlay, closeOverlay } = useOverlay();
  const { isGenerating, setIsGenerating, setAIGenerateHandler } = useAI();
  const searchParams = useSearchParams();

  // Fetch notes action for the search hook
  const fetchNotesAction = async (queries: string[]) => {
    const result = await appwriteListNotes(queries);
    return {
      documents: result.documents as Notes[],
      total: result.documents.length
    };
  };

  // Search and pagination configuration
  const searchConfig = {
    searchFields: ['title', 'content', 'tags'],
    localSearch: true, // Use frontend search for better UX with small datasets
    threshold: 200, // Switch to backend search if more than 200 notes
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

  // Initial data fetch
  useEffect(() => {
    const fetchNotes = async () => {
      // Only show loading for longer operations on first load
      const shouldShowLoading = allNotes.length === 0;
      
      if (shouldShowLoading) {
        showLoading('Loading your notes...');
      }
      
      try {
        const res = await appwriteListNotes();
        setAllNotes(Array.isArray(res.documents) ? (res.documents as Notes[]) : []);
      } catch (error) {
        setAllNotes([]);
        console.error('Failed to fetch notes:', error);
      } finally {
        if (shouldShowLoading) {
          hideLoading();
        }
        setIsInitialLoading(false);
      }
    };
    fetchNotes();
  }, []);

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
      // Simulate AI generation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let generatedContent = '';
      switch (type) {
        case 'topic':
          generatedContent = `# ${prompt}\n\nThis is a comprehensive note about ${prompt}.\n\n## Key Points\n\n- Important concept 1\n- Important concept 2\n- Important concept 3\n\n## Details\n\nDetailed information about ${prompt} will be generated here. This content will include relevant examples, explanations, and insights.\n\n## Conclusion\n\nSummary of the main points covered.`;
          break;
        case 'brainstorm':
          generatedContent = `# Ideas for: ${prompt}\n\n## Creative Suggestions\n\n1. **Innovative Approach**: A fresh perspective on ${prompt}\n2. **Traditional Method**: Time-tested strategies for ${prompt}\n3. **Technology Integration**: How to leverage technology for ${prompt}\n4. **Collaborative Solution**: Team-based approaches to ${prompt}\n5. **Cost-Effective Option**: Budget-friendly ways to tackle ${prompt}\n\n## Next Steps\n\n- Evaluate each idea\n- Choose the most promising approaches\n- Create an action plan`;
          break;
        case 'research':
          generatedContent = `# Research on: ${prompt}\n\n## Overview\n\nComprehensive research findings on ${prompt}.\n\n## Key Findings\n\n- Finding 1: Important discovery about ${prompt}\n- Finding 2: Statistical data related to ${prompt}\n- Finding 3: Expert opinions on ${prompt}\n\n## Analysis\n\nDetailed analysis of the research data and trends.\n\n## Sources\n\n- Academic papers\n- Industry reports\n- Expert interviews`;
          break;
        case 'custom':
          generatedContent = `# Generated Content\n\n${prompt}\n\n## AI Response\n\nThis content has been generated based on your specific request. The AI has processed your instructions and created relevant information.\n\n## Additional Information\n\nSupplementary details and context have been added to provide a comprehensive response.`;
          break;
      }
      
      // Close the prompt modal and open create note form with content
      closeOverlay();
      
      // Open the create note form with pre-filled content
      openOverlay(
        <CreateNoteForm 
          initialContent={{
            title: `AI Generated: ${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Content'}`,
            content: generatedContent,
            tags: [`ai-generated`, ...(type ? [type] : [])]
          }}
          onNoteCreated={handleNoteCreated} 
        />
      );
      
    } catch (error) {
      console.error('Failed to generate content:', error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNoteCreated = (newNote: Notes) => {
    setAllNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const handleCreateNoteClick = () => {
    openOverlay(<CreateNoteForm onNoteCreated={handleNoteCreated} />);
  };

  // Get tags from existing notes for filtering
  const existingTags = Array.from(new Set(allNotes.flatMap(note => note.tags || [])));
  const tags = existingTags.length > 0 ? existingTags.slice(0, 8) : ['Personal', 'Work', 'Ideas', 'To-Do'];

  return (
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
          <Button onClick={handleCreateNoteClick} className="gap-2">
            <PlusCircleIcon className="h-5 w-5" />
            Create Note
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
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paginatedNotes.map((note) => (
            <NoteCard key={note.$id} note={note} />
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
  );
}