"use client";

import React, { useState, useEffect } from 'react';
import type { Notes } from '@/types/appwrite-types';
import NoteCard from '@/components/ui/NoteCard';
import { Button } from '@/components/ui/Button';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { MobileBottomNav } from '@/components/Navigation';

export default function SharedNotesPage() {
  const [sharedNotes, setSharedNotes] = useState<Notes[]>([]);

  // Mock data for now - replace with actual API call
  useEffect(() => {
    // TODO: Implement actual shared notes fetching
    setSharedNotes([]);
  }, []);

  return (
    <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden bg-light-bg dark:bg-dark-bg">
      <div className="flex-grow px-4 pt-6 pb-24 sm:px-6 md:px-8 md:pb-8">
        {/* Mobile Header - Hidden on Desktop */}
        <header className="mb-8 flex items-center justify-between md:hidden">
          <h1 className="text-3xl font-bold text-light-fg dark:text-dark-fg">
            Shared
          </h1>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="secondary">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </Button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-light-fg dark:text-dark-fg mb-2">
              Shared
            </h1>
            <p className="text-lg text-light-fg/70 dark:text-dark-fg/70">
              Notes that others have shared with you
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" className="gap-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search Shared Notes
            </Button>
          </div>
        </header>

        {/* Content */}
        {sharedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-light-card dark:bg-dark-card rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <UserGroupIcon className="h-12 w-12 text-light-fg/50 dark:text-dark-fg/50" />
            </div>
            <h3 className="text-2xl font-bold text-light-fg dark:text-dark-fg mb-3">
              No shared notes yet
            </h3>
            <p className="text-light-fg/70 dark:text-dark-fg/70 mb-6 max-w-md">
              When others share notes with you, they&apos;ll appear here. Start collaborating by sharing your own notes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {sharedNotes.map((note) => (
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