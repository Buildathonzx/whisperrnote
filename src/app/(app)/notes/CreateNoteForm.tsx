"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createNote as appwriteCreateNote } from '@/lib/appwrite';
import { useOverlay } from '@/components/ui/OverlayContext';
import DoodleCanvas from '@/components/DoodleCanvas';
import type { Notes } from '@/types/appwrite';
import * as AppwriteTypes from '@/types/appwrite';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  TagIcon, 
  GlobeAltIcon, 
  LockClosedIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface CreateNoteFormProps {
  onNoteCreated: (note: Notes) => void;
  initialContent?: {
    title?: string;
    content?: string;
    tags?: string[];
  };
  initialFormat?: 'text' | 'doodle';
}

export default function CreateNoteForm({ onNoteCreated, initialContent, initialFormat = 'text' }: CreateNoteFormProps) {
  const [title, setTitle] = useState(initialContent?.title || '');
  const [content, setContent] = useState(initialContent?.content || '');
  const [format, setFormat] = useState<'text' | 'doodle'>(initialFormat);
  const [tags, setTags] = useState<string[]>(initialContent?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<AppwriteTypes.Status>(AppwriteTypes.Status.DRAFT);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ uploaded: number; total: number }>({ uploaded: 0, total: 0 });
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [showDoodleEditor, setShowDoodleEditor] = useState(false);
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

  const handleDoodleSave = (doodleData: string) => {
    setContent(doodleData);
    setFormat('doodle');
    setShowDoodleEditor(false);
  };

  const handleCreateNote = async () => {
    if (!title.trim() || isLoading || uploading) return;

    setIsLoading(true);
    const newNoteData = {
      title: title.trim(),
      content: content.trim(),
      format,
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
        // Upload pending files sequentially (simple approach for now)
        if (pendingFiles.length) {
          setUploading(true);
          setUploadProgress({ uploaded: 0, total: pendingFiles.length });
          let hadErrors = false;
          for (let i = 0; i < pendingFiles.length; i++) {
            const file = pendingFiles[i];
            try {
              const formData = new FormData();
              formData.append('file', file);
              const res = await fetch(`/api/notes/${newNote.$id || (newNote as any).id}/attachments`, {
                method: 'POST',
                body: formData
              });
              if (!res.ok) {
                let errorPayload: any = null;
                try { errorPayload = await res.json(); } catch { try { errorPayload = { raw: await res.text() }; } catch { errorPayload = {}; } }
                const msg = errorPayload?.error || `Upload failed (${res.status})`;
                setUploadErrors(prev => [...prev, `${file.name}: ${msg}`].slice(-8));
                hadErrors = true;
                console.error('Attachment upload failed', { status: res.status, statusText: res.statusText, error: errorPayload });
              }
            } catch (e: any) {
              hadErrors = true;
              setUploadErrors(prev => [...prev, `${file.name}: ${e?.message || 'Upload error'}`].slice(-8));
              console.error('Attachment upload error', e);
            } finally {
              setUploadProgress(prev => ({ uploaded: prev.uploaded + 1, total: prev.total }));
            }
          }
          if (hadErrors) {
            // Do not close overlay; allow user to see errors
            return;
          }
        }
      }
      closeOverlay();
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsLoading(false);
      setUploading(false);
      setPendingFiles([]);
    }
  };

  return (
    <>
      {showDoodleEditor && (
        <DoodleCanvas
          initialData={format === 'doodle' ? content : ''}
          onSave={handleDoodleSave}
          onClose={() => setShowDoodleEditor(false)}
        />
      )}
      
      <div className="w-full max-w-2xl mx-auto bg-light-card dark:bg-dark-card rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-2 border-light-border dark:border-dark-border overflow-hidden max-h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-accent/5 to-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center shadow-lg">
              {format === 'doodle' ? (
                <PencilIcon className="h-6 w-6 text-white" />
              ) : (
                <DocumentTextIcon className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-light-fg dark:text-dark-fg">
                {format === 'doodle' ? 'Create Doodle' : 'Create Note'}
              </h2>
              <p className="text-sm text-light-fg/70 dark:text-dark-fg/70">
                {format === 'doodle' ? 'Draw and sketch your ideas' : 'Capture your thoughts and ideas'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Format Toggle */}
            <div className="flex bg-light-bg dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border p-1">
              <button
                onClick={() => setFormat('text')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  format === 'text'
                    ? 'bg-accent text-white'
                    : 'text-light-fg dark:text-dark-fg hover:bg-light-border dark:hover:bg-dark-border'
                }`}
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Text</span>
              </button>
              <button
                onClick={() => setFormat('doodle')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  format === 'doodle'
                    ? 'bg-accent text-white'
                    : 'text-light-fg dark:text-dark-fg hover:bg-light-border dark:hover:bg-dark-border'
                }`}
              >
                <PencilIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Doodle</span>
              </button>
            </div>
            
            <button
              onClick={closeOverlay}
              className="p-2 rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg text-light-fg dark:text-dark-fg transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-4 space-y-6">
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

          {/* Content - Text or Doodle */}
          {format === 'text' ? (
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
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-light-fg dark:text-dark-fg">Doodle</label>
              {content ? (
                <div className="relative w-full h-48 rounded-2xl border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg overflow-hidden">
                  <canvas 
                    className="w-full h-full"
                    ref={(canvas) => {
                      if (!canvas || !content) return;
                      try {
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        const strokes = JSON.parse(content);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        strokes.forEach((stroke: any) => {
                          if (stroke.points.length < 2) return;
                          ctx.strokeStyle = stroke.color;
                          ctx.lineWidth = stroke.size;
                          ctx.lineCap = 'round';
                          ctx.lineJoin = 'round';
                          ctx.beginPath();
                          ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
                          for (let i = 1; i < stroke.points.length; i++) {
                            ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
                          }
                          ctx.stroke();
                        });
                      } catch {
                        // Invalid doodle data
                      }
                    }}
                    width={800}
                    height={600}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDoodleEditor(true)}
                    className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center"
                  >
                    <span className="bg-accent text-white px-3 py-1.5 rounded-lg text-sm font-medium">Edit</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDoodleEditor(true)}
                  className="w-full h-48 border-2 border-dashed border-light-border dark:border-dark-border rounded-2xl bg-light-bg/50 dark:bg-dark-bg/50 hover:bg-light-bg dark:hover:bg-dark-bg transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 bg-accent/10 group-hover:bg-accent/20 rounded-2xl flex items-center justify-center transition-all duration-200">
                    <PencilIcon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-light-fg dark:text-dark-fg">Start Drawing</p>
                    <p className="text-xs text-light-fg/60 dark:text-dark-fg/60">Click to open doodle editor</p>
                  </div>
                </button>
              )}
            </div>
          )}

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

          {/* File Upload Section - Enhanced UX */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-light-fg dark:text-dark-fg flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              Attach Files (optional)
            </label>
            
            <div className="flex flex-col gap-3">
              {/* Drop zone style file input */}
              <label
                htmlFor="pending-files-input" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-light-border dark:border-dark-border rounded-2xl cursor-pointer bg-light-bg/50 dark:bg-dark-bg/50 hover:bg-light-bg dark:hover:bg-dark-bg transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PlusIcon className="h-8 w-8 text-light-fg/50 dark:text-dark-fg/50 mb-2" />
                  <p className="text-sm text-light-fg dark:text-dark-fg font-medium">Click to select files</p>
                  <p className="text-xs text-light-fg/60 dark:text-dark-fg/60">Images, PDFs, Text files • Max 10 files • 20MB each</p>
                </div>
                <input
                  id="pending-files-input"
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.md,.txt"
                  onChange={(e) => {
                    if (e.target.files) {
                      setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 10));
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
              </label>
              
              {/* File list */}
              {pendingFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-light-fg/70 dark:text-dark-fg/70 font-medium">
                      {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} selected
                    </p>
                    <button
                      type="button"
                      onClick={() => setPendingFiles([])}
                      className="text-xs text-destructive hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-24 overflow-y-auto rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
                    {pendingFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 p-3 hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-light-fg dark:text-dark-fg font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-light-fg/60 dark:text-dark-fg/60">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingFiles(pendingFiles.filter((_, idx) => idx !== i))}
                          className="p-1 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload progress */}
              {uploading && uploadProgress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-accent">Uploading files...</span>
                    <span className="text-light-fg/60 dark:text-dark-fg/60">
                      {uploadProgress.uploaded}/{uploadProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Upload errors */}
              {uploadErrors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-destructive font-medium">Upload Errors:</p>
                  <div className="space-y-1">
                    {uploadErrors.map((err, i) => (
                      <div key={i} className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
      <div className="flex justify-end gap-3 p-6 border-t border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 flex-shrink-0">
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
          disabled={!title.trim() || !content.trim() || isLoading || uploading}
          className="px-6 gap-2"
        >
          {(isLoading || uploading) ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              {uploading && uploadProgress.total > 0 ? `Uploading ${uploadProgress.uploaded}/${uploadProgress.total}` : 'Creating...'}
            </>
          ) : (
            <>
              {format === 'doodle' ? (
                <PencilIcon className="h-4 w-4" />
              ) : (
                <DocumentTextIcon className="h-4 w-4" />
              )}
              {pendingFiles.length ? `Create & Upload (${pendingFiles.length})` : `Create ${format === 'doodle' ? 'Doodle' : 'Note'}`}
            </>
          )}
        </Button>
      </div>
    </div>
    </>
  );
}
