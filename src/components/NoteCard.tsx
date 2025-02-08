import React from 'react';
import { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  return (
    <div className="border rounded p-4">
      <h3>{note.title}</h3>
      <p>{note.content.substring(0, 50)}...</p>
    </div>
  );
};

export default NoteCard;
