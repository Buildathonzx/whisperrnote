"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createNote as appwriteCreateNote } from '@/lib/appwrite';
import { useOverlay } from '@/components/ui/OverlayContext';
import type { Notes } from '@/types/appwrite.d';

interface CreateNoteFormProps {
  onNoteCreated: (note: Notes) => void;
}

export default function CreateNoteForm({ onNoteCreated }: CreateNoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const { closeOverlay } = useOverlay();

  const handleCreateNote = async () => {
    if (!title.trim()) return;

    const newNoteData = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()),
      isPublic: false,
    };

    try {
      const newNote = await appwriteCreateNote(newNoteData);
      if (newNote) {
        onNoteCreated(newNote);
      }
      closeOverlay();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-dark-card rounded-2xl shadow-3d-dark">
      <h2 className="text-2xl font-bold text-center text-dark-fg">Create a New Note</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <textarea
          placeholder="Start writing your beautiful notes here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 p-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        ></textarea>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={closeOverlay}>
          Cancel
        </Button>
        <Button onClick={handleCreateNote}>
          Create Note
        </Button>
      </div>
    </div>
  );
}
