'use client';

import { useEffect, useRef, useCallback } from 'react';
import { hasSignificantChanges } from '@/lib/revisions';
import { updateNote } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite';

interface AutosaveOptions {
  minChangeThreshold?: number; // Min chars for content changes (default: 5)
  debounceMs?: number; // Debounce time before considering save (default: 500ms)
  enabled?: boolean; // Enable/disable autosave (default: true)
  onSave?: () => void; // Callback after successful save
  onError?: (error: Error) => void; // Callback on error
}

/**
 * Hook for intelligent autosave on note editors
 * Monitors note changes and saves when substantial changes detected
 * Respects user's revision limits (3 free, 10 paid)
 */
export function useAutosave(
  note: Notes | null,
  options: AutosaveOptions = {}
) {
  const {
    minChangeThreshold = 5,
    debounceMs = 500,
    enabled = true,
    onSave,
    onError,
  } = options;

  const lastSavedRef = useRef<Notes | null>(note);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const performSave = useCallback(
    async (currentNote: Notes) => {
      if (!enabled || isSavingRef.current || !currentNote.$id) {
        return;
      }

      // Check if there are actual significant changes
      if (
        lastSavedRef.current &&
        !hasSignificantChanges(lastSavedRef.current, currentNote, [
          'title',
          'content',
          'tags',
          'format',
        ])
      ) {
        return; // No significant changes
      }

      isSavingRef.current = true;

      try {
        await updateNote(currentNote.$id, currentNote);
        lastSavedRef.current = { ...currentNote };
        onSave?.();
      } catch (error) {
        console.error('Autosave failed:', error);
        onError?.(error as Error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [enabled, onSave, onError]
  );

  // Trigger autosave when note changes
  useEffect(() => {
    if (!enabled || !note) {
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave(note);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [note, enabled, debounceMs, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current,
    forceSync: () => note && performSave(note),
  };
}

export default useAutosave;
