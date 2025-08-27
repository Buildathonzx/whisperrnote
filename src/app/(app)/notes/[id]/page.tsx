"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getNote } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftIcon,
  ShareIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function NoteEditorPage() {
  const { id } = useParams();
  const [note, setNote] = useState<Notes | null>(null);

  useEffect(() => {
    if (id) {
      getNote(id as string).then(setNote);
    }
  }, [id]);

  if (!note) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full grow flex-col bg-light-bg dark:bg-dark-bg">
      <header className="flex items-center justify-between whitespace-nowrap px-10 py-5">
        <div className="flex items-center gap-3 text-light-fg dark:text-dark-fg">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notes">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">
            {note.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button>
            <ShareIcon className="h-5 w-5 mr-2" />
            Share
          </Button>
          <UserCircleIcon className="h-12 w-12 text-gray-400" />
        </div>
      </header>
      <main className="flex-1 px-16 sm:px-24 md:px-32 lg:px-48 xl:px-64 2xl:px-80 py-12 flex justify-center">
        <div className="w-full max-w-4xl">
          <input
            className="form-input w-full resize-none overflow-hidden border-none bg-transparent p-4 text-5xl font-bold text-light-fg dark:text-dark-fg placeholder:text-gray-400 focus:outline-none focus:ring-0"
            placeholder="Note Title"
            defaultValue={note.title || ''}
          />
          <textarea
            className="form-textarea mt-4 w-full min-h-[60vh] resize-none overflow-hidden border-none bg-transparent p-4 text-xl leading-relaxed text-light-fg dark:text-dark-fg placeholder:text-gray-400 focus:outline-none focus:ring-0"
            placeholder="Start writing your beautiful notes here..."
            defaultValue={note.content || ''}
          ></textarea>
        </div>
      </main>
    </div>
  );
}
