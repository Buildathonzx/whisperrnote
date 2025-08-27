import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import type { Notes } from '@/types/appwrite-types';

interface NoteCardProps {
  note: Notes;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  return (
    <Card className="flex flex-col bg-card border border-border note-card h-48 sm:h-52 md:h-56 lg:h-60">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-base sm:text-lg font-bold text-foreground line-clamp-2">
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between min-h-0">
        <p className="text-xs sm:text-sm text-foreground/70 line-clamp-4 sm:line-clamp-5 md:line-clamp-6 overflow-hidden">
          {note.content}
        </p>
        {note.tags && note.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 overflow-hidden">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-foreground/50 self-center">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NoteCard;