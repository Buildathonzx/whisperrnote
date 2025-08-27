"use client";

import React, { useState, useEffect } from 'react';
import type { Notes } from '@/types/appwrite-types';
import NoteCard from '@/components/ui/NoteCard';
import { Button } from '@/components/ui/Button';
import { getSharedNotes, listPublicNotes } from '@/lib/appwrite';
import {
  MagnifyingGlassIcon,
  GlobeAltIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { MobileBottomNav } from '@/components/Navigation';

interface SharedNote extends Notes {
  sharedPermission?: string;
  sharedAt?: string;
  sharedBy?: { name: string; email: string } | null;
}

export default function SharedNotesPage() {
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [publicNotes, setPublicNotes] = useState<Notes[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');

  // Fetch shared and public notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        
        // Fetch privately shared notes
        const sharedResult = await getSharedNotes();
        setSharedNotes(sharedResult.documents as SharedNote[]);
        
        // Fetch public notes
        const publicResult = await listPublicNotes();
        setPublicNotes(publicResult.documents as unknown as Notes[]);
        
      } catch (error) {
        console.error('Error fetching shared notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const currentNotes = activeTab === 'private' ? sharedNotes : publicNotes;

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
              Notes shared with you and public notes
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" className="gap-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search Shared Notes
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex mb-6 bg-light-card dark:bg-dark-card rounded-lg p-1">
          <button
            onClick={() => setActiveTab('private')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'private'
                ? 'bg-light-accent dark:bg-dark-accent text-white'
                : 'text-light-fg/70 dark:text-dark-fg/70 hover:text-light-fg dark:hover:text-dark-fg'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            Private ({sharedNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'public'
                ? 'bg-light-accent dark:bg-dark-accent text-white'
                : 'text-light-fg/70 dark:text-dark-fg/70 hover:text-light-fg dark:hover:text-dark-fg'
            }`}
          >
            <GlobeAltIcon className="h-4 w-4" />
            Public ({publicNotes.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-light-fg/70 dark:text-dark-fg/70">Loading...</div>
          </div>
        ) : currentNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-light-card dark:bg-dark-card rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              {activeTab === 'private' ? (
                <UserIcon className="h-12 w-12 text-light-fg/50 dark:text-dark-fg/50" />
              ) : (
                <GlobeAltIcon className="h-12 w-12 text-light-fg/50 dark:text-dark-fg/50" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-light-fg dark:text-dark-fg mb-3">
              {activeTab === 'private' ? 'No private shared notes yet' : 'No public notes yet'}
            </h3>
            <p className="text-light-fg/70 dark:text-dark-fg/70 mb-6 max-w-md">
              {activeTab === 'private' 
                ? "When others share notes with you, they'll appear here. Start collaborating by sharing your own notes!"
                : "When users make their notes public, they'll appear here. Explore and discover new content!"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {currentNotes.map((note) => (
                <div key={note.$id} className="relative">
                  <NoteCard note={note} />
                  {/* Show sharing info for private notes */}
                  {activeTab === 'private' && (note as SharedNote).sharedBy && (
                    <div className="mt-2 text-xs text-light-fg/60 dark:text-dark-fg/60">
                      Shared by {(note as SharedNote).sharedBy?.name || (note as SharedNote).sharedBy?.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}