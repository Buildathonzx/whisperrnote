"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_NOTES, Query, getCurrentUser } from '@/lib/appwrite';
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
      const user = await getCurrentUser();
      if (!user || !user.$id) {
        setNotes([]);
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      const queries: any[] = [
        Query.equal('userId', user.$id),
        Query.limit(PAGE_SIZE),
        Query.orderDesc('$createdAt')
      ];

      // Only add cursorAfter for subsequent (non-reset) loads
      const activeCursor = cursorRef.current;
      if (!reset && activeCursor) {
        queries.push(Query.cursorAfter(activeCursor));
      }

      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID_NOTES,
        queries
      );

      const batch = res.documents as unknown as Notes[];

      setNotes(prev => {
        if (reset) return batch;
        // Append only new notes (avoid duplicates when cursor logic races)
        const existingIds = new Set(prev.map(n => n.$id));
        const newOnes = batch.filter(n => !existingIds.has(n.$id));
        return [...prev, ...newOnes];
      });

      // Determine if more pages likely exist
      setHasMore(batch.length === PAGE_SIZE);

      if (batch.length) {
        const lastId = batch[batch.length - 1].$id || null;
        setCursor(lastId);
      } else if (reset) {
        setCursor(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
      if (reset) setNotes([]);
      setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [isAuthenticated]); // intentionally exclude cursor & notes to prevent infinite loop

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
      setHasMore(false);
      setIsLoading(false);
      setError(null);
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
