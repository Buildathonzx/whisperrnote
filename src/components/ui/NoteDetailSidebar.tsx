'use client';

import React, { useState } from 'react';
import { Notes } from '@/types/appwrite-types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Modal } from './modal';
import { formatNoteCreatedDate, formatNoteUpdatedDate, noteHasBeenUpdated } from '@/lib/date-utils';

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

  const handleSave = () => {
    const updatedNote = {
      ...note,
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
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
          <label className="block text-sm font-medium text-light-fg/70 dark:text-dark-fg/70 mb-2">
            Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg"
            />
          ) : (
            <h1 className="text-xl font-bold text-light-fg dark:text-dark-fg">
              {note.title}
            </h1>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-light-fg/70 dark:text-dark-fg/70 mb-2">
            Content
          </label>
          {isEditing ? (
            <textarea
              value={content || ''}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg resize-none"
            />
          ) : (
            <div className="text-light-fg/80 dark:text-dark-fg/80 whitespace-pre-wrap">
              {note.content}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-light-fg/70 dark:text-dark-fg/70 mb-2">
            Tags
          </label>
          {isEditing ? (
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separate tags with commas"
              className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {note.tags?.map((tag, index) => (
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
        <div className="pt-4 border-t border-light-border dark:border-dark-border space-y-2">
          <div className="text-sm text-light-fg/60 dark:text-dark-fg/60">
            Created: {formatNoteCreatedDate(note)}
          </div>
          {noteHasBeenUpdated(note) && (
            <div className="text-sm text-light-fg/60 dark:text-dark-fg/60">
              Updated: {formatNoteUpdatedDate(note)}
            </div>
          )}
        </div>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-2 pt-4 border-t border-light-border dark:border-dark-border">
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
          <p className="text-light-fg dark:text-dark-fg">
            Are you sure you want to delete "{note.title || 'this note'}"? This action cannot be undone.
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