import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { useContextMenu } from './ContextMenuContext';
import { useDynamicSidebar } from './DynamicSidebar';
import { NoteDetailSidebar } from './NoteDetailSidebar';
import { ShareNoteModal } from '../ShareNoteModal';
import { toggleNoteVisibility, getShareableUrl, isNotePublic } from '@/lib/appwrite/permissions/notes';
import type { Notes } from '@/types/appwrite';
import { Button } from './Button';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  DocumentDuplicateIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

interface NoteCardProps {
  note: Notes;
  onUpdate?: (updatedNote: Notes) => void;
  onDelete?: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onUpdate, onDelete }) => {
  // context menu managed globally
  const [showShareModal, setShowShareModal] = useState(false);
  const { openMenu, closeMenu } = useContextMenu();
  const { openSidebar } = useDynamicSidebar();

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openMenu({
      x: e.clientX,
      y: e.clientY,
      items: contextMenuItems
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
      $id: '',
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

  const handleToggleVisibility = async () => {
    if (!note.$id) return;
    
    try {
      const updatedNote = await toggleNoteVisibility(note.$id);
      if (updatedNote && onUpdate) {
        onUpdate(updatedNote);
      }
    } catch (error) {
      console.error('Error toggling note visibility:', error);
    }
  };

  const handleCopyShareLink = () => {
    if (!note.$id) return;
    
    const shareUrl = getShareableUrl(note.$id);
    navigator.clipboard.writeText(shareUrl);
    // You could add a toast notification here
  };

  const handleShareWith = () => {
    setShowShareModal(true);
    closeMenu();
  };

  const noteIsPublic = isNotePublic(note);

  const contextMenuItems = [
    {
      label: 'Open In New Tab',
      icon: <ArrowTopRightOnSquareIcon className="w-4 h-4" />,
      onClick: () => {
        if (note.$id) {
          // Open the note page in a new tab
          window.open(`/notes/${note.$id}`, '_blank');
        }
      }
    },
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
    // Sharing options
    {
      label: 'Share With',
      icon: <UserGroupIcon className="w-4 h-4" />,
      onClick: handleShareWith
    },
    {
      label: noteIsPublic ? 'Make Private' : 'Make Public',
      icon: noteIsPublic ? <LockClosedIcon className="w-4 h-4" /> : <GlobeAltIcon className="w-4 h-4" />,
      onClick: handleToggleVisibility
    },
    // Show copy link option only if note is public
    ...(noteIsPublic ? [{
      label: 'Copy Share Link',
      icon: <ClipboardDocumentIcon className="w-4 h-4" />,
      onClick: handleCopyShareLink
    }] : []),
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
        className="relative flex flex-col bg-card border border-border note-card h-48 sm:h-52 md:h-56 lg:h-60 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <CardHeader className="flex-shrink-0 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground line-clamp-2 flex-1">
              {note.title}
            </CardTitle>

            <div className="flex items-center gap-2">
              {noteIsPublic && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                    <GlobeAltIcon className="h-3 w-3" />
                    Public
                  </span>
                </div>
              )}

              {/* Visible menu button to open context menu (useful on mobile) */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open note menu"
                onClick={(e) => {
                  // Prevent parent card click which opens the detail sidebar
                  e.stopPropagation();
                  // Position menu near the button using its bounding rect
                  const target = e.currentTarget as HTMLElement;
                  const rect = target.getBoundingClientRect();
                  openMenu({
                    x: Math.round(rect.left + rect.width / 2),
                    y: Math.round(rect.top + rect.height + 8),
                    items: contextMenuItems
                  });
                }}
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between min-h-0">
          <p className="text-xs sm:text-sm text-foreground/70 line-clamp-4 sm:line-clamp-5 md:line-clamp-6 overflow-hidden">
            {note.content}
          </p>
          {note.tags && note.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 overflow-hidden">
              {note.tags.slice(0, 3).map((tag: string, index: number) => (
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



      {showShareModal && note.$id && (
        <ShareNoteModal
          isOpen={showShareModal}
          onOpenChange={setShowShareModal}
          noteId={note.$id}
          noteTitle={note.title || 'Untitled Note'}
        />
      )}
    </>
  );
};

export default NoteCard;