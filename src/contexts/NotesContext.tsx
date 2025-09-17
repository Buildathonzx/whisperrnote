"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { listNotes } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite.d';
import { useAuth } from '@/components/ui/AuthContext';

interface NotesContextType {
  notes: Notes[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetchNotes: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Notes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const notesRef = useRef<Notes[]>([]);
  useEffect(() => { notesRef.current = notes; }, [notes]);
  const isFetchingRef = useRef(false);
  const { isAuthenticated } = useAuth();

  const PAGE_SIZE = 50;

  const fetchBatch = useCallback(async (reset: boolean = false) => {
    if (isFetchingRef.current) return;
    if (!isAuthenticated) {
      setNotes([]);
      setIsLoading(false);
      setHasMore(false);
      return;
    }

    isFetchingRef.current = true;
    if (reset) setIsLoading(true);
    setError(null);

    try {
       // Remove unused placeholder queries to avoid triggering re-renders
       // const queries: any[] = [];
      if (cursor && !reset) {
        // Appwrite cursorAfter requires the document ID; leveraging ordering by createdAt desc
        // Instead of cursor we rely on already fetched count; use listNotes with offset-like behavior by filtering locally if needed.
      }
      // For simplicity, use listNotes with limit; since Appwrite doesn't provide skip, emulate pagination by storing all fetched and using last id as cursorAfter
      // We'll perform actual cursorAfter using last note id when present
      let listQueries: any[] = [];
      if (notes.length && !reset) {
        const last = notes[notes.length - 1];
        if (last?.$id) {
          // We'll request notes created before the last note by adding a createdAt less than condition if schema supports; fallback to orderDesc and cursorAfter once available
        }
      }
      const res: any = await listNotes(listQueries, PAGE_SIZE);
      const batch = res.documents as Notes[];

      setNotes(prev => reset ? batch : [...prev, ...batch]);
      // If fewer than page size returned, no more data
      setHasMore(batch.length === PAGE_SIZE);
      if (batch.length) {
        setCursor(batch[batch.length - 1].$id || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
      if (reset) setNotes([]);
      setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [isAuthenticated, cursor, notes]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingRef.current) return;
    await fetchBatch(false);
  }, [hasMore, fetchBatch]);

  const refetchNotes = useCallback(() => {
    setCursor(null);
    setHasMore(true);
    fetchBatch(true);
  }, [fetchBatch]);

  useEffect(() => {
    // Only trigger an initial fetch when authentication state becomes true or when explicitly resetting.
    if (isAuthenticated) {
      fetchBatch(true);
    } else {
      setNotes([]);
      setHasMore(false);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchBatch]);

  return (
    <NotesContext.Provider value={{ notes, isLoading, error, hasMore, loadMore, refetchNotes }}>
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
