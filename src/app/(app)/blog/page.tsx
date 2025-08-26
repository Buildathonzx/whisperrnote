"use client";

import { useEffect, useState } from 'react';
import { listPublicNotes } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite-types';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BlogPage() {
  const [publicNotes, setPublicNotes] = useState<Notes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const res = await listPublicNotes();
      setPublicNotes((res.documents as unknown) as Notes[]);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  if (loading) {
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

  const tags = ['All Posts', 'Productivity', 'Writing', 'Note-taking', 'Collaboration', 'Tips'];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="px-6 md:px-20 lg:px-40 py-12 max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground">
            From Our Blog
          </h1>
          <p className="mt-4 text-xl text-foreground/70">
            Insights and stories from the WhisperNote community.
          </p>
        </div>
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {tags.map((tag, index) => (
            <Button key={index} variant={index === 0 ? 'default' : 'secondary'}>
              {tag}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {publicNotes.map((note) => (
            <Link key={note.$id} href={`/blog/${note.$id}`} passHref>
              <Card className="group flex flex-col cursor-pointer hover:shadow-xl transition-shadow duration-300">
                <div className="overflow-hidden">
                  <div
                    className="w-full aspect-video bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-card border border-border rounded-t-xl"
                    style={{ backgroundImage: `url('https://via.placeholder.com/400x250')` }}
                  ></div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {note.title}
                  </h3>
                  <p className="text-foreground/70 text-base leading-relaxed mb-4 flex-grow">
                    {note.content ? note.content.substring(0, 100) + '...' : ''}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    {note.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs font-semibold bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
