"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllNotes } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite.d';
import { useAuth } from '@/components/ui/AuthContext';

interface NotesContextType {
  notes: Notes[];
  isLoading: boolean;
  error: string | null;
  refetchNotes: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Notes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchNotes = async () => {
    if (!isAuthenticated) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllNotes();
      setNotes(result.documents as Notes[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [isAuthenticated]);

  const refetchNotes = () => {
    fetchNotes();
  };

  return (
    <NotesContext.Provider value={{ notes, isLoading, error, refetchNotes }}>
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
