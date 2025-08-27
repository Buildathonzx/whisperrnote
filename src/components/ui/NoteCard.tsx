import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { ContextMenu } from './ContextMenu';
import { useDynamicSidebar } from './DynamicSidebar';
import { NoteDetailSidebar } from './NoteDetailSidebar';
import type { Notes } from '@/types/appwrite-types';
import { PencilIcon, TrashIcon, EyeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface NoteCardProps {
  note: Notes;
  onUpdate?: (updatedNote: Notes) => void;
  onDelete?: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onUpdate, onDelete }) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const { openSidebar } = useDynamicSidebar();

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY
    });
  };

  const handleClick = () => {
    openSidebar(
      <NoteDetailSidebar
        note={note}
        onUpdate={onUpdate || (() => {})}
        onDelete={onDelete || (() => {})}
      />
    );
  };

  const handleEdit = () => {
    openSidebar(
      <NoteDetailSidebar
        note={note}
        onUpdate={onUpdate || (() => {})}
        onDelete={onDelete || (() => {})}
      />
    );
  };

  const handleDuplicate = () => {
    const duplicatedNote: Notes = {
      ...note,
      $id: undefined,
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (onUpdate) {
      onUpdate(duplicatedNote);
    }
  };

  const handleDelete = () => {
    if (onDelete && note.$id) {
      onDelete(note.$id);
    }
  };

  const contextMenuItems = [
    {
      label: 'View Details',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: handleClick
    },
    {
      label: 'Edit',
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: handleEdit
    },
    {
      label: 'Duplicate',
      icon: <DocumentDuplicateIcon className="w-4 h-4" />,
      onClick: handleDuplicate
    },
    {
      label: 'Delete',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'destructive' as const
    }
  ];

  return (
    <>
      <Card 
        className="flex flex-col bg-card border border-border note-card h-48 sm:h-52 md:h-56 lg:h-60 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
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

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={contextMenuItems}
        />
      )}
    </>
  );
};

export default NoteCard;