"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getNote, getUser } from '@/lib/appwrite';
import type { Notes, Users } from '@/types/appwrite-types';
import { formatNoteCreatedDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/Button';

export default function BlogDetailPage() {
  const params = useParams();
  const noteId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const [note, setNote] = useState<Notes | null>(null);
  const [author, setAuthor] = useState<Users | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      const n = await getNote(noteId);
      setNote(n);
      if (n?.userId) {
        const u = await getUser(n.userId);
        setAuthor(u);
      }
      setLoading(false);
    };
    fetchNote();
  }, [noteId]);

  if (loading || !note) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <main className="px-6 md:px-20 lg:px-40 py-12 max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="px-6 md:px-20 lg:px-40 py-12 max-w-6xl mx-auto">
        <div className="w-full max-w-4xl mx-auto">
          <article className="bg-card border border-border rounded-2xl shadow-3d-light dark:shadow-3d-dark p-6 sm:p-10">
            <div className="mb-8">
              <div
                className="w-full aspect-[16/9] bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl border border-border"
                style={{ backgroundImage: `url('https://via.placeholder.com/1200x675')` }}
              >
                <div className="w-full h-full bg-gradient-to-t from-black/50 to-transparent p-6 flex flex-col justify-end">
                  <h1
                    className="text-white text-4xl lg:text-5xl font-extrabold tracking-tighter leading-tight"
                    style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
                  >
                    {note.title}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-6 text-sm text-foreground/60">
              <p>By {author?.name || 'Unknown'}</p>
              <p>Published on {formatNoteCreatedDate(note, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex gap-3 mb-8 flex-wrap">
              {note.tags?.map((tag, index) => (
                <Button key={index} variant="secondary">
                  {tag}
                </Button>
              ))}
            </div>
            <div className="prose prose-lg max-w-none text-foreground leading-relaxed space-y-6 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:bg-background prose-pre:border prose-pre:border-border" dangerouslySetInnerHTML={{ __html: note.content || '' }}>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
