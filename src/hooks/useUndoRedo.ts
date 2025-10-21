'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNoteRevisions, getNoteRevision } from '@/lib/revisions';
import { updateNote } from '@/lib/appwrite';
import type { Notes, NoteRevisions } from '@/types/appwrite';

interface UndoRedoState {
  currentIndex: number;
  revisions: NoteRevisions[];
  isLoading: boolean;
  isUndoable: boolean;
  isRedoable: boolean;
}

/**
 * Hook for undo/redo functionality based on revision history
 * Loads revisions and allows stepping through them
 */
export function useUndoRedo(noteId: string | null, currentNote: Notes | null) {
  const [state, setState] = useState<UndoRedoState>({
    currentIndex: -1,
    revisions: [],
    isLoading: false,
    isUndoable: false,
    isRedoable: false,
  });

  // Load revision history on mount or when note changes
  useEffect(() => {
    if (!noteId) return;

    const loadRevisions = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const revisions = await getNoteRevisions(noteId);
        setState((prev) => ({
          ...prev,
          revisions,
          currentIndex: revisions.length > 0 ? revisions.length - 1 : -1,
          isLoading: false,
          isUndoable: revisions.length > 1,
          isRedoable: false,
        }));
      } catch (error) {
        console.error('Failed to load revisions:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadRevisions();
  }, [noteId]);

  // Undo: go to previous revision
  const undo = useCallback(async () => {
    if (!state.isUndoable || !noteId) return;

    const newIndex = state.currentIndex - 1;
    if (newIndex < 0) return;

    const revision = state.revisions[newIndex];
    if (!revision) return;

    try {
      // Restore this revision as the current state
      const updated = {
        ...currentNote,
        title: revision.title,
        content: revision.content,
      } as Notes;

      await updateNote(noteId, updated);

      setState((prev) => ({
        ...prev,
        currentIndex: newIndex,
        isUndoable: newIndex > 0,
        isRedoable: newIndex < prev.revisions.length - 1,
      }));
    } catch (error) {
      console.error('Undo failed:', error);
    }
  }, [state.isUndoable, state.currentIndex, state.revisions, noteId, currentNote]);

  // Redo: go to next revision
  const redo = useCallback(async () => {
    if (!state.isRedoable || !noteId) return;

    const newIndex = state.currentIndex + 1;
    if (newIndex >= state.revisions.length) return;

    const revision = state.revisions[newIndex];
    if (!revision) return;

    try {
      // Restore this revision as the current state
      const updated = {
        ...currentNote,
        title: revision.title,
        content: revision.content,
      } as Notes;

      await updateNote(noteId, updated);

      setState((prev) => ({
        ...prev,
        currentIndex: newIndex,
        isUndoable: newIndex > 0,
        isRedoable: newIndex < prev.revisions.length - 1,
      }));
    } catch (error) {
      console.error('Redo failed:', error);
    }
  }, [state.isRedoable, state.currentIndex, state.revisions, noteId, currentNote]);

  // Go to specific revision by number
  const goToRevision = useCallback(
    async (revisionNumber: number) => {
      if (!noteId) return;

      const revision = await getNoteRevision(noteId, revisionNumber);
      if (!revision) return;

      try {
        const updated = {
          ...currentNote,
          title: revision.title,
          content: revision.content,
        } as Notes;

        await updateNote(noteId, updated);

        const newIndex = state.revisions.findIndex(
          (r) => r.revision === revisionNumber
        );
        if (newIndex >= 0) {
          setState((prev) => ({
            ...prev,
            currentIndex: newIndex,
            isUndoable: newIndex > 0,
            isRedoable: newIndex < prev.revisions.length - 1,
          }));
        }
      } catch (error) {
        console.error('Go to revision failed:', error);
      }
    },
    [state.revisions, noteId, currentNote]
  );

  return {
    revisions: state.revisions,
    currentRevision:
      state.currentIndex >= 0 && state.currentIndex < state.revisions.length
        ? state.revisions[state.currentIndex]
        : null,
    currentIndex: state.currentIndex,
    isLoading: state.isLoading,
    isUndoable: state.isUndoable,
    isRedoable: state.isRedoable,
    undo,
    redo,
    goToRevision,
  };
}

export default useUndoRedo;
