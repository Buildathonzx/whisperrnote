"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { validatePublicNoteAccess } from '@/lib/appwrite/permissions';
import { formatNoteCreatedDate, formatNoteUpdatedDate } from '@/lib/date-utils';
import { useAuth } from '@/components/ui/AuthContext';
import type { Notes } from '@/types/appwrite.d';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {
  ShareIcon,
  EyeIcon,
  ClockIcon,
  UserCircleIcon,
  TagIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function SharedNotePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [note, setNote] = useState<Notes | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const noteId = params.noteid as string;
  const isOwner = note && user && note.userId === user.$id;

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

  const handleGoToNotes = () => {
    router.push('/notes');
  };

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  const handleViewAnalytics = () => {
    // TODO: Navigate to analytics page when implemented
    console.log('Analytics not implemented yet');
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
                <Image
                  src="/logo/whisperrnote.png"
                  alt="WhisperRNote"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <h1 className="text-xl font-bold text-light-fg dark:text-dark-fg">WhisperRNote</h1>
              </div>
              
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <Button onClick={handleGoToNotes} className="gap-2">
                    My Notes
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <ThemeToggle size="sm" />
                    <Button onClick={handleJoinWhisperRNote} className="gap-2 hidden sm:flex">
                      Join WhisperRNote
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
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
                 This note doesn&apos;t exist or is no longer publicly available.
              </p>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-8 border-2 border-light-border dark:border-dark-border max-w-md mx-auto">
              {isAuthenticated ? (
                <>
                  <h2 className="text-xl font-semibold text-light-fg dark:text-dark-fg mb-4">
                    Create Your Own Notes
                  </h2>
                  <p className="text-light-fg/70 dark:text-dark-fg/70 mb-6">
                    Continue creating and sharing your thoughts with WhisperRNote.
                  </p>
                  <Button onClick={handleGoToNotes} className="w-full gap-2">
                    Go to My Notes
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
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
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Logo */}
              <div className="flex items-center gap-3">
                <Image
                  src="/logo/whisperrnote.png"
                  alt="WhisperRNote"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <h1 className="text-xl font-bold text-light-fg dark:text-dark-fg">WhisperRNote</h1>
                <Badge variant="secondary" className="gap-1">
                  <ShareIcon className="h-3 w-3" />
                  Shared
                </Badge>
              </div>

              {/* Right: Dynamic actions based on auth status */}
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    {/* Authenticated User Actions */}
                    <Button variant="secondary" onClick={handleCopyLink} className="gap-2">
                      <ShareIcon className="h-4 w-4" />
                      Copy Link
                    </Button>
                    
                    {/* Account Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:bg-light-card/80 dark:hover:bg-dark-card/80 transition-all duration-200"
                      >
                        <UserCircleIcon className="h-5 w-5 text-light-fg dark:text-dark-fg" />
                        <span className="hidden sm:inline text-sm font-medium text-light-fg dark:text-dark-fg">
                          {user?.name || user?.email || 'Account'}
                        </span>
                      </button>

                      {/* Account Dropdown */}
                      {isAccountMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={() => setIsAccountMenuOpen(false)}
                          />
                          <div className="absolute top-full right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-lg z-20 py-2">
                            <button
                              onClick={() => {
                                setIsAccountMenuOpen(false);
                                handleGoToNotes();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-light-fg dark:text-dark-fg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200"
                            >
                              <DocumentTextIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">My Notes</span>
                            </button>
                            
                            <a
                              href="/settings"
                              onClick={() => setIsAccountMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-light-fg dark:text-dark-fg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200"
                            >
                              <Cog6ToothIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Settings</span>
                            </a>
                            
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-sm font-medium text-light-fg dark:text-dark-fg">Theme</span>
                              <ThemeToggle size="sm" />
                            </div>
                            
                            <div className="border-t border-light-border dark:border-dark-border my-1"></div>
                            
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Logout</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                     {/* Unauthenticated User Actions */}
                     <div className="flex items-center gap-3">
                       <ThemeToggle size="sm" />
                       <Button onClick={handleJoinWhisperRNote} className="gap-2 hidden sm:flex">
                         Join WhisperRNote
                         <ArrowRightIcon className="h-4 w-4" />
                       </Button>
                     </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Join WhisperRNote Button - Only show for unauthenticated users */}
        {!isAuthenticated && (
          <div className="sm:hidden bg-accent/5 border-b border-light-border dark:border-dark-border">
            <div className="max-w-4xl mx-auto px-6 py-3">
              <Button onClick={handleJoinWhisperRNote} className="w-full gap-2">
                Join WhisperRNote
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

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
                  {note.tags.map((tag: string, index: number) => (
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
            <div className="prose prose-lg max-w-none dark:prose-invert text-light-fg dark:text-dark-fg leading-relaxed">
              {note.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {note.content}
                </ReactMarkdown>
              ) : (
                <div className="text-light-fg/60 dark:text-dark-fg/60 italic">
                  This note is empty.
                </div>
              )}
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

        {/* Analytics Section - Only show for note owner */}
        {isOwner && (
          <div className="mt-8">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-light-fg dark:text-dark-fg">Your Shared Note Analytics</h2>
                <Button 
                  variant="secondary" 
                  onClick={handleViewAnalytics}
                  className="gap-2"
                  disabled
                >
                  <ChartBarIcon className="h-4 w-4" />
                  View Analytics
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-4 border border-light-border dark:border-dark-border">
                  <div className="text-2xl font-bold text-light-fg dark:text-dark-fg">-</div>
                  <div className="text-sm text-light-fg/60 dark:text-dark-fg/60">Total Visits</div>
                  <div className="text-xs text-light-fg/40 dark:text-dark-fg/40 mt-1">Coming soon</div>
                </div>
                
                <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-4 border border-light-border dark:border-dark-border">
                  <div className="text-2xl font-bold text-light-fg dark:text-dark-fg">-</div>
                  <div className="text-sm text-light-fg/60 dark:text-dark-fg/60">Distinct Views</div>
                  <div className="text-xs text-light-fg/40 dark:text-dark-fg/40 mt-1">Coming soon</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action - Dynamic based on auth status */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-8 border border-accent/20">
            {isAuthenticated ? (
              <>
                <h2 className="text-2xl font-bold text-light-fg dark:text-dark-fg mb-4">
                  Share Your Thoughts
                </h2>
                <p className="text-light-fg/70 dark:text-dark-fg/70 mb-6 max-w-lg mx-auto">
                  Create and share your own notes with the world. Join the conversation.
                </p>
                <Button onClick={handleGoToNotes} size="lg" className="gap-2">
                  Create Your Notes
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}