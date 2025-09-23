'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { Notes } from '@/types/appwrite';
import { PencilIcon, TrashIcon, UserIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Modal } from './modal';
import { formatNoteCreatedDate, formatNoteUpdatedDate } from '@/lib/date-utils';
import { getNoteWithSharing } from '@/lib/appwrite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface NoteDetailSidebarProps {
  note: Notes;
  onUpdate: (updatedNote: Notes) => void;
  onDelete: (noteId: string) => void;
}

interface EnhancedNote extends Notes {
  isSharedWithUser?: boolean;
  sharePermission?: string;
  sharedBy?: { name: string; email: string } | null;
}

interface NoteDetailSidebarProps {
  note: Notes;
  onUpdate: (updatedNote: Notes) => void;
  onDelete: (noteId: string) => void;
}

export function NoteDetailSidebar({ note, onUpdate, onDelete }: NoteDetailSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags?.join(', ') || '');
  const [enhancedNote, setEnhancedNote] = useState<EnhancedNote | null>(null);

  // Load enhanced note with sharing information
  useEffect(() => {
    const loadEnhancedNote = async () => {
      if (note.$id) {
        try {
          const enhanced = await getNoteWithSharing(note.$id);
          if (enhanced) {
            setEnhancedNote(enhanced);
          }
        } catch (error) {
          console.error('Error loading note sharing info:', error);
        }
      }
    };

    loadEnhancedNote();
  }, [note.$id]);

  const handleSave = () => {
    const updatedNote = {
      ...note,
      title,
      content,
      tags: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags?.join(', ') || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(note.$id || '');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant={isEditing ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="flex-1"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          {isEditing ? 'Editing' : 'Edit'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
            />
          ) : (
            <h1 className="text-xl font-bold text-foreground">
              {note.title}
            </h1>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Content
          </label>
          {isEditing ? (
            <textarea
              value={content || ''}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground resize-none"
            />
          ) : (
            <div>
              <div className="text-foreground/80 prose prose-sm max-w-none dark:prose-invert">
                {note.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {note.content}
                  </ReactMarkdown>
                ) : (
                  <span className="italic text-muted">No content</span>
                )}
              </div>

              {/* Copy Markdown Button */}
              {note.content && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(note.content || '');
                        // show success toast
                      } catch (err) {
                        // show error toast
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Tags
          </label>
          {isEditing ? (
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separate tags with commas"
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {note.tags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="text-sm text-muted">
            Created: {formatNoteCreatedDate(note)}
          </div>
          <div className="text-sm text-muted">
            Updated: {formatNoteUpdatedDate(note)}
          </div>
          
          {/* Sharing Information */}
          {enhancedNote?.isSharedWithUser && enhancedNote?.sharedBy && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <UserIcon className="h-4 w-4" />
                  <span>
                    Shared by {enhancedNote.sharedBy.name || enhancedNote.sharedBy.email}
                  </span>
                </div>
                {enhancedNote.sharePermission && (
                  <div className="text-xs text-muted mt-1">
                    Permission: {enhancedNote.sharePermission}
                  </div>
                )}
              </div>
          )}
        </div>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Note"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete &quot;{note.title || 'this note'}&quot;? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete Note
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}