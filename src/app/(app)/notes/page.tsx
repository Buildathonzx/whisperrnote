"use client";

import React, { useState, useEffect } from 'react';
import { listNotes as appwriteListNotes } from '@/lib/appwrite';
import { useLoading } from '@/components/ui/LoadingContext';
import type { Notes } from '@/types/appwrite.d';
import NoteCard from '@/components/ui/NoteCard';
import { Button } from '@/components/ui/Button';
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { useOverlay } from '@/components/ui/OverlayContext';
import CreateNoteForm from './CreateNoteForm';
import { MobileBottomNav } from '@/components/Navigation';

export default function NotesPage() {
  const [notes, setNotes] = useState<Notes[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const { openOverlay } = useOverlay();

  useEffect(() => {
    const fetchNotes = async () => {
      // Only show loading if we don't already have notes
      if (notes.length === 0) {
        showLoading('Loading your notes...');
      }
      try {
        const res = await appwriteListNotes();
        setNotes(Array.isArray(res.documents) ? (res.documents as Notes[]) : []);
      } catch (error) {
        setNotes([]);
        console.error('Failed to fetch notes:', error);
      } finally {
        hideLoading();
      }
    };
    fetchNotes();
  }, []);

  const handleNoteCreated = (newNote: Notes) => {
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const handleCreateNoteClick = () => {
    openOverlay(<CreateNoteForm onNoteCreated={handleNoteCreated} />);
  };

  // Get tags from existing notes
  const existingTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));
  const tags = existingTags.length > 0 ? existingTags : ['Personal', 'Work', 'Ideas', 'To-Do', 'Inspiration'];

  return (
    <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden bg-light-bg dark:bg-dark-bg md:ml-72">
      <div className="flex-grow px-4 pt-6 pb-24 sm:px-6 md:px-8 md:pb-8">
        {/* Mobile Header - Hidden on Desktop */}
        <header className="mb-8 flex items-center justify-between md:hidden">
          <h1 className="text-3xl font-bold text-light-fg dark:text-dark-fg">
            Notes
          </h1>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="secondary">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </Button>
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
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} in your collection
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" className="gap-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search Notes
            </Button>
            <Button onClick={handleCreateNoteClick} className="gap-2">
              <PlusCircleIcon className="h-5 w-5" />
              Create Note
            </Button>
          </div>
        </header>

        {/* Tags Filter */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-4">
          {tags.map((tag, index) => (
            <Button key={index} variant="secondary" size="sm" className="whitespace-nowrap">
              {tag}
            </Button>
          ))}
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-light-card dark:bg-dark-card rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <PlusCircleIcon className="h-12 w-12 text-light-fg/50 dark:text-dark-fg/50" />
            </div>
            <h3 className="text-2xl font-bold text-light-fg dark:text-dark-fg mb-3">
              No notes yet
            </h3>
            <p className="text-light-fg/70 dark:text-dark-fg/70 mb-6 max-w-md">
              Start your knowledge journey by creating your first note. Capture ideas, thoughts, and insights.
            </p>
            <Button onClick={handleCreateNoteClick} className="gap-2">
              <PlusCircleIcon className="h-5 w-5" />
              Create Your First Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {notes.map((note) => (
              <NoteCard key={note.$id} note={note} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}