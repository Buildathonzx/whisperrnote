"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { listNotesPaginated } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite.d';
import { useAuth } from '@/components/ui/AuthContext';

interface NotesContextType {
  notes: Notes[];
  totalNotes: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetchNotes: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Notes[]>([]);
  const [totalNotes, setTotalNotes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null); // last fetched document id

  // Refs to avoid unnecessary re-creations / dependency loops
  const isFetchingRef = useRef(false);
  const notesRef = useRef<Notes[]>([]);
  const cursorRef = useRef<string | null>(null);
  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { cursorRef.current = cursor; }, [cursor]);

  const { isAuthenticated } = useAuth();

  const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_NOTES_PAGE_SIZE || 50);

  const fetchBatch = useCallback(async (reset: boolean = false) => {
    if (isFetchingRef.current) return;

    if (!isAuthenticated) {
      setNotes([]);
      setTotalNotes(0);
      setIsLoading(false);
      setHasMore(false);
      setError(null);
      return;
    }

    isFetchingRef.current = true;
    if (reset) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const res = await listNotesPaginated({
        limit: PAGE_SIZE,
        cursor: reset ? null : (cursorRef.current || null),
      });

      const batch = res.documents as Notes[];

      setNotes(prev => {
        if (reset) return batch;
        const existingIds = new Set(prev.map(n => n.$id));
        const newOnes = batch.filter(n => !existingIds.has(n.$id));
        return [...prev, ...newOnes];
      });

      setTotalNotes(res.total || 0);
      setHasMore(!!res.hasMore);
      if (res.nextCursor) {
        setCursor(res.nextCursor);
      } else if (reset) {
        setCursor(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
      if (reset) {
        setNotes([]);
        setTotalNotes(0);
      }
      setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [isAuthenticated, PAGE_SIZE]); // intentionally exclude cursor & notes to prevent infinite loop

  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingRef.current) return;
    await fetchBatch(false);
  }, [hasMore, fetchBatch]);

  const refetchNotes = useCallback(() => {
    setCursor(null);
    cursorRef.current = null;
    setHasMore(true);
    fetchBatch(true);
  }, [fetchBatch]);

  // Initial fetch or auth state change
  useEffect(() => {
    if (isAuthenticated) {
      fetchBatch(true);
    } else {
      setNotes([]);
      setTotalNotes(0);
      setHasMore(false);
      setIsLoading(false);
      setError(null);
    }
  }, [isAuthenticated, fetchBatch]);

  return (
    <NotesContext.Provider value={{ notes, totalNotes, isLoading, error, hasMore, loadMore, refetchNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
