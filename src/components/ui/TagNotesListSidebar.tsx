'use client';

import React, { useState, useEffect } from 'react';
import { Notes, Tags } from '@/types/appwrite';
import { getNotesByTag } from '@/lib/appwrite';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { NoteDetailSidebar } from './NoteDetailSidebar';
import { formatNoteUpdatedDate } from '@/lib/date-utils';

interface TagNotesListSidebarProps {
  tag: Tags;
  onBack: () => void;
  onNoteUpdate: (updatedNote: Notes) => void;
  onNoteDelete: (noteId: string) => void;
}

export function TagNotesListSidebar({
  tag,
  onBack,
  onNoteUpdate,
  onNoteDelete,
}: TagNotesListSidebarProps) {
  const [notes, setNotes] = useState<Notes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Notes | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedNotes = await getNotesByTag(tag.$id);
        setNotes(fetchedNotes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notes');
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [tag.$id]);

  if (selectedNote) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <button
            onClick={() => setSelectedNote(null)}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Back to notes</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NoteDetailSidebar
            note={selectedNote}
            onUpdate={(updatedNote) => {
              onNoteUpdate(updatedNote);
              setSelectedNote(updatedNote);
            }}
            onDelete={(noteId) => {
              onNoteDelete(noteId);
              setSelectedNote(null);
              setNotes(notes.filter((n) => n.$id !== noteId));
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-background rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-foreground/60 text-sm">No notes with this tag</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {notes.map((note) => (
              <button
                key={note.$id}
                onClick={() => setSelectedNote(note)}
                className="w-full text-left p-3 bg-background border border-border rounded-lg hover:bg-background/80 hover:border-accent transition-all duration-200"
              >
                <h3 className="font-medium text-foreground truncate">
                  {note.title || 'Untitled'}
                </h3>
                <p className="text-xs text-foreground/60 line-clamp-2 mt-1">
                  {note.content || 'No content'}
                </p>
                <p className="text-xs text-foreground/40 mt-2">
                  {formatNoteUpdatedDate(note)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
