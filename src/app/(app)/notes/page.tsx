"use client";

import React, { useState, useEffect } from 'react';
import { listNotes as appwriteListNotes } from '@/lib/appwrite';
import { useLoading } from '@/components/ui/LoadingContext';
import type { Notes } from '@/types/appwrite.d';
import NoteCard from '@/components/ui/NoteCard';
import { Button } from '@/components/ui/Button';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { useOverlay } from '@/components/ui/OverlayContext';
import CreateNoteForm from './CreateNoteForm';

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
  }, []); // Removed showLoading, hideLoading from dependencies to prevent unnecessary refetches

  const handleNoteCreated = (newNote: Notes) => {
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const handleCreateNoteClick = () => {
    openOverlay(<CreateNoteForm onNoteCreated={handleNoteCreated} />);
  };

  const tags = ['Personal', 'Work', 'Ideas', 'To-Do', 'Inspiration'];

  return (
    <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden bg-light-bg dark:bg-dark-bg">
      <div className="flex-grow px-4 pt-6 pb-24 sm:px-6 md:px-8">
        <header className="mb-8 flex items-center justify-between">
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
        <div className="mb-8 flex gap-3 overflow-x-auto pb-4">
          {tags.map((tag, index) => (
            <Button key={index} variant="secondary">
              {tag}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {notes.map((note) => (
            <NoteCard key={note.$id} note={note} />
          ))}
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-dark-border bg-dark-card py-2 shadow-[0px_-4px_10px_rgba(0,0,0,0.1)]">
        <nav className="flex justify-around">
          <a href="/notes" className="flex flex-col items-center gap-1 text-accent">
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs font-bold">Notes</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-1 text-dark-fg">
            <MagnifyingGlassIcon className="h-6 w-6" />
            <span className="text-xs font-bold">Search</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-1 text-dark-fg" onClick={handleCreateNoteClick}>
            <PlusCircleIcon className="h-6 w-6" />
            <span className="text-xs font-bold">Create</span>
          </a>
          <a href="/shared" className="flex flex-col items-center gap-1 text-dark-fg">
            <ShareIcon className="h-6 w-6" />
            <span className="text-xs font-bold">Shared</span>
          </a>
          <a href="/profile" className="flex flex-col items-center gap-1 text-dark-fg">
            <UserIcon className="h-6 w-6" />
            <span className="text-xs font-bold">Profile</span>
          </a>
        </nav>
      </footer>
    </div>
  );
}