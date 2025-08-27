"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { validatePublicNoteAccess } from '@/lib/appwrite/permissions';
import { formatNoteCreatedDate, formatNoteUpdatedDate } from '@/lib/date-utils';
import type { Notes } from '@/types/appwrite-types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShareIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function SharedNotePage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Notes | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const noteId = params.noteid as string;

  useEffect(() => {
    async function loadSharedNote() {
      if (!noteId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const publicNote = await validatePublicNoteAccess(noteId);
        if (publicNote) {
          setNote(publicNote);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading shared note:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadSharedNote();
  }, [noteId]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleJoinWhisperRNote = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-light-fg/60 dark:text-dark-fg/60">Loading shared note...</p>
        </div>
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        {/* Header */}
        <header className="border-b border-light-border dark:border-dark-border bg-white/50 dark:bg-black/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-light-fg dark:text-dark-fg">WhisperRNote</h1>
              </div>
              <Button onClick={handleJoinWhisperRNote} className="gap-2">
                Join WhisperRNote
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Not Found Content */}
        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h1 className="text-3xl font-bold text-light-fg dark:text-dark-fg">Note Not Found</h1>
              <p className="text-lg text-light-fg/70 dark:text-dark-fg/70 max-w-md mx-auto">
                This note doesn't exist or is no longer publicly available.
              </p>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-8 border-2 border-light-border dark:border-dark-border max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-light-fg dark:text-dark-fg mb-4">
                Create Your Own Notes
              </h2>
              <p className="text-light-fg/70 dark:text-dark-fg/70 mb-6">
                Join WhisperRNote to create, organize, and share your own notes with the world.
              </p>
              <Button onClick={handleJoinWhisperRNote} className="w-full gap-2">
                Get Started Free
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <header className="border-b border-light-border dark:border-dark-border bg-white/50 dark:bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-light-fg dark:text-dark-fg">WhisperRNote</h1>
              <Badge variant="secondary" className="gap-1">
                <ShareIcon className="h-3 w-3" />
                Shared
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleCopyLink} className="gap-2">
                <ShareIcon className="h-4 w-4" />
                Copy Link
              </Button>
              <Button onClick={handleJoinWhisperRNote} className="gap-2">
                Join WhisperRNote
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Note Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <article className="bg-light-card dark:bg-dark-card rounded-3xl border-2 border-light-border dark:border-dark-border overflow-hidden">
          {/* Note Header */}
          <header className="p-8 border-b border-light-border dark:border-dark-border">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-light-fg dark:text-dark-fg leading-tight">
                {note.title || 'Untitled Note'}
              </h1>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-light-fg/60 dark:text-dark-fg/60">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>Created {formatNoteCreatedDate(note, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-4 w-4" />
                  <span>Public Note</span>
                </div>
              </div>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <TagIcon className="h-4 w-4 text-light-fg/60 dark:text-dark-fg/60" />
                  {note.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Note Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-light-fg dark:text-dark-fg leading-relaxed">
                {note.content || 'This note is empty.'}
              </div>
            </div>
          </div>

          {/* Note Footer */}
          <footer className="p-6 bg-light-bg/50 dark:bg-dark-bg/50 border-t border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-light-fg/60 dark:text-dark-fg/60">
                Last updated {formatNoteUpdatedDate(note, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-sm text-light-fg/60 dark:text-dark-fg/60">
                Shared via WhisperRNote
              </div>
            </div>
          </footer>
        </article>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-8 border border-accent/20">
            <h2 className="text-2xl font-bold text-light-fg dark:text-dark-fg mb-4">
              Create Your Own Notes
            </h2>
            <p className="text-light-fg/70 dark:text-dark-fg/70 mb-6 max-w-lg mx-auto">
              Join thousands of users who trust WhisperRNote to capture, organize, and share their thoughts.
            </p>
            <Button onClick={handleJoinWhisperRNote} size="lg" className="gap-2">
              Start Writing for Free
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}