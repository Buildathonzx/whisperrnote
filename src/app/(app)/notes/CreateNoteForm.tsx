"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createNote as appwriteCreateNote } from '@/lib/appwrite';
import { useOverlay } from '@/components/ui/OverlayContext';
import type { Notes } from '@/types/appwrite';
import * as AppwriteTypes from '@/types/appwrite';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  TagIcon, 
  GlobeAltIcon, 
  LockClosedIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface CreateNoteFormProps {
  onNoteCreated: (note: Notes) => void;
  initialContent?: {
    title?: string;
    content?: string;
    tags?: string[];
  };
}

export default function CreateNoteForm({ onNoteCreated, initialContent }: CreateNoteFormProps) {
  const [title, setTitle] = useState(initialContent?.title || '');
  const [content, setContent] = useState(initialContent?.content || '');
  const [tags, setTags] = useState<string[]>(initialContent?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<AppwriteTypes.Status>(AppwriteTypes.Status.DRAFT);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { closeOverlay } = useOverlay();

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCreateNote = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    const newNoteData = {
      title: title.trim(),
      content: content.trim(),
      tags,
      isPublic,
      status,
      parentNoteId: null, // For hierarchical notes
      attachments: [], // For file attachments
      comments: [], // For collaboration
      extensions: [], // For plugin data
      collaborators: [], // For sharing
      metadata: JSON.stringify({
        createdFrom: 'overlay',
        deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
      })
    };

    try {
      const newNote = await appwriteCreateNote(newNoteData);
      if (newNote) {
        onNoteCreated(newNote);
      }
      closeOverlay();
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-light-card dark:bg-dark-card rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-2 border-light-border dark:border-dark-border overflow-hidden max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-accent/5 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center shadow-lg">
            <DocumentTextIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-light-fg dark:text-dark-fg">Create Note</h2>
            <p className="text-sm text-light-fg/70 dark:text-dark-fg/70">Capture your thoughts and ideas</p>
          </div>
        </div>
        <button
          onClick={closeOverlay}
          className="p-2 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg text-light-fg dark:text-dark-fg transition-all duration-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Form Content - Scrollable */}
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-light-fg dark:text-dark-fg">Title</label>
            <input
              type="text"
              placeholder="Give your note a memorable title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-light-fg dark:text-dark-fg placeholder-light-fg/50 dark:placeholder-dark-fg/50 transition-all duration-200"
              maxLength={255}
            />
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-light-fg dark:text-dark-fg">Content</label>
            <textarea
              placeholder="Start writing your beautiful notes here... You can always edit and enhance them later."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-48 p-4 bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-light-fg dark:text-dark-fg placeholder-light-fg/50 dark:placeholder-dark-fg/50 resize-none transition-all duration-200"
              maxLength={65000}
            />
            <div className="text-xs text-light-fg/50 dark:text-dark-fg/50 text-right">
              {content.length}/65000 characters
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-light-fg dark:text-dark-fg flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Tags
            </label>
            
            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-light-fg dark:text-dark-fg placeholder-light-fg/50 dark:placeholder-dark-fg/50 transition-all duration-200"
                maxLength={50}
              />
              <button
                onClick={handleAddTag}
                disabled={!currentTag.trim()}
                className="px-4 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Tag Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-xl text-sm font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-accent/20 rounded-full p-0.5 transition-all duration-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pending Attachments (pre-create) */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-light-fg dark:text-dark-fg flex items-center gap-2">
              Attach Files (optional)
            </label>
            <div className="flex flex-col gap-3">
              <input
                id="pending-files-input"
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 10));
                    e.target.value = '';
                  }
                }}
                className="block w-full text-xs text-light-fg dark:text-dark-fg file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-white file:text-xs file:font-medium hover:file:bg-accent/90 cursor-pointer"
              />
              {pendingFiles.length > 0 && (
                <ul className="space-y-1 max-h-28 overflow-y-auto text-xs rounded-lg border border-light-border dark:border-dark-border p-2 bg-light-bg dark:bg-dark-bg">
                  {pendingFiles.map((f, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span className="truncate flex-1" title={f.name}>{f.name}</span>
                      <span className="opacity-60 text-[10px]">{(f.size/1024).toFixed(1)} KB</span>
                      <button
                        type="button"
                        onClick={() => setPendingFiles(pendingFiles.filter((_, idx) => idx !== i))}
                        className="text-destructive hover:underline"
                      >Remove</button>
                    </li>
                  ))}
                </ul>
              )}
              {pendingFiles.length > 0 && <p className="text-[10px] text-light-fg/60 dark:text-dark-fg/60">Files upload after note creation. Max 10.</p>}
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visibility Setting */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-light-fg dark:text-dark-fg">Visibility</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-all duration-200 ${
                    !isPublic 
                      ? 'bg-accent text-white shadow-lg' 
                      : 'bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border text-light-fg dark:text-dark-fg hover:bg-light-border dark:hover:bg-dark-border'
                  }`}
                >
                  <LockClosedIcon className="h-4 w-4" />
                  Private
                </button>
                <button
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-all duration-200 ${
                    isPublic 
                      ? 'bg-accent text-white shadow-lg' 
                      : 'bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border text-light-fg dark:text-dark-fg hover:bg-light-border dark:hover:bg-dark-border'
                  }`}
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  Public
                </button>
              </div>
            </div>

            {/* Status Setting */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-light-fg dark:text-dark-fg">Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus(AppwriteTypes.Status.DRAFT)}
                  className={`flex-1 p-3 rounded-xl font-medium transition-all duration-200 ${
                    status === AppwriteTypes.Status.DRAFT
                      ? 'bg-accent text-white shadow-lg'
                      : 'bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border text-light-fg dark:text-dark-fg hover:bg-light-border dark:hover:bg-dark-border'
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => setStatus(AppwriteTypes.Status.PUBLISHED)}
                  className={`flex-1 p-3 rounded-xl font-medium transition-all duration-200 ${
                    status === AppwriteTypes.Status.PUBLISHED
                      ? 'bg-accent text-white shadow-lg'
                      : 'bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border text-light-fg dark:text-dark-fg hover:bg-light-border dark:hover:bg-dark-border'
                  }`}
                >
                  Published
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions - Always visible at bottom */}
      <div className="flex justify-end gap-3 p-6 border-t border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 sticky bottom-0 z-10">
        <Button 
          variant="secondary" 
          onClick={closeOverlay}
          disabled={isLoading}
          className="px-6"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCreateNote}
          disabled={!title.trim() || isLoading}
          className="px-6 gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4" />
              Create Note
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
