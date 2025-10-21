'use client';

import React, { useState, useEffect } from 'react';
import { Notes } from '@/types/appwrite';
import DoodleCanvas from '@/components/DoodleCanvas';
import { PencilIcon, TrashIcon, UserIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Modal } from './modal';
import { formatNoteCreatedDate, formatNoteUpdatedDate } from '@/lib/date-utils';
import { getNoteWithSharing } from '@/lib/appwrite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { useToast } from './Toast';
import { preProcessMarkdown } from '@/lib/markdown';
import { formatFileSize } from '@/lib/utils';
import NoteContentDisplay from '@/components/NoteContentDisplay';

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

export function NoteDetailSidebar({ note, onUpdate, onDelete }: NoteDetailSidebarProps) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDoodleEditor, setShowDoodleEditor] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [format, setFormat] = useState<'text' | 'doodle'>(note.format as 'text' | 'doodle' || 'text');
  const [tags, setTags] = useState(note.tags?.join(', ') || '');
  const [enhancedNote, setEnhancedNote] = useState<EnhancedNote | null>(null);

  const { showSuccess, showError } = useToast();

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

  const handleDoodleSave = (doodleData: string) => {
    setContent(doodleData);
    setShowDoodleEditor(false);
  };

  const handleSave = () => {
    const updatedNote: Notes = {
      ...note,
      title: title.trim(),
      content: content.trim(),
      format: format as string,
      tags: tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    };
    onUpdate(updatedNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setFormat(note.format as 'text' | 'doodle' || 'text');
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
            <div className="space-y-3">
              {/* Format Toggle */}
              <div className="flex gap-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setFormat('text')}
                  className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    format === 'text'
                      ? 'bg-accent text-white'
                      : 'text-foreground hover:bg-accent/20'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setFormat('doodle')}
                  className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    format === 'doodle'
                      ? 'bg-accent text-white'
                      : 'text-foreground hover:bg-accent/20'
                  }`}
                >
                  Doodle
                </button>
              </div>

              {/* Content Based on Format */}
              {format === 'text' ? (
                <textarea
                  value={content || ''}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground resize-none"
                />
              ) : (
                <div className="space-y-3">
                  {content ? (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <NoteContentDisplay
                        content={content}
                        format="doodle"
                        className="w-full"
                        onEditDoodle={() => setShowDoodleEditor(true)}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDoodleEditor(true)}
                      className="w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:bg-accent/5 transition-colors"
                    >
                      <span className="text-sm text-muted">Click to draw</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              {note.format === 'doodle' ? (
                <NoteContentDisplay
                  content={note.content || ''}
                  format="doodle"
                  className="rounded-lg border border-border mb-2"
                  onEditDoodle={() => setIsEditing(true)}
                />
              ) : (
                <div className="text-foreground/80 prose prose-sm max-w-none dark:prose-invert">
                  {note.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                    >
                      {preProcessMarkdown(note.content)}
                    </ReactMarkdown>
                  ) : (
                    <span className="italic text-muted">No content</span>
                  )}
                </div>
              )}

              {/* Copy Button - only for text notes */}
              {note.format !== 'doodle' && note.content && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(note.content || '');
                        showSuccess('Copied', 'Content copied to clipboard');
                      } catch (err) {
                        console.error('Failed to copy note content', err);
                        showError('Copy failed', 'Could not copy content to clipboard');
                      }
                    }}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
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

        {/* Attachments */}
        {note.attachments && note.attachments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Attachments</label>
            <ul className="space-y-1 max-h-40 overflow-auto pr-1">
              {note.attachments.map((a: any) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-xs bg-accent/10 rounded px-2 py-1">
                  <div className="flex flex-col min-w-0">
                    <a href={`/notes/${note.$id}/${a.id}`} className="truncate font-medium text-accent hover:underline" title={a.name}>{a.name}</a>
                    <span className="text-[10px] text-muted-foreground">{formatFileSize(a.size)}{a.mime?` • ${a.mime}`:''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/notes/${note.$id}/${a.id}`}
                      className="text-accent hover:underline"
                      title="Open attachment"
                    >Open</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

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

      {/* Doodle Editor Modal */}
      {showDoodleEditor && (
        <DoodleCanvas
          initialData={format === 'doodle' ? content : ''}
          onSave={handleDoodleSave}
          onClose={() => setShowDoodleEditor(false)}
        />
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
