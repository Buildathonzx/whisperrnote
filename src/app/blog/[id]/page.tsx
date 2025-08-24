"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getNote, getUser } from '@/lib/appwrite';
import type { Notes, Users } from '@/types/appwrite.d';
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
      <div className="container mx-auto px-5 py-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-ash-white">
      <main className="flex flex-1 justify-center py-12 px-8">
        <div className="w-full max-w-4xl">
          <article className="content-card p-6 sm:p-10">
            <div className="mb-8">
              <div
                className="w-full aspect-[16/9] bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden solid-3d-card"
                style={{ backgroundImage: `url(${note.coverImage || 'https://via.placeholder.com/1200x675'})` }}
              >
                <div className="w-full h-full bg-gradient-to-t from-black/50 to-transparent p-6 flex flex-col justify-end">
                  <h1
                    className="text-brownish-white text-4xl lg:text-5xl font-extrabold !font-['Newsreader'] tracking-tighter leading-tight"
                    style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
                  >
                    {note.title}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-6 text-sm text-text-muted">
              <p>By {author?.name || 'Unknown'}</p>
              <p>Published on {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}</p>
            </div>
            <div className="flex gap-3 mb-8 flex-wrap">
              {note.tags?.map((tag, index) => (
                <Button key={index} variant="secondary">
                  {tag}
                </Button>
              ))}
            </div>
            <div className="prose prose-lg max-w-none text-text-main leading-relaxed space-y-6" dangerouslySetInnerHTML={{ __html: note.content || '' }}>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
