import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import type { Notes } from '@/types/appwrite-types';

interface NoteCardProps {
  note: Notes;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  return (
    <Card className="flex flex-col bg-card border border-border note-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/70">
          {note.content}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {note.tags?.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;