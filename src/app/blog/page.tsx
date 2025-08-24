"use client";

import { useEffect, useState } from 'react';
import { listPublicNotes } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite.d';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BlogPage() {
  const [publicNotes, setPublicNotes] = useState<Notes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const res = await listPublicNotes();
      setPublicNotes(res.documents || []);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-5 py-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  const tags = ['All Posts', 'Productivity', 'Writing', 'Note-taking', 'Collaboration', 'Tips'];

  return (
    <div className="bg-ash-light text-brownish-white">
      <main className="flex-1 px-8 py-12 lg:px-24 xl:px-40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="text-6xl font-extrabold tracking-tighter text-heading-color">
              From Our Blog
            </h1>
            <p className="mt-4 text-xl text-tag-text-color">
              Insights and stories from the NoteSphere community.
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
                <Card className="group flex flex-col cursor-pointer">
                  <div className="overflow-hidden">
                    <div
                      className="w-full aspect-video bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${note.coverImage || 'https://via.placeholder.com/400x250'})` }}
                    ></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-heading-color mb-2">
                      {note.title}
                    </h3>
                    <p className="text-tag-text-color text-base leading-relaxed mb-4 flex-grow">
                      {note.excerpt || (note.content ? note.content.substring(0, 100) + '...' : '')}
                    </p>
                    <div className="flex gap-2 mt-auto">
                      {note.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs font-semibold bg-tag-bg-color text-tag-text-color px-3 py-1 rounded-full"
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
        </div>
      </main>
    </div>
  );
}
